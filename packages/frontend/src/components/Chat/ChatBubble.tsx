import type { Message } from '@wip/shared';

interface Props {
  message: Message;
  isOwn: boolean;
}

export function ChatBubble({ message, isOwn }: Props) {
  if (message.type === 'system') {
    return (
      <div className="flex justify-center">
        <span className="bg-gray-200 text-gray-600 text-xs rounded-full px-3 py-1">
          {message.text}
        </span>
      </div>
    );
  }

  const hasTriggered = !!message.triggeredWord;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <span className="text-xs text-gray-500 ml-1">{message.playerName}</span>
        )}
        <div
          className={`rounded-2xl px-4 py-2 ${
            hasTriggered
              ? 'bg-red-100 border-2 border-red-400'
              : isOwn
                ? 'bg-green-400 text-white'
                : 'bg-white border border-gray-200'
          }`}
        >
          <p className={`text-sm ${isOwn && !hasTriggered ? 'text-white' : 'text-gray-800'}`}>
            {hasTriggered ? highlightWord(message.text, message.triggeredWord!) : message.text}
          </p>
        </div>
        <span className="text-[10px] text-gray-400 ml-1">
          {new Date(message.timestamp).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}

function highlightWord(text: string, word: string): React.ReactNode {
  const lowerText = text.toLowerCase();
  const lowerWord = word.toLowerCase();
  const idx = lowerText.indexOf(lowerWord);

  if (idx === -1) return text;

  const before = text.slice(0, idx);
  const matched = text.slice(idx, idx + word.length);
  const after = text.slice(idx + word.length);

  return (
    <>
      {before}
      <span className="bg-red-400 text-white font-bold rounded px-1">{matched}</span>
      {after}
    </>
  );
}
