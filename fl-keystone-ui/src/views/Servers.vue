<template>
  <div
    data-testid="servers-page"
    class="servers-page h-full w-full flex flex-col overflow-y-auto custom-scrollbar select-none px-6 py-6"
  >
    <!-- Header / Banner Area -->
    <div class="servers-header aurora-header relative overflow-hidden rounded-2xl p-6 mb-6 border border-cyan-500/20 shadow-xl backdrop-blur-md">
      <!-- Decorative ambient glow -->
      <div class="absolute -right-12 -top-12 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div class="absolute -left-12 -bottom-12 w-56 h-56 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div class="relative z-1 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3 mb-2 flex-wrap">
            <div class="frost-server-icon-wrap flex items-center justify-center w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-400/40 shadow-lg shadow-cyan-500/30 text-cyan-300">
              <v-icon size="26">dns</v-icon>
            </div>
            <h1 class="text-2xl sm:text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-400 drop-shadow-md">
              {{ t('servers.title') }}
            </h1>
            <span class="frost-live-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm shadow-cyan-500/20">
              <span class="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              Multiplayer Network
            </span>

            <!-- Active Instance Pill -->
            <v-chip
              v-if="instance?.name"
              size="x-small"
              color="cyan"
              variant="tonal"
              class="font-medium tracking-wide flex items-center gap-1 cursor-pointer hover:bg-cyan-500/20"
              @click="openProfilePickerForActive"
            >
              <v-icon start size="12">sports_esports</v-icon>
              <span>{{ instance.name }}</span>
              <span v-if="instance.runtime?.minecraft" class="text-cyan-300 font-mono">({{ instance.runtime.minecraft }})</span>
            </v-chip>
            <v-chip
              v-else
              size="x-small"
              color="amber"
              variant="tonal"
              class="font-medium tracking-wide cursor-pointer hover:bg-amber-500/20"
              @click="openProfilePickerForActive"
            >
              <v-icon start size="12">warning</v-icon>
              {{ t('servers.noInstanceSelected', 'No profile selected (Click to choose)') }}
            </v-chip>
          </div>
          <p class="text-sm text-cyan-100/75 max-w-2xl leading-relaxed font-medium">
            {{ t('servers.subtitle') }}
          </p>
        </div>

        <!-- Header Action Controls -->
        <div class="flex items-center gap-3 flex-wrap">
          <!-- View mode toggle -->
          <div class="bg-black/40 rounded-xl p-1 border border-white/12 flex items-center shadow-inner">
            <v-btn
              icon
              size="small"
              :variant="viewMode === 'grid' ? 'flat' : 'text'"
              :color="viewMode === 'grid' ? 'primary' : 'default'"
              rounded="lg"
              class="transition-all"
              v-shared-tooltip="t('servers.gridView', 'Grid View')"
              @click="viewMode = 'grid'"
            >
              <v-icon size="18">grid_view</v-icon>
            </v-btn>
            <v-btn
              icon
              size="small"
              :variant="viewMode === 'list' ? 'flat' : 'text'"
              :color="viewMode === 'list' ? 'primary' : 'default'"
              rounded="lg"
              class="transition-all"
              v-shared-tooltip="t('servers.listView', 'List View')"
              @click="viewMode = 'list'"
            >
              <v-icon size="18">view_list</v-icon>
            </v-btn>
          </div>

          <v-btn
            data-testid="servers-refresh-all-button"
            variant="tonal"
            color="primary"
            rounded="xl"
            prepend-icon="refresh"
            :loading="isRefreshingAll"
            class="font-semibold border border-cyan-500/30"
            @click="pingAllServers(true)"
          >
            {{ t('servers.refreshAll') }}
          </v-btn>

          <!-- Add Custom Server Button in Header -->
          <v-btn
            data-testid="servers-add-button"
            color="primary"
            variant="flat"
            rounded="xl"
            prepend-icon="add_circle"
            class="shadow-lg shadow-cyan-500/30 font-bold btn-play-frost"
            @click="openAddDialog"
          >
            {{ t('servers.addCustomServer', 'Add Custom Server') }}
          </v-btn>
        </div>
      </div>

      <!-- Quick Metrics Ribbon -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-white/10">
        <!-- Total Servers -->
        <div class="frost-metric-tile flex items-center gap-2.5 p-2.5">
          <div class="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/20 flex items-center justify-center text-cyan-300 shadow-sm">
            <v-icon size="20">dns</v-icon>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[11px] text-gray-300/80 font-medium truncate">Total Servers</span>
            <span class="text-base font-extrabold text-white tracking-wide">{{ allServers.length }}</span>
          </div>
        </div>

        <!-- Indian Servers Metric -->
        <div
          class="frost-metric-tile flex items-center gap-2.5 p-2.5 cursor-pointer"
          :class="{ 'border-orange-500/60 bg-orange-950/30 shadow-md shadow-orange-500/20': activeCategory === 'india' }"
          @click="activeCategory = 'india'"
        >
          <div class="w-9 h-9 rounded-xl bg-orange-500/15 border border-orange-400/25 flex items-center justify-center text-lg shadow-sm">
            <span>🇮🇳</span>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[11px] text-orange-200/85 font-medium truncate">Indian Hub</span>
            <span class="text-base font-extrabold text-orange-400 tracking-wide">{{ indianServersCount }}</span>
          </div>
        </div>

        <!-- Cracked & Free Metric -->
        <div
          class="frost-metric-tile flex items-center gap-2.5 p-2.5 cursor-pointer"
          :class="{ 'border-emerald-500/60 bg-emerald-950/30 shadow-md shadow-emerald-500/20': accountFilter === 'cracked' }"
          @click="accountFilter = accountFilter === 'cracked' ? 'all' : 'cracked'"
        >
          <div class="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/25 flex items-center justify-center text-emerald-300 shadow-sm">
            <v-icon size="20">lock_open</v-icon>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[11px] text-emerald-200/85 font-medium truncate">Cracked & Free</span>
            <span class="text-base font-extrabold text-emerald-400 tracking-wide">{{ crackedServersCount }}</span>
          </div>
        </div>

        <!-- Online Players -->
        <div class="frost-metric-tile flex items-center gap-2.5 p-2.5">
          <div class="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/25 flex items-center justify-center text-cyan-300 relative shadow-sm">
            <v-icon size="20">group</v-icon>
            <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[11px] text-cyan-200/85 font-medium truncate">Online Players</span>
            <span class="text-base font-extrabold text-cyan-300 tracking-wide">{{ formatNumber(totalOnlinePlayers) }}</span>
          </div>
        </div>

        <!-- My Added Servers -->
        <div
          class="frost-metric-tile flex items-center gap-2.5 p-2.5 cursor-pointer"
          :class="{ 'border-purple-500/60 bg-purple-950/30 shadow-md shadow-purple-500/20': activeCategory === 'custom' }"
          @click="activeCategory = 'custom'"
        >
          <div class="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-400/25 flex items-center justify-center text-purple-300 shadow-sm">
            <v-icon size="20">bookmark</v-icon>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[11px] text-purple-200/85 font-medium truncate">My Added</span>
            <span class="text-base font-extrabold text-purple-400 tracking-wide">{{ customServers.length }}</span>
          </div>
        </div>

        <!-- Favorites -->
        <div
          class="frost-metric-tile flex items-center gap-2.5 p-2.5 cursor-pointer"
          :class="{ 'border-amber-500/60 bg-amber-950/30 shadow-md shadow-amber-500/20': activeCategory === 'favorites' }"
          @click="activeCategory = 'favorites'"
        >
          <div class="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/25 flex items-center justify-center text-amber-300 shadow-sm">
            <v-icon size="20">star</v-icon>
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[11px] text-amber-200/85 font-medium truncate">Favorites</span>
            <span class="text-base font-extrabold text-amber-400 tracking-wide">{{ favoriteServerIds.length }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Search, Filter & Prominent Add Button Controls Toolbar -->
    <div class="flex flex-col gap-3 mb-6">
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <!-- Search Field -->
        <div class="relative flex-1 max-w-md">
          <v-text-field
            v-model="searchQuery"
            data-testid="servers-search-input"
            density="comfortable"
            variant="outlined"
            rounded="xl"
            hide-details
            prepend-inner-icon="search"
            clearable
            :placeholder="t('servers.search')"
            class="bg-black/30 backdrop-blur-sm"
          />
        </div>

        <!-- Add Server + Import + Sort + Online-Only Controls -->
        <div class="flex items-center gap-2 flex-wrap">
          <!-- Prominent "Add Your Own Server" Button directly in the toolbar -->
          <v-btn
            color="primary"
            variant="flat"
            rounded="xl"
            prepend-icon="add_circle"
            class="font-bold shadow-lg shadow-cyan-500/25 px-4"
            @click="openAddDialog"
          >
            {{ t('servers.addCustomServer', 'Add Your Own Server') }}
          </v-btn>

          <!-- Import from current profile if available -->
          <v-btn
            v-if="instanceServers.length > 0"
            variant="tonal"
            color="cyan"
            size="small"
            rounded="lg"
            prepend-icon="file_download"
            v-shared-tooltip="'Import servers from active Minecraft instance'"
            @click="importServersFromProfile"
          >
            Import ({{ instanceServers.length }})
          </v-btn>

          <!-- Online Only Toggle Chip -->
          <v-chip
            :color="onlineOnly ? 'emerald' : undefined"
            :variant="onlineOnly ? 'flat' : 'tonal'"
            rounded="lg"
            size="small"
            class="cursor-pointer transition-all font-medium"
            @click="onlineOnly = !onlineOnly"
          >
            <v-icon start size="14">sensors</v-icon>
            {{ t('servers.onlineOnly', 'Online Only') }}
          </v-chip>

          <!-- Account Type Filter Button Group (All / Cracked / Premium) -->
          <div class="bg-black/30 rounded-xl p-0.5 border border-white/10 flex items-center">
            <v-btn
              size="small"
              :variant="accountFilter === 'all' ? 'flat' : 'text'"
              :color="accountFilter === 'all' ? 'primary' : 'default'"
              rounded="lg"
              class="text-xs font-semibold px-2"
              @click="accountFilter = 'all'"
            >
              {{ t('servers.allAccounts', 'All') }}
            </v-btn>
            <v-btn
              size="small"
              :variant="accountFilter === 'cracked' ? 'flat' : 'text'"
              :color="accountFilter === 'cracked' ? 'emerald' : 'default'"
              rounded="lg"
              class="text-xs font-semibold px-2 flex items-center gap-1"
              v-shared-tooltip="t('servers.crackedTooltip', 'Cracked & Premium: Free / Offline accounts and official accounts can both play!')"
              @click="accountFilter = 'cracked'"
            >
              <v-icon size="13">lock_open</v-icon>
              {{ t('servers.crackedOnly', 'Cracked') }}
            </v-btn>
            <v-btn
              size="small"
              :variant="accountFilter === 'premium' ? 'flat' : 'text'"
              :color="accountFilter === 'premium' ? 'amber' : 'default'"
              rounded="lg"
              class="text-xs font-semibold px-2 flex items-center gap-1"
              v-shared-tooltip="t('servers.premiumTooltip', 'Premium Only: Requires official paid Minecraft account')"
              @click="accountFilter = 'premium'"
            >
              <v-icon size="13">verified</v-icon>
              {{ t('servers.premiumOnly', 'Premium') }}
            </v-btn>
          </div>

          <!-- Sort Dropdown -->
          <v-select
            v-model="sortBy"
            :items="sortOptions"
            density="compact"
            variant="outlined"
            rounded="lg"
            hide-details
            prepend-inner-icon="sort"
            class="min-w-[170px] bg-black/20"
          />
        </div>
      </div>

      <!-- Category Filter Chips -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        <v-chip
          v-for="cat in categories"
          :key="cat.id"
          :color="activeCategory === cat.id ? (cat.id === 'india' ? 'orange' : 'primary') : undefined"
          :variant="activeCategory === cat.id ? 'flat' : 'tonal'"
          rounded="lg"
          size="small"
          class="frost-category-chip cursor-pointer font-bold px-3 py-1 flex-shrink-0"
          :class="{ 'active-chip': activeCategory === cat.id }"
          @click="activeCategory = cat.id"
        >
          <span v-if="cat.flag" class="mr-1.5 text-xs">{{ cat.flag }}</span>
          <v-icon v-else-if="cat.icon" start size="14">{{ cat.icon }}</v-icon>
          {{ cat.label }}
          <span
            v-if="cat.id === 'india' && indianServersCount > 0"
            class="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-white/25 font-bold"
          >
            {{ indianServersCount }}
          </span>
          <span
            v-else-if="cat.id === 'favorites' && favoriteServerIds.length > 0"
            class="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-white/25 font-bold"
          >
            {{ favoriteServerIds.length }}
          </span>
          <span
            v-else-if="cat.id === 'custom' && customServers.length > 0"
            class="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-white/25 font-bold"
          >
            {{ customServers.length }}
          </span>
        </v-chip>
      </div>
    </div>

    <!-- Servers Grid View -->
    <div
      v-if="filteredServers.length > 0 && viewMode === 'grid'"
      class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-12"
    >
      <!-- Dedicated Add Custom Server Card (Always shown prominently in All Servers and My Servers categories!) -->
      <div
        v-if="activeCategory === 'all' || activeCategory === 'custom'"
        data-testid="server-add-custom-card"
        class="server-card add-custom-card-animated animated-card flex flex-col items-center justify-center p-6 text-center group min-h-[240px] cursor-pointer"
        @click="openAddDialog"
      >
        <div class="float-icon w-16 h-16 rounded-2xl bg-cyan-500/20 group-hover:bg-cyan-500/30 group-hover:scale-110 flex items-center justify-center text-cyan-300 transition-all mb-3 border border-cyan-400/40 shadow-lg shadow-cyan-500/20">
          <v-icon size="36">add</v-icon>
        </div>
        <h3 class="font-extrabold text-lg text-white group-hover:text-cyan-300 transition-colors tracking-wide">
          {{ t('servers.addCustomServer', 'Add Your Own Server') }}
        </h3>
        <p class="text-xs text-cyan-100/75 max-w-xs mt-1.5 leading-relaxed font-medium">
          {{ t('servers.addCustomServerDesc', 'Add your private SMP, Aternos, local LAN, or friend\'s server and play directly!') }}
        </p>
        <div class="flex items-center gap-2.5 mt-5">
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            rounded="lg"
            class="font-bold shadow-md shadow-cyan-500/30 btn-play-frost"
            prepend-icon="add"
            @click.stop="openAddDialog"
          >
            {{ t('servers.addServer', 'Add Server') }}
          </v-btn>
          <v-btn
            v-if="instanceServers.length > 0"
            variant="tonal"
            size="small"
            rounded="lg"
            class="font-semibold text-xs border border-white/10"
            prepend-icon="file_download"
            @click.stop="importServersFromProfile"
          >
            Import ({{ instanceServers.length }})
          </v-btn>
        </div>
      </div>

      <!-- Server Cards -->
      <div
        v-for="(server, index) in filteredServers"
        :key="server.id"
        data-testid="server-card"
        class="server-card server-card-interactive animated-card group relative flex flex-col justify-between p-4.5"
        :class="{ 'custom-card': server.custom }"
        :style="{ animationDelay: `${Math.min(index * 35, 350)}ms` }"
      >
        <!-- Card Top: Favicon, Name, Tags, Ping -->
        <div>
          <div class="flex items-start gap-3">
            <!-- Server Favicon with Pulsing Status Indicator -->
            <div
              class="relative server-favicon-box flex-shrink-0 flex items-center justify-center cursor-pointer overflow-hidden"
              @click="openServerDetails(server)"
            >
              <img
                v-if="getServerStatus(server).favicon"
                :src="getServerStatus(server).favicon"
                :alt="server.name"
                class="w-full h-full object-cover rounded-[13px]"
                style="image-rendering: pixelated;"
              />
              <v-icon v-else size="28" :color="server.custom ? '#c084fc' : '#38bdf8'">dns</v-icon>

              <!-- Ping state dot with ripple animation -->
              <div class="absolute bottom-1 right-1 w-2.5 h-2.5 flex items-center justify-center pointer-events-none">
                <div
                  v-if="getServerStatus(server).online"
                  class="ping-ripple bg-emerald-400/40"
                />
                <div
                  v-else-if="getServerStatus(server).pinging"
                  class="ping-ripple bg-cyan-400/40"
                />
                <div
                  class="w-2.5 h-2.5 rounded-full ring-2 ring-slate-900"
                  :class="[
                    getServerStatus(server).pinging ? 'bg-cyan-400 animate-pulse' :
                    getServerStatus(server).online ? 'bg-emerald-400' : 'bg-gray-500'
                  ]"
                />
              </div>
            </div>

            <!-- Server Info & Title -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span
                  class="font-bold text-base text-white truncate group-hover:text-cyan-300 transition-colors cursor-pointer"
                  @click="openServerDetails(server)"
                >
                  {{ server.name }}
                </span>
                <v-icon v-if="server.featured" size="16" color="#f59e0b" v-shared-tooltip="'Featured Server'">star</v-icon>
                <v-chip v-if="server.custom" size="x-small" color="purple" variant="flat" class="text-[10px] font-bold">
                  My Server
                </v-chip>
                <v-chip
                  v-if="server.isIndian || server.region === 'India'"
                  size="x-small"
                  color="orange"
                  variant="flat"
                  class="text-[10px] font-bold px-1.5 flex items-center gap-1 shadow-sm"
                  v-shared-tooltip="'Hosted in India (Ultra-low ping)'"
                >
                  <span>🇮🇳</span>
                  <span>India</span>
                </v-chip>
                <v-chip
                  v-else-if="server.region"
                  size="x-small"
                  color="blue"
                  variant="tonal"
                  class="text-[10px] px-1.5"
                >
                  {{ server.region }}
                </v-chip>

                <!-- Cracked vs Premium Badge -->
                <v-chip
                  size="x-small"
                  :color="server.accountType === 'cracked' ? 'emerald' : 'amber'"
                  variant="tonal"
                  class="text-[10px] font-bold px-1.5 flex items-center gap-1 border"
                  :class="server.accountType === 'cracked' ? 'border-emerald-500/40 text-emerald-300' : 'border-amber-500/40 text-amber-300'"
                  v-shared-tooltip="server.accountType === 'cracked'
                    ? t('servers.crackedTooltip', 'Cracked & Premium: Free / Offline accounts and Official accounts can both play!')
                    : t('servers.premiumTooltip', 'Premium Only: Requires official paid Minecraft account')
                  "
                >
                  <v-icon start size="11">{{ server.accountType === 'cracked' ? 'lock_open' : 'verified' }}</v-icon>
                  <span>{{ server.accountType === 'cracked' ? t('servers.crackedBadge', 'Cracked & Premium') : t('servers.premiumBadge', 'Premium Only') }}</span>
                </v-chip>
              </div>

              <!-- Host Address with Copy -->
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-xs font-mono text-cyan-200/80 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/30 truncate">
                  {{ formatServerAddress(server) }}
                </span>
                <button
                  type="button"
                  data-testid="server-copy-ip"
                  class="text-gray-400 hover:text-cyan-400 transition-colors cursor-pointer flex items-center justify-center w-5 h-5 rounded hover:bg-white/5"
                  :class="{ 'text-emerald-400 font-bold pop-active': copiedServerId === server.id }"
                  v-shared-tooltip="copiedServerId === server.id ? 'Copied to Clipboard!' : t('servers.copyIp')"
                  @click="copyAddress(server)"
                >
                  <v-icon v-if="copiedServerId === server.id" size="14" color="emerald">done</v-icon>
                  <v-icon v-else size="14">content_copy</v-icon>
                </button>
              </div>
            </div>

            <!-- Star Favorite & Signal Indicator -->
            <div class="flex flex-col items-end flex-shrink-0 gap-1">
              <div class="flex items-center gap-1.5">
                <!-- Favorite Toggle -->
                <button
                  type="button"
                  class="text-gray-400 hover:text-amber-400 transition-colors cursor-pointer"
                  :class="{ 'text-amber-400': isFavorite(server.id) }"
                  v-shared-tooltip="isFavorite(server.id) ? t('servers.unstarred', 'Remove from favorites') : t('servers.starred', 'Add to favorites')"
                  @click.stop="toggleServerFavorite(server)"
                >
                  <v-icon size="18">{{ isFavorite(server.id) ? 'star' : 'star_outline' }}</v-icon>
                </button>

                <!-- 5-bar connection indicator -->
                <div
                  class="flex items-end gap-0.5 h-3.5 cursor-pointer"
                  v-shared-tooltip="getServerStatus(server).ping >= 0 ? `${getServerStatus(server).ping} ms` : 'Offline / Pinging'"
                  @click="pingSingleServer(server, true)"
                >
                  <span
                    v-for="bar in 5"
                    :key="bar"
                    class="w-[3px] rounded-xs transition-all"
                    :class="bar <= getSignalLevel(getServerStatus(server).ping)
                      ? (getServerStatus(server).ping < 100 ? 'bg-emerald-400' : getServerStatus(server).ping < 250 ? 'bg-amber-400' : 'bg-rose-400')
                      : 'bg-white/15'"
                    :style="{ height: `${bar * 2 + 2}px` }"
                  />
                </div>
              </div>

              <!-- Latency in ms -->
              <span
                class="text-xs font-semibold"
                :class="getServerStatus(server).online
                  ? (getServerStatus(server).ping < 100 ? 'text-emerald-400' : getServerStatus(server).ping < 250 ? 'text-amber-400' : 'text-rose-400')
                  : 'text-gray-500'"
              >
                <template v-if="getServerStatus(server).pinging">
                  <v-progress-circular indeterminate size="10" width="1.5" color="cyan" />
                </template>
                <template v-else-if="getServerStatus(server).online">
                  {{ getServerStatus(server).ping }} ms
                </template>
                <template v-else>
                  Offline
                </template>
              </span>
            </div>
          </div>

          <!-- Players & Version Bar with Capacity Gauge -->
          <div class="mt-3 px-3 py-2 rounded-xl bg-black/40 border border-white/8 flex flex-col gap-1.5 shadow-inner">
            <div class="flex items-center justify-between text-xs">
              <div class="flex items-center gap-1.5 text-gray-300">
                <v-icon size="14" color="#38bdf8">group</v-icon>
                <span v-if="getServerStatus(server).players.online >= 0" class="font-medium">
                  <span class="text-white font-bold text-sm">{{ formatNumber(getServerStatus(server).players.online) }}</span>
                  <span class="text-gray-400"> / {{ formatNumber(getServerStatus(server).players.max) }}</span>
                </span>
                <span v-else class="text-gray-500 font-medium">
                  Players: --
                </span>
              </div>

              <div class="flex items-center gap-1 text-gray-400">
                <v-icon size="12">tag</v-icon>
                <span class="truncate max-w-[130px] font-mono text-[11px]">{{ server.version || getServerStatus(server).versionName || '1.8 - 1.21' }}</span>
              </div>
            </div>

            <!-- Mini capacity progress bar -->
            <div
              v-if="getServerStatus(server).players.online >= 0 && getServerStatus(server).players.max > 0"
              class="w-full bg-white/10 h-1.5 rounded-full overflow-hidden"
            >
              <div
                class="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 transition-all duration-500 shadow-sm shadow-cyan-400/50"
                :style="{ width: `${Math.min(100, Math.round((getServerStatus(server).players.online / getServerStatus(server).players.max) * 100))}%` }"
              />
            </div>
          </div>

          <!-- MOTD / Description in Recessed Dark Glass Viewport -->
          <div class="mt-2.5 server-motd-slot min-h-[44px] text-xs text-gray-200 line-clamp-2 leading-relaxed flex items-center">
            <TextComponent
              v-if="getServerStatus(server).description && !isGenericUnknown(getServerStatus(server).description)"
              :source="getServerStatus(server).description"
            />
            <span v-else class="text-gray-300/80">
              {{ server.description }}
            </span>
          </div>

          <!-- Tags -->
          <div class="flex items-center gap-1 mt-2.5 flex-wrap">
            <v-chip
              v-for="tag in server.tags.slice(0, 4)"
              :key="tag"
              size="x-small"
              variant="tonal"
              :color="server.custom ? 'purple' : 'cyan'"
              class="text-[10px] px-2 h-5 font-medium border border-white/8"
            >
              #{{ tag }}
            </v-chip>
          </div>
        </div>

        <!-- Card Footer Actions -->
        <div class="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-white/8">
          <!-- Left side: Refresh single + Edit/Delete if custom -->
          <div class="flex items-center gap-1">
            <v-btn
              icon
              size="x-small"
              variant="text"
              color="gray"
              v-shared-tooltip="t('shared.refresh')"
              :loading="getServerStatus(server).pinging"
              @click="pingSingleServer(server, true)"
            >
              <v-icon size="16">refresh</v-icon>
            </v-btn>

            <v-btn
              icon
              size="x-small"
              variant="text"
              color="cyan"
              v-shared-tooltip="t('servers.details', 'Server Details')"
              @click="openServerDetails(server)"
            >
              <v-icon size="16">info</v-icon>
            </v-btn>

            <template v-if="server.custom">
              <v-btn
                data-testid="server-edit-button"
                icon
                size="x-small"
                variant="text"
                color="cyan"
                v-shared-tooltip="t('shared.edit')"
                @click="openEditDialog(server)"
              >
                <v-icon size="16">edit</v-icon>
              </v-btn>
              <v-btn
                data-testid="server-delete-button"
                icon
                size="x-small"
                variant="text"
                color="red"
                v-shared-tooltip="t('shared.delete')"
                @click="confirmDelete(server)"
              >
                <v-icon size="16">delete</v-icon>
              </v-btn>
            </template>
          </div>

          <!-- Right side: Add to instance + Play -->
          <div class="flex items-center gap-2">
            <v-btn
              data-testid="server-add-to-instance"
              variant="tonal"
              size="small"
              rounded="lg"
              prepend-icon="playlist_add"
              class="font-semibold text-xs border border-white/10"
              v-shared-tooltip="t('servers.addToInstance')"
              @click="addServerToActiveInstance(server)"
            >
              Add
            </v-btn>

            <v-btn
              data-testid="server-play-button"
              :color="server.custom ? 'secondary' : 'primary'"
              variant="flat"
              size="small"
              rounded="lg"
              prepend-icon="play_arrow"
              class="font-bold shadow-md shadow-cyan-500/25 btn-play-frost"
              @click="launchServerDirectly(server)"
            >
              {{ t('servers.playDirect') }}
            </v-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- Servers Compact List View -->
    <div
      v-else-if="filteredServers.length > 0 && viewMode === 'list'"
      class="flex flex-col gap-2 pb-12"
    >
      <!-- Dedicated Add Custom Server Row in List View -->
      <div
        v-if="activeCategory === 'all' || activeCategory === 'custom'"
        data-testid="server-add-custom-row"
        class="add-custom-card-animated flex items-center justify-between p-3.5 rounded-xl border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 bg-slate-900/40 hover:bg-slate-900/70 transition-all cursor-pointer group backdrop-blur-sm"
        @click="openAddDialog"
      >
        <div class="flex items-center gap-3">
          <div class="float-icon w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <v-icon size="20">add</v-icon>
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-bold text-white group-hover:text-cyan-300">
              {{ t('servers.addCustomServer', 'Add Your Own Server') }}
            </span>
            <span class="text-xs text-gray-400">
              Add private SMP, Aternos, LAN or friend's IP and play directly
            </span>
          </div>
        </div>
        <v-btn
          color="primary"
          variant="flat"
          size="small"
          rounded="lg"
          class="font-bold btn-play-shine shadow-md shadow-cyan-500/20"
          prepend-icon="add"
          @click.stop="openAddDialog"
        >
          {{ t('servers.addServer') }}
        </v-btn>
      </div>

      <!-- Server Rows -->
      <div
        v-for="(server, index) in filteredServers"
        :key="server.id"
        data-testid="server-card"
        class="server-card server-row-interactive animated-card group flex items-center justify-between p-3.5 gap-4"
        :class="{ 'custom-card': server.custom }"
        :style="{ animationDelay: `${Math.min(index * 25, 250)}ms` }"
      >
        <!-- Left: Favicon, Name, Host -->
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            class="text-gray-400 hover:text-amber-400 transition-colors flex-shrink-0"
            :class="{ 'text-amber-400': isFavorite(server.id) }"
            @click.stop="toggleServerFavorite(server)"
          >
            <v-icon size="18">{{ isFavorite(server.id) ? 'star' : 'star_outline' }}</v-icon>
          </button>

          <div
            class="relative w-9 h-9 rounded-lg overflow-hidden bg-black/40 flex-shrink-0 border border-white/10 flex items-center justify-center cursor-pointer"
            @click="openServerDetails(server)"
          >
            <img
              v-if="getServerStatus(server).favicon"
              :src="getServerStatus(server).favicon"
              :alt="server.name"
              class="w-full h-full object-cover"
              style="image-rendering: pixelated;"
            />
            <v-icon v-else size="20" :color="server.custom ? '#c084fc' : '#38bdf8'">dns</v-icon>
            <!-- Status dot with ping ripple -->
            <div class="absolute bottom-0.5 right-0.5 w-2 h-2 flex items-center justify-center pointer-events-none">
              <div
                v-if="getServerStatus(server).online"
                class="ping-ripple bg-emerald-400/40"
              />
              <div
                v-else-if="getServerStatus(server).pinging"
                class="ping-ripple bg-cyan-400/40"
              />
              <div
                class="w-2 h-2 rounded-full ring-1 ring-slate-900"
                :class="getServerStatus(server).online ? 'bg-emerald-400' : 'bg-gray-500'"
              />
            </div>
          </div>

          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-1.5">
              <span
                class="font-bold text-sm text-white truncate group-hover:text-cyan-300 transition-colors cursor-pointer"
                @click="openServerDetails(server)"
              >
                {{ server.name }}
              </span>
              <v-chip v-if="server.custom" size="x-small" color="purple" variant="flat" class="text-[9px] px-1 h-3.5">
                My Server
              </v-chip>
              <v-chip
                v-if="server.isIndian || server.region === 'India'"
                size="x-small"
                color="orange"
                variant="flat"
                class="text-[9px] px-1 h-3.5 font-bold"
              >
                🇮🇳 India
              </v-chip>
              <v-icon v-else-if="server.featured" size="14" color="#f59e0b">star</v-icon>
              <v-chip
                size="x-small"
                :color="server.accountType === 'cracked' ? 'emerald' : 'amber'"
                variant="tonal"
                class="text-[9px] px-1.5 h-3.5 font-bold"
              >
                <v-icon start size="10">{{ server.accountType === 'cracked' ? 'lock_open' : 'verified' }}</v-icon>
                {{ server.accountType === 'cracked' ? 'Cracked' : 'Premium' }}
              </v-chip>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-mono text-cyan-200/80 truncate">{{ formatServerAddress(server) }}</span>
              <button
                type="button"
                data-testid="server-copy-ip"
                class="text-gray-400 hover:text-cyan-400 transition-colors flex items-center justify-center w-4 h-4"
                :class="{ 'text-emerald-400 font-bold pop-active': copiedServerId === server.id }"
                v-shared-tooltip="copiedServerId === server.id ? 'Copied!' : t('servers.copyIp')"
                @click="copyAddress(server)"
              >
                <v-icon v-if="copiedServerId === server.id" size="12" color="emerald">done</v-icon>
                <v-icon v-else size="12">content_copy</v-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Middle: Players & Version -->
        <div class="hidden md:flex items-center gap-6 flex-shrink-0 text-xs text-gray-300">
          <div class="flex items-center gap-1.5 min-w-[110px]">
            <v-icon size="14" color="#38bdf8">group</v-icon>
            <span v-if="getServerStatus(server).players.online >= 0" class="font-medium text-white">
              {{ formatNumber(getServerStatus(server).players.online) }}
              <span class="text-gray-400">/ {{ formatNumber(getServerStatus(server).players.max) }}</span>
            </span>
            <span v-else class="text-gray-500">--</span>
          </div>

          <div class="flex items-center gap-1 text-gray-400 min-w-[100px]">
            <v-icon size="12">tag</v-icon>
            <span class="truncate">{{ server.version || getServerStatus(server).versionName || '1.8 - 1.21' }}</span>
          </div>
        </div>

        <!-- Latency -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <div class="flex items-end gap-0.5 h-3">
            <span
              v-for="bar in 5"
              :key="bar"
              class="w-[2.5px] rounded-xs"
              :class="bar <= getSignalLevel(getServerStatus(server).ping)
                ? (getServerStatus(server).ping < 100 ? 'bg-emerald-400' : getServerStatus(server).ping < 250 ? 'bg-amber-400' : 'bg-rose-400')
                : 'bg-white/15'"
              :style="{ height: `${bar * 2 + 1}px` }"
            />
          </div>
          <span
            class="text-xs font-semibold min-w-[50px] text-right"
            :class="getServerStatus(server).online
              ? (getServerStatus(server).ping < 100 ? 'text-emerald-400' : getServerStatus(server).ping < 250 ? 'text-amber-400' : 'text-rose-400')
              : 'text-gray-500'"
          >
            {{ getServerStatus(server).online ? getServerStatus(server).ping + ' ms' : 'Offline' }}
          </span>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1.5 flex-shrink-0">
          <v-btn
            icon
            size="x-small"
            variant="text"
            color="cyan"
            v-shared-tooltip="t('servers.details', 'Server Details')"
            @click="openServerDetails(server)"
          >
            <v-icon size="16">info</v-icon>
          </v-btn>

          <template v-if="server.custom">
            <v-btn
              data-testid="server-edit-button"
              icon
              size="x-small"
              variant="text"
              color="cyan"
              v-shared-tooltip="t('shared.edit')"
              @click="openEditDialog(server)"
            >
              <v-icon size="16">edit</v-icon>
            </v-btn>
            <v-btn
              data-testid="server-delete-button"
              icon
              size="x-small"
              variant="text"
              color="red"
              v-shared-tooltip="t('shared.delete')"
              @click="confirmDelete(server)"
            >
              <v-icon size="16">delete</v-icon>
            </v-btn>
          </template>

          <v-btn
            data-testid="server-add-to-instance"
            variant="tonal"
            size="x-small"
            rounded="md"
            prepend-icon="playlist_add"
            v-shared-tooltip="t('servers.addToInstance')"
            @click="addServerToActiveInstance(server)"
          >
            Add
          </v-btn>

          <v-btn
            data-testid="server-play-button"
            :color="server.custom ? 'secondary' : 'primary'"
            variant="flat"
            size="x-small"
            rounded="md"
            prepend-icon="play_arrow"
            class="font-bold shadow-md shadow-cyan-500/20 btn-play-frost"
            @click="launchServerDirectly(server)"
          >
            {{ t('servers.playDirect') }}
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-col items-center justify-center py-16 text-center">
      <div class="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-4">
        <v-icon size="36">
          {{ activeCategory === 'favorites' ? 'star_border' : (activeCategory === 'custom' ? 'bookmark_border' : 'search_off') }}
        </v-icon>
      </div>
      <h3 class="text-base font-bold text-white mb-1">
        {{ activeCategory === 'favorites' ? 'No favorite servers yet' : (activeCategory === 'custom' ? 'No custom servers added yet' : t('servers.noServersFound')) }}
      </h3>
      <p class="text-xs text-gray-300 max-w-sm mb-4">
        {{ activeCategory === 'favorites'
          ? 'Star any server on the list to bookmark it here for quick access!'
          : (activeCategory === 'custom'
            ? 'Add your private SMP, Aternos server, local LAN, or friend\'s server to play directly anytime!'
            : 'Try searching for another server name, gamemode, or add your own server!') }}
      </p>
      <div class="flex items-center gap-2">
        <v-btn
          v-if="searchQuery || activeCategory !== 'all' || onlineOnly"
          variant="tonal"
          rounded="xl"
          prepend-icon="filter_alt_off"
          @click="resetFilters"
        >
          Reset Filters
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          rounded="xl"
          prepend-icon="add_circle"
          class="font-bold shadow-lg shadow-cyan-500/25"
          @click="openAddDialog"
        >
          {{ t('servers.addCustomServer', 'Add Your Own Server') }}
        </v-btn>
      </div>
    </div>

    <!-- Server Detail Modal -->
    <v-dialog
      v-model="detailDialogVisible"
      data-testid="server-detail-dialog"
      max-width="650"
    >
      <v-card v-if="selectedDetailServer" class="rounded-2xl border border-cyan-500/20 bg-slate-900/95 backdrop-blur-xl p-5 overflow-hidden">
        <!-- Dialog Header -->
        <div class="flex items-start justify-between gap-3 pb-4 border-b border-white/10">
          <div class="flex items-center gap-3 min-w-0">
            <div class="relative w-14 h-14 rounded-xl overflow-hidden bg-black/40 flex-shrink-0 border border-white/10 flex items-center justify-center">
              <img
                v-if="getServerStatus(selectedDetailServer).favicon"
                :src="getServerStatus(selectedDetailServer).favicon"
                :alt="selectedDetailServer.name"
                class="w-full h-full object-cover"
                style="image-rendering: pixelated;"
              />
              <v-icon v-else size="30" :color="selectedDetailServer.custom ? '#c084fc' : '#38bdf8'">dns</v-icon>
            </div>

            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-lg font-bold text-white truncate">
                  {{ selectedDetailServer.name }}
                </h2>
                <v-icon v-if="selectedDetailServer.featured" size="18" color="#f59e0b">star</v-icon>
                <v-chip v-if="selectedDetailServer.custom" size="x-small" color="purple" variant="flat">
                  My Server
                </v-chip>
                <v-chip v-else-if="selectedDetailServer.region" size="x-small" color="blue" variant="tonal">
                  {{ selectedDetailServer.region }}
                </v-chip>
              </div>

              <!-- Address with copy -->
              <div class="flex items-center gap-2 mt-1">
                <span class="text-xs font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                  {{ formatServerAddress(selectedDetailServer) }}
                </span>
                <v-btn
                  icon
                  size="x-small"
                  variant="text"
                  :color="copiedServerId === selectedDetailServer.id ? 'emerald' : 'cyan'"
                  :class="{ 'pop-active': copiedServerId === selectedDetailServer.id }"
                  v-shared-tooltip="copiedServerId === selectedDetailServer.id ? 'Copied!' : t('servers.copyIp')"
                  @click="copyAddress(selectedDetailServer)"
                >
                  <v-icon size="14">{{ copiedServerId === selectedDetailServer.id ? 'done' : 'content_copy' }}</v-icon>
                </v-btn>
              </div>
            </div>
          </div>

          <!-- Close & Star -->
          <div class="flex items-center gap-1">
            <v-btn
              icon
              size="small"
              variant="text"
              :color="isFavorite(selectedDetailServer.id) ? 'amber' : 'default'"
              @click="toggleServerFavorite(selectedDetailServer)"
            >
              <v-icon size="20">{{ isFavorite(selectedDetailServer.id) ? 'star' : 'star_outline' }}</v-icon>
            </v-btn>
            <v-btn
              icon
              size="small"
              variant="text"
              @click="detailDialogVisible = false"
            >
              <v-icon size="20">close</v-icon>
            </v-btn>
          </div>
        </div>

        <!-- Dialog Body: Live Stats & Description -->
        <div class="py-4 space-y-4">
          <!-- Connection / Hardware stats grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div class="p-2.5 rounded-xl bg-black/30 border border-white/5 flex flex-col">
              <span class="text-[11px] text-gray-400">Status</span>
              <div class="flex items-center gap-1.5 mt-0.5">
                <div
                  class="w-2 h-2 rounded-full"
                  :class="getServerStatus(selectedDetailServer).online ? 'bg-emerald-400' : 'bg-gray-500'"
                />
                <span class="text-xs font-bold" :class="getServerStatus(selectedDetailServer).online ? 'text-emerald-400' : 'text-gray-400'">
                  {{ getServerStatus(selectedDetailServer).online ? 'Online' : 'Offline' }}
                </span>
              </div>
            </div>

            <div class="p-2.5 rounded-xl bg-black/30 border border-white/5 flex flex-col">
              <span class="text-[11px] text-gray-400">Latency</span>
              <span class="text-xs font-bold text-white mt-0.5">
                {{ getServerStatus(selectedDetailServer).online ? getServerStatus(selectedDetailServer).ping + ' ms' : '--' }}
              </span>
            </div>

            <div class="p-2.5 rounded-xl bg-black/30 border border-white/5 flex flex-col">
              <span class="text-[11px] text-gray-400">Online Players</span>
              <span class="text-xs font-bold text-cyan-300 mt-0.5">
                {{ getServerStatus(selectedDetailServer).players.online >= 0 ? formatNumber(getServerStatus(selectedDetailServer).players.online) : '--' }}
              </span>
            </div>

            <div class="p-2.5 rounded-xl bg-black/30 border border-white/5 flex flex-col">
              <span class="text-[11px] text-gray-400">Version</span>
              <span class="text-xs font-bold text-white mt-0.5 truncate">
                {{ selectedDetailServer.version || getServerStatus(selectedDetailServer).versionName || '1.8 - 1.21' }}
              </span>
            </div>
          </div>

          <!-- Capacity Bar -->
          <div
            v-if="getServerStatus(selectedDetailServer).players.online >= 0 && getServerStatus(selectedDetailServer).players.max > 0"
            class="space-y-1"
          >
            <div class="flex justify-between text-xs text-gray-400">
              <span>Server Capacity</span>
              <span>
                {{ formatNumber(getServerStatus(selectedDetailServer).players.online) }} / {{ formatNumber(getServerStatus(selectedDetailServer).players.max) }}
                ({{ Math.min(100, Math.round((getServerStatus(selectedDetailServer).players.online / getServerStatus(selectedDetailServer).players.max) * 100)) }}%)
              </span>
            </div>
            <div class="w-full bg-white/10 h-2 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-emerald-500 rounded-full transition-all duration-300"
                :style="{ width: `${Math.min(100, Math.round((getServerStatus(selectedDetailServer).players.online / getServerStatus(selectedDetailServer).players.max) * 100))}%` }"
              />
            </div>
          </div>

          <!-- Account Compatibility & Region Card -->
          <div
            class="p-3 rounded-xl border flex items-center justify-between gap-3"
            :class="selectedDetailServer.accountType === 'cracked' ? 'border-emerald-500/30 bg-emerald-950/30' : 'border-amber-500/30 bg-amber-950/30'"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <div
                class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                :class="selectedDetailServer.accountType === 'cracked' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'"
              >
                <v-icon size="20">{{ selectedDetailServer.accountType === 'cracked' ? 'lock_open' : 'verified' }}</v-icon>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-xs font-bold text-white">
                  {{ selectedDetailServer.accountType === 'cracked' ? t('servers.crackedSupportedNotice') : t('servers.premiumOnlyNotice') }}
                </span>
                <span class="text-[11px] text-gray-300">
                  {{ selectedDetailServer.accountType === 'cracked'
                    ? 'Free / Offline accounts (Frost Launcher) & official Microsoft accounts can both join without error.'
                    : 'Requires an official purchased Minecraft account from Microsoft / Mojang.'
                  }}
                </span>
              </div>
            </div>

            <div
              v-if="selectedDetailServer.isIndian || selectedDetailServer.region === 'India'"
              class="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-bold flex-shrink-0"
            >
              <span>🇮🇳</span>
              <span>Indian Server</span>
            </div>
          </div>

          <!-- MOTD Display (with Minecraft color formatting) -->
          <div class="p-3 rounded-xl bg-black/40 border border-white/10">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 mb-1 block">Live Server MOTD</span>
            <div class="text-xs text-gray-200 leading-relaxed font-sans">
              <TextComponent
                v-if="getServerStatus(selectedDetailServer).description && !isGenericUnknown(getServerStatus(selectedDetailServer).description)"
                :source="getServerStatus(selectedDetailServer).description"
              />
              <span v-else class="text-gray-400">
                {{ selectedDetailServer.description }}
              </span>
            </div>
          </div>

          <!-- Player Sample (if provided in status) -->
          <div
            v-if="(getServerStatus(selectedDetailServer).players.sample?.length ?? 0) > 0"
            class="space-y-1.5"
          >
            <span class="text-[11px] font-semibold uppercase tracking-wider text-gray-400 block">Sample Players Online</span>
            <div class="flex flex-wrap gap-1.5">
              <v-chip
                v-for="samplePlayer in (getServerStatus(selectedDetailServer).players.sample || [])"
                :key="samplePlayer.id || samplePlayer.name"
                size="x-small"
                variant="tonal"
                color="cyan"
              >
                <v-icon start size="12">person</v-icon>
                {{ samplePlayer.name }}
              </v-chip>
            </div>
          </div>

          <!-- Tags -->
          <div class="flex flex-wrap gap-1.5">
            <v-chip
              v-for="tag in selectedDetailServer.tags"
              :key="tag"
              size="small"
              variant="tonal"
              color="primary"
            >
              #{{ tag }}
            </v-chip>
          </div>

          <!-- Official Website link (if present) -->
          <div v-if="selectedDetailServer.website" class="flex items-center gap-2 pt-1">
            <v-btn
              variant="text"
              color="cyan"
              size="small"
              prepend-icon="open_in_new"
              @click="openUrl(selectedDetailServer.website)"
            >
              Official Website ({{ selectedDetailServer.website }})
            </v-btn>
          </div>
        </div>

        <!-- Dialog Footer Actions -->
        <div class="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
          <v-btn
            variant="tonal"
            color="gray"
            size="small"
            rounded="xl"
            prepend-icon="refresh"
            :loading="getServerStatus(selectedDetailServer).pinging"
            @click="pingSingleServer(selectedDetailServer, true)"
          >
            Re-ping
          </v-btn>

          <div class="flex items-center gap-2">
            <v-btn
              variant="tonal"
              size="small"
              rounded="xl"
              prepend-icon="playlist_add"
              @click="addServerToActiveInstance(selectedDetailServer)"
            >
              Add to Instance
            </v-btn>

            <v-btn
              color="primary"
              variant="flat"
              size="small"
              rounded="xl"
              prepend-icon="play_arrow"
              class="font-bold px-4 shadow-lg shadow-cyan-500/20 btn-play-shine"
              @click="launchServerDirectly(selectedDetailServer)"
            >
              {{ t('servers.playDirect') }}
            </v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>

    <!-- Supercharged Add / Edit Server Dialog -->
    <v-dialog
      v-model="serverDialogVisible"
      data-testid="server-add-dialog"
      max-width="540"
    >
      <v-card class="rounded-2xl border border-cyan-500/20 bg-slate-900/95 backdrop-blur-xl p-5">
        <v-card-item class="pb-2">
          <template #prepend>
            <div class="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mr-2">
              <v-icon size="22">{{ editingServerId ? 'edit' : 'dns' }}</v-icon>
            </div>
          </template>
          <v-card-title class="text-lg font-bold text-white">
            {{ editingServerId ? t('servers.editServer') : t('servers.addCustomServer', 'Add Your Own Server') }}
          </v-card-title>
          <v-card-subtitle class="text-xs text-gray-400">
            Add any private SMP, Aternos, local LAN, or friend's Minecraft server IP to play directly.
          </v-card-subtitle>
        </v-card-item>

        <v-card-text class="space-y-4 pt-3">
          <!-- Server Address with Live Test Connection Button -->
          <div>
            <label class="text-xs font-semibold text-gray-300 block mb-1.5">
              Server Address (IP:Port) <span class="text-rose-400">*</span>
            </label>
            <div class="flex items-center gap-2">
              <v-text-field
                v-model="serverForm.host"
                data-testid="server-add-dialog-host"
                placeholder="e.g. play.myserver.net or 192.168.1.100:25565"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                hide-details="auto"
                :rules="[v => !!v || 'Server address is required']"
                class="flex-1"
                @keyup.enter="testServerConnection"
              />
              <v-btn
                data-testid="server-test-ping-button"
                color="cyan"
                variant="tonal"
                rounded="lg"
                class="h-[44px] font-bold"
                :loading="isTestingPing"
                :disabled="!serverForm.host.trim()"
                prepend-icon="sensors"
                @click="testServerConnection"
              >
                {{ t('servers.testConnection', 'Test') }}
              </v-btn>
            </div>
          </div>

          <!-- Live Ping Result Preview Box -->
          <div
            v-if="testPingResult"
            class="p-3 rounded-xl border transition-all"
            :class="testPingResult.online ? 'border-emerald-500/40 bg-emerald-950/30' : 'border-rose-500/40 bg-rose-950/30'"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div
                  class="w-2.5 h-2.5 rounded-full"
                  :class="testPingResult.online ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'"
                />
                <span class="text-xs font-bold text-white">
                  {{ testPingResult.online ? 'Server Online & Reachable' : 'Offline / Unreachable (Check IP & Port)' }}
                </span>
                <span v-if="testPingResult.online && testPingResult.ping >= 0" class="text-xs text-emerald-300 font-mono">
                  ({{ testPingResult.ping }} ms)
                </span>
              </div>
              <span v-if="testPingResult.versionName" class="text-xs text-gray-300 font-mono">
                {{ testPingResult.versionName }}
              </span>
            </div>

            <!-- Server MOTD Preview -->
            <div v-if="testPingResult.description" class="text-xs text-gray-300 mt-2 line-clamp-1 border-t border-white/10 pt-1.5">
              <TextComponent :source="testPingResult.description" />
            </div>
          </div>

          <!-- Server Name -->
          <div>
            <label class="text-xs font-semibold text-gray-300 block mb-1.5">
              Server Name <span class="text-rose-400">*</span>
            </label>
            <v-text-field
              v-model="serverForm.name"
              data-testid="server-add-dialog-name"
              placeholder="e.g. My Private SMP / Friends Realm"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              hide-details="auto"
              :rules="[v => !!v || 'Server name is required']"
            />
          </div>

          <!-- Category & Region -->
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="text-xs font-semibold text-gray-300 block mb-1.5">Category</label>
              <v-select
                v-model="serverForm.category"
                :items="categoryOptions"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                hide-details
              />
            </div>

            <div>
              <label class="text-xs font-semibold text-gray-300 block mb-1.5">Region</label>
              <v-text-field
                v-model="serverForm.region"
                placeholder="e.g. Global, NA, EU, Asia"
                variant="outlined"
                density="comfortable"
                rounded="lg"
                hide-details
              />
            </div>
          </div>

          <!-- Tags -->
          <div>
            <label class="text-xs font-semibold text-gray-300 block mb-1.5">Tags (Comma separated)</label>
            <v-text-field
              v-model="serverForm.tags"
              placeholder="e.g. Survival, SMP, Friends, Modded, Aternos"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              hide-details
            />
          </div>

          <!-- Account Support Type (Cracked vs Premium) -->
          <div>
            <label class="text-xs font-semibold text-gray-300 block mb-1.5">
              Account Compatibility (Cracked / Premium)
            </label>
            <div class="grid grid-cols-2 gap-2">
              <div
                class="p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-2"
                :class="serverForm.accountType === 'cracked' ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300' : 'border-white/10 bg-black/20 text-gray-400 hover:bg-white/5'"
                @click="serverForm.accountType = 'cracked'"
              >
                <v-icon size="18" :color="serverForm.accountType === 'cracked' ? 'emerald' : 'gray'">lock_open</v-icon>
                <div class="flex flex-col min-w-0">
                  <span class="text-xs font-bold truncate">Cracked & Premium</span>
                  <span class="text-[10px] opacity-75 truncate">Free/Offline players welcome</span>
                </div>
              </div>

              <div
                class="p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-2"
                :class="serverForm.accountType === 'premium' ? 'border-amber-500 bg-amber-950/40 text-amber-300' : 'border-white/10 bg-black/20 text-gray-400 hover:bg-white/5'"
                @click="serverForm.accountType = 'premium'"
              >
                <v-icon size="18" :color="serverForm.accountType === 'premium' ? 'amber' : 'gray'">verified</v-icon>
                <div class="flex flex-col min-w-0">
                  <span class="text-xs font-bold truncate">Premium Only</span>
                  <span class="text-[10px] opacity-75 truncate">Official paid account</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Mark as Indian Server Checkbox -->
          <div class="flex items-center gap-2 pt-0.5">
            <v-checkbox
              v-model="serverForm.isIndian"
              hide-details
              density="compact"
              color="orange"
            >
              <template #label>
                <span class="text-xs text-gray-300 flex items-center gap-1.5">
                  <span>🇮🇳</span>
                  <span>Mark as Indian Server (Show in Indian Servers category)</span>
                </span>
              </template>
            </v-checkbox>
          </div>

          <!-- Description -->
          <div>
            <label class="text-xs font-semibold text-gray-300 block mb-1.5">Description (Optional)</label>
            <v-textarea
              v-model="serverForm.description"
              placeholder="Brief details about your server or login credentials..."
              variant="outlined"
              density="comfortable"
              rows="2"
              rounded="lg"
              hide-details
            />
          </div>

          <!-- Checkbox to add directly into current instance servers.dat -->
          <div v-if="instance?.name" class="flex items-center gap-2 pt-1">
            <v-checkbox
              v-model="serverForm.addToInstance"
              hide-details
              density="compact"
              color="primary"
            >
              <template #label>
                <span class="text-xs text-gray-300">
                  Also save to active profile (<strong>{{ instance.name }}</strong>) in Minecraft
                </span>
              </template>
            </v-checkbox>
          </div>
        </v-card-text>

        <!-- Dialog Footer Actions -->
        <div class="flex items-center justify-between gap-3 px-4 pb-2 pt-4 border-t border-white/10">
          <v-btn
            variant="text"
            rounded="xl"
            @click="serverDialogVisible = false"
          >
            {{ t('shared.cancel') }}
          </v-btn>

          <div class="flex items-center gap-2">
            <v-btn
              data-testid="server-add-dialog-confirm"
              variant="tonal"
              rounded="xl"
              class="px-4 font-bold"
              :disabled="!serverForm.name.trim() || !serverForm.host.trim()"
              @click="saveServer"
            >
              {{ t('shared.save') }}
            </v-btn>

            <v-btn
              data-testid="server-save-and-play-button"
              color="primary"
              variant="flat"
              rounded="xl"
              prepend-icon="play_arrow"
              class="px-5 font-bold shadow-lg shadow-cyan-500/20"
              :disabled="!serverForm.name.trim() || !serverForm.host.trim()"
              @click="saveAndPlayServer"
            >
              {{ t('servers.saveAndPlay', 'Save & Play') }}
            </v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>

    <!-- Profile Picker Dialog for Direct Launch -->
    <v-dialog
      v-model="profilePickerDialogVisible"
      data-testid="server-launch-dialog"
      max-width="500"
    >
      <v-card class="rounded-2xl border border-cyan-500/20 bg-slate-900/95 backdrop-blur-xl p-5">
        <v-card-item class="pb-3">
          <template #prepend>
            <div class="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mr-2">
              <v-icon size="22">sports_esports</v-icon>
            </div>
          </template>
          <v-card-title class="text-lg font-bold text-white">
            {{ t('servers.selectProfileToPlay', 'Select Profile to Play') }}
          </v-card-title>
          <v-card-subtitle v-if="serverToLaunch" class="text-xs text-cyan-300 font-mono">
            Connecting to {{ serverToLaunch.name }} ({{ formatServerAddress(serverToLaunch) }})
          </v-card-subtitle>
        </v-card-item>

        <!-- Account Compatibility / Warning Banner -->
        <div
          v-if="serverToLaunch"
          class="mx-4 mb-2 p-2.5 rounded-xl border text-xs"
          :class="serverToLaunch.accountType === 'premium' && isCurrentUserOffline
            ? 'border-amber-500/40 bg-amber-950/40 text-amber-200'
            : 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'"
        >
          <div class="flex items-start gap-2">
            <v-icon size="16" class="mt-0.5 flex-shrink-0" :color="serverToLaunch.accountType === 'premium' && isCurrentUserOffline ? 'amber' : 'emerald'">
              {{ serverToLaunch.accountType === 'premium' && isCurrentUserOffline ? 'warning' : 'check_circle' }}
            </v-icon>
            <div class="flex-1">
              <template v-if="serverToLaunch.accountType === 'premium' && isCurrentUserOffline">
                <strong class="block text-amber-300 font-bold mb-0.5">{{ t('servers.premiumWarningTitle') }}</strong>
                <span class="leading-relaxed">{{ t('servers.premiumWarningBody') }}</span>
              </template>
              <template v-else-if="serverToLaunch.accountType === 'cracked'">
                <strong class="block text-emerald-300 font-bold mb-0.5">{{ t('servers.crackedOnly') }}</strong>
                <span class="leading-relaxed">{{ t('servers.crackedCompatibleNote') }}</span>
              </template>
              <template v-else>
                <strong class="block text-emerald-300 font-bold mb-0.5">Premium Ready</strong>
                <span class="leading-relaxed">Connected with your official Minecraft profile.</span>
              </template>
            </div>
          </div>
        </div>

        <v-card-text class="py-2 space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar">
          <div
            v-for="inst in instances"
            :key="inst.path"
            class="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-black/30 hover:bg-cyan-950/40 hover:border-cyan-500/40 transition-all cursor-pointer group"
            @click="executeLaunch(serverToLaunch!, inst)"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-9 h-9 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-cyan-400">
                <v-icon size="20">sports_esports</v-icon>
              </div>
              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                    {{ inst.name }}
                  </span>
                  <v-chip v-if="inst.path === instance?.path" size="x-small" color="primary" variant="flat">
                    Active
                  </v-chip>
                </div>
                <span class="text-xs text-gray-400 font-mono">
                  Minecraft {{ inst.runtime.minecraft || 'Latest' }}
                </span>
              </div>
            </div>

            <v-btn
              color="primary"
              variant="flat"
              size="small"
              rounded="lg"
              prepend-icon="play_arrow"
              class="font-bold"
            >
              Play
            </v-btn>
          </div>
        </v-card-text>

        <v-card-actions class="pt-3">
          <v-spacer />
          <v-btn
            variant="text"
            rounded="xl"
            @click="profilePickerDialogVisible = false"
          >
            {{ t('shared.cancel') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'
import TextComponent from '@/components/TextComponent'
import { usePublicServers, PublicServer } from '@/composables/publicServers'
import { kInstance } from '@/composables/instance'
import { kInstanceLaunch } from '@/composables/instanceLaunch'
import { kUserContext } from '@/composables/user'
import { useService } from '@/composables'
import { InstanceServerInfoServiceKey, ServerStatusServiceKey, parseServerAddress } from '@xmcl/runtime-api'
import { useInstanceServerInfo } from '@/composables/instanceServerInfo'
import { useNotifier } from '@/composables/notifier'
import { vSharedTooltip } from '@/directives/sharedTooltip'
import { injection } from '@/util/inject'
import { useLocalStorage } from '@vueuse/core'

const { t } = useI18n()
const { notify } = useNotifier()
const { instance, instances, select } = injection(kInstance)
const { launch } = injection(kInstanceLaunch)
const { addServer } = useService(InstanceServerInfoServiceKey)
const { pingServer } = useService(ServerStatusServiceKey)

// User context for detecting Offline / Microsoft account
const userContext = inject(kUserContext, undefined)
const isCurrentUserOffline = computed(() => {
  if (!userContext?.userProfile?.value) return true
  const u = userContext.userProfile.value
  return u.authority === 'offline' || (u as any).authService === 'offline' || !u.authority
})

// Instance servers watcher for importing
const instancePath = computed(() => instance.value?.path || '')
const { servers: instanceServers } = useInstanceServerInfo(instancePath)

const {
  allServers,
  customServers,
  favoriteServerIds,
  isRefreshingAll,
  isFavorite,
  toggleFavorite,
  pingSingleServer,
  pingAllServers,
  addCustomServer,
  editCustomServer,
  removeCustomServer,
  getServerStatus,
} = usePublicServers()

// Search, Category, Sorting, Account Filter & View
const searchQuery = ref('')
const activeCategory = ref('all')
const accountFilter = ref<'all' | 'cracked' | 'premium'>('all')
const onlineOnly = ref(false)
const sortBy = ref<'featured' | 'players' | 'ping' | 'name'>('featured')
const viewMode = useLocalStorage<'grid' | 'list'>('frost_servers_view_mode', 'grid')

const indianServersCount = computed(() => {
  return allServers.value.filter(s => s.isIndian || s.region === 'India' || s.tags.includes('India')).length
})

const crackedServersCount = computed(() => {
  return allServers.value.filter(s => s.accountType === 'cracked').length
})

const categories = computed(() => [
  { id: 'all', label: t('servers.allServers', 'All Servers'), icon: 'view_quilt' },
  { id: 'india', label: t('servers.indianServers', 'Indian Servers'), flag: '🇮🇳' },
  { id: 'custom', label: t('servers.myServers', 'My Servers'), icon: 'bookmark' },
  { id: 'favorites', label: t('servers.favorites', 'Favorites'), icon: 'star' },
  { id: 'featured', label: t('servers.featured', 'Featured'), icon: 'local_fire_department' },
  { id: 'minigames', label: t('servers.minigames', 'Minigames'), icon: 'sports_esports' },
  { id: 'survival', label: t('servers.survival', 'Survival & SMP'), icon: 'forest' },
  { id: 'anarchy', label: t('servers.anarchy', 'Anarchy & PvP'), icon: 'shield' },
  { id: 'rpg', label: t('servers.rpg', 'RPG'), icon: 'auto_fix_high' },
])

const categoryOptions = [
  { title: 'Survival & SMP', value: 'survival' },
  { title: 'Minigames', value: 'minigames' },
  { title: 'Anarchy & PvP', value: 'anarchy' },
  { title: 'RPG', value: 'rpg' },
  { title: 'Other', value: 'other' },
]

const sortOptions = [
  { title: 'Featured / Default', value: 'featured' },
  { title: 'Most Players Online', value: 'players' },
  { title: 'Lowest Ping Latency', value: 'ping' },
  { title: 'Alphabetical (A - Z)', value: 'name' },
]

const filteredServers = computed(() => {
  let list = allServers.value

  // Category filter
  if (activeCategory.value === 'favorites') {
    list = list.filter(s => isFavorite(s.id))
  } else if (activeCategory.value === 'featured') {
    list = list.filter(s => s.featured)
  } else if (activeCategory.value === 'custom') {
    list = list.filter(s => s.custom)
  } else if (activeCategory.value === 'india') {
    list = list.filter(s => s.isIndian || s.region === 'India' || s.tags.includes('India'))
  } else if (activeCategory.value !== 'all') {
    list = list.filter(s => s.category === activeCategory.value)
  }

  // Account type filter
  if (accountFilter.value === 'cracked') {
    list = list.filter(s => s.accountType === 'cracked')
  } else if (accountFilter.value === 'premium') {
    list = list.filter(s => s.accountType === 'premium')
  }

  // Online only filter
  if (onlineOnly.value) {
    list = list.filter(s => getServerStatus(s).online)
  }

  // Search query filter
  const q = searchQuery.value?.trim().toLowerCase()
  if (q) {
    list = list.filter(s => {
      return (
        s.name.toLowerCase().includes(q) ||
        s.host.toLowerCase().includes(q) ||
        (s.region && s.region.toLowerCase().includes(q)) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q))
      )
    })
  }

  // Sorting
  const sorted = [...list]
  if (sortBy.value === 'players') {
    sorted.sort((a, b) => {
      const pa = getServerStatus(a).players.online
      const pb = getServerStatus(b).players.online
      return pb - pa
    })
  } else if (sortBy.value === 'ping') {
    sorted.sort((a, b) => {
      const pa = getServerStatus(a).ping
      const pb = getServerStatus(b).ping
      // Put offline / -1 at the bottom
      if (pa <= 0 && pb <= 0) return 0
      if (pa <= 0) return 1
      if (pb <= 0) return -1
      return pa - pb
    })
  } else if (sortBy.value === 'name') {
    sorted.sort((a, b) => a.name.localeCompare(b.name))
  } else {
    // Custom servers first if on Custom tab or default, then favorites, then featured
    sorted.sort((a, b) => {
      if (activeCategory.value === 'custom') return 0
      const custA = a.custom ? 1 : 0
      const custB = b.custom ? 1 : 0
      if (custA !== custB) return custB - custA

      const favA = isFavorite(a.id) ? 1 : 0
      const favB = isFavorite(b.id) ? 1 : 0
      if (favA !== favB) return favB - favA

      const featA = a.featured ? 1 : 0
      const featB = b.featured ? 1 : 0
      return featB - featA
    })
  }

  return sorted
})

