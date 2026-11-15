<template>
  <div
    class="home-music-controller-glass select-none pointer-events-auto"
    :class="{ 'is-playing': isPlaying, 'is-compact': compact }"
    :title="hasTracks ? (isPlaying ? t('pause') || 'Pause' : t('play') || 'Play') : 'Configure Background Music'"
  >
    <!-- Specular Glass Highlight Sweep -->
    <div class="glass-specular-highlight" aria-hidden="true" />

    <div class="glass-content-row flex items-center gap-2 px-3 py-1.5">
      <!-- 1. Live Equalizer / Soundwave Visualizer -->
      <div class="glass-visualizer-container flex items-end gap-[2px] h-[22px] min-w-[36px]" aria-hidden="true">
        <span
          v-for="(val, i) in frequencyBars"
          :key="'bar-' + i"
          class="glass-visualizer-bar"
          :style="{
            height: isPlaying ? `${Math.max(4, val * 22)}px` : `${Math.max(3, (i % 3 + 1) * 3)}px`,
            opacity: isPlaying ? 0.6 + val * 0.4 : 0.35,
          }"
        />
      </div>

      <!-- 2. Track Title & Status Marquee -->
      <div class="track-info-box flex flex-col justify-center min-w-[80px] max-w-[130px] overflow-hidden">
        <span v-if="hasTracks && currentTitle" class="track-title text-[11px] font-semibold text-slate-100 truncate flex items-center gap-1">
          <v-icon size="11" class="text-cyan-400">music_note</v-icon>
          <span class="truncate">{{ currentTitle }}</span>
        </span>
        <span v-else-if="hasTracks" class="track-title text-[11px] font-medium text-slate-300 truncate">
          Background Music
        </span>
        <span v-else class="text-[10px] text-slate-400 font-medium truncate cursor-pointer hover:text-cyan-300" @click="openSettings">
          Add Background Music
        </span>
      </div>

      <!-- 3. Glass Playback Control Buttons -->
      <div class="glass-controls-group flex items-center gap-0.5 ml-auto">
        <button
          v-if="hasTracks"
          type="button"
          class="glass-btn glass-btn-icon"
          title="Previous"
          @click.stop="prev"
        >
          <v-icon size="15">skip_previous</v-icon>
        </button>

        <button
          type="button"
          class="glass-btn glass-btn-play"
          :class="{ 'glow-play': isPlaying }"
          :title="isPlaying ? 'Pause' : 'Play'"
          @click.stop="hasTracks ? toggle() : openSettings()"
        >
          <v-icon size="16">
            {{ isPlaying ? 'pause' : 'play_arrow' }}
          </v-icon>
        </button>

        <button
          v-if="hasTracks"
          type="button"
          class="glass-btn glass-btn-icon"
          title="Next"
          @click.stop="next"
        >
          <v-icon size="15">skip_next</v-icon>
        </button>

        <!-- Volume Glass Menu -->
        <v-menu location="top" :close-on-content-click="false">
          <template #activator="{ props }">
            <button
              v-bind="props"
              type="button"
              class="glass-btn glass-btn-icon"
              title="Volume"
              @wheel.prevent="onWheel"
            >
              <v-icon size="14">
                {{ volume <= 0.01 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up' }}
              </v-icon>
            </button>
          </template>
          <div class="volume-slider-card p-2 rounded-xl">
            <v-slider
              v-model="volumeModel"
              direction="vertical"
              hide-details
              :step="0.01"
              :max="1"
              :min="0"
              density="compact"
              color="cyan"
              @wheel.prevent="onWheel"
            />
          </div>
        </v-menu>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBackgroundMusic } from '@/composables/backgroundMusic'

const props = withDefaults(
  defineProps<{
    compact?: boolean
  }>(),
  {
    compact: false,
  },
)

const router = useRouter()
const { t } = useI18n()
const { isPlaying, hasTracks, currentTitle, volume, frequencyBars, toggle, next, prev, setVolume } = useBackgroundMusic()

const volumeModel = computed({
  get: () => volume.value,
  set: (v: number) => setVolume(v),
})

function onWheel(e: WheelEvent) {
  const nextVol = Math.max(0, Math.min(1, volume.value - e.deltaY / 1000))
  setVolume(nextVol)
}

function openSettings() {
  router.push('/setting/appearance')
}
</script>

<style scoped>
.home-music-controller-glass {
  position: relative;
  width: 240px;
  height: 42px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(15, 23, 42, 0.72) 40%, rgba(15, 23, 42, 0.88) 100%);
  backdrop-filter: blur(24px) saturate(190%);
  -webkit-backdrop-filter: blur(24px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.5),
    0 4px 12px rgba(0, 0, 0, 0.25),
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 1px 0 rgba(0, 0, 0, 0.2);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  z-index: 25;
}

.home-music-controller-glass:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.16) 0%, rgba(15, 23, 42, 0.75) 40%, rgba(15, 23, 42, 0.92) 100%);
  border-color: rgba(56, 189, 248, 0.4);
  box-shadow:
    0 12px 30px -5px rgba(0, 0, 0, 0.6),
    0 0 20px rgba(56, 189, 248, 0.25),
    inset 0 1px 2px 0 rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}

.home-music-controller-glass.is-playing {
  border-color: rgba(0, 240, 255, 0.35);
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.55),
    0 0 16px rgba(0, 240, 255, 0.2),
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.35);
}

/* Glass Specular Reflection Highlight */
.glass-specular-highlight {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 45%;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.02) 80%, transparent 100%);
  border-radius: 14px 14px 100px 100px / 14px 14px 25px 25px;
  pointer-events: none;
}

/* Live Equalizer Soundwave Bars */
.glass-visualizer-container {
  overflow: hidden;
}

.glass-visualizer-bar {
  flex: 1;
  width: 2px;
  min-width: 2px;
  border-radius: 2px 2px 0 0;
  background: linear-gradient(to top, #00f0ff 0%, #38bdf8 50%, #c084fc 100%);
  box-shadow: 0 0 6px rgba(0, 240, 255, 0.5);
  transition: height 0.08s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 0.08s ease;
}

/* Glass Buttons */
.glass-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: all 0.18s ease;
  cursor: pointer;
}

.glass-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.3);
  color: #ffffff;
  transform: scale(1.06);
}

.glass-btn:active {
  transform: scale(0.95);
}

.glass-btn-icon {
  width: 24px;
  height: 24px;
}

.glass-btn-play {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.3) 0%, rgba(168, 85, 247, 0.3) 100%);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.glass-btn-play:hover {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.6) 0%, rgba(168, 85, 247, 0.6) 100%);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.6);
}

.glow-play {
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.45);
}

.volume-slider-card {
  height: 120px;
  background: rgba(15, 23, 42, 0.88);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}
</style>
