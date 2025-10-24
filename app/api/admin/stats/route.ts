import { checkAdminAuth } from '@/lib/auth';
import { getSupabaseAdminClient } from '@/lib/supabase/client';
import { NextResponse } from 'next/server';

// @ts-nocheck

// 利用統計を取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    const supabase = getSupabaseAdminClient();

    // 期間を計算
    const now = new Date();
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // 利用ログを取得（最新100件）
    const { data: logs, error: logsError } = await supabase
      .from('usage_logs')
      .select(`
        *,
        license:licenses(
          license_key,
          company:companies(display_name)
        )
      `)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    if (logsError) {
      console.error('利用ログ取得エラー:', logsError);
      return NextResponse.json(
        { error: '利用ログの取得に失敗しました' },
        { status: 500 }
      );
    }

    // 統計を計算
    const totalUsers = new Set((logs as any[]).map((log: any) => log.license_id)).size;
    const activeUsers = new Set(
      (logs as any[])
        .filter((log: any) => {
          const logDate = new Date(log.created_at);
          const daysSinceLog = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceLog <= 7;
        })
        .map((log: any) => log.license_id)
    ).size;

    const totalChats = (logs as any[]).filter((log: any) => log.event_type === 'chat').length;
    const totalVideos = (logs as any[]).filter((log: any) => log.event_type === 'video_play').length;
    const totalFiles = (logs as any[]).filter((log: any) => log.event_type === 'knowledge_upload').length;

    // 最近のログを整形
    const recentLogs = (logs as any[]).slice(0, 20).map((log: any) => ({
      id: log.id,
      licenseKey: log.license?.license_key || 'Unknown',
      companyName: log.license?.company?.display_name || 'Unknown',
      eventType: log.event_type,
      eventData: log.event_data,
      timestamp: log.created_at,
      userLanguage: log.user_language || 'unknown',
      ipAddress: log.ip_address || 'Unknown',
    }));

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        totalChats,
        totalVideos,
        totalFiles,
        recentLogs,
      },
    });
  } catch (error) {
    console.error('統計取得エラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}
