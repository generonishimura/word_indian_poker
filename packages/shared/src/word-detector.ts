import type { Player, WordMatch } from './types.js';

export function detectWord(text: string, senderId: string, players: Player[]): WordMatch | null {
  const normalizedText = normalizeJapanese(text.toLowerCase());

  // 発言者自身のワードのみチェック（自分のワードを言ったら脱落）
  const sender = players.find(p => p.id === senderId);
  if (sender && !sender.isEliminated) {
    for (const word of sender.secretWords) {
      const normalizedWord = normalizeJapanese(word.toLowerCase());
      if (containsWord(normalizedText, normalizedWord)) {
        return {
          senderId,
          matchedPlayerId: sender.id,
          matchedWord: word,
          isSelfMatch: true,
        };
      }
    }
  }

  return null;
}

/**
 * カタカナをひらがなに変換し、表記ゆれを吸収する
 * 「ネコ」→「ねこ」、「猫」はそのまま（漢字→読み変換は複雑すぎるので対象外）
 */
export function normalizeJapanese(text: string): string {
  // カタカナ → ひらがな変換 (U+30A1-U+30F6 → U+3041-U+3096)
  return text.replace(/[\u30A1-\u30F6]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60)
  );
}

function containsWord(text: string, word: string): boolean {
  // 日本語の場合: テキスト内に単語がそのまま含まれているかチェック
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
