'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MessageBubble } from './MessageBubble';
import { VoiceControls } from '@/components/voice/VoiceControls';
import { useChatState } from '@/lib/hooks/useChatState';
import { useAutoReset } from '@/lib/hooks/useAutoReset';
import type { LicensePayload, VoiceStatus } from '@/lib/types';

const AUTO_RESET_MS = 60_000;

type ChatPanelProps = {
  locale: string;
  license: LicensePayload;
};

const initialVoiceStatus: VoiceStatus = {
  microphoneEnabled: false,
  speakerEnabled: false,
};

export function ChatPanel({ locale, license }: ChatPanelProps) {
  const {
    messages,
    isStreaming,
    error,
    clearMessages,
    requestCompletion,
  } = useChatState(locale);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>(() => ({
    microphoneEnabled: license.features.stt,
    speakerEnabled: license.features.tts,
  }));
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);

  useAutoReset(() => {
    if (messages.length === 0) return;
    clearMessages();
    setInput('');
  }, AUTO_RESET_MS);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) return;
    await requestCompletion(input.trim(), license, voiceStatus);
    setInput('');
  };

  const toggleMic = () => {
    if (!license.features.stt) return;
    setVoiceStatus((prev) => ({
      ...prev,
      microphoneEnabled: !prev.microphoneEnabled,
    }));
  };

  const toggleSpeaker = () => {
    if (!license.features.tts) return;
    setVoiceStatus((prev) => ({
      ...prev,
      speakerEnabled: !prev.speakerEnabled,
    }));
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <header className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-white">Liberty 多言語チャット</h2>
            <p className="text-sm text-white/70">AIプレゼンター</p>
          </div>
          <span className="rounded-full bg-liberty-500/20 px-3 py-1 text-xs text-liberty-100">
            {license.features.tts ? '音声機能：有効' : '音声機能：ロック中'}
          </span>
        </div>
        <VoiceControls
          status={voiceStatus}
          onToggleMic={toggleMic}
          onToggleSpeaker={toggleSpeaker}
          disabled={isStreaming}
        />
      </header>

      <main className="flex-1 overflow-hidden rounded-3xl border border-white/10 bg-black/40">
        <div className="flex h-full flex-col justify-between">
          <div className="flex-1 space-y-4 overflow-y-auto p-6 pr-3">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-white/60">
                <p>はじめまして！知りたい内容を入力すると、登録された資料から答えます。</p>
                <p className="text-xs">60 秒間操作がない場合、会話は自動でリセットされます。</p>
              </div>
            ) : (
              messages.map((message) => <MessageBubble key={message.id} message={message} />)
            )}
            <div ref={endRef} />
          </div>
          {error && <p className="px-6 pb-2 text-sm text-red-300">{error}</p>}
          <form onSubmit={handleSubmit} className="flex items-center gap-3 border-t border-white/10 p-4">
            <Input
              className="flex-1"
              placeholder="質問を入力してください（例：商品カタログの特徴を教えて）"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={isStreaming}
            />
            <Button type="submit" disabled={isStreaming || !input.trim()} className="gap-2">
              <PaperAirplaneIcon className="h-5 w-5" />
              送信
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
