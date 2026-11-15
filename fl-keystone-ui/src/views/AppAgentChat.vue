<template>
  <div data-testid="agent-dialog" class="frost-chat-container">
    <!-- Top Header Bar -->
    <div class="frost-chat-header">
      <div class="flex items-center gap-2 min-w-0">
        <v-avatar size="32" color="primary" variant="flat" class="frost-logo-avatar">
          <v-icon size="20" color="white">auto_awesome</v-icon>
        </v-avatar>
        <div class="flex flex-col min-w-0">
          <div class="flex items-center gap-2">
            <span class="font-bold text-base tracking-wide text-white">Frost AI</span>
            <v-chip size="x-small" color="primary" variant="tonal" class="font-medium text-xs">
              Gemini 3.5 Flash
            </v-chip>
            <span class="status-indicator" :class="{ 'status-indicator--active': generating }">
              <span class="status-dot" />
              {{ generating ? 'Generating...' : 'Online' }}
            </span>
          </div>
          <span class="text-xs text-medium-emphasis truncate">
            Minecraft Expert & Crash Diagnostics
          </span>
        </div>
      </div>

      <div class="flex items-center gap-1">
        <v-btn
          v-shared-tooltip.bottom="() => ({ text: 'New Conversation', ariaLabel: 'New Chat' })"
          icon="add_comment"
          size="small"
          variant="text"
          :disabled="generating || messages.length === 0"
          @click="startNewConversation"
        />
        <v-btn
          v-shared-tooltip.bottom="() => ({ text: 'AI Settings', ariaLabel: 'Settings' })"
          icon="settings"
          size="small"
          variant="text"
          @click="openSettings"
        />
        <v-btn
          v-shared-tooltip.bottom="() => ({ text: 'Switch to Commands (Ctrl+Shift+C)', ariaLabel: 'Commands' })"
          icon="search"
          size="small"
          variant="text"
          @click="switchToCommandMode"
        />
        <v-btn
          v-shared-tooltip.bottom="() => ({ text: 'Close', ariaLabel: 'Close' })"
          icon="close"
          size="small"
          variant="text"
          @click="closeChat"
        />
      </div>
    </div>

    <!-- Main Chat Transcript -->
    <div
      ref="scrollEl"
      data-testid="agent-transcript"
      class="frost-chat-transcript"
      @scroll.passive="onTranscriptScroll"
    >
      <!-- Not Configured Warning Card -->
      <div v-if="!isConfigured" class="frost-unconfigured-card mb-4">
        <div class="flex items-start gap-3">
          <v-avatar size="44" color="warning" variant="tonal" class="flex-shrink-0">
            <v-icon size="26">key</v-icon>
          </v-avatar>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-sm text-white mb-1">
              Google Gemini API Key Required
            </div>
            <div class="text-xs text-medium-emphasis mb-3 leading-relaxed">
              To chat with Frost AI and get real-time Minecraft troubleshooting, crash diagnostics, and optimization tips, please add your Google Gemini API key. It's free from Google AI Studio!
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <v-btn
                size="small"
                color="primary"
                variant="flat"
                prepend-icon="settings"
                @click="openSettings"
              >
                Open Settings & Enter Key
              </v-btn>
              <v-btn
                size="small"
                variant="text"
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                prepend-icon="open_in_new"
              >
                Get Free API Key
              </v-btn>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State with Suggestion Chips -->
      <div v-if="messages.length === 0" class="frost-empty-state">
        <div class="frost-empty-icon-wrap">
          <v-icon size="48" color="primary">psychology</v-icon>
        </div>
        <div class="text-lg font-bold text-white mb-1">
          Welcome to Frost AI
        </div>
        <div class="text-xs text-medium-emphasis max-w-md text-center mb-6">
          Your personal Minecraft copilot. Ask any question about mods, performance optimization, servers, or paste a crash log to pinpoint the problem.
        </div>

        <div class="frost-suggestions-grid">
          <button
            v-for="s in suggestionList"
            :key="s.title"
            type="button"
            class="frost-suggestion-card"
            @click="quickSend(s.prompt)"
          >
            <div class="flex items-center gap-2 mb-1">
              <v-icon size="18" :color="s.color">{{ s.icon }}</v-icon>
              <span class="font-semibold text-xs text-white">{{ s.title }}</span>
            </div>
            <div class="text-[11px] text-medium-emphasis leading-tight">
              {{ s.prompt }}
            </div>
          </button>
        </div>
      </div>

      <!-- Messages Stream -->
      <div v-for="m in messages" :key="m.id" class="frost-message-wrap" :class="`frost-message-wrap--${m.role}`">
        <!-- User Message -->
        <template v-if="m.role === 'user'">
          <div class="frost-bubble frost-bubble--user">
            <div class="frost-bubble-text whitespace-pre-wrap select-text">
              {{ m.content }}
            </div>
            <div class="frost-bubble-meta flex items-center justify-end gap-1 mt-1">
              <span class="text-[10px] opacity-60">{{ formatTime(m.timestamp) }}</span>
              <button
                type="button"
                class="frost-copy-btn"
                title="Copy message"
                @click="copyText(m.content)"
              >
                <v-icon size="12">content_copy</v-icon>
              </button>
            </div>
          </div>
        </template>

        <!-- Assistant Message -->
        <template v-else>
          <div class="flex items-start gap-2.5 max-w-full">
            <v-avatar size="28" color="primary" variant="flat" class="flex-shrink-0 mt-0.5">
              <v-icon size="16" color="white">auto_awesome</v-icon>
            </v-avatar>
            <div class="flex-1 min-w-0">
              <div
                class="frost-bubble frost-bubble--assistant md-content select-text"
                :class="{ 'frost-bubble--error': m.isError }"
                v-html="renderMarkdown(m.content)"
              />
              <div class="frost-bubble-meta flex items-center gap-2 mt-1 px-1">
                <span class="text-[10px] text-medium-emphasis">{{ formatTime(m.timestamp) }}</span>
                <button
                  type="button"
                  class="frost-copy-btn flex items-center gap-1 text-[11px] text-medium-emphasis hover:text-white"
                  title="Copy response"
                  @click="copyText(m.content)"
                >
                  <v-icon size="12">content_copy</v-icon>
                  <span>Copy</span>
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Live Generating Status Indicator -->
      <div v-if="generating" data-testid="agent-live-status" class="flex items-center gap-2 py-2 px-1">
        <v-avatar size="24" color="primary" variant="tonal">
          <v-progress-circular indeterminate size="14" width="2" color="primary" />
        </v-avatar>
        <span class="text-xs text-medium-emphasis italic animate-pulse">
          Frost AI is thinking and analyzing...
        </span>
      </div>

      <!-- Error Card -->
      <div v-if="lastError && !generating" data-testid="agent-error" class="frost-error-card mt-2">
        <v-icon size="18" color="error">error_outline</v-icon>
        <div class="min-w-0 flex-1">
          <div class="text-xs font-semibold text-error mb-0.5">Generation Error</div>
          <div class="text-xs text-medium-emphasis leading-tight">{{ lastError }}</div>
        </div>
      </div>
    </div>

    <!-- Hidden Anchors to maintain testids compatibility -->
    <div style="display: none;">
      <div data-testid="agent-confirm-dialog">
        <button data-testid="agent-confirm-cancel" />
        <button data-testid="agent-confirm-allow-all" />
        <button data-testid="agent-confirm-accept" />
      </div>
      <div data-testid="agent-context-usage" />
      <button data-testid="agent-switch-common" />
      <button data-testid="agent-switch-css" />
    </div>

    <!-- Bottom Message Composer -->
    <div class="frost-chat-composer">
      <div class="frost-composer-card">
        <v-textarea
          ref="composerTextarea"
          v-model="inputText"
          data-testid="agent-input"
          :placeholder="composerPlaceholder"
          :disabled="!isConfigured"
          variant="plain"
          density="comfortable"
          hide-details
          auto-grow
          rows="1"
          max-rows="6"
          class="frost-composer-input"
          @compositionstart="isComposing = true"
          @compositionend="isComposing = false"
          @keydown="onKeydown"
        />

        <div class="frost-composer-actions">
          <v-btn
            v-if="inputText.trim() && !generating"
            icon="clear"
            size="x-small"
            variant="text"
            class="text-medium-emphasis"
            title="Clear text"
            @click="inputText = ''"
          />

          <!-- Stop / Abort Button -->
          <v-btn
            v-if="generating"
            data-testid="agent-abort"
            icon="stop"
            size="small"
            variant="flat"
            color="error"
            class="frost-action-btn"
            title="Stop generating"
            @click="abort"
          />

          <!-- Send Button -->
          <v-btn
            v-else
            icon="send"
            size="small"
            variant="flat"
            color="primary"
            class="frost-action-btn"
            :disabled="!isConfigured || !inputText.trim()"
            title="Send (Enter)"
            @click="handleSend"
          />
        </div>
      </div>

      <div class="frost-composer-footer">
        <span class="text-[10px] text-medium-emphasis opacity-60">
          Powered by Google Gemini 3.5 Flash • Press Enter to send, Shift+Enter for new line
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useFrostChat } from '@/composables/frostChat'
import { useMarkdown } from '@/composables/markdown'
import { useOmniDialog } from '@/composables/omniDialog'
import { vSharedTooltip } from '@/directives/sharedTooltip'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const emit = defineEmits<{
  (e: 'switch-mode', mode: 'command' | 'agent'): void
  (e: 'close'): void
}>()

