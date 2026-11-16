import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'

export type SkinAnimationType = 'jett' | 'gojo' | 'slayer'

export interface SkinAnimationOption {
  id: SkinAnimationType
  name: string
  shortName: string
  icon: string
  description: string
}

export const SKIN_ANIMATION_OPTIONS: SkinAnimationOption[] = [
  {
    id: 'jett',
    name: 'Jett floating animation',
    shortName: 'Jett',
    icon: 'air',
    description: 'Updraft wind & aerodynamic float',
  },
  {
    id: 'gojo',
    name: 'Gojo floating animation',
    shortName: 'Gojo',
    icon: 'wb_sunny',
    description: 'Divine sunlight & celestial levitation',
  },
  {
    id: 'slayer',
    name: 'Demon Slayer flame breathing',
    shortName: 'Demon Slayer',
    icon: 'local_fire_department',
    description: 'Blazing Nichirin sword & Hinokami Kagura rage aura',
  },
]

export function useSkinAnimation() {
  const selectedAnimation = useLocalStorage<SkinAnimationType>('characterStageAnimation', 'slayer')

  const activeAnimationOption = computed(() =>
    SKIN_ANIMATION_OPTIONS.find((opt) => opt.id === selectedAnimation.value) || SKIN_ANIMATION_OPTIONS[2],
  )

  function setAnimation(type: SkinAnimationType) {
    selectedAnimation.value = type
  }

  return {
    selectedAnimation,
    activeAnimationOption,
    setAnimation,
    options: SKIN_ANIMATION_OPTIONS,
  }
}
