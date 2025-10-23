-- Liberty データベーススキーマ
-- Supabaseで実行するSQLファイル

-- 企業テーブル
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  openai_vector_store_id VARCHAR(255) UNIQUE,
  openai_assistant_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ライセンステーブル
CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  license_key VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  max_users INTEGER DEFAULT 100,
  features JSONB DEFAULT '{
    "chat": true,
    "video": true,
    "companion": true,
    "exhibition": true,
    "tts": true,
    "stt": true,
    "knowledge_upload": true,
    "analytics": true
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 利用ログテーブル
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL, -- 'login', 'chat', 'video_play', 'companion_use', 'knowledge_upload'
  event_data JSONB,
  user_language VARCHAR(10),
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_licenses_company_id ON licenses(company_id);
CREATE INDEX IF NOT EXISTS idx_licenses_license_key ON licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_expires_at ON licenses(expires_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_license_id ON usage_logs(license_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_event_type ON usage_logs(event_type);

-- 更新日時を自動更新する関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーの設定
CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_licenses_updated_at
    BEFORE UPDATE ON licenses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- サンプルデータ（開発用）
INSERT INTO companies (name, display_name, email) VALUES
  ('fomus', 'FOMUS株式会社', 'info@fomus.jp')
ON CONFLICT DO NOTHING;

-- サンプルライセンス（開発用）
-- 有効期限: 2026年12月31日
INSERT INTO licenses (company_id, license_key, expires_at) VALUES
  (
    (SELECT id FROM companies WHERE name = 'fomus' LIMIT 1),
    'LIBERTY-DEMO-2024-FOMUS',
    '2026-12-31 23:59:59+00'
  )
ON CONFLICT (license_key) DO NOTHING;

-- コメント
COMMENT ON TABLE companies IS '企業情報を管理するテーブル';
COMMENT ON TABLE licenses IS 'ライセンス情報を管理するテーブル（企業ごとに複数発行可能）';
COMMENT ON TABLE usage_logs IS '利用ログを記録するテーブル（分析用）';
