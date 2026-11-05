<template>
  <!-- Install Status when task is running -->
  <div
    v-if="status === 0"
    class="frost-glass-task-pill w-48 cursor-pointer select-none text-gray-400 hover:text-unset transition-all flex flex-col gap-1"
    @click="showTask()"
  >
    <span class="whitespace-nowrap text-center text-sm font-bold text-white/90">
      {{ taskName }}
    </span>
    <v-progress-linear
      rounded
      color="primary"
      :model-value="percentage"
      height="6"
    />
    <span class="whitespace-nowrap text-center text-xs text-white/70">
      {{ getExpectedSize(Math.abs(progress)) + ' / ' + getExpectedSize(Math.abs(total)) }}
    </span>
  </div>
  <!-- Launch Button Status Menu -->
  <v-menu
    v-else
    v-model="showMenu"
    offset-y
    left
    transition="scroll-y-transition"
    :top="inFoucsMode"
    :bottom="!inFoucsMode"
  >
    <template #activator="{ props }">
      <div
        v-bind="props"
        class="frost-glass-status-pill flex items-center justify-center cursor-pointer select-none"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
      >
        <HomeLaunchButtonStatusItem
          class="flex-shrink-1 flex-grow-0"
          :active="active || showMenu"
          :item="menuItems[0]"
        />
      </div>
    </template>
    <div
      v-show="menuItems.length > 1"
      class="select-none"
      @mouseenter="$emit('mouseenter', $event)"
      @mouseleave="$emit('mouseleave', $event)"
    >
      <v-list
        nav
        color="rgba(0,0,0,0.5)"
      >
        <template v-for="(item, index) in menuItems.slice(1)" :key="index">
          <HomeLaunchButtonStatusItem
            :item="item"
            :active="true"
            @mouseenter="onMouseEnter"
            @mouseleave="onMouseLeave"
          />
        </template>
      </v-list>
    </div>
  </v-menu>
</template>
<script lang="ts" setup>
import { kLaunchButton } from '@/composables/launchButton'
import { kLaunchTask } from '@/composables/launchTask'
import { useLocalizedTaskFunc } from '@/composables/task'
import { useDialog } from '@/composables/dialog'
import { useInFocusMode } from '@/composables/uiLayout'
import { injection } from '@/util/inject'
import { getExpectedSize } from '@/util/size'
import HomeLaunchButtonStatusItem from './HomeLaunchButtonStatusItem.vue'
import { } from '@xmcl/runtime-api'

defineProps<{ active?: boolean }>()

// Install status
const { progress, total, status, task } = injection(kLaunchTask)
const localizeTask = useLocalizedTaskFunc()
const taskName = computed(() => task.value ? localizeTask(task.value).title : '')
const { show: showTask } = useDialog('task')
const percentage = computed(() => progress.value / total.value * 100)

// Launch button status menu
const inFoucsMode = useInFocusMode()
const { loading, menuItems } = injection(kLaunchButton)

let handle: any
const showMenu = ref(false)

function onMouseEnter() {
  if (handle) clearTimeout(handle)
  if (loading.value) return
  showMenu.value = true
}

function onMouseLeave() {
  if (handle) clearTimeout(handle)
  handle = setTimeout(() => {
    showMenu.value = false
  }, 100)
}
</script>

<style scoped>
.frost-glass-status-pill {
  padding: 6px 16px;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(20px) saturate(190%);
  -webkit-backdrop-filter: blur(20px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 9999px;
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.35), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.frost-glass-status-pill:hover {
  background: rgba(15, 23, 42, 0.72);
  border-color: rgba(56, 189, 248, 0.45);
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.45), 0 0 16px rgba(56, 189, 248, 0.22), inset 0 1px 1px 0 rgba(255, 255, 255, 0.28);
}

.frost-glass-task-pill {
  padding: 6px 16px;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(20px) saturate(190%);
  -webkit-backdrop-filter: blur(20px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.35), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2);
}
</style>
