import { describe, expect, it, vi } from 'vitest'
import { DEFAULT_SERVERS, usePublicServers } from './publicServers'

vi.mock('@/composables', () => ({
  useService: () => ({
    pingServer: vi.fn().mockResolvedValue({
      version: { name: '1.20.4', protocol: 765 },
      players: { online: 15420, max: 100000, sample: [{ name: 'Player1', id: 'uuid-1' }] },
      ping: 42,
      description: 'Hypixel Network',
      favicon: 'data:image/png;base64,abc',
    }),
  }),
}))

describe('publicServers', () => {
  it('contains famous servers including Indian servers, Hypixel, 2b2t, and account support tags', () => {
    expect(DEFAULT_SERVERS.length).toBeGreaterThanOrEqual(18)

    // Indian servers
    const firemc = DEFAULT_SERVERS.find(s => s.host === 'play.firemc.fun')
    expect(firemc).toBeDefined()
    expect(firemc?.isIndian).toBe(true)
    expect(firemc?.accountType).toBe('cracked')

    const ashsmp = DEFAULT_SERVERS.find(s => s.host === 'play.ashsmp.in')
    expect(ashsmp).toBeDefined()
    expect(ashsmp?.isIndian).toBe(true)
    expect(ashsmp?.accountType).toBe('cracked')

    const goldenelytra = DEFAULT_SERVERS.find(s => s.host === 'goldenelytra.fun')
    expect(goldenelytra).toBeDefined()
    expect(goldenelytra?.isIndian).toBe(true)
    expect(goldenelytra?.accountType).toBe('cracked')

    // Premium server
    const hypixel = DEFAULT_SERVERS.find(s => s.host === 'mc.hypixel.net')
    expect(hypixel).toBeDefined()
    expect(hypixel?.name).toContain('Hypixel')
    expect(hypixel?.accountType).toBe('premium')

    // Cracked international server
    const pika = DEFAULT_SERVERS.find(s => s.host === 'play.pika-network.net')
    expect(pika).toBeDefined()
    expect(pika?.accountType).toBe('cracked')

    const anarchy = DEFAULT_SERVERS.find(s => s.host === '2b2t.org')
    expect(anarchy).toBeDefined()
    expect(anarchy?.accountType).toBe('premium')
  })

  it('allows adding and removing custom servers', () => {
    const { addCustomServer, removeCustomServer, customServers, allServers } = usePublicServers()

    const newServer = addCustomServer({
      name: 'Test Private SMP',
      host: 'test.smp.net',
      port: 25565,
      category: 'survival',
      tags: ['SMP', 'Test'],
      description: 'A test server for players',
    })

    expect(newServer.id).toBeDefined()
    expect(newServer.custom).toBe(true)
    expect(customServers.value.some(s => s.id === newServer.id)).toBe(true)
    expect(allServers.value.some(s => s.id === newServer.id)).toBe(true)

    // Remove custom server
    removeCustomServer(newServer.id)
    expect(customServers.value.some(s => s.id === newServer.id)).toBe(false)
  })

  it('correctly manages favorite servers', () => {
    const { isFavorite, toggleFavorite, favoriteServerIds } = usePublicServers()
    const serverId = 'hypixel'

    const initiallyFav = isFavorite(serverId)
    toggleFavorite(serverId)
    expect(isFavorite(serverId)).toBe(!initiallyFav)

    // Toggle back
    toggleFavorite(serverId)
    expect(isFavorite(serverId)).toBe(initiallyFav)
  })

  it('correctly retrieves server status format', () => {
    const { getServerStatus } = usePublicServers()
    const testServer = DEFAULT_SERVERS[0]
    const status = getServerStatus(testServer)

    expect(status).toBeDefined()
    expect(typeof status.online).toBe('boolean')
    expect(typeof status.ping).toBe('number')
    expect(status.players).toHaveProperty('online')
    expect(status.players).toHaveProperty('max')
  })
})
