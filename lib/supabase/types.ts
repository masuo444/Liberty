// Supabase Database Types
export interface Database {
  public: {
    Tables: {
      companies: {
        Row: Company;
        Insert: CompanyInsert;
        Update: CompanyUpdate;
      };
      licenses: {
        Row: License;
        Insert: LicenseInsert;
        Update: LicenseUpdate;
      };
      usage_logs: {
        Row: UsageLog;
        Insert: UsageLogInsert;
        Update: UsageLogUpdate;
      };
    };
  };
}

// 企業
export interface Company {
  id: string;
  name: string;
  display_name: string;
  email: string | null;
  phone: string | null;
  openai_vector_store_id: string | null;
  openai_assistant_id: string | null;
  companion_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyInsert {
  id?: string;
  name: string;
  display_name: string;
  email?: string | null;
  phone?: string | null;
  openai_vector_store_id?: string | null;
  openai_assistant_id?: string | null;
  companion_image_url?: string | null;
}

export interface CompanyUpdate {
  name?: string;
  display_name?: string;
  email?: string | null;
  phone?: string | null;
  openai_vector_store_id?: string | null;
  openai_assistant_id?: string | null;
  companion_image_url?: string | null;
}

// ライセンス
export interface License {
  id: string;
  company_id: string;
  license_key: string;
  expires_at: string;
  is_active: boolean;
  max_users: number;
  features: LicenseFeatures;
  customization: LicenseCustomization | null;
  openai_vector_store_id: string | null;
  openai_assistant_id: string | null;
  companion_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface LicenseFeatures {
  chat: boolean;
  video: boolean;
  companion: boolean;
  exhibition: boolean;
  tts: boolean;
  stt: boolean;
  premium_voice?: boolean;
  knowledge_upload: boolean;
  analytics: boolean;
}

// カスタマイズ設定
export interface LicenseCustomization {
  theme?: 'default' | 'modern' | 'minimal' | 'classic';
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  logoUrl?: string;
  customCss?: string;
}

export interface LicenseInsert {
  id?: string;
  company_id: string;
  license_key: string;
  expires_at: string;
  is_active?: boolean;
  max_users?: number;
  features?: LicenseFeatures;
  customization?: LicenseCustomization | null;
  openai_vector_store_id?: string | null;
  openai_assistant_id?: string | null;
  companion_image_url?: string | null;
}

export interface LicenseUpdate {
  company_id?: string;
  license_key?: string;
  expires_at?: string;
  is_active?: boolean;
  max_users?: number;
  features?: Partial<LicenseFeatures>;
  customization?: LicenseCustomization | null;
  openai_vector_store_id?: string | null;
  openai_assistant_id?: string | null;
  companion_image_url?: string | null;
  updated_at?: string;
}

// 利用ログ
export interface UsageLog {
  id: string;
  license_id: string;
  event_type: 'login' | 'chat' | 'video_play' | 'companion_use' | 'knowledge_upload' | 'logout';
  event_data: Record<string, any> | null;
  user_language: string | null;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
}

export interface UsageLogInsert {
  id?: string;
  license_id: string;
  event_type: 'login' | 'chat' | 'video_play' | 'companion_use' | 'knowledge_upload' | 'logout';
  event_data?: Record<string, any> | null;
  user_language?: string | null;
  user_agent?: string | null;
  ip_address?: string | null;
}

export interface UsageLogUpdate {
  event_data?: Record<string, any> | null;
}

// ライセンスと企業のJoin型
export interface LicenseWithCompany extends License {
  company: Company;
}
