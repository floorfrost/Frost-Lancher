<template>
  <v-dialog
    v-model="visible"
    fullscreen
    transition="dialog-bottom-transition"
    class="in-game-overlay-dialog"
  >
    <div class="in-game-overlay-container flex flex-col h-full w-full select-none text-white relative overflow-hidden font-sans">
      <!-- Cyber-Frost Dynamic Animated Ambient Backdrop -->
      <div class="overlay-glass-bg absolute inset-0 -z-10" />
      <div class="ambient-orb ambient-orb-1" />
      <div class="ambient-orb ambient-orb-2" />
      <div class="ambient-orb ambient-orb-3" />
      <div class="ambient-orb ambient-orb-4" />
      <div class="aurora-beam" />
      <div class="overlay-glass-noise absolute inset-0 -z-10 pointer-events-none" />
      <div class="overlay-mesh-pattern absolute inset-0 -z-10 opacity-30" />

      <!-- Top HUD Header -->
      <header class="flex-shrink-0 flex items-center justify-between px-8 py-3.5 border-b border-cyan-500/25 bg-slate-950/70 backdrop-blur-3xl z-20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <!-- Left: Logo & In-Game Status -->
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-3">
            <div class="brand-frost-icon flex items-center justify-center w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <v-icon color="#38bdf8" size="24">ac_unit</v-icon>
            </div>
            <div class="flex flex-col">
              <span class="text-base font-black tracking-wider bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                FROST IN-GAME HUB
              </span>
              <span class="text-[10px] text-cyan-200/60 font-semibold tracking-wide">
                INSTANT SHADERS & RESOURCE PACKS
              </span>
            </div>
          </div>

          <!-- Status Indicator Pill -->
          <div
            v-if="isGameRunning"
            class="live-game-badge flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/50 bg-emerald-950/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
          >
            <span class="pulse-dot w-2 h-2 rounded-full bg-emerald-400" />
            <span>MINECRAFT ACTIVE</span>
            <span class="kbd-micro">Ctrl + F</span>
          </div>
          <div
            v-else
            class="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border border-cyan-500/30 bg-cyan-950/30 text-cyan-300"
          >
            <v-icon size="14" color="#38bdf8">sports_esports</v-icon>
            <span>PROFILE READY</span>
            <span class="kbd-micro">Ctrl + F</span>
          </div>
        </div>

        <!-- Center: Primary Navigation Tabs & View Mode -->
        <div class="flex items-center gap-3">
          <!-- Category Tabs -->
          <div class="category-tabs-container flex items-center gap-1.5 p-1 rounded-2xl border border-cyan-500/30">
            <button
              type="button"
              class="tab-btn px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              :class="currentTab === 'resourcepacks' ? 'active-tab' : 'inactive-tab'"
              @click="switchTab('resourcepacks')"
            >
              <v-icon size="16">palette</v-icon>
              <span>Resource Packs</span>
              <span
                v-if="localResourcePacksCount > 0"
                class="px-1.5 py-0.2 rounded-md text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-500/30"
              >
                {{ localResourcePacksCount }}
              </span>
            </button>
            <button
              type="button"
              class="tab-btn px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              :class="currentTab === 'shaderpacks' ? 'active-tab' : 'inactive-tab'"
              @click="switchTab('shaderpacks')"
            >
              <v-icon size="16">wb_sunny</v-icon>
              <span>Shaders</span>
              <span
                v-if="localShadersCount > 0"
                class="px-1.5 py-0.2 rounded-md text-[10px] bg-cyan-950/80 text-cyan-300 border border-cyan-500/30"
              >
                {{ localShadersCount }}
              </span>
            </button>
          </div>

          <!-- Browse vs Installed Segmented Switch -->
          <div class="view-mode-container flex items-center gap-1 p-1 rounded-2xl border border-white/10">
            <button
              type="button"
              class="view-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              :class="currentView === 'browse' ? 'active-view-btn' : 'inactive-view-btn'"
              @click="currentView = 'browse'"
            >
              <v-icon size="15">travel_explore</v-icon>
              <span>Browse Modrinth</span>
            </button>
            <button
              type="button"
              class="view-btn px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              :class="currentView === 'installed' ? 'active-view-btn' : 'inactive-view-btn'"
              @click="currentView = 'installed'"
            >
              <v-icon size="15">inventory_2</v-icon>
              <span>Installed ({{ currentTab === 'resourcepacks' ? localResourcePacksCount : localShadersCount }})</span>
            </button>
          </div>
        </div>

        <!-- Right: Folder, Full Manager & Return to Game -->
        <div class="flex items-center gap-2.5">
          <v-btn
            variant="tonal"
            color="cyan"
            size="small"
            class="header-glass-btn rounded-xl font-bold flex items-center gap-1"
            title="Open Directory in File Explorer"
            @click="openFolder"
          >
            <v-icon size="16" start>folder_open</v-icon>
            <span>Folder</span>
          </v-btn>

          <v-btn
            variant="tonal"
            color="cyan"
            size="small"
            class="header-glass-btn rounded-xl font-bold"
            @click="openFullManager"
          >
            <v-icon start size="16">open_in_new</v-icon>
            <span>Full Manager</span>
          </v-btn>

          <button
            type="button"
            class="close-hud-btn flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-red-500/25 to-rose-600/25 hover:from-red-500/40 hover:to-rose-600/40 text-red-100 border border-red-500/40 transition-all font-bold text-xs cursor-pointer shadow-[0_0_20px_rgba(239,68,68,0.2)]"
            @click="closeOverlay"
          >
            <span>Back to Game</span>
            <span class="kbd-hint text-[10px] bg-red-950/80 px-1.5 py-0.5 rounded border border-red-400/50">ESC</span>
          </button>
        </div>
      </header>

      <!-- Success Notification Toast (Floating Top Center) -->
      <transition name="toast-pop">
        <div
          v-if="installedToast"
          class="toast-glass-bubble absolute top-18 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3.5 rounded-2xl"
        >
          <div class="toast-icon-box w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
            <v-icon color="#38bdf8" size="24">check_circle</v-icon>
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-black text-cyan-200">{{ installedToast.title }}</span>
            <span class="text-xs text-slate-300">{{ installedToast.body }}</span>
          </div>
          <v-btn
            icon
            size="x-small"
            variant="text"
            class="ml-2 text-slate-400 hover:text-white"
            @click="installedToast = null"
          >
            <v-icon size="16">close</v-icon>
          </v-btn>
        </div>
      </transition>

      <!-- MAIN BODY -->
      <main class="flex-1 flex flex-col min-h-0 px-8 py-5 max-w-7xl w-full mx-auto overflow-hidden z-10">
        <!-- 1. BROWSE MODRINTH VIEW -->
        <template v-if="currentView === 'browse'">
          <!-- Search & Filter Controls -->
          <div class="search-bar-wrap mb-4 flex flex-col gap-3">
            <div class="flex flex-wrap items-center gap-3">
              <!-- Search Box -->
              <div class="relative flex-1 min-w-[280px]">
                <v-text-field
                  v-model="searchQuery"
                  prepend-inner-icon="search"
                  :placeholder="currentTab === 'resourcepacks' ? 'Search Resource Packs (e.g. Bare Bones, Faithful, PvP, 32x, Medieval)...' : 'Search Shaders (e.g. Complementary, BSL, MakeUp, Iris, Sildurs)...'"
                  variant="solo"
                  density="comfortable"
                  rounded="xl"
                  hide-details
                  clearable
                  class="overlay-search-input"
                  @keydown.esc.stop="closeOverlay"
                />
              </div>

              <!-- Sort By Dropdown / Pills -->
              <div class="glass-segmented-pills flex items-center gap-1 p-1 rounded-xl">
                <button
                  v-for="s in sortOptions"
                  :key="s.value"
                  type="button"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  :class="selectedSort === s.value ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]' : 'text-slate-400 hover:text-white'"
                  @click="changeSort(s.value)"
                >
                  <v-icon size="13">{{ s.icon }}</v-icon>
                  <span>{{ s.label }}</span>
                </button>
              </div>

              <!-- Version Filter Toggle -->
              <button
                type="button"
                class="version-filter-chip flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer"
                :class="onlyCompatible ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200 shadow-[0_0_16px_rgba(6,182,212,0.25)]' : 'bg-slate-800/40 border-white/10 text-slate-400 hover:text-white'"
                @click="toggleVersionFilter"
              >
                <v-icon size="16" :color="onlyCompatible ? '#38bdf8' : 'slate'">filter_alt</v-icon>
                <span>Match {{ runtime.minecraft || 'Game Ver' }}</span>
                <span class="w-2 h-2 rounded-full transition-colors" :class="onlyCompatible ? 'bg-cyan-400 shadow-[0_0_8px_#38bdf8]' : 'bg-slate-600'" />
              </button>
            </div>

            <!-- Quick Category Tags Filter Strip -->
            <div class="flex items-center gap-2 overflow-x-auto py-1 custom-scrollbar">
              <span class="text-xs font-bold text-slate-400 flex items-center gap-1 pr-1 flex-shrink-0">
                <v-icon size="14">label</v-icon>
                Tags:
              </span>
              <button
                v-for="cat in activeCategories"
                :key="cat.id"
                type="button"
                class="category-chip px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border flex-shrink-0"
                :class="selectedTag === cat.id ? 'active-cat-chip' : 'inactive-cat-chip'"
                @click="toggleTag(cat.id)"
              >
                {{ cat.label }}
              </button>
            </div>

            <!-- In-Game Pro Tips Banner -->
            <div class="tips-banner-glass flex items-center justify-between text-xs px-4 py-2.5 rounded-2xl">
              <div class="flex items-center gap-2.5 text-cyan-300">
                <v-icon size="16" color="#38bdf8" class="animate-pulse">tips_and_updates</v-icon>
                <span v-if="currentTab === 'resourcepacks'">
                  In Minecraft: Press <strong class="text-white bg-cyan-950/80 px-2 py-0.5 rounded-lg border border-cyan-500/40 font-mono shadow-sm">F3 + T</strong> to reload packs instantly without restarting!
                </span>
                <span v-else>
                  In Minecraft: Go to <strong class="text-white">Video Settings > Shaders</strong> (or press <strong class="text-white bg-cyan-950/80 px-2 py-0.5 rounded-lg border border-cyan-500/40 font-mono shadow-sm">K</strong> with Iris) to switch shaders live!
                </span>
              </div>

              <!-- Shader Mod detection status badge -->
              <div v-if="currentTab === 'shaderpacks'" class="flex items-center gap-1.5">
                <span
                  v-if="detectedShaderMod"
                  class="flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                >
                  <v-icon size="13" color="#34d399">check_circle</v-icon>
                  Engine: {{ detectedShaderMod.name }} Active
                </span>
                <span
                  v-else
                  class="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/60 px-2.5 py-0.5 rounded-lg border border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]"
                >
                  <v-icon size="13" color="#fbbf24">warning</v-icon>
                  No Iris/OptiFine Detected
                </span>
              </div>
            </div>
          </div>

          <!-- Cards Content Area -->
          <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
            <!-- Loading Animation -->
            <div v-if="loading" class="overlay-loader-wrapper flex flex-col items-center justify-center h-80 gap-5">
              <div class="overlay-cyber-spinner relative flex items-center justify-center">
                <div class="loader-ring-pulse" />
                <div class="loader-arc-outer" />
                <div class="loader-arc-inner" />
                <div class="loader-center-icon flex items-center justify-center">
                  <v-icon color="#38bdf8" size="26">
                    {{ currentTab === 'resourcepacks' ? 'palette' : 'wb_sunny' }}
                  </v-icon>
                </div>
              </div>
              <div class="flex flex-col items-center gap-1.5">
                <span class="text-sm font-bold text-cyan-200 tracking-wider">
                  DISCOVERING {{ currentTab === 'resourcepacks' ? 'RESOURCE PACKS' : 'SHADERS' }}
                </span>
                <span class="text-xs text-slate-400 font-medium">Fetching highest-rated community packs from Modrinth...</span>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="items.length === 0" class="empty-state-card flex flex-col items-center justify-center h-72 gap-3 p-8 rounded-3xl text-slate-400">
              <div class="w-16 h-16 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                <v-icon size="36" color="#38bdf8">search_off</v-icon>
              </div>
              <span class="text-base font-bold text-slate-200">No packs found matching your query</span>
              <span class="text-xs text-slate-400 max-w-sm text-center">
                Try switching off "Match Version", clearing tags, or searching for other names like "Bare Bones" or "BSL".
              </span>
              <v-btn
                variant="outlined"
                color="cyan"
                size="small"
                class="header-glass-btn rounded-xl mt-2 font-bold"
                @click="resetSearchFilters"
              >
                Reset Filters
              </v-btn>
            </div>

            <!-- Cards Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-10">
              <div
                v-for="(item, index) in items"
                :key="item.project_id"
                class="pack-card group relative flex flex-col justify-between rounded-3xl overflow-hidden"
                :style="{ animationDelay: `${Math.min(index * 35, 350)}ms` }"
              >
                <!-- Card Shimmer Sweep on Hover -->
                <div class="card-shimmer-sweep pointer-events-none absolute inset-0 -z-0 opacity-0 group-hover:opacity-100" />

                <!-- Card Visual Banner (Top) -->
                <div
                  class="card-banner-wrap relative h-38 w-full overflow-hidden cursor-pointer bg-slate-950"
                  @click="openPreviewLightbox(item)"
                >
                  <img
                    v-if="getCardBanner(item)"
                    :src="getCardBanner(item)"
                    :alt="item.title"
                    class="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    loading="lazy"
                  />
                  <!-- Fallback Gradient Mesh if no banner -->
                  <div
                    v-else
                    class="w-full h-full banner-mesh-gradient flex items-center justify-center relative"
                  >
                    <v-icon size="48" color="#38bdf8" class="opacity-30">
                      {{ currentTab === 'resourcepacks' ? 'palette' : 'wb_sunny' }}
                    </v-icon>
                  </div>

                  <!-- Dark gradient vignette overlay with glass blend -->
                  <div class="card-banner-vignette absolute inset-0 pointer-events-none" />

                  <!-- Top-Left Category / Style Badge -->
                  <div class="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                    <span
                      v-if="item.categories?.[0]"
                      class="glass-badge-category px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md"
                    >
                      #{{ item.categories[0] }}
                    </span>
                    <span
                      v-if="getResolutionBadge(item)"
                      class="glass-badge-res px-2 py-0.5 rounded-full text-[10px] font-black backdrop-blur-md"
                    >
                      {{ getResolutionBadge(item) }}
                    </span>
                  </div>

                  <!-- Top-Right Compatibility Badge -->
                  <div class="absolute top-3 right-3 z-10">
                    <span
                      v-if="isCompatible(item)"
                      class="glass-badge-compat-ok px-2.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md flex items-center gap-1"
                    >
                      <v-icon size="11" color="#34d399">check</v-icon>
                      {{ runtime.minecraft || 'Compatible' }}
                    </span>
                    <span
                      v-else
                      class="glass-badge-compat-warn px-2.5 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md flex items-center gap-1"
                    >
                      <v-icon size="11" color="#fbbf24">warning</v-icon>
                      Other Ver
                    </span>
                  </div>

                  <!-- Gallery Preview Button Pill (Appears on Hover) -->
                  <div
                    v-if="item.gallery && item.gallery.length > 0"
                    class="gallery-preview-pill absolute bottom-2.5 right-3 px-2.5 py-1 rounded-xl text-[10px] font-bold backdrop-blur-md flex items-center gap-1 transition-all z-10"
                  >
                    <v-icon size="12" color="#38bdf8">photo_library</v-icon>
                    <span>{{ item.gallery.length }} Screens</span>
                  </div>
                </div>

                <!-- Card Body -->
                <div class="p-4 pt-2 flex flex-col flex-1 relative z-10">
                  <!-- Header: Icon & Title/Author -->
                  <div class="flex items-start gap-3 mb-2">
                    <!-- Overlapping Icon -->
                    <div class="relative -mt-8 flex-shrink-0 z-10">
                      <img
                        v-if="item.icon_url"
                        :src="item.icon_url"
                        :alt="item.title"
                        class="card-icon-frame w-14 h-14 rounded-2xl object-cover bg-slate-900"
                      />
                      <div
                        v-else
                        class="card-icon-frame w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center"
                      >
                        <v-icon color="#38bdf8" size="26">
                          {{ currentTab === 'resourcepacks' ? 'palette' : 'wb_sunny' }}
                        </v-icon>
                      </div>
                    </div>

                    <div class="flex-1 min-w-0 pt-0.5">
                      <h3
                        class="text-sm font-black text-white truncate group-hover:text-cyan-300 transition-colors"
                        :title="item.title"
                      >
                        {{ item.title }}
                      </h3>
                      <div class="flex items-center gap-1 text-[11px] text-slate-400 truncate">
                        <span>by</span>
                        <span class="text-cyan-300/90 font-medium">@{{ item.author }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Description -->
                  <p class="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3 flex-1">
                    {{ item.description }}
                  </p>

                  <!-- Tags -->
                  <div class="flex items-center gap-1.5 flex-wrap mb-3">
                    <span
                      v-for="cat in (item.categories || []).slice(0, 3)"
                      :key="cat"
                      class="card-sub-tag px-2 py-0.5 rounded-lg text-[10px] font-medium"
                    >
                      {{ cat }}
                    </span>
                  </div>

                  <!-- Footer: Stats & Install Action -->
                  <div class="flex items-center justify-between pt-3 border-t border-white/10 text-[11px] text-slate-400">
                    <div class="flex items-center gap-3">
                      <span class="flex items-center gap-1" title="Downloads">
                        <v-icon size="13" color="#38bdf8">download</v-icon>
                        {{ formatCount(item.downloads) }}
                      </span>
                      <span class="flex items-center gap-1" title="Followers">
                        <v-icon size="13" color="#facc15">star</v-icon>
                        {{ formatCount(item.follows) }}
                      </span>
                    </div>

                    <div class="flex items-center gap-2">
                      <!-- Screenshots Button -->
                      <v-btn
                        v-if="item.gallery && item.gallery.length > 0"
                        size="small"
                        variant="tonal"
                        color="cyan"
                        density="comfortable"
                        class="glass-icon-btn rounded-xl font-bold px-2.5"
                        title="View Screenshots"
                        @click="openPreviewLightbox(item)"
                      >
                        <v-icon size="15">visibility</v-icon>
                      </v-btn>

                      <!-- Install Button -->
                      <v-btn
                        size="small"
                        density="comfortable"
                        :loading="installingIds.includes(item.project_id)"
                        :class="isProjectInstalled(item.project_id) ? 'installed-badge-btn' : 'install-btn'"
                        class="font-black rounded-xl px-4"
                        @click="installProject(item)"
                      >
                        <template v-if="isProjectInstalled(item.project_id)">
                          <v-icon start size="14">check</v-icon>
                          Installed
                        </template>
                        <template v-else-if="!isCompatible(item)">
                          <v-icon start size="14">warning</v-icon>
                          Install
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
            </div>
          </div>
        </template>

        <!-- 2. INSTALLED IN GAME VIEW (Local Packs Manager) -->
        <template v-else>
          <div class="flex-1 flex flex-col min-h-0">
            <!-- Installed Header & Quick Controls -->
            <div class="flex items-center justify-between mb-4 px-1">
              <div class="flex items-center gap-3">
                <span class="text-sm font-black text-white">
                  {{ currentTab === 'resourcepacks' ? 'Installed Resource Packs' : 'Installed Shaders' }}
                </span>
                <span class="text-xs text-slate-400">
                  ({{ currentTab === 'resourcepacks' ? localResourcePacksCount : localShadersCount }} packs in this profile)
                </span>
              </div>

              <div class="flex items-center gap-3">
                <v-btn
                  variant="tonal"
                  color="cyan"
                  size="small"
                  class="header-glass-btn rounded-xl font-bold"
                  @click="refreshLocalPacks"
                >
                  <v-icon start size="15">refresh</v-icon>
                  <span>Reload Disk</span>
                </v-btn>
                <v-btn
                  variant="tonal"
                  color="cyan"
                  size="small"
                  class="header-glass-btn rounded-xl font-bold"
                  @click="openFolder"
                >
                  <v-icon start size="15">folder</v-icon>
                  <span>Open Folder</span>
                </v-btn>
              </div>
            </div>

            <!-- Installed Resource Packs List -->
            <div
              v-if="currentTab === 'resourcepacks'"
              class="flex-1 overflow-y-auto pr-2 custom-scrollbar"
            >
              <div v-if="localResourcePacks.length === 0" class="empty-state-card flex flex-col items-center justify-center h-64 gap-3 p-8 rounded-3xl text-slate-400">
                <v-icon size="48" color="#38bdf8" class="opacity-70">palette</v-icon>
                <span class="text-base font-bold text-slate-300">No Resource Packs Installed</span>
                <span class="text-xs text-slate-500">Switch to "Browse Modrinth" to discover and download packs with one click!</span>
                <v-btn
                  variant="elevated"
                  color="cyan"
                  size="small"
                  class="install-btn rounded-xl font-bold mt-2"
                  @click="currentView = 'browse'"
                >
                  Browse Modrinth
                </v-btn>
              </div>

              <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
                <div
                  v-for="pack in localResourcePacks"
                  :key="pack.fileName"
                  class="local-pack-row flex items-center justify-between p-4 rounded-2xl"
                  :class="{ 'is-active': pack.enabled }"
                >
                  <div class="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      v-if="pack.icon"
                      :src="pack.icon"
                      :alt="pack.name"
                      class="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-cyan-500/30 flex-shrink-0 shadow-md"
                    />
                    <div
                      v-else
                      class="w-12 h-12 rounded-xl bg-slate-800 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 shadow-md"
                    >
                      <v-icon color="#38bdf8" size="22">palette</v-icon>
                    </div>

                    <div class="flex flex-col min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-black text-white truncate">{{ pack.name || pack.fileName }}</span>
                        <span
                          v-if="pack.enabled"
                          class="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                        >
                          ACTIVE
                        </span>
                      </div>
                      <span class="text-xs text-slate-400 truncate">{{ pack.fileName }}</span>
                      <span class="text-[10px] text-cyan-300/80 font-mono">{{ getExpectedSize(pack.size || 0) }}</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-3 flex-shrink-0">
                    <v-switch
                      :model-value="pack.enabled"
                      color="cyan"
                      hide-details
                      density="compact"
                      class="custom-toggle-switch"
                      @update:model-value="toggleResourcePack(pack)"
                    />
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      color="error"
                      class="hover:bg-red-500/20 rounded-xl"
                      title="Uninstall Pack"
                      @click="uninstallResourcePack(pack)"
                    >
                      <v-icon size="18">delete</v-icon>
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>

            <!-- Installed Shaders List -->
            <div
              v-else
              class="flex-1 overflow-y-auto pr-2 custom-scrollbar"
            >
              <div v-if="localShaderPacksList.length === 0" class="empty-state-card flex flex-col items-center justify-center h-64 gap-3 p-8 rounded-3xl text-slate-400">
                <v-icon size="48" color="#38bdf8" class="opacity-70">wb_sunny</v-icon>
                <span class="text-base font-bold text-slate-300">No Shaders Installed</span>
                <span class="text-xs text-slate-500">Switch to "Browse Modrinth" to download BSL, Complementary, and more!</span>
                <v-btn
                  variant="elevated"
                  color="cyan"
                  size="small"
                  class="install-btn rounded-xl font-bold mt-2"
                  @click="currentView = 'browse'"
                >
                  Browse Shaders
                </v-btn>
              </div>

              <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
                <div
                  v-for="shader in localShaderPacksList"
                  :key="shader.fileName"
                  class="local-pack-row flex items-center justify-between p-4 rounded-2xl"
                  :class="{ 'is-active': activeShader === shader.fileName }"
                >
                  <div class="flex items-center gap-3 min-w-0 flex-1">
                    <div class="w-12 h-12 rounded-xl bg-slate-800 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 shadow-md">
                      <v-icon :color="activeShader === shader.fileName ? '#38bdf8' : 'slate'" size="24">wb_sunny</v-icon>
                    </div>

                    <div class="flex flex-col min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-black text-white truncate">{{ shader.fileName }}</span>
                        <span
                          v-if="activeShader === shader.fileName"
                          class="px-2 py-0.2 rounded text-[10px] font-black bg-cyan-500/25 text-cyan-300 border border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.35)]"
                        >
                          ACTIVE SHADER
                        </span>
                      </div>
                      <span class="text-[10px] text-cyan-300/80 font-mono">{{ getExpectedSize(shader.size || 0) }}</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 flex-shrink-0">
                    <v-btn
                      v-if="activeShader !== shader.fileName"
                      size="small"
                      variant="tonal"
                      color="cyan"
                      class="header-glass-btn rounded-xl font-bold"
                      @click="selectShader(shader.fileName)"
                    >
                      Activate
                    </v-btn>
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      color="error"
                      class="hover:bg-red-500/20 rounded-xl"
                      title="Uninstall Shader"
                      @click="uninstallShaderPack(shader)"
                    >
                      <v-icon size="18">delete</v-icon>
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </main>

      <!-- Bottom HUD Status Bar -->
      <footer class="footer-glass-bar flex-shrink-0 flex items-center justify-between px-8 py-2.5 text-xs text-slate-400 z-20">
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1.5 font-semibold text-cyan-300/80">
            <v-icon size="15">tune</v-icon>
            Minecraft {{ runtime.minecraft || 'Latest' }}
          </span>
          <span class="text-slate-600">|</span>
          <span class="flex items-center gap-1">
            <kbd class="kbd-micro-glass font-mono">F3 + T</kbd>
            <span>Reload Textures in-game</span>
          </span>
          <span class="text-slate-600">|</span>
          <span class="flex items-center gap-1">
            <kbd class="kbd-micro-glass font-mono">Ctrl + F</kbd>
            <span>Toggle Overlay</span>
          </span>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-[11px] text-cyan-300/60 font-mono">Frost Cyber-Engine v2.5</span>
        </div>
      </footer>

      <!-- SCREENSHOT / GALLERY LIGHTBOX MODAL -->
      <v-dialog
        v-model="previewLightboxVisible"
        max-width="960"
        transition="dialog-transition"
        class="in-game-preview-lightbox"
      >
        <div
          v-if="previewItem"
          class="lightbox-glass-card relative flex flex-col rounded-3xl p-6 text-white overflow-hidden"
        >
          <!-- Lightbox Header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3 min-w-0">
              <img
                v-if="previewItem.icon_url"
                :src="previewItem.icon_url"
                class="w-10 h-10 rounded-xl object-cover bg-slate-900 border border-cyan-400/40 shadow-lg"
              />
              <div class="flex flex-col min-w-0">
                <span class="text-base font-black text-white truncate">{{ previewItem.title }}</span>
                <span class="text-xs text-cyan-300">by @{{ previewItem.author }}</span>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <v-btn
                size="small"
                :loading="installingIds.includes(previewItem.project_id)"
                :class="isProjectInstalled(previewItem.project_id) ? 'installed-badge-btn' : 'install-btn'"
                class="font-black rounded-xl px-4"
                @click="installProject(previewItem)"
              >
                <template v-if="isProjectInstalled(previewItem.project_id)">
                  <v-icon start size="14">check</v-icon>
                  Installed
                </template>
                <template v-else>
                  <v-icon start size="14">get_app</v-icon>
                  Install to Game
                </template>
              </v-btn>

              <button
                type="button"
                class="w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
                @click="previewLightboxVisible = false"
              >
                <v-icon size="18">close</v-icon>
              </button>
            </div>
          </div>

          <!-- Main HD Image Viewport with Next / Prev buttons -->
          <div class="relative h-[440px] w-full rounded-2xl overflow-hidden bg-black/90 flex items-center justify-center border border-white/10 shadow-inner">
            <img
              v-if="currentPreviewImage"
              :src="currentPreviewImage"
              :alt="previewItem.title"
              class="w-full h-full object-contain"
            />
            <div v-else class="text-slate-500 text-sm">No preview image available</div>

            <!-- Left / Right arrows -->
            <button
              v-if="previewImages.length > 1"
              type="button"
              class="lightbox-arrow-btn left-4"
              @click="prevPreviewImage"
            >
              <v-icon size="20">arrow_back</v-icon>
            </button>
            <button
              v-if="previewImages.length > 1"
              type="button"
              class="lightbox-arrow-btn right-4"
              @click="nextPreviewImage"
            >
              <v-icon size="20">arrow_forward</v-icon>
            </button>

            <!-- Image counter badge -->
            <div
              v-if="previewImages.length > 1"
              class="lightbox-counter-badge absolute bottom-3 right-4 px-2.5 py-1 rounded-xl text-xs font-bold font-mono"
            >
              {{ previewImageIndex + 1 }} / {{ previewImages.length }}
            </div>
          </div>

          <!-- Thumbnails Strip -->
          <div
            v-if="previewImages.length > 1"
            class="flex items-center gap-2 mt-4 overflow-x-auto py-1 custom-scrollbar"
          >
            <button
              v-for="(img, idx) in previewImages"
              :key="img"
              type="button"
              class="relative w-20 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer"
              :class="previewImageIndex === idx ? 'border-cyan-400 scale-105 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'border-slate-800/80 opacity-60 hover:opacity-100'"
              @click="previewImageIndex = idx"
            >
              <img :src="img" class="w-full h-full object-cover" />
            </button>
          </div>

          <!-- Description Footer -->
          <div class="mt-4 pt-3 border-t border-white/10 text-xs text-slate-300">
            <p class="leading-relaxed">{{ previewItem.description }}</p>
          </div>
        </div>
      </v-dialog>
    </div>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { clientModrinthV2 } from '@/util/clients'
import { getFacatsText } from '@/composables/modrinth'
import { useService } from '@/composables'
import { injection } from '@/util/inject'
import { kInstance } from '@/composables/instance'
import { kInstances } from '@/composables/instances'
import { kInstanceResourcePacks } from '@/composables/instanceResourcePack'
import { kInstanceShaderPacks } from '@/composables/instanceShaderPack'
import { kInstanceLaunchCoordinator } from '@/composables/instanceLaunchCoordinator'
import { getExpectedSize } from '@/util/size'
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
const { path: instancePath, runtime, instance } = injection(kInstance)
const { instances } = injection(kInstances)
const resourcePacksState = injection(kInstanceResourcePacks)
const shaderPacksState = injection(kInstanceShaderPacks)
const launchCoordinator = injection(kInstanceLaunchCoordinator)

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

// Tab & View Navigation
const currentTab = ref<'resourcepacks' | 'shaderpacks'>('resourcepacks')
const currentView = ref<'browse' | 'installed'>('browse')
const searchQuery = ref('')
const loading = ref(false)
const items = ref<any[]>([])
const installingIds = ref<string[]>([])
const installedIds = ref<string[]>([])
const installedToast = ref<{ title: string; body: string } | null>(null)

// Game running status
const isGameRunning = computed(() => {
  return launchCoordinator ? launchCoordinator.isRunning(instancePath.value) : false
})

// Local Installed Packs
const localResourcePacks = computed(() => resourcePacksState?.files.value || [])
const localResourcePacksCount = computed(() => localResourcePacks.value.length)

const localShaderPacksList = computed(() => shaderPacksState?.shaderPacks.value || [])
const localShadersCount = computed(() => localShaderPacksList.value.length)
const activeShader = computed(() => shaderPacksState?.shaderPack.value)
const detectedShaderMod = computed(() => shaderPacksState?.shaderMod.value)

function isProjectInstalled(projectId: string) {
  if (installedIds.value.includes(projectId)) return true
  if (currentTab.value === 'resourcepacks') {
    return localResourcePacks.value.some(p => p.modrinth?.projectId === projectId)
  } else {
    return localShaderPacksList.value.some(s => s.modrinth?.projectId === projectId)
  }
}

// Categories & Filters
const resourcePackCategories = [
  { id: '', label: '✨ All' },
  { id: 'vanilla-like', label: '🌿 Vanilla+' },
  { id: '32x', label: '💎 32x / HD' },
  { id: '16x', label: '⚡ 16x' },
  { id: 'pvp', label: '⚔️ PvP' },
  { id: 'realistic', label: '📷 Realistic' },
  { id: 'simplistic', label: '🎨 Simplistic' },
  { id: 'medieval', label: '🏰 Medieval' },
  { id: 'gui', label: '🖥️ GUI' },
]

const shaderCategories = [
  { id: '', label: '✨ All' },
  { id: 'lightweight', label: '⚡ High FPS / Lite' },
  { id: 'realistic', label: '🎬 Realistic' },
  { id: 'fantasy', label: '🌈 Vibrant & Fantasy' },
  { id: 'vanilla-like', label: '🌤️ Vanilla Enhanced' },
  { id: 'semi-realistic', label: '🌊 Atmospheric' },
]

const activeCategories = computed(() => {
  return currentTab.value === 'resourcepacks' ? resourcePackCategories : shaderCategories
})

const selectedTag = ref('')
function toggleTag(tagId: string) {
  selectedTag.value = selectedTag.value === tagId ? '' : tagId
  fetchItems()
}

// Sort Options
const sortOptions = [
  { value: 'downloads', label: 'Popular', icon: 'local_fire_department' },
  { value: 'follows', label: 'Rating', icon: 'star' },
  { value: 'updated', label: 'Updated', icon: 'update' },
  { value: 'newest', label: 'Newest', icon: 'sparkles' },
]
const selectedSort = ref('downloads')
function changeSort(sortVal: string) {
  selectedSort.value = sortVal
  fetchItems()
}

const onlyCompatible = ref(true)
function toggleVersionFilter() {
  onlyCompatible.value = !onlyCompatible.value
  fetchItems()
}

function resetSearchFilters() {
  searchQuery.value = ''
  selectedTag.value = ''
  onlyCompatible.value = false
  fetchItems()
}

let searchDebounceTimeout: any = null
watch(searchQuery, () => {
  clearTimeout(searchDebounceTimeout)
  searchDebounceTimeout = setTimeout(() => {
    fetchItems()
  }, 320)
})

function formatCount(num: number | undefined) {
  if (!num) return '0'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

function switchTab(tab: 'resourcepacks' | 'shaderpacks') {
  currentTab.value = tab
  selectedTag.value = ''
  items.value = []
  fetchItems()
}

function isCompatible(item: any) {
  const mcVer = runtime.value.minecraft
  if (!mcVer) return true
  const gvs = item.game_versions || item.versions || []
  return gvs.some((v: string) => v === mcVer || v.startsWith(mcVer.split('.').slice(0, 2).join('.')))
}

function getCardBanner(item: any): string | undefined {
  return item.featured_gallery || item.gallery?.[0] || undefined
}

function getResolutionBadge(item: any): string | undefined {
  const cats = item.categories || []
  const res = cats.find((c: string) => /^\d+x$/.test(c))
  return res || undefined
}

async function fetchItems() {
  loading.value = true
  try {
    const projectType = currentTab.value === 'resourcepacks' ? 'resourcepack' : 'shader'
    const targetVersion = onlyCompatible.value ? (runtime.value.minecraft || '') : ''
    const categoryFilter = selectedTag.value ? [selectedTag.value] : []
    const facets = getFacatsText(targetVersion, '', categoryFilter, [], projectType, '')

    const result = await clientModrinthV2.searchProjects({
      query: searchQuery.value || '',
      index: searchQuery.value ? 'relevance' : (selectedSort.value as any),
      limit: 27,
      facets,
    })
    items.value = result.hits || []
  } catch (err) {
    console.warn('Failed to search modrinth projects in overlay:', err)
  } finally {
    loading.value = false
  }
}

// Installation Flow
async function installProject(item: any) {
  if (installingIds.value.includes(item.project_id)) return
  installingIds.value.push(item.project_id)

  try {
    const versions = await clientModrinthV2.getProjectVersions(item.project_id)
    if (!versions || versions.length === 0) {
      throw new Error('No compatible versions found on Modrinth')
    }

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
      if (resourcePacksState) {
        await resourcePacksState.revalidate()
      }
    } else {
      await shaderPackService.installFromMarket(option)
      if (shaderPacksState) {
        await shaderPacksState.revalidate()
      }
    }

    installedIds.value.push(item.project_id)
    installedToast.value = {
      title: `"${item.title}" Ready!`,
      body: currentTab.value === 'resourcepacks'
        ? 'In Minecraft: Press [F3 + T] to apply immediately, or select in Options > Resource Packs.'
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
    }, 4500)
  } finally {
    installingIds.value = installingIds.value.filter(id => id !== item.project_id)
  }
}

