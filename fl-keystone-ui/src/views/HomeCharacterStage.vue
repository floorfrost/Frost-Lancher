<template>
  <div
    ref="wrapperRef"
    class="home-character-stage-wrapper relative flex flex-col items-center justify-center select-none pointer-events-auto"
    :title="t('userSkin.libraryTitle')"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @click="onClick"
  >
    <!-- Floating 3D Character Canvas (Contained within stage wrapper) -->
    <div class="character-canvas-box absolute inset-0 pointer-events-none z-10 overflow-visible" aria-hidden="true">
      <canvas
        ref="canvasRef"
        class="character-canvas"
        :class="{ 'gojo-active-canvas': selectedAnimation === 'gojo' }"
      />
    </div>

    <!-- Local Gojo Divine Aura behind character in stage wrapper -->
    <div
      v-if="selectedAnimation === 'gojo'"
      class="gojo-stage-aura pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible"
      aria-hidden="true"
    >
      <div class="divine-aura-glow" />
    </div>

    <!-- Wind & Air Draft Field (Valorant Jett Updraft/Float Style) -->
    <div
      v-else-if="selectedAnimation === 'jett'"
      class="jett-wind-field pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible"
      aria-hidden="true"
    >
      <!-- Expanding Wind Rings (Jett Updraft Ground Gust) -->
      <div class="updraft-wind-ring ring-1" />
      <div class="updraft-wind-ring ring-2" />

      <!-- Swirling Wind Ribbons SVG -->
      <svg class="wind-ribbons-svg" viewBox="0 0 520 480" fill="none">
        <defs>
          <linearGradient id="windStreamGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0" />
            <stop offset="30%" stop-color="#bae6fd" stop-opacity="0.85" />
            <stop offset="65%" stop-color="#ffffff" stop-opacity="1" />
            <stop offset="100%" stop-color="#38bdf8" stop-opacity="0" />
          </linearGradient>
          <linearGradient id="windCyanGlow" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stop-color="#0284c7" stop-opacity="0" />
            <stop offset="40%" stop-color="#38bdf8" stop-opacity="0.6" />
            <stop offset="80%" stop-color="#e0f2fe" stop-opacity="0.9" />
            <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
          </linearGradient>
          <filter id="windGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- Updraft Spiral 1 (Left to Right Swirl around torso & arms) -->
        <path
          d="M 90,440 C 40,330 60,240 140,190 C 220,140 360,180 370,110 C 380,50 310,20 270,10"
          stroke="url(#windStreamGrad)"
          stroke-width="3.5"
          stroke-linecap="round"
          class="wind-stream stream-1"
          filter="url(#windGlow)"
        />

        <!-- Updraft Spiral 2 (Right to Center Swirl around shoulders & head) -->
        <path
          d="M 410,440 C 460,320 420,250 340,210 C 250,160 140,150 150,85 C 160,35 230,15 250,8"
          stroke="url(#windStreamGrad)"
          stroke-width="3"
          stroke-linecap="round"
          class="wind-stream stream-2"
          filter="url(#windGlow)"
        />

        <!-- Tight Inner Wind Helix (Encircling waist & legs) -->
        <path
          d="M 180,420 C 130,350 160,290 260,280 C 350,270 340,200 240,180 C 180,170 190,130 230,110"
          stroke="url(#windCyanGlow)"
          stroke-width="2.5"
          stroke-linecap="round"
          class="wind-stream stream-inner"
          filter="url(#windGlow)"
        />

        <!-- Vertical Air Draft Streaks rising from stage -->
        <path
          d="M 170,450 C 160,350 145,270 155,150"
          stroke="url(#windStreamGrad)"
          stroke-width="3"
          stroke-linecap="round"
          class="wind-stream stream-vert-1"
        />
        <path
          d="M 330,450 C 340,340 355,260 345,140"
          stroke="url(#windStreamGrad)"
          stroke-width="3"
          stroke-linecap="round"
          class="wind-stream stream-vert-2"
        />
        <path
          d="M 250,460 C 250,360 240,280 250,180"
          stroke="url(#windCyanGlow)"
          stroke-width="2"
          stroke-linecap="round"
          class="wind-stream stream-vert-3"
        />
      </svg>

      <!-- Updraft Air Particles -->
      <div class="air-particle p1" />
      <div class="air-particle p2" />
      <div class="air-particle p3" />
      <div class="air-particle p4" />
      <div class="air-particle p5" />
      <div class="air-particle p6" />
      <div class="air-particle p7" />
      <div class="air-particle p8" />
    </div>

    <!-- Realistic Screen-Wide Volumetric Sunlight & God Rays (Additive Blend Mode) -->
    <Teleport to="body">
      <div
        v-if="selectedAnimation === 'gojo'"
        class="gojo-realistic-sunlight pointer-events-none fixed inset-0 overflow-hidden select-none"
        aria-hidden="true"
      >
        <!-- 1. Atmospheric Mie Scattering (Golden Sky Background) -->
        <div class="sun-mie-scattering" />

        <!-- 2. Solar Flare, Anamorphic Glare & Corona at the Top Edge of Screen -->
        <div class="sun-corona-halo" />
        <div class="sun-solar-core" />
        <div class="sun-horizontal-streak" />

        <!-- 3. Feathered Volumetric God Rays SVG with Soft Gaussian Blur -->
        <svg class="volumetric-rays-svg" viewBox="0 0 1200 900" preserveAspectRatio="none" fill="none">
          <defs>
            <!-- Primary Golden White Solar Core Gradient -->
            <linearGradient id="rayGoldenPrimary" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95" />
              <stop offset="10%" stop-color="#fffbeb" stop-opacity="0.85" />
              <stop offset="25%" stop-color="#fef08a" stop-opacity="0.65" />
              <stop offset="55%" stop-color="#facc15" stop-opacity="0.32" />
              <stop offset="85%" stop-color="#f59e0b" stop-opacity="0.08" />
              <stop offset="100%" stop-color="#f59e0b" stop-opacity="0" />
            </linearGradient>

            <!-- Warm Amber Secondary Ray Gradient -->
            <linearGradient id="rayGoldenWarm" x1="50%" y1="0%" x2="65%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9" />
              <stop offset="15%" stop-color="#fef9c3" stop-opacity="0.72" />
              <stop offset="42%" stop-color="#fde047" stop-opacity="0.4" />
              <stop offset="78%" stop-color="#d97706" stop-opacity="0.12" />
              <stop offset="100%" stop-color="#d97706" stop-opacity="0" />
            </linearGradient>

            <!-- Ambient Soft Atmospheric Gradient -->
            <linearGradient id="rayAmbientSoft" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stop-color="#fffef0" stop-opacity="0.75" />
              <stop offset="20%" stop-color="#fef08a" stop-opacity="0.38" />
              <stop offset="60%" stop-color="#eab308" stop-opacity="0.12" />
              <stop offset="100%" stop-color="#ca8a04" stop-opacity="0" />
            </linearGradient>

            <!-- Heavy Horizontal Feathering: turns polygon edges into natural smoke-like beams -->
            <filter id="volumetricSoftBlur" x="-30%" y="-10%" width="160%" height="120%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="18 4" />
            </filter>

            <filter id="volumetricWideBlur" x="-40%" y="-10%" width="180%" height="120%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="32 8" />
            </filter>
          </defs>

          <!-- Broad Atmospheric Light Cone -->
          <polygon points="600,0 -100,900 1300,900" fill="url(#rayAmbientSoft)" filter="url(#volumetricWideBlur)" class="ambient-cone" />

          <!-- Center Pillar of Divine Light (Directly illuminating Gojo) -->
          <polygon points="590,0 610,0 680,900 520,900" fill="url(#rayGoldenPrimary)" filter="url(#volumetricSoftBlur)" class="vol-ray ray-center-main" />

          <!-- Supporting Soft Ray Shafts -->
          <polygon points="585,0 598,0 430,900 320,900" fill="url(#rayGoldenWarm)" filter="url(#volumetricSoftBlur)" class="vol-ray ray-left-inner" />
          <polygon points="578,0 588,0 230,900 120,900" fill="url(#rayGoldenPrimary)" filter="url(#volumetricSoftBlur)" class="vol-ray ray-left-mid" />
          <polygon points="572,0 580,0 70,900 -40,900" fill="url(#rayGoldenWarm)" filter="url(#volumetricSoftBlur)" class="vol-ray ray-left-outer" />

          <polygon points="602,0 615,0 870,900 760,900" fill="url(#rayGoldenWarm)" filter="url(#volumetricSoftBlur)" class="vol-ray ray-right-inner" />
          <polygon points="612,0 622,0 1070,900 960,900" fill="url(#rayGoldenPrimary)" filter="url(#volumetricSoftBlur)" class="vol-ray ray-right-mid" />
          <polygon points="620,0 628,0 1250,900 1140,900" fill="url(#rayGoldenWarm)" filter="url(#volumetricSoftBlur)" class="vol-ray ray-right-outer" />

          <!-- Secondary Diagonal Shimmering Strands -->
          <polygon points="593,0 601,0 550,900 480,900" fill="url(#rayGoldenPrimary)" filter="url(#volumetricSoftBlur)" class="vol-ray ray-sub-1" />
          <polygon points="600,0 607,0 720,900 650,900" fill="url(#rayGoldenWarm)" filter="url(#volumetricSoftBlur)" class="vol-ray ray-sub-2" />
        </svg>

        <!-- 4. Atmospheric Bokeh & Sunlight Dust Motes -->
        <div class="sun-bokeh-mote b1" />
        <div class="sun-bokeh-mote b2" />
        <div class="sun-bokeh-mote b3" />
        <div class="sun-bokeh-mote b4" />
        <div class="sun-bokeh-mote b5" />
        <div class="sun-bokeh-mote b6" />
        <div class="sun-bokeh-mote b7" />
        <div class="sun-bokeh-mote b8" />
        <div class="sun-bokeh-mote b9" />
        <div class="sun-bokeh-mote b10" />
        <div class="sun-bokeh-mote b11" />
        <div class="sun-bokeh-mote b12" />
      </div>
    </Teleport>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { PlayerAnimation, PlayerObject, SkinViewer } from 'skinview3d'
