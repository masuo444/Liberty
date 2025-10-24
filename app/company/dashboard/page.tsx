'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import {
  BuildingOfficeIcon,
  DocumentTextIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhotoIcon,
  ArrowLeftIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

interface CompanyData {
  id: string;
  name: string;
  companionImageUrl: string | null;
  vectorStoreId: string | null;
}

interface KnowledgeFile {
  id: string;
  filename: string;
  status: string;
  created_at: number;
}

export default function CompanyDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // 認証チェック
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/company/auth/check');
      const data = await response.json();

      if (data.authenticated && data.company) {
        setAuthenticated(true);
        setCompany(data.company);
        fetchFiles(data.company.id);
      } else {
        router.push('/company/login');
      }
    } catch (error) {
      console.error('認証チェックエラー:', error);
      router.push('/company/login');
    } finally {
      setLoading(false);
    }
  };

  // ファイル一覧を取得
  const fetchFiles = async (companyId: string) => {
    try {
      setFilesLoading(true);
      const response = await fetch(`/api/company/knowledge`);
      const data = await response.json();

      if (response.ok) {
        setFiles(data.files || []);
      } else {
        console.error('ファイル一覧取得エラー:', data.error);
        alert('ファイル一覧の取得に失敗しました');
      }
    } catch (error) {
      console.error('ファイル一覧取得エラー:', error);
      alert('ファイル一覧の取得に失敗しました');
    } finally {
      setFilesLoading(false);
    }
  };

  // ファイルアップロード
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!company) return;

    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/company/knowledge/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert('ファイルをアップロードしました');
        fetchFiles(company.id);
      } else {
        alert(data.error || 'ファイルのアップロードに失敗しました');
      }
    } catch (error) {
      console.error('ファイルアップロードエラー:', error);
      alert('ファイルのアップロードに失敗しました');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // ファイル削除
  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (!company) return;

    if (!confirm(`「${fileName}」を削除してもよろしいですか？`)) {
      return;
    }

    try {
      const response = await fetch(`/api/company/knowledge?fileId=${fileId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        alert('ファイルを削除しました');
        fetchFiles(company.id);
      } else {
        alert(data.error || 'ファイルの削除に失敗しました');
      }
    } catch (error) {
      console.error('ファイル削除エラー:', error);
      alert('ファイルの削除に失敗しました');
    }
  };

  // コンパニオン画像アップロード
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!company) return;

    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/company/companion-image`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert('コンパニオン画像をアップロードしました');
        setCompany({
          ...company,
          companionImageUrl: data.imageUrl,
        });
      } else {
        alert(data.error || 'コンパニオン画像のアップロードに失敗しました');
      }
    } catch (error) {
      console.error('画像アップロードエラー:', error);
      alert('コンパニオン画像のアップロードに失敗しました');
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  // コンパニオン画像削除
  const handleDeleteImage = async () => {
    if (!company) return;

    if (!confirm('コンパニオン画像を削除してもよろしいですか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/company/companion-image`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        alert('コンパニオン画像を削除しました');
        setCompany({
          ...company,
          companionImageUrl: null,
        });
      } else {
        alert(data.error || 'コンパニオン画像の削除に失敗しました');
      }
    } catch (error) {
      console.error('画像削除エラー:', error);
      alert('コンパニオン画像の削除に失敗しました');
    }
  };

  // ログアウト
  const handleLogout = async () => {
    try {
      await fetch('/api/company/auth/logout', { method: 'POST' });
      router.push('/company/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('ja-JP');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-liberty-900 to-black">
        <div className="text-white/60">読み込み中...</div>
      </div>
    );
  }

  if (!authenticated || !company) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-liberty-900 to-black p-6 text-white">
      {/* ヘッダー */}
      <header className="mb-8 rounded-3xl border border-white/10 bg-white/5 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">企業管理ポータル</p>
            <h1 className="text-2xl font-bold">{company.name}</h1>
          </div>
          <div className="flex gap-3">
            <a href="/">
              <Button variant="ghost" className="flex items-center gap-2">
                <ArrowLeftIcon className="h-5 w-5" />
                アプリに戻る
              </Button>
            </a>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-400 hover:bg-red-500/10"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 知識ベース管理 */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">知識ベース管理</h2>
              <p className="text-sm text-white/60">アップロードしたファイル</p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md,.doc,.docx,.csv,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 bg-liberty-500 hover:bg-liberty-600"
              >
                <ArrowUpTrayIcon className="h-5 w-5" />
                {uploading ? 'アップロード中...' : 'ファイル追加'}
              </Button>
            </div>
          </div>

          {/* ファイル一覧 */}
          {filesLoading ? (
            <div className="py-8 text-center text-white/60">読み込み中...</div>
          ) : files.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
              <DocumentTextIcon className="mx-auto mb-3 h-12 w-12 text-white/30" />
              <p className="text-white/60">まだファイルがアップロードされていません</p>
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-center gap-3">
                    <DocumentTextIcon className="h-6 w-6 text-liberty-300" />
                    <div>
                      <p className="font-semibold">{file.filename}</p>
                      <div className="flex items-center gap-3 text-xs text-white/60">
                        <span>{formatDate(file.created_at)}</span>
                        <span>•</span>
                        <span
                          className={`flex items-center gap-1 ${
                            file.status === 'completed'
                              ? 'text-green-400'
                              : file.status === 'in_progress'
                              ? 'text-amber-400'
                              : 'text-red-400'
                          }`}
                        >
                          {file.status === 'completed' ? (
                            <>
                              <CheckCircleIcon className="h-4 w-4" />
                              処理完了
                            </>
                          ) : file.status === 'in_progress' ? (
                            <>処理中</>
                          ) : (
                            <>
                              <XCircleIcon className="h-4 w-4" />
                              エラー
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteFile(file.id, file.filename)}
                    className="rounded-lg bg-red-500/20 p-2 text-red-400 transition hover:bg-red-500/30"
                    title="削除"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Vector Store情報 */}
          <div className="mt-4 rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="mb-2 text-xs text-white/60">Vector Store ID</p>
            {company.vectorStoreId ? (
              <p className="font-mono text-sm text-liberty-300">{company.vectorStoreId}</p>
            ) : (
              <p className="text-sm text-white/60">
                ファイルをアップロードすると自動作成されます
              </p>
            )}
          </div>
        </div>

        {/* コンパニオン画像管理 */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold">コンパニオン画像管理</h2>
            <p className="text-sm text-white/60">AIアシスタントのキャラクター画像</p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold">現在の画像</p>
              <div className="flex gap-2">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={uploadingImage}
                  size="sm"
                  className="flex items-center gap-2 bg-liberty-500 hover:bg-liberty-600"
                >
                  <PhotoIcon className="h-4 w-4" />
                  {uploadingImage ? 'アップロード中...' : '画像変更'}
                </Button>
                {company.companionImageUrl && (
                  <Button
                    onClick={handleDeleteImage}
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:bg-red-500/10"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {company.companionImageUrl ? (
              <div className="relative mx-auto aspect-square w-64 overflow-hidden rounded-lg">
                <Image
                  src={company.companionImageUrl}
                  alt="コンパニオン画像"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="mx-auto flex aspect-square w-64 items-center justify-center rounded-lg border border-dashed border-white/20 bg-white/5">
                <PhotoIcon className="h-16 w-16 text-white/30" />
              </div>
            )}

            <p className="mt-4 text-center text-xs text-white/60">
              JPEG、PNG、WebP、GIF形式（最大5MB）
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