// Local Management Actions
async function toggleResourcePack(pack: any) {
  if (!resourcePacksState) return
  if (pack.enabled) {
    await resourcePacksState.disable([pack])
  } else {
    await resourcePacksState.enable([pack])
  }
}

async function uninstallResourcePack(pack: any) {
  const destPath = instancePath.value || instances.value?.[0]?.path
  if (!destPath) return
  await resourcePackService.uninstall({ path: destPath, files: [pack.path] })
  if (resourcePacksState) {
    await resourcePacksState.revalidate()
  }
}

function selectShader(fileName: string) {
  if (shaderPacksState) {
    shaderPacksState.shaderPack.value = fileName
  }
}

async function uninstallShaderPack(shader: any) {
  const destPath = instancePath.value || instances.value?.[0]?.path
  if (!destPath) return
  await shaderPackService.uninstall({ path: destPath, files: [shader.path] })
  if (shaderPacksState) {
    await shaderPacksState.revalidate()
  }
}

function refreshLocalPacks() {
  if (currentTab.value === 'resourcepacks') {
    resourcePacksState?.revalidate()
  } else {
    shaderPacksState?.revalidate()
  }
}

function openFolder() {
  const destPath = instancePath.value || instances.value?.[0]?.path
  if (!destPath) return
  if (currentTab.value === 'resourcepacks') {
    resourcePackService.showDirectory(destPath)
  } else {
    shaderPackService.showDirectory(destPath)
  }
}

