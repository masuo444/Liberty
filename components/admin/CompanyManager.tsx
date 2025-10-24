'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  BuildingOfficeIcon,
  DocumentTextIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';

interface Company {
  id: string;
  name: string;
  display_name: string;
  email: string | null;
  phone: string | null;
  openai_vector_store_id: string | null;
  companion_image_url: string | null;
  created_at: string;
}

interface KnowledgeFile {
  id: string;
  filename: string;
  status: string;
  created_at: number;
}

export function CompanyManager() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // 企業一覧を取得
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/companies');
      const data = await response.json();

      if (response.ok) {
        setCompanies(data.companies);
      } else {
        console.error('企業一覧取得エラー:', data.error);
        alert('企業一覧の取得に失敗しました');
      }
    } catch (error) {
      console.error('企業一覧取得エラー:', error);
      alert('企業一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 企業別ファイル一覧を取得
  const fetchFiles = async (companyId: string) => {
    try {
      setFilesLoading(true);
      const response = await fetch(`/api/admin/knowledge/${companyId}`);
      const data = await response.json();

      if (response.ok) {
        setFiles(data.files);
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

  useEffect(() => {
    fetchCompanies();
  }, []);

  // 企業を選択
  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company);
    fetchFiles(company.id);
  };

  // ファイルアップロード
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedCompany) return;

    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/admin/knowledge/${selectedCompany.id}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert('ファイルをアップロードしました');
        fetchFiles(selectedCompany.id);
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
    if (!selectedCompany) return;

    if (!confirm(`「${fileName}」を削除してもよろしいですか？`)) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/knowledge/${selectedCompany.id}?fileId=${fileId}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert('ファイルを削除しました');
        fetchFiles(selectedCompany.id);
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
    if (!selectedCompany) return;

    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/admin/companies/${selectedCompany.id}/companion-image`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert('コンパニオン画像をアップロードしました');
        // 企業情報を更新
        setSelectedCompany({
          ...selectedCompany,
          companion_image_url: data.imageUrl,
        });
        // 企業一覧も更新
        fetchCompanies();
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
    if (!selectedCompany) return;

    if (!confirm('コンパニオン画像を削除してもよろしいですか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/companies/${selectedCompany.id}/companion-image`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        alert('コンパニオン画像を削除しました');
        // 企業情報を更新
        setSelectedCompany({
          ...selectedCompany,
          companion_image_url: null,
        });
        // 企業一覧も更新
        fetchCompanies();
      } else {
        alert(data.error || 'コンパニオン画像の削除に失敗しました');
      }
    } catch (error) {
      console.error('画像削除エラー:', error);
      alert('コンパニオン画像の削除に失敗しました');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('ja-JP');
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
      <div>
        <h2 className="text-2xl font-bold">企業管理</h2>
        <p className="text-sm text-white/60">
          企業を選択して知識ベースを管理できます（登録企業: {companies.length}件）
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 左側: 企業一覧 */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 lg:col-span-1">
          <h3 className="mb-4 text-lg font-semibold">企業一覧</h3>
          {companies.length === 0 ? (
            <div className="text-center text-sm text-white/60">企業が登録されていません</div>
          ) : (
            <div className="space-y-2">
              {companies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => handleSelectCompany(company)}
                  className={`w-full rounded-lg border p-4 text-left transition ${
                    selectedCompany?.id === company.id
                      ? 'border-liberty-400 bg-liberty-500/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <BuildingOfficeIcon className="h-5 w-5 text-liberty-300" />
                    <span className="font-semibold">{company.display_name}</span>
                  </div>
                  <div className="text-xs text-white/60">
                    <div>ID: {company.name}</div>
                    {company.openai_vector_store_id && (
                      <div className="mt-1 flex items-center gap-1 text-green-400">
                        <CheckCircleIcon className="h-4 w-4" />
                        Vector Store設定済み
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 右側: 知識ベース管理 */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 lg:col-span-2">
          {!selectedCompany ? (
            <div className="flex h-full items-center justify-center text-white/60">
              左側から企業を選択してください
            </div>
          ) : (
            <div className="space-y-4">
              {/* ヘッダー */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{selectedCompany.display_name}</h3>
                  <p className="text-sm text-white/60">知識ベース管理</p>
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
                  <p className="text-white/60">
                    まだファイルがアップロードされていません
                  </p>
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

              {/* コンパニオン画像 */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold">コンパニオン画像</p>
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
                      className="flex items-center gap-2 bg-liberty-500 hover:bg-liberty-600"
                    >
                      <PhotoIcon className="h-4 w-4" />
                      {uploadingImage ? 'アップロード中...' : '画像変更'}
                    </Button>
                    {selectedCompany.companion_image_url && (
                      <Button
                        onClick={handleDeleteImage}
                        variant="ghost"
                        className="text-red-400 hover:bg-red-500/10"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {selectedCompany.companion_image_url ? (
                  <div className="relative aspect-square w-32 overflow-hidden rounded-lg">
                    <Image
                      src={selectedCompany.companion_image_url}
                      alt="コンパニオン画像"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-square w-32 items-center justify-center rounded-lg border border-dashed border-white/20 bg-white/5">
                    <PhotoIcon className="h-12 w-12 text-white/30" />
                  </div>
                )}
                <p className="mt-2 text-xs text-white/60">
                  JPEG、PNG、WebP、GIF形式（最大5MB）
                </p>
              </div>

              {/* Vector Store情報 */}
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="mb-2 text-xs text-white/60">Vector Store ID</p>
                {selectedCompany.openai_vector_store_id ? (
                  <p className="font-mono text-sm text-liberty-300">
                    {selectedCompany.openai_vector_store_id}
                  </p>
                ) : (
                  <p className="text-sm text-white/60">
                    ファイルをアップロードすると自動作成されます
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
