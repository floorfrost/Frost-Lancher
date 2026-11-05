<template>
  <div
    v-if="!shouldHideLaunchButton"
    v-roving-tabindex
    role="group"
    aria-orientation="horizontal"
    :aria-label="text"
    class="flex flex-grow-0 items-center select-none"
  >
    <div class="relative inline-flex items-center gap-4">
      <!-- Frost Launch Button Container -->
      <div class="relative group">
        <!-- Floating Snow Sparkles & Particles Drifting Upwards -->
        <div class="snow-particles-emitter" aria-hidden="true">
          <span class="snow-flake lp1" />
          <span class="snow-flake lp2" />
          <span class="snow-flake lp3" />
          <span class="snow-flake lp4" />
          <span class="snow-flake lp5" />
          <span class="snow-flake lp6" />
          <span class="snow-flake lp7" />
          <span class="snow-flake lp8" />
          <span class="snow-flake lp9" />
          <span class="snow-flake lp10" />
          <span class="snow-flake lp11" />
          <span class="snow-flake lp12" />
        </div>

        <!-- Realistic Top Snow Layer with Glossy Reflection & Shimmer -->
        <svg
          class="frost-snow-top"
          viewBox="0 0 240 28"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <!-- Soft crystalline snow crest gradient -->
            <linearGradient id="snowCrestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
              <stop offset="45%" stop-color="#f8fafc" stop-opacity="0.98" />
              <stop offset="75%" stop-color="#e0f2fe" stop-opacity="0.95" />
              <stop offset="100%" stop-color="#bae6fd" stop-opacity="0.85" />
            </linearGradient>

            <!-- Glass reflection sheen gradient -->
            <linearGradient id="snowReflectGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0" />
              <stop offset="25%" stop-color="#ffffff" stop-opacity="0.25" />
              <stop offset="50%" stop-color="#ffffff" stop-opacity="1" />
              <stop offset="75%" stop-color="#ffffff" stop-opacity="0.25" />
              <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
            </linearGradient>

            <!-- Under-snow soft icy shadow -->
            <linearGradient id="snowUnderShadow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.5" />
              <stop offset="100%" stop-color="#0284c7" stop-opacity="0" />
            </linearGradient>

            <filter id="snowSoftGlow" x="-5%" y="-10%" width="110%" height="130%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="2" flood-color="#0284c7" flood-opacity="0.4" />
              <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#bae6fd" flood-opacity="0.7" />
            </filter>
          </defs>

          <!-- Under-snow soft shadow / ambient depth -->
          <path
            d="M 12,12
               C 30,5 55,4 80,7
               C 105,10 135,5 160,5
               C 185,5 210,8 228,12
               C 220,18 205,17 195,13
               C 185,9 175,17 165,15
               C 155,13 145,18 135,16
               C 125,14 115,8 105,9
               C 95,10 85,18 75,16
               C 65,14 55,20 45,17
               C 35,14 25,18 12,12 Z"
            fill="url(#snowUnderShadow)"
            transform="translate(0, 2)"
          />

          <!-- Main Realistic Pillowed Snow Drift -->
          <path
            d="M 12,10
               C 30,3 55,2 80,5
               C 105,8 135,3 160,3
               C 185,3 210,6 228,10
               C 220,16 206,15 196,11
               C 186,7 176,15 166,13
               C 156,11 146,16 136,14
               C 126,12 116,6 106,7
               C 96,8 86,16 76,14
               C 66,12 56,18 46,15
               C 36,12 26,16 12,10 Z"
            fill="url(#snowCrestGrad)"
            filter="url(#snowSoftGlow)"
          />

          <!-- Crystalline Specular Reflection Arc -->
          <path
            d="M 22,7
               C 45,3 70,3 95,5
               C 120,7 150,3 175,3
               C 195,3 210,6 218,8"
            stroke="url(#snowReflectGrad)"
            stroke-width="2"
            stroke-linecap="round"
            fill="none"
            class="snow-reflection-beam"
          />

          <!-- Shimmering Sparkle Glints (Ultra-fine micro crystal specs) -->
          <circle cx="52" cy="5" r="1.0" fill="#ffffff" class="snow-glint g1" />
          <circle cx="125" cy="4" r="1.3" fill="#ffffff" class="snow-glint g2" />
          <circle cx="185" cy="5" r="1.0" fill="#ffffff" class="snow-glint g3" />
        </svg>

        <button
          id="launch-button"
          data-testid="launch-button"
          type="button"
          :disabled="isValidating"
          class="frost-btn frost-btn--launch flex items-center justify-center font-bold transition-all duration-300"
          :class="{ 'opacity-80 cursor-not-allowed': isValidating, 'compact': compact }"
          :aria-label="text"
          @click="onPlayClick"
          @mouseenter="onHoverEnter"
          @mouseleave="onHoverLeave"
        >
          <span
            v-if="isGamepadActive"
            class="gp-btn__key gp-btn__key--primary mr-2"
            style="transform: scale(0.85); vertical-align: middle;"
          >{{ buttonX }}</span>

          <span class="frost-btn__label">{{ text }}</span>

          <span
            data-testid="launch-button-play"
            class="inline-flex items-center ml-3"
          >
            <v-progress-circular
              v-if="loading"
              indeterminate
              :size="24"
              :width="2.5"
              color="white"
            />
            <v-icon
              v-else
              size="28"
              color="white"
              class="frost-play-icon"
              :class="{ spin: isSpinning }"
              @animationend="isSpinning = false"
            >
              {{ leftIcon || icon || 'play_arrow' }}
            </v-icon>
          </span>

          <v-badge
            :model-value="count !== 0"
            inline
            class="pb-1 pl-1"
            color="primary"
            :content="count"
          />
        </button>
      </div>

      <!-- Frost Settings Circular Button Container -->
      <div class="relative group">
        <!-- Floating Snow Sparkles for Settings Button -->
        <div class="snow-particles-emitter settings-emitter" aria-hidden="true">
          <span class="snow-flake sp1" />
          <span class="snow-flake sp2" />
          <span class="snow-flake sp3" />
          <span class="snow-flake sp4" />
        </div>

        <!-- Circular Snow Dome Cap on Top -->
        <svg
          class="frost-snow-circle-top"
          viewBox="0 0 64 24"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="snowCircleCrestGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
              <stop offset="50%" stop-color="#f8fafc" stop-opacity="0.98" />
              <stop offset="80%" stop-color="#e0f2fe" stop-opacity="0.95" />
              <stop offset="100%" stop-color="#bae6fd" stop-opacity="0.85" />
            </linearGradient>
            <filter id="snowCircleSoftGlow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#0284c7" flood-opacity="0.4" />
              <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#bae6fd" flood-opacity="0.7" />
            </filter>
          </defs>

          <path
            d="M 6,13
               C 10,5 20,2 32,2
               C 44,2 54,5 58,13
               C 54,16 48,14 44,11
               C 40,8 36,15 32,15
               C 28,15 24,9 20,11
               C 16,13 10,17 6,13 Z"
            fill="url(#snowCircleCrestGrad)"
            filter="url(#snowCircleSoftGlow)"
          />

          <!-- Specular Reflection Arc -->
          <path
            d="M 14,9 C 19,4 25,3 32,3 C 39,3 45,4 50,9"
            stroke="rgba(255, 255, 255, 0.95)"
            stroke-width="1.8"
            stroke-linecap="round"
            fill="none"
            class="snow-reflection-beam"
          />
          <circle cx="32" cy="4" r="1.1" fill="#ffffff" class="snow-glint g2" />
        </svg>

        <v-menu
          v-model="isShown"
          :location="top ? 'top end' : 'bottom end'"
          :open-on-focus="false"
          :open-on-hover="true"
          :open-on-click="false"
          transition="scroll-y-transition"
        >
          <template #activator="{ props: activatorProps }">
            <router-link
              to="/base-setting"
              custom
              v-slot="{ navigate }"
            >
              <button
                type="button"
                :disabled="isValidating"
                data-testid="launch-button-menu"
                class="frost-btn frost-btn--settings flex items-center justify-center transition-all duration-300"
                :class="{ 'opacity-80 cursor-not-allowed': isValidating, 'compact': compact }"
                :aria-label="t('baseSetting.title', 2)"
                :aria-haspopup="'menu'"
                :aria-expanded="isShown"
                v-bind="activatorProps"
                @click="navigate"
                @mouseenter="onHoverEnter"
                @mouseleave="onHoverLeave"
              >
                <v-icon
                  size="30"
                  color="white"
                  class="frost-settings-icon"
                  :class="{ 'is-active': isShown }"
                >
                  settings
                </v-icon>
              </button>
            </router-link>
          </template>
          <HomeLaunchButtonMenuList />
        </v-menu>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { kLaunchButton } from '@/composables/launchButton'
