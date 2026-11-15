<template>
  <div
    class="home-skin-companion-wrapper"
    :class="{ 'compact': compact, 'is-loading': loading }"
    :title="t('userSkin.libraryTitle')"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @click="onClick"
  >
    <!-- Character Canvas Container -->
    <div class="companion-canvas-box">
      <canvas
        ref="canvasRef"
        class="companion-canvas"
      />
    </div>

    <!-- Soft Under-Foot Shadow -->
    <div class="companion-shadow" aria-hidden="true" />
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { PlayerAnimation, PlayerObject, SkinViewer } from 'skinview3d'
import { injection } from '@/util/inject'
import { kUserContext } from '@/composables/user'
import { useUserSkin } from '@/composables/userSkin'
import steveSkin from '@/assets/steve_skin.png'

const props = defineProps<{
  compact?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

const { t } = useI18n()
const router = useRouter()
const canvasRef = ref<HTMLCanvasElement | null>(null)
let viewer: SkinViewer | undefined
let customAnim: WaveAndPointAnimation | undefined

const { userProfile, gameProfile } = injection(kUserContext)
const userId = computed(() => userProfile.value?.id || '')
const { skin, slim, cape } = useUserSkin(userId, gameProfile, userProfile)

const activeSkinUrl = computed(() => skin.value || steveSkin)
const activeSlim = computed(() => slim.value)
const activeCapeUrl = computed(() => cape.value)

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function smoothstep(min: number, max: number, value: number) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)))
  return x * x * (3 - 2 * x)
}

class WaveAndPointAnimation extends PlayerAnimation {
  isHovered: boolean = false
  isLoading: boolean = false

  protected animate(player: PlayerObject): void {
    const cycle = 7.0
    const t = this.progress % cycle

    // Ensure body parts maintain their canonical Minecraft hierarchy
    // (Never alter body.position.y directly to avoid detaching the torso from the legs!)
    player.skin.body.position.set(0, -6, 0)
    player.skin.body.rotation.set(0, 0, 0)
    player.skin.head.position.set(0, 0, 0)
    player.skin.rightLeg.position.set(-1.9, -12, -0.1)
    player.skin.leftLeg.position.set(1.9, -12, -0.1)

    // When Minecraft is launching: energetic cheering jump!
    if (this.isLoading) {
      const cheerT = this.progress * 10
      player.skin.rightArm.rotation.set(0.3 + Math.sin(cheerT) * 0.15, 0, -2.5 + Math.cos(cheerT) * 0.2)
      player.skin.leftArm.rotation.set(0.3 + Math.cos(cheerT) * 0.15, 0, 2.5 - Math.sin(cheerT) * 0.2)
      player.skin.head.rotation.set(-0.15, Math.sin(cheerT * 0.5) * 0.12, 0)
      player.position.y = Math.abs(Math.sin(cheerT)) * 1.8
      player.skin.rightLeg.rotation.set(Math.sin(cheerT) * 0.2, 0, 0)
      player.skin.leftLeg.rotation.set(-Math.sin(cheerT) * 0.2, 0, 0)
      return
    }

    // Blend between Waving ("Hi") and Pointing Down to Launch Button
    // 0.0s - 3.2s: Waving hand "Hi"
    // 3.2s - 4.0s: Transition to pointing
    // 4.0s - 6.2s: Pointing down to launch button ("Click here!")
    // 6.2s - 7.0s: Transition back to wave
    let pointWeight = 0
    if (t >= 3.2 && t < 4.0) {
      pointWeight = smoothstep(3.2, 4.0, t)
    } else if (t >= 4.0 && t < 6.2) {
      pointWeight = 1
    } else if (t >= 6.2) {
      pointWeight = 1 - smoothstep(6.2, 7.0, t)
    }

    // --- Natural Waving State ---
    // Right arm raised high & to the side, waving side-to-side towards user
    const waveFreq = this.isHovered ? 11 : 8
    const waveArmX = 0.45 + Math.sin(this.progress * 3) * 0.06
    const waveArmY = 0.22
    const waveArmZ = -2.35 + Math.sin(this.progress * waveFreq) * 0.28

    const waveHeadX = -0.06
    const waveHeadY = 0.12 + Math.sin(this.progress * 2) * 0.08
    const waveHeadZ = 0.04

    const waveLeftArmX = 0.12 + Math.sin(this.progress * 2) * 0.05
    const waveLeftArmY = 0
    const waveLeftArmZ = 0.16

    const waveBounceY = Math.sin(this.progress * 3) * 0.2

    // --- Pointing State ---
    // Both arms point down towards launch button below
    const pointFreq = this.isHovered ? 11 : 7
    const pointBounce = Math.sin(this.progress * pointFreq)

    const pointArmX = 0.8 + pointBounce * 0.18
    const pointArmY = -0.2
    const pointArmZ = -0.38 + pointBounce * 0.04

    // Left arm also points down towards the button
    const pointLeftArmX = 0.65 + pointBounce * 0.15
    const pointLeftArmY = 0.15
    const pointLeftArmZ = 0.25 - pointBounce * 0.04

    // Head looking down at launch button
    const pointHeadX = 0.38 + pointBounce * 0.05
    const pointHeadY = 0.08
    const pointHeadZ = -0.04

    const pointBounceY = Math.abs(pointBounce) * -0.28

    // --- Smoothly Blended Limbs ---
    player.skin.rightArm.rotation.x = lerp(waveArmX, pointArmX, pointWeight)
    player.skin.rightArm.rotation.y = lerp(waveArmY, pointArmY, pointWeight)
    player.skin.rightArm.rotation.z = lerp(waveArmZ, pointArmZ, pointWeight)

    player.skin.leftArm.rotation.x = lerp(waveLeftArmX, pointLeftArmX, pointWeight)
    player.skin.leftArm.rotation.y = lerp(waveLeftArmY, pointLeftArmY, pointWeight)
    player.skin.leftArm.rotation.z = lerp(waveLeftArmZ, pointLeftArmZ, pointWeight)

    player.skin.head.rotation.x = lerp(waveHeadX, pointHeadX, pointWeight)
    player.skin.head.rotation.y = lerp(waveHeadY, pointHeadY, pointWeight)
    player.skin.head.rotation.z = lerp(waveHeadZ, pointHeadZ, pointWeight)

    // Move whole player entity for gentle breathing / bounce without tearing
    player.position.y = lerp(waveBounceY, pointBounceY, pointWeight)

    // Slight natural rotation towards user / button
    player.rotation.y = lerp(0.18, 0.08, pointWeight)

    // Slight stable stance on feet
    player.skin.rightLeg.rotation.set(0, 0, 0.03)
    player.skin.leftLeg.rotation.set(0, 0, -0.03)

    if (player.cape) {
      player.cape.rotation.x = 0.18 + Math.sin(this.progress * 3) * 0.05
    }
  }
}

