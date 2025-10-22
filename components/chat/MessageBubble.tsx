'use client';

import { clsx } from 'clsx';
import type { ChatMessage } from '@/lib/types';

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isAssistant = message.role === 'assistant';

  return (
    <div
      className={clsx('flex w-full', isAssistant ? 'justify-start' : 'justify-end')}
      data-message-id={message.id}
    >
      <div
        className={clsx(
          'max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg shadow-black/40',
          isAssistant ? 'bg-white/10 text-white' : 'bg-liberty-500 text-white',
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        {isAssistant && message.citations && message.citations.length > 0 && (
          <div className="mt-3 border-t border-white/10 pt-2 text-xs text-white/60">
            <p className="font-semibold text-white/70">出典</p>
            <ul className="mt-1 space-y-1">
              {message.citations.map((citation) => (
                <li key={citation.title} className="truncate">
                  {citation.url ? (
                    <a
                      href={citation.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-liberty-200 hover:text-liberty-100"
                    >
                      {citation.title}
                    </a>
                  ) : (
                    <span>{citation.title}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
