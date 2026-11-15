<template>
  <div style="background: transparent; width: 100%">
    <ModloaderSelector
      :data="data"
      :versions="versions"
      :show-minecraft="showMinecraft"
      auto-select-latest-on-click
    />

    <!-- Performance & Quality Profile (Mandatory) -->
    <v-list-subheader class="my-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <v-icon size="small" color="primary">tune</v-icon>
        <span class="font-bold text-sm">Performance & Visual Profile</span>
      </div>
      <v-chip size="x-small" color="primary" variant="flat" class="font-bold uppercase tracking-wider">
        Required
      </v-chip>
    </v-list-subheader>

    <div class="grid grid-cols-3 gap-3 mb-3">
      <!-- Performance Card -->
      <div
        data-testid="add-instance-profile-performance"
        class="profile-card cursor-pointer p-3.5 rounded-xl border transition-all select-none"
        :class="performanceProfile === 'performance' ? 'profile-card--selected border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'"
        @click="performanceProfile = 'performance'"
      >
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-2">
            <v-icon size="20" color="amber">speed</v-icon>
            <span class="font-bold text-sm text-white">Performance</span>
          </div>
          <v-icon v-if="performanceProfile === 'performance'" size="18" color="amber">check_circle</v-icon>
        </div>
        <div class="text-xs font-semibold text-amber-400 mb-1">
          8 Chunks • Max FPS
        </div>
        <div class="text-[11px] text-medium-emphasis leading-tight">
          8 chunks, animations & clouds OFF, fast graphics for maximum frames.
        </div>
      </div>

      <!-- Balanced Card -->
      <div
        data-testid="add-instance-profile-balanced"
        class="profile-card cursor-pointer p-3.5 rounded-xl border transition-all select-none"
        :class="performanceProfile === 'balanced' ? 'profile-card--selected border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'"
        @click="performanceProfile = 'balanced'"
      >
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-2">
            <v-icon size="20" color="primary">balance</v-icon>
            <span class="font-bold text-sm text-white">Balanced</span>
          </div>
          <v-icon v-if="performanceProfile === 'balanced'" size="18" color="primary">check_circle</v-icon>
        </div>
        <div class="text-xs font-semibold text-blue-400 mb-1">
          12 Chunks • Standard
        </div>
        <div class="text-[11px] text-medium-emphasis leading-tight">
          12 chunks, standard lighting and particles for everyday vanilla play.
        </div>
      </div>

      <!-- Quality Card -->
      <div
        data-testid="add-instance-profile-quality"
        class="profile-card cursor-pointer p-3.5 rounded-xl border transition-all select-none"
        :class="performanceProfile === 'quality' ? 'profile-card--selected border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/10' : 'border-white/10 bg-white/5 hover:border-white/20'"
        @click="performanceProfile = 'quality'"
      >
        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-2">
            <v-icon size="20" color="cyan">palette</v-icon>
            <span class="font-bold text-sm text-white">Quality</span>
          </div>
          <v-icon v-if="performanceProfile === 'quality'" size="18" color="cyan">check_circle</v-icon>
        </div>
        <div class="text-xs font-semibold text-cyan-300 mb-1">
          16 Chunks • High Visuals
        </div>
        <div class="text-[11px] text-medium-emphasis leading-tight">
          16 chunks, all animations ON, fancy graphics, maximum smooth lighting.
        </div>
      </div>
    </div>

    <!-- Active Profile Features Summary Banner -->
    <div
      class="p-3 mb-4 rounded-xl border transition-all flex flex-col gap-1.5"
      :class="{
        'border-amber-500/25 bg-amber-500/5': performanceProfile === 'performance',
        'border-blue-500/25 bg-blue-500/5': performanceProfile === 'balanced',
        'border-cyan-500/25 bg-cyan-500/5': performanceProfile === 'quality',
      }"
    >
      <div class="flex items-center gap-2 text-xs font-bold text-white">
        <v-icon
          size="16"
          :color="performanceProfile === 'performance' ? 'amber' : performanceProfile === 'quality' ? 'cyan' : 'primary'"
        >
          {{ performanceProfile === 'performance' ? 'speed' : performanceProfile === 'quality' ? 'palette' : 'tune' }}
        </v-icon>
        <span>
          {{ activeProfileConfig.name }} Mode Settings:
        </span>
      </div>
      <div class="flex flex-wrap gap-1.5 mt-0.5">
        <v-chip
          v-for="(feature, idx) in activeProfileConfig.features"
          :key="idx"
          size="x-small"
          variant="tonal"
          :color="performanceProfile === 'performance' ? 'amber' : performanceProfile === 'quality' ? 'cyan' : 'primary'"
          class="text-[10px] font-medium"
        >
          {{ feature }}
        </v-chip>
      </div>
    </div>

    <!-- Advanced Settings -->
    <v-list-subheader data-testid="add-instance-advanced" class="my-4">
      {{ t('setting.advancedSettings') }}
    </v-list-subheader>
    <div class="grid grid-cols-4 gap-4">
      <v-select
        v-model="data.java"
        variant="outlined"
        class="java-select col-span-2"
        item-title="text"
        :label="t('java.location')"
        :placeholder="t('java.allocatedLong')"
        :items="javaItems"
        :menu-props="{}"
        hide-details
        required
      />
      <v-text-field
        v-model="data.minMemory"
        variant="outlined"
        hide-details
        type="number"
        :label="t('java.minMemory')"
        :placeholder="t('java.allocatedShort')"
        required
      />
      <v-text-field
        v-model="data.maxMemory"
        variant="outlined"
        hide-details
        type="number"
        :label="t('java.maxMemory')"
        :placeholder="t('java.allocatedShort')"
        required
      />
    </div>

    <v-list-subheader v-if="isManual" class="mt-4">
      <div class="flex items-center gap-2">
        {{ t('instances.linkSharedFolders') }}
        <v-icon size="tiny" v-shared-tooltip="() => t('instances.linkSharedFoldersHint')">
          question_mark
        </v-icon>
      </div>
    </v-list-subheader>
    <v-list-item class="pt-0 pb-4 px-0" v-if="isManual">
      <div class="flex gap-2 items-center flex-wrap">
        <v-checkbox
          data-testid="add-instance-link-saves"
          v-model="linkPreferences.saves"
          hide-details
        >
          <template #label>
            <v-icon start>map </v-icon>
            {{ t('save.name') }}
          </template>
        </v-checkbox>
        <v-checkbox
          data-testid="add-instance-link-resourcepacks"
          v-model="linkPreferences.resourcepacks"
          hide-details
        >
          <template #label>
            <v-icon start>palette </v-icon>
            {{ t('resourcepack.name') }}
          </template>
        </v-checkbox>
        <v-checkbox
          data-testid="add-instance-link-shaderpacks"
          v-model="linkPreferences.shaderpacks"
          hide-details
        >
          <template #label>
            <v-icon start>gradient </v-icon>
            {{ t('shaderPack.name') }}
          </template>
        </v-checkbox>
        <v-checkbox
          data-testid="add-instance-link-options"
          v-model="linkPreferences.options"
          hide-details
        >
          <template #label>
            <v-icon start>videogame_asset </v-icon>
            {{ t('setting.minecraftOptions') }}
          </template>
        </v-checkbox>
        <v-checkbox
          data-testid="add-instance-link-servers"
          v-model="linkPreferences.servers"
          hide-details
        >
          <template #label>
            <v-icon start>dns </v-icon>
            {{ t('server.serversListTitle') }}
          </template>
        </v-checkbox>
      </div>
    </v-list-item>
  </div>
