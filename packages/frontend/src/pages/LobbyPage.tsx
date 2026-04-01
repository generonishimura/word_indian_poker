import { useState } from 'react';
import type { Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@wip/shared';

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface Props {
  socket: GameSocket;
}

export function LobbyPage({ socket }: Props) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');

  const handleCreate = () => {
    if (!playerName.trim()) {
      setError('名前を入力してください');
      return;
    }
    socket.emit('create_room', { playerName: playerName.trim() }, (res) => {
      if ('error' in res) {
        setError(res.error);
      }
    });
  };

  const handleJoin = () => {
    if (!playerName.trim()) {
      setError('名前を入力してください');
      return;
    }
    if (!roomCode.trim()) {
      setError('ルームコードを入力してください');
      return;
    }
    socket.emit('join_room', { roomCode: roomCode.trim().toUpperCase(), playerName: playerName.trim() }, (res) => {
      if ('error' in res) {
        setError(res.error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          🃏 ワードインディアンポーカー
        </h1>
        <p className="text-center text-gray-500 mb-8 text-sm">
          相手にワードを言わせたら勝ち！
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">なまえ</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => { setPlayerName(e.target.value); setError(''); }}
            placeholder="あなたの名前"
            maxLength={10}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
          />
        </div>

        {mode === 'select' && (
          <div className="space-y-3">
            <button
              onClick={() => setMode('create')}
              className="w-full bg-indigo-500 text-white rounded-lg py-3 text-lg font-medium hover:bg-indigo-600 transition"
            >
              ルームをつくる
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full bg-white border-2 border-indigo-500 text-indigo-500 rounded-lg py-3 text-lg font-medium hover:bg-indigo-50 transition"
            >
              ルームに参加する
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="space-y-3">
            <button
              onClick={handleCreate}
              className="w-full bg-indigo-500 text-white rounded-lg py-3 text-lg font-medium hover:bg-indigo-600 transition"
            >
              ルームを作成
            </button>
            <button
              onClick={() => setMode('select')}
              className="w-full text-gray-500 text-sm hover:underline"
            >
              もどる
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ルームコード</label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => { setRoomCode(e.target.value.toUpperCase()); setError(''); }}
                placeholder="例: AB12"
                maxLength={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg text-center tracking-widest font-mono uppercase focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none"
              />
            </div>
            <button
              onClick={handleJoin}
              className="w-full bg-indigo-500 text-white rounded-lg py-3 text-lg font-medium hover:bg-indigo-600 transition"
            >
              参加する
            </button>
            <button
              onClick={() => setMode('select')}
              className="w-full text-gray-500 text-sm hover:underline"
            >
              もどる
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
