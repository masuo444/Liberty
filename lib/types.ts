export type FeatureFlags = {
  chat: boolean;
  stt: boolean;
  tts: boolean;
};

export type LicensePayload = {
  licenseKey: string;
  features: FeatureFlags;
  expiresAt: string;
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