// Metrics
const totalOnlinePlayers = computed(() => {
  let total = 0
  for (const s of allServers.value) {
    const st = getServerStatus(s)
    if (st.online && st.players.online > 0) {
      total += st.players.online
    }
  }
  return total
})

const avgPing = computed(() => {
  const pings = allServers.value
    .map(s => getServerStatus(s).ping)
    .filter(p => p > 0)
  if (pings.length === 0) return 0
  return Math.round(pings.reduce((a, b) => a + b, 0) / pings.length)
})

// Server Detail Dialog
const detailDialogVisible = ref(false)
const selectedDetailServer = ref<PublicServer | null>(null)

function openServerDetails(server: PublicServer) {
  selectedDetailServer.value = server
  detailDialogVisible.value = true
}

function openUrl(url?: string) {
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}

function toggleServerFavorite(server: PublicServer) {
  toggleFavorite(server.id)
  const favorited = isFavorite(server.id)
  notify({
    level: 'info',
    title: favorited ? t('servers.starred', 'Added to favorites!') : t('servers.unstarred', 'Removed from favorites!'),
    body: server.name,
  })
}

function resetFilters() {
  searchQuery.value = ''
  activeCategory.value = 'all'
  accountFilter.value = 'all'
  onlineOnly.value = false
  sortBy.value = 'featured'
}