import { DirectionalLight } from 'three'
import { injection } from '@/util/inject'
import { kUserContext } from '@/composables/user'
import { useUserSkin } from '@/composables/userSkin'
import { useSkinAnimation } from '@/composables/userSkinAnimation'
import steveSkin from '@/assets/steve_skin.png'

const { t } = useI18n()
const router = useRouter()
const wrapperRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
let viewer: SkinViewer | undefined
let customAnim: (JettFloatingAnimation | GojoFloatingAnimation) | undefined
let sunLight: DirectionalLight | undefined
let rimLight: DirectionalLight | undefined

const { selectedAnimation } = useSkinAnimation()

const { userProfile, gameProfile } = injection(kUserContext)
const userId = computed(() => userProfile.value?.id || '')
const { skin, slim, cape } = useUserSkin(userId, gameProfile, userProfile)

const activeSkinUrl = computed(() => skin.value || steveSkin)
const activeSlim = computed(() => slim.value)
const activeCapeUrl = computed(() => cape.value)

/**
 * Valorant Jett-style Airborne Floating / Levitation Animation
 */
class JettFloatingAnimation extends PlayerAnimation {
  isHovered: boolean = false

  protected animate(player: PlayerObject): void {
    const t = this.progress
    const speed = this.isHovered ? 2.2 : 1.5

    // 1. Fluid vertical anti-gravity float (Valorant Jett levitating in mid-air in center of view)
    const hoverY = Math.sin(t * speed) * 2.5
    player.position.y = hoverY

    // 2. Aerodynamic lateral drift & body banking into wind currents
    const driftX = Math.sin(t * (speed * 0.5)) * 1.2
    player.position.x = driftX
    const swayZ = Math.sin(t * (speed * 0.7)) * 0.06
    player.rotation.z = swayZ
    player.rotation.y = 0
    player.rotation.x = -0.04

    // 3. Head tilted slightly down towards viewer, confident airborne poise
    player.skin.head.rotation.x = -0.08 + Math.sin(t * speed) * 0.02
    player.skin.head.rotation.y = Math.sin(t * (speed * 0.5)) * 0.07
    player.skin.head.rotation.z = 0

    // 4. Arms floating naturally in updraft air resistance
    const armBreathe = Math.sin(t * speed) * 0.08
    player.skin.rightArm.rotation.x = 0.14
    player.skin.rightArm.rotation.z = -0.42 + armBreathe
    player.skin.leftArm.rotation.x = 0.14
    player.skin.leftArm.rotation.z = 0.42 - armBreathe

    // 5. Airborne legs trailing in the wind currents (Jett hovering stance)
    player.skin.leftLeg.rotation.x = 0.32 + Math.sin(t * speed) * 0.05
    player.skin.leftLeg.rotation.z = -0.09
    player.skin.rightLeg.rotation.x = -0.18 - Math.sin(t * speed) * 0.05
    player.skin.rightLeg.rotation.z = 0.09

    // Base body alignment - ensure head and limbs maintain canonical anchor
    player.skin.head.position.set(0, 0, 0)
    player.skin.body.position.set(0, -6, 0)
    player.skin.rightLeg.position.set(-1.9, -12, -0.1)
    player.skin.leftLeg.position.set(1.9, -12, -0.1)

    // Interactive Hover Wave
    if (this.isHovered) {
      const wave = Math.sin(t * 8) * 0.3
      player.skin.rightArm.rotation.x = -0.25
      player.skin.rightArm.rotation.z = -2.2 + wave
      player.skin.head.rotation.y = 0.18
    }
  }
}

