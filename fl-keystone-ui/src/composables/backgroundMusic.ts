import { ref, computed } from 'vue'

// Module-level reactive singleton for background music playback
const isPlaying = ref(false)
const currentTitle = ref('')
const currentUrl = ref('')
const hasTracks = ref(false)
const volume = ref(1.0)
const isMuted = ref(false)
const isShuffle = ref(false)

// Function delegates wired from AppAudioPlayer
let playDelegate: (() => void) | null = null
let pauseDelegate: (() => void) | null = null
let toggleDelegate: (() => void) | null = null
let nextDelegate: (() => void) | null = null
let prevDelegate: (() => void) | null = null
let setVolumeDelegate: ((v: number) => void) | null = null

// Frequency bars for live audio visualizer (24 frequency bars)
const frequencyBars = ref<number[]>(new Array(24).fill(0.15))
let visualizerFrameId: number | null = null
let audioContext: AudioContext | null = null
let analyserNode: AnalyserNode | null = null
let freqData: Uint8Array<ArrayBuffer> | null = null
let sourceNode: MediaElementAudioSourceNode | null = null

function updateFrequencyLoop() {
  if (!isPlaying.value) {
    // Smooth decay to resting state
    let stillAnimating = false
    const bars = frequencyBars.value.slice()
    for (let i = 0; i < bars.length; i++) {
      const rest = 0.12 + Math.sin(i * 0.4) * 0.06
      if (Math.abs(bars[i] - rest) > 0.01) {
        bars[i] += (rest - bars[i]) * 0.16
        stillAnimating = true
      }
    }
    frequencyBars.value = bars
    if (stillAnimating) {
      visualizerFrameId = requestAnimationFrame(updateFrequencyLoop)
    } else {
      visualizerFrameId = null
    }
    return
  }

  // Active playing: read from AnalyserNode or generate rhythmic synthetic beat
  if (analyserNode && freqData) {
    try {
      analyserNode.getByteFrequencyData(freqData)
      const bars: number[] = []
      const step = Math.floor(freqData.length / 24)
      for (let i = 0; i < 24; i++) {
        const val = freqData[i * step] / 255
        bars.push(Math.max(0.12, Math.min(1.0, val)))
      }
      frequencyBars.value = bars
    } catch {
      useSyntheticVisualizer()
    }
  } else {
    useSyntheticVisualizer()
  }

  visualizerFrameId = requestAnimationFrame(updateFrequencyLoop)
}

function useSyntheticVisualizer() {
  const now = performance.now() / 1000
  const bpm = 124
  const beatTime = (now * (bpm / 60)) % 4
  const subBeat = beatTime % 1
  const kick = Math.pow(Math.max(0, 1 - subBeat * 3.2), 2)
  const isSnare = (beatTime >= 1 && beatTime < 2) || (beatTime >= 3 && beatTime < 4)
  const snare = isSnare ? Math.pow(Math.max(0, 1 - (subBeat % 1) * 2.8), 2) * 0.75 : 0

  const bars: number[] = []
  for (let i = 0; i < 24; i++) {
    // Wave dynamics across 24 frequency channels
    const wave = Math.sin(now * 7.5 + i * 0.4) * 0.3 + 0.4
    const boost = (i < 6) ? kick * 0.75 : (i >= 6 && i < 16) ? snare * 0.6 : Math.sin(now * 11 + i * 0.8) * 0.28
    const val = Math.min(1.0, Math.max(0.12, wave * 0.5 + boost + (Math.sin(now * 3.5 + i * 0.6) * 0.15)))
    bars.push(val)
  }
  frequencyBars.value = bars
}

function startVisualizer() {
  if (!visualizerFrameId) {
    visualizerFrameId = requestAnimationFrame(updateFrequencyLoop)
  }
}

function setupAudioSource(el: HTMLAudioElement) {
  if (sourceNode || typeof window === 'undefined') return
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    audioContext = new AudioCtx()
    analyserNode = audioContext.createAnalyser()
    analyserNode.fftSize = 64
    freqData = new Uint8Array(analyserNode.frequencyBinCount)
    sourceNode = audioContext.createMediaElementSource(el)
    sourceNode.connect(analyserNode)
    analyserNode.connect(audioContext.destination)
  } catch (e) {
    console.debug('[backgroundMusic] WebAudio fallback to synthetic beats:', e)
  }
}

export function useBackgroundMusic() {
  function registerAudioPlayer(config: {
    audioElement: HTMLAudioElement | null
    playing: boolean
    hasTracks: boolean
    title: string
    url: string
    volume: number
    shuffle: boolean
    play: () => void
    pause: () => void
    toggle: () => void
    next: () => void
    prev: () => void
    setVolume: (v: number) => void
  }) {
    isPlaying.value = config.playing
    hasTracks.value = config.hasTracks
    currentTitle.value = config.title
    currentUrl.value = config.url
    volume.value = config.volume
    isShuffle.value = config.shuffle

    playDelegate = config.play
    pauseDelegate = config.pause
    toggleDelegate = config.toggle
    nextDelegate = config.next
    prevDelegate = config.prev
    setVolumeDelegate = config.setVolume

    if (config.audioElement) {
      setupAudioSource(config.audioElement)
    }

    if (config.playing) {
      startVisualizer()
    }
  }

  function setPlaying(p: boolean) {
    isPlaying.value = p
    if (p) {
      if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {})
      }
      startVisualizer()
    }
  }

  function setTitle(t: string) {
    currentTitle.value = t
  }

  function setUrl(u: string) {
    currentUrl.value = u
  }

  function setHasTracks(h: boolean) {
    hasTracks.value = h
  }

  function setVolume(v: number) {
    volume.value = v
    if (setVolumeDelegate) setVolumeDelegate(v)
  }

  function setShuffle(s: boolean) {
    isShuffle.value = s
  }

  function play() {
    if (playDelegate) playDelegate()
    setPlaying(true)
  }

  function pause() {
    if (pauseDelegate) pauseDelegate()
    setPlaying(false)
  }

  function toggle() {
    if (toggleDelegate) {
      toggleDelegate()
    } else if (isPlaying.value) {
      pause()
    } else {
      play()
    }
  }

  function next() {
    if (nextDelegate) nextDelegate()
  }

  function prev() {
    if (prevDelegate) prevDelegate()
  }

  return {
    isPlaying: computed(() => isPlaying.value),
    hasTracks: computed(() => hasTracks.value),
    currentTitle: computed(() => currentTitle.value),
    currentUrl: computed(() => currentUrl.value),
    volume: computed(() => volume.value),
    isMuted: computed(() => isMuted.value),
    isShuffle: computed(() => isShuffle.value),
    frequencyBars: computed(() => frequencyBars.value),
    registerAudioPlayer,
    setPlaying,
    setTitle,
    setUrl,
    setHasTracks,
    setVolume,
    setShuffle,
    play,
    pause,
    toggle,
    next,
    prev,
  }
}
