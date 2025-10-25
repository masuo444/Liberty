-- Supabase Storage バケット設定
-- コンパニオン画像用のストレージバケットを作成

-- 1. companion-images バケットを作成（存在しない場合のみ）
INSERT INTO storage.buckets (id, name, public)
VALUES ('companion-images', 'companion-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. companion-images バケットのポリシーを設定

-- 2-1. 管理者による読み取りを許可
CREATE POLICY IF NOT EXISTS "管理者は画像を読み取れる"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'companion-images');

-- 2-2. 管理者によるアップロードを許可
CREATE POLICY IF NOT EXISTS "管理者は画像をアップロードできる"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'companion-images');

-- 2-3. 管理者による更新を許可
CREATE POLICY IF NOT EXISTS "管理者は画像を更新できる"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'companion-images');

-- 2-4. 管理者による削除を許可
CREATE POLICY IF NOT EXISTS "管理者は画像を削除できる"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'companion-images');

-- 2-5. 公開読み取りを許可（認証なしでも読み取り可能）
CREATE POLICY IF NOT EXISTS "誰でも画像を読み取れる"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'companion-images');

-- 確認用クエリ
SELECT * FROM storage.buckets WHERE id = 'companion-images';
