import { WORD_LIST } from '@wip/shared';

export function assignWords(playerCount: number): string[] {
  const shuffled = [...WORD_LIST].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, playerCount);
}