/**
 * Gojo Floating Animation — Inspired by Jujutsu Kaisen "Honored One" Awakening Scene
 * Character levitates peacefully reclined in mid-air bathed in divine golden sunlight.
 */
class GojoFloatingAnimation extends PlayerAnimation {
  isHovered: boolean = false

  protected animate(player: PlayerObject): void {
    const t = this.progress
    const speed = this.isHovered ? 1.6 : 1.1

    // 1. Serene celestial levitation (smooth, divine floating in golden light)
    const hoverY = Math.sin(t * speed) * 2.8 + (this.isHovered ? 2.0 : 0)
    player.position.y = hoverY

    // 2. Slow horizontal celestial drift & gentle roll
    const driftX = Math.sin(t * (speed * 0.45)) * 1.4
    player.position.x = driftX

    // 3. Reclined "Honored One" floating posture:
    // In the iconic scene, Gojo is reclined backwards (~42 deg back), chest towards the sun/sky,
    // tilted slightly diagonally as in the reference image.
    const breathTilt = Math.sin(t * speed) * 0.03
    player.rotation.x = -0.74 + breathTilt // tilted backwards ~42 degrees
    player.rotation.y = -0.22              // slight diagonal perspective matching the photo
    player.rotation.z = -0.14 + Math.sin(t * (speed * 0.6)) * 0.03 // relaxed lateral tilt

    // 4. Head tilted back gazing directly into the divine golden rays above
    player.skin.head.rotation.x = -0.32 + Math.sin(t * speed) * 0.02
    player.skin.head.rotation.y = 0.12
    player.skin.head.rotation.z = -0.06

    // 5. Arms spread outward & dangling peacefully in the sky
    const armDrift = Math.sin(t * speed) * 0.06
    player.skin.rightArm.rotation.x = 0.22
    player.skin.rightArm.rotation.z = -0.65 + armDrift
    player.skin.leftArm.rotation.x = 0.26
    player.skin.leftArm.rotation.z = 0.65 - armDrift

    // 6. Legs dangling relaxed downwards from the reclined torso (as shown in reference image)
    const legDrift = Math.sin(t * speed) * 0.04
    player.skin.rightLeg.rotation.x = 0.38 + legDrift
    player.skin.rightLeg.rotation.z = 0.08
    player.skin.leftLeg.rotation.x = 0.22 - legDrift
    player.skin.leftLeg.rotation.z = -0.08

    // Base body alignment - ensure head and limbs maintain canonical anchor
    player.skin.head.position.set(0, 0, 0)
    player.skin.body.position.set(0, -6, 0)
    player.skin.rightLeg.position.set(-1.9, -12, -0.1)
    player.skin.leftLeg.position.set(1.9, -12, -0.1)

    // Interactive hover reaction: arms open wider, head tilts slightly deeper in ecstasy
    if (this.isHovered) {
      player.skin.rightArm.rotation.z = -0.85 + Math.sin(t * 3) * 0.06
      player.skin.leftArm.rotation.z = 0.85 - Math.sin(t * 3) * 0.06
      player.skin.head.rotation.x = -0.42
    }
  }
}