// Helpers
function formatNumber(num: number): string {
  if (num < 0) return '0'
  return new Intl.NumberFormat().format(num)
}

function formatServerAddress(server: PublicServer): string {
  return server.port && server.port !== 25565 ? `${server.host}:${server.port}` : server.host
}

function getSignalLevel(ping: number): number {
  if (ping < 0) return 0
  if (ping < 100) return 5
  if (ping < 200) return 4
  if (ping < 400) return 3
  if (ping < 700) return 2
  return 1
}

function isGenericUnknown(d: any): boolean {
  if (!d) return true
  if (typeof d === 'string' && (d.includes('serverStatus.') || d.includes('unknownDescription'))) return true
  return false
}

// Copy Server IP
const copiedServerId = ref<string | null>(null)
let copyTimer: any = null

async function copyAddress(server: PublicServer) {
  const addr = formatServerAddress(server)
  copiedServerId.value = server.id
  if (copyTimer) clearTimeout(copyTimer)
  copyTimer = setTimeout(() => {
    copiedServerId.value = null
  }, 2200)

  try {
    await navigator.clipboard.writeText(addr)
    notify({
      level: 'success',
      title: t('servers.ipCopied'),
      body: addr,
    })
  } catch {
    notify({
      level: 'info',
      title: addr,
    })
  }
}

