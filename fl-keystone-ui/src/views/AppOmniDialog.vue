<template>
  <v-dialog
    v-model="shown"
    :width="mode === 'agent' ? 860 : 800"
    max-width="95vw"
    scrollable
    transition="dialog-top-transition"
  >
    <div class="omni-surface" :class="`omni-surface--${mode}`">
      <div v-show="mode === 'command'" class="omni-input-card">
        <v-textarea
          ref="inputRef"
          v-model="commandInput"
          data-testid="command-palette-input"
          :placeholder="t('commandPalette.placeholder')"
          :readonly="commandPanel?.inputReadonly ?? false"
          variant="plain"
          density="comfortable"
          hide-details
          auto-grow
          rows="1"
          :max-rows="1"
          class="omni-input"
          @compositionstart="composing = true"
          @compositionend="composing = false"
          @keydown="onInputKeydown"
        />
        <v-divider />
        <div class="omni-mode-controls">
          <v-btn-toggle
            v-model="mode"
            density="compact"
            variant="outlined"
            color="primary"
            mandatory
            divided
          >
            <v-btn value="command" size="x-small">
              <v-icon size="small" start>search</v-icon>
              {{ t('commandPalette.commands') }}
            </v-btn>
            <v-btn v-if="agentEnabled" value="agent" size="x-small">
              <v-icon size="small" start>auto_awesome</v-icon>
              Frost AI
            </v-btn>
          </v-btn-toggle>
          <div id="omni-mode-specific-controls" class="omni-mode-specific-controls" />
        </div>
      </div>

      <AppCommandPalette
        ref="commandPanel"
        v-show="mode === 'command'"
        :agent-enabled="agentEnabled"
      />

      <AppAgentChat
        v-if="agentEnabled"
        ref="agentPanel"
        v-show="mode === 'agent'"
        @switch-mode="mode = $event"
        @close="close"
      />
    </div>
  </v-dialog>
</template>

<script lang="ts" setup>
import { useOmniDialog } from '@/composables/omniDialog'
import AppAgentChat from '@/views/AppAgentChat.vue'
import AppCommandPalette from '@/views/AppCommandPalette.vue'
import { nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  agentEnabled: boolean
}>()

const { t } = useI18n()
const { shown, mode, commandInput, agentInput, open, close } = useOmniDialog()
const commandPanel = ref<InstanceType<typeof AppCommandPalette> | null>(null)
const agentPanel = ref<InstanceType<typeof AppAgentChat> | null>(null)
const inputRef = ref<{ $el: HTMLElement } | null>(null)
const composing = ref(false)

function onInputKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }
  if (event.altKey && event.key === 'Enter') {
    event.preventDefault()
    commandPanel.value?.askAi()
    return
  }
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    commandPanel.value?.moveSelection(event.key === 'ArrowDown' ? 1 : -1)
  } else if (event.key === 'ArrowRight') {
    commandPanel.value?.onArrowForward(event)
  } else if (event.key === 'ArrowLeft') {
    commandPanel.value?.onArrowBack(event)
  } else if (event.key === 'Enter') {
    event.preventDefault()
    commandPanel.value?.invokeSelected()
  }
}

watch(() => props.agentEnabled, (enabled) => {
  if (!enabled && mode.value === 'agent') close()
})

watch([shown, mode], async ([visible, currentMode]) => {
  if (!visible) return
  if (currentMode === 'command') {
    await nextTick()
    requestAnimationFrame(() => {
      inputRef.value?.$el.querySelector<HTMLTextAreaElement>('textarea:not([aria-hidden="true"])')?.focus()
    })
  }
})
</script>

<style scoped>
.omni-surface {
  display: flex;
  width: 100%;
  height: 85vh;
  max-height: 85vh;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  --surface-blur: 0px;
  --surface-border: none;
  --surface-shadow: none;
  --surface-bg: transparent;
  --surface-dialog-radius: 0px;
  --omni-content-width: 720px;
  transform: translateY(clamp(24px, 5vh, 48px));
  background: transparent !important;
}

.omni-surface--command {
  align-items: center;
}

.omni-surface--agent {
  align-items: center;
  transform: translateY(clamp(16px, 3vh, 32px));
}

.omni-input-card {
  width: var(--omni-content-width);
  max-width: 100%;
  flex: 0 0 auto;
  align-self: center;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(var(--v-theme-surface), 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.omni-input-card:focus-within {
  border-color: rgba(var(--v-theme-primary), 0.5);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(var(--v-theme-primary), 0.35);
}

.omni-input {
  padding: 10px 14px 6px;
}

.omni-input :deep(textarea) {
  font-size: 14.5px;
  line-height: 1.5;
  letter-spacing: 0.15px;
}

.omni-input :deep(textarea::placeholder) {
  color: rgba(var(--v-theme-on-surface), 0.45);
}

.omni-mode-controls {
  display: flex;
  min-height: 44px;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: rgba(0, 0, 0, 0.12);
}

.omni-mode-specific-controls {
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  align-items: center;
}

@media (max-width: 700px) {
  .omni-surface {
    width: 100%;
    max-width: 100%;
  }
}
</style>
