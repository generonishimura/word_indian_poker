import { describe, it, expect } from 'vitest';
import { isValidChatInput, sanitizeChatInput } from './input-validator.js';

describe('isValidChatInput', () => {
  it('ひらがなのみの入力は有効', () => {
    expect(isValidChatInput('こんにちは')).toBe(true);
  });

  it('カタカナのみの入力は有効', () => {
    expect(isValidChatInput('ラーメン')).toBe(true);
  });

  it('ひらがなとカタカナの混在は有効', () => {
    expect(isValidChatInput('きょうはラーメンをたべた')).toBe(true);
  });

  it('句読点・記号は許可される', () => {
    expect(isValidChatInput('そうだね！いいね？')).toBe(true);
    expect(isValidChatInput('うん、そう。')).toBe(true);
  });

  it('スペースは許可される', () => {
    expect(isValidChatInput('おはよう ございます')).toBe(true);
  });

  it('全角スペースは許可される', () => {
    expect(isValidChatInput('おはよう　ございます')).toBe(true);
  });

  it('漢字を含む入力は無効', () => {
    expect(isValidChatInput('今日は天気がいい')).toBe(false);
  });

  it('英字を含む入力は無効', () => {
    expect(isValidChatInput('hello')).toBe(false);
  });

  it('数字を含む入力は有効', () => {
    expect(isValidChatInput('3じにあおう')).toBe(true);
    expect(isValidChatInput('１２３')).toBe(true);
  });

  it('空文字列は無効', () => {
    expect(isValidChatInput('')).toBe(false);
  });

  it('長音符（ー）は許可される', () => {
    expect(isValidChatInput('らーめん')).toBe(true);
    expect(isValidChatInput('コーヒー')).toBe(true);
  });

  it('中黒（・）は許可される', () => {
    expect(isValidChatInput('ねこ・いぬ')).toBe(true);
  });

  it('かぎかっこは許可される', () => {
    expect(isValidChatInput('「すごい」')).toBe(true);
  });

  it('絵文字を含む入力は無効', () => {
    expect(isValidChatInput('たのしい😀')).toBe(false);
  });
});

describe('sanitizeChatInput', () => {
  it('漢字を除去する', () => {
    expect(sanitizeChatInput('今日はいいてんき')).toBe('はいいてんき');
  });

  it('英字を除去する', () => {
    expect(sanitizeChatInput('おはようgood')).toBe('おはよう');
  });

  it('数字は保持される', () => {
    expect(sanitizeChatInput('3じにあおう')).toBe('3じにあおう');
  });

  it('ひらがな・カタカナ・許可記号のみ残す', () => {
    expect(sanitizeChatInput('ラーメン美味しい！')).toBe('ラーメンしい！');
  });

  it('すでに有効な入力はそのまま返す', () => {
    expect(sanitizeChatInput('こんにちは')).toBe('こんにちは');
  });
});
