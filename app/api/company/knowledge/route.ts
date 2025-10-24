import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/client';
import { verifyLicense } from '@/lib/supabase/licenses';
import { cookies } from 'next/headers';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// 企業認証ヘルパー
async function authenticateCompany() {
  const cookieStore = cookies();
  const licenseKey = cookieStore.get('company_license_key')?.value;

  if (!licenseKey) {
    return null;
  }

  const licenseData = await verifyLicense(licenseKey);
  return licenseData;
}

// ファイル一覧取得
export async function GET() {
  try {
    const licenseData = await authenticateCompany();

    if (!licenseData) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const companyId = licenseData.company_id;
    const vectorStoreId = licenseData.company.openai_vector_store_id;

    if (!vectorStoreId) {
      return NextResponse.json({ files: [] });
    }

    // OpenAI APIでファイル一覧を取得
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const vectorStoreFiles = await openai.beta.vectorStores.files.list(vectorStoreId);

    const files = await Promise.all(
      vectorStoreFiles.data.map(async (file) => {
        const fileDetails = await openai.files.retrieve(file.id);
        return {
          id: file.id,
          filename: fileDetails.filename,
          status: file.status,
          created_at: fileDetails.created_at,
        };
      })
    );

    return NextResponse.json({ files });
  } catch (error) {
    console.error('[Company Knowledge API] GET エラー:', error);
    return NextResponse.json(
      { error: 'ファイル一覧の取得に失敗しました', details: String(error) },
      { status: 500 }
    );
  }
}

// ファイル削除
export async function DELETE(request: NextRequest) {
  try {
    const licenseData = await authenticateCompany();

    if (!licenseData) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json(
        { error: 'ファイルIDが必要です' },
        { status: 400 }
      );
    }

    const vectorStoreId = licenseData.company.openai_vector_store_id;

    if (!vectorStoreId) {
      return NextResponse.json(
        { error: 'Vector Storeが見つかりません' },
        { status: 404 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Vector StoreからファイルIDを削除
    await openai.beta.vectorStores.files.del(vectorStoreId, fileId);

    // OpenAI Filesからも削除
    await openai.files.del(fileId);

    console.log('[Company Knowledge API] ファイル削除成功:', fileId);
    return NextResponse.json({
      success: true,
      message: 'ファイルを削除しました',
    });
  } catch (error) {
    console.error('[Company Knowledge API] DELETE エラー:', error);
    return NextResponse.json(
      { error: 'ファイルの削除に失敗しました', details: String(error) },
      { status: 500 }
    );
  }
}
