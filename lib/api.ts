import type { ChatMessage, LicensePayload, LicenseResponse, VoiceStatus } from './types';

export async function verifyLicense(key: string): Promise<LicenseResponse> {
  const res = await fetch('/api/license/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  });

  if (!res.ok) {
    return {
      ok: false,
      message: 'ライセンス検証中にエラーが発生しました。',
    };
  }

  return res.json();
}

export async function fetchChatCompletion(
  messages: ChatMessage[],
  locale: string,
  license: LicensePayload,
  voice: VoiceStatus,
) {
  const res = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, locale, license, voice }),
  });

  if (!res.ok) {
    throw new Error('チャット応答の取得に失敗しました。');
  }

  return res.body;
}

export async function requestTranscription(blob: Blob, locale: string) {
  const formData = new FormData();
  formData.append('audio', blob);
  formData.append('locale', locale);

  const res = await fetch('/api/voice/stt', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('音声の文字起こしに失敗しました。');
  }

  return res.json() as Promise<{ text: string }>;
}

export async function requestSpeech(text: string, locale: string, license: LicensePayload) {
  const res = await fetch('/api/voice/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, locale, license }),
  });

  if (!res.ok) {
    throw new Error('音声生成に失敗しました。');
  }

  const arrayBuffer = await res.arrayBuffer();
  return new Blob([arrayBuffer], { type: 'audio/mpeg' });
}
