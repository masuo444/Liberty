'use client';

import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  UserIcon,
  ChatBubbleLeftIcon,
  VideoCameraIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalChats: number;
  totalVideos: number;
  totalFiles: number;
  recentLogs: {
    id: string;
    licenseKey: string;
    companyName: string;
    eventType: string;
    eventData: any;
    timestamp: string;
    userLanguage: string;
    ipAddress: string;
  }[];
}

export function UsageStats() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    totalChats: 0,
    totalVideos: 0,
    totalFiles: 0,
    recentLogs: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  // 統計データを取得
  const fetchStats = async (period: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/stats?period=${period}`);
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
      } else {
        console.error('統計取得エラー:', data.error);
        alert('統計の取得に失敗しました');
      }
    } catch (error) {
      console.error('統計取得エラー:', error);
      alert('統計の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(selectedPeriod);
  }, [selectedPeriod]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventTypeLabel = (eventType: string) => {
    const labels: Record<string, string> = {
      login: 'ログイン',
      logout: 'ログアウト',
      chat: 'チャット',
      video_play: '動画再生',
      companion_use: 'コンパニオン',
      knowledge_upload: 'ファイルアップロード',
    };
    return labels[eventType] || eventType;
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'login':
      case 'logout':
        return <UserIcon className="h-5 w-5" />;
      case 'chat':
        return <ChatBubbleLeftIcon className="h-5 w-5" />;
      case 'video_play':
        return <VideoCameraIcon className="h-5 w-5" />;
      case 'knowledge_upload':
        return <DocumentTextIcon className="h-5 w-5" />;
      default:
        return <ChartBarIcon className="h-5 w-5" />;
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
          <h2 className="text-2xl font-bold">利用統計</h2>
          <p className="text-sm text-white/60">
            過去
            {selectedPeriod === '7d' ? '7' : selectedPeriod === '30d' ? '30' : '90'}
            日間のデータ
          </p>
        </div>
        <div className="flex gap-2 rounded-lg border border-white/20 bg-white/5 p-1">
          <button
            onClick={() => setSelectedPeriod('7d')}
            className={`rounded px-4 py-2 text-xs font-medium transition-all ${
              selectedPeriod === '7d'
                ? 'bg-liberty-500 text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            7日間
          </button>
          <button
            onClick={() => setSelectedPeriod('30d')}
            className={`rounded px-4 py-2 text-xs font-medium transition-all ${
              selectedPeriod === '30d'
                ? 'bg-liberty-500 text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            30日間
          </button>
          <button
            onClick={() => setSelectedPeriod('90d')}
            className={`rounded px-4 py-2 text-xs font-medium transition-all ${
              selectedPeriod === '90d'
                ? 'bg-liberty-500 text-white'
                : 'text-white/60 hover:text-white'
            }`}
          >
            90日間
          </button>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-liberty-900/40 to-black/40 p-6">
          <div className="mb-2 flex items-center gap-2 text-white/60">
            <UserIcon className="h-5 w-5" />
            <span className="text-sm">総ユーザー数</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-green-900/40 to-black/40 p-6">
          <div className="mb-2 flex items-center gap-2 text-white/60">
            <UserIcon className="h-5 w-5" />
            <span className="text-sm">アクティブユーザー</span>
          </div>
          <p className="text-3xl font-bold text-green-400">{stats.activeUsers}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-900/40 to-black/40 p-6">
          <div className="mb-2 flex items-center gap-2 text-white/60">
            <ChatBubbleLeftIcon className="h-5 w-5" />
            <span className="text-sm">チャット回数</span>
          </div>
          <p className="text-3xl font-bold text-blue-400">{stats.totalChats}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-900/40 to-black/40 p-6">
          <div className="mb-2 flex items-center gap-2 text-white/60">
            <VideoCameraIcon className="h-5 w-5" />
            <span className="text-sm">動画再生回数</span>
          </div>
          <p className="text-3xl font-bold text-purple-400">{stats.totalVideos}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-amber-900/40 to-black/40 p-6">
          <div className="mb-2 flex items-center gap-2 text-white/60">
            <DocumentTextIcon className="h-5 w-5" />
            <span className="text-sm">アップロードファイル</span>
          </div>
          <p className="text-3xl font-bold text-amber-400">{stats.totalFiles}</p>
        </div>
      </div>

      {/* アクティビティログ */}
      <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
        <h3 className="mb-4 text-xl font-semibold">最近のアクティビティ</h3>
        {stats.recentLogs.length === 0 ? (
          <div className="py-8 text-center text-white/60">
            まだアクティビティがありません
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
              >
                {/* イベントアイコン */}
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-liberty-500/20 text-liberty-300">
                  {getEventIcon(log.eventType)}
                </div>

                {/* 情報 */}
                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="font-semibold">{log.companyName}</span>
                    <span className="text-xs text-white/60">•</span>
                    <span className="rounded-full bg-liberty-500/20 px-2 py-0.5 text-xs text-liberty-300">
                      {getEventTypeLabel(log.eventType)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <span>ライセンス: {log.licenseKey}</span>
                    <span>•</span>
                    <span>言語: {log.userLanguage.toUpperCase()}</span>
                    <span>•</span>
                    <span>IP: {log.ipAddress}</span>
                  </div>
                </div>

                {/* タイムスタンプ */}
                <div className="flex-shrink-0 text-right text-xs text-white/60">
                  {formatTimestamp(log.timestamp)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
