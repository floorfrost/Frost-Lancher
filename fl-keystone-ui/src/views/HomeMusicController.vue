<template>
  <div
    class="home-music-controller-glass select-none pointer-events-auto"
    :class="{ 'is-playing': isPlaying, 'is-compact': compact }"
  >
    <!-- Glass Specular Highlight & Outer Neon Glow -->
    <div class="glass-specular-highlight" aria-hidden="true" />
    <div class="glass-ambient-glow" aria-hidden="true" />

    <div class="glass-inner-layout flex flex-col justify-between p-2.5 h-full relative z-10">
      <!-- 1. Top Row: Track Meta & Playback Controls -->
      <div class="top-control-row flex items-center justify-between gap-2">
        <!-- Track Title & Status Badge -->
        <div class="track-header-box flex items-center gap-1.5 min-w-0 flex-1">
          <div class="music-icon-disc flex items-center justify-center" :class="{ 'spin-disc': isPlaying }">
            <v-icon size="14" class="disc-icon">music_note</v-icon>
          </div>

          <div class="track-title-wrapper flex flex-col justify-center overflow-hidden flex-1">
            <div class="flex items-center gap-1 overflow-hidden">
              <span v-if="hasTracks && currentTitle" class="track-name-text text-xs font-semibold text-slate-100 truncate">
                {{ currentTitle }}
              </span>
              <span v-else-if="hasTracks" class="track-name-text text-xs font-medium text-slate-300 truncate">
                Background Music
              </span>
              <span v-else class="text-[11px] text-cyan-300 font-medium truncate cursor-pointer hover:underline" @click="openSettings">
                + Add Music Track
              </span>

              <!-- Live Badge when music is playing -->
              <span v-if="isPlaying" class="live-pulse-badge uppercase text-[8px] font-bold px-1.5 py-[1px] rounded-full">
                Live
              </span>
            </div>
          </div>
        </div>

        <!-- Controls: Prev, Play/Pause, Next, Volume -->
        <div class="playback-buttons-dock flex items-center gap-1 shrink-0">
          <button
            v-if="hasTracks"
            type="button"
            class="glass-ctrl-btn btn-sm"
            title="Previous Song"
            @click.stop="prev"
          >
            <v-icon size="14">skip_previous</v-icon>
          </button>

          <button
            type="button"
            class="glass-ctrl-btn btn-play"
            :class="{ 'is-active-play': isPlaying }"
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
            class="glass-ctrl-btn btn-sm"
            title="Next Song"
            @click.stop="next"
          >
            <v-icon size="14">skip_next</v-icon>
          </button>

          <!-- Volume Slider Menu -->
          <v-menu location="top" :close-on-content-click="false">
            <template #activator="{ props: menuProps }">
              <button
                v-bind="menuProps"
                type="button"
                class="glass-ctrl-btn btn-sm"
                title="Volume"
                @wheel.prevent="onWheel"
              >
                <v-icon size="13">
                  {{ volume <= 0.01 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up' }}
                </v-icon>
              </button>
            </template>
            <div class="volume-slider-popup p-2 rounded-xl">
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

      <!-- 2. Bottom Row: Large Prominent Audio Visualizer Wave -->
      <div class="visualizer-stage-box flex items-end justify-between gap-[3px] w-full h-[32px] px-1 pt-1 overflow-hidden" aria-hidden="true">
        <div
          v-for="(val, i) in frequencyBars"
          :key="'freq-bar-' + i"
          class="audio-wave-bar"
          :style="{
            height: isPlaying ? `${Math.max(6, val * 30)}px` : `${Math.max(4, getRestHeight(i))}px`,
            opacity: isPlaying ? 0.75 + val * 0.25 : 0.35,
          }"
        >
          <!-- Shiny Cap at Top of Bar -->
          <span class="bar-cap" />
        </div>
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
const { isPlaying, hasTracks, currentTitle, volume, frequencyBars, toggle, next, prev, setVolume } = useBackgroundMusic()

const volumeModel = computed({
  get: () => volume.value,
  set: (v: number) => setVolume(v),
})

function getRestHeight(index: number): number {
  // Graceful resting wave shape across 24 bars
  const normalized = (index / 23) * Math.PI
  return 5 + Math.sin(normalized) * 7
}

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
  width: 270px;
  height: 76px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.14) 0%, rgba(15, 23, 42, 0.78) 45%, rgba(10, 15, 30, 0.92) 100%);
  backdrop-filter: blur(28px) saturate(200%);
  -webkit-backdrop-filter: blur(28px) saturate(200%);
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow:
    0 16px 36px -6px rgba(0, 0, 0, 0.6),
    0 4px 16px rgba(0, 0, 0, 0.3),
    inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.35),
    inset 0 -1px 1px 0 rgba(0, 0, 0, 0.3);
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  z-index: 25;
}

