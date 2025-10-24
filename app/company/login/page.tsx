'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { KeyIcon } from '@heroicons/react/24/outline';

export default function CompanyLoginPage() {
  const router = useRouter();
  const [licenseKey, setLicenseKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/company/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: licenseKey.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        // ログイン成功、ダッシュボードにリダイレクト
        router.push('/company/dashboard');
      } else {
        setError(data.error || 'ログインに失敗しました');
      }
    } catch (error) {
      console.error('ログインエラー:', error);
      setError('ログインに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-liberty-900 to-black p-6">
      <div className="w-full max-w-md">
        {/* ロゴ/タイトル */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-block rounded-full bg-liberty-500/20 p-4">
            <KeyIcon className="h-12 w-12 text-liberty-400" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white">企業ダッシュボード</h1>
          <p className="text-white/60">ライセンスキーでログインしてください</p>
        </div>

        {/* ログインフォーム */}
        <form onSubmit={handleLogin} className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
          <div>
            <label htmlFor="licenseKey" className="mb-2 block text-sm font-semibold text-white">
              ライセンスキー
            </label>
            <input
              id="licenseKey"
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="xxxx-xxxx-xxxx-xxxx"
              className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:border-liberty-400 focus:outline-none focus:ring-2 focus:ring-liberty-400/50"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !licenseKey.trim()}
            className="w-full bg-liberty-500 hover:bg-liberty-600"
          >
            {loading ? 'ログイン中...' : 'ログイン'}
          </Button>
        </form>

        {/* フッター */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm text-white/60 hover:text-white/80"
          >
            ← アプリに戻る
          </a>
        </div>
      </div>
    </div>
  );
}