// Add Server to Current Minecraft Instance
async function addServerToActiveInstance(server: PublicServer) {
  if (!instance.value?.path) {
    notify({
      level: 'warning',
      title: 'No active Minecraft instance selected',
      body: 'Please select or create an instance on the home page first.',
    })
    return
  }

  try {
    await addServer({
      instancePath: instance.value.path,
      name: server.name,
      host: server.host,
      port: server.port || 25565,
    })
    notify({
      level: 'success',
      title: t('servers.addedToInstance'),
      body: `${server.name} (${formatServerAddress(server)})`,
    })
  } catch (e: any) {
    notify({
      level: 'error',
      title: 'Failed to add server to instance',
      body: e?.message || String(e),
    })
  }
}

// Direct connect / launch server & Profile Picker
const profilePickerDialogVisible = ref(false)
const serverToLaunch = ref<PublicServer | null>(null)

function openProfilePickerForActive() {
  if (instances.value.length > 0) {
    serverToLaunch.value = allServers.value[0] || null
    profilePickerDialogVisible.value = true
  }
}

function launchServerDirectly(server: PublicServer, forcePicker = false) {
  serverToLaunch.value = server

  // If no instance is active or force picker requested, check if instances exist
  if (forcePicker || !instance.value?.path) {
    if (instances.value.length > 0) {
      profilePickerDialogVisible.value = true
      return
    }

    notify({
      level: 'warning',
      title: 'No Minecraft profile found',
      body: 'Please create an instance on the home screen first to play.',
    })
    return
  }

  executeLaunch(server, instance.value)
}

