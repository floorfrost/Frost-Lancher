<template>
  <div class="fls-container flex flex-col items-center justify-center p-2 select-none">
    <!-- Top Launch Engine Badge -->
    <div class="fls-badge mb-3">
      <span class="fls-badge-dot" />
      <span class="fls-badge-text">FROST LAUNCH ENGINE</span>
    </div>

    <!-- Central Frost Quantum Reactor / Launch Portal -->
    <div class="fls-portal-stage relative flex items-center justify-center">
      <!-- Expanding Energy Shockwaves -->
      <div class="fls-shockwave fls-shockwave-1" />
      <div class="fls-shockwave fls-shockwave-2" />

      <!-- Outer Orbital Tech Ring with Satellites -->
      <div class="fls-orbit-outer">
        <span class="fls-satellite fls-sat-top" />
        <span class="fls-satellite fls-sat-right" />
        <span class="fls-satellite fls-sat-bottom" />
        <span class="fls-satellite fls-sat-left" />
      </div>

      <!-- Inner Counter-Rotating Dashed Quantum Ring -->
      <div class="fls-orbit-inner" />

      <!-- Drifting Snow Sparkles / Energy Motes -->
      <div class="fls-sparks-wrap" aria-hidden="true">
        <span class="fls-spark fls-sp1" />
        <span class="fls-spark fls-sp2" />
        <span class="fls-spark fls-sp3" />
        <span class="fls-spark fls-sp4" />
        <span class="fls-spark fls-sp5" />
        <span class="fls-spark fls-sp6" />
      </div>

      <!-- Core Glowing Crystal / Hexagon Capsule -->
      <div class="fls-core flex items-center justify-center">
        <div class="fls-core-glow" />
        <v-icon
          v-if="!isJavaIssue"
          size="34"
          color="#ffffff"
          class="fls-core-icon"
        >
          rocket_launch
        </v-icon>
        <v-icon
          v-else
          size="34"
          color="#f87171"
          class="fls-core-icon"
        >
          warning
        </v-icon>
      </div>
    </div>

    <!-- Futuristic Energy Gauge / Sweeping Laser Beam -->
    <div class="fls-gauge-wrap w-60 h-1.5 my-4 relative overflow-hidden rounded-full">
      <div class="fls-gauge-track" />
      <div class="fls-gauge-beam" />
    </div>

    <!-- Content Slot (Typing text, hints, warnings) -->
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

/* Badge at the top */
.fls-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 12px;
  background: rgba(14, 165, 233, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 9999px;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.2);
}

.fls-badge-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: #38bdf8;
  box-shadow: 0 0 8px #38bdf8;
  animation: fls-dot-pulse 1.4s ease-in-out infinite;
}

.fls-badge-text {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.12em;
  color: #7dd3fc;
  text-transform: uppercase;
}

/* Portal Stage Container */
.fls-portal-stage {
  width: 130px;
  height: 130px;
  margin: 6px 0;
}

/* Shockwave Expanding Wave Rings */
.fls-shockwave {
  position: absolute;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 1.5px solid rgba(56, 189, 248, 0.7);
  pointer-events: none;
  animation: fls-shockwave-expand 2.4s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
}

.fls-shockwave-2 {
  animation-delay: 1.2s;
}

/* Outer Clockwise Orbital Tech Ring */
.fls-orbit-outer {
  position: absolute;
  width: 114px;
  height: 114px;
  border-radius: 50%;
  border: 1.5px solid rgba(56, 189, 248, 0.35);
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.25);
  animation: fls-spin-clockwise 7s linear infinite;
}

/* Orbiting Satellite Crystals */
.fls-satellite {
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 8px #38bdf8, 0 0 14px #0284c7;
}

.fls-sat-top {
  top: -3.5px;
  left: calc(50% - 3.5px);
}

.fls-sat-right {
  top: calc(50% - 3.5px);
  right: -3.5px;
}

.fls-sat-bottom {
  bottom: -3.5px;
  left: calc(50% - 3.5px);
}

.fls-sat-left {
  top: calc(50% - 3.5px);
  left: -3.5px;
}

