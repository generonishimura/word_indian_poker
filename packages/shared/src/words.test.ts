import { describe, it, expect } from 'vitest';
import { TALK_THEMES } from './words.js';
import { normalizeJapanese } from './word-detector.js';

describe('TALK_THEMES word containment check', () => {
  for (const theme of TALK_THEMES) {
    it(`${theme.id}: ワード同士に包含関係がない`, () => {
      const normalized = theme.words.map(w => ({
        original: w,
        norm: normalizeJapanese(w.toLowerCase()),
      }));

      const conflicts: string[] = [];
      for (let i = 0; i < normalized.length; i++) {
        for (let j = 0; j < normalized.length; j++) {
          if (i === j) continue;
          // normalized[i] が normalized[j] の部分文字列かチェック
          if (normalized[j].norm.includes(normalized[i].norm)) {
            conflicts.push(`"${normalized[i].original}" ⊂ "${normalized[j].original}"`);
          }
        }
      }

      expect(conflicts, `包含関係のあるペア:\n${conflicts.join('\n')}`).toHaveLength(0);
    });

    it(`${theme.id}: ワードに重複がない`, () => {
      const normalized = theme.words.map(w => normalizeJapanese(w.toLowerCase()));
      const unique = new Set(normalized);
      expect(unique.size).toBe(theme.words.length);
    });
  }
});
