import { useState } from 'react';
import { sanitizeChatInput, isValidChatInput } from '@wip/shared';

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled = false, placeholder = 'ひらがな・カタカナで入力' }: Props) {
  const [text, setText] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeChatInput(e.target.value);
    setText(sanitized);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled || !isValidChatInput(trimmed)) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 flex-1">
      <input
        type="text"
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white disabled:bg-gray-100 disabled:text-gray-300 transition-all placeholder:text-gray-300"
        autoFocus
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shrink-0 active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
        </svg>
      </button>
    </form>
  );
}