.home-music-controller-glass:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(15, 23, 42, 0.82) 45%, rgba(10, 15, 30, 0.95) 100%);
  border-color: rgba(56, 189, 248, 0.45);
  box-shadow:
    0 20px 42px -6px rgba(0, 0, 0, 0.65),
    0 0 24px rgba(56, 189, 248, 0.3),
    inset 0 1px 2px 0 rgba(255, 255, 255, 0.45);
  transform: translateY(-2px);
}

.home-music-controller-glass.is-playing {
  border-color: rgba(0, 240, 255, 0.4);
  box-shadow:
    0 16px 36px -6px rgba(0, 0, 0, 0.6),
    0 0 20px rgba(0, 240, 255, 0.25),
    inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.4);
}

/* Glass Specular Highlight Sweep */
.glass-specular-highlight {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 48%;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.03) 75%, transparent 100%);
  border-radius: 18px 18px 120px 120px / 18px 18px 30px 30px;
  pointer-events: none;
}

/* Subtle Ambient Glow */
.glass-ambient-glow {
  position: absolute;
  bottom: -20px;
  left: 10%;
  right: 10%;
  height: 40px;
  background: radial-gradient(ellipse, rgba(0, 240, 255, 0.35) 0%, rgba(217, 70, 239, 0.2) 50%, transparent 80%);
  filter: blur(14px);
  pointer-events: none;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.home-music-controller-glass.is-playing .glass-ambient-glow {
  opacity: 1;
}

/* Music Disc Icon */
.music-icon-disc {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.3) 0%, rgba(217, 70, 239, 0.3) 100%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.5);
  shrink-0: true;
}

.disc-icon {
  color: #38bdf8;
}

.spin-disc {
  animation: spinDisc 6s linear infinite;
}

@keyframes spinDisc {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Live Pulse Badge */
.live-pulse-badge {
  background: linear-gradient(135deg, #00f0ff, #0284c7);
  color: #030712;
  box-shadow: 0 0 8px rgba(0, 240, 255, 0.7);
  letter-spacing: 0.5px;
  animation: pulseBadge 2s ease-in-out infinite;
}

@keyframes pulseBadge {
  0%, 100% { opacity: 0.85; transform: scale(0.96); }
  50% { opacity: 1; transform: scale(1.04); }
}

/* Playback Control Buttons */
.glass-ctrl-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 9px;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
}

.glass-ctrl-btn:hover {
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(255, 255, 255, 0.38);
  color: #ffffff;
  transform: scale(1.08);
}

.glass-ctrl-btn:active {
  transform: scale(0.94);
}

.btn-sm {
  width: 22px;
  height: 22px;
}

.btn-play {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.4) 0%, rgba(168, 85, 247, 0.4) 100%);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.4);
}

.btn-play:hover {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.75) 0%, rgba(168, 85, 247, 0.75) 100%);
  box-shadow: 0 0 14px rgba(56, 189, 248, 0.7);
}

.is-active-play {
  background: linear-gradient(135deg, #00f0ff 0%, #38bdf8 50%, #c084fc 100%);
  color: #030712;
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.7);
}

/* ========================================================
   LARGE HIGH-DEFINITION AUDIO VISUALIZER BARS
   ======================================================== */
.visualizer-stage-box {
  background: rgba(0, 0, 0, 0.22);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.4);
}

.audio-wave-bar {
  position: relative;
  flex: 1;
  min-width: 4px;
  max-width: 8px;
  border-radius: 3px 3px 1px 1px;
  background: linear-gradient(to top, rgba(0, 240, 255, 0.45) 0%, #00f0ff 35%, #38bdf8 65%, #d946ef 92%, #ffffff 100%);
  box-shadow:
    0 0 8px rgba(0, 240, 255, 0.65),
    0 0 16px rgba(217, 70, 239, 0.35);
  transition: height 0.07s cubic-bezier(0.1, 0.8, 0.3, 1), opacity 0.07s ease;
}

.bar-cap {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  border-radius: 3px 3px 0 0;
  background: #ffffff;
  box-shadow: 0 0 4px #ffffff;
}

.volume-slider-popup {
  height: 120px;
  background: rgba(15, 23, 42, 0.92);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6);
}
</style>