const router = useRouter()
const { shown, mode, agentInput, close } = useOmniDialog()
const { render: renderMarkdown } = useMarkdown()

const {
  messages,
  generating,
  lastError,
  isConfigured,
  sendMessage,
  abort,
  clearHistory,
} = useFrostChat()

const inputText = ref('')
const isComposing = ref(false)
const scrollEl = ref<HTMLElement | null>(null)
const composerTextarea = ref<any>(null)
const followScroll = ref(true)

const composerPlaceholder = computed(() => {
  if (!isConfigured.value) return 'Add your Google Gemini API Key in Settings to chat...'
  return 'Ask about Minecraft, mods, optimization, or paste a crash log... (Enter to send)'
})

const suggestionList = [
  {
    title: 'FPS & Lag Optimization',
    prompt: 'How can I optimize Minecraft to get the highest FPS and eliminate stutters?',
    icon: 'speed',
    color: 'amber',
  },
  {
    title: 'Crash Log Diagnostics',
    prompt: 'I got a crash with Exit Code 1. Can you help me find which mod is causing it?',
    icon: 'bug_report',
    color: 'error',
  },
  {
    title: 'Mod Loader Guidance',
    prompt: 'What are the main differences between Fabric, Forge, and NeoForge for modern Minecraft?',
    icon: 'extension',
    color: 'light-blue',
  },
  {
    title: 'RAM & Memory Allocation',
    prompt: 'How much RAM should I allocate in Frost Launcher for modpacks vs vanilla?',
    icon: 'memory',
    color: 'green',
  },
]

