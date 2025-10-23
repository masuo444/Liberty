// @ts-nocheck
import { getSupabaseAdminClient } from './client';
import type { License, LicenseWithCompany, UsageLogInsert } from './types';

/**
 * ライセンスキーを検証して、ライセンス情報を取得
 */
export async function verifyLicense(licenseKey: string): Promise<LicenseWithCompany | null> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('licenses')
    .select(`
      *,
      company:companies(*)
    `)
    .eq('license_key', licenseKey)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    console.error('ライセンス検証エラー:', error);
    return null;
  }

  // 有効期限チェック
  const now = new Date();
  const expiresAt = new Date(data.expires_at);

  if (expiresAt < now) {
    console.error('ライセンスが期限切れです:', licenseKey);
    return null;
  }

  return data as LicenseWithCompany;
}

/**
 * すべてのライセンスを取得（管理画面用）
 */
export async function getAllLicenses(): Promise<LicenseWithCompany[]> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('licenses')
    .select(`
      *,
      company:companies(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('ライセンス取得エラー:', error);
    return [];
  }

  return (data || []) as LicenseWithCompany[];
}

/**
 * ライセンスを作成
 */
export async function createLicense(
  companyId: string,
  licenseKey: string,
  expiresAt: string,
  options?: {
    maxUsers?: number;
    features?: Partial<License['features']>;
  }
) {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('licenses')
    .insert({
      company_id: companyId,
      license_key: licenseKey,
      expires_at: expiresAt,
      max_users: options?.maxUsers || 100,
      features: options?.features || {
        chat: true,
        video: true,
        companion: true,
        exhibition: true,
        tts: true,
        stt: true,
        knowledge_upload: true,
        analytics: true,
      },
    })
    .select()
    .single();

  if (error) {
    console.error('ライセンス作成エラー:', error);
    throw new Error('ライセンスの作成に失敗しました');
  }

  return data as License;
}

/**
 * ライセンスを更新
 */
export async function updateLicense(
  licenseId: string,
  updates: {
    expiresAt?: string;
    isActive?: boolean;
    maxUsers?: number;
    features?: Partial<License['features']>;
  }
) {
  const supabase = getSupabaseAdminClient();

  const updateData: any = {};
  if (updates.expiresAt) updateData.expires_at = updates.expiresAt;
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
  if (updates.maxUsers) updateData.max_users = updates.maxUsers;
  if (updates.features) updateData.features = updates.features;

  const { data, error } = await supabase
    .from('licenses')
    .update(updateData)
    .eq('id', licenseId)
    .select()
    .single();

  if (error) {
    console.error('ライセンス更新エラー:', error);
    throw new Error('ライセンスの更新に失敗しました');
  }

  return data as License;
}

/**
 * ライセンスを削除（論理削除）
 */
export async function deleteLicense(licenseId: string) {
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from('licenses')
    .update({ is_active: false })
    .eq('id', licenseId);

  if (error) {
    console.error('ライセンス削除エラー:', error);
    throw new Error('ライセンスの削除に失敗しました');
  }
}

/**
 * 利用ログを記録
 */
export async function logUsage(log: UsageLogInsert) {
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase.from('usage_logs').insert(log);

  if (error) {
    console.error('利用ログ記録エラー:', error);
  }
}

/**
 * 利用統計を取得
 */
export async function getUsageStats(licenseId: string, days: number = 30) {
  const supabase = getSupabaseAdminClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('usage_logs')
    .select('*')
    .eq('license_id', licenseId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('利用統計取得エラー:', error);
    return [];
  }

  return data || [];
}

/**
 * ライセンスIDでVector Store IDを取得
 */
export async function getVectorStoreId(licenseId: string): Promise<string | null> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('licenses')
    .select(`
      company:companies(openai_vector_store_id)
    `)
    .eq('id', licenseId)
    .single();

  if (error || !data) {
    console.error('Vector Store ID取得エラー:', error);
    return null;
  }

  return (data.company as any)?.openai_vector_store_id || null;
}

/**
 * Vector Store IDを企業に紐づけて保存
 */
export async function saveVectorStoreId(companyId: string, vectorStoreId: string) {
  const supabase = getSupabaseAdminClient();

  const { error } = await supabase
    .from('companies')
    .update({ openai_vector_store_id: vectorStoreId })
    .eq('id', companyId);

  if (error) {
    console.error('Vector Store ID保存エラー:', error);
    throw new Error('Vector Store IDの保存に失敗しました');
  }
}
