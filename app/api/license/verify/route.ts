import { NextResponse } from 'next/server';
import type { LicenseResponse } from '@/lib/types';
import { verifyLicense, logUsage } from '@/lib/supabase/licenses';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { key } = await request.json();

    if (typeof key !== 'string') {
      return NextResponse.json<LicenseResponse>(
        { ok: false, message: 'ライセンスキーが不正です。' },
        { status: 400 },
      );
    }

    const normalizedKey = key.trim();

    // Supabaseでライセンス検証
    const licenseData = await verifyLicense(normalizedKey);

    if (!licenseData) {
      return NextResponse.json<LicenseResponse>(
        { ok: false, message: '無効なライセンスキーまたは期限切れです。' },
        { status: 404 }
      );
    }

    // 利用ログを記録
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || undefined;
    const acceptLanguage = headersList.get('accept-language') || undefined;
    const language = acceptLanguage?.split(',')[0]?.split('-')[0] || undefined;

    // IPアドレスの取得（Vercelの場合）
    const ipAddress = headersList.get('x-forwarded-for') ||
                      headersList.get('x-real-ip') ||
                      undefined;

    await logUsage({
      license_id: licenseData.id,
      event_type: 'login',
      event_data: {
        license_key: normalizedKey,
        company_name: licenseData.company.display_name,
      },
      user_language: language,
      user_agent: userAgent,
      ip_address: ipAddress,
    });

    // レスポンス形式を既存の型に合わせる
    return NextResponse.json<LicenseResponse>({
      ok: true,
      license: {
        licenseKey: licenseData.license_key,
        features: licenseData.features,
        expiresAt: licenseData.expires_at,
        companyId: licenseData.company_id,
        companyName: licenseData.company.display_name,
        companionImageUrl: licenseData.company.companion_image_url || undefined,
        maxUsers: licenseData.max_users,
        customization: licenseData.customization || null,
      },
    });
  } catch (error) {
    console.error('ライセンス検証エラー:', error);
    return NextResponse.json<LicenseResponse>(
      { ok: false, message: 'サーバーエラーが発生しました。' },
      { status: 500 }
    );
  }
}
