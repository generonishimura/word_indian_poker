import { useState } from 'react';
import type { PlayerView, GamePhase } from '@wip/shared';
import { PixelAvatar } from '../Avatar/PixelAvatar.js';

interface Props {
  players: PlayerView[];
  currentPlayerId: string;
  phase: GamePhase;
}

export function PlayerList({ players, currentPlayerId, phase }: Props) {
  const [showWords, setShowWords] = useState(true);

  const hasWords = phase !== 'waiting' && players.some(p => p.id !== currentPlayerId && p.secretWords && p.secretWords.length > 0);

  return (
    <div className="bg-white border-b border-gray-200 shrink-0">
      <div className="px-4 py-2 flex gap-4 overflow-x-auto">
        {players.map((p) => {
          const isMe = p.id === currentPlayerId;

          return (
            <div
              key={p.id}
              className={`flex flex-col items-center shrink-0 transition-opacity ${p.isEliminated ? 'opacity-30' : ''}`}
            >
              {/* ワード表示（ゲーム中・展開時のみ） */}
              {phase !== 'waiting' && showWords && !isMe && p.secretWords && p.secretWords.length > 0 && (
                <div className="flex flex-col items-center gap-0.5 mb-1">
                  {p.secretWords.map((word, wi) => (
                    <span key={wi} className="text-[10px] bg-amber-50 text-amber-700 rounded-full px-2 py-0.5 font-bold border border-amber-200 whitespace-nowrap">
                      {word}
                    </span>
                  ))}
                </div>
              )}
              {phase !== 'waiting' && isMe && (
                <span className="text-[10px] bg-gray-50 text-gray-300 rounded-full px-2 py-0.5 mb-1 border border-gray-100">
                  ???
                </span>
              )}
              {/* アバター */}
              {p.avatarId ? (
                <PixelAvatar
                  avatarId={p.avatarId}
                  size={40}
                  className={p.isEliminated ? 'grayscale' : ''}
                />
              ) : (
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-white ${
                  p.isEliminated ? 'bg-gray-300' : 'bg-indigo-500'
                }`}>
                  {p.name[0]}
                </div>
              )}
              <span className={`text-[11px] mt-0.5 ${isMe ? 'font-bold text-indigo-600' : 'text-gray-500'}`}>
                {p.name}
                {p.isHost && phase === 'waiting' ? ' 👑' : ''}
              </span>
              {p.isEliminated && (
                <span className="text-[9px] text-red-400 font-medium">OUT</span>
              )}
            </div>
          );
        })}
      </div>
      {/* 表示切替ボタン */}
      {hasWords && (
        <button
          onClick={() => setShowWords(prev => !prev)}
          className="w-full py-1 flex items-center justify-center gap-1 text-[11px] text-amber-600 hover:bg-amber-50 transition-colors"
        >
          <span>{showWords ? 'ワードをかくす' : 'ワードをみる'}</span>
          <svg
            className={`w-3 h-3 transition-transform ${showWords ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
    </div>
  );
}