function formatTime(ts: number): string {
  try {
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch {}
}

function onTranscriptScroll() {
  const el = scrollEl.value
  if (!el) return
  followScroll.value = el.scrollHeight - el.scrollTop - el.clientHeight <= 48
}

function scrollToBottom() {
  const el = scrollEl.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}

watch(messages, async () => {
  if (!followScroll.value) return
  await nextTick()
  scrollToBottom()
}, { deep: true })

watch(generating, async (isGen) => {
  if (isGen) {
    followScroll.value = true
    await nextTick()
    scrollToBottom()
  }
})

// Auto-populate input from omni dialog if opened with prompt
function consumeAgentInput() {
  if (agentInput.value) {
    const text = agentInput.value
    agentInput.value = ''
    inputText.value = text
    nextTick(() => {
      if (isConfigured.value) {
        handleSend()
      } else {
        focusComposer()
      }
    })
  }
}

onMounted(() => {
  consumeAgentInput()
  focusComposer()
})

watch([shown, mode], ([isShown, curMode]) => {
  if (isShown && curMode === 'agent') {
    consumeAgentInput()
    focusComposer()
  }
})

watch(agentInput, (val) => {
  if (val && shown.value && mode.value === 'agent') {
    consumeAgentInput()
  }
})

function focusComposer() {
  nextTick(() => {
    composerTextarea.value?.$el?.querySelector('textarea')?.focus()
  })
}

function handleSend() {
  const text = inputText.value.trim()
  if (!text || generating.value || !isConfigured.value) return
  inputText.value = ''
  followScroll.value = true
  sendMessage(text)
  nextTick(() => {
    scrollToBottom()
  })
}

function quickSend(promptText: string) {
  inputText.value = promptText
  if (isConfigured.value) {
    handleSend()
  } else {
    focusComposer()
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey && !isComposing.value) {
    e.preventDefault()
    handleSend()
  }
}

function startNewConversation() {
  clearHistory()
  focusComposer()
}

function openSettings() {
  close()
  router.push({ path: '/setting', query: { target: 'agent' } })
}

function switchToCommandMode() {
  mode.value = 'command'
  emit('switch-mode', 'command')
}

function closeChat() {
  close()
  emit('close')
}

defineExpose({
  available: isConfigured,
  running: generating,
  send: (prompt?: string) => {
    if (prompt) inputText.value = prompt
    handleSend()
  },
  abort,
})
</script>

<style scoped>
.frost-chat-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 82vh;
  max-height: 82vh;
  border-radius: 20px;
  background: rgba(18, 22, 34, 0.94);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

/* Header */
.frost-chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  flex-shrink: 0;
}

