import { useState, useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents, GameState, Message } from '@wip/shared';
import { ChatContainer } from '../components/Chat/ChatContainer.js';
import { ChatInput } from '../components/Chat/ChatInput.js';
import { PlayerList } from '../components/PlayerList/PlayerList.js';
import { GameStatus } from '../components/GameStatus/GameStatus.js';

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface Props {
  socket: GameSocket;
  gameState: GameState;
}

export function GamePage({ socket, gameState }: Props) {
  const [messages, setMessages] = useState<Message[]>(gameState.messages);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setMessages(gameState.messages);
  }, [gameState.messages]);

  useEffect(() => {
    const handler = (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    };
    socket.on('new_message', handler);
    return () => { socket.off('new_message', handler); };
  }, [socket]);

  const handleSend = (text: string) => {
    socket.emit('send_message', { text });
  };

  const handleStartGame = () => {
    socket.emit('start_game', (res) => {
      if ('error' in res) {
        alert(res.error);
      }
    });
  };

  const handleRestart = () => {
    socket.emit('restart_game', (res) => {
      if ('error' in res) {
        alert(res.error);
      }
    });
  };

  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
  const isHost = currentPlayer?.isHost ?? false;
  const isEliminated = currentPlayer?.isEliminated ?? false;

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-bold">ワードインディアンポーカー</h1>
          <span className="text-indigo-200 text-xs">ルーム: {gameState.roomCode}</span>
        </div>
        <div className="text-sm">
          {gameState.players.length}人参加中
        </div>
      </header>

      {/* プレイヤーリスト */}
      <PlayerList
        players={gameState.players}
        currentPlayerId={gameState.currentPlayerId}
        phase={gameState.phase}
      />

      {/* 待機中 */}
      {gameState.phase === 'waiting' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-4">
          <div className="bg-white rounded-xl p-6 shadow text-center max-w-sm w-full">
            <p className="text-gray-600 mb-2">ルームコードを共有してください</p>
            <p className="text-4xl font-mono font-bold text-indigo-600 tracking-widest">{gameState.roomCode}</p>
            <p className="text-gray-400 text-sm mt-2">{gameState.players.length}人が参加中</p>
          </div>
          {isHost && gameState.players.length >= 2 && (
            <button
              onClick={handleStartGame}
              className="bg-green-500 text-white rounded-lg px-8 py-3 text-lg font-medium hover:bg-green-600 transition shadow"
            >
              ゲームスタート！
            </button>
          )}
          {isHost && gameState.players.length < 2 && (
            <p className="text-gray-400 text-sm">2人以上でスタートできます</p>
          )}
          {!isHost && (
            <p className="text-gray-400 text-sm">ホストがゲームを開始するのを待っています...</p>
          )}
        </div>
      )}

      {/* ゲーム中 */}
      {gameState.phase === 'playing' && (
        <>
          <ChatContainer
            messages={messages}
            currentPlayerId={gameState.currentPlayerId}
          />
          <ChatInput
            onSend={handleSend}
            disabled={isEliminated}
            placeholder={isEliminated ? '脱落しました...' : 'メッセージを入力'}
          />
        </>
      )}

      {/* 終了 */}
      {gameState.phase === 'finished' && (
        <>
          <ChatContainer
            messages={messages}
            currentPlayerId={gameState.currentPlayerId}
          />
          <GameStatus
            gameState={gameState}
            isHost={isHost}
            onRestart={handleRestart}
          />
        </>
      )}
    </div>
  );
}
