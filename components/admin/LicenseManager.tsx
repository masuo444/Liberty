'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, StopCircleIcon, PlayCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';

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
  created_at: string;
  company: {
    id: string;
    name: string;
    display_name: string;
    email: string | null;
    phone: string | null;
  };
}

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
                </div>

                {/* アクションボタン */}
                <div className="flex gap-2">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
