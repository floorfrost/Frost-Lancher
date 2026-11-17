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
      <div class="overlay-mesh-pattern absolute inset-0 -z-10 opacity-30" />

      <!-- Top HUD Header -->
      <header class="flex-shrink-0 flex items-center justify-between px-8 py-3.5 border-b border-cyan-500/20 bg-slate-950/75 backdrop-blur-2xl z-20">
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
          <div class="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-2xl border border-cyan-500/30 shadow-inner">
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
          <div class="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-700/60">
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
            class="rounded-xl font-bold flex items-center gap-1"
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
            class="rounded-xl font-bold"
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
      <transition name="slide-y-transition">
        <div
          v-if="installedToast"
          class="absolute top-18 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3.5 rounded-2xl bg-slate-900/95 border-2 border-cyan-400/80 shadow-[0_12px_50px_rgba(6,182,212,0.45)] backdrop-blur-2xl"
        >
          <div class="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center flex-shrink-0">
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
              <div class="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-700/60">
                <button
                  v-for="s in sortOptions"
                  :key="s.value"
                  type="button"
                  class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  :class="selectedSort === s.value ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/40' : 'text-slate-400 hover:text-white'"
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
                :class="onlyCompatible ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200' : 'bg-slate-800/60 border-slate-700 text-slate-400'"
                @click="toggleVersionFilter"
              >
                <v-icon size="16" :color="onlyCompatible ? '#38bdf8' : 'slate'">filter_alt</v-icon>
                <span>Match {{ runtime.minecraft || 'Game Ver' }}</span>
                <span class="w-2 h-2 rounded-full" :class="onlyCompatible ? 'bg-cyan-400' : 'bg-slate-600'" />
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
            <div class="flex items-center justify-between text-xs px-4 py-2 rounded-xl bg-slate-900/60 border border-cyan-500/20 backdrop-blur-md">
              <div class="flex items-center gap-2 text-cyan-300">
                <v-icon size="16" color="#38bdf8">tips_and_updates</v-icon>
                <span v-if="currentTab === 'resourcepacks'">
                  In Minecraft: Press <strong class="text-white bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30">F3 + T</strong> to reload packs instantly!
                </span>
                <span v-else>
                  In Minecraft: Go to <strong class="text-white">Video Settings > Shaders</strong> (or press <strong class="text-white bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30">K</strong> with Iris) to select your shader!
                </span>
              </div>

              <!-- Shader Mod detection status badge -->
              <div v-if="currentTab === 'shaderpacks'" class="flex items-center gap-1.5">
                <span
                  v-if="detectedShaderMod"
                  class="flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-500/30"
                >
                  <v-icon size="13" color="#34d399">check_circle</v-icon>
                  Engine: {{ detectedShaderMod.name }} Active
                </span>
                <span
                  v-else
                  class="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-500/30"
                >
                  <v-icon size="13" color="#fbbf24">warning</v-icon>
                  No Iris/OptiFine Detected
                </span>
              </div>
            </div>
          </div>

          <!-- Cards Content Area -->
          <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar relative">
            <!-- Loading Spinner -->
            <div v-if="loading" class="flex flex-col items-center justify-center h-72 gap-4">
              <v-progress-circular indeterminate color="#38bdf8" size="52" width="3.5" />
              <span class="text-sm text-cyan-200/90 font-semibold tracking-wide">
                Searching top packs from Modrinth...
              </span>
            </div>

            <!-- Empty State -->
            <div v-else-if="items.length === 0" class="flex flex-col items-center justify-center h-72 gap-3 text-slate-400">
              <div class="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center">
                <v-icon size="36" color="#94a3b8">search_off</v-icon>
              </div>
              <span class="text-base font-bold text-slate-200">No packs found matching your query</span>
              <span class="text-xs text-slate-400 max-w-sm text-center">
                Try switching off "Match Version", clearing tags, or searching for other names like "Bare Bones" or "BSL".
              </span>
              <v-btn
                variant="outlined"
                color="cyan"
                size="small"
                class="rounded-xl mt-2"
                @click="resetSearchFilters"
              >
                Reset Filters
              </v-btn>
            </div>

            <!-- Cards Grid -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-10">
              <div
                v-for="item in items"
                :key="item.project_id"
                class="pack-card group relative flex flex-col justify-between rounded-3xl bg-slate-900/70 border border-slate-700/60 hover:border-cyan-400/60 hover:bg-slate-900/95 transition-all duration-300 overflow-hidden"
              >
                <!-- Card Visual Banner (Top) -->
                <div
                  class="card-banner-wrap relative h-36 w-full overflow-hidden cursor-pointer bg-slate-950"
                  @click="openPreviewLightbox(item)"
                >
                  <img
                    v-if="getCardBanner(item)"
                    :src="getCardBanner(item)"
                    :alt="item.title"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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

                  <!-- Dark gradient vignette overlay -->
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/40 pointer-events-none" />

                  <!-- Top-Left Category / Style Badge -->
                  <div class="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                    <span
                      v-if="item.categories?.[0]"
                      class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-950/80 text-cyan-300 border border-cyan-500/30 backdrop-blur-md"
                    >
                      #{{ item.categories[0] }}
                    </span>
                    <span
                      v-if="getResolutionBadge(item)"
                      class="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-950/80 text-cyan-200 border border-cyan-400/40 backdrop-blur-md"
                    >
                      {{ getResolutionBadge(item) }}
                    </span>
                  </div>

                  <!-- Top-Right Compatibility Badge -->
                  <div class="absolute top-3 right-3 z-10">
                    <span
                      v-if="isCompatible(item)"
                      class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 backdrop-blur-md flex items-center gap-1"
                    >
                      <v-icon size="11" color="#34d399">check</v-icon>
                      {{ runtime.minecraft || 'Compatible' }}
                    </span>
                    <span
                      v-else
                      class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/90 text-amber-300 border border-amber-500/50 backdrop-blur-md flex items-center gap-1"
                    >
                      <v-icon size="11" color="#fbbf24">warning</v-icon>
                      Other Ver
                    </span>
                  </div>

                  <!-- Gallery Preview Button Pill (Appears on Hover) -->
                  <div
                    v-if="item.gallery && item.gallery.length > 0"
                    class="gallery-preview-pill absolute bottom-2.5 right-3 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-950/85 text-cyan-200 border border-cyan-400/40 backdrop-blur-md flex items-center gap-1 transition-opacity opacity-80 group-hover:opacity-100 z-10"
                  >
                    <v-icon size="12" color="#38bdf8">photo_library</v-icon>
                    <span>{{ item.gallery.length }} Screens</span>
                  </div>
                </div>

                <!-- Card Body -->
                <div class="p-4 pt-2 flex flex-col flex-1">
                  <!-- Header: Icon & Title/Author -->
                  <div class="flex items-start gap-3 mb-2">
                    <!-- Overlapping Icon -->
                    <div class="relative -mt-7 flex-shrink-0 z-10">
                      <img
                        v-if="item.icon_url"
                        :src="item.icon_url"
                        :alt="item.title"
                        class="w-13 h-13 rounded-2xl object-cover bg-slate-900 border-2 border-cyan-400/40 shadow-lg"
                      />
                      <div
                        v-else
                        class="w-13 h-13 rounded-2xl bg-slate-800 border-2 border-cyan-400/40 shadow-lg flex items-center justify-center"
                      >
                        <v-icon color="#38bdf8" size="24">
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
                      class="px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700/60"
                    >
                      {{ cat }}
                    </span>
                  </div>

                  <!-- Footer: Stats & Install Action -->
                  <div class="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
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
                        class="rounded-xl font-bold px-2.5"
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
                        :color="isProjectInstalled(item.project_id) ? 'success' : isCompatible(item) ? 'primary' : 'warning'"
                        class="install-btn font-black rounded-xl px-4"
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
                  class="rounded-xl font-bold"
                  @click="refreshLocalPacks"
                >
                  <v-icon start size="15">refresh</v-icon>
                  <span>Reload Disk</span>
                </v-btn>
                <v-btn
                  variant="tonal"
                  color="cyan"
                  size="small"
                  class="rounded-xl font-bold"
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
              <div v-if="localResourcePacks.length === 0" class="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
                <v-icon size="48" color="slate">palette</v-icon>
                <span class="text-base font-bold text-slate-300">No Resource Packs Installed</span>
                <span class="text-xs text-slate-500">Switch to "Browse Modrinth" to discover and download packs with one click!</span>
                <v-btn
                  variant="elevated"
                  color="cyan"
                  size="small"
                  class="rounded-xl font-bold mt-2"
                  @click="currentView = 'browse'"
                >
                  Browse Modrinth
                </v-btn>
              </div>

              <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
                <div
                  v-for="pack in localResourcePacks"
                  :key="pack.fileName"
                  class="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-700/60 hover:border-cyan-500/40 transition-all"
                >
                  <div class="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      v-if="pack.icon"
                      :src="pack.icon"
                      :alt="pack.name"
                      class="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-cyan-500/20 flex-shrink-0"
                    />
                    <div
                      v-else
                      class="w-12 h-12 rounded-xl bg-slate-800 border border-cyan-500/20 flex items-center justify-center flex-shrink-0"
                    >
                      <v-icon color="#38bdf8" size="22">palette</v-icon>
                    </div>

                    <div class="flex flex-col min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-black text-white truncate">{{ pack.name || pack.fileName }}</span>
                        <span
                          v-if="pack.enabled"
                          class="px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                        >
                          ACTIVE
                        </span>
                      </div>
                      <span class="text-xs text-slate-400 truncate">{{ pack.fileName }}</span>
                      <span class="text-[10px] text-cyan-300/70 font-mono">{{ getExpectedSize(pack.size || 0) }}</span>
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
              <div v-if="localShaderPacksList.length === 0" class="flex flex-col items-center justify-center h-64 gap-3 text-slate-400">
                <v-icon size="48" color="slate">wb_sunny</v-icon>
                <span class="text-base font-bold text-slate-300">No Shaders Installed</span>
                <span class="text-xs text-slate-500">Switch to "Browse Modrinth" to download BSL, Complementary, and more!</span>
                <v-btn
                  variant="elevated"
                  color="cyan"
                  size="small"
                  class="rounded-xl font-bold mt-2"
                  @click="currentView = 'browse'"
                >
                  Browse Shaders
                </v-btn>
              </div>

              <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
                <div
                  v-for="shader in localShaderPacksList"
                  :key="shader.fileName"
                  class="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border transition-all"
                  :class="activeShader === shader.fileName ? 'border-cyan-400/80 bg-cyan-950/20 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'border-slate-700/60'"
                >
                  <div class="flex items-center gap-3 min-w-0 flex-1">
                    <div class="w-12 h-12 rounded-xl bg-slate-800 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                      <v-icon :color="activeShader === shader.fileName ? '#38bdf8' : 'slate'" size="24">wb_sunny</v-icon>
                    </div>

                    <div class="flex flex-col min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-black text-white truncate">{{ shader.fileName }}</span>
                        <span
                          v-if="activeShader === shader.fileName"
                          class="px-2 py-0.2 rounded text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-400/50"
                        >
                          ACTIVE SHADER
                        </span>
                      </div>
                      <span class="text-[10px] text-cyan-300/70 font-mono">{{ getExpectedSize(shader.size || 0) }}</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 flex-shrink-0">
                    <v-btn
                      v-if="activeShader !== shader.fileName"
                      size="small"
                      variant="tonal"
                      color="cyan"
                      class="rounded-xl font-bold"
                      @click="selectShader(shader.fileName)"
                    >
                      Activate
                    </v-btn>
                    <v-btn
                      icon
                      size="small"
                      variant="text"
                      color="error"
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
      <footer class="flex-shrink-0 flex items-center justify-between px-8 py-2.5 border-t border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl text-xs text-slate-400 z-20">
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1.5 font-semibold text-cyan-300/80">
            <v-icon size="15">tune</v-icon>
            Minecraft {{ runtime.minecraft || 'Latest' }}
          </span>
          <span class="text-slate-600">|</span>
          <span class="flex items-center gap-1">
            <kbd class="map-kbd text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">F3 + T</kbd>
            <span>Reload Textures in-game</span>
          </span>
          <span class="text-slate-600">|</span>
          <span class="flex items-center gap-1">
            <kbd class="map-kbd text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">Ctrl + F</kbd>
            <span>Toggle Overlay</span>
          </span>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-[11px] text-slate-400">Frost Engine v2.0</span>
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
          class="relative flex flex-col rounded-3xl bg-slate-950/95 border-2 border-cyan-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-3xl overflow-hidden p-6 text-white"
        >
          <!-- Lightbox Header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3 min-w-0">
              <img
                v-if="previewItem.icon_url"
                :src="previewItem.icon_url"
                class="w-10 h-10 rounded-xl object-cover bg-slate-900 border border-cyan-400/40"
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
                :color="isProjectInstalled(previewItem.project_id) ? 'success' : 'primary'"
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
                class="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
                @click="previewLightboxVisible = false"
              >
                <v-icon size="18">close</v-icon>
              </button>
            </div>
          </div>

          <!-- Main HD Image Viewport with Next / Prev buttons -->
          <div class="relative h-[440px] w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-slate-800">
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
              class="absolute bottom-3 right-4 px-2.5 py-1 rounded-xl text-xs font-bold bg-black/70 border border-white/20 backdrop-blur-md"
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
              :class="previewImageIndex === idx ? 'border-cyan-400 scale-105 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'border-slate-800 opacity-60 hover:opacity-100'"
              @click="previewImageIndex = idx"
            >
              <img :src="img" class="w-full h-full object-cover" />
            </button>
          </div>

          <!-- Description Footer -->
          <div class="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-300">
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
.in-game-overlay-container {
  background: rgba(6, 10, 20, 0.94);
}

