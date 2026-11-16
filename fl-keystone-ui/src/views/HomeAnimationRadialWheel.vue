<template>
  <Teleport to="body">
    <Transition name="radial-wheel-fade">
      <div
        v-if="modelValue"
        class="radial-wheel-overlay fixed inset-0 z-[99999] flex items-center justify-center select-none"
        @click="close"
        @contextmenu.prevent="close"
        @mousemove="onOverlayMouseMove"
      >
        <!-- Dark Frosted Backdrop with Deep Cinematic Vignette -->
        <div class="radial-backdrop absolute inset-0" />

        <!-- Atmospheric Chromatic Bloom Halo (Deep behind wheel) -->
        <div
          class="radial-ambient-bloom absolute rounded-full pointer-events-none"
          :class="'is-' + activeHovered"
        />

        <!-- 3D Tilting Glass Wheel Container -->
        <div
          ref="wheelRef"
          class="radial-wheel-wrapper relative flex items-center justify-center"
          :style="{
            transform: `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          }"
          @click.stop
          @mousemove="onWheelMouseMove"
          @mouseleave="onWheelMouseLeave"
        >
          <!-- Floating Glass Header Badge: Choose Your Animation -->
          <div class="radial-title-badge absolute -top-16 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none whitespace-nowrap z-20">
            <div class="flex items-center gap-2.5 px-5 py-1.5 rounded-full glass-header-pill">
              <span class="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-pulse" />
              <span class="text-[12px] font-bold tracking-[0.24em] uppercase text-white drop-shadow">
                CHOOSE YOUR ANIMATION
              </span>
            </div>
            <span class="text-[10px] tracking-[0.16em] uppercase text-white/55 mt-1.5 font-medium drop-shadow-sm">
              Select stance to switch • Esc to cancel
            </span>
          </div>

          <!-- Floating Glass Footer: Current Stance Label -->
          <div class="radial-footer-badge absolute -bottom-14 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none whitespace-nowrap z-20">
            <div class="px-4 py-1.5 rounded-full glass-footer-pill text-[11px] font-semibold tracking-[0.2em] uppercase text-white/90">
              {{ activeStanceLabel }}
            </div>
          </div>
          <!-- SVG 3D Frosted Glass Radial Wheel -->
          <svg
            class="radial-wheel-svg"
            viewBox="0 0 420 420"
            width="420"
            height="420"
          >
            <defs>
              <!-- Frosted White Glow Filters -->
              <filter id="whiteGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="hubGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              <!-- 3D Glass Bevel Rim Gradient -->
              <linearGradient id="glassBevelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="rgba(255, 255, 255, 0.75)" />
                <stop offset="25%" stop-color="rgba(255, 255, 255, 0.2)" />
                <stop offset="70%" stop-color="rgba(255, 255, 255, 0.05)" />
                <stop offset="100%" stop-color="rgba(255, 255, 255, 0.55)" />
              </linearGradient>

              <!-- Glass Hover Sector Fill Gradient (Frosted White Illumination) -->
              <linearGradient id="glassHoverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="rgba(255, 255, 255, 0.24)" />
                <stop offset="50%" stop-color="rgba(255, 255, 255, 0.13)" />
                <stop offset="100%" stop-color="rgba(255, 255, 255, 0.05)" />
              </linearGradient>

              <!-- Equipped Sector Base Gradient -->
              <linearGradient id="glassEquippedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="rgba(255, 255, 255, 0.14)" />
                <stop offset="100%" stop-color="rgba(255, 255, 255, 0.04)" />
              </linearGradient>

              <!-- Center Hub Lens Specular Glare Arc -->
              <linearGradient id="hubGlareGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="rgba(255, 255, 255, 0.45)" />
                <stop offset="70%" stop-color="rgba(255, 255, 255, 0.08)" />
                <stop offset="100%" stop-color="rgba(255, 255, 255, 0.0)" />
              </linearGradient>

              <!-- Dynamic Specular Glare Gradient across glass disc -->
              <radialGradient id="dynamicGlareGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="rgba(255, 255, 255, 0.25)" />
                <stop offset="40%" stop-color="rgba(255, 255, 255, 0.08)" />
                <stop offset="100%" stop-color="rgba(255, 255, 255, 0.0)" />
              </radialGradient>

              <!-- ============================================================== -->
              <!-- 2D MINECRAFT CHARACTER ANIMATION PREVIEWS (PURE FLAT WHITE)    -->
              <!-- ============================================================== -->

              <!-- 1. GOJO: HAWA MEIN LETA HUA (Reclining / Lying back floating peacefully in the air) -->
              <g id="preview-gojo" class="character-gojo">
                <!-- Reclined floating group -->
                <g transform="translate(0, -2) rotate(-32)">
                  <!-- Head tilted back comfortably -->
                  <rect x="-24" y="-8" width="9" height="9" rx="1" fill="#ffffff" />
                  <rect x="-24" y="-5" width="9" height="2" fill="rgba(12, 16, 26, 0.7)" />

                  <!-- Torso reclined horizontally in mid-air -->
                  <rect x="-14" y="-5" width="20" height="10" rx="1" fill="#ffffff" />

                  <!-- Left arm resting back relaxed -->
                  <rect x="-13" y="-11" width="16" height="4.5" rx="1" fill="#ffffff" transform="rotate(-15, -13, -11)" />

                  <!-- Right arm resting across chest -->
                  <rect x="-10" y="2" width="15" height="4.5" rx="1" fill="#ffffff" transform="rotate(18, -10, 2)" />

                  <!-- Upper leg floating straight -->
                  <rect x="6" y="-5.5" width="18" height="4.5" rx="1" fill="#ffffff" transform="rotate(-4, 6, -5.5)" />

                  <!-- Lower leg crossed/dangling comfortably -->
                  <rect x="6" y="1" width="17" height="4.5" rx="1" fill="#ffffff" transform="rotate(18, 6, 1)" />
                </g>

                <!-- Floating Air Cushion & Levitation Waves underneath the reclining character -->
                <path d="M -24,14 C -10,21 10,20 25,11" fill="none" stroke="rgba(255, 255, 255, 0.7)" stroke-width="1.3" stroke-linecap="round" />
                <path d="M -16,18 C -4,24 12,23 21,17" fill="none" stroke="rgba(255, 255, 255, 0.35)" stroke-width="0.8" stroke-linecap="round" />
                <circle cx="-6" cy="11" r="1.1" fill="#ffffff" />
                <circle cx="14" cy="7" r="1.3" fill="#ffffff" />
              </g>

              <!-- 2. DEMON SLAYER: TALWAR PAKDI HUI HAI AUR POWER NIKAL RAHI HAI (Sword with power burst) -->
              <g id="preview-slayer" class="character-slayer">
                <!-- Head in focused battle stance -->
                <rect x="-10" y="-23" width="11" height="11" rx="1.2" fill="#ffffff" />
                <polygon points="-10,-23 -13,-27 -9,-25 -7,-28 -4,-24" fill="#ffffff" />

                <!-- Torso forward combat lean -->
                <polygon points="-9,-11 1,-11 3,2 -7,2" fill="#ffffff" />

                <!-- Wide martial combat legs -->
                <polygon points="-1,2 4,2 10,10 5,10" fill="#ffffff" />
                <polygon points="5,10 10,10 11,19 6,19" fill="#ffffff" />
                <polygon points="-8,2 -3,2 -11,18 -16,18" fill="#ffffff" />

                <!-- Both arms gripping the sword forward -->
                <polygon points="-8,-9 -3,-9 3,-2 -1,-1" fill="#ffffff" />
                <polygon points="0,-10 5,-10 9,-2 5,-1" fill="#ffffff" />

                <!-- Nichirin Katana Sword -->
                <line x1="2" y1="0" x2="8" y2="-4" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round" />
                <ellipse cx="8" cy="-4" rx="3.5" ry="1.5" transform="rotate(-32, 8, -4)" fill="rgba(12, 16, 26, 0.9)" stroke="#ffffff" stroke-width="1.2" />
                <line x1="9" y1="-5" x2="26" y2="-18" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" />

                <!-- Power Erupting From Sword (Energy waves & power slash bursts) -->
                <path d="M 12,-3 Q 18,-14 26,-12 Q 32,-21 36,-19" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" />
                <path d="M 16,-7 Q 22,-19 30,-22 Q 35,-29 40,-25" fill="none" stroke="rgba(255, 255, 255, 0.75)" stroke-width="1.3" stroke-linecap="round" />
                <path d="M 8,-6 Q 15,-15 12,-21 Q 20,-23 23,-27" fill="none" stroke="rgba(255, 255, 255, 0.5)" stroke-width="1" stroke-linecap="round" />
                <line x1="26" y1="-18" x2="33" y2="-24" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" />
                <circle cx="28" cy="-13" r="1.3" fill="#ffffff" />
                <circle cx="34" cy="-20" r="1.5" fill="#ffffff" />
                <circle cx="31" cy="-26" r="1.1" fill="#ffffff" />

                <!-- Ground combat shockwave line -->
                <line x1="-18" y1="20" x2="14" y2="20" stroke="rgba(255, 255, 255, 0.45)" stroke-width="1.2" stroke-linecap="round" />
              </g>

              <!-- 3. JETT: HAWA MEIN UD RAHA HAI / FLOAT KAR RAHA HAI (Airborne levitation & flying float pose) -->
              <g id="preview-jett" class="character-jett">
                <!-- Head floating in air with ponytail trailing in updraft -->
                <rect x="-5.5" y="-27" width="11" height="11" rx="1.2" fill="#ffffff" />
                <!-- Upward wind-blown ponytail -->
                <path d="M -4,-26 C -9,-30 -11,-35 -13,-40 C -8,-37 -5,-31 -2,-27 Z" fill="#ffffff" />

                <!-- Torso hovering upright -->
                <rect x="-5.5" y="-15" width="11" height="15" rx="1" fill="#ffffff" />

                <!-- Arms spread out floating in the air (wings / wind resistance) -->
                <!-- Left arm spread outward -->
                <polygon points="-5.5,-14 -10.5,-14 -20,-3 -16,-1" fill="#ffffff" />
                <!-- Right arm spread outward -->
                <polygon points="5.5,-14 10.5,-14 20,-3 16,-1" fill="#ffffff" />

                <!-- Legs dangling weightlessly in the sky -->
                <polygon points="-5,-1 -0.5,-1 1,14 -3.5,14" fill="#ffffff" />
                <polygon points="0.5,-1 5,-1 8,13 3.5,13" fill="#ffffff" />

                <!-- Updraft Wind Currents Lifting the Character -->
                <ellipse cx="0" cy="19" rx="15" ry="3.5" fill="none" stroke="rgba(255, 255, 255, 0.6)" stroke-width="1.2" />
                <path d="M -16,23 C -12,17 -10,9 -11,1" fill="none" stroke="rgba(255, 255, 255, 0.6)" stroke-width="1.2" stroke-linecap="round" />
                <path d="M 16,23 C 12,17 10,9 11,1" fill="none" stroke="rgba(255, 255, 255, 0.6)" stroke-width="1.2" stroke-linecap="round" />
                <path d="M -6,25 C -2,19 0,15 0,7" fill="none" stroke="rgba(255, 255, 255, 0.4)" stroke-width="1" stroke-linecap="round" />
              </g>
            </defs>

            <!-- Outer Beveled 3D Glass Rim Chassis (Radius ~192) -->
            <circle
              cx="210"
              cy="210"
              r="192"
              fill="none"
              stroke="url(#glassBevelGrad)"
              stroke-width="2.5"
              class="outer-glass-bevel"
            />
            <circle
              cx="210"
              cy="210"
              r="186"
              fill="none"
              stroke="rgba(255, 255, 255, 0.1)"
              stroke-width="1"
              stroke-dasharray="3 5"
              class="outer-track-ring"
            />

            <!-- Precision Chronograph Ticks around outer perimeter -->
            <g class="dial-ticks">
              <line
                v-for="(tick, idx) in dialTicks"
                :key="idx"
                :x1="tick.x1"
                :y1="tick.y1"
                :x2="tick.x2"
                :y2="tick.y2"
                :stroke="tick.major ? 'rgba(255, 255, 255, 0.38)' : 'rgba(255, 255, 255, 0.12)'"
                :stroke-width="tick.major ? 1.4 : 0.8"
              />
            </g>

            <!-- Dynamic Specular Light Glare Hotspot (Tracks 3D Tilt in real-time) -->
            <ellipse
              :cx="sheenCenterX"
              :cy="sheenCenterY"
              rx="160"
              ry="75"
              transform="rotate(-25, 210, 210)"
              fill="url(#dynamicGlareGrad)"
              pointer-events="none"
              class="dynamic-specular-glare"
            />

            <!-- ============================================================== -->
            <!-- RADIAL SECTORS (3 Symmetrical 112° Slices with 8° Glass Slits) -->
            <!-- ============================================================== -->

            <!-- 1. GOJO SECTOR (Top / North, 214° to 326°) -->
            <path
              :d="sectorPaths.gojo"
              class="wheel-sector-path"
              :class="{
                'is-hovered': activeHovered === 'gojo',
                'is-equipped': selected === 'gojo',
              }"
              :fill="activeHovered === 'gojo' ? 'url(#glassHoverGrad)' : (selected === 'gojo' ? 'url(#glassEquippedGrad)' : 'rgba(255, 255, 255, 0.035)')"
              :stroke="activeHovered === 'gojo' ? '#ffffff' : (selected === 'gojo' ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 255, 255, 0.16)')"
              @mouseenter="setHovered('gojo')"
              @click.stop="select('gojo')"
            />

            <!-- 2. DEMON SLAYER SECTOR (South-East / Bottom Right, 334° to 86°) -->
            <path
              :d="sectorPaths.slayer"
              class="wheel-sector-path"
              :class="{
                'is-hovered': activeHovered === 'slayer',
                'is-equipped': selected === 'slayer',
              }"
              :fill="activeHovered === 'slayer' ? 'url(#glassHoverGrad)' : (selected === 'slayer' ? 'url(#glassEquippedGrad)' : 'rgba(255, 255, 255, 0.035)')"
              :stroke="activeHovered === 'slayer' ? '#ffffff' : (selected === 'slayer' ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 255, 255, 0.16)')"
              @mouseenter="setHovered('slayer')"
              @click.stop="select('slayer')"
            />

            <!-- 3. JETT SECTOR (South-West / Bottom Left, 94° to 206°) -->
            <path
              :d="sectorPaths.jett"
              class="wheel-sector-path"
              :class="{
                'is-hovered': activeHovered === 'jett',
                'is-equipped': selected === 'jett',
              }"
              :fill="activeHovered === 'jett' ? 'url(#glassHoverGrad)' : (selected === 'jett' ? 'url(#glassEquippedGrad)' : 'rgba(255, 255, 255, 0.035)')"
              :stroke="activeHovered === 'jett' ? '#ffffff' : (selected === 'jett' ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 255, 255, 0.16)')"
              @mouseenter="setHovered('jett')"
              @click.stop="select('jett')"
            />

            <!-- Equipped Indicator Pip (Crisp White Glowing Diamond on outer perimeter) -->
            <g v-if="selected === 'gojo'" transform="translate(210, 24)" class="equipped-pip-group">
              <polygon points="0,-4.5 4.5,0 0,4.5 -4.5,0" fill="#ffffff" filter="url(#whiteGlow)" />
            </g>
            <g v-else-if="selected === 'slayer'" transform="translate(372, 303)" class="equipped-pip-group">
              <polygon points="0,-4.5 4.5,0 0,4.5 -4.5,0" fill="#ffffff" filter="url(#whiteGlow)" />
            </g>
            <g v-else-if="selected === 'jett'" transform="translate(48, 303)" class="equipped-pip-group">
              <polygon points="0,-4.5 4.5,0 0,4.5 -4.5,0" fill="#ffffff" filter="url(#whiteGlow)" />
            </g>

            <!-- 3D Sector Separator Grooves with Dual Etched Highlights -->
            <line x1="210" y1="210" x2="210" y2="24" class="separator-groove" />
            <line x1="211" y1="210" x2="211" y2="24" class="separator-highlight" />
            <line x1="210" y1="210" x2="371" y2="303" class="separator-groove" />
            <line x1="210.8" y1="209.5" x2="371.8" y2="302.5" class="separator-highlight" />
            <line x1="210" y1="210" x2="49" y2="303" class="separator-groove" />
            <line x1="209.2" y1="209.5" x2="48.2" y2="302.5" class="separator-highlight" />

            <!-- ============================================================== -->
            <!-- 2D MINECRAFT CHARACTER PREVIEW IN EACH SECTOR (WHITE SILHOUETTE) -->
            <!-- ============================================================== -->

            <!-- 1. GOJO SECTOR PREVIEW (North: x=210, y=90) -->
            <g
              transform="translate(210, 92)"
              class="sector-character-group"
              :class="{ 'is-active': activeHovered === 'gojo' }"
              @mouseenter="setHovered('gojo')"
              @click.stop="select('gojo')"
            >
              <use href="#preview-gojo" />
            </g>

            <!-- 2. DEMON SLAYER SECTOR PREVIEW (South-East: x=316, y=268) -->
            <g
              transform="translate(316, 268)"
              class="sector-character-group"
              :class="{ 'is-active': activeHovered === 'slayer' }"
              @mouseenter="setHovered('slayer')"
              @click.stop="select('slayer')"
            >
              <use href="#preview-slayer" />
            </g>

            <!-- 3. JETT SECTOR PREVIEW (South-West: x=104, y=268) -->
            <g
              transform="translate(104, 268)"
              class="sector-character-group"
              :class="{ 'is-active': activeHovered === 'jett' }"
              @mouseenter="setHovered('jett')"
              @click.stop="select('jett')"
            >
              <use href="#preview-jett" />
            </g>

            <!-- ============================================================== -->
            <!-- 3D FLOATING CENTER GLASS LENS HUB (Radius 70)                  -->
            <!-- ============================================================== -->

            <!-- Base Frosted Lens -->
            <circle
              cx="210"
              cy="210"
              r="70"
              class="center-hub-glass-bg"
            />
            <!-- Outer Chamfer Ring -->
            <circle
              cx="210"
              cy="210"
              r="70"
              class="center-hub-rim-outer"
            />
            <!-- Rotating HUD Reticle Ring (Precision Optics) -->
            <circle
              cx="210"
              cy="210"
              r="65"
              fill="none"
              stroke="rgba(255, 255, 255, 0.28)"
              stroke-width="1"
              stroke-dasharray="4 8"
              class="reticle-rotator"
            />
            <!-- Inner Concentric Specular Bevel Ring -->
            <circle
              cx="210"
              cy="210"
              r="62"
              class="center-hub-rim-inner"
            />

            <!-- Anamorphic Optic Flare Line through center of lens -->
            <line
              x1="145"
              y1="210"
              x2="275"
              y2="210"
              stroke="rgba(255, 255, 255, 0.2)"
              stroke-width="0.8"
            />

            <!-- Specular Glass Glare Arc across top of center lens -->
            <path
              d="M 155,165 A 70 70 0 0 1 265,165 A 64 45 0 0 0 155,165 Z"
              fill="url(#hubGlareGrad)"
              pointer-events="none"
            />

            <!-- 3D Center Glass Pointer Needle (Pointing towards hovered slice) -->
            <g
              transform="translate(210, 210)"
              class="center-pointer-group"
              :style="{ transform: `translate(210px, 210px) rotate(${pointerRotation}deg)` }"
            >
              <polygon
                points="0,-68 -5,-56 5,-56"
                fill="#ffffff"
                filter="url(#whiteGlow)"
                class="center-pointer-arrow"
              />
            </g>

            <!-- Detailed 2D Character Animation Preview in Center Hub (Scaled 1.45x) -->
            <g
              transform="translate(210, 210)"
              class="center-preview-emblem"
              :key="activeHovered"
            >
              <use
                :href="'#preview-' + activeHovered"
                transform="scale(1.42)"
                filter="url(#hubGlow)"
                opacity="0.32"
              />
              <use
                :href="'#preview-' + activeHovered"
                transform="scale(1.42)"
              />
            </g>
          </svg>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { SkinAnimationType } from '@/composables/userSkinAnimation'

const props = defineProps<{
  modelValue: boolean
  selected: SkinAnimationType
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'select', value: SkinAnimationType): void
}>()

const wheelRef = ref<HTMLElement | null>(null)
const hoveredId = ref<SkinAnimationType | null>(null)
const tiltX = ref(0)
const tiltY = ref(0)

// AudioContext for subtle futuristic glass micro-audio feedback
let audioCtx: AudioContext | null = null
function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioCtor = window.AudioContext || (window as any).webkitAudioContext
    if (AudioCtor) audioCtx = new AudioCtor()
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

function playHoverSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1400, now)
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.035)
    gain.gain.setValueAtTime(0.02, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.035)
  } catch {
    // Silently continue if audio unavailable
  }
}

function playSelectSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    const now = ctx.currentTime
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()
    osc1.type = 'sine'
    osc2.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, now) // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12) // A5
    osc2.frequency.setValueAtTime(880, now + 0.04)
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.16) // D6
    gain.gain.setValueAtTime(0.035, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.12)
    osc2.start(now + 0.04)
    osc2.stop(now + 0.18)
  } catch {
    // Silently continue if audio unavailable
  }
}

function setHovered(id: SkinAnimationType) {
  if (hoveredId.value !== id) {
    hoveredId.value = id
    playHoverSound()
  }
}

// If nothing explicitly hovered, show the currently equipped animation in center
const activeHovered = computed<SkinAnimationType>(() => hoveredId.value || props.selected)

const activeStanceLabel = computed(() => {
  const current = activeHovered.value
  if (current === 'gojo') return 'Gojo • Limitless Float'
  if (current === 'slayer') return 'Demon Slayer • Hinokami Blade'
  return 'Jett • Tailwind Glide'
})

// Pointer arrow rotation angle towards hovered/selected slice
const pointerRotation = computed(() => {
  const current = activeHovered.value
  if (current === 'gojo') return 0       // North (pointing top)
  if (current === 'slayer') return 120   // South-East
  return 240                             // South-West (Jett)
})

// Dynamic specular light reflection that glides across the convex glass disc opposite tilt
const sheenCenterX = computed(() => (210 - tiltY.value * 7).toFixed(1))
const sheenCenterY = computed(() => (210 + tiltX.value * 7).toFixed(1))

// Precision Swiss chronograph dial tick marks around the perimeter (48 ticks)
const dialTicks = Array.from({ length: 48 }, (_, i) => {
  const angle = (i * 360) / 48
  const rad = (angle * Math.PI) / 180
  const isMajor = i % 4 === 0
  const r1 = isMajor ? 181 : 185
  const r2 = 188
  return {
    x1: (210 + r1 * Math.cos(rad)).toFixed(2),
    y1: (210 + r1 * Math.sin(rad)).toFixed(2),
    x2: (210 + r2 * Math.cos(rad)).toFixed(2),
    y2: (210 + r2 * Math.sin(rad)).toFixed(2),
    major: isMajor,
  }
})

function close() {
  hoveredId.value = null
  tiltX.value = 0
  tiltY.value = 0
  emit('update:modelValue', false)
}

function select(type: SkinAnimationType) {
  playSelectSound()
  emit('select', type)
  close()
}

// Donut Arc Path Generator for 3D radial segments centered at (210, 210)
function describeDonutSegment(startDeg: number, endDeg: number, innerR = 72, outerR = 184, cx = 210, cy = 210) {
  const toRad = Math.PI / 180
  const a1 = startDeg * toRad
  const a2 = endDeg * toRad

  const x1_out = (cx + outerR * Math.cos(a1)).toFixed(2)
  const y1_out = (cy + outerR * Math.sin(a1)).toFixed(2)
  const x2_out = (cx + outerR * Math.cos(a2)).toFixed(2)
  const y2_out = (cy + outerR * Math.sin(a2)).toFixed(2)

  const x1_in = (cx + innerR * Math.cos(a2)).toFixed(2)
  const y1_in = (cy + innerR * Math.sin(a2)).toFixed(2)
  const x2_in = (cx + innerR * Math.cos(a1)).toFixed(2)
  const y2_in = (cy + innerR * Math.sin(a1)).toFixed(2)

  return `M ${x1_out} ${y1_out} A ${outerR} ${outerR} 0 0 1 ${x2_out} ${y2_out} L ${x1_in} ${y1_in} A ${innerR} ${innerR} 0 0 0 ${x2_in} ${y2_in} Z`
}

// 3 Symmetrical 112° sectors with 8° gap slits
const sectorPaths = {
  gojo: describeDonutSegment(214, 326),
  slayer: describeDonutSegment(334, 446), // 334° to 86°
  jett: describeDonutSegment(94, 206),
}

// Interactive 3D perspective mouse tilt across the entire overlay
function onOverlayMouseMove(e: MouseEvent) {
  if (!wheelRef.value) return
  const rect = wheelRef.value.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const dx = e.clientX - cx
  const dy = e.clientY - cy

  // Responsive 3D glass tilt (-7.5 to +7.5 deg)
  const maxTilt = 7.5
  tiltX.value = -Math.max(-maxTilt, Math.min(maxTilt, (dy / 280) * maxTilt))
  tiltY.value = Math.max(-maxTilt, Math.min(maxTilt, (dx / 280) * maxTilt))
}

// Radial mouse tracking to select sectors naturally just like GTA V weapon wheel
function onWheelMouseMove(e: MouseEvent) {
  if (!wheelRef.value) return
  const rect = wheelRef.value.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const dx = e.clientX - cx
  const dy = e.clientY - cy
  const dist = Math.hypot(dx, dy)

  // Radial slice detection outside center hub
  if (dist >= 50 && dist <= 260) {
    const deg = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360
    if (deg >= 210 && deg < 330) {
      setHovered('gojo')
    } else if (deg >= 330 || deg < 90) {
      setHovered('slayer')
    } else {
      setHovered('jett')
    }
  }
}

function onWheelMouseLeave() {
  tiltX.value = 0
  tiltY.value = 0
}

function onKeyDown(e: KeyboardEvent) {
  if (props.modelValue && e.key === 'Escape') {
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<style scoped>
.radial-wheel-overlay {
  background: radial-gradient(circle at center, rgba(6, 9, 16, 0.58) 0%, rgba(2, 4, 8, 0.9) 100%);
  backdrop-filter: blur(28px) saturate(180%);
}

/* Atmospheric Chromatic Bloom Halo */
.radial-ambient-bloom {
  width: 480px;
  height: 480px;
  filter: blur(52px);
  opacity: 0.65;
  transition: all 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  transform: scale(0.95);
}

.radial-ambient-bloom.is-gojo {
  background: radial-gradient(circle, rgba(251, 191, 36, 0.25) 0%, rgba(245, 158, 11, 0.08) 55%, transparent 75%);
}

.radial-ambient-bloom.is-slayer {
  background: radial-gradient(circle, rgba(255, 69, 0, 0.28) 0%, rgba(220, 38, 38, 0.08) 55%, transparent 75%);
}

.radial-ambient-bloom.is-jett {
  background: radial-gradient(circle, rgba(56, 189, 248, 0.28) 0%, rgba(2, 132, 199, 0.08) 55%, transparent 75%);
}

/* Floating Glass Header & Footer Badges */
.radial-title-badge {
  animation: titleBadgeIn 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.glass-header-pill {
  background: rgba(255, 255, 255, 0.09);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.24);
  box-shadow:
    0 8px 24px rgba(0, 0, 0, 0.6),
    inset 0 1px 1px rgba(255, 255, 255, 0.45);
}

.radial-footer-badge {
  animation: footerBadgeIn 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.glass-footer-pill {
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow:
    0 6px 20px rgba(0, 0, 0, 0.5),
    inset 0 1px 1px rgba(255, 255, 255, 0.28);
  transition: all 0.2s ease;
}

@keyframes titleBadgeIn {
  0% {
    transform: translate(-50%, -12px);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

@keyframes footerBadgeIn {
  0% {
    transform: translate(-50%, 12px);
    opacity: 0;
  }
  100% {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

.radial-wheel-wrapper {
  animation: wheelPopIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transition: transform 0.1s cubic-bezier(0.2, 0.8, 0.4, 1);
  transform-style: preserve-3d;
  will-change: transform;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 30%, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.035) 45%, rgba(9, 13, 22, 0.86) 100%);
  box-shadow:
    0 35px 85px -15px rgba(0, 0, 0, 0.95),
    inset 0 1.5px 3px rgba(255, 255, 255, 0.5),
    inset 0 -2px 4px rgba(0, 0, 0, 0.65),
    0 0 0 1px rgba(255, 255, 255, 0.18),
    0 0 40px rgba(255, 255, 255, 0.06);
}

@keyframes wheelPopIn {
  0% {
    transform: scale(0.82) rotate(-6deg);
    opacity: 0;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.radial-wheel-fade-enter-active,
.radial-wheel-fade-leave-active {
  transition: opacity 0.24s ease;
}

.radial-wheel-fade-enter-from,
.radial-wheel-fade-leave-to {
  opacity: 0;
}

.radial-wheel-svg {
  overflow: visible;
  filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.7));
}

.outer-glass-bevel {
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.2));
}

.outer-track-ring {
  opacity: 0.8;
}

/* 3D Etched Groove Separators */
.separator-groove {
  stroke: rgba(6, 8, 14, 0.95);
  stroke-width: 4.5;
  stroke-linecap: round;
}

.separator-highlight {
  stroke: rgba(255, 255, 255, 0.28);
  stroke-width: 1.2;
  stroke-linecap: round;
}

/* Frosted Glass Sector Paths */
.wheel-sector-path {
  cursor: pointer;
  stroke-width: 2.2;
  transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

.wheel-sector-path:hover,
.wheel-sector-path.is-hovered {
  stroke-width: 3.4;
  filter: drop-shadow(0 0 16px rgba(255, 255, 255, 0.4));
}

.wheel-sector-path.is-equipped {
  stroke-dasharray: none;
}

/* Character 2D Previews */
.sector-character-group {
  cursor: pointer;
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease;
  opacity: 0.75;
}

.sector-character-group:hover,
.sector-character-group.is-active {
  transform: scale(1.16);
  opacity: 1;
  filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.8));
}

/* Character Idle Micro-Animations (Subtle & high-tech) */
.character-gojo {
  animation: gojoFloat 3.8s ease-in-out infinite alternate;
}

@keyframes gojoFloat {
  0% { transform: translateY(0); }
  100% { transform: translateY(-2.5px); }
}

.character-slayer {
  animation: slayerPower 2.4s ease-in-out infinite alternate;
}

@keyframes slayerPower {
  0% { filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.4)); }
  100% { filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.85)); }
}

.character-jett {
  animation: jettHover 3s ease-in-out infinite alternate;
}

@keyframes jettHover {
  0% { transform: translateY(0); }
  100% { transform: translateY(-3px); }
}

/* Floating Center Hub Glass Lens */
.center-hub-glass-bg {
  fill: rgba(9, 13, 23, 0.92);
  filter: drop-shadow(0 8px 26px rgba(0, 0, 0, 0.9));
}

.center-hub-rim-outer {
  fill: none;
  stroke: rgba(255, 255, 255, 0.22);
  stroke-width: 2.5;
}

.center-hub-rim-inner {
  fill: none;
  stroke: rgba(255, 255, 255, 0.5);
  stroke-width: 1.2;
}

/* Rotating Precision Optical Reticle */
.reticle-rotator {
  transform-origin: 210px 210px;
  animation: reticleSpin 28s linear infinite;
}

@keyframes reticleSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.center-pointer-group {
  transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.center-pointer-arrow {
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.85));
}

.center-preview-emblem {
  pointer-events: none;
  animation: emblemPop 0.24s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes emblemPop {
  0% { transform: translate(210px, 210px) scale(0.85); opacity: 0.4; }
  100% { transform: translate(210px, 210px) scale(1); opacity: 1; }
}

.equipped-pip-group {
  animation: pipGlow 1.8s ease-in-out infinite alternate;
}

@keyframes pipGlow {
  0% { transform: scale(0.9); opacity: 0.8; }
  100% { transform: scale(1.3); opacity: 1; }
}
</style>
