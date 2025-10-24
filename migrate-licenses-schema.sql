-- licensesテーブルにライセンス固有の設定カラムを追加
-- これにより、同一企業が複数ライセンスを持ち、それぞれ独自の知識ベース・画像を設定可能になります

ALTER TABLE licenses
ADD COLUMN IF NOT EXISTS openai_vector_store_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS openai_assistant_id TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS companion_image_url TEXT DEFAULT NULL;

-- インデックスを追加（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_licenses_vector_store
ON licenses(openai_vector_store_id)
WHERE openai_vector_store_id IS NOT NULL;

-- コメントを追加
COMMENT ON COLUMN licenses.openai_vector_store_id IS 'このライセンス専用のOpenAI Vector Store ID';
COMMENT ON COLUMN licenses.openai_assistant_id IS 'このライセンス専用のOpenAI Assistant ID';
COMMENT ON COLUMN licenses.companion_image_url IS 'このライセンス専用のコンパニオン画像URL';
