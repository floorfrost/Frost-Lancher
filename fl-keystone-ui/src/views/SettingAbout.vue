<template>
  <section class="about">
    <SettingCard>
      <div class="pa-6">
        <div class="d-flex align-center flex-wrap gap-4">
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
            <div class="mt-3">
              <v-btn
                variant="tonal"
                color="red"
                size="small"
                class="text-none font-weight-medium"
                @click="openChannel"
              >
                <v-icon start size="18">smart_display</v-icon>
                Floor Frost on YouTube
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </SettingCard>
  </section>
</template>

<script lang="ts" setup>
import SettingCard from '@/components/SettingCard.vue'
import logo from '../assets/logo.png'

function openChannel() {
  window.open('https://www.youtube.com/@FloorFrost', 'browser')
}
</script>

<style scoped>
:deep(.v-img__img) {
  object-fit: contain;
}
</style>