function updateCameraFraming() {
  if (!viewer) return
  const width = wrapperRef.value?.clientWidth || 540
  const height = wrapperRef.value?.clientHeight || 520

  viewer.setSize(width, height)

  const fov = 40
  const rad = (fov / 2) * Math.PI / 180
  const targetCharHeightPx = 340

  const visibleHeight = (32 / targetCharHeightPx) * height
  const distance = visibleHeight / (2 * Math.tan(rad))

  // In skinview3d, player model center is at Y = 0 (head at +16, feet at -16).
  // Target Y = -2 / -2.5 places the model center slightly elevated above canvas center,
  // floating gracefully in the upper-mid area without clipping the head.
  const targetY = selectedAnimation.value === 'gojo' ? -2.5 : -2

  viewer.camera.fov = fov
  viewer.camera.updateProjectionMatrix()

  if (viewer.controls) {
    viewer.controls.maxDistance = 2500
    viewer.controls.target.set(0, targetY, 0)
    viewer.controls.enabled = false
  }

  viewer.camera.position.set(0, targetY, distance)
  viewer.camera.lookAt(0, targetY, 0)
}

function updateLighting() {
  if (!viewer) return
  if (selectedAnimation.value === 'gojo') {
    if (!sunLight) {
      // Main overhead warm sunlight
      sunLight = new DirectionalLight(0xfff7d6, 3.2)
      sunLight.position.set(0, 75, 25)
      ;(viewer.scene as any).add(sunLight)
    }
    if (!rimLight) {
      // Golden rim light from behind/above to create sharp luminous edge lighting on Gojo's body & head
      rimLight = new DirectionalLight(0xffc837, 2.4)
      rimLight.position.set(0, 50, -35)
      ;(viewer.scene as any).add(rimLight)
    }
    sunLight.visible = true
    rimLight.visible = true

    viewer.globalLight.color.setHex(0xfffaed)
    viewer.globalLight.intensity = 2.4
  } else {
    if (sunLight) sunLight.visible = false
    if (rimLight) rimLight.visible = false
    viewer.globalLight.color.setHex(0xffffff)
    viewer.globalLight.intensity = 3.0
  }
}