.overlay-glass-bg {
  background: radial-gradient(circle at 50% 20%, rgba(14, 165, 233, 0.12), transparent 70%),
              radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.08), transparent 60%);
  backdrop-filter: blur(36px);
}

/* Ambient Glowing Orbs */
.ambient-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(90px);
  pointer-events: none;
  z-index: -10;
}
.ambient-orb-1 {
  width: 450px;
  height: 450px;
  top: -120px;
  left: -80px;
  background: rgba(6, 182, 212, 0.22);
}
.ambient-orb-2 {
  width: 500px;
  height: 500px;
  bottom: -150px;
  right: -80px;
  background: rgba(99, 102, 241, 0.18);
}
.ambient-orb-3 {
  width: 380px;
  height: 380px;
  top: 40%;
  left: 60%;
  background: rgba(14, 165, 233, 0.14);
}

.overlay-mesh-pattern {
  background-image: radial-gradient(rgba(56, 189, 248, 0.15) 1px, transparent 1px);
  background-size: 28px 28px;
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
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.35), rgba(14, 165, 233, 0.2));
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.5);
  box-shadow: 0 0 16px rgba(6, 182, 212, 0.35);
}

.inactive-tab {
  color: #94a3b8;
  border: 1px solid transparent;
}
.inactive-tab:hover {
  color: #f1f5f9;
  background: rgba(255, 255, 255, 0.05);
}

