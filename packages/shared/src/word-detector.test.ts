import { describe, it, expect } from 'vitest';
import { detectWord } from './word-detector.js';
import type { Player } from './types.js';

function makePlayer(overrides: Partial<Player> & { id: string; name: string; secretWord: string }): Player {
  return {
    isEliminated: false,
    isHost: false,
    ...overrides,
  };
}

describe('detectWord', () => {
  it('日本語ワードがメッセージに含まれていたらマッチする', () => {
    const players = [
      makePlayer({ id: 'p1', name: 'Alice', secretWord: 'ねこ' }),
      makePlayer({ id: 'p2', name: 'Bob', secretWord: 'いぬ' }),
    ];

    const result = detectWord('今日ねこを見たよ', 'p2', players);

    expect(result).not.toBeNull();
    expect(result!.matchedPlayerId).toBe('p1');
    expect(result!.matchedWord).toBe('ねこ');
    expect(result!.isSelfMatch).toBe(false);
  });

  it('自分のワードを言ったらisSelfMatchがtrueになる', () => {
    const players = [
      makePlayer({ id: 'p1', name: 'Alice', secretWord: 'ねこ' }),
      makePlayer({ id: 'p2', name: 'Bob', secretWord: 'いぬ' }),
    ];

    const result = detectWord('いぬって可愛いよね', 'p2', players);

    expect(result).not.toBeNull();
    expect(result!.matchedPlayerId).toBe('p2');
    expect(result!.isSelfMatch).toBe(true);
  });

  it('自分のワードと他人のワードが両方含まれている場合、自爆が優先される', () => {
    const players = [
      makePlayer({ id: 'p1', name: 'Alice', secretWord: 'ねこ' }),
      makePlayer({ id: 'p2', name: 'Bob', secretWord: 'いぬ' }),
    ];

    const result = detectWord('ねこといぬが好き', 'p2', players);

    expect(result).not.toBeNull();
    expect(result!.matchedPlayerId).toBe('p2');
    expect(result!.isSelfMatch).toBe(true);
  });

  it('脱落済みプレイヤーのワードはマッチしない', () => {
    const players = [
      makePlayer({ id: 'p1', name: 'Alice', secretWord: 'ねこ', isEliminated: true }),
      makePlayer({ id: 'p2', name: 'Bob', secretWord: 'いぬ' }),
    ];

    const result = detectWord('ねこだよ', 'p2', players);

    expect(result).toBeNull();
  });

  it('ワードが含まれていなければnullを返す', () => {
    const players = [
      makePlayer({ id: 'p1', name: 'Alice', secretWord: 'ねこ' }),
      makePlayer({ id: 'p2', name: 'Bob', secretWord: 'いぬ' }),
    ];

    const result = detectWord('今日は天気がいいね', 'p1', players);

    expect(result).toBeNull();
  });

  it('英語ワードはトークン完全一致でマッチする', () => {
    const players = [
      makePlayer({ id: 'p1', name: 'Alice', secretWord: 'cat' }),
      makePlayer({ id: 'p2', name: 'Bob', secretWord: 'dog' }),
    ];

    const result = detectWord('I saw a cat today', 'p2', players);

    expect(result).not.toBeNull();
    expect(result!.matchedWord).toBe('cat');
  });

  it('英語ワードの部分一致はマッチしない (catがcatastropheにマッチしない)', () => {
    const players = [
      makePlayer({ id: 'p1', name: 'Alice', secretWord: 'cat' }),
      makePlayer({ id: 'p2', name: 'Bob', secretWord: 'dog' }),
    ];

    const result = detectWord('That was a catastrophe', 'p2', players);

    expect(result).toBeNull();
  });

  it('英語ワードは大文字小文字を無視する', () => {
    const players = [
      makePlayer({ id: 'p1', name: 'Alice', secretWord: 'Cat' }),
      makePlayer({ id: 'p2', name: 'Bob', secretWord: 'dog' }),
    ];

    const result = detectWord('I love CAT', 'p2', players);

    expect(result).not.toBeNull();
    expect(result!.matchedWord).toBe('Cat');
  });
});
