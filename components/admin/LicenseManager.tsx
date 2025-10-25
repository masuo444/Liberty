'use client';

import { useState, useEffect } from 'react';
import {
  PlusIcon,
  TrashIcon,
  StopCircleIcon,
  PlayCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  PaintBrushIcon,
  FilmIcon,
  SpeakerWaveIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { CustomizationEditor } from './CustomizationEditor';
import type { LicenseCustomization } from '@/lib/supabase/types';

interface License {
  id: string;
  license_key: string;
  expires_at: string;
  is_active: boolean;
  max_users: number;
  features: {
    chat: boolean;
    video: boolean;
    companion: boolean;
    exhibition: boolean;
    tts: boolean;
    stt: boolean;
    premium_voice?: boolean;
    knowledge_upload: boolean;
    analytics: boolean;
  };
  customization: LicenseCustomization | null;
  openai_vector_store_id: string | null;
  openai_assistant_id: string | null;
  companion_image_url: string | null;
  voice_id: string;
  created_at: string;
  company: {
    id: string;
    name: string;
    display_name: string;
    email: string | null;
    phone: string | null;
  };
}

interface KnowledgeFile {
  id: string;
  filename: string;
  status: string;
  created_at: number;
}

interface Video {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  display_order: number;
  is_active: boolean;
  license_id: string | null;
  video_type: 'youtube' | 'file';
  created_at: string;
  updated_at: string;
}

// ElevenLabs音声一覧
const AVAILABLE_VOICES = [
  { id: 'Rachel', name: 'Rachel', gender: '女性', description: '落ち着いた、プロフェッショナルな女性の声' },
  { id: 'Domi', name: 'Domi', gender: '女性', description: '元気で明るい女性の声' },
  { id: 'Bella', name: 'Bella', gender: '女性', description: '若々しく優しい女性の声' },
  { id: 'Antoni', name: 'Antoni', gender: '男性', description: 'よく通る、信頼感のある男性の声' },
  { id: 'Elli', name: 'Elli', gender: '女性', description: '感情豊かな女性の声' },
  { id: 'Josh', name: 'Josh', gender: '男性', description: '深みのある、落ち着いた男性の声' },
  { id: 'Arnold', name: 'Arnold', gender: '男性', description: 'クリアで聞き取りやすい男性の声' },
  { id: 'Adam', name: 'Adam', gender: '男性', description: '深く、ドラマティックな男性の声' },
  { id: 'Sam', name: 'Sam', gender: '男性', description: '若々しく親しみやすい男性の声' },
];

interface FormData {
  companyName: string;
  companyDisplayName: string;
  companyEmail: string;
  companyPhone: string;
  licenseKey: string;
  expiresAt: string;
  maxUsers: number;
}

export function LicenseManager() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedLicenses, setExpandedLicenses] = useState<Set<string>>(new Set());
  const [knowledgeFiles, setKnowledgeFiles] = useState<Record<string, KnowledgeFile[]>>({});
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState<string | null>(null);
  const [videos, setVideos] = useState<Record<string, Video[]>>({});
  const [editingCustomization, setEditingCustomization] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    companyDisplayName: '',
    companyEmail: '',
    companyPhone: '',
    licenseKey: '',
    expiresAt: '',
    maxUsers: 100,
  });

  // ライセンス一覧を取得
  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/licenses');
      const data = await response.json();

      if (response.ok) {
        setLicenses(data.licenses);
      } else {
        console.error('ライセンス取得エラー:', data.error);
        alert('ライセンスの取得に失敗しました');
      }
    } catch (error) {
      console.error('ライセンス取得エラー:', error);
      alert('ライセンスの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  // ライセンス作成
  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.companyName || !formData.companyDisplayName || !formData.licenseKey || !formData.expiresAt) {
      alert('必須項目を入力してください');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/admin/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('ライセンスを作成しました');
        setShowCreateForm(false);
        setFormData({
          companyName: '',
          companyDisplayName: '',
          companyEmail: '',
          companyPhone: '',
          licenseKey: '',
          expiresAt: '',
          maxUsers: 100,
        });
        fetchLicenses();
      } else {
        alert(data.error || 'ライセンスの作成に失敗しました');
      }
    } catch (error) {
      console.error('ライセンス作成エラー:', error);
      alert('ライセンスの作成に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  // ライセンス削除
  const handleDelete = async (id: string) => {
    if (!confirm('このライセンスを削除してもよろしいですか？企業情報も削除される可能性があります。')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/licenses/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        alert('ライセンスを削除しました');
        fetchLicenses();
      } else {
        alert(data.error || 'ライセンスの削除に失敗しました');
      }
    } catch (error) {
      console.error('ライセンス削除エラー:', error);
      alert('ライセンスの削除に失敗しました');
    }
  };

  // ライセンス有効/無効切り替え
  const toggleActive = async (license: License) => {
    try {
      const response = await fetch(`/api/admin/licenses/${license.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isActive: !license.is_active,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(license.is_active ? 'ライセンスを無効にしました' : 'ライセンスを有効にしました');
        fetchLicenses();
      } else {
        alert(data.error || 'ライセンスの更新に失敗しました');
      }
    } catch (error) {
      console.error('ライセンス更新エラー:', error);
      alert('ライセンスの更新に失敗しました');
    }
  };

  // ライセンス展開切り替え
  const toggleExpand = (licenseId: string) => {
    setExpandedLicenses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(licenseId)) {
        newSet.delete(licenseId);
      } else {
        newSet.add(licenseId);
        // 展開時に知識ベースファイル一覧と動画一覧を取得
        fetchKnowledgeFiles(licenseId);
        fetchVideos(licenseId);
      }
      return newSet;
    });
  };

  // 知識ベースファイル一覧取得
  const fetchKnowledgeFiles = async (licenseId: string) => {
    try {
      const response = await fetch(`/api/admin/licenses/${licenseId}/knowledge`);
      const data = await response.json();

      if (response.ok) {
        setKnowledgeFiles((prev) => ({ ...prev, [licenseId]: data.files }));
      } else {
        console.error('ファイル一覧取得エラー:', data.error);
      }
    } catch (error) {
      console.error('ファイル一覧取得エラー:', error);
    }
  };

  // 知識ベースファイルアップロード
  const handleFileUpload = async (licenseId: string, file: File) => {
    try {
      setUploadingFile(licenseId);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/admin/licenses/${licenseId}/knowledge/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert('ファイルをアップロードしました');
        fetchKnowledgeFiles(licenseId);
      } else {
        alert(data.error || 'ファイルのアップロードに失敗しました');
      }
    } catch (error) {
      console.error('ファイルアップロードエラー:', error);
      alert('ファイルのアップロードに失敗しました');
    } finally {
      setUploadingFile(null);
    }
  };

  // 知識ベースファイル削除
  const handleFileDelete = async (licenseId: string, fileId: string) => {
    if (!confirm('このファイルを削除してもよろしいですか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/licenses/${licenseId}/knowledge?fileId=${fileId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        alert('ファイルを削除しました');
        fetchKnowledgeFiles(licenseId);
      } else {
        alert(data.error || 'ファイルの削除に失敗しました');
      }
    } catch (error) {
      console.error('ファイル削除エラー:', error);
      alert('ファイルの削除に失敗しました');
    }
  };

  // コンパニオン画像アップロード
  const handleImageUpload = async (licenseId: string, file: File) => {
    try {
      setUploadingImage(licenseId);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/admin/licenses/${licenseId}/companion-image`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert('コンパニオン画像をアップロードしました');
        fetchLicenses();
      } else {
        alert(data.error || '画像のアップロードに失敗しました');
      }
    } catch (error) {
      console.error('画像アップロードエラー:', error);
      alert('画像のアップロードに失敗しました');
    } finally {
      setUploadingImage(null);
    }
  };

  // コンパニオン画像削除
  const handleImageDelete = async (licenseId: string) => {
    if (!confirm('このコンパニオン画像を削除してもよろしいですか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/licenses/${licenseId}/companion-image`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        alert('コンパニオン画像を削除しました');
        fetchLicenses();
      } else {
        alert(data.error || '画像の削除に失敗しました');
      }
    } catch (error) {
      console.error('画像削除エラー:', error);
      alert('画像の削除に失敗しました');
    }
  };

  // 音声設定更新
  const handleVoiceUpdate = async (licenseId: string, voiceId: string) => {
    try {
      const response = await fetch(`/api/admin/licenses/${licenseId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ voiceId }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('音声設定を更新しました');
        fetchLicenses();
      } else {
        alert(data.error || '音声設定の更新に失敗しました');
      }
    } catch (error) {
      console.error('音声設定更新エラー:', error);
      alert('音声設定の更新に失敗しました');
    }
  };

  // 動画一覧取得
  const fetchVideos = async (licenseId: string) => {
    try {
      const response = await fetch(`/api/admin/licenses/${licenseId}/videos`);
      const data = await response.json();

      if (response.ok) {
        setVideos(prev => ({ ...prev, [licenseId]: data.videos }));
      } else {
        console.error('動画取得エラー:', data.error);
      }
    } catch (error) {
      console.error('動画取得エラー:', error);
    }
  };

  // 動画追加（YouTube URL）
  const handleVideoAdd = async (licenseId: string, youtubeUrl: string, title: string, description?: string) => {
    try {
      setUploadingVideo(licenseId);

      const response = await fetch(`/api/admin/licenses/${licenseId}/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtube_url: youtubeUrl,
          title,
          description,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('YouTube動画を追加しました');
        fetchVideos(licenseId);
      } else {
        alert(data.error || 'YouTube動画の追加に失敗しました');
      }
    } catch (error) {
      console.error('YouTube動画追加エラー:', error);
      alert('YouTube動画の追加に失敗しました');
    } finally {
      setUploadingVideo(null);
    }
  };

  // 動画ファイルアップロード（Vercel Blob）
  const handleVideoFileUpload = async (licenseId: string, file: File, title: string, description?: string) => {
    try {
      setUploadingVideo(licenseId);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      if (description) {
        formData.append('description', description);
      }

      const response = await fetch(`/api/admin/licenses/${licenseId}/videos`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert('動画ファイルをアップロードしました');
        fetchVideos(licenseId);
      } else {
        alert(data.error || '動画ファイルのアップロードに失敗しました');
      }
    } catch (error) {
      console.error('動画ファイルアップロードエラー:', error);
      alert('動画ファイルのアップロードに失敗しました');
    } finally {
      setUploadingVideo(null);
    }
  };

  // 動画削除
  const handleVideoDelete = async (licenseId: string, videoId: string) => {
    if (!confirm('この動画を削除してもよろしいですか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/licenses/${licenseId}/videos/${videoId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        alert('動画を削除しました');
        fetchVideos(licenseId);
      } else {
        alert(data.error || '動画の削除に失敗しました');
      }
    } catch (error) {
      console.error('動画削除エラー:', error);
      alert('動画の削除に失敗しました');
    }
  };

  const handleCustomizationSave = async (licenseId: string, customization: LicenseCustomization) => {
    try {
      const response = await fetch(`/api/admin/licenses/${licenseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customization }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('カスタマイズを保存しました');
        setEditingCustomization(null);
        fetchLicenses();
      } else {
        alert(data.error || 'カスタマイズの保存に失敗しました');
      }
    } catch (error) {
      console.error('カスタマイズ保存エラー:', error);
      alert('カスタマイズの保存に失敗しました');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
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
          <h2 className="text-2xl font-bold">ライセンス管理</h2>
          <p className="text-sm text-white/60">登録済み: {licenses.length}件</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 bg-liberty-500 hover:bg-liberty-600"
        >
          <PlusIcon className="h-5 w-5" />
          新規ライセンス作成
        </Button>
      </div>

      {/* 作成フォーム */}
      {showCreateForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-liberty-400/30 bg-liberty-900/20 p-6"
        >
          <h3 className="mb-4 text-xl font-semibold">新規ライセンス作成</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-white/80">
                企業名（英数字） <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-white/20 bg-black/50 px-4 py-2 text-white focus:border-liberty-400 focus:outline-none"
                placeholder="sample-company"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/80">
                企業表示名 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-white/20 bg-black/50 px-4 py-2 text-white focus:border-liberty-400 focus:outline-none"
                placeholder="株式会社サンプル"
                value={formData.companyDisplayName}
                onChange={(e) => setFormData({ ...formData, companyDisplayName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/80">メールアドレス</label>
              <input
                type="email"
                className="w-full rounded-lg border border-white/20 bg-black/50 px-4 py-2 text-white focus:border-liberty-400 focus:outline-none"
                placeholder="info@sample.com"
                value={formData.companyEmail}
                onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/80">電話番号</label>
              <input
                type="tel"
                className="w-full rounded-lg border border-white/20 bg-black/50 px-4 py-2 text-white focus:border-liberty-400 focus:outline-none"
                placeholder="03-1234-5678"
                value={formData.companyPhone}
                onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/80">
                ライセンスキー <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                className="w-full rounded-lg border border-white/20 bg-black/50 px-4 py-2 text-white focus:border-liberty-400 focus:outline-none"
                placeholder="LIBERTY-COMPANY-2024-KEY"
                value={formData.licenseKey}
                onChange={(e) => setFormData({ ...formData, licenseKey: e.target.value.toUpperCase() })}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/80">
                有効期限 <span className="text-red-400">*</span>
              </label>
              <input
                type="datetime-local"
                className="w-full rounded-lg border border-white/20 bg-black/50 px-4 py-2 text-white focus:border-liberty-400 focus:outline-none"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm text-white/80">最大ユーザー数</label>
              <input
                type="number"
                className="w-full rounded-lg border border-white/20 bg-black/50 px-4 py-2 text-white focus:border-liberty-400 focus:outline-none"
                placeholder="100"
                value={formData.maxUsers}
                onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <Button type="submit" disabled={submitting} className="bg-liberty-500 hover:bg-liberty-600">
              {submitting ? '作成中...' : '作成'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCreateForm(false)}
              disabled={submitting}
            >
              キャンセル
            </Button>
          </div>
        </form>
      )}

      {/* ライセンス一覧 */}
      {licenses.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-8 text-center text-white/60">
          ライセンスが登録されていません
        </div>
      ) : (
        <div className="space-y-3">
          {licenses.map((license) => (
            <div
              key={license.id}
              className="rounded-2xl border border-white/10 bg-black/40 p-6 transition hover:border-white/20"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* ヘッダー */}
                  <div className="mb-4 flex items-center gap-3">
                    <h3 className="text-xl font-bold">{license.company.display_name}</h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        license.is_active && !isExpired(license.expires_at)
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {license.is_active && !isExpired(license.expires_at) ? '有効' : '無効'}
                    </span>
                  </div>

                  {/* ライセンス情報 */}
                  <div className="mb-4 grid gap-3 md:grid-cols-3">
                    <div>
                      <p className="text-xs text-white/60">ライセンスキー</p>
                      <p className="font-mono text-sm font-semibold text-liberty-300">
                        {license.license_key}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">有効期限</p>
                      <p
                        className={`text-sm font-semibold ${
                          isExpired(license.expires_at) ? 'text-red-400' : 'text-white'
                        }`}
                      >
                        {formatDate(license.expires_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/60">最大ユーザー数</p>
                      <p className="text-sm font-semibold">{license.max_users}人</p>
                    </div>
                  </div>

                  {/* 機能フラグ */}
                  <div>
                    <p className="mb-2 text-xs text-white/60">有効な機能</p>
                    <div className="flex flex-wrap gap-2">
                      {license.features.chat && (
                        <span className="rounded-full bg-liberty-500/20 px-3 py-1 text-xs text-liberty-300">
                          チャット
                        </span>
                      )}
                      {license.features.video && (
                        <span className="rounded-full bg-liberty-500/20 px-3 py-1 text-xs text-liberty-300">
                          動画
                        </span>
                      )}
                      {license.features.companion && (
                        <span className="rounded-full bg-liberty-500/20 px-3 py-1 text-xs text-liberty-300">
                          コンパニオン
                        </span>
                      )}
                      {license.features.exhibition && (
                        <span className="rounded-full bg-liberty-500/20 px-3 py-1 text-xs text-liberty-300">
                          展示会
                        </span>
                      )}
                      {license.features.tts && (
                        <span className="rounded-full bg-liberty-500/20 px-3 py-1 text-xs text-liberty-300">
                          音声出力
                        </span>
                      )}
                      {license.features.premium_voice && (
                        <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs text-amber-300">
                          プレミアム音声
                        </span>
                      )}
                      {license.features.stt && (
                        <span className="rounded-full bg-liberty-500/20 px-3 py-1 text-xs text-liberty-300">
                          音声入力
                        </span>
                      )}
                      {license.features.knowledge_upload && (
                        <span className="rounded-full bg-liberty-500/20 px-3 py-1 text-xs text-liberty-300">
                          知識アップロード
                        </span>
                      )}
                      {license.features.analytics && (
                        <span className="rounded-full bg-liberty-500/20 px-3 py-1 text-xs text-liberty-300">
                          統計分析
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Vector Store ID */}
                  {license.openai_vector_store_id && (
                    <div className="mt-4">
                      <p className="text-xs text-white/60">Vector Store ID</p>
                      <p className="font-mono text-xs text-white/80">{license.openai_vector_store_id}</p>
                    </div>
                  )}
                </div>

                {/* アクションボタン */}
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleExpand(license.id)}
                    className="rounded-lg bg-liberty-500/20 p-2 text-liberty-400 transition hover:bg-liberty-500/30"
                    title="詳細表示"
                  >
                    {expandedLicenses.has(license.id) ? (
                      <ChevronUpIcon className="h-5 w-5" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => setEditingCustomization(license.id)}
                    className="rounded-lg bg-purple-500/20 p-2 text-purple-400 transition hover:bg-purple-500/30"
                    title="カスタマイズ設定"
                  >
                    <PaintBrushIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => toggleActive(license)}
                    className={`rounded-lg p-2 transition ${
                      license.is_active
                        ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    }`}
                    title={license.is_active ? '無効化' : '有効化'}
                  >
                    {license.is_active ? (
                      <StopCircleIcon className="h-5 w-5" />
                    ) : (
                      <PlayCircleIcon className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(license.id)}
                    className="rounded-lg bg-red-500/20 p-2 text-red-400 transition hover:bg-red-500/30"
                    title="削除"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* 展開セクション：コンパニオン画像、動画、知識ベース */}
              {expandedLicenses.has(license.id) && (
                <div className="mt-6 space-y-6 border-t border-white/10 pt-6">
                  {/* コンパニオン画像管理 */}
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <PhotoIcon className="h-5 w-5 text-liberty-400" />
                      <h4 className="font-semibold">コンパニオン画像</h4>
                    </div>
                    <div className="space-y-3">
                      {license.companion_image_url ? (
                        <div className="flex items-center gap-4">
                          <img
                            src={license.companion_image_url}
                            alt="コンパニオン画像"
                            className="h-24 w-24 rounded-lg border border-white/20 object-cover"
                          />
                          <button
                            onClick={() => handleImageDelete(license.id)}
                            className="rounded-lg bg-red-500/20 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/30"
                          >
                            削除
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-white/60">画像が設定されていません</p>
                      )}
                      <div>
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 bg-black/30 px-4 py-2 text-sm transition hover:border-liberty-400">
                          <CloudArrowUpIcon className="h-5 w-5" />
                          {uploadingImage === license.id ? 'アップロード中...' : '画像をアップロード'}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(license.id, file);
                            }}
                            disabled={uploadingImage === license.id}
                          />
                        </label>
                        <p className="mt-1 text-xs text-white/40">対応形式: JPEG, PNG, WebP, GIF（最大5MB）</p>
                      </div>
                    </div>
                  </div>

                  {/* 音声設定 */}
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <SpeakerWaveIcon className="h-5 w-5 text-liberty-400" />
                      <h4 className="font-semibold">コンパニオン音声設定</h4>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-white/80">
                          音声タイプ
                        </label>
                        <select
                          value={license.voice_id || 'Bella'}
                          onChange={(e) => handleVoiceUpdate(license.id, e.target.value)}
                          className="w-full rounded-lg border border-white/20 bg-black/30 px-4 py-2 text-white transition hover:border-liberty-400 focus:border-liberty-400 focus:outline-none"
                        >
                          {AVAILABLE_VOICES.map((voice) => (
                            <option key={voice.id} value={voice.id}>
                              {voice.name} ({voice.gender}) - {voice.description}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs text-white/40">
                          コンパニオンの音声を9種類から選択できます
                        </p>
                      </div>
                      <div className="rounded-lg border border-liberty-400/40 bg-liberty-500/10 p-3">
                        <p className="text-sm text-white/70">
                          <span className="font-semibold text-liberty-300">現在の設定:</span>{' '}
                          {AVAILABLE_VOICES.find((v) => v.id === (license.voice_id || 'Bella'))?.name || 'Bella'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 動画管理 */}
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <FilmIcon className="h-5 w-5 text-liberty-400" />
                      <h4 className="font-semibold">動画管理</h4>
                    </div>
                    <div className="space-y-3">
                      {/* 動画一覧 */}
                      <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                        {videos[license.id] && videos[license.id].length > 0 ? (
                          <div className="space-y-2">
                            {videos[license.id].map((video) => (
                              <div
                                key={video.id}
                                className="flex items-center justify-between rounded border border-white/10 bg-black/30 p-3"
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{video.title}</p>
                                  <p className="text-xs text-white/60">
                                    {video.description || '説明なし'} • {video.video_type === 'youtube' ? 'YouTube' : 'ファイル'} • {video.license_id ? 'ライセンス専用' : '全体共有'}
                                  </p>
                                </div>
                                {video.license_id === license.id && (
                                  <button
                                    onClick={() => handleVideoDelete(license.id, video.id)}
                                    className="rounded bg-red-500/20 px-3 py-1 text-xs text-red-400 transition hover:bg-red-500/30"
                                  >
                                    削除
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-sm text-white/60">動画がアップロードされていません</p>
                        )}
                      </div>

                      {/* 動画追加オプション */}
                      <div className="space-y-2">
                        {/* YouTube動画追加 */}
                        <div>
                          <button
                            onClick={() => {
                              const youtubeUrl = prompt('YouTubeの動画URLを入力してください:\n例: https://www.youtube.com/watch?v=xxxxx');
                              if (youtubeUrl) {
                                const title = prompt('動画のタイトルを入力してください:');
                                if (title) {
                                  const description = prompt('動画の説明を入力してください（省略可）:');
                                  handleVideoAdd(license.id, youtubeUrl, title, description || undefined);
                                }
                              }
                            }}
                            disabled={uploadingVideo === license.id}
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-black/30 px-4 py-2 text-sm transition hover:border-liberty-400 disabled:opacity-50"
                          >
                            <FilmIcon className="h-5 w-5" />
                            {uploadingVideo === license.id ? '追加中...' : 'YouTube動画を追加'}
                          </button>
                          <p className="mt-1 text-xs text-white/40">公開可能な動画（容量制限なし・無料）</p>
                        </div>

                        {/* ファイルアップロード */}
                        <div>
                          <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-liberty-400/60 bg-liberty-500/10 px-4 py-2 text-sm transition hover:border-liberty-400 hover:bg-liberty-500/20 disabled:opacity-50">
                            <CloudArrowUpIcon className="h-5 w-5" />
                            {uploadingVideo === license.id ? 'アップロード中...' : 'プライベート動画をアップロード'}
                            <input
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  // ファイルサイズチェック
                                  const maxSize = 500 * 1024 * 1024; // 500MB
                                  if (file.size > maxSize) {
                                    alert('動画ファイルは500MB以下にしてください（Vercel Proプラン制限）');
                                    return;
                                  }
                                  const title = prompt('動画のタイトルを入力してください:');
                                  if (title) {
                                    const description = prompt('動画の説明を入力してください（省略可）:');
                                    await handleVideoFileUpload(license.id, file, title, description || undefined);
                                  }
                                }
                                e.target.value = '';
                              }}
                              disabled={uploadingVideo === license.id}
                            />
                          </label>
                          <p className="mt-1 text-xs text-white/40">
                            非公開動画・ツアー動画（最大500MB・Vercel Proプラン必須）
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 知識ベース管理 */}
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <DocumentIcon className="h-5 w-5 text-liberty-400" />
                      <h4 className="font-semibold">知識ベース</h4>
                    </div>
                    <div className="space-y-3">
                      {/* ファイル一覧 */}
                      <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                        {knowledgeFiles[license.id] && knowledgeFiles[license.id].length > 0 ? (
                          <div className="space-y-2">
                            {knowledgeFiles[license.id].map((file) => (
                              <div
                                key={file.id}
                                className="flex items-center justify-between rounded border border-white/10 bg-black/30 p-3"
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{file.filename}</p>
                                  <p className="text-xs text-white/60">
                                    {file.status} • {new Date(file.created_at * 1000).toLocaleDateString('ja-JP')}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleFileDelete(license.id, file.id)}
                                  className="rounded bg-red-500/20 px-3 py-1 text-xs text-red-400 transition hover:bg-red-500/30"
                                >
                                  削除
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-sm text-white/60">ファイルがアップロードされていません</p>
                        )}
                      </div>

                      {/* ファイルアップロード */}
                      <div>
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 bg-black/30 px-4 py-2 text-sm transition hover:border-liberty-400">
                          <CloudArrowUpIcon className="h-5 w-5" />
                          {uploadingFile === license.id ? 'アップロード中...' : 'ファイルをアップロード'}
                          <input
                            type="file"
                            accept=".pdf,.txt,.md,.doc,.docx,.csv,.json"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(license.id, file);
                            }}
                            disabled={uploadingFile === license.id}
                          />
                        </label>
                        <p className="mt-1 text-xs text-white/40">
                          対応形式: PDF, TXT, MD, DOC, DOCX, CSV, JSON（最大50MB）
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* カスタマイズエディター */}
      {editingCustomization && (
        <CustomizationEditor
          licenseId={editingCustomization}
          currentCustomization={
            licenses.find((l) => l.id === editingCustomization)?.customization || null
          }
          onSave={(customization) =>
            handleCustomizationSave(editingCustomization, customization)
          }
          onClose={() => setEditingCustomization(null)}
        />
      )}
    </div>
  );
}
