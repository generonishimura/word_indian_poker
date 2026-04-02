import { describe, it, expect } from 'vitest';
import { TALK_THEMES } from './words.js';
import { normalizeJapanese } from './word-detector.js';

/**
 * 濁点・半濁点を清音に正規化する
 * 「ずし」→「すし」、「ぱん」→「はん」
 * これにより「すし ⊂ てまきずし」のような関係も検出できる
 */
function normalizeDakuten(text: string): string {
  // 濁点付き → 清音 (が→か, ざ→さ, etc.)
  return text.replace(/[\u3041-\u3096]/g, (ch) => {
    const code = ch.charCodeAt(0);
    // が(3043+)→か, ざ→さ, だ→た, ば→は, ぱ→は
    // 濁点: +1 from base, 半濁点: +2 from base (は行のみ)
    // が=304C, か=304B → 奇数コードの濁音を-1
    // ぱ=3071, は=306F → 半濁音を-2
    // 簡易実装: 濁点・半濁点文字をベース文字に
    const dakutenMap: Record<number, number> = {
      0x304C: 0x304B, 0x304E: 0x304D, 0x3050: 0x304F, 0x3052: 0x3051, 0x3054: 0x3053, // が→か行
      0x3056: 0x3055, 0x3058: 0x3057, 0x305A: 0x3059, 0x305C: 0x305B, 0x305E: 0x305D, // ざ→さ行
      0x3060: 0x305F, 0x3062: 0x3061, 0x3065: 0x3064, 0x3067: 0x3066, 0x3069: 0x3068, // だ→た行
      0x3070: 0x306F, 0x3073: 0x3072, 0x3076: 0x3075, 0x3079: 0x3078, 0x307C: 0x307B, // ば→は行
      0x3071: 0x306F, 0x3074: 0x3072, 0x3077: 0x3075, 0x307A: 0x3078, 0x307D: 0x307B, // ぱ→は行
    };
    return dakutenMap[code] ? String.fromCharCode(dakutenMap[code]) : ch;
  });
}

function deepNormalize(word: string): string {
  return normalizeDakuten(normalizeJapanese(word.toLowerCase()));
}

describe('TALK_THEMES word containment check', () => {
  for (const theme of TALK_THEMES) {
    it(`${theme.id}: ワード同士に包含関係がない（濁点正規化含む）`, () => {
      const normalized = theme.words.map(w => ({
        original: w,
        norm: deepNormalize(w),
      }));

      const conflicts: string[] = [];
      for (let i = 0; i < normalized.length; i++) {
        for (let j = 0; j < normalized.length; j++) {
          if (i === j) continue;
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

    it(`${theme.id}: ワードが50個以上ある`, () => {
      expect(theme.words.length).toBeGreaterThanOrEqual(50);
    });
  }
});
