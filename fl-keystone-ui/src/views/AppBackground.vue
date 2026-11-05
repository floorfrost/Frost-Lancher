<template>
  <div class="absolute z-0 h-full w-full overflow-hidden pointer-events-none">
    <div
      class="absolute z-0 h-full w-full bg-cover bg-center"
      :style="{ backgroundImage: `url(${bgPoster})`, filter: `blur(${blur}px)` }"
    />
    <transition
      name="fade-transition"
    >
      <video
        v-if="effectiveVideo"
        ref="videoRef"
        :key="`video-${effectiveVideo}`"
        class="absolute z-0 h-full w-full object-cover"
        :style="{ filter: `blur(${blur}px)`, 'object-fit': backgroundImageFit }"
        :src="effectiveVideo"
        :poster="bgPoster"
        autoplay
        loop
        muted
        playsinline
        @canplay="onVideoCanPlay"
        @error="onVideoError"
      />
      <Particles
        v-else-if="backgroundType === BackgroundType.PARTICLE"
        color="#dedede"
        class="absolute z-0 h-full w-full"
        :style="{ filter: `blur(${blur}px)` }"
        :click-mode="particleMode"
      />
      <Halo
        v-else-if="backgroundType === BackgroundType.HALO"
        class="absolute z-0 h-full w-full"
        :style="{ filter: `blur(${blur}px)` }"
      />
      <img
        v-else-if="backgroundImage?.type === 'image' && backgroundType === BackgroundType.IMAGE"
        :key="backgroundImage.url"
        :src="backgroundImage.url"
        class="absolute z-0 h-full w-full"
        :style="{ filter: `blur(${blur}px)`, 'object-fit': backgroundImageFit }"
      >
    </transition>

    <transition
      name="fade-transition"
    >
      <div
        v-if="effectiveVideo"
        class="z-1 pointer-events-none absolute inset-0 bg-black/25"
      />
      <div
        v-else-if="((backgroundColorOverlay && !isHome) || backgroundType === BackgroundType.NONE) && !customBackgroundVideo"
        class="z-3 absolute h-full w-full"
        :style="{ 'background': backgroundColor }"
      />
    </transition>
  </div>
</template>
<script lang="ts" setup>
import defaultBgVideo from '@/assets/bg1.mp4'
import bgPoster from '@/assets/bg_fallback.jpg'
import Halo from '@/components/Halo.vue'
import Particles from '@/components/Particles.vue'
import { injection } from '@/util/inject'
import { kTheme, BackgroundType } from '@/composables/theme'
import { kInstanceLaunch } from '@/composables/instanceLaunch'
import { kCustomCss } from '@/composables/customCss'
import { inject } from 'vue'

const customCss = inject(kCustomCss)
const customBackgroundVideo = computed(() => customCss?.customBackgroundVideo.value || '')

const { sideBarColor, backgroundColorOverlay, backgroundColor, blur, backgroundImage, backgroundType, particleMode, backgroundImageFit, volume } = injection(kTheme)
const videoRef = ref(null as null | HTMLVideoElement)
const isMuted = computed(() => volume.value <= 0)

const effectiveVideo = computed(() => {
  if (customBackgroundVideo.value) return customBackgroundVideo.value
  if (backgroundImage.value?.type === 'image' && backgroundType.value === BackgroundType.IMAGE) {
    return ''
  }
  if (backgroundType.value === BackgroundType.PARTICLE) {
    return ''
  }
  if (backgroundType.value === BackgroundType.VIDEO && backgroundImage.value?.type === 'video' && backgroundImage.value.url) {
    return backgroundImage.value.url
  }
  return defaultBgVideo
})

function onVideoCanPlay() {
  if (videoRef.value) {
    videoRef.value.muted = isMuted.value
    videoRef.value.play().catch(() => {})
  }
}

onMounted(() => {
  nextTick(() => {
    if (videoRef.value) {
      videoRef.value.muted = isMuted.value
      videoRef.value.play().catch(() => {})
    }
  })
})

watch(effectiveVideo, () => {
  nextTick(() => {
    if (videoRef.value) {
      videoRef.value.muted = isMuted.value
      videoRef.value.play().catch(() => {})
    }
  })
})

function onVideoError(e: Event) {
  console.error('Background video load error:', e)
}

const route = useRoute()
const isHome = computed(() => route.path === '/')

watch(volume, (newVolume) => {
  if (videoRef.value) {
    videoRef.value.volume = newVolume
  }
})

const { gameProcesses } = injection(kInstanceLaunch)

watch(computed(() => gameProcesses.value.length), (cur, last) => {
  if (cur > 0 && last === 0) {
    videoRef.value?.pause()
  } else if (cur === 0 && last > 0) {
    videoRef.value?.play()
  }
})

watch(videoRef, (v) => {
  if (v) {
    v.volume = volume.value
  }
})

onMounted(() => {
  if (videoRef.value) {
    videoRef.value.volume = volume.value
  }
})

watch(backgroundType, (t) => {
  console.log(t)
  console.log(backgroundImage.value)
})


</script>
<style scoped>
.img-container {
  background: radial-gradient(ellipse at top right, transparent, v-bind(sideBarColor) 72%);
  position: absolute;
  min-width: 100%;
  min-height: 100%;
  z-index: 4;
}
</style>