function applyAnimation() {
  if (!viewer) return
  if (selectedAnimation.value === 'gojo') {
    customAnim = new GojoFloatingAnimation()
  } else {
    customAnim = new JettFloatingAnimation()
  }
  viewer.animation = customAnim
  updateCameraFraming()
  updateLighting()
}

function initViewer() {
  if (!canvasRef.value) return
  if (viewer) {
    viewer.dispose()
    viewer = undefined
  }

  try {
    const width = wrapperRef.value?.clientWidth || 540
    const height = wrapperRef.value?.clientHeight || 520

    viewer = new SkinViewer({
      canvas: canvasRef.value,
      width,
      height,
      skin: activeSkinUrl.value,
      model: activeSlim.value ? 'slim' : 'default',
      cape: activeCapeUrl.value,
    })

    if (viewer.controls) {
      viewer.controls.enableRotate = false
      viewer.controls.enableZoom = false
      viewer.controls.enablePan = false
    }

    // Disable frustum culling completely so Three.js never clips or culls head or body parts
    viewer.playerObject.traverse((obj) => {
      if ((obj as any).isMesh) {
        obj.frustumCulled = false
      }
    })

    applyAnimation()
  } catch (err) {
    console.warn('Failed to initialize floating skin viewer:', err)
  }
}

function handleResize() {
  if (!viewer || !canvasRef.value) return
  updateCameraFraming()
}

function onMouseEnter() {
  if (customAnim) customAnim.isHovered = true
}

function onMouseLeave() {
  if (customAnim) customAnim.isHovered = false
}

function onClick() {
  router.push('/me')
}

watch(selectedAnimation, () => {
  applyAnimation()
})

watch([activeSkinUrl, activeSlim, activeCapeUrl], async () => {
  if (viewer) {
    await viewer.loadSkin(activeSkinUrl.value, { model: activeSlim.value ? 'slim' : 'default' })
    if (activeCapeUrl.value) {
      await viewer.loadCape(activeCapeUrl.value)
    } else {
      viewer.resetCape()
    }
    viewer.playerObject.traverse((obj) => {
      if ((obj as any).isMesh) {
        obj.frustumCulled = false
      }
    })
    updateCameraFraming()
    updateLighting()
  }
})

