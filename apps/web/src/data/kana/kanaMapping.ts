import { hiragana } from './hiragana'
import { katakana } from './katakana'
import type { KanaChar } from './types'

export interface KanaPair {
  hiragana: KanaChar
  katakana: KanaChar
  index: number
}

// Same-index characters share the same romaji across both scripts
export const kanaPairs: KanaPair[] = hiragana.map((h, i) => ({
  hiragana: h,
  katakana: katakana[i],
  index: i,
}))
