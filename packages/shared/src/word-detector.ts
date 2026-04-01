import type { Player, WordMatch } from './types.js';

export function detectWord(text: string, senderId: string, players: Player[]): WordMatch | null {
  const normalizedText = text.toLowerCase();

  // 自分のワードを先にチェック（自爆判定を優先）
  const sender = players.find(p => p.id === senderId);
  if (sender && !sender.isEliminated) {
    if (containsWord(normalizedText, sender.secretWord.toLowerCase())) {
      return {
        senderId,
        matchedPlayerId: sender.id,
        matchedWord: sender.secretWord,
        isSelfMatch: true,
      };
    }
  }

  // 他プレイヤーのワードをチェック
  for (const player of players) {
    if (player.id === senderId || player.isEliminated) continue;
    if (containsWord(normalizedText, player.secretWord.toLowerCase())) {
      return {
        senderId,
        matchedPlayerId: player.id,
        matchedWord: player.secretWord,
        isSelfMatch: false,
      };
    }
  }

  return null;
}

function containsWord(text: string, word: string): boolean {
  // 日本語の場合: テキスト内に単語がそのまま含まれているかチェック
  // 英語の場合: トークン分割して完全一致
  if (isJapanese(word)) {
    return text.includes(word);
  }

  // 英語: スペースや記号で分割してトークン完全一致
  const tokens = text.split(/[\s,.!?;:'"()\[\]{}\-/]+/).filter(Boolean);
  return tokens.includes(word);
}

function isJapanese(text: string): boolean {
  return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
}
