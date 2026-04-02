import { useState } from 'react';
import type { useGameApi } from '../hooks/useGameApi.js';
import { RulesButton } from '../components/RulesDialog/RulesDialog.js';
import { AvatarPicker } from '../components/Avatar/AvatarPicker.js';
import { AVATARS } from '../components/Avatar/pixelAvatars.js';

interface Props {
  api: ReturnType<typeof useGameApi>;
}

function getStoredAvatarId(): string {
  return localStorage.getItem('wip-avatar-id') ?? AVATARS[0].id;
}

export function LobbyPage({ api }: Props) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [avatarId, setAvatarId] = useState(getStoredAvatarId);
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');

  const handleAvatarSelect = (id: string) => {
    setAvatarId(id);
    localStorage.setItem('wip-avatar-id', id);
  };

  const handleCreate = () => {
    if (!playerName.trim()) return;
    api.createRoom(playerName.trim(), avatarId);
  };

  const handleJoin = () => {
    if (!playerName.trim() || !roomCode.trim()) return;
    api.joinRoom(roomCode.trim().toUpperCase(), playerName.trim(), avatarId);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
        {/* ルールボタン */}
        <div className="absolute top-4 right-4">
          <RulesButton variant="light" />
        </div>

        {/* ロゴ */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-xl mb-3">
            <span className="text-2xl">🃏</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">
            ワードインディアンポーカー
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            自分のワードを言ったらドボン！
          </p>
        </div>

        {api.error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm text-center">
            {api.error}
          </div>
        )}

        {/* アバター選択 */}
        <div className="mb-4">
          <AvatarPicker selected={avatarId} onSelect={handleAvatarSelect} />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
            なまえ
          </label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="あなたの名前を入力"
            maxLength={10}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-800 placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
        </div>

        {mode === 'select' && (
          <div className="space-y-2.5">
            <button
              onClick={() => setMode('create')}
              className="w-full bg-indigo-600 text-white rounded-lg py-3 text-base font-semibold hover:bg-indigo-700 transition-colors active:scale-[0.98]"
            >
              ルームをつくる
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full bg-white text-gray-700 border border-gray-200 rounded-lg py-3 text-base font-semibold hover:bg-gray-50 transition-colors active:scale-[0.98]"
            >
              ルームに参加する
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="space-y-2.5">
            <button
              onClick={handleCreate}
              className="w-full bg-indigo-600 text-white rounded-lg py-3 text-base font-semibold hover:bg-indigo-700 transition-colors active:scale-[0.98]"
            >
              ルームを作成
            </button>
            <button
              onClick={() => setMode('select')}
              className="w-full text-gray-400 text-sm py-2 hover:text-gray-600 transition"
            >
              もどる
            </button>
          </div>
        )}

        {mode === 'join' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                ルームコード
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="ABCD"
                maxLength={4}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-center tracking-[0.3em] font-mono text-xl text-gray-800 placeholder:text-gray-300 uppercase focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
            <button
              onClick={handleJoin}
              className="w-full bg-indigo-600 text-white rounded-lg py-3 text-base font-semibold hover:bg-indigo-700 transition-colors active:scale-[0.98]"
            >
              参加する
            </button>
            <button
              onClick={() => setMode('select')}
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
