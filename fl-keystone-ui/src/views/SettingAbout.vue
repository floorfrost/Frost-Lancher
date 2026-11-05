<template>
  <section class="about">
    <SettingCard>
      <div class="pa-6 d-flex align-center">
        <v-img
          :src="logo"
          alt="FL Logo"
          width="72"
          height="72"
          class="mr-5 rounded-xl flex-grow-0 flex-shrink-0"
        ></v-img>
        <div>
          <div class="text-h5 font-weight-bold">
            Floor Frost Creations
          </div>
          <div class="text-body-2 opacity-70 mt-1">
            Floor Frost Creation
          </div>
        </div>
      </div>
    </SettingCard>
  </section>
</template>

<script lang="ts" setup>
import SettingCard from '@/components/SettingCard.vue'
import logo from '../assets/logo.png'
</script>

<style scoped>
:deep(.v-img__img) {
  object-fit: contain;
}
</style>
