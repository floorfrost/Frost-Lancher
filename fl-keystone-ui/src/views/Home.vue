<template>
  <div
    ref="scrollElement"
    class="select-none"
    :class="{ 'h-full': isFocus }"
    v-context-menu="isFocus ? getFocusBackgroundMenu : undefined"
  >
    <HomeCriticalError />
    <transition name="slide-y-reverse-transition" mode="out-in">
      <div v-if="!isFocus" class="mx-3 relative">
        <!-- 3D Center Floating Character Stage -->
        <div class="flex justify-center w-full my-2">
          <HomeCharacterStage />
        </div>

        <Transition name="slide-y-reverse-transition">
          <div v-if="!isBedrock" class="flex items-center justify-center gap-1 sticky top-40 z-3">
            <v-divider class="divider mx-0" />
            <v-btn
              class="z-4"
              icon
              variant="text"
              :aria-label="t('setting.layout.focus')"
              @click="isFocus = true"
            >
              <v-icon aria-hidden="true"> keyboard_arrow_down </v-icon>
            </v-btn>
            <v-divider class="divider mx-0" />
          </div>
        </Transition>
        <HomeBedrock v-if="isBedrock" />
        <template v-else>
          <HomeGrid />
          <HomeUpstreamCurseforge
            v-if="instance.upstream && instance.upstream.type === 'curseforge-modpack'"
            :id="instance.upstream.modId"
          />
          <HomeUpstreamModrinth
            v-else-if="instance.upstream && instance.upstream.type === 'modrinth-modpack'"
            :id="instance.upstream.projectId"
          />
          <HomeUpstreamFeedTheBeast
            v-else-if="instance.upstream && instance.upstream.type === 'ftb-modpack'"
            :id="instance.upstream.id"
          />
        </template>
      </div>
      <div v-else class="h-full w-full relative overflow-hidden">
        <!-- 3D Center Stage in Focus View (Vertically Elevated Floating in Air) -->
        <div class="focus-center-stage-container absolute inset-0 flex items-center justify-center -translate-y-8 pointer-events-none z-10">
          <HomeCharacterStage class="pointer-events-auto" />
        </div>
        <HomeFocusFooter class="absolute bottom-0 left-0 pb-[26px] z-20 pointer-events-none" />
      </div>
    </transition>
  </div>
</template>
<script lang="ts" setup>
import { useDialog } from '@/composables/dialog'
import { useGlobalDrop } from '@/composables/dropHandler'
import { kInstance } from '@/composables/instance'
import { kInstanceLaunch } from '@/composables/instanceLaunch'
import { useGamepadAction } from '@/composables/gamepad'
import { kUpstream } from '@/composables/instanceUpdate'
import { kCompact } from '@/composables/scrollTop'
import { useTutorial } from '@/composables/tutorial'
import { useInFocusMode } from '@/composables/uiLayout'
import { useHomeFocusCards } from '@/composables/homeCards'
import { vContextMenu } from '@/directives/contextMenu'
import { injection } from '@/util/inject'
import { isBedrockInstance } from '@xmcl/instance'
import type { DriveStep } from 'driver.js'
import HomeCriticalError from './HomeCriticalError.vue'
import HomeFocusFooter from './HomeFocusFooterV2.vue'
import HomeBedrock from './HomeBedrock.vue'
import HomeCharacterStage from './HomeCharacterStage.vue'
import HomeGrid from './HomeGrid.vue'
import HomeUpstreamCurseforge from './HomeUpstreamCurseforge.vue'
import HomeUpstreamFeedTheBeast from './HomeUpstreamFeedTheBeast.vue'
import HomeUpstreamModrinth from './HomeUpstreamModrinth.vue'

const isFocus = useInFocusMode()
const { getBackgroundMenu: getFocusBackgroundMenu } = useHomeFocusCards()
const { instance } = injection(kInstance)
const isBedrock = computed(() => isBedrockInstance(instance.value))

watch(isBedrock, (bedrock) => {
  if (bedrock) {
    isFocus.value = false
  }
}, { immediate: true })
provide(
  kUpstream,
  computed(() => ({
    upstream: instance.value.upstream,
    minecraft: instance.value.runtime.minecraft,
  })),
)

const compact = injection(kCompact)
onMounted(() => {
  compact.value = false
})

const { show } = useDialog('HomeDropModpackDialog')

useGlobalDrop({
  onDrop: async (e) => {
    const files = e.files
    const file = files?.[0]
    if (file) {
      const ext = file.name.split('.').pop()
      const filePath = windowController.getPathForFile(file)
      if ((ext === 'zip' || ext === 'mrpack') && filePath) {
        show(filePath)
        return
      }
    }
  },
})

const scrollElement = ref(null as HTMLElement | null)
provide('scrollElement', scrollElement)

const { t } = useI18n()

import { useLaunchButton } from '@/composables/launchButton'

// Gamepad face-button actions scoped to the home page (auto-unregister on leave).
const router = useRouter()
const { text: launchText, onClick: onLaunchClick } = useLaunchButton()
useGamepadAction('X', {
  label: () => launchText.value,
  handler: () => onLaunchClick(),
})
useGamepadAction('Y', {
  label: () => t('gamepad.guide.instanceSettings'),
  handler: () => router.push('/base-setting'),
})

useTutorial(
  computed(() => {
    const steps: DriveStep[] = [
      {
        element: '#my-stuff-button',
        popover: { title: t('userAccount.add'), description: t('tutorial.userAccountDescription') },
      },
      {
        element: '#create-instance-button',
        popover: { title: t('instances.add'), description: t('tutorial.instanceAddDescription') },
      },
      {
        element: '#launch-button',
        popover: { title: t('launch.launch'), description: t('tutorial.launchDescription') },
      },
    ]
    return steps
  }),
)
</script>
