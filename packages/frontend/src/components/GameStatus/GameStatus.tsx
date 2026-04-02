import type { GameState } from '@wip/shared';
import { PixelAvatar } from '../Avatar/PixelAvatar.js';

interface Props {
  gameState: GameState;
  isHost: boolean;
  onRestart: () => void;
}

export function GameStatus({ gameState, isHost, onRestart }: Props) {
  const winner = gameState.players.find(p => p.id === gameState.winnerId);
  const isWinner = gameState.winnerId === gameState.currentPlayerId;

  return (
    <div className="bg-white border-t border-gray-200 p-5 shrink-0">
      <div className="text-center max-w-sm mx-auto">
        {isWinner ? (
          <div className="mb-3">
            <span className="text-4xl">🎉</span>
            <p className="text-xl font-bold text-amber-500 mt-1">
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
            <div key={p.id} className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-center min-w-[70px]">
              {p.avatarId && (
                <div className="flex justify-center mb-1">
                  <PixelAvatar avatarId={p.avatarId} size={24} />
                </div>
              )}
              <p className="text-[11px] text-gray-400">{p.name}</p>
              {p.secretWords ? (
                p.secretWords.map((word, i) => (
                  <p key={i} className="font-bold text-indigo-600 text-sm">{word}</p>
                ))
              ) : (
                <p className="font-bold text-indigo-600 text-sm">???</p>
              )}
            </div>
          ))}
        </div>

        {isHost && (
          <button
            onClick={onRestart}
            className="bg-indigo-600 text-white rounded-lg px-8 py-3 font-semibold hover:bg-indigo-700 transition-colors active:scale-[0.98]"
          >
            もう一回！
          </button>
        )}
      </div>
    </div>
  );
}
