import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * 管理者認証チェック
 * セッションCookieをチェックし、認証されていない場合は401エラーを返す
 */
export async function checkAdminAuth(): Promise<NextResponse | null> {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get('admin_session');

    if (session?.value !== 'authenticated') {
      return NextResponse.json(
        { error: '認証が必要です。管理者ログインしてください。' },
        { status: 401 }
      );
    }

    // 認証成功の場合はnullを返す（エラーなし）
    return null;
  } catch (error) {
    console.error('認証チェックエラー:', error);
    return NextResponse.json(
      { error: '認証チェック中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * 企業認証チェック
 * セッションCookieをチェックし、認証されていない場合は401エラーを返す
 */
export async function checkCompanyAuth(): Promise<NextResponse | null> {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get('company_session');

    if (!session?.value) {
      return NextResponse.json(
        { error: '認証が必要です。企業ログインしてください。' },
        { status: 401 }
      );
    }

    // 認証成功の場合はnullを返す（エラーなし）
    return null;
  } catch (error) {
    console.error('認証チェックエラー:', error);
    return NextResponse.json(
      { error: '認証チェック中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * 企業IDを取得
 * セッションCookieから企業IDを取得
 */
export async function getCompanyIdFromSession(): Promise<string | null> {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get('company_session');
    return session?.value || null;
  } catch (error) {
    console.error('企業ID取得エラー:', error);
    return null;
  }
}