import { injection } from '@/util/inject'
import HomeLaunchButtonMenuList from './HomeLaunchButtonMenuList.vue'
import { kInstances } from '@/composables/instances'
import { vRovingTabindex } from '@/directives/rovingTabindex'
import { kInstance } from '@/composables/instance'
import { useHasMinecraftLicense } from '@/composables/minecraftLicense'
import { useGamepad } from '@/composables/gamepad'
import { isBedrockInstance } from '@xmcl/instance'

defineProps<{ compact?: boolean; top?: boolean }>()

const emit = defineEmits(['mouseenter', 'mouseleave'])
const { isValidating } = injection(kInstances)

const { onClick, icon, text, loading, leftIcon, count } = injection(kLaunchButton)
const { isActive: isGamepadActive, buttonX } = useGamepad()
const { t } = useI18n()

const { instance } = injection(kInstance)
const { hasMinecraftLicense } = useHasMinecraftLicense()
const isBedrock = computed(() => isBedrockInstance(instance.value))
const shouldHideLaunchButton = computed(() => isBedrock.value && !hasMinecraftLicense.value)

const isShown = ref(false)
const isSpinning = ref(false)

function onHoverEnter() {
  emit('mouseenter')
}
function onHoverLeave() {
  emit('mouseleave')
}
function onPlayClick() {
  isSpinning.value = true
  onClick()
}
</script>