function executeLaunch(server: PublicServer, targetInstance: any) {
  notify({
    level: 'info',
    title: `Connecting to ${server.name}...`,
    body: `${formatServerAddress(server)} (Profile: ${targetInstance.name})`,
  })

  // Switch active profile if necessary
  if (instance.value.path !== targetInstance.path) {
    select(targetInstance.path)
  }

  launch('client', {
    server: {
      host: server.host,
      port: server.port || 25565,
    },
  })

  profilePickerDialogVisible.value = false
}

// Import servers from current Minecraft instance servers.dat
function importServersFromProfile() {
  if (!instance.value?.path || instanceServers.value.length === 0) {
    notify({
      level: 'info',
      title: 'No servers found in active profile',
      body: 'Add servers in your Minecraft client or use the Add Server button.',
    })
    return
  }

  let count = 0
  for (const s of instanceServers.value) {
    const rawIp = s.ip || ''
    const parsed = parseServerAddress(rawIp)
    if (!parsed) continue
    const sHost = parsed.host
    const sPort = parsed.port || 25565

    const exists = allServers.value.some(
      existing => existing.host.toLowerCase() === sHost.toLowerCase() && (existing.port || 25565) === sPort,
    )
    if (!exists && sHost) {
      addCustomServer({
        name: s.name || sHost,
        host: sHost,
        port: sPort,
        category: 'survival',
        region: 'Global',
        tags: ['My Server', 'Imported'],
        description: `Imported from Minecraft profile: ${instance.value.name}`,
      })
      count++
    }
  }

  if (count > 0) {
    activeCategory.value = 'custom'
    notify({
      level: 'success',
      title: t('servers.importedServers', { count }),
      body: `${count} servers added to My Servers!`,
    })
  } else {
    notify({
      level: 'info',
      title: 'All profile servers are already added',
    })
  }
}