// Lightbox / Preview Flow
const previewLightboxVisible = ref(false)
const previewItem = ref<any | null>(null)
const previewImageIndex = ref(0)

const previewImages = computed(() => {
  if (!previewItem.value) return []
  const list: string[] = []
  if (previewItem.value.featured_gallery) list.push(previewItem.value.featured_gallery)
  if (Array.isArray(previewItem.value.gallery)) {
    for (const g of previewItem.value.gallery) {
      if (typeof g === 'string' && !list.includes(g)) list.push(g)
      else if (g?.url && !list.includes(g.url)) list.push(g.url)
    }
  }
  return list
})

const currentPreviewImage = computed((): string | undefined => {
  return previewImages.value[previewImageIndex.value] || undefined
})

async function openPreviewLightbox(item: any) {
  previewItem.value = item
  previewImageIndex.value = 0
  previewLightboxVisible.value = true

  // Fetch full project for high-res images if needed
  try {
    const fullProject = await clientModrinthV2.getProject(item.project_id)
    if (fullProject && fullProject.gallery && fullProject.gallery.length > 0) {
      previewItem.value = {
        ...item,
        gallery: fullProject.gallery.map(g => g.url),
      }
    }
  } catch {
    // Ignore fetch failure and keep existing gallery
  }
}

