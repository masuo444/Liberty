import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  try {
    const cookieStore = cookies();
    cookieStore.delete('company_license_key');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Company Logout API] エラー:', error);
    return NextResponse.json(
      { error: 'ログアウトに失敗しました' },
      { status: 500 }
    );
  }
}
