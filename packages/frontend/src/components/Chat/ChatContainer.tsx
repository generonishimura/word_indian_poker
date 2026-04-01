import { useEffect, useRef } from 'react';
import type { Message } from '@wip/shared';
import { ChatBubble } from './ChatBubble.js';

interface Props {
  messages: Message[];
  currentPlayerId: string;
}

export function ChatContainer({ messages, currentPlayerId }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
      {messages.map(msg => (
        <ChatBubble
          key={msg.id}
          message={msg}
          isOwn={msg.type === 'chat' && msg.playerId === currentPlayerId}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
