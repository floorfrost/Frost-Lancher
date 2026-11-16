<template>
  <v-dialog
    v-model="visible"
    fullscreen
    transition="dialog-bottom-transition"
    class="in-game-overlay-dialog"
  >
    <div class="in-game-overlay-container flex flex-col h-full w-full select-none text-white relative">
      <!-- Cyber Frosted Glass Backdrop -->
      <div class="overlay-glass-bg absolute inset-0 -z-10" />

      <!-- Top HUD Header -->
      <header class="flex-shrink-0 flex items-center justify-between px-8 py-4 border-b border-cyan-500/20 bg-slate-950/60 backdrop-blur-xl">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2.5">
            <v-icon color="#38bdf8" size="28">ac_unit</v-icon>
            <span class="text-xl font-black tracking-wider bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
              FROST IN-GAME HUB
            </span>
          </div>

          <div class="live-game-badge flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/40 bg-emerald-950/40 text-emerald-300">
            <span class="pulse-dot w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>MINECRAFT RUNNING (Ctrl + F)</span>
          </div>
        </div>

        <!-- Mode Tabs -->
        <div class="flex items-center gap-2 bg-slate-900/80 p-1 rounded-2xl border border-cyan-500/30">
          <button
            type="button"
            class="tab-btn px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
            :class="currentTab === 'resourcepacks' ? 'active-tab' : 'inactive-tab'"
            @click="switchTab('resourcepacks')"
          >
            <v-icon size="18">palette</v-icon>
            Resource Packs
          </button>
          <button
            type="button"
            class="tab-btn px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
            :class="currentTab === 'shaderpacks' ? 'active-tab' : 'inactive-tab'"
            @click="switchTab('shaderpacks')"
          >
            <v-icon size="18">wb_sunny</v-icon>
            Shaders
          </button>
        </div>

        <!-- Right Action: Return to Minecraft -->
        <div class="flex items-center gap-3">
          <v-btn
            variant="tonal"
            color="cyan"
            size="small"
            class="rounded-xl font-bold"
            @click="openFullManager"
          >
            <v-icon start size="16">open_in_new</v-icon>
            Full Manager
          </v-btn>
          <button
            type="button"
            class="close-hud-btn flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-200 border border-red-500/30 transition-all font-bold text-sm cursor-pointer"
            @click="closeOverlay"
          >
            <span>Back to Minecraft</span>
            <span class="kbd-hint text-[10px] bg-red-950/80 px-1.5 py-0.5 rounded border border-red-400/40">ESC</span>
          </button>
        </div>
      </header>

      <!-- Success Hint Toast (Floating) -->
      <transition name="slide-y-transition">
        <div
          v-if="installedToast"
          class="absolute top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-slate-900/95 border-2 border-cyan-400/80 shadow-[0_10px_40px_rgba(6,182,212,0.4)] backdrop-blur-2xl"
        >
          <v-icon color="#38bdf8" size="24">check_circle</v-icon>
          <div class="flex flex-col">
            <span class="text-sm font-black text-cyan-200">{{ installedToast.title }}</span>
            <span class="text-xs text-slate-300">{{ installedToast.body }}</span>
          </div>
          <v-btn icon size="x-small" variant="text" @click="installedToast = null">
            <v-icon size="16">close</v-icon>
          </v-btn>
        </div>
      </transition>

      <!-- Main Body -->
      <main class="flex-1 flex flex-col min-h-0 px-8 py-6 max-w-7xl w-full mx-auto overflow-hidden">
        <!-- Search & Filter Bar -->
        <div class="search-bar-wrap mb-6 flex flex-wrap items-center gap-4">
          <div class="relative flex-1 min-w-[280px]">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="search"
              :placeholder="currentTab === 'resourcepacks' ? 'Search Resource Packs (e.g. Faithful, PvP, Bare Bones)...' : 'Search Shaders (e.g. BSL, Complementary, MakeUp)...'"
              variant="solo"
              density="comfortable"
              rounded="xl"
              hide-details
              clearable
              class="overlay-search-input"
              @keydown.esc.stop="closeOverlay"
            />
          </div>

          <!-- Version Filter Toggle -->
          <button
            type="button"
            class="version-filter-chip flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer"
            :class="onlyCompatible ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200' : 'bg-slate-800/60 border-slate-700 text-slate-400'"
            @click="toggleVersionFilter"
          >
            <v-icon size="16" :color="onlyCompatible ? '#38bdf8' : 'slate'">filter_alt</v-icon>
            <span>Match {{ runtime.minecraft || 'Game Version' }} Only</span>
            <span class="w-2 h-2 rounded-full" :class="onlyCompatible ? 'bg-cyan-400' : 'bg-slate-600'" />
          </button>

          <div class="shortcut-tip flex items-center gap-2 text-xs text-cyan-300/80 bg-cyan-950/40 px-3.5 py-2.5 rounded-xl border border-cyan-500/20">
            <v-icon size="16">tips_and_updates</v-icon>
            <span>Tip: Press <strong>F3 + T</strong> in Minecraft to refresh packs!</span>
          </div>
        </div>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
          <!-- Loading Spinner -->
          <div v-if="loading" class="flex flex-col items-center justify-center h-64 gap-4">
            <v-progress-circular indeterminate color="#38bdf8" size="48" width="3" />
            <span class="text-sm text-cyan-200/80 font-medium">Fetching top community packs from Modrinth...</span>
          </div>

          <!-- Empty State -->
          <div v-else-if="items.length === 0" class="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
            <v-icon size="48" color="slate">search_off</v-icon>
            <span class="text-base font-semibold">No packs found matching "{{ searchQuery }}"</span>
            <span class="text-xs text-slate-500">Try turning off "Match Version" or search with other keywords.</span>
          </div>

          <!-- Cards Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
            <div
              v-for="item in items"
              :key="item.project_id"
              class="pack-card relative flex flex-col justify-between p-4 rounded-2xl bg-slate-900/70 border border-slate-700/60 hover:border-cyan-400/50 hover:bg-slate-900/90 transition-all duration-300"
            >
              <div class="flex gap-3 mb-3">
                <img
                  v-if="item.icon_url"
                  :src="item.icon_url"
                  :alt="item.title"
                  class="w-14 h-14 rounded-xl object-cover bg-slate-800 border border-cyan-500/20 flex-shrink-0"
                />
                <div v-else class="w-14 h-14 rounded-xl bg-slate-800 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <v-icon color="#38bdf8" size="24">{{ currentTab === 'resourcepacks' ? 'palette' : 'wb_sunny' }}</v-icon>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 class="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                      {{ item.title }}
                    </h3>
                    <span
                      v-if="isCompatible(item)"
                      class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 flex-shrink-0"
                    >
                      ✓ {{ runtime.minecraft || 'Compatible' }}
                    </span>
                    <span
                      v-else
                      class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 flex-shrink-0"
                    >
                      ⚠ Not for {{ runtime.minecraft }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                    {{ item.description }}
                  </p>
                </div>
              </div>

              <div class="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <div class="flex items-center gap-3">
                  <span class="flex items-center gap-1">
                    <v-icon size="13" color="#38bdf8">download</v-icon>
                    {{ formatCount(item.downloads) }}
                  </span>
                  <span class="flex items-center gap-1">
                    <v-icon size="13" color="yellow">star</v-icon>
                    {{ item.follows || 0 }}
                  </span>
                </div>

                <v-btn
                  size="small"
                  density="comfortable"
                  :loading="installingIds.includes(item.project_id)"
                  :color="installedIds.includes(item.project_id) ? 'success' : isCompatible(item) ? 'primary' : 'warning'"
                  class="install-btn font-bold rounded-xl px-4"
                  @click="installProject(item)"
                >
                  <template v-if="installedIds.includes(item.project_id)">
                    <v-icon start size="14">check</v-icon>
                    Installed
                  </template>
                  <template v-else-if="!isCompatible(item)">
                    <v-icon start size="14">warning</v-icon>
                    Install Anyway
                  </template>
                  <template v-else>
                    <v-icon start size="14">get_app</v-icon>
                    Install to Game
                  </template>
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { clientModrinthV2 } from '@/util/clients'
import { getFacatsText } from '@/composables/modrinth'
import { useService } from '@/composables'
import { injection } from '@/util/inject'
import { kInstance } from '@/composables/instance'
import { kInstances } from '@/composables/instances'
import {
  InstanceResourcePacksServiceKey,
  InstanceShaderPacksServiceKey,
  MarketType,
  type InstallMarketOptionWithInstance,
} from '@xmcl/runtime-api'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const router = useRouter()
const { path: instancePath, runtime } = injection(kInstance)
const { instances } = injection(kInstances)
const resourcePackService = useService(InstanceResourcePacksServiceKey)
const shaderPackService = useService(InstanceShaderPacksServiceKey)

const visible = ref(props.modelValue)
watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && items.value.length === 0) {
    fetchItems()
  }
})
watch(visible, (val) => {
  emit('update:modelValue', val)
})