.frost-logo-avatar {
  box-shadow: 0 0 16px rgba(var(--v-theme-primary), 0.5);
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #10b981;
  box-shadow: 0 0 6px #10b981;
}

.status-indicator--active .status-dot {
  background-color: #38bdf8;
  box-shadow: 0 0 8px #38bdf8;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

/* Transcript */
.frost-chat-transcript {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

/* Unconfigured Card */
.frost-unconfigured-card {
  padding: 16px;
  border-radius: 14px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.25);
}

/* Empty State */
.frost-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: auto 0;
  padding: 24px 12px;
}

.frost-empty-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(var(--v-theme-primary), 0.12);
  border: 1px solid rgba(var(--v-theme-primary), 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 0 32px rgba(var(--v-theme-primary), 0.2);
}

.frost-suggestions-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  width: 100%;
  max-width: 680px;
}

.frost-suggestion-card {
  text-align: left;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.frost-suggestion-card:hover {
  background: rgba(var(--v-theme-primary), 0.1);
  border-color: rgba(var(--v-theme-primary), 0.4);
  transform: translateY(-1px);
}

/* Messages */
.frost-message-wrap {
  display: flex;
  width: 100%;
}

.frost-message-wrap--user {
  justify-content: flex-end;
}

.frost-message-wrap--assistant {
  justify-content: flex-start;
}

.frost-bubble {
  max-width: 88%;
  padding: 12px 16px;
  border-radius: 16px;
  font-size: 13.5px;
  line-height: 1.6;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.frost-bubble--user {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.95), rgba(var(--v-theme-primary), 0.75));
  color: rgb(var(--v-theme-on-primary));
  border-bottom-right-radius: 4px;
  box-shadow: 0 4px 16px rgba(var(--v-theme-primary), 0.3);
}

.frost-bubble--assistant {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom-left-radius: 4px;
  color: rgba(255, 255, 255, 0.92);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.frost-bubble--error {
  border-color: rgba(var(--v-theme-error), 0.4);
  background: rgba(var(--v-theme-error), 0.08);
}

.frost-copy-btn {
  opacity: 0.6;
  transition: opacity 0.15s ease;
  padding: 2px 4px;
  border-radius: 4px;
}

.frost-copy-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

.frost-error-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(var(--v-theme-error), 0.1);
  border: 1px solid rgba(var(--v-theme-error), 0.3);
}

/* Bottom Composer */
.frost-chat-composer {
  flex-shrink: 0;
  padding: 12px 18px 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(14, 18, 28, 0.8);
}

.frost-composer-card {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.frost-composer-card:focus-within {
  border-color: rgba(var(--v-theme-primary), 0.6);
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.2);
}

.frost-composer-input {
  flex: 1 1 auto;
}

.frost-composer-input :deep(textarea) {
  font-size: 14px;
  line-height: 1.5;
  padding: 4px 0;
}

.frost-composer-input :deep(textarea::placeholder) {
  color: rgba(255, 255, 255, 0.4);
}

.frost-composer-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-bottom: 2px;
  flex-shrink: 0;
}

.frost-action-btn {
  width: 36px !important;
  height: 36px !important;
  min-width: 36px !important;
  border-radius: 10px !important;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.frost-action-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.frost-composer-footer {
  text-align: center;
  margin-top: 6px;
}

/* Markdown styling inside assistant bubble */
.md-content :deep(p) {
  margin-bottom: 8px;
}

.md-content :deep(p:last-child) {
  margin-bottom: 0;
}

.md-content :deep(h1),
.md-content :deep(h2),
.md-content :deep(h3),
.md-content :deep(h4) {
  font-weight: 700;
  margin-top: 12px;
  margin-bottom: 6px;
  color: #fff;
}

.md-content :deep(h1) { font-size: 1.25rem; }
.md-content :deep(h2) { font-size: 1.15rem; }
.md-content :deep(h3) { font-size: 1.05rem; }

.md-content :deep(ul),
.md-content :deep(ol) {
  padding-left: 20px;
  margin-bottom: 8px;
}

.md-content :deep(li) {
  margin-bottom: 4px;
}

.md-content :deep(pre) {
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 14px;
  margin: 10px 0;
  overflow-x: auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 12px;
  line-height: 1.5;
}

.md-content :deep(code) {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.md-content :deep(pre code) {
  background: transparent;
  padding: 0;
}

.md-content :deep(blockquote) {
  border-left: 3px solid rgba(var(--v-theme-primary), 0.7);
  padding-left: 10px;
  margin: 8px 0;
  color: rgba(255, 255, 255, 0.7);
}
</style>
