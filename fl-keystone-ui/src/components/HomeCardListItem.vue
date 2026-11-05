<template>
  <div
    ref="root"
    class="frost-card-item inline-flex items-center w-full select-none transition-all duration-200"
    :class="{
      'opacity-40 scale-[0.98]': isDragging,
      '!border-sky-400 bg-sky-500/20': isDraggedOver && !isDragging,
      'hover:bg-white/12 hover:border-white/25': !isDragging,
    }"
    role="button"
    :aria-label="text || icon"
    :draggable="draggable"
    @dragstart="onDragStart"
    @dragend="onDragEnd"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    @click="emit('setting')"
    @keydown.enter.prevent="emit('setting')"
    @keydown.space.prevent="emit('setting')"
  >
    <div class="flex items-center gap-3 min-w-0 flex-1">
      <div class="frost-card-item__icon-box flex items-center justify-center shrink-0">
        <v-icon
          v-shared-tooltip="() => tooltip || ''"
          size="20"
          color="white"
        >
          {{ displayIcon }}
        </v-icon>
      </div>

      <div class="truncate text-sm select-none">
        <template v-if="parsedCount !== null">
          <span class="text-sky-400 font-bold text-[15px] mr-1.5">{{ parsedCount }}</span>
          <span class="text-white/90 font-medium">{{ parsedLabel }}</span>
        </template>
        <template v-else>
          <span class="text-white/90 font-medium">{{ text }}</span>
        </template>
      </div>
    </div>

    <div
      v-if="!dragover"
      class="frost-card-item__action flex items-center justify-center shrink-0 ml-2"
      @click.stop="emit('install')"
    >
      <v-progress-circular
        v-if="loading"
        indeterminate
        size="18"
        width="2"
        color="white"
      />
      <v-icon
        v-else
        size="20"
        color="white"
        v-shared-tooltip="() => buttonText || t('shared.install')"
      >
        {{ buttonIcon || 'file_download' }}
      </v-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { kDropHandler } from '@/composables/dropHandler'
import { kTheme } from '@/composables/theme'
import { vSharedTooltip } from '@/directives/sharedTooltip'
import { injection } from '@/util/inject'
import { useElementHover } from '@vueuse/core'

const props = defineProps<{
  id?: string
  draggable?: boolean
  icon: string
  tooltip?: string
  text?: string
  highlighted?: boolean
  loading?: boolean
  buttonText?: string
  buttonIcon?: string
}>()

const { isDark } = injection(kTheme)
const root = ref<HTMLElement | null>(null)
const isHovered = useElementHover(root, { 
  delayLeave: 150
})
const isDragging = ref(false)
const isDraggedOver = ref(false)
const emit = defineEmits<{
  (e: 'setting'): void
  (e: 'install'): void
  (e: 'drop', event: DragEvent): void
  (e: 'reorder', fromId: string): void
}>()
const { dragover } = injection(kDropHandler)

const parsedMatch = computed(() => (props.text ? props.text.match(/^(\d+)\s+(.*)$/) : null))
const parsedCount = computed(() => (parsedMatch.value ? parsedMatch.value[1] : null))
const parsedLabel = computed(() => (parsedMatch.value ? parsedMatch.value[2] : props.text))

const displayIcon = computed(() => {
  if (props.icon === 'palette') return 'texture'
  return props.icon || 'extension'
})

function onDragStart(e: DragEvent) {
  if (!props.draggable || !props.id) return
  isDragging.value = true
  e.dataTransfer!.effectAllowed = 'move'
  e.dataTransfer!.setData('application/x-card-id', props.id)
  e.dataTransfer!.setData('text/plain', props.id)
}

function onDragEnd() {
  isDragging.value = false
  isDraggedOver.value = false
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move'
  }
  isDraggedOver.value = true
}

function onDragLeave(e: DragEvent) {
  if (root.value && e.relatedTarget && root.value.contains(e.relatedTarget as Node)) {
    return
  }
  isDraggedOver.value = false
}

function onDrop(e: DragEvent) {
  isDraggedOver.value = false
  isDragging.value = false
  const cardId = e.dataTransfer?.getData('application/x-card-id')
  if (cardId) {
    e.preventDefault()
    e.stopPropagation()
    emit('reorder', cardId)
    return
  }
  emit('drop', e)
}

const { t } = useI18n()
</script>

<style scoped>
.frost-card-item {
  height: 48px;
  padding: 0 12px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.frost-card-item__icon-box {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.frost-card-item__action {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: all 0.2s;
  cursor: pointer;
}

.frost-card-item__action:hover {
  background: rgba(56, 189, 248, 0.25);
  border-color: rgba(56, 189, 248, 0.6);
  transform: scale(1.05);
}
</style>
