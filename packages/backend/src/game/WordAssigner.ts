import { getThemeById } from '@wip/shared';

export function assignWords(playerCount: number, themeId: string): string[] {
  const theme = getThemeById(themeId);
  if (!theme) {
    throw new Error(`Theme not found: ${themeId}`);
  }
  const shuffled = [...theme.words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, playerCount);
}
