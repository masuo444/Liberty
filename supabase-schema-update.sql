-- Liberty データベーススキーマ拡張
-- Rate Limit と Error Logs 機能追加

-- 1. companiesテーブルにRate Limit設定を追加
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS monthly_chat_limit INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS monthly_video_limit INTEGER DEFAULT 500,
ADD COLUMN IF NOT EXISTS monthly_knowledge_upload_limit INTEGER DEFAULT 100;

-- 2. エラーログテーブルを作成
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id UUID REFERENCES licenses(id) ON DELETE CASCADE,
  error_type VARCHAR(100) NOT NULL, -- 'openai_error', 'network_error', 'rate_limit_error', etc.
  error_message TEXT,
  error_data JSONB,
  request_path VARCHAR(255),
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. インデックス追加
CREATE INDEX IF NOT EXISTS idx_error_logs_license_id ON error_logs(license_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs(error_type);

-- 4. 月間使用量を集計するビューを作成
CREATE OR REPLACE VIEW monthly_usage AS
SELECT
  l.company_id,
  l.id AS license_id,
  l.license_key,
  DATE_TRUNC('month', ul.created_at) AS month,
  COUNT(CASE WHEN ul.event_type = 'chat' THEN 1 END) AS chat_count,
  COUNT(CASE WHEN ul.event_type = 'video_play' THEN 1 END) AS video_count,
  COUNT(CASE WHEN ul.event_type = 'knowledge_upload' THEN 1 END) AS knowledge_upload_count
FROM
  licenses l
LEFT JOIN
  usage_logs ul ON l.id = ul.license_id
WHERE
  ul.created_at >= DATE_TRUNC('month', CURRENT_TIMESTAMP)
GROUP BY
  l.company_id, l.id, l.license_key, DATE_TRUNC('month', ul.created_at);

-- 5. 企業の現在の使用量と制限を表示するビューを作成
CREATE OR REPLACE VIEW company_usage_status AS
SELECT
  c.id AS company_id,
  c.name,
  c.display_name,
  c.monthly_chat_limit,
  c.monthly_video_limit,
  c.monthly_knowledge_upload_limit,
  COALESCE(SUM(mu.chat_count), 0) AS current_chat_usage,
  COALESCE(SUM(mu.video_count), 0) AS current_video_usage,
  COALESCE(SUM(mu.knowledge_upload_count), 0) AS current_knowledge_upload_usage,
  CASE
    WHEN COALESCE(SUM(mu.chat_count), 0) >= c.monthly_chat_limit THEN true
    ELSE false
  END AS chat_limit_exceeded,
  CASE
    WHEN COALESCE(SUM(mu.video_count), 0) >= c.monthly_video_limit THEN true
    ELSE false
  END AS video_limit_exceeded,
  CASE
    WHEN COALESCE(SUM(mu.knowledge_upload_count), 0) >= c.monthly_knowledge_upload_limit THEN true
    ELSE false
  END AS knowledge_upload_limit_exceeded
FROM
  companies c
LEFT JOIN
  licenses l ON c.id = l.company_id
LEFT JOIN
  monthly_usage mu ON l.id = mu.license_id
GROUP BY
  c.id, c.name, c.display_name, c.monthly_chat_limit, c.monthly_video_limit, c.monthly_knowledge_upload_limit;

-- 6. 既存企業にデフォルト制限を設定
UPDATE companies
SET
  monthly_chat_limit = 1000,
  monthly_video_limit = 500,
  monthly_knowledge_upload_limit = 100
WHERE
  monthly_chat_limit IS NULL;

-- コメント
COMMENT ON COLUMN companies.monthly_chat_limit IS '月間チャット回数制限（デフォルト: 1000回）';
COMMENT ON COLUMN companies.monthly_video_limit IS '月間動画再生回数制限（デフォルト: 500回）';
COMMENT ON COLUMN companies.monthly_knowledge_upload_limit IS '月間ファイルアップロード回数制限（デフォルト: 100回）';
COMMENT ON TABLE error_logs IS 'エラーログを記録するテーブル（デバッグ・監視用）';
COMMENT ON VIEW monthly_usage IS '月間使用量を集計するビュー';
COMMENT ON VIEW company_usage_status IS '企業ごとの使用量と制限の状況を表示するビュー';
