import { useState, useCallback } from 'react'

const MUTE_KEY = 'manabogo_audio_muted'
const SLOW_KEY = 'manabogo_audio_slow'

const PREFERRED_JA_VOICES = ['Kyoko', 'O-ren', 'Haruka', 'Google 日本語', 'Otoya']
const VOWELS = new Set(['あ', 'い', 'う', 'え', 'お', 'ア', 'イ', 'ウ', 'エ', 'オ'])

const RATE_VOWEL_NORMAL = 0.65
const RATE_VOWEL_SLOW   = 0.5
const RATE_KANA_NORMAL  = 0.8
const RATE_KANA_SLOW    = 0.6
const MP3_RATE_NORMAL   = 1.0
const MP3_RATE_SLOW     = 0.75

const KANA_TO_HIRAGANA: Record<string, string> = {
  'あ':'あ','い':'い','う':'う','え':'え','お':'お',
  'か':'か','き':'き','く':'く','け':'け','こ':'こ',
  'さ':'さ','し':'し','す':'す','せ':'せ','そ':'そ',
  'た':'た','ち':'ち','つ':'つ','て':'て','と':'と',
  'な':'な','に':'に','ぬ':'ぬ','ね':'ね','の':'の',
  'は':'は','ひ':'ひ','ふ':'ふ','へ':'へ','ほ':'ほ',
  'ま':'ま','み':'み','む':'む','め':'め','も':'も',
  'や':'や','ゆ':'ゆ','よ':'よ',
  'ら':'ら','り':'り','る':'る','れ':'れ','ろ':'ろ',
  'わ':'わ','を':'を','ん':'ん',
  'ア':'あ','イ':'い','ウ':'う','エ':'え','オ':'お',
  'カ':'か','キ':'き','ク':'く','ケ':'け','コ':'こ',
  'サ':'さ','シ':'し','ス':'す','セ':'せ','ソ':'そ',
  'タ':'た','チ':'ち','ツ':'つ','テ':'て','ト':'と',
  'ナ':'な','ニ':'に','ヌ':'ぬ','ネ':'ね','ノ':'の',
  'ハ':'は','ヒ':'ひ','フ':'ふ','ヘ':'へ','ホ':'ほ',
  'マ':'ま','ミ':'み','ム':'む','メ':'め','モ':'も',
  'ヤ':'や','ユ':'ゆ','ヨ':'よ',
  'ラ':'ら','リ':'り','ル':'る','レ':'れ','ロ':'ろ',
  'ワ':'わ','ヲ':'を','ン':'ん',
}

const VOICED_TO_ROMAJI: Record<string, string> = {
  'が':'ga','ぎ':'gi','ぐ':'gu','げ':'ge','ご':'go',
  'ガ':'ga','ギ':'gi','グ':'gu','ゲ':'ge','ゴ':'go',
  'ざ':'za','じ':'ji','ず':'zu','ぜ':'ze','ぞ':'zo',
  'ザ':'za','ジ':'ji','ズ':'zu','ゼ':'ze','ゾ':'zo',
  'だ':'da','ぢ':'ji','づ':'zu','で':'de','ど':'do',
  'ダ':'da','ヂ':'ji','ヅ':'zu','デ':'de','ド':'do',
  'ば':'ba','び':'bi','ぶ':'bu','べ':'be','ぼ':'bo',
  'バ':'ba','ビ':'bi','ブ':'bu','ベ':'be','ボ':'bo',
  'ぱ':'pa','ぴ':'pi','ぷ':'pu','ぺ':'pe','ぽ':'po',
  'パ':'pa','ピ':'pi','プ':'pu','ペ':'pe','ポ':'po',
}

const audioCache = new Map<string, HTMLAudioElement>()

// Single token to cancel any pending scheduled play before starting a new one.
// This prevents rapid successive calls from queuing two plays.
let pendingPlayTimer: ReturnType<typeof setTimeout> | null = null

