import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/client';
import { verifyLicense, saveVectorStoreId } from '@/lib/supabase/licenses';
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

export async function POST(request: NextRequest) {
  try {
    const licenseData = await authenticateCompany();

    if (!licenseData) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const companyId = licenseData.company_id;
    const companyName = licenseData.company.display_name;
    let vectorStoreId = licenseData.company.openai_vector_store_id;

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが指定されていません' },
        { status: 400 }
      );
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // ファイルをOpenAIにアップロード
    console.log('[Company Knowledge Upload] ファイルをOpenAIにアップロード中:', file.name);
    const uploadedFile = await openai.files.create({
      file: file,
      purpose: 'assistants',
    });

    console.log('[Company Knowledge Upload] アップロード完了:', uploadedFile.id);

    // Vector Storeが存在しない場合は作成
    if (!vectorStoreId) {
      console.log('[Company Knowledge Upload] Vector Store作成中...');
      const vectorStore = await openai.beta.vectorStores.create({
        name: `${companyName} Knowledge Base`,
        file_ids: [uploadedFile.id],
      });
      vectorStoreId = vectorStore.id;

      // Vector Store IDをデータベースに保存
      await saveVectorStoreId(companyId, vectorStoreId);
      console.log('[Company Knowledge Upload] Vector Store作成完了:', vectorStoreId);
    } else {
      // 既存のVector Storeにファイルを追加
      console.log('[Company Knowledge Upload] Vector Storeにファイル追加中...');
      await openai.beta.vectorStores.files.create(vectorStoreId, {
        file_id: uploadedFile.id,
      });
      console.log('[Company Knowledge Upload] ファイル追加完了');
    }

    return NextResponse.json({
      success: true,
      fileId: uploadedFile.id,
      vectorStoreId,
      message: 'ファイルをアップロードしました',
    });
  } catch (error) {
    console.error('[Company Knowledge Upload] エラー:', error);
    const errorMessage = error instanceof Error ? error.message : 'ファイルのアップロードに失敗しました';
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    );
  }
}