// Dialog Form for Add/Edit Server
const serverDialogVisible = ref(false)
const editingServerId = ref<string | null>(null)
const isTestingPing = ref(false)
const testPingResult = ref<{
  online: boolean
  ping: number
  versionName?: string
  description?: any
  favicon?: string
} | null>(null)

const serverForm = ref({
  name: '',
  host: '',
  category: 'survival' as PublicServer['category'],
  region: 'Global',
  accountType: 'cracked' as 'cracked' | 'premium',
  isIndian: false,
  tags: '',
  description: '',
  addToInstance: true,
})

function openAddDialog() {
  editingServerId.value = null
  testPingResult.value = null
  serverForm.value = {
    name: '',
    host: '',
    category: 'survival',
    region: 'Global',
    accountType: 'cracked',
    isIndian: false,
    tags: '',
    description: '',
    addToInstance: !!instance.value?.path,
  }
  serverDialogVisible.value = true
}

function openEditDialog(server: PublicServer) {
  editingServerId.value = server.id
  testPingResult.value = null
  serverForm.value = {
    name: server.name,
    host: formatServerAddress(server),
    category: server.category,
    region: server.region || 'Global',
    accountType: server.accountType || 'cracked',
    isIndian: !!server.isIndian,
    tags: server.tags.join(', '),
    description: server.description,
    addToInstance: false,
  }
  serverDialogVisible.value = true
}