.active-view-btn {
  background: rgba(56, 189, 248, 0.2);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.4);
}
.inactive-view-btn {
  color: #94a3b8;
}
.inactive-view-btn:hover {
  color: #f1f5f9;
}

.kbd-micro {
  font-size: 9px;
  background: rgba(0, 0, 0, 0.5);
  padding: 1px 5px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Category Chips */
.active-cat-chip {
  background: rgba(6, 182, 212, 0.25);
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.6);
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.25);
}
.inactive-cat-chip {
  background: rgba(15, 23, 42, 0.6);
  color: #94a3b8;
  border-color: rgba(51, 65, 85, 0.6);
}
.inactive-cat-chip:hover {
  color: #f1f5f9;
  border-color: rgba(56, 189, 248, 0.3);
}

/* Card Styling */
.pack-card {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
}
.pack-card:hover {
  box-shadow: 0 16px 40px rgba(6, 182, 212, 0.22);
}

.banner-mesh-gradient {
  background: linear-gradient(135deg, #091a2e 0%, #0d2847 50%, #081626 100%);
}

.overlay-search-input :deep(.v-field) {
  background: rgba(15, 23, 42, 0.85) !important;
  border: 1px solid rgba(56, 189, 248, 0.3) !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4) !important;
}

.overlay-search-input :deep(.v-field--focused) {
  border-color: #38bdf8 !important;
  box-shadow: 0 0 25px rgba(56, 189, 248, 0.35) !important;
}

/* Lightbox Arrows */
.lightbox-arrow-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}
.lightbox-arrow-btn:hover {
  background: rgba(6, 182, 212, 0.4);
  border-color: #38bdf8;
  transform: translateY(-50%) scale(1.08);
}
</style>
