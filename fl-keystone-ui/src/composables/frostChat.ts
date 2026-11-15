import { BUILTIN_AGENT_ENDPOINT } from '@xmcl/runtime-api'
import { computed, ref, shallowRef } from 'vue'
import { useAgentSettings } from './agent/settings'

export interface FrostChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  isError?: boolean
}

export const FROST_AI_SYSTEM_PROMPT = `You are Frost AI, the official intelligent assistant built into Frost Launcher (a modern, open-source Minecraft launcher).

Your capabilities:
1. Minecraft Expertise:
   - Help users with Minecraft Java Edition and Bedrock Edition.
   - Guide on how to install and configure mods across Fabric, Forge, NeoForge, and Quilt.
   - Suggest optimization mods (Sodium, Lithium, Iris Shaders, FerriteCore, ModernFix) to boost FPS and eliminate lag.
   - Help with multiplayer, server setup, shader packs, resource packs, and custom skins.

2. Crash Log & Error Diagnostics:
   - When a user pastes a crash log, error message, game logs, or exit codes (such as Exit Code 1, Exit Code -1, NullPointerException, NoSuchMethodError, Mixin apply failed, Java version mismatch):
   - First, pinpoint the EXACT cause in simple language (e.g. "Mod X is conflicting with Mod Y" or "You are using Java 8, but Minecraft 1.20 requires Java 17").
   - Then, provide clear, step-by-step instructions on how the user can fix it right away.

3. Frost Launcher Guidance:
   - Explain launcher settings like allocating RAM, choosing Java runtimes, installing modpacks from Modrinth/CurseForge, managing instances, and backups.

4. Formatting & Style:
   - Provide answers in clean Markdown with headings, bullet points, and code blocks with language tags.
   - Be friendly, encouraging, and direct.
   - Always reply in the same language the user uses (English, Hindi, Hinglish, etc.).`

const STORAGE_KEY = 'frost_ai_chat_history_v1'

function loadSavedMessages(): FrostChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  return []
}

function saveMessages(messages: FrostChatMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-50)))
  } catch {}
}

export function useFrostChat() {
  const settings = useAgentSettings()
  const messages = shallowRef<FrostChatMessage[]>(loadSavedMessages())
  const generating = ref(false)
  const lastError = ref('')
  let abortController: AbortController | null = null

  const isConfigured = computed(() => settings.configured.value)

  function clearHistory() {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    messages.value = []
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
    lastError.value = ''
  }

  function abort() {
    if (abortController) {
      abortController.abort()
      abortController = null
    }
    generating.value = false
  }

  async function sendMessage(input: string): Promise<void> {
    const text = input.trim()
    if (!text || generating.value) return

    lastError.value = ''
    const userMsgId = 'u_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6)
    const assistantMsgId = 'a_' + (Date.now() + 1) + '_' + Math.random().toString(36).slice(2, 6)

    const userMessage: FrostChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    }

    const assistantMessage: FrostChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    }

    messages.value = [...messages.value, userMessage, assistantMessage]
    saveMessages(messages.value)

    generating.value = true
    abortController = new AbortController()

    // Build context history (up to last 12 messages)
    const recentHistory = messages.value
      .slice(0, -1) // exclude current assistant empty message
      .slice(-12)
      .map(m => ({
        role: m.role,
        content: m.content,
      }))

    const apiMessages = [
      { role: 'system', content: FROST_AI_SYSTEM_PROMPT },
      ...recentHistory,
    ]

    try {
      const res = await fetch(BUILTIN_AGENT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gemini-3.5-flash',
          messages: apiMessages,
          temperature: 0.7,
          stream: true,
        }),
        signal: abortController.signal,
      })

      if (!res.ok) {
        let errDetail = `Status ${res.status} ${res.statusText}`
        try {
          const errJson = await res.json()
          if (Array.isArray(errJson) && errJson[0]?.error?.message) {
            errDetail = errJson[0].error.message
          } else if (errJson?.error?.message) {
            errDetail = errJson.error.message
          }
        } catch {
          try {
            const rawText = await res.text()
            if (rawText) errDetail = rawText.slice(0, 300)
          } catch {}
        }
        throw new Error(errDetail)
      }

      // Stream response chunks
      const reader = res.body?.getReader()
      if (!reader) {
        const fullJson = await res.json()
        const reply = fullJson.choices?.[0]?.message?.content || ''
        assistantMessage.content = reply
        messages.value = [...messages.value.slice(0, -1), { ...assistantMessage }]
        saveMessages(messages.value)
        return
      }

      const decoder = new TextDecoder('utf-8')
      let streamBuffer = ''
      let accumulatedText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        streamBuffer += decoder.decode(value, { stream: true })
        const lines = streamBuffer.split('\n')
        streamBuffer = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith('data:')) continue
          const dataStr = trimmed.slice(5).trim()
          if (!dataStr || dataStr === '[DONE]') continue

          try {
            const parsed = JSON.parse(dataStr)
            const delta = parsed.choices?.[0]?.delta?.content
            if (delta) {
              accumulatedText += delta
              assistantMessage.content = accumulatedText
              messages.value = [...messages.value.slice(0, -1), { ...assistantMessage }]
            }
          } catch {}
        }
      }

      // Save final message
      saveMessages(messages.value)
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        if (!assistantMessage.content) {
          assistantMessage.content = '_Message generation stopped._'
          messages.value = [...messages.value.slice(0, -1), { ...assistantMessage }]
          saveMessages(messages.value)
        }
        return
      }

      const errMsg = err instanceof Error ? err.message : String(err)
      lastError.value = errMsg
      assistantMessage.content = `**Error:** ${errMsg}\n\nPlease check your Google Gemini API Key in Settings or your internet connection.`
      assistantMessage.isError = true
      messages.value = [...messages.value.slice(0, -1), { ...assistantMessage }]
      saveMessages(messages.value)
    } finally {
      generating.value = false
      abortController = null
    }
  }

  return {
    messages,
    generating,
    lastError,
    isConfigured,
    sendMessage,
    abort,
    clearHistory,
  }
}