function nextPreviewImage() {
  if (previewImages.value.length === 0) return
  previewImageIndex.value = (previewImageIndex.value + 1) % previewImages.value.length
}

function prevPreviewImage() {
  if (previewImages.value.length === 0) return
  previewImageIndex.value = (previewImageIndex.value - 1 + previewImages.value.length) % previewImages.value.length
}

// Close & Navigation
function closeOverlay() {
  if (previewLightboxVisible.value) {
    previewLightboxVisible.value = false
    return
  }
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
  if (!visible.value) return
  if (e.key === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    closeOverlay()
  } else if (previewLightboxVisible.value) {
    if (e.key === 'ArrowRight') nextPreviewImage()
    else if (e.key === 'ArrowLeft') prevPreviewImage()
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
/* Main Fullscreen Container */
.in-game-overlay-container {
  background: radial-gradient(circle at 50% 0%, rgba(10, 18, 38, 0.84) 0%, rgba(5, 9, 20, 0.92) 100%);
  -webkit-backdrop-filter: blur(48px) saturate(210%);
  backdrop-filter: blur(48px) saturate(210%);
}

/* Dynamic Ambient Glass Backdrop */
.overlay-glass-bg {
  background: radial-gradient(circle at 50% 15%, rgba(14, 165, 233, 0.16), transparent 65%),
              radial-gradient(circle at 85% 85%, rgba(6, 182, 212, 0.12), transparent 60%),
              radial-gradient(circle at 15% 75%, rgba(99, 102, 241, 0.10), transparent 55%);
}

/* Floating Ambient Orbs */
.ambient-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(100px);
  pointer-events: none;
  z-index: -10;
  will-change: transform, opacity;
}

.ambient-orb-1 {
  width: 550px;
  height: 550px;
  top: -140px;
  left: -100px;
  background: rgba(6, 182, 212, 0.28);
  animation: float-orb-1 14s ease-in-out infinite alternate;
}

.ambient-orb-2 {
  width: 600px;
  height: 600px;
  bottom: -160px;
  right: -100px;
  background: rgba(99, 102, 241, 0.24);
  animation: float-orb-2 18s ease-in-out infinite alternate;
}

.ambient-orb-3 {
  width: 450px;
  height: 450px;
  top: 35%;
  left: 55%;
  background: rgba(14, 165, 233, 0.20);
  animation: float-orb-3 16s ease-in-out infinite alternate;
}

.ambient-orb-4 {
  width: 420px;
  height: 420px;
  top: 10%;
  right: 15%;
  background: rgba(52, 211, 153, 0.14);
  animation: float-orb-4 20s ease-in-out infinite alternate;
}

/* Aurora Light Sweep */
.aurora-beam {
  position: absolute;
  top: 0;
  left: -10%;
  right: -10%;
  height: 360px;
  background: radial-gradient(ellipse at 50% 0%, rgba(56, 189, 248, 0.20) 0%, rgba(14, 165, 233, 0.08) 50%, transparent 80%);
  pointer-events: none;
  z-index: -9;
  animation: auroraWave 12s ease-in-out infinite alternate;
}

/* Frosted Noise Overlay */
.overlay-glass-noise {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
  background-repeat: repeat;
  z-index: -8;
}

.overlay-mesh-pattern {
  background-image: radial-gradient(rgba(56, 189, 248, 0.16) 1.2px, transparent 1.2px);
  background-size: 28px 28px;
}

/* Brand Frost Icon Animation */
.brand-frost-icon {
  animation: brandGlowPulse 4s ease-in-out infinite;
}

/* Header & Tabs */
.category-tabs-container {
  background: rgba(8, 15, 32, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.4), 0 2px 10px rgba(0, 0, 0, 0.2);
}

.active-tab {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.38) 0%, rgba(14, 165, 233, 0.24) 100%);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.65);
  border-top: 1px solid rgba(186, 230, 253, 0.85);
  box-shadow: 0 0 22px rgba(6, 182, 212, 0.42), inset 0 1px 1px rgba(255, 255, 255, 0.35);
  text-shadow: 0 0 12px rgba(56, 189, 248, 0.5);
}

