-- ライセンステーブルにカスタマイズ設定カラムを追加
-- Supabaseダッシュボード > SQL Editor で実行してください

ALTER TABLE licenses
ADD COLUMN IF NOT EXISTS customization JSONB DEFAULT NULL;

-- インデックスを追加（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_licenses_customization
ON licenses USING GIN (customization);

-- コメントを追加
COMMENT ON COLUMN licenses.customization IS 'ライセンスごとのカスタマイズ設定（テーマ、色、フォントなど）';
