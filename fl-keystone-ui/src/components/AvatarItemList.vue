<template>
  <div
    class="flex flex-grow-0 flex-row items-center justify-center gap-3"
  >
    <template
      v-for="i of items"
      :key="i.title"
    >
      <AvatarItem
        :icon="i.icon"
        :title="i.title"
        :text="i.text"
        :color="i.color"
        :avatar="i.avatar"
        :responsive="i.responsive"
        :onclick="i.onclick"
      />
    </template>
  </div>
</template>
<script lang="ts" setup>
import AvatarItem, { AvatarItemProps } from './AvatarItem.vue'

defineProps<{ items: AvatarItemProps[] }>()
</script>
