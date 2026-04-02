import { TALK_THEMES } from '@wip/shared';
import type { useGameApi } from '../hooks/useGameApi.js';
import { ChatContainer } from '../components/Chat/ChatContainer.js';
import { ChatInput } from '../components/Chat/ChatInput.js';
import { ChallengeButton } from '../components/Challenge/ChallengeButton.js';
import { PlayerList } from '../components/PlayerList/PlayerList.js';
import { GameStatus } from '../components/GameStatus/GameStatus.js';
import { RulesButton } from '../components/RulesDialog/RulesDialog.js';

interface Props {
  api: ReturnType<typeof useGameApi>;
}

export function GamePage({ api }: Props) {
  const { gameState } = api;
  if (!gameState) return null;

  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
  const isHost = currentPlayer?.isHost ?? false;
  const isEliminated = currentPlayer?.isEliminated ?? false;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white text-gray-800 px-4 py-3 flex items-center justify-between shrink-0 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-lg">🃏</span>
          </div>
          <div>
            <h1 className="text-sm font-bold leading-tight">ワードインディアンポーカー</h1>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-xs">Room</span>
              <span className="text-xs font-mono bg-gray-100 text-gray-600 rounded px-1.5 py-0.5">{gameState.roomCode}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-gray-500 text-xs">{gameState.players.length}人</span>
          </div>
          <RulesButton variant="light" />
        </div>
      </header>

      {/* プレイヤーリスト */}
      <PlayerList
        players={gameState.players}
        currentPlayerId={gameState.currentPlayerId}
        phase={gameState.phase}
      />

      {/* 待機中: テーマ選択 */}
      {gameState.phase === 'waiting' && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-lg mx-auto space-y-4">
            {/* ルームコード表示 */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 text-center">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">ルームコード</p>
              <p className="text-4xl font-mono font-bold text-indigo-600 tracking-[0.2em]">
                {gameState.roomCode}
              </p>
              <p className="text-gray-400 text-xs mt-2">このコードを友達に共有しよう</p>
            </div>

            {/* テーマ選択 */}
            {isHost && (
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                  トークテーマを選択
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {TALK_THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => api.selectTheme(theme.id)}
                      className={`text-left rounded-xl p-3.5 transition-all active:scale-[0.97] border ${
                        gameState.themeId === theme.id
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className={`font-bold text-sm ${gameState.themeId === theme.id ? 'text-white' : 'text-gray-800'}`}>
                        {theme.label}
                      </p>
                      <p className={`text-xs mt-0.5 ${gameState.themeId === theme.id ? 'text-white/70' : 'text-gray-400'}`}>
                        {theme.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isHost && gameState.themeId && (
              <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
                <p className="text-xs text-gray-400 mb-1">選択されたテーマ</p>
                <p className="font-bold text-indigo-600">{gameState.themeLabel}</p>
              </div>
            )}

            {/* ゲームスタートボタン */}
            {isHost && gameState.themeId && gameState.players.length >= 2 && (
              <button
                onClick={api.startGame}
                className="w-full bg-emerald-600 text-white rounded-xl py-4 text-lg font-bold hover:bg-emerald-700 transition-colors active:scale-[0.98]"
              >
                ゲームスタート！
              </button>
            )}
            {isHost && !gameState.themeId && (
              <p className="text-center text-gray-400 text-sm">テーマを選んでスタート！</p>
            )}
            {isHost && gameState.themeId && gameState.players.length < 2 && (
              <p className="text-center text-gray-400 text-sm">2人以上でスタートできます</p>
            )}
            {!isHost && (
              <p className="text-center text-gray-400 text-sm">ホストがテーマを選んでゲームを開始します...</p>
            )}
          </div>
        </div>
      )}

      {/* ゲーム中 */}
      {gameState.phase === 'playing' && (
        <>
          <ChatContainer
            messages={gameState.messages}
            currentPlayerId={gameState.currentPlayerId}
          />
          <div className="bg-white border-t border-gray-200 px-4 py-3 flex gap-2 shrink-0 items-end">
            <ChatInput
              onSend={api.sendMessage}
              disabled={isEliminated}
              placeholder={isEliminated ? 'だつらくしました...' : 'ひらがな・カタカナでにゅうりょく'}
            />
            <ChallengeButton
              onChallenge={api.challenge}
              disabled={isEliminated}
              challengesRemaining={currentPlayer?.challengesRemaining ?? 0}
            />
          </div>
        </>
      )}

      {/* 終了 */}
      {gameState.phase === 'finished' && (
        <>
          <ChatContainer
            messages={gameState.messages}
            currentPlayerId={gameState.currentPlayerId}
          />
          <GameStatus
            gameState={gameState}
            isHost={isHost}
            onRestart={api.restartGame}
          />
        </>
      )}
    </div>
  );
}
