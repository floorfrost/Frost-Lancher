<template>
  <div class="w-full pointer-events-none">
    <div class="relative footer flex-grow flex items-end pointer-events-none">
      <HomeFooterCard class="pointer-events-auto" />
      <div
        key="launch-button-group"
        class="flex flex-wrap justify-end items-end gap-y-6 gap-x-2 flex-grow pointer-events-auto"
      >
        <HomeLaunchButtonStatus
          class="mr-4 ml-2 mb-2"
          :active="active"
        />
        <div class="flex flex-col items-end gap-2.5">
          <HomeMusicController />
          <HomeLaunchButton
            top
            @mouseenter="active = true"
            @mouseleave="active = false"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import HomeLaunchButton from './HomeLaunchButton.vue'
import HomeLaunchButtonStatus from './HomeLaunchButtonStatus.vue'
import HomeFooterCard from './HomeFooterCard.vue'
import HomeMusicController from './HomeMusicController.vue'

const active = ref(false)
</script>

<style>
.tabs>div[role="tablist"] {
  background: var(--color-sidebar-bg) !important;
  backdrop-filter: blur(var(--blur-card));
}
</style>
<style scoped>
.footer {
  @apply mx-6;
}

@media (max-width: 850px) {
  .footer {
    @apply mr-2;
  }
}
</style>