</template>

<script lang="ts" setup>
import ModloaderSelector from '@/components/ModloaderSelector.vue'
import {
  PROFILE_CONFIGS,
} from '@/composables/instanceOptimization'
import { kInstanceCreation } from '../composables/instanceCreation'
import { kJavaContext } from '../composables/java'
import { kLocalVersions } from '@/composables/versionLocal'
import { injection } from '@/util/inject'
import { computed } from 'vue'
import { vSharedTooltip } from '@/directives/sharedTooltip'

defineProps({
  valid: {
    type: Boolean,
    required: true,
  },
  showMinecraft: {
    type: Boolean,
    default: true,
  },
})

const {
  data,
  linkPreferences,
  isManual,
  performanceProfile,
} = injection(kInstanceCreation)

const { t } = useI18n()
const { versions } = injection(kLocalVersions)
const { all: javas } = injection(kJavaContext)

const activeProfileConfig = computed(() => {
  return PROFILE_CONFIGS[performanceProfile.value] || PROFILE_CONFIGS.performance
})

const javaItems = computed(() =>
  javas.value.map((java) => ({
    text: `Java ${java.majorVersion} (${java.version})`,
    value: java.path,
  })),
)
</script>

<style>
.java-select .v-select__selection {
  white-space: nowrap;
  overflow-x: hidden;
  overflow-y: hidden;
  max-width: 240px;
}

.link-folders--disabled {
  opacity: 0.5;
}

.profile-card {
  position: relative;
}

.profile-card--selected {
  outline: 2px solid currentColor;
}
</style>
