import { useState } from 'react';
import type { PlayerView, GamePhase } from '@wip/shared';
import { PixelAvatar } from '../Avatar/PixelAvatar.js';

interface Props {
  players: PlayerView[];
  currentPlayerId: string;
  phase: GamePhase;
}

export function PlayerList({ players, currentPlayerId, phase }: Props) {
  const [expanded, setExpanded] = useState(false);

  const otherPlayers = phase !== 'waiting'
    ? players.filter(p => p.id !== currentPlayerId && !p.isEliminated && p.secretWords && p.secretWords.length > 0)
    : [];
  const totalWords = otherPlayers.reduce((sum, p) => sum + (p.secretWords?.length ?? 0), 0);

  return (
    <div className="bg-white border-b border-gray-200 shrink-0">
      {/* プレイヤーアバター行 */}
      <div className="px-4 py-2 flex gap-4 overflow-x-auto">
        {players.map((p) => {
          const isMe = p.id === currentPlayerId;
          const wordCount = p.secretWords?.length ?? 0;

          return (
            <div
              key={p.id}
              className={`flex flex-col items-center shrink-0 transition-opacity ${p.isEliminated ? 'opacity-30' : ''}`}
            >
              {/* アバター */}
              <div className="relative">
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
                {/* ワード数バッジ */}
                {phase !== 'waiting' && !isMe && wordCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {wordCount}
                  </span>
                )}
                {phase !== 'waiting' && isMe && (
                  <span className="absolute -top-1 -right-1 bg-gray-300 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    ?
                  </span>
                )}
              </div>
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
      {/* ワード展開トグル（ゲーム中のみ） */}
      {totalWords > 0 && (
        <>
          <button
            onClick={() => setExpanded(prev => !prev)}
            className="w-full px-4 py-1 flex items-center justify-center gap-1 text-[11px] text-amber-600 hover:bg-amber-50 transition-colors"
          >
            <span>{expanded ? 'ワードをとじる' : `ワードをみる (${totalWords})`}</span>
            <svg
              className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expanded && (
            <div className="px-4 pb-2 space-y-1.5">
              {otherPlayers.map(p => (
                <div key={p.id} className="flex items-start gap-2">
                  <span className="text-[10px] text-gray-400 shrink-0 w-16 text-right pt-0.5">{p.name}</span>
                  <div className="flex flex-wrap gap-1">
                    {p.secretWords!.map((word, wi) => (
                      <span key={wi} className="text-[10px] bg-amber-50 text-amber-700 rounded-full px-2 py-0.5 font-bold border border-amber-200">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
