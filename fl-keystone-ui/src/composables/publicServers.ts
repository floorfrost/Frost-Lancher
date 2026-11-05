import { useService } from '@/composables'
import { ServerStatusServiceKey, ServerStatus } from '@xmcl/runtime-api'
import { useLocalStorage } from '@vueuse/core'
import { ref, computed } from 'vue'

export interface PublicServer {
  id: string
  name: string
  host: string
  port?: number
  version?: string
  category: 'minigames' | 'survival' | 'anarchy' | 'rpg' | 'other'
  tags: string[]
  description: string
  featured?: boolean
  custom?: boolean
  region?: string
  website?: string
  accountType?: 'cracked' | 'premium'
  isIndian?: boolean
}

export interface PublicServerStatus {
  online: boolean
  players: {
    online: number
    max: number
    sample?: Array<{ name: string; id: string }>
  }
  ping: number
  versionName: string
  protocol?: number
  favicon?: string
  description?: any
  pinging: boolean
  lastPingTime: number
}

export const DEFAULT_SERVERS: PublicServer[] = [
  // --- Popular Indian Servers (India 🇮🇳) ---
  {
    id: 'firemc',
    name: 'FireMC Network',
    host: 'play.firemc.fun',
    port: 25565,
    version: '1.8.x - 1.21.x',
    category: 'survival',
    tags: ['India', 'Lifesteal SMP', 'BedWars', 'KitPvP', 'Cracked & Premium'],
    description: "India's premier Minecraft network featuring Ultimate Lifesteal SMP, high-intensity BedWars, and competitive PvP arenas with low Indian ping.",
    featured: true,
    region: 'India',
    accountType: 'cracked',
    isIndian: true,
    website: 'https://firemc.fun',
  },
  {
    id: 'ashsmp',
    name: 'AshSMP India',
    host: 'play.ashsmp.in',
    port: 25565,
    version: '1.8.x - 1.21.x',
    category: 'survival',
    tags: ['India', 'Lifesteal SMP', 'Custom Enchants', 'PvP', 'Cracked & Premium'],
    description: 'Rapidly growing Indian Minecraft server with active Lifesteal SMP, custom enchantments, duels, and dedicated low latency Indian hosting.',
    featured: true,
    region: 'India',
    accountType: 'cracked',
    isIndian: true,
  },
  {
    id: 'goldenelytra',
    name: 'GoldenElytra Network',
    host: 'goldenelytra.fun',
    port: 25565,
    version: '1.18.x - 1.21.x',
    category: 'survival',
    tags: ['India', 'Economy SMP', 'Lifesteal', 'BedWars', 'Crossplay', 'Cracked & Premium'],
    description: "One of India's favorite community servers featuring Survival Multiplayer (SMP), player shops, auction house, and smooth Bedrock cross-play.",
    featured: true,
    region: 'India',
    accountType: 'cracked',
    isIndian: true,
    website: 'https://goldenelytra.fun',
  },
  {
    id: 'bharatmc',
    name: 'BharatMC Network',
    host: 'play.bharatmc.net',
    port: 25565,
    version: '1.8.x - 1.21.x',
    category: 'survival',
    tags: ['India', 'Survival', 'Lifesteal', 'Land Claims', 'Cracked & Premium'],
    description: 'Pure Desi Indian Minecraft network with land claims, player-driven economy, Lifesteal SMP, and community events.',
    featured: false,
    region: 'India',
    accountType: 'cracked',
    isIndian: true,
  },
  {
    id: 'mcindia',
    name: 'MCIndia Network',
    host: 'play.mcindia.net',
    port: 25565,
    version: '1.8.x - 1.21.x',
    category: 'minigames',
    tags: ['India', 'OneBlock', 'Slimefun', 'BedWars', 'Cracked & Premium'],
    description: 'Feature-rich Indian multiplayer server offering OneBlock adventures, Slimefun engineering, BedWars, and fun arcade modes.',
    featured: false,
    region: 'India',
    accountType: 'cracked',
    isIndian: true,
  },
  {
    id: 'prithwi',
    name: 'Prithwi SMP India',
    host: 'play.prithwi.xyz',
    port: 25565,
    version: '1.19.x - 1.21.x',
    category: 'survival',
    tags: ['India', 'Lifesteal SMP', 'Custom Enchants', 'Player Shops', 'Cracked & Premium'],
    description: 'Dedicated Indian Lifesteal Survival experience with custom enchantments, player trading, and active community events.',
    featured: false,
    region: 'India',
    accountType: 'cracked',
    isIndian: true,
  },
  {
    id: 'khelmc',
    name: 'KhelMC India PvP',
    host: 'play.khelmc.online',
    port: 25565,
    version: '1.8.x - 1.21.x',
    category: 'anarchy',
    tags: ['India', 'Ranked 1v1', 'PvP Practice', 'Elo Ladder', 'Cracked & Premium'],
    description: 'India\'s competitive PvP & duel network with ranked Elo ladders, tournament brackets, Tier-Testing, and ultra-low ping for Indian gamers.',
    featured: true,
    region: 'India',
    accountType: 'cracked',
    isIndian: true,
  },
  {
    id: 'warnetwork',
    name: 'WarNetwork India',
    host: 'play.warnetwork.fun',
    port: 25565,
    version: '1.8.x - 1.21.x',
    category: 'survival',
    tags: ['India', 'Lifesteal SMP', 'Custom Bosses', 'Economy', 'Cracked & Premium'],
    description: 'Active Indian community network featuring high-stakes Lifesteal SMP, custom bosses, auction house, and regular war events.',
    featured: true,
    region: 'India',
    accountType: 'cracked',
    isIndian: true,
  },
  {
    id: 'cherrycraft',
    name: 'CherryCraft India',
    host: 'play.cherrycraft.fun',
    port: 25565,
    version: '1.8.x - 1.21.x',
    category: 'survival',
    tags: ['India', 'Peaceful Survival', 'Hub Games', 'Crossplay', 'Cracked & Premium'],
    description: 'Welcoming Indian survival community with town claims, mini-games, smooth Bedrock cross-play, and reliable performance.',
    featured: false,
    region: 'India',
    accountType: 'cracked',
    isIndian: true,
  },
  {
    id: 'atlantismc',
    name: 'AtlantisMC Network',
    host: 'play.atlantismc.fun',
    port: 25565,
    version: '1.20.x - 1.21.x',
    category: 'survival',
    tags: ['India', 'Survival SMP', 'Economy', 'Crates', 'Cracked & Premium'],
    description: 'High-speed Indian Paper Minecraft network with custom economy, player shops, crates, and ultra-low latency routing.',
    featured: false,
    region: 'India',
    accountType: 'cracked',
    isIndian: true,
  },

  // --- Global Leading Servers ---
  {
    id: 'hypixel',
    name: 'Hypixel Network',
    host: 'mc.hypixel.net',
    port: 25565,
    version: '1.8.x - 1.21.x',
    category: 'minigames',
    tags: ['BedWars', 'SkyBlock', 'SkyWars', 'Murder Mystery', 'Premium Only'],
    description: "The world's largest Minecraft server! Play BedWars, SkyBlock, Duels, SkyWars, and dozens of multiplayer minigames with thousands of players.",
    featured: true,
    region: 'Global',
    accountType: 'premium',
    website: 'https://hypixel.net',
  },
  {
    id: '2b2t',
    name: '2b2t Anarchy',
    host: '2b2t.org',
    port: 25565,
    version: '1.20.x+',
    category: 'anarchy',
    tags: ['Anarchy', 'No Rules', 'Vanilla Survival', 'Premium Only'],
    description: 'The oldest anarchy server in Minecraft history. Running since 2010 with no rules, no bans, and pure unadulterated survival.',
    featured: true,
    region: 'Global',
    accountType: 'premium',
    website: 'https://2b2t.org',
  },
  {
    id: 'cubecraft',
    name: 'CubeCraft Games',
    host: 'play.cubecraft.net',
    port: 25565,
    version: '1.8.x - 1.21.x',
    category: 'minigames',
    tags: ['EggWars', 'Lucky Islands', 'SkyWars', 'PvP', 'Premium Only'],
    description: 'Iconic European & Global network known for inventing EggWars, Lucky Islands, Tower Defence, and thrilling competitive minigames.',
    featured: true,
    region: 'EU / Global',
    accountType: 'premium',
    website: 'https://cubecraft.net',
  },
  {
    id: 'pikanetwork',
    name: 'PikaNetwork',
    host: 'play.pika-network.net',
    port: 25565,
    version: '1.8.x - 1.21.x',
    category: 'minigames',
    tags: ['BedWars', 'Lifesteal', 'Practice', 'Cracked & Premium', 'India Favorite'],
    description: 'Popular international server supporting Java and Bedrock clients with BedWars, Lifesteal, OP Skyblock, and Practice.',
    featured: true,
    region: 'EU / Global',
    accountType: 'cracked',
    website: 'https://pika-network.net',
  },
  {
    id: 'jartex',
    name: 'JartexNetwork',
    host: 'play.jartexnetwork.com',
    port: 25565,
    version: '1.8.x - 1.21.x',
    category: 'minigames',
    tags: ['BedWars', 'Prison', 'Skyblock', 'KitPvP', 'Cracked & Premium', 'India Favorite'],
    description: 'Long-standing community hub with custom BedWars, OP Prison, SkyBlock, and active competitive seasons.',
    featured: true,
    region: 'EU / Global',
    accountType: 'cracked',
    website: 'https://jartexnetwork.com',
  },
  {
    id: 'blocksmc',
    name: 'BlocksMC Network',
    host: 'mc.blocksmc.com',
    port: 25565,
    version: '1.8.x - 1.21.x',
    category: 'minigames',
    tags: ['BedWars', 'SkyWars', 'PvP Practice', 'Cracked & Premium', 'India Favorite'],
    description: 'Renowned minigames network hugely popular in India and worldwide for competitive BedWars, SkyWars, and 1v1 practice duels.',
    featured: true,
    region: 'EU / Global',
    accountType: 'cracked',
    website: 'https://blocksmc.com',
  },
  {
    id: 'gommehd',
    name: 'GommeHD Network',
    host: 'gommehd.net',
    port: 25565,
    version: '1.8.x - 1.21.x',
    category: 'minigames',
    tags: ['BedWars', 'CityBuild', 'JumpLeague', 'Premium Only'],
    description: "Europe's leading Minecraft network featuring classic BedWars, JumpLeague, CityBuild, and large community tournament events.",
    featured: false,
    region: 'EU / Global',
    accountType: 'premium',
    website: 'https://gommehd.net',
  },
  {
    id: 'complex',
    name: 'Complex Gaming',
    host: 'hub.mc-complex.com',
    port: 25565,
    version: '1.12.x - 1.21.x',
    category: 'survival',
    tags: ['Pixelmon', 'Vanilla SMP', 'Skyblock', 'Factions', 'Premium Only'],
    description: 'Massive gaming community offering Pokémon Pixelmon, Vanilla SMP, Skyblock, Prison, and modded FTB realms.',
    featured: true,
    region: 'US / Global',
    accountType: 'premium',
    website: 'https://mc-complex.com',
  },
  {
    id: 'manacube',
    name: 'ManaCube',
    host: 'play.manacube.com',
    port: 25565,
    version: '1.8.x - 1.21.x',
    category: 'survival',
    tags: ['Parkour', 'Islands', 'Survival', 'Olympus Prison', 'Premium Only'],
    description: 'Feature-packed server with over 2,500+ Parkour maps, custom Survival realms, Skyblock Islands, and Olympus Prison.',
    featured: true,
    region: 'Global',
    accountType: 'premium',
    website: 'https://manacube.com',
  },
  {
    id: 'wynncraft',
    name: 'Wynncraft MMORPG',
    host: 'play.wynncraft.com',
    port: 25565,
    version: '1.12.x - 1.21.x',
    category: 'rpg',
    tags: ['MMORPG', 'Quests', 'Dungeons', 'Custom Spells', 'Premium Only'],
    description: 'The premier Minecraft MMORPG with an expansive custom fantasy map, voice-acted quests, custom spells, gear, and dungeons.',
    featured: true,
    region: 'Global',
    accountType: 'premium',
    website: 'https://wynncraft.com',
  },
  {
    id: 'minemen',
    name: 'Minemen Club (MMC)',
    host: 'minemen.club',
    port: 25565,
    version: '1.7.x - 1.21.x',
    category: 'anarchy',
    tags: ['Competitive PvP', 'Ranked 1v1', 'Boxing', 'Duels', 'Premium Only'],
    description: 'The definitive competitive PvP practice server with high-tick anti-cheat, Ranked 1v1 matchmaking, and tournament modes.',
    featured: true,
    region: 'Global',
    accountType: 'premium',
    website: 'https://minemen.club',
  },
  {
    id: 'donutsmp',
    name: 'DonutSMP',
    host: 'donutsmp.net',
    port: 25565,
    version: '1.20.x+',
    category: 'survival',
    tags: ['Hardcore SMP', 'Stealing', 'Raiding', 'Economy', 'Premium Only'],
    description: 'The #1 Hardcore Minecraft SMP server with stealing, griefing, raiding, and high-stakes economy.',
    featured: true,
    region: 'US / Global',
    accountType: 'premium',
    website: 'https://donutsmp.net',
  },
  {
    id: 'herobrine',
    name: 'Herobrine Network',
    host: 'herobrine.org',
    port: 25565,
    version: '1.8.x - 1.21.x',
    category: 'survival',
    tags: ['Earth SMP', 'Survival', 'BedWars', 'Cracked & Premium'],
    description: 'Play on an authentic 1:1000 scale Earth SMP map, build nations, wage wars, and join community BedWars games.',
    featured: true,
    region: 'Global',
    accountType: 'cracked',
    website: 'https://herobrine.org',
  },
  {
    id: 'purpleprison',
    name: 'Purple Prison',
    host: 'purpleprison.net',
    port: 25565,
    version: '1.8.x - 1.21.x',
    category: 'survival',
    tags: ['Prison', 'Mining', 'Gang Wars', 'PvP', 'Premium Only'],
    description: 'The #1 Minecraft Prison server with custom rank progressions, mining rewards, player gang wars, and auctions.',
    featured: true,
    region: 'Global',
    accountType: 'premium',
    website: 'https://purpleprison.net',
  },
  {
    id: 'earthmc',
    name: 'EarthMC',
    host: 'play.earthmc.net',
    port: 25565,
    version: '1.20.x+',
    category: 'survival',
    tags: ['Earth Map', 'Towny', 'Nations', 'Geopolitical', 'Premium Only'],
    description: 'The pioneering geopolitical sandbox on a replica Earth map. Found towns, establish nations, trade, and build history.',
    featured: true,
    region: 'Global',
    accountType: 'premium',
    website: 'https://earthmc.net',
  },
  {
    id: 'mineberry',
    name: 'Mineberry',
    host: 'play.mineberry.net',
    port: 25565,
    version: '1.8.x - 1.21.x',
    category: 'minigames',
    tags: ['BedWars', 'Survival SMP', 'Anarchy', 'SkyBlock', 'Cracked & Premium'],
    description: 'Fast-paced multiplayer network featuring BedWars, Anarchy realms, Op Survival SMP, and competitive minigames.',
    featured: false,
    region: 'Global',
    accountType: 'cracked',
    website: 'https://mineberry.net',
  },
  {
    id: 'applecraft',
    name: 'Applecraft',
    host: 'play.applecraft.org',
    port: 25565,
    version: '1.20.x+',
    category: 'survival',
    tags: ['Vanilla SMP', 'No Griefing', 'Friendly Community', 'Premium Only'],
    description: 'Peaceful, friendly survival Minecraft experience with grief prevention, player shops, and an active welcoming community.',
    featured: false,
    region: 'Global',
    accountType: 'premium',
    website: 'https://applecraft.org',
  },
]

