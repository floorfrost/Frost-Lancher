<template>
  <canvas
    ref="canvasRef"
    class="frost-particles-canvas pointer-events-none fixed inset-0 z-[1]"
  />
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)

interface Particle {
  x: number
  y: number
  radius: number
  baseAlpha: number
  alpha: number
  vy: number
  vx: number
  angle: number
  swaySpeed: number
  swayAmount: number
  pulseSpeed: number
  color: string
}

let animationId: number | null = null
let width = 0
let height = 0
let particles: Particle[] = []

// Soft frosty cyan, sky-blue and snow-white palette
const COLORS = [
  '224, 242, 254', // ice-blue light
  '186, 230, 253', // soft sky cyan
  '255, 255, 255', // pure snow white
  '240, 249, 255', // glacial frost
  '147, 197, 253', // gentle ice reflection
]

function createParticle(w: number, h: number, initialY = false): Particle {
  const radius = Math.random() * 2.2 + 1.2
  // Keep alpha subtle as requested: "halka-halka dikhe bas, zyada nahi dikhne chahiye"
  const baseAlpha = Math.random() * 0.32 + 0.18
  const color = COLORS[Math.floor(Math.random() * COLORS.length)]
  return {
    x: Math.random() * w,
    y: initialY ? Math.random() * h : -12,
    radius,
    baseAlpha,
    alpha: baseAlpha,
    vy: Math.random() * 0.55 + 0.40, // gentle, peaceful downward drift
    vx: (Math.random() - 0.5) * 0.25,
    angle: Math.random() * Math.PI * 2,
    swaySpeed: Math.random() * 0.015 + 0.008,
    swayAmount: Math.random() * 0.6 + 0.4,
    pulseSpeed: Math.random() * 0.02 + 0.01,
    color,
  }
}

function resize() {
  if (!canvasRef.value) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  width = window.innerWidth
  height = window.innerHeight
  canvasRef.value.width = width * dpr
  canvasRef.value.height = height * dpr
  canvasRef.value.style.width = `${width}px`
  canvasRef.value.style.height = `${height}px`

  const ctx = canvasRef.value.getContext('2d')
  if (ctx) {
    ctx.scale(dpr, dpr)
  }
}

function initParticles() {
  particles = []
  // Subtle count: ~36 particles across the entire viewport
  const count = 36
  for (let i = 0; i < count; i++) {
    particles.push(createParticle(width, height, true))
  }
}

function render() {
  if (!canvasRef.value) return
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, width, height)

  for (let i = 0; i < particles.length; i++) {
    const p = particles[i]
    p.angle += p.swaySpeed
    p.x += Math.sin(p.angle) * p.swayAmount + p.vx
    p.y += p.vy
    p.alpha = p.baseAlpha + Math.sin(p.angle * 2) * 0.08

    // Reset when fallen below screen
    if (p.y > height + 14 || p.x < -20 || p.x > width + 20) {
      particles[i] = createParticle(width, height, false)
      continue
    }

    ctx.save()
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${p.color}, ${Math.max(0.12, Math.min(0.65, p.alpha))})`
    ctx.shadowColor = 'rgba(186, 230, 253, 0.45)'
    ctx.shadowBlur = 4
    ctx.fill()
    ctx.restore()
  }

  animationId = requestAnimationFrame(render)
}

function onVisibilityChange() {
  if (document.hidden) {
    if (animationId !== null) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  } else {
    if (animationId === null) {
      animationId = requestAnimationFrame(render)
    }
  }
}

onMounted(() => {
  resize()
  initParticles()
  window.addEventListener('resize', resize)
  document.addEventListener('visibilitychange', onVisibilityChange)
  animationId = requestAnimationFrame(render)
})

onUnmounted(() => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', resize)
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<style scoped>
.frost-particles-canvas {
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  contain: strict;
}
</style>