<style scoped>
/* Glacier Ice & Glossy Styling */
.frost-btn {
  background: linear-gradient(180deg, #67e8f9 0%, #38bdf8 30%, #0284c7 75%, #0369a1 100%);
  border: 1.5px solid rgba(224, 242, 254, 0.85);
  box-shadow:
    0 0 32px rgba(56, 189, 248, 0.75),
    0 8px 24px rgba(0, 0, 0, 0.45),
    inset 0 2px 5px rgba(255, 255, 255, 0.95),
    inset 0 -3px 8px rgba(3, 105, 161, 0.9);
  position: relative;
  cursor: pointer;
  outline: none;
  overflow: visible;
}

/* Glossy Ice Sheen Overlay across upper half */
.frost-btn::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 12px;
  right: 12px;
  height: 44%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-radius: 9999px 9999px 50px 50px;
  pointer-events: none;
  z-index: 2;
}

.frost-btn:hover {
  background: linear-gradient(180deg, #a5f3fc 0%, #38bdf8 30%, #0284c7 75%, #0284c7 100%);
  box-shadow:
    0 0 45px rgba(56, 189, 248, 0.95),
    0 10px 28px rgba(0, 0, 0, 0.5),
    inset 0 2px 6px rgba(255, 255, 255, 1),
    inset 0 -3px 8px rgba(3, 105, 161, 0.95);
  transform: translateY(-2px) scale(1.02);
}

.frost-btn:active {
  transform: translateY(1px) scale(0.98);
  box-shadow:
    0 0 20px rgba(56, 189, 248, 0.6),
    0 4px 10px rgba(0, 0, 0, 0.35),
    inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.frost-btn--launch {
  height: 62px;
  min-width: 224px;
  padding: 0 40px;
  border-radius: 9999px;
}

.frost-btn--launch.compact {
  height: 52px;
  min-width: 185px;
  padding: 0 32px;
}

.frost-btn__label {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 0.6px;
  color: #ffffff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
  z-index: 3;
}

.frost-btn--launch.compact .frost-btn__label {
  font-size: 22px;
}

.frost-btn--settings {
  width: 62px;
  height: 62px;
  border-radius: 50%;
}

.frost-btn--settings.compact {
  width: 52px;
  height: 52px;
}

/* Realistic Snow SVG Overlays */
.frost-snow-top {
  position: absolute;
  top: -8px;
  left: 0;
  right: 0;
  width: 100%;
  height: 28px;
  pointer-events: none;
  z-index: 10;
}

.frost-snow-circle-top {
  position: absolute;
  top: -7px;
  left: 0;
  right: 0;
  width: 100%;
  height: 24px;
  pointer-events: none;
  z-index: 10;
}

/* Reflection & Shimmer Effects on Snow */
.snow-glint {
  animation: glint-twinkle 3s ease-in-out infinite;
}

.snow-glint.g1 { animation-delay: 0s; }
.snow-glint.g2 { animation-delay: 1.2s; }
.snow-glint.g3 { animation-delay: 2.1s; }

@keyframes glint-twinkle {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1.4);
  }
}

