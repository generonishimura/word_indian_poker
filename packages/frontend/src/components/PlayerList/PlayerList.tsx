import type { PlayerView, GamePhase } from '@wip/shared';
import { PixelAvatar } from '../Avatar/PixelAvatar.js';

interface Props {
  players: PlayerView[];
  currentPlayerId: string;
  phase: GamePhase;
}

export function PlayerList({ players, currentPlayerId, phase }: Props) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex gap-4 overflow-x-auto shrink-0">
      {players.map((p) => {
        const isMe = p.id === currentPlayerId;

        return (
          <div
            key={p.id}
            className={`flex flex-col items-center shrink-0 transition-opacity ${p.isEliminated ? 'opacity-30' : ''}`}
          >
            {/* ワード表示（ゲーム中のみ） */}
            {phase !== 'waiting' && !isMe && p.secretWords && p.secretWords.length > 0 && (
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
  );
}
