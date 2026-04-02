// ひらがな (U+3040-U+309F), カタカナ (U+30A0-U+30FF), 長音符, 中黒, 句読点, かっこ類, 数字(半角・全角), スペース
const ALLOWED_PATTERN = /^[\u3040-\u309F\u30A0-\u30FF\u3001-\u3003\u300C-\u300F\u3010\u3011\uFF01\uFF1F\uFF0C\uFF0E\uFF10-\uFF19！？、。・「」『』【】（）0-9\s]+$/;

const ALLOWED_CHARS = /[\u3040-\u309F\u30A0-\u30FF\u3001-\u3003\u300C-\u300F\u3010\u3011\uFF01\uFF1F\uFF0C\uFF0E\uFF10-\uFF19！？、。・「」『』【】（）0-9\s]/g;

export function isValidChatInput(text: string): boolean {
  if (text.length === 0) return false;
  return ALLOWED_PATTERN.test(text);
}

export function sanitizeChatInput(text: string): string {
  return (text.match(ALLOWED_CHARS) ?? []).join('');
}