function getAudio(char: string): HTMLAudioElement | null {
  const romaji = VOICED_TO_ROMAJI[char]
  if (romaji) {
    const key = `v:${romaji}`
    if (!audioCache.has(key)) {
      const el = new Audio(`/audio/kana/voiced/${romaji}.mp3`)
      el.preload = 'auto'
      audioCache.set(key, el)
    }
    return audioCache.get(key)!
  }
  const hira = KANA_TO_HIRAGANA[char]
  if (!hira) return null
  const key = `h:${hira}`
  if (!audioCache.has(key)) {
    const el = new Audio(`/audio/kana/hiragana/${encodeURIComponent(hira)}.mp3`)
    el.preload = 'auto'
    audioCache.set(key, el)
  }
  return audioCache.get(key)!
}

function pickJaVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const ja = voices.filter(v => v.lang === 'ja-JP' || v.lang.startsWith('ja'))
  if (!ja.length) return null
  for (const name of PREFERRED_JA_VOICES) {
    const match = ja.find(v => v.name.includes(name))
    if (match) return match
  }
  return ja.find(v => v.lang === 'ja-JP') ?? ja[0]
}

function ttsRateFor(char: string, slow: boolean): number {
  if (VOWELS.has(char)) return slow ? RATE_VOWEL_SLOW : RATE_VOWEL_NORMAL
  return slow ? RATE_KANA_SLOW : RATE_KANA_NORMAL
}

/** Stop everything currently playing — both cached MP3s and TTS. */
function stopAll() {
  // Cancel any play that was scheduled but not yet started
  if (pendingPlayTimer !== null) {
    clearTimeout(pendingPlayTimer)
    pendingPlayTimer = null
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
  for (const a of audioCache.values()) {
    if (!a.paused) {
      a.pause()
      a.currentTime = 0
    }
  }
}

interface InternalOpts {
  slow: boolean
  rateOverride?: number
}

function speakJaInternal(char: string, opts: InternalOpts) {
  // Cancel everything before scheduling the new play
  stopAll()

  const audio = getAudio(char)

  // Small delay so rapid character changes (e.g. React double-render in dev)
  // don't fire two plays — the second call cancels the first timer.
  pendingPlayTimer = setTimeout(() => {
    pendingPlayTimer = null

    if (audio) {
      audio.currentTime = 0
      const mp3Rate = opts.rateOverride !== undefined
        ? Math.max(0.5, Math.min(2, opts.rateOverride))
        : (opts.slow ? MP3_RATE_SLOW : MP3_RATE_NORMAL)
      audio.playbackRate = mp3Rate
      void audio.play().catch(() => {
        ttsSpeak(char, opts.rateOverride ?? ttsRateFor(char, opts.slow))
      })
    } else {
      ttsSpeak(char, opts.rateOverride ?? ttsRateFor(char, opts.slow))
    }
  }, 30)
}

function ttsSpeak(char: string, rate: number) {
  if (!('speechSynthesis' in window)) return
  const synth = window.speechSynthesis
  // Short gap so cancel() from stopAll() fully clears before speak()
  setTimeout(() => {
    const u = new SpeechSynthesisUtterance(char)
    u.lang  = 'ja-JP'
    u.rate  = rate
    u.pitch = 1
    const voice = pickJaVoice(synth.getVoices())
    if (voice) u.voice = voice
    synth.speak(u)
  }, 50)
}

export function speakJa(char: string, rate?: number) {
  speakJaInternal(char, { rateOverride: rate, slow: false })
}

export function usePronunciation() {
  const [muted, setMuted] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem(MUTE_KEY) === 'true'
  )
  const [slow, setSlow] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem(SLOW_KEY) === 'true'
  )

  const speak = useCallback(
    (char: string) => {
      if (muted) return
      speakJaInternal(char, { slow })
    },
    [muted, slow]
  )

  const replay = useCallback(
    (char: string, opts?: { slow?: boolean }) => {
      if (muted) return
      speakJaInternal(char, { slow: opts?.slow ?? slow })
    },
    [muted, slow]
  )

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const next = !prev
      localStorage.setItem(MUTE_KEY, String(next))
      if (next) stopAll()
      return next
    })
  }, [])

  const toggleSlow = useCallback(() => {
    setSlow(prev => {
      const next = !prev
      localStorage.setItem(SLOW_KEY, String(next))
      return next
    })
  }, [])

  return { speak, replay, muted, toggleMute, slow, toggleSlow }
}
