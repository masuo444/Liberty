'use client';

import { useCallback, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { fetchChatCompletion } from '../api';
import type { ChatMessage, LicensePayload, VoiceStatus } from '../types';

export function useChatState(locale: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appendMessage = useCallback((message: Omit<ChatMessage, 'id' | 'createdAt'>) => {
    setMessages((prev) => [
      ...prev,
      {
        ...message,
        id: uuid(),
        createdAt: Date.now(),
      },
    ]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const requestCompletion = useCallback(
    async (input: string, license: LicensePayload, voiceStatus: VoiceStatus) => {
      setIsStreaming(true);
      setError(null);

      const userMessage: ChatMessage = {
        id: uuid(),
        role: 'user',
        content: input,
        locale,
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, userMessage]);

      let assistantContent = '';
      let citations: ChatMessage['citations'];

      try {
        const stream = await fetchChatCompletion([...messages, userMessage], locale, license, voiceStatus);
        if (!stream) {
          throw new Error('ストリームが開けませんでした');
        }

        const reader = stream.getReader();
        const decoder = new TextDecoder('utf-8');

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          try {
            chunk
              .split('\n')
              .filter(Boolean)
              .forEach((line) => {
                const data = JSON.parse(line) as {
                  delta?: string;
                  citations?: ChatMessage['citations'];
                  done?: boolean;
                };

                if (data.delta) {
                  assistantContent += data.delta;
                  setMessages((prev) => {
                    const base = prev.filter((msg) => msg.id !== 'assistant-stream');
                    return [
                      ...base,
                      {
                        id: 'assistant-stream',
                        role: 'assistant',
                        content: assistantContent,
                        locale,
                        createdAt: Date.now(),
                        citations,
                      },
                    ];
                  });
                }

                if (data.citations) {
                  citations = data.citations;
                }
              });
          } catch (streamError) {
            console.warn('Stream parse error', streamError);
          }
        }
      } catch (err) {
        console.error(err);
        setError('応答の生成に失敗しました。');
      } finally {
        setIsStreaming(false);
        setMessages((prev) => {
          const base = prev.filter((msg) => msg.id !== 'assistant-stream');
          return assistantContent
            ? [
                ...base,
                {
                  id: uuid(),
                  role: 'assistant',
                  content: assistantContent,
                  locale,
                  createdAt: Date.now(),
                  citations,
                },
              ]
            : base;
        });
      }
    },
    [locale, messages],
  );

  return useMemo(
    () => ({
      messages,
      isStreaming,
      error,
      appendMessage,
      clearMessages,
      requestCompletion,
    }),
    [messages, isStreaming, error, appendMessage, clearMessages, requestCompletion],
  );
}