/* Inner Counter-Clockwise Quantum Ring */
.fls-orbit-inner {
  position: absolute;
  width: 86px;
  height: 86px;
  border-radius: 50%;
  border: 2px dashed rgba(186, 230, 253, 0.6);
  animation: fls-spin-counter 4.5s linear infinite;
}

/* Floating Snow Sparks */
.fls-sparks-wrap {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.fls-spark {
  position: absolute;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 6px #7dd3fc;
  animation: fls-spark-float 2.2s ease-out infinite;
}

.fls-sp1 { left: 24%; bottom: 20%; width: 3px; height: 3px; animation-delay: 0s; }
.fls-sp2 { left: 45%; bottom: 15%; width: 4px; height: 4px; animation-delay: 0.4s; }
.fls-sp3 { left: 72%; bottom: 22%; width: 2.5px; height: 2.5px; animation-delay: 0.8s; }
.fls-sp4 { left: 32%; bottom: 25%; width: 3.5px; height: 3.5px; animation-delay: 1.2s; }
.fls-sp5 { left: 60%; bottom: 18%; width: 3px; height: 3px; animation-delay: 1.6s; }
.fls-sp6 { left: 80%; bottom: 28%; width: 2px; height: 2px; animation-delay: 2.0s; }

/* Central Core Capsule */
.fls-core {
  position: relative;
  z-index: 2;
  width: 60px;
  height: 60px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(2, 132, 199, 0.9) 0%, rgba(14, 165, 233, 0.75) 50%, rgba(56, 189, 248, 0.95) 100%);
  border: 1.5px solid rgba(255, 255, 255, 0.5);
  box-shadow:
    0 0 24px rgba(56, 189, 248, 0.65),
    0 8px 24px -4px rgba(0, 0, 0, 0.5),
    inset 0 1px 2px rgba(255, 255, 255, 0.7);
  animation: fls-core-pulse 2.2s ease-in-out infinite;
}

.fls-core-icon {
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.45));
  animation: fls-rocket-bob 2.2s ease-in-out infinite;
}

/* Sweeping Energy Gauge */
.fls-gauge-wrap {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.4);
}

.fls-gauge-beam {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 70px;
  background: linear-gradient(90deg, transparent 0%, #38bdf8 50%, #ffffff 80%, #38bdf8 90%, transparent 100%);
  border-radius: 9999px;
  filter: drop-shadow(0 0 6px #38bdf8);
  animation: fls-beam-sweep 1.8s ease-in-out infinite;
}

/* Keyframe Animations */
@keyframes fls-dot-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.4);
    opacity: 0.6;
  }
}

@keyframes fls-shockwave-expand {
  0% {
    width: 60px;
    height: 60px;
    opacity: 0.9;
    transform: scale(0.9);
  }
  100% {
    width: 140px;
    height: 140px;
    opacity: 0;
    transform: scale(1.2);
  }
}

@keyframes fls-spin-clockwise {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes fls-spin-counter {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}

@keyframes fls-core-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow:
      0 0 24px rgba(56, 189, 248, 0.65),
      0 8px 24px -4px rgba(0, 0, 0, 0.5),
      inset 0 1px 2px rgba(255, 255, 255, 0.7);
  }
  50% {
    transform: scale(1.06);
    box-shadow:
      0 0 36px rgba(56, 189, 248, 0.9),
      0 12px 28px -4px rgba(0, 0, 0, 0.5),
      inset 0 1px 3px rgba(255, 255, 255, 0.9);
  }
}

@keyframes fls-rocket-bob {
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-2px) scale(1.08);
  }
}

@keyframes fls-spark-float {
  0% {
    transform: translateY(0) scale(0.4);
    opacity: 0;
  }
  30% {
    opacity: 1;
    transform: translateY(-16px) scale(1);
  }
  100% {
    transform: translateY(-48px) scale(0.2);
    opacity: 0;
  }
}

@keyframes fls-beam-sweep {
  0% {
    left: -70px;
  }
  50% {
    left: calc(100% - 30px);
  }
  100% {
    left: -70px;
  }
}
</style>
