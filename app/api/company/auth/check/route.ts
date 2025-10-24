import { NextResponse } from 'next/server';
import { verifyLicense } from '@/lib/supabase/licenses';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const cookieStore = cookies();
    const licenseKey = cookieStore.get('company_license_key')?.value;

    if (!licenseKey) {
      return NextResponse.json({ authenticated: false });
    }

    // ライセンスを検証
    const licenseData = await verifyLicense(licenseKey);

    if (!licenseData) {
      // 無効なライセンスの場合、Cookieを削除
      cookieStore.delete('company_license_key');
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      company: {
        id: licenseData.company_id,
        name: licenseData.company.display_name,
        companionImageUrl: licenseData.company.companion_image_url,
        vectorStoreId: licenseData.company.openai_vector_store_id,
      },
    });
  } catch (error) {
    console.error('[Company Auth Check API] エラー:', error);
    return NextResponse.json({ authenticated: false });
  }
}