onMounted(() => {
  initViewer()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (viewer) {
    if (sunLight) {
      ;(viewer.scene as any).remove(sunLight)
      sunLight = undefined
    }
    if (rimLight) {
      ;(viewer.scene as any).remove(rimLight)
      rimLight = undefined
    }
    viewer.dispose()
    viewer = undefined
  }
})
</script>

<style scoped>
.home-character-stage-wrapper {
  cursor: pointer;
  position: relative;
  width: 540px;
  height: 520px;
  max-width: 100%;
}

.character-canvas-box {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
}

.character-canvas {
  width: 100%;
  height: 100%;
  outline: none;
  transition: filter 0.4s ease;
}

.gojo-active-canvas {
  filter: drop-shadow(0 -4px 18px rgba(254, 240, 138, 0.4)) drop-shadow(0 0 32px rgba(250, 204, 21, 0.22));
}

/* Valorant Jett Wind & Air Draft Effects */
.jett-wind-field {
  width: 100%;
  height: 100%;
}

.updraft-wind-ring {
  position: absolute;
  top: 50%;
  margin-top: 145px;
  width: 265px;
  height: 55px;
  border: 2px solid rgba(56, 189, 248, 0.7);
  border-radius: 50%;
  pointer-events: none;
  filter: drop-shadow(0 0 10px rgba(56, 189, 248, 0.8));
  animation: updraftRingPulse 3.2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}

.ring-2 {
  animation-delay: 1.6s;
}

@keyframes updraftRingPulse {
  0% {
    transform: scale(0.4);
    opacity: 0.9;
  }
  60% {
    opacity: 0.35;
  }
  100% {
    transform: scale(1.65);
    opacity: 0;
  }
}

.wind-ribbons-svg {
  width: 500px;
  height: 520px;
  overflow: visible;
}

.wind-stream {
  stroke-dasharray: 140 200;
  animation: windFlow 3.6s linear infinite;
}

.stream-1 {
  stroke-dasharray: 160 220;
  animation: windFlow 3.2s linear infinite;
}

.stream-2 {
  stroke-dasharray: 130 190;
  animation: windFlow 3.8s linear infinite reverse;
}

.stream-inner {
  stroke-dasharray: 100 150;
  animation: windFlow 2.6s linear infinite;
}

.stream-vert-1 {
  stroke-dasharray: 90 140;
  animation: windFlowVert 2.4s ease-in-out infinite;
}

.stream-vert-2 {
  stroke-dasharray: 100 160;
  animation: windFlowVert 2.7s ease-in-out infinite 0.6s;
}

.stream-vert-3 {
  stroke-dasharray: 80 120;
  animation: windFlowVert 2.2s ease-in-out infinite 1.1s;
}

@keyframes windFlow {
  from {
    stroke-dashoffset: 700;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes windFlowVert {
  0% {
    stroke-dashoffset: 350;
    opacity: 0.15;
  }
  50% {
    opacity: 0.75;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 0.05;
  }
}

/* Floating Air Particles */
.air-particle {
  position: absolute;
  width: 3px;
  height: 14px;
  background: linear-gradient(to top, rgba(56, 189, 248, 0.8), rgba(255, 255, 255, 0.95));
  border-radius: 4px;
  filter: blur(0.5px);
  opacity: 0;
  animation: airParticleRise 3s ease-in-out infinite;
}

.p1 { left: 22%; bottom: 70px; animation-duration: 2.8s; animation-delay: 0.2s; }
.p2 { left: 36%; bottom: 50px; animation-duration: 3.4s; animation-delay: 1.1s; height: 18px; }
.p3 { left: 68%; bottom: 80px; animation-duration: 2.6s; animation-delay: 0.8s; }
.p4 { left: 78%; bottom: 60px; animation-duration: 3.1s; animation-delay: 1.7s; height: 12px; }
.p5 { left: 30%; bottom: 90px; animation-duration: 2.5s; animation-delay: 1.4s; }
.p6 { left: 64%; bottom: 40px; animation-duration: 3.6s; animation-delay: 0.5s; }
.p7 { left: 45%; bottom: 65px; animation-duration: 2.9s; animation-delay: 0.9s; height: 16px; }
.p8 { left: 55%; bottom: 55px; animation-duration: 3.3s; animation-delay: 1.9s; }

@keyframes airParticleRise {
  0% {
    transform: translateY(20px) scale(0.6);
    opacity: 0;
  }
  30% {
    opacity: 0.9;
  }
  80% {
    opacity: 0.5;
  }
  100% {
    transform: translateY(-200px) scale(1.15);
    opacity: 0;
  }
}

/* Local Divine Aura Glow in Stage Wrapper */
.gojo-stage-aura {
  width: 100%;
  height: 100%;
}

.divine-aura-glow {
  position: absolute;
  top: 36%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 360px;
  height: 360px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(254, 240, 138, 0.42) 0%,
    rgba(250, 204, 21, 0.22) 42%,
    rgba(245, 158, 11, 0.06) 65%,
    transparent 80%
  );
  filter: blur(32px);
  pointer-events: none;
  animation: divineAuraBreathe 4.5s ease-in-out infinite alternate;
}

@keyframes divineAuraBreathe {
  0% {
    transform: translate(-50%, -50%) scale(0.92);
    opacity: 0.65;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.15);
    opacity: 0.95;
  }
}

