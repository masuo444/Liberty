'use client';

import { useState, useEffect } from 'react';
import {
  PlusIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  FilmIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import type { Video } from '@/lib/supabase/types';

export function AdminVideoManager() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    displayOrder: 0,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/videos');
      const data = await response.json();
      if (response.ok) {
        setVideos(data.videos);
      }
    } catch (error) {
      console.error('動画一覧取得エラー:', error);
      alert('動画の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // ファイルサイズチェック（100MB）
      if (file.size > 100 * 1024 * 1024) {
        alert('ファイルサイズは100MB以下にしてください');
        return;
      }
      // ファイルタイプチェック
      if (!file.type.startsWith('video/')) {
        alert('動画ファイルのみアップロード可能です');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !formData.title) {
      alert('動画ファイルとタイトルは必須です');
      return;
    }

    try {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append('video', selectedFile);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('displayOrder', formData.displayOrder.toString());

      const response = await fetch('/api/admin/videos', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();

      if (response.ok) {
        alert('動画をアップロードしました');
        setShowUploadForm(false);
        setFormData({ title: '', description: '', displayOrder: 0 });
        setSelectedFile(null);
        fetchVideos();
      } else {
        alert(data.error || '動画のアップロードに失敗しました');
      }
    } catch (error) {
      console.error('動画アップロードエラー:', error);
      alert('動画のアップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleActive = async (video: Video) => {
    try {
      const response = await fetch(`/api/admin/videos/${video.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !video.is_active }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fetchVideos();
      } else {
        alert(data.error || '動画の更新に失敗しました');
      }
    } catch (error) {
      console.error('動画更新エラー:', error);
      alert('動画の更新に失敗しました');
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('この動画を削除してもよろしいですか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/videos/${videoId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fetchVideos();
      } else {
        alert(data.error || '動画の削除に失敗しました');
      }
    } catch (error) {
      console.error('動画削除エラー:', error);
      alert('動画の削除に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/60">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">動画管理</h2>
          <p className="text-sm text-white/60">登録済み: {videos.length}件</p>
        </div>
        <Button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="flex items-center gap-2 bg-liberty-500 hover:bg-liberty-600"
        >
          <PlusIcon className="h-5 w-5" />
          新規動画アップロード
        </Button>
      </div>

      {/* アップロードフォーム */}
      {showUploadForm && (
        <form
          onSubmit={handleUpload}
          className="rounded-2xl border border-liberty-400/30 bg-liberty-900/20 p-6"
        >
          <h3 className="mb-4 text-lg font-semibold text-white">動画アップロード</h3>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-white/80">
                動画ファイル (MP4, 最大100MB)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white file:mr-4 file:rounded-lg file:border-0 file:bg-liberty-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-liberty-600"
                />
              </div>
              {selectedFile && (
                <p className="mt-2 text-sm text-white/60">
                  選択中: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/80">タイトル</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/80">説明</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
                rows={3}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/80">表示順序</label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={uploading || !selectedFile}
                className="flex-1 bg-liberty-500 hover:bg-liberty-600"
              >
                {uploading ? 'アップロード中...' : '動画をアップロード'}
              </Button>
              <Button
                type="button"
                onClick={() => setShowUploadForm(false)}
                variant="ghost"
                className="border border-white/10"
              >
                キャンセル
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* 動画一覧 */}
      {videos.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
          <FilmIcon className="mx-auto h-16 w-16 text-white/20" />
          <p className="mt-4 text-white/60">動画がまだ登録されていません</p>
          <p className="mt-2 text-sm text-white/40">上のボタンから動画をアップロードしてください</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <div
              key={video.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/5"
            >
              {/* 動画プレビュー */}
              <div className="relative aspect-video bg-black">
                <video
                  src={video.video_url}
                  className="h-full w-full object-cover"
                  controls
                />
                {!video.is_active && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <span className="rounded-full bg-red-500/80 px-4 py-2 text-sm font-semibold text-white">
                      非表示
                    </span>
                  </div>
                )}
              </div>

              {/* 動画情報 */}
              <div className="p-4">
                <h3 className="font-semibold text-white">{video.title}</h3>
                {video.description && (
                  <p className="mt-1 text-sm text-white/60">{video.description}</p>
                )}
                <p className="mt-2 text-xs text-white/40">
                  表示順序: {video.display_order} | 作成日:{' '}
                  {new Date(video.created_at).toLocaleDateString('ja-JP')}
                </p>

                {/* アクションボタン */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleToggleActive(video)}
                    className={`flex-1 rounded-lg p-2 text-sm transition ${
                      video.is_active
                        ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    }`}
                    title={video.is_active ? '非表示にする' : '表示する'}
                  >
                    {video.is_active ? (
                      <>
                        <EyeSlashIcon className="mx-auto h-5 w-5" />
                      </>
                    ) : (
                      <>
                        <EyeIcon className="mx-auto h-5 w-5" />
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="rounded-lg bg-red-500/20 p-2 text-red-400 transition hover:bg-red-500/30"
                    title="削除"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
