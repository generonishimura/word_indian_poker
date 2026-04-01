import { describe, it, expect } from 'vitest';
import { detectWord, normalizeJapanese } from './word-detector.js';
import type { Player } from './types.js';

function makePlayer(overrides: Partial<Player> & { id: string; name: string; secretWord: string }): Player {
  return {
    isEliminated: false,
    isHost: false,
    ...overrides,
  };
}

describe('normalizeJapanese', () => {
  it('カタカナをひらがなに変換する', () => {
    expect(normalizeJapanese('ネコ')).toBe('ねこ');
    expect(normalizeJapanese('ラーメン')).toBe('らーめん');
  });

  it('ひらがなはそのまま', () => {
    expect(normalizeJapanese('ねこ')).toBe('ねこ');
  });

  it('混在テキストも変換する', () => {
    expect(normalizeJapanese('今日はラーメンを食べた')).toBe('今日はらーめんを食べた');
  });
});

describe('detectWord', () => {
  it('自分のワードを言ったらマッチする', () => {
    const players = [
      makePlayer({ id: 'p1', name: 'Alice', secretWord: 'ねこ' }),
      makePlayer({ id: 'p2', name: 'Bob', secretWord: 'いぬ' }),
    ];

    const result = detectWord('いぬって可愛いよね', 'p2', players);

    expect(result).not.toBeNull();
    expect(result!.matchedPlayerId).toBe('p2');
    expect(result!.matchedWord).toBe('いぬ');
    expect(result!.isSelfMatch).toBe(true);
  });

  it('他人のワードを言ってもマッチしない', () => {
    const players = [
      makePlayer({ id: 'p1', name: 'Alice', secretWord: 'ねこ' }),
      makePlayer({ id: 'p2', name: 'Bob', secretWord: 'いぬ' }),
    ];

    const result = detectWord('今日ねこを見たよ', 'p2', players);

    expect(result).toBeNull();
  });

  it('自分のワードが含まれていなければnullを返す', () => {
    const players = [
      makePlayer({ id: 'p1', name: 'Alice', secretWord: 'ねこ' }),
    ];

    const result = detectWord('今日は天気がいいね', 'p1', players);

    expect(result).toBeNull();
  });

  it('脱落済みの発言者はマッチしない', () => {
    const players = [
      makePlayer({ id: 'p1', name: 'Alice', secretWord: 'ねこ', isEliminated: true }),
    ];

    const result = detectWord('ねこだよ', 'p1', players);

    expect(result).toBeNull();
  });

  it('カタカナで書いてもひらがなワードにマッチする', () => {
    const players = [
      makePlayer({ id: 'p1', name: 'Alice', secretWord: 'ねこ' }),
    ];

    const result = detectWord('ネコが好き', 'p1', players);

    expect(result).not.toBeNull();
    expect(result!.matchedWord).toBe('ねこ');
  });

  it('ひらがなで書いてもカタカナワードにマッチする', () => {
    const players = [
      makePlayer({ id: 'p1', name: 'Alice', secretWord: 'ラーメン' }),
    ];

    const result = detectWord('らーめん食べたい', 'p1', players);

    expect(result).not.toBeNull();
    expect(result!.matchedWord).toBe('ラーメン');
  });

  it('英語ワードはトークン完全一致でマッチする', () => {
    const players = [
      makePlayer({ id: 'p1', name: 'Alice', secretWord: 'dog' }),
    ];

    const result = detectWord('I love my dog', 'p1', players);

    expect(result).not.toBeNull();
    expect(result!.matchedWord).toBe('dog');
  });

  it('英語ワードの部分一致はマッチしない', () => {
    const players = [
      makePlayer({ id: 'p1', name: 'Alice', secretWord: 'cat' }),
    ];

    const result = detectWord('That was a catastrophe', 'p1', players);

    expect(result).toBeNull();
  });

  it('英語ワードは大文字小文字を無視する', () => {
    const players = [
      makePlayer({ id: 'p1', name: 'Alice', secretWord: 'Cat' }),
    ];

    const result = detectWord('I love CAT', 'p1', players);

    expect(result).not.toBeNull();
    expect(result!.matchedWord).toBe('Cat');
  });
});
