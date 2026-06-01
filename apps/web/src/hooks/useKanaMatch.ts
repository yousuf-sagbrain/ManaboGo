'use client'

import { useState, useRef, useCallback } from 'react'
import { kanaPairs } from '@/data/kana/kanaMapping'
import type { KanaChar } from '@/data/kana/types'

export type MatchDirection = 'hira-to-kata' | 'kata-to-hira'

export interface MatchSession {
  correct: number
  incorrect: number
  streak: number
  streakMax: number
  total: number
}

export interface UseKanaMatchReturn {
  source:  KanaChar
  correct: KanaChar
  options: KanaChar[]
  session: MatchSession
  state:   'answering' | 'correct' | 'incorrect'
  chosen:  KanaChar | null
  select:  (chosen: KanaChar) => void
  next:    () => void
}

const RECENT_WINDOW = 8
const INIT_SESSION: MatchSession = { correct: 0, incorrect: 0, streak: 0, streakMax: 0, total: 0 }

const ALL_HIRAGANA = kanaPairs.map(p => p.hiragana)
const ALL_KATAKANA = kanaPairs.map(p => p.katakana)

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickPair(recent: number[]) {
  const available = kanaPairs.filter(p => !recent.includes(p.index))
  const pool = available.length > 0 ? available : kanaPairs
  return pool[Math.floor(Math.random() * pool.length)]
}

function buildQ(dir: MatchDirection, recent: number[]) {
  const pair    = pickPair(recent)
  const src     = dir === 'hira-to-kata' ? pair.hiragana : pair.katakana
  const cor     = dir === 'hira-to-kata' ? pair.katakana : pair.hiragana
  const targets = dir === 'hira-to-kata' ? ALL_KATAKANA : ALL_HIRAGANA
  const distractors = shuffle(targets.filter(c => c.char !== cor.char)).slice(0, 3)
  return { source: src, correct: cor, options: shuffle([cor, ...distractors]), pairIndex: pair.index }
}

export function useKanaMatch(direction: MatchDirection): UseKanaMatchReturn {
  const recentRef    = useRef<number[]>([])
  const directionRef = useRef(direction)
  const initRef      = useRef<ReturnType<typeof buildQ> | null>(null)

  if (!initRef.current) {
    const q = buildQ(direction, [])
    recentRef.current = [q.pairIndex]
    initRef.current   = q
  }

  const [source,  setSource]  = useState<KanaChar>(initRef.current.source)
  const [correct, setCorrect] = useState<KanaChar>(initRef.current.correct)
  const [options, setOptions] = useState<KanaChar[]>(initRef.current.options)
  const [state,   setState]   = useState<'answering' | 'correct' | 'incorrect'>('answering')
  const [chosen,  setChosen]  = useState<KanaChar | null>(null)
  const [session, setSession] = useState<MatchSession>(INIT_SESSION)

  if (directionRef.current !== direction) {
    directionRef.current = direction
    recentRef.current    = []
    const q = buildQ(direction, [])
    recentRef.current = [q.pairIndex]
    setSource(q.source)
    setCorrect(q.correct)
    setOptions(q.options)
    setState('answering')
    setChosen(null)
    setSession(INIT_SESSION)
  }

  const select = useCallback((ch: KanaChar) => {
    if (state !== 'answering') return
    setChosen(ch)
    const isCorrect = ch.char === correct.char
    setState(isCorrect ? 'correct' : 'incorrect')
    setSession(s => {
      const streak = isCorrect ? s.streak + 1 : 0
      return {
        correct:   isCorrect ? s.correct + 1 : s.correct,
        incorrect: isCorrect ? s.incorrect   : s.incorrect + 1,
        streak,
        streakMax: Math.max(s.streakMax, streak),
        total:     s.total + 1,
      }
    })
  }, [state, correct])

  const next = useCallback(() => {
    const q = buildQ(directionRef.current, recentRef.current)
    recentRef.current = [...recentRef.current, q.pairIndex].slice(-RECENT_WINDOW)
    setSource(q.source)
    setCorrect(q.correct)
    setOptions(q.options)
    setState('answering')
    setChosen(null)
  }, [])

  return { source, correct, options, session, state, chosen, select, next }
}
