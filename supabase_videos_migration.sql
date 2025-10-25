-- 動画管理テーブルを作成
-- Supabaseダッシュボード > SQL Editor で実行してください

CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- インデックスを追加
CREATE INDEX IF NOT EXISTS idx_videos_display_order ON videos(display_order);
CREATE INDEX IF NOT EXISTS idx_videos_is_active ON videos(is_active);

-- コメントを追加
COMMENT ON TABLE videos IS '動画ライブラリの管理テーブル';
COMMENT ON COLUMN videos.title IS '動画のタイトル';
COMMENT ON COLUMN videos.description IS '動画の説明';
COMMENT ON COLUMN videos.video_url IS '動画ファイルのURL（Vercel Blob）';
COMMENT ON COLUMN videos.thumbnail_url IS 'サムネイル画像のURL';
COMMENT ON COLUMN videos.display_order IS '表示順序';
COMMENT ON COLUMN videos.is_active IS '表示/非表示フラグ';

-- updated_atを自動更新するトリガー
CREATE OR REPLACE FUNCTION update_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_videos_updated_at
  BEFORE UPDATE ON videos
  FOR EACH ROW
  EXECUTE FUNCTION update_videos_updated_at();
