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
    <div className="bg-white border-t border-gray-200 p-4 shrink-0">
      <div className="text-center">
        {isWinner ? (
          <div className="text-2xl font-bold text-yellow-500 mb-2">
            🎉 あなたの勝ち！
          </div>
        ) : winner ? (
          <div className="text-lg font-bold text-gray-700 mb-2">
            {winner.name} の勝ち！
          </div>
        ) : (
          <div className="text-lg font-bold text-gray-700 mb-2">
            ゲーム終了
          </div>
        )}

        {/* 全員のワードを公開 */}
        <div className="flex justify-center gap-3 mb-3 flex-wrap">
          {gameState.players.map(p => (
            <div key={p.id} className="bg-gray-50 rounded-lg px-3 py-2 text-center">
              <div className="text-xs text-gray-500">{p.name}</div>
              <div className="font-bold text-indigo-600">{p.secretWord ?? '???'}</div>
            </div>
          ))}
        </div>

        {isHost && (
          <button
            onClick={onRestart}
            className="bg-indigo-500 text-white rounded-lg px-6 py-2 font-medium hover:bg-indigo-600 transition"
          >
            もう一回！
          </button>
        )}
      </div>
    </div>
  );
}
