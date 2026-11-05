<template>
  <div
    class="frost-meta-card flex flex-grow-0 items-center transition-all duration-200 select-none"
    :class="{ 'cursor-pointer hover:bg-white/12': hasClickHandler }"
    @click="onclick ? onclick($event) : emit('click', $event)"
  >
    <div
      v-if="avatar || icon"
      class="frost-meta-card__icon mr-3 flex items-center justify-center shrink-0"
    >
      <v-img
        v-if="avatar"
        :src="avatar"
        :width="22"
        :height="22"
      />
      <v-icon
        v-else-if="icon"
        :size="22"
        :color="iconColor"
      >
        {{ displayIcon }}
      </v-icon>
    </div>

    <div
      v-if="text"
      class="overflow-hidden whitespace-nowrap"
    >
      <div
        class="text-[10px] font-bold uppercase tracking-wider text-white/60 leading-none mb-1"
      >
        {{ title }}
      </div>
      <div class="text-[13px] font-semibold text-white leading-tight">
        {{ text }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useVuetifyColor } from '@/composables/vuetify'

export interface AvatarItemProps {
  color?: string
  avatar?: string
  icon?: string
  title?: string
  text?: string
  responsive?: boolean
  onclick?: (e: Event) => void
}

const props = defineProps<AvatarItemProps>()
const emit = defineEmits(['click'])
const attrs = useAttrs()
const hasClickHandler = computed(() => !!attrs.onClick || !!props.onclick)

const iconColor = computed(() => {
  if (props.icon === 'schedule' || props.icon === 'update' || props.icon === 'history') {
    return '#38bdf8' // glowing cyan
  }
  return '#ffffff'
})

const displayIcon = computed(() => {
  if (props.icon === 'update') return 'history'
  return props.icon
})
</script>

<style scoped>
.frost-meta-card {
  height: 48px;
  padding: 0 16px;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(20px) saturate(190%);
  -webkit-backdrop-filter: blur(20px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 14px;
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.35), inset 0 1px 1px 0 rgba(255, 255, 255, 0.22);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.frost-meta-card:hover {
  background: rgba(15, 23, 42, 0.72);
  border-color: rgba(56, 189, 248, 0.45);
  box-shadow: 0 10px 28px -4px rgba(0, 0, 0, 0.45), 0 0 16px rgba(56, 189, 248, 0.22), inset 0 1px 1px 0 rgba(255, 255, 255, 0.28);
}

.frost-meta-card__icon {
  width: 24px;
  height: 24px;
}
</style>
