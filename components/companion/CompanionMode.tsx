'use client';

import { useEffect, useRef, useState } from 'react';
import { MicrophoneIcon, SpeakerWaveIcon } from '@heroicons/react/24/solid';
import { useChatState } from '@/lib/hooks/useChatState';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { FAQButtons } from '@/components/companion/FAQButtons';
import type { LicensePayload, VoiceStatus } from '@/lib/types';
import Image from 'next/image';

type LayoutMode = 'auto' | 'horizontal' | 'vertical';

type CompanionModeProps = {
  locale: string;
  license: LicensePayload;
  layoutMode?: LayoutMode;
};

export function CompanionMode({ locale, license, layoutMode = 'auto' }: CompanionModeProps) {
  const {
    messages,
    isStreaming,
    requestCompletion,
    appendMessage,
  } = useChatState(locale);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const [lastResponse, setLastResponse] = useState<string>('');
  const [lastProcessedLength, setLastProcessedLength] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioQueueRef = useRef<string[]>([]);
  const isProcessingQueueRef = useRef(false);

  const voiceStatus: VoiceStatus = {
    microphoneEnabled: true,
    speakerEnabled: license.features.tts,
  };

  // メッセージが更新されたら自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ロケールコードをWeb Speech API言語コードに変換
  const getVoiceLanguageCode = (locale: string): string => {
    const languageMap: Record<string, string> = {
      'ja': 'ja-JP',      // 日本語
      'en': 'en-US',      // 英語
      'zh': 'zh-CN',      // 中国語（簡体字）
      'ko': 'ko-KR',      // 韓国語
      'es': 'es-ES',      // スペイン語
      'fr': 'fr-FR',      // フランス語
      'de': 'de-DE',      // ドイツ語
      'it': 'it-IT',      // イタリア語
      'pt': 'pt-BR',      // ポルトガル語（ブラジル）
      'ru': 'ru-RU',      // ロシア語
      'ar': 'ar-SA',      // アラビア語
      'hi': 'hi-IN',      // ヒンディー語
      'th': 'th-TH',      // タイ語
      'vi': 'vi-VN',      // ベトナム語
      'id': 'id-ID',      // インドネシア語
      'nl': 'nl-NL',      // オランダ語
      'pl': 'pl-PL',      // ポーランド語
      'tr': 'tr-TR',      // トルコ語
      'sv': 'sv-SE',      // スウェーデン語
      'da': 'da-DK',      // デンマーク語
      'fi': 'fi-FI',      // フィンランド語
      'no': 'no-NO',      // ノルウェー語
      'cs': 'cs-CZ',      // チェコ語
      'hu': 'hu-HU',      // ハンガリー語
      'ro': 'ro-RO',      // ルーマニア語
      'uk': 'uk-UA',      // ウクライナ語
      'el': 'el-GR',      // ギリシャ語
      'he': 'he-IL',      // ヘブライ語
    };
    return languageMap[locale] || 'en-US'; // デフォルトは英語
  };

  // 音声認識の初期化
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true; // 中間結果を有効化
        recognitionRef.current.lang = getVoiceLanguageCode(locale);

        recognitionRef.current.onresult = (event: any) => {
          const last = event.results.length - 1;
          const transcript = event.results[last][0].transcript;
          const isFinal = event.results[last].isFinal;

          setTranscript(transcript);

          // 最終結果のみ処理
          if (isFinal) {
            handleVoiceInput(transcript);
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('音声認識エラー:', event.error);
          setIsListening(false);
        };
      }
    }
  }, [locale]);

  // 文を区切る関数（句点・ピリオド・疑問符・感嘆符で区切る）
  const splitIntoSentences = (text: string): string[] => {
    // 日本語、英語、中国語などの句読点に対応
    const sentenceEndRegex = /([。．？！\?!]+|[\.\!\?]+\s*)/g;
    const sentences: string[] = [];
    let lastIndex = 0;

    text.replace(sentenceEndRegex, (match, p1, offset) => {
      const sentence = text.slice(lastIndex, offset + match.length).trim();
      if (sentence) {
        sentences.push(sentence);
      }
      lastIndex = offset + match.length;
      return match;
    });

    // 残りのテキストを追加
    const remaining = text.slice(lastIndex).trim();
    if (remaining && (isStreaming === false || remaining.length > 30)) {
      sentences.push(remaining);
    }

    return sentences;
  };

  // 音声キューを処理する関数
  const processAudioQueue = async () => {
    if (isProcessingQueueRef.current || audioQueueRef.current.length === 0) {
      return;
    }

    isProcessingQueueRef.current = true;
    setIsSpeaking(true);

    while (audioQueueRef.current.length > 0) {
      const sentence = audioQueueRef.current.shift();
      if (sentence) {
        try {
          await playVoiceResponse(sentence);
        } catch (error) {
          console.error('音声再生エラー:', error);
        }
      }
    }

    isProcessingQueueRef.current = false;
    setIsSpeaking(false);
  };

  // 最新のAI応答を取得して文単位で音声出力（リアルタイムストリーミング）
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      const newContent = lastMessage.content;

      if (newContent.length > lastProcessedLength) {
        // 新しいテキスト部分のみを抽出
        const newText = newContent.slice(lastProcessedLength);
        const fullText = lastResponse + newText;

        // 文単位で分割
        const sentences = splitIntoSentences(fullText);

        if (sentences.length > 0) {
          // 最後の文以外をキューに追加（完全な文のみ）
          const completeSentences = isStreaming ? sentences.slice(0, -1) : sentences;

          completeSentences.forEach((sentence) => {
            if (sentence.trim() && !audioQueueRef.current.includes(sentence)) {
              audioQueueRef.current.push(sentence);
            }
          });

          // 音声出力が有効な場合、キュー処理を開始
          if (license.features.tts && voiceStatus.speakerEnabled && audioQueueRef.current.length > 0) {
            processAudioQueue();
          }

          // 処理済みの長さを更新
          const processedText = completeSentences.join('');
          setLastResponse(processedText);
          setLastProcessedLength(lastResponse.length + processedText.length);
        }
      }

      // ストリーミング終了時にリセット
      if (!isStreaming && newContent !== lastResponse) {
        setLastResponse('');
        setLastProcessedLength(0);
      }
    }
  }, [messages, lastResponse, lastProcessedLength, isStreaming, license.features.tts, voiceStatus.speakerEnabled]);

  // 音声出力関数（単一の文を再生）
  const playVoiceResponse = async (text: string): Promise<void> => {
    if (!text) return;

    try {

      const response = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          locale,
          license,
        }),
      });

      if (!response.ok) {
        throw new Error('音声生成に失敗しました');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // 新しい音声を再生（前の音声は自動的に上書き）
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // 音声再生を Promise でラップして完了を待つ
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };

        audio.onerror = (error) => {
          console.error('音声再生エラー:', error);
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };

        audio.play().catch(reject);
      });

      audioRef.current = null;
    } catch (error) {
      console.error('音声出力エラー:', error);
      throw error; // エラーを上位に伝播
    }
  };

  const handleVoiceInput = async (text: string) => {
    if (!text.trim()) return;
    await requestCompletion(text.trim(), license, voiceStatus);
    setTranscript('');
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // FAQ選択時の処理（オフラインで即座に回答）
  const handleFAQSelect = (question: string, answer: string) => {
    // ユーザーの質問をメッセージに追加
    appendMessage({
      role: 'user',
      content: question,
      locale,
    });

    // 即座にAIの回答を追加（オフライン）
    appendMessage({
      role: 'assistant',
      content: answer,
      locale,
    });

    // 音声出力が有効な場合、回答を読み上げ
    if (license.features.tts && voiceStatus.speakerEnabled) {
      setTimeout(() => {
        playVoiceResponse(answer);
      }, 100);
    }
  };

  return (
    <div className={`flex h-full gap-6 ${layoutMode === 'vertical' ? 'flex-col overflow-y-auto' : layoutMode === 'auto' ? 'portrait:flex-col portrait:overflow-y-auto' : ''}`}>
      {/* 左側: キャラクターと操作（縦型では上部） */}
      <div className={`flex w-1/2 flex-col items-center justify-center gap-8 p-8 ${layoutMode === 'vertical' ? 'w-full flex-shrink-0 py-6' : layoutMode === 'auto' ? 'portrait:w-full portrait:flex-shrink-0 portrait:py-6' : ''}`}>
        {/* キャラクターアイコン */}
        <div className="relative">
          <div className={`relative h-64 w-64 overflow-hidden rounded-full shadow-2xl transition-all duration-300 ${
            isListening ? 'scale-110 shadow-liberty-500/50 ring-4 ring-liberty-400/50' : ''
          } ${isStreaming ? 'animate-pulse' : ''}`}>
            <Image
              src={license.companionImageUrl || '/companion-character.png'}
              alt="コンパニオンキャラクター"
              fill
              className="object-cover"
              priority
            />
          </div>
          {/* 音声入力インジケーター */}
          {isListening && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-72 w-72 animate-ping rounded-full bg-liberty-400/30"></div>
            </div>
          )}
        </div>

        {/* ステータステキスト */}
        <div className="text-center">
          {isSpeaking ? (
            <p className="text-xl font-semibold text-green-400">話しています...</p>
          ) : isListening ? (
            <p className="text-xl font-semibold text-liberty-300">聞いています...</p>
          ) : isStreaming ? (
            <p className="text-xl font-semibold text-liberty-300">考えています...</p>
          ) : transcript ? (
            <p className="text-lg text-white/80">あなた: {transcript}</p>
          ) : (
            <p className="text-xl text-white/60">ボタンを押して話しかけてください</p>
          )}
        </div>

        {/* 音声入力ボタン */}
        <button
          onMouseDown={startListening}
          onMouseUp={stopListening}
          onTouchStart={startListening}
          onTouchEnd={stopListening}
          disabled={isStreaming}
          className={`flex h-24 w-24 items-center justify-center rounded-full shadow-2xl transition-all duration-200 disabled:opacity-50 ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 active:scale-95'
              : isSpeaking
              ? 'animate-pulse bg-green-500'
              : 'bg-liberty-500 hover:bg-liberty-600 active:scale-95'
          }`}
        >
          <MicrophoneIcon className="h-12 w-12 text-white" />
        </button>

        <p className="text-sm text-white/50">ボタンを押している間、音声を認識します</p>

        {/* 音声機能ステータス */}
        <div className="flex items-center gap-4 rounded-full border border-white/20 bg-white/5 px-6 py-3">
          <div className="flex items-center gap-2">
            <MicrophoneIcon className="h-5 w-5 text-green-400" />
            <span className="text-sm text-white/80">音声入力: ON</span>
          </div>
          <div className="h-4 w-px bg-white/20"></div>
          <div className="flex items-center gap-2">
            <SpeakerWaveIcon className={`h-5 w-5 ${license.features.tts ? 'text-green-400' : 'text-gray-500'}`} />
            <span className="text-sm text-white/80">
              音声出力: {license.features.tts ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </div>

      {/* 右側: 会話履歴（縦型では下部） */}
      <div className={`flex w-1/2 flex-col rounded-3xl border border-white/10 bg-black/40 p-6 ${layoutMode === 'vertical' ? 'w-full flex-1' : layoutMode === 'auto' ? 'portrait:w-full portrait:flex-1' : ''}`}>
        <h3 className="mb-4 text-xl font-semibold text-white">会話履歴</h3>

        {/* FAQボタン */}
        <div className="mb-4">
          <FAQButtons locale={locale} onSelectFAQ={handleFAQSelect} />
        </div>

        <div className={`flex-1 space-y-4 overflow-y-auto pr-2 ${layoutMode === 'vertical' ? 'max-h-96' : layoutMode === 'auto' ? 'portrait:max-h-96' : ''}`}>
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-white/60">
              <p>まだ会話がありません</p>
              <p className="text-xs">ボタンを押して話しかけてください</p>
            </div>
          ) : (
            messages.map((message) => <MessageBubble key={message.id} message={message} />)
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
