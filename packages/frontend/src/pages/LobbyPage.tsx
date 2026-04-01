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
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">🃏</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            ワードインディアンポーカー
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            自分のワードを言ったらドボン！
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-500 rounded-xl p-3 mb-5 text-sm text-center">
            {error}
          </div>
        )}

        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            なまえ
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => { setPlayerName(e.target.value); setError(''); }}
            placeholder="あなたの名前を入力"
            maxLength={10}
            className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3.5 text-gray-800 placeholder:text-gray-300 focus:ring-2 focus:ring-violet-400 focus:bg-white outline-none transition-all"
          />
        </div>

        {mode === 'select' && (
          <div className="space-y-3">
            <button
              onClick={() => setMode('create')}
              className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl py-3.5 text-base font-semibold hover:from-violet-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              ルームをつくる
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full bg-gray-50 text-gray-700 rounded-xl py-3.5 text-base font-semibold hover:bg-gray-100 transition-all active:scale-[0.98]"
            >
              ルームに参加する
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="space-y-3">
            <button
              onClick={handleCreate}
              className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl py-3.5 text-base font-semibold hover:from-violet-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              ルームを作成
            </button>
            <button
              onClick={() => { setMode('select'); setError(''); }}
              className="w-full text-gray-400 text-sm py-2 hover:text-gray-600 transition"
            >
              もどる
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                ルームコード
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => { setRoomCode(e.target.value.toUpperCase()); setError(''); }}
                placeholder="ABCD"
                maxLength={4}
                className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3.5 text-center tracking-[0.3em] font-mono text-xl text-gray-800 placeholder:text-gray-300 uppercase focus:ring-2 focus:ring-violet-400 focus:bg-white outline-none transition-all"
              />
            </div>
            <button
              onClick={handleJoin}
              className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl py-3.5 text-base font-semibold hover:from-violet-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              参加する
            </button>
            <button
              onClick={() => { setMode('select'); setError(''); }}
              className="w-full text-gray-400 text-sm py-2 hover:text-gray-600 transition"
            >
              もどる
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