let isDisposed = false

async function updateSkin() {
  if (!viewer || isDisposed) return
  const url = activeSkinUrl.value
  if (!url) return
  try {
    await viewer.loadSkin(url, {
      model: typeof activeSlim.value === 'undefined' ? 'auto-detect' : activeSlim.value ? 'slim' : 'default',
    })
  } catch (err) {
    console.warn('Failed to load companion skin:', err)
  }
}

async function updateCape() {
  if (!viewer || isDisposed) return
  const capeUrl = activeCapeUrl.value
  try {
    if (capeUrl) {
      await viewer.loadCape(capeUrl)
    } else {
      viewer.resetCape()
    }
  } catch (err) {
    console.warn('Failed to load companion cape:', err)
  }
}

function onMouseEnter() {
  if (customAnim) {
    customAnim.isHovered = true
    customAnim.speed = 1.35
  }
}

function onMouseLeave() {
  if (customAnim) {
    customAnim.isHovered = false
    customAnim.speed = 1.0
  }
}

function onClick() {
  emit('click')
  router.push('/me?wardrobe=true')
}

watch(activeSkinUrl, updateSkin)
watch(activeSlim, updateSkin)
watch(activeCapeUrl, updateCape)

watch(() => props.loading, (loading) => {
  if (customAnim) {
    customAnim.isLoading = !!loading
  }
})

onMounted(() => {
  if (!canvasRef.value) return
  isDisposed = false

  viewer = new SkinViewer({
    canvas: canvasRef.value,
    width: 280,
    height: 350,
    fov: 38,
    zoom: 0.92,
  })

  // Disable orbit controls so clicks and hovers pass smoothly to UI
  if (viewer.controls) {
    viewer.controls.enableRotate = false
    viewer.controls.enableZoom = false
    viewer.controls.enablePan = false
  }

  // Position player inside canvas so the feet rest comfortably with headroom for animations
  if (viewer.playerWrapper) {
    viewer.playerWrapper.position.y = -1.8
  }

  // Slightly turn model towards user & launch button
  viewer.playerObject.rotation.y = 0.18

  customAnim = new WaveAndPointAnimation()
  customAnim.isLoading = !!props.loading
  viewer.animation = customAnim

  updateSkin()
  updateCape()
})

onUnmounted(() => {
  isDisposed = true
  if (viewer) {
    viewer.dispose()
    viewer = undefined
  }
})
</script>

<style scoped>
.home-skin-companion-wrapper {
  position: absolute;
  bottom: calc(100% + 18px);
  /* Centered right above the gap between the launch button and the settings button */
  right: -70px;
  width: 280px;
  height: 350px;
  pointer-events: auto;
  cursor: pointer;
  z-index: 11;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  transform-origin: bottom center;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.25s ease;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.35));
}

.home-skin-companion-wrapper:hover {
  transform: translateY(-5px) scale(1.05);
  filter: drop-shadow(0 10px 20px rgba(56, 189, 248, 0.5)) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4));
}

.home-skin-companion-wrapper.compact {
  bottom: calc(100% + 12px);
  right: -80px;
  transform: scale(0.85);
}

.home-skin-companion-wrapper.compact:hover {
  transform: scale(0.92) translateY(-4px);
}

.companion-canvas-box {
  width: 280px;
  height: 350px;
  position: relative;
  overflow: visible;
  z-index: 2;
  animation: skinFloatGentle 4s ease-in-out infinite;
}

.companion-canvas {
  width: 100%;
  height: 100%;
  outline: none;
}

/* Subtle contact shadow cast onto the snow crest below */
.companion-shadow {
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  width: 96px;
  height: 14px;
  background: radial-gradient(ellipse at center, rgba(2, 132, 199, 0.55) 0%, rgba(2, 132, 199, 0) 75%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
  animation: shadowPulseGentle 4s ease-in-out infinite;
}

@keyframes skinFloatGentle {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes shadowPulseGentle {
  0%, 100% {
    transform: translateX(-50%) scale(1);
    opacity: 0.55;
  }
  50% {
    transform: translateX(-50%) scale(0.85);
    opacity: 0.35;
  }
}
</style>
