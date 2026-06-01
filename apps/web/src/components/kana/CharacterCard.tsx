'use client'

import type { KanaChar } from '@/data/kana/types'

function IconSpeaker() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  )
}

function IconTurtle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 14c0-3 3-5 9-5s9 2 9 5" />
      <path d="M6 18l-1 2" />
      <path d="M18 18l1 2" />
      <path d="M21 14c1 0 1.5-1 0-2" />
      <circle cx="12" cy="11" r="1.2" />
    </svg>
  )
}

interface CharacterCardProps {
  char: KanaChar
  onPlay?: () => void
  onPlaySlow?: () => void
  overlay?: React.ReactNode
}

export function CharacterCard({ char, onPlay, onPlaySlow, overlay }: CharacterCardProps) {
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <p className="text-xs font-extrabold text-slate-400 tracking-widest uppercase">
        What&apos;s the reading?
      </p>
      <div
        className="relative flex items-center justify-center w-full py-10 rounded-2xl
                   bg-white dark:bg-[#1a2035]"
        style={{ borderTopWidth: 2, borderRightWidth: 2, borderLeftWidth: 2, borderBottomWidth: 4, borderStyle: 'solid', borderTopColor: '#e2e8f0', borderRightColor: '#e2e8f0', borderLeftColor: '#e2e8f0', borderBottomColor: '#dde3ee' }}
      >
        <span
          lang="ja"
          className="font-bold leading-none select-none text-navy-800 dark:text-slate-100"
          style={{ fontSize: 160, fontFamily: 'Noto Sans JP, sans-serif' }}
          aria-label={`Japanese character, read as: ${char.romaji}`}
        >
          {char.char}
        </span>
        {overlay}
      </div>

      {(onPlay || onPlaySlow) && (
        <div className="flex items-center gap-2 w-full">
          {onPlay && (
            <button
              type="button"
              onClick={onPlay}
              aria-label="Replay pronunciation"
              className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl
                         bg-amber-50 hover:bg-amber-100 text-amber-700
                         font-extrabold text-xs uppercase tracking-widest
                         transition-colors touch-manipulation
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              style={{ borderTopWidth: 2, borderRightWidth: 2, borderLeftWidth: 2, borderBottomWidth: 4, borderStyle: 'solid', borderTopColor: '#fde68a', borderRightColor: '#fde68a', borderLeftColor: '#fde68a', borderBottomColor: '#fde68a' }}
            >
              <IconSpeaker /> Replay
            </button>
          )}
          {onPlaySlow && (
            <button
              type="button"
              onClick={onPlaySlow}
              aria-label="Replay slowly"
              title="Slow replay"
              className="w-12 h-12 flex items-center justify-center rounded-2xl
                         bg-white dark:bg-[#1e2740] hover:bg-slate-50 dark:hover:bg-slate-700/50
                         text-slate-500 dark:text-slate-400 hover:text-amber-600
                         transition-colors touch-manipulation
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              style={{ borderTopWidth: 2, borderRightWidth: 2, borderLeftWidth: 2, borderBottomWidth: 4, borderStyle: 'solid', borderTopColor: '#e2e8f0', borderRightColor: '#e2e8f0', borderLeftColor: '#e2e8f0', borderBottomColor: '#dde3ee' }}
            >
              <IconTurtle />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