export function usePublicServers() {
  const customServers = useLocalStorage<PublicServer[]>('frost_custom_servers', [])
  const favoriteServerIds = useLocalStorage<string[]>('frost_server_favorites', [])
  const cachedStatuses = useLocalStorage<Record<string, {
    online: boolean
    players: { online: number; max: number; sample?: Array<{ name: string; id: string }> }
    ping: number
    versionName: string
    protocol?: number
    favicon?: string
    description?: any
    lastPingTime: number
  }>>('frost_public_servers_cache', {})

  const allServers = computed<PublicServer[]>(() => {
    return [...customServers.value, ...DEFAULT_SERVERS]
  })

  // Live statuses map
  const statusMap = ref<Record<string, PublicServerStatus>>({})

  // Initialize statusMap from cache
  for (const s of allServers.value) {
    const key = `${s.host}:${s.port ?? 25565}`
    const cached = cachedStatuses.value[key]
    if (cached) {
      statusMap.value[key] = {
        online: cached.online,
        players: cached.players,
        ping: cached.ping,
        versionName: cached.versionName,
        protocol: cached.protocol,
        favicon: cached.favicon,
        description: cached.description,
        pinging: false,
        lastPingTime: cached.lastPingTime,
      }
    } else {
      statusMap.value[key] = {
        online: false,
        players: { online: -1, max: -1 },
        ping: -1,
        versionName: '',
        pinging: false,
        lastPingTime: 0,
      }
    }
  }

  const { pingServer } = useService(ServerStatusServiceKey)
  const isRefreshingAll = ref(false)

  async function pingSingleServer(server: PublicServer, force = false): Promise<void> {
    const key = `${server.host}:${server.port ?? 25565}`
    const current = statusMap.value[key] || {
      online: false,
      players: { online: -1, max: -1 },
      ping: -1,
      versionName: '',
      pinging: false,
      lastPingTime: 0,
    }

    // Reuse if recent within 2 minutes unless forced
    if (!force && current.lastPingTime && Date.now() - current.lastPingTime < 2 * 60 * 1000) {
      return
    }

    statusMap.value[key] = {
      ...current,
      pinging: true,
    }

    try {
      const result: ServerStatus = await pingServer({
        host: server.host,
        port: server.port ?? 25565,
      })

      const isOnline = (result.ping >= 0 || (result.players && result.players.online >= 0))
      const prevFavicon = current.favicon

      const nextStatus: PublicServerStatus = {
        online: isOnline,
        players: {
          online: result.players?.online ?? -1,
          max: result.players?.max ?? -1,
          sample: result.players?.sample,
        },
        ping: result.ping ?? -1,
        versionName: typeof result.version?.name === 'string' ? result.version.name : '',
        protocol: typeof result.version?.protocol === 'number' ? result.version.protocol : undefined,
        favicon: result.favicon || prevFavicon,
        description: result.description,
        pinging: false,
        lastPingTime: Date.now(),
      }

      statusMap.value[key] = nextStatus

      // Cache persistent
      cachedStatuses.value[key] = {
        online: nextStatus.online,
        players: nextStatus.players,
        ping: nextStatus.ping,
        versionName: nextStatus.versionName,
        protocol: nextStatus.protocol,
        favicon: nextStatus.favicon,
        description: nextStatus.description,
        lastPingTime: nextStatus.lastPingTime,
      }
    } catch {
      statusMap.value[key] = {
        ...current,
        online: false,
        pinging: false,
        lastPingTime: Date.now(),
      }
    }
  }

  async function pingAllServers(force = true): Promise<void> {
    if (isRefreshingAll.value) return
    isRefreshingAll.value = true

    try {
      const list = allServers.value
      // Ping in concurrent batches of 3
      const chunkSize = 3
      for (let i = 0; i < list.length; i += chunkSize) {
        const chunk = list.slice(i, i + chunkSize)
        await Promise.allSettled(chunk.map(s => pingSingleServer(s, force)))
        // slight tick between batches
        await new Promise(r => setTimeout(r, 60))
      }
    } finally {
      isRefreshingAll.value = false
    }
  }

  function addCustomServer(server: Omit<PublicServer, 'id' | 'custom'>): PublicServer {
    const newServer: PublicServer = {
      ...server,
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      custom: true,
      port: server.port || 25565,
    }
    customServers.value = [newServer, ...customServers.value]
    pingSingleServer(newServer, true)
    return newServer
  }

  function editCustomServer(id: string, updates: Partial<PublicServer>): void {
    const index = customServers.value.findIndex(s => s.id === id)
    if (index !== -1) {
      const updated = { ...customServers.value[index], ...updates }
      const next = [...customServers.value]
      next[index] = updated
      customServers.value = next
      pingSingleServer(updated, true)
    }
  }

  function removeCustomServer(id: string): void {
    customServers.value = customServers.value.filter(s => s.id !== id)
    favoriteServerIds.value = favoriteServerIds.value.filter(fid => fid !== id)
  }

  function getServerStatus(server: PublicServer): PublicServerStatus {
    const key = `${server.host}:${server.port ?? 25565}`
    return statusMap.value[key] || {
      online: false,
      players: { online: -1, max: -1 },
      ping: -1,
      versionName: '',
      pinging: false,
      lastPingTime: 0,
    }
  }

  function isFavorite(id: string): boolean {
    return favoriteServerIds.value.includes(id)
  }

  function toggleFavorite(id: string): void {
    if (favoriteServerIds.value.includes(id)) {
      favoriteServerIds.value = favoriteServerIds.value.filter(fid => fid !== id)
    } else {
      favoriteServerIds.value = [...favoriteServerIds.value, id]
    }
  }

  return {
    allServers,
    customServers,
    favoriteServerIds,
    statusMap,
    isRefreshingAll,
    isFavorite,
    toggleFavorite,
    pingSingleServer,
    pingAllServers,
    addCustomServer,
    editCustomServer,
    removeCustomServer,
    getServerStatus,
  }
}
