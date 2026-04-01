import type { PlayerView, GamePhase } from '@wip/shared';

interface Props {
  players: PlayerView[];
  currentPlayerId: string;
  phase: GamePhase;
}

const AVATAR_COLORS = [
  'from-violet-400 to-purple-500',
  'from-blue-400 to-indigo-500',
  'from-emerald-400 to-green-500',
  'from-amber-400 to-orange-500',
  'from-pink-400 to-rose-500',
  'from-cyan-400 to-teal-500',
];

export function PlayerList({ players, currentPlayerId, phase }: Props) {
  return (
    <div className="bg-white border-b border-gray-100 px-4 py-2.5 flex gap-4 overflow-x-auto shrink-0">
      {players.map((p, i) => {
        const isMe = p.id === currentPlayerId;
        const colorClass = AVATAR_COLORS[i % AVATAR_COLORS.length];

        return (
          <div
            key={p.id}
            className={`flex flex-col items-center shrink-0 transition-opacity ${p.isEliminated ? 'opacity-30' : ''}`}
          >
            {/* ワード表示（ゲーム中のみ） */}
            {phase !== 'waiting' && !isMe && p.secretWord && (
              <span className="text-[10px] bg-amber-50 text-amber-700 rounded-full px-2 py-0.5 font-bold mb-1 border border-amber-200 whitespace-nowrap">
                {p.secretWord}
              </span>
            )}
            {phase !== 'waiting' && isMe && (
              <span className="text-[10px] bg-gray-50 text-gray-300 rounded-full px-2 py-0.5 mb-1 border border-gray-100">
                ???
              </span>
            )}
            {/* アバター */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm ${
              p.isEliminated
                ? 'bg-gray-300'
                : `bg-gradient-to-br ${colorClass}`
            }`}>
              {p.name[0]}
            </div>
            <span className={`text-[11px] mt-0.5 ${isMe ? 'font-bold text-violet-600' : 'text-gray-500'}`}>
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