.snow-reflection-beam {
  animation: reflection-sheen 4s ease-in-out infinite;
}

@keyframes reflection-sheen {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.95;
  }
}

/* Floating Subtle Micro-Snow Dust & Crystals */
.snow-particles-emitter {
  position: absolute;
  top: -35px;
  left: 12px;
  right: 12px;
  height: 38px;
  pointer-events: none;
  overflow: visible;
  z-index: 6;
}

.snow-particles-emitter.settings-emitter {
  left: 6px;
  right: 6px;
}

.snow-flake {
  position: absolute;
  bottom: 2px;
  border-radius: 50%;
  background: #ffffff;
  padding: 0 !important;
  margin: 0 !important;
  box-sizing: content-box;
  box-shadow:
    0 0 2px rgba(255, 255, 255, 0.95),
    0 0 3px rgba(186, 230, 253, 0.7);
  opacity: 0;
  animation: float-snow-up 3.2s cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
}

/* Staggered tiny positions & micro sizes (1.0px - 1.6px) */
.lp1  { left: 6%;  width: 1.2px; height: 1.2px; animation-duration: 3.1s; animation-delay: -0.4s; }
.lp2  { left: 14%; width: 1.5px; height: 1.5px; animation-duration: 3.8s; animation-delay: -1.7s; }
.lp3  { left: 23%; width: 1.0px; height: 1.0px; animation-duration: 2.8s; animation-delay: -2.5s; }
.lp4  { left: 32%; width: 1.6px; height: 1.6px; animation-duration: 4.0s; animation-delay: -0.9s; }
.lp5  { left: 42%; width: 1.1px; height: 1.1px; animation-duration: 3.3s; animation-delay: -2.9s; }
.lp6  { left: 52%; width: 1.4px; height: 1.4px; animation-duration: 3.6s; animation-delay: -1.2s; }
.lp7  { left: 62%; width: 1.0px; height: 1.0px; animation-duration: 2.9s; animation-delay: -2.1s; }
.lp8  { left: 72%; width: 1.5px; height: 1.5px; animation-duration: 3.9s; animation-delay: -0.6s; }
.lp9  { left: 81%; width: 1.1px; height: 1.1px; animation-duration: 3.2s; animation-delay: -3.3s; }
.lp10 { left: 90%; width: 1.4px; height: 1.4px; animation-duration: 3.7s; animation-delay: -1.9s; }
.lp11 { left: 38%; width: 1.0px; height: 1.0px; animation-duration: 2.7s; animation-delay: -1.4s; }
.lp12 { left: 67%; width: 1.3px; height: 1.3px; animation-duration: 3.5s; animation-delay: -3.6s; }

.sp1 { left: 18%; width: 1.2px; height: 1.2px; animation-duration: 3.0s; animation-delay: -0.7s; }
.sp2 { left: 42%; width: 1.6px; height: 1.6px; animation-duration: 3.8s; animation-delay: -2.0s; }
.sp3 { left: 64%; width: 1.0px; height: 1.0px; animation-duration: 2.8s; animation-delay: -1.3s; }
.sp4 { left: 82%; width: 1.4px; height: 1.4px; animation-duration: 3.4s; animation-delay: -3.0s; }

@keyframes float-snow-up {
  0% {
    opacity: 0;
    transform: translateY(0) translateX(0) scale(0.6);
  }
  20% {
    opacity: 0.85;
    transform: translateY(-8px) translateX(1.5px) scale(1);
  }
  55% {
    opacity: 0.7;
    transform: translateY(-18px) translateX(-2px) scale(0.9);
  }
  80% {
    opacity: 0.35;
    transform: translateY(-28px) translateX(1.5px) scale(0.7);
  }
  100% {
    opacity: 0;
    transform: translateY(-36px) translateX(-1px) scale(0.3);
  }
}

/* Icons */
.frost-play-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 3;
}

.frost-settings-icon {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 3;
}

.frost-settings-icon.is-active {
  transform: rotate(90deg);
}

.frost-play-icon.spin {
  animation: play-spin 0.45s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes play-spin {
  from {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.15);
  }
  to {
    transform: rotate(360deg) scale(1);
  }
}
</style>