/* Realistic Screen-Wide Volumetric Sunlight (Additive Screen Blend) */
.gojo-realistic-sunlight {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 10;
  overflow: hidden;
  mix-blend-mode: screen;
}

/* Blinding White-Hot Sun Core at the Top Center of Screen */
.sun-solar-core {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -45%);
  width: 520px;
  height: 170px;
  max-width: 90vw;
  background: radial-gradient(
    ellipse at center bottom,
    #ffffff 0%,
    rgba(255, 255, 245, 0.98) 22%,
    rgba(254, 240, 138, 0.82) 48%,
    rgba(250, 204, 21, 0.42) 72%,
    transparent 100%
  );
  border-radius: 50%;
  filter: blur(14px);
  pointer-events: none;
  animation: solarCorePulse 5s ease-in-out infinite alternate;
}

@keyframes solarCorePulse {
  0% {
    opacity: 0.85;
    transform: translate(-50%, -45%) scale(0.96);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -45%) scale(1.06);
  }
}

/* Horizontal Anamorphic Lens Flare Streak (Cinematic Movie Glare) */
.sun-horizontal-streak {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, 0);
  width: 920px;
  max-width: 96vw;
  height: 3.5px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(250, 204, 21, 0.18) 18%,
    rgba(255, 255, 255, 0.95) 48%,
    #ffffff 50%,
    rgba(255, 255, 255, 0.95) 52%,
    rgba(250, 204, 21, 0.18) 82%,
    transparent 100%
  );
  filter: blur(2px);
  pointer-events: none;
  opacity: 0.88;
}

/* Broad Golden Corona bleeding down the sky */
.sun-corona-halo {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -35%);
  width: 1040px;
  height: 480px;
  max-width: 100vw;
  background: radial-gradient(
    ellipse at center top,
    rgba(254, 240, 138, 0.62) 0%,
    rgba(250, 204, 21, 0.36) 35%,
    rgba(245, 158, 11, 0.12) 65%,
    transparent 85%
  );
  border-radius: 50%;
  filter: blur(36px);
  pointer-events: none;
  animation: coronaBreathe 6s ease-in-out infinite alternate;
}

@keyframes coronaBreathe {
  0% {
    opacity: 0.72;
    transform: translate(-50%, -35%) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, -35%) scale(1.08);
  }
}

/* Mie Scattering Upper Atmosphere Glow */
.sun-mie-scattering {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 72vh;
  background: radial-gradient(
    ellipse at 50% 0%,
    rgba(254, 240, 138, 0.28) 0%,
    rgba(250, 204, 21, 0.14) 40%,
    rgba(245, 158, 11, 0.03) 72%,
    transparent 100%
  );
  pointer-events: none;
}

/* Full-Screen Volumetric God Rays SVG */
.volumetric-rays-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: visible;
  pointer-events: none;
}

.ambient-cone {
  animation: ambientConeShimmer 6.5s ease-in-out infinite alternate;
}

