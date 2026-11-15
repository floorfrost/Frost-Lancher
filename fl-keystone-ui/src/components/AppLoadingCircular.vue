<template>
  <div class="fls-container flex flex-col items-center justify-center p-3 select-none">
    <!-- Sleek Minimalist Spinner Stage -->
    <div class="fls-spinner-stage relative flex items-center justify-center my-3">
      <!-- Ambient Glow Behind Spinner -->
      <div class="fls-ambient-glow" />

      <!-- High-End Dual-Layer SVG Ring -->
      <svg class="fls-svg-ring" viewBox="0 0 96 96">
        <defs>
          <linearGradient id="flsRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8" />
            <stop offset="60%" stop-color="#0284c7" />
            <stop offset="100%" stop-color="#ffffff" />
          </linearGradient>
          <filter id="flsGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#38bdf8" flood-opacity="0.6" />
          </filter>
        </defs>

        <!-- Base Background Track -->
        <circle
          class="fls-track"
          cx="48"
          cy="48"
          r="40"
          fill="none"
          stroke-width="3"
        />

        <!-- Animated Progress Arc -->
        <circle
          class="fls-arc"
          cx="48"
          cy="48"
          r="40"
          fill="none"
          stroke="url(#flsRingGrad)"
          stroke-width="3.5"
          stroke-linecap="round"
          filter="url(#flsGlowFilter)"
        />
      </svg>

      <!-- Center Icon Capsule -->
      <div class="fls-center-capsule flex items-center justify-center">
        <v-icon
          v-if="!isJavaIssue"
          size="26"
          color="#e0f2fe"
          class="fls-center-icon"
        >
          sports_esports
        </v-icon>
        <v-icon
          v-else
          size="26"
          color="#f87171"
          class="fls-center-icon"
        >
          warning
        </v-icon>
      </div>
    </div>

    <!-- Minimal Modern Loading Bar -->
    <div class="fls-bar-wrap w-48 h-1 relative overflow-hidden rounded-full mb-3">
      <div class="fls-bar-track" />
      <div class="fls-bar-indicator" />
    </div>

    <!-- Content Slot (Instance name, step status, hints) -->
    <div class="fls-content-slot w-full flex flex-col items-center">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  texts?: (string | number)[]
  hint?: string
  secondaryHint?: boolean
  isJavaIssue?: boolean
}>()
</script>

<style scoped>
.fls-container {
  width: 100%;
}

/* Spinner Stage */
.fls-spinner-stage {
  width: 96px;
  height: 96px;
}

/* Soft ambient glow behind spinner */
.fls-ambient-glow {
  position: absolute;
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(2, 132, 199, 0.08) 50%, transparent 70%);
  animation: fls-glow-breathe 2.6s ease-in-out infinite alternate;
  pointer-events: none;
}

/* SVG Ring */
.fls-svg-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  animation: fls-spin-smooth 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

.fls-track {
  stroke: rgba(255, 255, 255, 0.08);
}

.fls-arc {
  stroke-dasharray: 251.2;
  stroke-dashoffset: 75;
  animation: fls-arc-morph 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

/* Center Icon Capsule */
.fls-center-capsule {
  position: absolute;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.15), 0 4px 12px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.fls-center-icon {
  filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.5));
  animation: fls-icon-breathe 2.6s ease-in-out infinite alternate;
}

/* Minimalist Loading Bar */
.fls-bar-wrap {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
}

.fls-bar-track {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.04);
}

.fls-bar-indicator {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 40%;
  background: linear-gradient(90deg, transparent 0%, #38bdf8 50%, #ffffff 80%, #38bdf8 95%, transparent 100%);
  border-radius: 9999px;
  filter: drop-shadow(0 0 4px #38bdf8);
  animation: fls-bar-slide 1.6s ease-in-out infinite;
}

/* Smooth Keyframe Animations */
@keyframes fls-spin-smooth {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes fls-arc-morph {
  0% {
    stroke-dashoffset: 190;
  }
  50% {
    stroke-dashoffset: 50;
  }
  100% {
    stroke-dashoffset: 190;
  }
}

@keyframes fls-glow-breathe {
  0% {
    opacity: 0.5;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1.15);
  }
}

@keyframes fls-icon-breathe {
  0% {
    opacity: 0.85;
    transform: scale(0.96);
  }
  100% {
    opacity: 1;
    transform: scale(1.04);
  }
}

@keyframes fls-bar-slide {
  0% {
    left: -40%;
  }
  100% {
    left: 100%;
  }
}
</style>