async function testServerConnection() {
  const hostVal = serverForm.value.host?.trim()
  if (!hostVal) return
  isTestingPing.value = true
  testPingResult.value = null

  const parts = hostVal.split(':')
  const host = parts[0]
  const port = parts[1] ? Number.parseInt(parts[1], 10) : 25565

  try {
    const res = await pingServer({
      host,
      port: Number.isNaN(port) ? 25565 : port,
    })
    const isOnline = res.ping >= 0 || (res.players && res.players.online >= 0)
    testPingResult.value = {
      online: isOnline,
      ping: res.ping ?? -1,
      versionName: res.version?.name,
      description: res.description,
      favicon: res.favicon,
    }

    // Auto-fill name if name is empty
    if (!serverForm.value.name.trim()) {
      if (typeof res.description === 'string' && res.description.length > 0 && res.description.length < 35) {
        serverForm.value.name = res.description.replace(/§[0-9a-fk-or]/gi, '').trim()
      } else {
        serverForm.value.name = host
      }
    }
  } catch {
    testPingResult.value = {
      online: false,
      ping: -1,
    }
  } finally {
    isTestingPing.value = false
  }
}

function saveServer() {
  const parts = serverForm.value.host.trim().split(':')
  const host = parts[0]
  const port = parts[1] ? Number.parseInt(parts[1], 10) : 25565
  const tags = serverForm.value.tags
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)

  if (editingServerId.value) {
    editCustomServer(editingServerId.value, {
      name: serverForm.value.name.trim() || host,
      host,
      port: Number.isNaN(port) ? 25565 : port,
      category: serverForm.value.category,
      region: serverForm.value.isIndian ? 'India' : (serverForm.value.region.trim() || 'Global'),
      accountType: serverForm.value.accountType,
      isIndian: serverForm.value.isIndian,
      tags: tags.length ? tags : ['Custom'],
      description: serverForm.value.description.trim(),
    })
    notify({
      level: 'success',
      title: 'Server updated successfully!',
    })
  } else {
    const created = addCustomServer({
      name: serverForm.value.name.trim() || host,
      host,
      port: Number.isNaN(port) ? 25565 : port,
      category: serverForm.value.category,
      region: serverForm.value.isIndian ? 'India' : (serverForm.value.region.trim() || 'Global'),
      accountType: serverForm.value.accountType,
      isIndian: serverForm.value.isIndian,
      tags: tags.length ? tags : ['Custom', 'Private SMP'],
      description: serverForm.value.description.trim(),
    })

    if (serverForm.value.addToInstance && instance.value?.path) {
      addServerToActiveInstance(created)
    }

    activeCategory.value = 'custom'
    notify({
      level: 'success',
      title: 'Server added to My Servers!',
      body: `${created.name} (${formatServerAddress(created)})`,
    })
  }

  serverDialogVisible.value = false
}

