import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get('admin_session');

    if (session?.value === 'authenticated') {
      return NextResponse.json({ authenticated: true });
    }

    return NextResponse.json({ authenticated: false });
  } catch (error) {
    console.error('認証チェックエラー:', error);
    return NextResponse.json({ authenticated: false });
  }
}
