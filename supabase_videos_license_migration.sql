-- 動画テーブルにライセンスIDカラムを追加

-- 1. license_idカラムを追加（NULL許可）
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS license_id UUID REFERENCES licenses(id) ON DELETE CASCADE;

-- 2. インデックスを追加（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_videos_license_id ON videos(license_id);

-- 3. license_idとis_activeの複合インデックス
CREATE INDEX IF NOT EXISTS idx_videos_license_active ON videos(license_id, is_active);

-- 4. コメントを追加
COMMENT ON COLUMN videos.license_id IS 'ライセンスID（NULL=全ライセンス共通、UUID=特定ライセンス専用）';

-- 5. 確認用クエリ
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'videos' AND column_name = 'license_id';
