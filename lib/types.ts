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

export type LicenseCustomization = {
  theme?: 'default' | 'modern' | 'minimal' | 'classic';
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  logoUrl?: string;
  customCss?: string;
};

export type LicensePayload = {
  licenseKey: string;
  features: FeatureFlags;
  expiresAt: string;
  companyId?: string;
  companyName?: string;
  companionImageUrl?: string;
  maxUsers?: number;
  customization?: LicenseCustomization | null;
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