.inactive-tab {
  color: #94a3b8;
  border: 1px solid transparent;
}
.inactive-tab:hover {
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.08);
}

.view-mode-container {
  background: rgba(8, 15, 32, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.active-view-btn {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.28) 0%, rgba(14, 165, 233, 0.18) 100%);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.55);
  border-top: 1px solid rgba(186, 230, 253, 0.75);
  box-shadow: 0 0 16px rgba(6, 182, 212, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.inactive-view-btn {
  color: #94a3b8;
  border: 1px solid transparent;
}
.inactive-view-btn:hover {
  color: #f8fafc;
  background: rgba(255, 255, 255, 0.06);
}

.header-glass-btn {
  background: rgba(14, 165, 233, 0.12) !important;
  border: 1px solid rgba(56, 189, 248, 0.3) !important;
  backdrop-filter: blur(12px) !important;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
}
.header-glass-btn:hover {
  background: rgba(14, 165, 233, 0.25) !important;
  border-color: rgba(56, 189, 248, 0.6) !important;
  box-shadow: 0 0 18px rgba(6, 182, 212, 0.35) !important;
  transform: translateY(-1px);
}

/* Search Bar Glassmorphism */
.overlay-search-input :deep(.v-field) {
  background: rgba(11, 20, 38, 0.65) !important;
  backdrop-filter: blur(24px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(24px) saturate(180%) !important;
  border: 1px solid rgba(56, 189, 248, 0.25) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.1) !important;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.overlay-search-input :deep(.v-field--focused) {
  border-color: rgba(56, 189, 248, 0.85) !important;
  border-top-color: rgba(186, 230, 253, 0.95) !important;
  box-shadow: 0 0 35px rgba(6, 182, 212, 0.45), 0 12px 40px rgba(0, 0, 0, 0.5), inset 0 1px 2px rgba(255, 255, 255, 0.3) !important;
  transform: translateY(-1px);
}

.glass-segmented-pills {
  background: rgba(10, 18, 36, 0.65);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top: 1px solid rgba(255, 255, 255, 0.18);
}

.version-filter-chip {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.version-filter-chip:hover {
  transform: translateY(-1px);
}

/* Category Chips */
.category-chip {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.active-cat-chip {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.32) 0%, rgba(14, 165, 233, 0.22) 100%);
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.75);
  border-top-color: rgba(186, 230, 253, 0.9);
  box-shadow: 0 0 16px rgba(6, 182, 212, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transform: translateY(-1.5px);
}
.inactive-cat-chip {
  background: rgba(12, 22, 42, 0.55);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: #94a3b8;
  border-color: rgba(255, 255, 255, 0.08);
}
.inactive-cat-chip:hover {
  color: #f8fafc;
  background: rgba(20, 36, 68, 0.75);
  border-color: rgba(56, 189, 248, 0.45);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

/* Pro Tips Banner */
.tips-banner-glass {
  background: linear-gradient(90deg, rgba(14, 165, 233, 0.14) 0%, rgba(6, 182, 212, 0.08) 50%, rgba(15, 23, 42, 0.65) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-top: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
}

/* Custom Cyber-Frost Loader */
.overlay-cyber-spinner {
  width: 76px;
  height: 76px;
}
.loader-ring-pulse {
  position: absolute;
  inset: -6px;
  border-radius: 9999px;
  border: 1px solid rgba(56, 189, 248, 0.35);
  box-shadow: 0 0 25px rgba(6, 182, 212, 0.3);
  animation: brandGlowPulse 2.5s ease-in-out infinite;
}
.loader-arc-outer {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  border: 3px solid transparent;
  border-top-color: #38bdf8;
  border-right-color: #06b6d4;
  animation: loaderSpinArc 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}
.loader-arc-inner {
  position: absolute;
  inset: 10px;
  border-radius: 9999px;
  border: 2.5px solid transparent;
  border-bottom-color: #818cf8;
  border-left-color: #38bdf8;
  animation: loaderSpinArcRev 1.6s cubic-bezier(0.5, 0, 0.5, 1) infinite;
}
.loader-center-icon {
  animation: loaderCenterFloat 2s ease-in-out infinite;
}

/* Empty State Card */
.empty-state-card {
  background: linear-gradient(145deg, rgba(13, 23, 46, 0.6) 0%, rgba(8, 15, 30, 0.45) 100%);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.5);
}

/* Pack Cards Grid & Glassmorphism */
.pack-card {
  animation: cardCascadeIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) backwards;
  background: linear-gradient(145deg, rgba(13, 23, 46, 0.72) 0%, rgba(8, 15, 30, 0.55) 100%);
  -webkit-backdrop-filter: blur(28px) saturate(190%);
  backdrop-filter: blur(28px) saturate(190%);
  border: 1px solid rgba(56, 189, 248, 0.18);
  border-top: 1px solid rgba(255, 255, 255, 0.24);
  box-shadow: 0 12px 35px -8px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.35s cubic-bezier(0.16, 1, 0.3, 1),
              background 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.pack-card:hover {
  transform: translateY(-7px) scale(1.012);
  background: linear-gradient(145deg, rgba(16, 30, 60, 0.85) 0%, rgba(10, 20, 42, 0.72) 100%);
  border-color: rgba(56, 189, 248, 0.6);
  border-top-color: rgba(186, 230, 253, 0.9);
  box-shadow: 0 25px 50px -10px rgba(6, 182, 212, 0.35),
              0 0 30px rgba(56, 189, 248, 0.18),
              inset 0 1px 1px rgba(255, 255, 255, 0.35);
}

/* Card Diagonal Shimmer Sweep */
.card-shimmer-sweep {
  background: linear-gradient(110deg, transparent 20%, rgba(255, 255, 255, 0.12) 50%, transparent 80%);
  transform: translateX(-100%);
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.pack-card:hover .card-shimmer-sweep {
  transform: translateX(100%);
}

.card-banner-vignette {
  background: linear-gradient(to top, rgba(9, 16, 32, 0.95) 0%, rgba(9, 16, 32, 0.35) 45%, transparent 100%);
}

.banner-mesh-gradient {
  background: linear-gradient(135deg, #091a2e 0%, #0d2847 50%, #081626 100%);
}

/* Card Badges */
.glass-badge-category {
  background: rgba(6, 12, 24, 0.85);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.4);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.glass-badge-res {
  background: rgba(14, 165, 233, 0.25);
  color: #e0f2fe;
  border: 1px solid rgba(56, 189, 248, 0.55);
  box-shadow: 0 2px 8px rgba(6, 182, 212, 0.3);
}

.glass-badge-compat-ok {
  background: rgba(6, 78, 59, 0.85);
  color: #6ee7b7;
  border: 1px solid rgba(52, 211, 153, 0.55);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.glass-badge-compat-warn {
  background: rgba(120, 53, 15, 0.85);
  color: #fde68a;
  border: 1px solid rgba(245, 158, 11, 0.55);
}

.gallery-preview-pill {
  background: rgba(8, 15, 30, 0.85);
  color: #bae6fd;
  border: 1px solid rgba(56, 189, 248, 0.45);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

/* Overlapping Icon Frame */
.card-icon-frame {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.25);
  border: 2px solid rgba(56, 189, 248, 0.45);
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.35s ease, box-shadow 0.35s ease;
}
.pack-card:hover .card-icon-frame {
  transform: scale(1.06) translateY(-2px);
  border-color: rgba(56, 189, 248, 0.85);
  box-shadow: 0 10px 28px rgba(6, 182, 212, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.4);
}

.card-sub-tag {
  background: rgba(15, 25, 48, 0.7);
  backdrop-filter: blur(8px);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.glass-icon-btn {
  background: rgba(14, 165, 233, 0.15) !important;
  border: 1px solid rgba(56, 189, 248, 0.35) !important;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
}
.glass-icon-btn:hover {
  background: rgba(14, 165, 233, 0.3) !important;
  border-color: rgba(56, 189, 248, 0.7) !important;
  box-shadow: 0 0 16px rgba(6, 182, 212, 0.4) !important;
  transform: translateY(-1px);
}

/* Install Button States */
.install-btn {
  background: linear-gradient(135deg, #0284c7 0%, #06b6d4 100%) !important;
  box-shadow: 0 4px 18px rgba(6, 182, 212, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.35) !important;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
  color: #ffffff !important;
}
.install-btn:hover {
  background: linear-gradient(135deg, #0ea5e9 0%, #22d3ee 100%) !important;
  box-shadow: 0 6px 26px rgba(6, 182, 212, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.45) !important;
  transform: translateY(-1.5px);
}
.install-btn:active {
  transform: translateY(0.5px) scale(0.98);
}

.installed-badge-btn {
  background: linear-gradient(135deg, rgba(5, 150, 105, 0.25) 0%, rgba(16, 185, 129, 0.35) 100%) !important;
  border: 1px solid rgba(52, 211, 153, 0.6) !important;
  box-shadow: 0 0 16px rgba(16, 185, 129, 0.3) !important;
  color: #6ee7b7 !important;
}

/* Local Installed Items */
.local-pack-row {
  background: linear-gradient(145deg, rgba(13, 23, 46, 0.68) 0%, rgba(8, 15, 30, 0.52) 100%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.local-pack-row:hover {
  transform: translateY(-3px);
  border-color: rgba(56, 189, 248, 0.45);
  box-shadow: 0 14px 35px rgba(6, 182, 212, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
.local-pack-row.is-active {
  border-color: rgba(56, 189, 248, 0.7);
  border-top-color: rgba(186, 230, 253, 0.9);
  background: linear-gradient(145deg, rgba(14, 165, 233, 0.2) 0%, rgba(8, 25, 52, 0.65) 100%);
  box-shadow: 0 0 30px rgba(6, 182, 212, 0.28), 0 12px 30px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.25);
}

/* Footer Status Bar */
.footer-glass-bar {
  background: linear-gradient(180deg, rgba(6, 12, 26, 0.75) 0%, rgba(3, 7, 16, 0.85) 100%);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-top: 1px solid rgba(56, 189, 248, 0.2);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.kbd-micro-glass {
  font-size: 10px;
  background: rgba(15, 25, 48, 0.8);
  padding: 2px 6px;
  border-radius: 6px;
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #e2e8f0;
}

/* Screenshots Lightbox */
.lightbox-glass-card {
  animation: lightboxModalIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  background: linear-gradient(160deg, rgba(10, 18, 36, 0.94) 0%, rgba(5, 9, 20, 0.9) 100%);
  backdrop-filter: blur(50px) saturate(200%);
  -webkit-backdrop-filter: blur(50px) saturate(200%);
  border: 1.5px solid rgba(56, 189, 248, 0.4);
  border-top: 1.5px solid rgba(186, 230, 253, 0.85);
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.9), 0 0 50px rgba(6, 182, 212, 0.25);
}

.lightbox-arrow-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 9999px;
  background: rgba(11, 20, 40, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(56, 189, 248, 0.5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.6);
}
.lightbox-arrow-btn:hover {
  background: rgba(6, 182, 212, 0.45);
  border-color: #38bdf8;
  box-shadow: 0 0 25px rgba(6, 182, 212, 0.6);
  transform: translateY(-50%) scale(1.1);
}

.lightbox-counter-badge {
  background: rgba(0, 0, 0, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: #e0f2fe;
}

/* Floating Toast */
.toast-glass-bubble {
  animation: toastBounceIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  background: linear-gradient(145deg, rgba(10, 20, 42, 0.94) 0%, rgba(5, 12, 28, 0.9) 100%);
  -webkit-backdrop-filter: blur(36px) saturate(200%);
  backdrop-filter: blur(36px) saturate(200%);
  border: 1.5px solid rgba(56, 189, 248, 0.75);
  border-top: 1.5px solid rgba(186, 230, 253, 0.95);
  box-shadow: 0 20px 60px rgba(6, 182, 212, 0.45), 0 0 35px rgba(56, 189, 248, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.4);
}
.toast-icon-box {
  background: rgba(14, 165, 233, 0.2);
  border: 1px solid rgba(56, 189, 248, 0.5);
  box-shadow: 0 0 18px rgba(6, 182, 212, 0.35);
}

/* Keyframe Animations */
@keyframes float-orb-1 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.28;
  }
  50% {
    transform: translate(55px, 40px) scale(1.12);
    opacity: 0.38;
  }
}

@keyframes float-orb-2 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.24;
  }
  50% {
    transform: translate(-50px, -55px) scale(1.1);
    opacity: 0.34;
  }
}

@keyframes float-orb-3 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.20;
  }
  50% {
    transform: translate(40px, -45px) scale(1.15);
    opacity: 0.30;
  }
}

@keyframes float-orb-4 {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.14;
  }
  50% {
    transform: translate(-35px, 30px) scale(1.08);
    opacity: 0.24;
  }
}

@keyframes auroraWave {
  0% {
    transform: translateX(-4%) skewX(-4deg);
    opacity: 0.65;
  }
  50% {
    transform: translateX(4%) skewX(4deg);
    opacity: 0.95;
  }
  100% {
    transform: translateX(-4%) skewX(-4deg);
    opacity: 0.65;
  }
}

@keyframes brandGlowPulse {
  0%, 100% {
    box-shadow: 0 0 16px rgba(6, 182, 212, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.3);
    border-color: rgba(56, 189, 248, 0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(56, 189, 248, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.5);
    border-color: rgba(125, 211, 252, 0.85);
  }
}

@keyframes cardCascadeIn {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.97);
    filter: blur(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes toastBounceIn {
  0% {
    opacity: 0;
    transform: translate(-50%, -24px) scale(0.9);
  }
  60% {
    opacity: 1;
    transform: translate(-50%, 4px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translate(-50%, 0) scale(1);
  }
}

@keyframes loaderSpinArc {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes loaderSpinArcRev {
  0% { transform: rotate(360deg); }
  100% { transform: rotate(0deg); }
}

@keyframes loaderCenterFloat {
  0%, 100% { transform: scale(0.92); opacity: 0.8; }
  50% { transform: scale(1.08); opacity: 1; }
}

@keyframes lightboxModalIn {
  from {
    opacity: 0;
    transform: scale(0.94);
    filter: blur(8px);
  }
  to {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
}

@keyframes pulseGreen {
  0% { transform: scale(0.9); opacity: 0.7; box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.7); }
  70% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 0 6px rgba(52, 211, 153, 0); }
  100% { transform: scale(0.9); opacity: 0.7; box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
}
</style>
