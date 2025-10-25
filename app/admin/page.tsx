'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LicenseManager } from '@/components/admin/LicenseManager';
import { UsageStats } from '@/components/admin/UsageStats';
import { CompanyManager } from '@/components/admin/CompanyManager';
import { Button } from '@/components/ui/Button';
import {
  ChartBarIcon,
  BuildingOfficeIcon,
  ArrowLeftIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

type TabType = 'management' | 'stats';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('management');
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  // 認証チェック
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth/check');
        const data = await response.json();

        if (data.authenticated) {
          setAuthenticated(true);
        } else {
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('認証チェックエラー:', error);
        router.push('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // ログアウト
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('ログアウトエラー:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-black via-liberty-900 to-black">
        <div className="text-white/60">読み込み中...</div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-liberty-900 to-black p-6 text-white">
      {/* ヘッダー */}
      <header className="mb-8 rounded-3xl border border-white/10 bg-white/5 px-6 py-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">FOMUS Liberty Platform</p>
            <h1 className="text-2xl font-bold">管理者ダッシュボード</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/admin/videos">
              <Button variant="ghost" className="flex items-center gap-2">
                動画管理
              </Button>
            </Link>
            <Link href="/admin/knowledge">
              <Button variant="ghost" className="flex items-center gap-2">
                知識ベース管理
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="flex items-center gap-2">
                <ArrowLeftIcon className="h-5 w-5" />
                アプリに戻る
              </Button>
            </Link>
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

      {/* タブナビゲーション */}
      <div className="mb-6 flex gap-3">
        <button
          onClick={() => setActiveTab('management')}
          className={`flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all ${
            activeTab === 'management'
              ? 'bg-liberty-500 text-white shadow-lg shadow-liberty-500/30'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          <BuildingOfficeIcon className="h-5 w-5" />
          ライセンス・企業管理
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all ${
            activeTab === 'stats'
              ? 'bg-liberty-500 text-white shadow-lg shadow-liberty-500/30'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          <ChartBarIcon className="h-5 w-5" />
          利用統計
        </button>
      </div>

      {/* コンテンツエリア */}
      <main>
        {activeTab === 'management' && (
          <div className="space-y-8">
            <LicenseManager />
            <CompanyManager />
          </div>
        )}
        {activeTab === 'stats' && <UsageStats />}
      </main>
    </div>
  );
}