const currentTab = ref<'resourcepacks' | 'shaderpacks'>('resourcepacks')
const searchQuery = ref('')
const loading = ref(false)
const items = ref<any[]>([])
const installingIds = ref<string[]>([])
const installedIds = ref<string[]>([])
const installedToast = ref<{ title: string; body: string } | null>(null)

let searchDebounceTimeout: any = null

function formatCount(num: number | undefined) {
  if (!num) return '0'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

function switchTab(tab: 'resourcepacks' | 'shaderpacks') {
  currentTab.value = tab
  items.value = []
  fetchItems()
}

watch(searchQuery, () => {
  clearTimeout(searchDebounceTimeout)
  searchDebounceTimeout = setTimeout(() => {
    fetchItems()
  }, 350)
})

const onlyCompatible = ref(true)

function toggleVersionFilter() {
  onlyCompatible.value = !onlyCompatible.value
  items.value = []
  fetchItems()
}

function isCompatible(item: any) {
  const mcVer = runtime.value.minecraft
  if (!mcVer) return true
  const gvs = item.game_versions || item.versions || []
  return gvs.some((v: string) => v === mcVer || v.startsWith(mcVer.split('.').slice(0, 2).join('.')))
}

async function fetchItems() {
  loading.value = true
  try {
    const projectType = currentTab.value === 'resourcepacks' ? 'resourcepack' : 'shader'
    const targetVersion = onlyCompatible.value ? (runtime.value.minecraft || '') : ''
    const facets = getFacatsText(targetVersion, '', [], [], projectType, '')
    const result = await clientModrinthV2.searchProjects({
      query: searchQuery.value || '',
      index: searchQuery.value ? 'relevance' : 'downloads',
      limit: 21,
      facets,
    })
    items.value = result.hits || []
  } catch (err) {
    console.warn('Failed to search modrinth projects in overlay:', err)
  } finally {
    loading.value = false
  }
}

async function installProject(item: any) {
  if (installingIds.value.includes(item.project_id)) return
  installingIds.value.push(item.project_id)

  try {
    // 1. Fetch available versions for project
    const versions = await clientModrinthV2.getProjectVersions(item.project_id)
    if (!versions || versions.length === 0) {
      throw new Error('No versions found')
    }

    // Pick compatible version or latest release
    const mcVer = runtime.value.minecraft
    const matchedVer = versions.find(v => v.game_versions?.includes(mcVer)) || versions[0]
    const primaryFile = matchedVer.files?.find(f => f.primary) || matchedVer.files?.[0]

    if (!primaryFile || !primaryFile.url) {
      throw new Error('No download file found for version')
    }

    const destPath = instancePath.value || instances.value?.[0]?.path
    if (!destPath) {
      throw new Error('No Minecraft instance is currently selected.')
    }

    // 2. Install using official installFromMarket (downloads, caches & installs cleanly)
    const option: InstallMarketOptionWithInstance = {
      market: MarketType.Modrinth,
      instancePath: destPath,
      version: {
        versionId: matchedVer.id,
        filename: primaryFile?.filename,
        icon: item.icon_url,
      },
    }

    if (currentTab.value === 'resourcepacks') {
      await resourcePackService.installFromMarket(option)
    } else {
      await shaderPackService.installFromMarket(option)
    }

    installedIds.value.push(item.project_id)
    installedToast.value = {
      title: `"${item.title}" Installed!`,
      body: currentTab.value === 'resourcepacks'
        ? 'In Minecraft: Press [F3 + T] to reload, or select it in Options > Resource Packs.'
        : 'In Minecraft: Open Video Settings > Shaders and select your new shader!',
    }

    setTimeout(() => {
      installedToast.value = null
    }, 8000)
  } catch (e: any) {
    console.error('Failed to install pack:', e)
    installedToast.value = {
      title: 'Installation Failed',
      body: e?.message || 'Could not download or install pack.',
    }
    setTimeout(() => {
      installedToast.value = null
    }, 4000)
  } finally {
    installingIds.value = installingIds.value.filter(id => id !== item.project_id)
  }
}

function closeOverlay() {
  visible.value = false
  if (typeof windowController !== 'undefined' && windowController.closeInGameOverlay) {
    windowController.closeInGameOverlay()
  }
}

function openFullManager() {
  closeOverlay()
  if (currentTab.value === 'resourcepacks') {
    router.push('/resourcepacks')
  } else {
    router.push('/shaderpacks')
  }
}

function onGlobalKeydown(e: KeyboardEvent) {
  if (visible.value && (e.key === 'Escape' || (e.ctrlKey && e.key.toLowerCase() === 'f'))) {
    e.preventDefault()
    e.stopPropagation()
    closeOverlay()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
})
</script>

<style scoped>
.in-game-overlay-container {
  background: rgba(8, 12, 22, 0.94);
}

.overlay-glass-bg {
  background: radial-gradient(circle at 50% 20%, rgba(14, 165, 233, 0.15), transparent 70%),
              radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.1), transparent 60%);
  backdrop-filter: blur(28px);
}

.pulse-dot {
  animation: pulseGreen 2s infinite;
}

@keyframes pulseGreen {
  0% { transform: scale(0.9); opacity: 0.7; box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7); }
  70% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 0 6px rgba(52, 211, 153, 0); }
  100% { transform: scale(0.9); opacity: 0.7; box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
}

.active-tab {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(14, 165, 233, 0.2));
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.4);
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.3);
}

.inactive-tab {
  color: #94a3b8;
  border: 1px solid transparent;
}
.inactive-tab:hover {
  color: #f1f5f9;
  background: rgba(255, 255, 255, 0.05);
}

.pack-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.pack-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(6, 182, 212, 0.2);
}

.overlay-search-input :deep(.v-field) {
  background: rgba(15, 23, 42, 0.8) !important;
  border: 1px solid rgba(56, 189, 248, 0.3) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4) !important;
}

.overlay-search-input :deep(.v-field--focused) {
  border-color: #38bdf8 !important;
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.3) !important;
}
</style>
