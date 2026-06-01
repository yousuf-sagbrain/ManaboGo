import type { KanaChar } from './types'

export type KatakanaChar = KanaChar

export const katakana: KatakanaChar[] = [
  // ア行 (a-row)
  { char: 'ア', romaji: 'a',   aliases: [] },
  { char: 'イ', romaji: 'i',   aliases: [] },
  { char: 'ウ', romaji: 'u',   aliases: [] },
  { char: 'エ', romaji: 'e',   aliases: [] },
  { char: 'オ', romaji: 'o',   aliases: [] },

  // カ行 (ka-row)
  { char: 'カ', romaji: 'ka',  aliases: [] },
  { char: 'キ', romaji: 'ki',  aliases: [] },
  { char: 'ク', romaji: 'ku',  aliases: [] },
  { char: 'ケ', romaji: 'ke',  aliases: [] },
  { char: 'コ', romaji: 'ko',  aliases: [] },

  // サ行 (sa-row)  — shi accepts si
  { char: 'サ', romaji: 'sa',  aliases: [] },
  { char: 'シ', romaji: 'shi', aliases: ['si'] },
  { char: 'ス', romaji: 'su',  aliases: [] },
  { char: 'セ', romaji: 'se',  aliases: [] },
  { char: 'ソ', romaji: 'so',  aliases: [] },

  // タ行 (ta-row)  — chi accepts ti; tsu accepts tu
  { char: 'タ', romaji: 'ta',  aliases: [] },
  { char: 'チ', romaji: 'chi', aliases: ['ti'] },
  { char: 'ツ', romaji: 'tsu', aliases: ['tu'] },
  { char: 'テ', romaji: 'te',  aliases: [] },
  { char: 'ト', romaji: 'to',  aliases: [] },

  // ナ行 (na-row)
  { char: 'ナ', romaji: 'na',  aliases: [] },
  { char: 'ニ', romaji: 'ni',  aliases: [] },
  { char: 'ヌ', romaji: 'nu',  aliases: [] },
  { char: 'ネ', romaji: 'ne',  aliases: [] },
  { char: 'ノ', romaji: 'no',  aliases: [] },

  // ハ行 (ha-row)  — fu accepts hu
  { char: 'ハ', romaji: 'ha',  aliases: [] },
  { char: 'ヒ', romaji: 'hi',  aliases: [] },
  { char: 'フ', romaji: 'fu',  aliases: ['hu'] },
  { char: 'ヘ', romaji: 'he',  aliases: [] },
  { char: 'ホ', romaji: 'ho',  aliases: [] },

  // マ行 (ma-row)
  { char: 'マ', romaji: 'ma',  aliases: [] },
  { char: 'ミ', romaji: 'mi',  aliases: [] },
  { char: 'ム', romaji: 'mu',  aliases: [] },
  { char: 'メ', romaji: 'me',  aliases: [] },
  { char: 'モ', romaji: 'mo',  aliases: [] },

  // ヤ行 (ya-row)  — 3 characters
  { char: 'ヤ', romaji: 'ya',  aliases: [] },
  { char: 'ユ', romaji: 'yu',  aliases: [] },
  { char: 'ヨ', romaji: 'yo',  aliases: [] },

  // ラ行 (ra-row)
  { char: 'ラ', romaji: 'ra',  aliases: [] },
  { char: 'リ', romaji: 'ri',  aliases: [] },
  { char: 'ル', romaji: 'ru',  aliases: [] },
  { char: 'レ', romaji: 're',  aliases: [] },
  { char: 'ロ', romaji: 'ro',  aliases: [] },

  // ワ行 (wa-row) + ヲ
  { char: 'ワ', romaji: 'wa',  aliases: [] },
  { char: 'ヲ', romaji: 'wo',  aliases: ['o'] },

  // ン
  { char: 'ン', romaji: 'n',   aliases: ['nn'] },

  // ガ行 (ga-row — voiced カ)
  { char: 'ガ', romaji: 'ga',  aliases: [] },
  { char: 'ギ', romaji: 'gi',  aliases: [] },
  { char: 'グ', romaji: 'gu',  aliases: [] },
  { char: 'ゲ', romaji: 'ge',  aliases: [] },
  { char: 'ゴ', romaji: 'go',  aliases: [] },

  // ザ行 (za-row — voiced サ)  — ji accepts zi
  { char: 'ザ', romaji: 'za',  aliases: [] },
  { char: 'ジ', romaji: 'ji',  aliases: ['zi'] },
  { char: 'ズ', romaji: 'zu',  aliases: [] },
  { char: 'ゼ', romaji: 'ze',  aliases: [] },
  { char: 'ゾ', romaji: 'zo',  aliases: [] },

  // ダ行 (da-row — voiced タ)
  { char: 'ダ', romaji: 'da',  aliases: [] },
  { char: 'ヂ', romaji: 'di',  aliases: [] },
  { char: 'ヅ', romaji: 'du',  aliases: [] },
  { char: 'デ', romaji: 'de',  aliases: [] },
  { char: 'ド', romaji: 'do',  aliases: [] },

  // バ行 (ba-row — voiced ハ)
  { char: 'バ', romaji: 'ba',  aliases: [] },
  { char: 'ビ', romaji: 'bi',  aliases: [] },
  { char: 'ブ', romaji: 'bu',  aliases: [] },
  { char: 'ベ', romaji: 'be',  aliases: [] },
  { char: 'ボ', romaji: 'bo',  aliases: [] },

  // パ行 (pa-row — semi-voiced ハ)
  { char: 'パ', romaji: 'pa',  aliases: [] },
  { char: 'ピ', romaji: 'pi',  aliases: [] },
  { char: 'プ', romaji: 'pu',  aliases: [] },
  { char: 'ペ', romaji: 'pe',  aliases: [] },
  { char: 'ポ', romaji: 'po',  aliases: [] },
]
