export type FeatureFlags = {
  chat: boolean;
  stt: boolean;
  tts: boolean;
  premium_voice?: boolean; // ElevenLabs音声（プレミアムオプション）
  video?: boolean;
  companion?: boolean;
  exhibition?: boolean;
  knowledge_upload?: boolean;
  analytics?: boolean;
};

export type LicensePayload = {
  licenseKey: string;
  features: FeatureFlags;
  expiresAt: string;
  companyId?: string;
  companyName?: string;
  maxUsers?: number;
};

export type LicenseResponse = {
  ok: boolean;
  license?: LicensePayload;
  message?: string;
};

export type ChatRole = 'user' | 'assistant' | 'system';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  locale: string;
  createdAt: number;
  citations?: Array<{
    title: string;
    url?: string;
  }>;
};

export type VoiceStatus = {
  microphoneEnabled: boolean;
  speakerEnabled: boolean;
};

export type KnowledgeSource = {
  id: string;
  title: string;
  type: 'pdf' | 'url' | 'text';
  createdAt: string;
};
