import { ref, computed } from 'vue'

const isMusicPlaying = ref(false)
const hasMusicTracks = ref(false)
const audioElementRef = ref<HTMLAudioElement | null>(null)
const currentTrackTitle = ref('')

// 32 frequency bins for DJ equalizer visualizer (0 to 1)
const frequencyBars = ref<number[]>(new Array(32).fill(0))
const beatPulse = ref(0)

let animFrameId: number | null = null
let audioContext: AudioContext | null = null
let analyser: AnalyserNode | null = null
let sourceNode: MediaElementAudioSourceNode | null = null
let dataArray: Uint8Array<ArrayBuffer> | null = null

function updateVisualizerLoop() {
  if (!isMusicPlaying.value) {
    // Graceful decay when paused
    let anyActive = false
    const bars = frequencyBars.value.slice()
    for (let i = 0; i < bars.length; i++) {
      if (bars[i] > 0.01) {
        bars[i] = Math.max(0, bars[i] * 0.85)
        anyActive = true
      } else {
        bars[i] = 0
      }
    }
    frequencyBars.value = bars
    beatPulse.value = Math.max(0, beatPulse.value * 0.8)
    if (anyActive) {
      animFrameId = requestAnimationFrame(updateVisualizerLoop)
    } else {
      animFrameId = null
    }
    return
  }

  // If live Web Audio analyser is available and active
  if (analyser && dataArray) {
    try {
      analyser.getByteFrequencyData(dataArray)
      const bars: number[] = []
      const step = Math.floor(dataArray.length / 32)
      let sum = 0
      for (let i = 0; i < 32; i++) {
        const val = dataArray[i * step] / 255
        bars.push(val)
        if (i < 8) sum += val // Low frequencies for bass beat
      }
      frequencyBars.value = bars
      beatPulse.value = Math.min(1, (sum / 8) * 1.4)
    } catch {
      useSyntheticBeats()
    }
  } else {
    useSyntheticBeats()
  }

  animFrameId = requestAnimationFrame(updateVisualizerLoop)
}

function useSyntheticBeats() {
  const now = performance.now() / 1000
  // 128 BPM electronic beat cadence (DJ Alok style)
  const bpm = 128
  const beatTime = (now * (bpm / 60)) % 4
  const subBeat = beatTime % 1

  // Bass kick on every beat
  const kick = Math.pow(Math.max(0, 1 - subBeat * 3.5), 2)
  // Snare on beats 2 and 4
  const isSnareBeat = beatTime >= 1 && beatTime < 2 || beatTime >= 3 && beatTime < 4
  const snare = isSnareBeat ? Math.pow(Math.max(0, 1 - (subBeat % 1) * 3), 1.8) * 0.8 : 0

  beatPulse.value = Math.min(1, kick * 0.85 + snare * 0.45)

  const bars: number[] = []
  for (let i = 0; i < 32; i++) {
    // Frequency distribution: bass on edges/low, mids in middle, treble on upper
    const wave = Math.sin(now * 8 + i * 0.45) * 0.25 + 0.35
    const octBoost = (i < 8) ? kick * 0.7 : (i >= 8 && i < 20) ? snare * 0.6 : Math.sin(now * 14 + i) * 0.3 + 0.2
    const height = Math.min(1, Math.max(0.12, wave * 0.5 + octBoost + (Math.sin(now * 4 + i * 0.8) * 0.15)))
    bars.push(height)
  }
  frequencyBars.value = bars
}

function setupAudioSource(el: HTMLAudioElement) {
  if (sourceNode || typeof window === 'undefined') return
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    audioContext = new AudioCtx()
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 128
    dataArray = new Uint8Array(analyser.frequencyBinCount)
    sourceNode = audioContext.createMediaElementSource(el)
    sourceNode.connect(analyser)
    analyser.connect(audioContext.destination)
  } catch (e) {
    // Cross-origin audio or already connected; fallback to algorithmic beat
    console.debug('[backgroundMusic] WebAudio analyser fallback to synthetic beats:', e)
  }
}

export function useBackgroundMusic() {
  function registerAudioElement(el: HTMLAudioElement | null) {
    audioElementRef.value = el
    if (el) {
      setupAudioSource(el)
    }
  }

  function setPlayingState(playing: boolean) {
    isMusicPlaying.value = playing
    if (audioContext && audioContext.state === 'suspended' && playing) {
      audioContext.resume().catch(() => {})
    }
    if (playing) {
      if (!animFrameId) {
        animFrameId = requestAnimationFrame(updateVisualizerLoop)
      }
    }
  }

  function setHasTracks(has: boolean) {
    hasMusicTracks.value = has
  }

  function setTrackTitle(title: string) {
    currentTrackTitle.value = title
  }

  function play() {
    if (audioElementRef.value) {
      audioElementRef.value.play().catch(() => {})
      setPlayingState(true)
    }
  }

  function pause() {
    if (audioElementRef.value) {
      audioElementRef.value.pause()
      setPlayingState(false)
    }
  }

  function toggle() {
    if (isMusicPlaying.value) {
      pause()
    } else {
      play()
    }
  }

  return {
    isMusicPlaying: computed(() => isMusicPlaying.value),
    hasMusicTracks: computed(() => hasMusicTracks.value),
    currentTrackTitle: computed(() => currentTrackTitle.value),
    frequencyBars: computed(() => frequencyBars.value),
    beatPulse: computed(() => beatPulse.value),
    registerAudioElement,
    setPlayingState,
    setHasTracks,
    setTrackTitle,
    play,
    pause,
    toggle,
  }
}
