import { hiragana } from './hiragana'
import { katakana } from './katakana'
import type { KanaChar } from './types'

export interface KanaRow {
  id: string
  label: string
  hiragana: KanaChar[]
  katakana: KanaChar[]
}

export const kanaRows: KanaRow[] = [
  { id: 'a',  label: 'あ行', hiragana: hiragana.slice(0, 5),   katakana: katakana.slice(0, 5)   },
  { id: 'ka', label: 'か行', hiragana: hiragana.slice(5, 10),  katakana: katakana.slice(5, 10)  },
  { id: 'sa', label: 'さ行', hiragana: hiragana.slice(10, 15), katakana: katakana.slice(10, 15) },
  { id: 'ta', label: 'た行', hiragana: hiragana.slice(15, 20), katakana: katakana.slice(15, 20) },
  { id: 'na', label: 'な行', hiragana: hiragana.slice(20, 25), katakana: katakana.slice(20, 25) },
  { id: 'ha', label: 'は行', hiragana: hiragana.slice(25, 30), katakana: katakana.slice(25, 30) },
  { id: 'ma', label: 'ま行', hiragana: hiragana.slice(30, 35), katakana: katakana.slice(30, 35) },
  { id: 'ya', label: 'や行', hiragana: hiragana.slice(35, 38), katakana: katakana.slice(35, 38) },
  { id: 'ra', label: 'ら行', hiragana: hiragana.slice(38, 43), katakana: katakana.slice(38, 43) },
  { id: 'wa', label: 'わ行', hiragana: hiragana.slice(43, 45), katakana: katakana.slice(43, 45) },
  { id: 'n',  label: 'ん',   hiragana: hiragana.slice(45, 46), katakana: katakana.slice(45, 46) },

  // Voiced (dakuten) and semi-voiced (handakuten) rows
  { id: 'ga', label: 'が行 (voiced)',      hiragana: hiragana.slice(46, 51), katakana: katakana.slice(46, 51) },
  { id: 'za', label: 'ざ行 (voiced)',      hiragana: hiragana.slice(51, 56), katakana: katakana.slice(51, 56) },
  { id: 'da', label: 'だ行 (voiced)',      hiragana: hiragana.slice(56, 61), katakana: katakana.slice(56, 61) },
  { id: 'ba', label: 'ば行 (voiced)',      hiragana: hiragana.slice(61, 66), katakana: katakana.slice(61, 66) },
  { id: 'pa', label: 'ぱ行 (semi-voiced)', hiragana: hiragana.slice(66, 71), katakana: katakana.slice(66, 71) },
]
