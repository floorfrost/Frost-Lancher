export type PerformanceProfile = 'performance' | 'balanced' | 'quality'

export interface ProfileDetails {
  name: string
  renderDistance: number
  simulationDistance: number
  graphicsMode: number // 0 = fast, 1 = fancy, 2 = fabulous
  fancyGraphics: boolean
  ao: number // 0 = off, 1 = min, 2 = max
  particles: number // 0 = all, 1 = decreased, 2 = minimal
  renderClouds: boolean | 'fast'
  entityShadows: boolean
  mipmapLevels: number
  biomeBlendRadius: number
  entityDistanceScaling: number
  bobView: boolean
  description: string
  features: string[]
}

export const PROFILE_CONFIGS: Record<PerformanceProfile, ProfileDetails> = {
  performance: {
    name: 'Performance',
    renderDistance: 8,
    simulationDistance: 5,
    graphicsMode: 0, // Fast
    fancyGraphics: false,
    ao: 0, // Off
    particles: 2, // Minimal (animations off)
    renderClouds: false, // Clouds Off
    entityShadows: false,
    mipmapLevels: 0,
    biomeBlendRadius: 0,
    entityDistanceScaling: 0.5,
    bobView: false,
    description: 'Tuned for maximum FPS and low-end hardware. Zero external mods for instant, crash-free launch.',
    features: [
      '8 Chunks Render Distance',
      'Fast Graphics & Minimal Particles',
      'Animations & Clouds OFF',
      'Ambient Occlusion OFF',
      'Instant Launch (No external mods)',
    ],
  },
  balanced: {
    name: 'Balanced',
    renderDistance: 12,
    simulationDistance: 8,
    graphicsMode: 1, // Fancy
    fancyGraphics: true,
    ao: 1, // Minimum
    particles: 0, // All
    renderClouds: true,
    entityShadows: true,
    mipmapLevels: 2,
    biomeBlendRadius: 2,
    entityDistanceScaling: 1.0,
    bobView: true,
    description: 'Optimal balance between smooth framerate and visual fidelity for everyday gameplay.',
    features: [
      '12 Chunks Render Distance',
      'Fancy Graphics & Normal Lighting',
      'Standard Particles & Animations',
      'Vanilla Clouds & Shadows Enabled',
    ],
  },
  quality: {
    name: 'Quality',
    renderDistance: 16,
    simulationDistance: 12,
    graphicsMode: 2, // Fabulous / Maximum
    fancyGraphics: true,
    ao: 2, // Maximum
    particles: 0, // All animations ON
    renderClouds: true, // Fancy clouds
    entityShadows: true,
    mipmapLevels: 4, // Maximum Mipmap
    biomeBlendRadius: 5, // Maximum 5x5 Biome Blend
    entityDistanceScaling: 1.0,
    bobView: true,
    description: 'Maximum visual fidelity for high-end systems. High render distance, all animations and fabulous lighting.',
    features: [
      '16 Chunks Render Distance',
      'Fabulous Graphics & Maximum Shading',
      'All Animations & Particles ON',
      'Full Entity Shadows & 5x5 Biome Blend',
    ],
  },
}

export interface ApplyOptimizationOptions {
  instancePath: string
  profile: PerformanceProfile
  editGameSetting: (options: any) => Promise<void>
}

/**
 * Apply the selected performance/quality profile to the instance's options.txt.
 * Purely configures native Minecraft game settings without injecting external mods.
 */
export async function applyInstanceOptimizationProfile(options: ApplyOptimizationOptions): Promise<void> {
  const { instancePath, profile, editGameSetting } = options
  const config = PROFILE_CONFIGS[profile] || PROFILE_CONFIGS.performance

  try {
    await editGameSetting({
      instancePath,
      renderDistance: config.renderDistance,
      simulationDistance: config.simulationDistance,
      graphicsMode: config.graphicsMode,
      fancyGraphics: config.fancyGraphics,
      ao: config.ao,
      particles: config.particles,
      renderClouds: config.renderClouds,
      entityShadows: config.entityShadows,
      mipmapLevels: config.mipmapLevels,
      biomeBlendRadius: config.biomeBlendRadius,
      entityDistanceScaling: config.entityDistanceScaling,
      bobView: config.bobView,
    })
  } catch {
    // Gracefully handle any file access errors
  }
}
