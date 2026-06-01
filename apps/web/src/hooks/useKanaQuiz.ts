'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { hiragana } from '@/data/kana/hiragana'
import { katakana } from '@/data/kana/katakana'
import type { KanaChar } from '@/data/kana/types'

export type QuizState  = 'answering' | 'correct' | 'incorrect'
export type ScriptMode = 'hiragana' | 'katakana' | 'both'
export type QuizMode   = 'typing' | 'multiple-choice'

export interface QuizSession {
  correct:   number
  incorrect: number
  streak:    number
  streakMax: number
  total:     number
}

export interface AnsweredChar {
  char:    KanaChar
  correct: boolean
}

export interface UseKanaQuizReturn {
  current:         KanaChar | undefined
  dataset:         KanaChar[]
  input:           string
  state:           QuizState
  session:         QuizSession
  answeredChars:   AnsweredChar[]
  setInput:        (value: string) => void
  submit:          (override?: string) => void
  submitSelection: (romaji: string) => void
  next:            () => void
}

const INIT_SESSION: QuizSession = { correct: 0, incorrect: 0, streak: 0, streakMax: 0, total: 0 }

// How many recent characters to exclude when picking the next one.
const RECENT_WINDOW = 8

function buildDataset(script: ScriptMode): KanaChar[] {
  if (script === 'hiragana') return hiragana
  if (script === 'katakana') return katakana
  return [...hiragana, ...katakana]
}

function pickRandom(dataset: KanaChar[], exclude: Set<string>): KanaChar | undefined {
  if (dataset.length === 0) return undefined
  const pool = exclude.size ? dataset.filter(k => !exclude.has(k.char)) : dataset
  const source = pool.length > 0 ? pool : dataset
  return source[Math.floor(Math.random() * source.length)]
}

function checkCorrect(input: string, char: KanaChar): boolean {
  const v = input.trim().toLowerCase()
  return v === char.romaji || char.aliases.includes(v)
}

export function useKanaQuiz(
  script: ScriptMode = 'hiragana',
  mode: QuizMode = 'typing',
  characterSubset?: KanaChar[],
): UseKanaQuizReturn {
  const pickFrom = characterSubset?.length ? characterSubset : buildDataset(script)
  const dataset  = buildDataset(characterSubset?.length ? 'both' : script)

  const [current,       setCurrent]       = useState<KanaChar | undefined>(() => pickRandom(pickFrom, new Set()))
  const [input,         setInput]         = useState('')
  const [state,         setState]         = useState<QuizState>('answering')
  const [session,       setSession]       = useState<QuizSession>(INIT_SESSION)
  const [answeredChars, setAnsweredChars] = useState<AnsweredChar[]>([])

  const recentRef    = useRef<string[]>([])
  const sessionRef   = useRef<QuizSession>(INIT_SESSION)
  const inputRef     = useRef<string>('')
  inputRef.current   = input

  useEffect(() => {
    const ds = characterSubset?.length ? characterSubset : buildDataset(script)
    recentRef.current = []
    const picked = pickRandom(ds, new Set())
    if (picked) setCurrent(picked)
    setInput('')
    setState('answering')
    setSession(INIT_SESSION)
    sessionRef.current = INIT_SESSION
    setAnsweredChars([])
  }, [script, characterSubset])

  const _recordResult = useCallback((correct: boolean, userInput: string) => {
    if (!current) return
    setState(correct ? 'correct' : 'incorrect')
    setAnsweredChars(prev => [...prev, { char: current, correct }])
    setSession(prev => {
      const newStreak = correct ? prev.streak + 1 : 0
      const next: QuizSession = {
        correct:   prev.correct   + (correct ? 1 : 0),
        incorrect: prev.incorrect + (correct ? 0 : 1),
        streak:    newStreak,
        streakMax: Math.max(prev.streakMax, newStreak),
        total:     prev.total + 1,
      }
      sessionRef.current = next
      return next
    })
  }, [current])

  const submit = useCallback((override?: string) => {
    if (state !== 'answering' || !current) return
    const answer = override ?? inputRef.current
    if (!override && answer.trim() === '') return
    _recordResult(checkCorrect(answer, current), answer.trim().toLowerCase())
  }, [state, current, _recordResult])

  const submitSelection = useCallback((selectedRomaji: string) => {
    if (state !== 'answering' || !current) return
    const correct = selectedRomaji === current.romaji || current.aliases.includes(selectedRomaji)
    _recordResult(correct, selectedRomaji)
  }, [state, current, _recordResult])

  const next = useCallback(() => {
    if (state === 'answering') return
    const ds = characterSubset?.length ? characterSubset : buildDataset(script)
    if (current) recentRef.current = [...recentRef.current, current.char].slice(-RECENT_WINDOW)
    const picked = pickRandom(ds, new Set(recentRef.current))
    if (picked) setCurrent(picked)
    inputRef.current = ''
    setInput('')
    setState('answering')
  }, [state, current, script, characterSubset])

  return { current, dataset, input, state, session, answeredChars, setInput, submit, submitSelection, next }
}
