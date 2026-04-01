import type { PlayerView, GamePhase } from '@wip/shared';

interface Props {
  players: PlayerView[];
  currentPlayerId: string;
  phase: GamePhase;
}

export function PlayerList({ players, currentPlayerId, phase }: Props) {
  if (phase === 'waiting') {
    return (
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex gap-2 overflow-x-auto shrink-0">
        {players.map(p => (
          <div key={p.id} className="flex items-center gap-1 shrink-0">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
              {p.name[0]}
            </div>
            <span className="text-sm text-gray-700">
              {p.name}{p.id === currentPlayerId ? ' (あなた)' : ''}{p.isHost ? ' 👑' : ''}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex gap-3 overflow-x-auto shrink-0">
      {players.map(p => {
        const isMe = p.id === currentPlayerId;
        return (
          <div
            key={p.id}
            className={`flex flex-col items-center shrink-0 ${p.isEliminated ? 'opacity-40' : ''}`}
          >
            {/* ワード表示（自分以外） */}
            {!isMe && p.secretWord && (
              <span className="text-[10px] bg-yellow-100 text-yellow-800 rounded-full px-2 py-0.5 font-bold mb-1 border border-yellow-300">
                {p.secretWord}
              </span>
            )}
            {isMe && (
              <span className="text-[10px] bg-gray-100 text-gray-400 rounded-full px-2 py-0.5 mb-1">
                ???
              </span>
            )}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
              p.isEliminated
                ? 'bg-gray-200 text-gray-400'
                : isMe
                  ? 'bg-indigo-500 text-white'
                  : 'bg-indigo-100 text-indigo-600'
            }`}>
              {p.name[0]}
            </div>
            <span className="text-xs text-gray-600 mt-0.5">{p.name}</span>
            {p.isEliminated && (
              <span className="text-[10px] text-red-500">脱落</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