@keyframes ambientConeShimmer {
  0% { opacity: 0.65; }
  100% { opacity: 0.95; }
}

.vol-ray {
  transform-origin: 50% 0%;
  animation: rayAtmosphereShimmer 6s ease-in-out infinite alternate;
}

.ray-center-main {
  animation-duration: 5.2s;
  animation-delay: 0s;
}

.ray-left-inner {
  animation-duration: 6.4s;
  animation-delay: 0.8s;
}

.ray-left-mid {
  animation-duration: 7.1s;
  animation-delay: 1.6s;
}

.ray-left-outer {
  animation-duration: 8.0s;
  animation-delay: 2.4s;
}

.ray-right-inner {
  animation-duration: 5.8s;
  animation-delay: 0.5s;
}

.ray-right-mid {
  animation-duration: 7.5s;
  animation-delay: 1.2s;
}

.ray-right-outer {
  animation-duration: 8.2s;
  animation-delay: 2.0s;
}

.ray-sub-1 {
  animation-duration: 6.0s;
  animation-delay: 1.0s;
}

.ray-sub-2 {
  animation-duration: 6.6s;
  animation-delay: 1.8s;
}

@keyframes rayAtmosphereShimmer {
  0% {
    opacity: 0.55;
    transform: rotate(-0.35deg) scaleY(0.98);
  }
  50% {
    opacity: 0.95;
  }
  100% {
    opacity: 0.68;
    transform: rotate(0.35deg) scaleY(1.02);
  }
}

/* Atmospheric Bokeh & Sunlight Dust Motes */
.sun-bokeh-mote {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, #ffffff 10%, #fef08a 60%, rgba(250, 204, 21, 0.4) 100%);
  box-shadow: 0 0 8px rgba(254, 240, 138, 0.9), 0 0 16px rgba(245, 158, 11, 0.5);
  pointer-events: none;
  animation: bokehDrift infinite cubic-bezier(0.4, 0, 0.6, 1);
}

.b1 { width: 5px; height: 5px; left: 30%; top: 20%; animation-duration: 6.8s; animation-delay: 0.2s; }
.b2 { width: 8px; height: 8px; left: 46%; top: 14%; animation-duration: 8.2s; animation-delay: 1.1s; filter: blur(0.5px); }
.b3 { width: 4px; height: 4px; left: 60%; top: 26%; animation-duration: 6.0s; animation-delay: 0.6s; }
.b4 { width: 10px; height: 10px; left: 72%; top: 34%; animation-duration: 9.5s; animation-delay: 2.0s; filter: blur(1px); opacity: 0.7; }
.b5 { width: 6px; height: 6px; left: 36%; top: 45%; animation-duration: 7.4s; animation-delay: 1.4s; }
.b6 { width: 5px; height: 5px; left: 52%; top: 48%; animation-duration: 6.5s; animation-delay: 2.8s; }
.b7 { width: 7px; height: 7px; left: 22%; top: 32%; animation-duration: 8.0s; animation-delay: 1.8s; filter: blur(0.5px); }
.b8 { width: 4px; height: 4px; left: 65%; top: 40%; animation-duration: 6.2s; animation-delay: 0.4s; }
.b9 { width: 9px; height: 9px; left: 42%; top: 30%; animation-duration: 8.8s; animation-delay: 3.2s; filter: blur(0.8px); }
.b10 { width: 5px; height: 5px; left: 78%; top: 22%; animation-duration: 7.0s; animation-delay: 2.3s; }
.b11 { width: 3px; height: 3px; left: 56%; top: 38%; animation-duration: 5.5s; animation-delay: 0.9s; }
.b12 { width: 6px; height: 6px; left: 28%; top: 50%; animation-duration: 7.8s; animation-delay: 3.5s; }

@keyframes bokehDrift {
  0% {
    transform: translateY(-20px) translateX(0) scale(0.7);
    opacity: 0;
  }
  25% {
    opacity: 0.95;
    transform: translateY(0) translateX(12px) scale(1.1);
  }
  75% {
    opacity: 0.7;
    transform: translateY(50px) translateX(-10px) scale(0.9);
  }
  100% {
    transform: translateY(100px) translateX(15px) scale(0.5);
    opacity: 0;
  }
}
</style>
