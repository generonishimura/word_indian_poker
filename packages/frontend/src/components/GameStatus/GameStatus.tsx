import type { GameState } from '@wip/shared';

interface Props {
  gameState: GameState;
  isHost: boolean;
  onRestart: () => void;
}

export function GameStatus({ gameState, isHost, onRestart }: Props) {
  const winner = gameState.players.find(p => p.id === gameState.winnerId);
  const isWinner = gameState.winnerId === gameState.currentPlayerId;

  return (
    <div className="bg-white border-t border-gray-100 p-5 shrink-0 shadow-lg">
      <div className="text-center max-w-sm mx-auto">
        {isWinner ? (
          <div className="mb-3">
            <span className="text-4xl">🎉</span>
            <p className="text-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent mt-1">
              あなたの勝ち！
            </p>
          </div>
        ) : winner ? (
          <div className="mb-3">
            <span className="text-4xl">👑</span>
            <p className="text-lg font-bold text-gray-700 mt-1">{winner.name} の勝ち！</p>
          </div>
        ) : (
          <div className="mb-3">
            <p className="text-lg font-bold text-gray-700">ゲーム終了</p>
          </div>
        )}

        {/* 全員のワードを公開 */}
        <div className="flex justify-center gap-2 mb-4 flex-wrap">
          {gameState.players.map(p => (
            <div key={p.id} className="bg-gray-50 rounded-xl px-3 py-2 text-center min-w-[70px]">
              <p className="text-[11px] text-gray-400">{p.name}</p>
              <p className="font-bold text-violet-600 text-sm">{p.secretWord ?? '???'}</p>
            </div>
          ))}
        </div>

        {isHost && (
          <button
            onClick={onRestart}
            className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl px-8 py-3 font-semibold hover:from-violet-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
          >
            もう一回！
          </button>
        )}
      </div>
    </div>
  );
}
