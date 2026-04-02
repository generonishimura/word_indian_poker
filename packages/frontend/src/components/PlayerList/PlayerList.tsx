import type { PlayerView, GamePhase } from '@wip/shared';
import { PixelAvatar } from '../Avatar/PixelAvatar.js';

interface Props {
  players: PlayerView[];
  currentPlayerId: string;
  phase: GamePhase;
}

export function PlayerList({ players, currentPlayerId, phase }: Props) {
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
      {/* ワード一覧行（ゲーム中のみ） */}
      {phase !== 'waiting' && (
        <div className="px-4 pb-2 flex flex-wrap gap-1">
          {players.filter(p => p.id !== currentPlayerId && !p.isEliminated && p.secretWords && p.secretWords.length > 0).flatMap(p =>
            p.secretWords!.map((word, wi) => (
              <span key={`${p.id}-${wi}`} className="text-[10px] bg-amber-50 text-amber-700 rounded-full px-2 py-0.5 font-bold border border-amber-200">
                {word}
              </span>
            ))
          )}
        </div>
      )}
    </div>
  );
}