async function saveAndPlayServer() {
  const parts = serverForm.value.host.trim().split(':')
  const host = parts[0]
  const port = parts[1] ? Number.parseInt(parts[1], 10) : 25565
  const tags = serverForm.value.tags
    .split(',')
    .map(t => t.trim())
    .filter(Boolean)

  const created = addCustomServer({
    name: serverForm.value.name.trim() || host,
    host,
    port: Number.isNaN(port) ? 25565 : port,
    category: serverForm.value.category,
    region: serverForm.value.isIndian ? 'India' : (serverForm.value.region.trim() || 'Global'),
    accountType: serverForm.value.accountType,
    isIndian: serverForm.value.isIndian,
    tags: tags.length ? tags : ['Custom', 'Private SMP'],
    description: serverForm.value.description.trim(),
  })

  if (serverForm.value.addToInstance && instance.value?.path) {
    try {
      await addServer({
        instancePath: instance.value.path,
        name: created.name,
        host: created.host,
        port: created.port || 25565,
      })
    } catch {
      // ignore write error
    }
  }

  serverDialogVisible.value = false
  launchServerDirectly(created)
}

function confirmDelete(server: PublicServer) {
  removeCustomServer(server.id)
  notify({
    level: 'info',
    title: `Removed ${server.name}`,
  })
}

onMounted(() => {
  // Trigger initial staggered refresh for live ping & online players
  pingAllServers(false)
})
</script>

<style scoped>
.servers-page {
  background: radial-gradient(circle at 10% 20%, rgba(14, 165, 233, 0.12) 0%, transparent 45%),
              radial-gradient(circle at 90% 80%, rgba(99, 102, 241, 0.12) 0%, transparent 45%),
              radial-gradient(circle at 50% 50%, rgba(8, 20, 36, 0.25) 0%, transparent 60%);
}

@keyframes auroraShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.aurora-header {
  background: linear-gradient(135deg, rgba(8, 20, 36, 0.85) 0%, rgba(15, 23, 42, 0.75) 45%, rgba(12, 38, 64, 0.85) 100%) !important;
  backdrop-filter: blur(28px) saturate(190%) !important;
  -webkit-backdrop-filter: blur(28px) saturate(190%) !important;
  border: 1px solid rgba(56, 189, 248, 0.25) !important;
  box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.55), inset 0 1px 2px rgba(255, 255, 255, 0.22), 0 0 32px rgba(56, 189, 248, 0.12) !important;
  border-radius: 20px !important;
  position: relative;
  overflow: hidden;
}

.aurora-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.85) 50%, transparent 100%);
  pointer-events: none;
}

/* Frosted Metric Tiles */
.frost-metric-tile {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.frost-metric-tile:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(56, 189, 248, 0.4);
  box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.4), 0 0 16px rgba(56, 189, 248, 0.2);
}

/* Frosted Category Chip */
.frost-category-chip {
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  border-radius: 12px !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.frost-category-chip:hover {
  border-color: rgba(56, 189, 248, 0.5) !important;
  transform: translateY(-1px);
}

.frost-category-chip.active-chip {
  background: linear-gradient(135deg, #0284c7 0%, #38bdf8 100%) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 4px 16px rgba(56, 189, 248, 0.4) !important;
  color: white !important;
}

/* Sleek Gaming Server Card */
.server-card-interactive {
  background: rgba(10, 20, 36, 0.72) !important;
  backdrop-filter: blur(28px) saturate(190%) !important;
  -webkit-backdrop-filter: blur(28px) saturate(190%) !important;
  border: 1px solid rgba(56, 189, 248, 0.22) !important;
  border-radius: 18px !important;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45), 0 0 16px rgba(56, 189, 248, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.2) !important;
  position: relative;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
  will-change: transform, box-shadow;
}

.server-card-interactive::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(56, 189, 248, 0.85) 50%, transparent 100%);
  opacity: 0.6;
  pointer-events: none;
  transition: opacity 0.25s ease;
}

.server-card-interactive::after {
  content: '';
  position: absolute;
  top: -60%;
  left: -70%;
  width: 50%;
  height: 220%;
  background: linear-gradient(65deg, transparent 0%, rgba(255, 255, 255, 0.16) 45%, rgba(56, 189, 248, 0.24) 50%, transparent 100%);
  transform: rotate(25deg);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.server-card-interactive:hover::after {
  opacity: 1;
  left: 150%;
  transition: left 0.75s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.15s ease;
}

.server-card-interactive:hover {
  transform: translateY(-5px) !important;
  border-color: rgba(56, 189, 248, 0.90) !important;
  box-shadow: 0 20px 48px -6px rgba(0, 0, 0, 0.65), 0 0 36px rgba(56, 189, 248, 0.55), 0 0 64px rgba(56, 189, 248, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.4), inset 0 0 20px rgba(56, 189, 248, 0.16) !important;
}

.server-card-interactive:hover::before {
  opacity: 1;
}

/* Custom Server Variant */
.server-card-interactive.custom-card {
  border-color: rgba(168, 85, 247, 0.35) !important;
  background: rgba(24, 16, 40, 0.72) !important;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45), 0 0 16px rgba(168, 85, 247, 0.14), inset 0 1px 1px rgba(255, 255, 255, 0.2) !important;
}

.server-card-interactive.custom-card::before {
  background: linear-gradient(90deg, transparent 0%, rgba(192, 132, 252, 0.85) 50%, transparent 100%);
}

.server-card-interactive.custom-card:hover {
  border-color: rgba(192, 132, 252, 0.90) !important;
  box-shadow: 0 20px 48px -6px rgba(0, 0, 0, 0.65), 0 0 36px rgba(168, 85, 247, 0.60), 0 0 64px rgba(168, 85, 247, 0.25), inset 0 1px 2px rgba(255, 255, 255, 0.4), inset 0 0 20px rgba(168, 85, 247, 0.16) !important;
}

/* High-tech Favicon Container */
.server-favicon-box {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
  transition: all 0.2s ease;
}

.server-card-interactive:hover .server-favicon-box {
  border-color: rgba(56, 189, 248, 0.6);
  transform: scale(1.05);
}

/* Recessed MOTD Slot */
.server-motd-slot {
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 8px 12px;
  min-height: 48px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
}

/* Play Now Button with Shimmer Sweep */
.btn-play-frost {
  background: linear-gradient(135deg, #0284c7 0%, #38bdf8 60%, #0ea5e9 100%) !important;
  box-shadow: 0 4px 16px rgba(56, 189, 248, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.6) !important;
  border-radius: 10px !important;
  font-weight: 700 !important;
  letter-spacing: 0.3px !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
  position: relative;
  overflow: hidden;
}

.btn-play-frost:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(56, 189, 248, 0.65), 0 0 18px rgba(56, 189, 248, 0.45) !important;
}

.btn-play-frost:active {
  transform: translateY(0);
}

.btn-play-frost::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -60%;
  width: 40%;
  height: 200%;
  background: linear-gradient(60deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%);
  transform: rotate(25deg);
  pointer-events: none;
}

.btn-play-frost:hover::after {
  left: 140%;
  transition: all 0.65s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Add Custom Server Ethereal Card */
.add-custom-card-animated {
  background: radial-gradient(circle at center, rgba(14, 165, 233, 0.12) 0%, rgba(10, 20, 36, 0.65) 100%) !important;
  border: 2px dashed rgba(56, 189, 248, 0.45) !important;
  border-radius: 18px !important;
  backdrop-filter: blur(24px) saturate(190%) !important;
  -webkit-backdrop-filter: blur(24px) saturate(190%) !important;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4) !important;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
  animation: portalPulse 3.5s ease-in-out infinite;
}

@keyframes portalPulse {
  0%, 100% {
    border-color: rgba(56, 189, 248, 0.40);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4), 0 0 16px rgba(56, 189, 248, 0.15);
  }
  50% {
    border-color: rgba(56, 189, 248, 0.85);
    box-shadow: 0 14px 36px rgba(0, 0, 0, 0.45), 0 0 28px rgba(56, 189, 248, 0.40);
  }
}

.add-custom-card-animated:hover {
  transform: translateY(-6px) scale(1.01) !important;
  border-color: rgba(56, 189, 248, 0.95) !important;
  box-shadow: 0 20px 48px -6px rgba(0, 0, 0, 0.6), 0 0 40px rgba(56, 189, 248, 0.55), 0 0 64px rgba(56, 189, 248, 0.25), inset 0 0 24px rgba(56, 189, 248, 0.2) !important;
  background: radial-gradient(circle at center, rgba(14, 165, 233, 0.25) 0%, rgba(10, 20, 36, 0.8) 100%) !important;
}

/* List View Row Styling */
.server-row-interactive {
  background: rgba(10, 20, 36, 0.72) !important;
  backdrop-filter: blur(20px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
  border: 1px solid rgba(56, 189, 248, 0.2) !important;
  border-radius: 14px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35) !important;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.server-row-interactive:hover {
  transform: translateX(4px) translateY(-2px) !important;
  border-color: rgba(56, 189, 248, 0.90) !important;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55), 0 0 32px rgba(56, 189, 248, 0.50), 0 0 60px rgba(56, 189, 248, 0.22), inset 0 0 16px rgba(56, 189, 248, 0.20) !important;
  background: rgba(15, 25, 45, 0.85) !important;
}

@keyframes cardEntrance {
  0% {
    opacity: 0;
    transform: translateY(16px) scale(0.97);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.animated-card {
  animation: cardEntrance 0.38s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes floatGentle {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
}

.float-icon {
  animation: floatGentle 3s ease-in-out infinite;
}

@keyframes radarPing {
  0% {
    transform: scale(0.8);
    opacity: 0.9;
  }
  70% {
    transform: scale(2.4);
    opacity: 0;
  }
  100% {
    transform: scale(2.6);
    opacity: 0;
  }
}

.ping-ripple {
  position: absolute;
  inset: -2px;
  border-radius: 9999px;
  animation: radarPing 2.2s cubic-bezier(0, 0, 0.2, 1) infinite;
  pointer-events: none;
}

@keyframes popCheck {
  0% {
    transform: scale(0.7);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}

.pop-active {
  animation: popCheck 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
</style>
