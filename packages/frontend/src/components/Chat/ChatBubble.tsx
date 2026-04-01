import type { Message } from '@wip/shared';

interface Props {
  message: Message;
  isOwn: boolean;
}

export function ChatBubble({ message, isOwn }: Props) {
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-2">
        <span className="bg-gray-100 text-gray-500 text-xs rounded-full px-4 py-1.5 font-medium">
          {message.text}
        </span>
      </div>
    );
  }

  const hasTriggered = !!message.triggeredWord;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
      <div className={`max-w-[75%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <span className="text-[11px] text-gray-400 font-medium ml-3 mb-0.5">{message.playerName}</span>
        )}
        <div
          className={`rounded-2xl px-4 py-2.5 shadow-sm ${
            hasTriggered
              ? 'bg-red-50 border-2 border-red-300 animate-pulse'
              : isOwn
                ? 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white'
                : 'bg-white border border-gray-100'
          }`}
        >
          <p className={`text-sm leading-relaxed ${isOwn && !hasTriggered ? 'text-white' : 'text-gray-800'}`}>
            {hasTriggered ? highlightWord(message.text, message.triggeredWord!) : message.text}
          </p>
        </div>
        <span className="text-[10px] text-gray-300 mx-3 mt-0.5">
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
      <span className="bg-red-500 text-white font-bold rounded px-1 py-0.5">{matched}</span>
      {after}
    </>
  );
}
