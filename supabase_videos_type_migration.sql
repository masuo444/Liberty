-- 動画テーブルにvideo_typeカラムを追加

-- 1. video_typeカラムを追加（youtube or file）
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS video_type VARCHAR(10) NOT NULL DEFAULT 'youtube';

-- 2. video_typeのチェック制約を追加
ALTER TABLE videos
ADD CONSTRAINT video_type_check CHECK (video_type IN ('youtube', 'file'));

-- 3. インデックスを追加（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_videos_type ON videos(video_type);

-- 4. コメントを追加
COMMENT ON COLUMN videos.video_type IS '動画タイプ（youtube=YouTube埋め込み、file=Vercel Blobファイル）';

-- 5. 既存のYouTube動画を更新（youtube.com/embedを含むものはyoutubeに設定）
UPDATE videos
SET video_type = 'youtube'
WHERE video_url LIKE '%youtube.com/embed%';

-- 6. その他の既存動画をfileに設定
UPDATE videos
SET video_type = 'file'
WHERE video_url NOT LIKE '%youtube.com/embed%';
