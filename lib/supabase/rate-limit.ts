// @ts-nocheck
import { getSupabaseAdminClient } from './client';

export interface RateLimitStatus {
  allowed: boolean;
  limitExceeded: boolean;
  currentUsage: number;
  limit: number;
  resetDate: Date;
}

/**
 * チャット機能のRate Limitチェック
 */
export async function checkChatRateLimit(companyId: string): Promise<RateLimitStatus> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('company_usage_status')
    .select('*')
    .eq('company_id', companyId)
    .single();

  if (error || !data) {
    console.error('Rate Limit取得エラー:', error);
    // エラー時はデフォルトで許可（フェイルオープン）
    return {
      allowed: true,
      limitExceeded: false,
      currentUsage: 0,
      limit: 1000,
      resetDate: getNextMonthStart(),
    };
  }

  return {
    allowed: !data.chat_limit_exceeded,
    limitExceeded: data.chat_limit_exceeded,
    currentUsage: data.current_chat_usage,
    limit: data.monthly_chat_limit,
    resetDate: getNextMonthStart(),
  };
}

/**
 * 動画再生のRate Limitチェック
 */
export async function checkVideoRateLimit(companyId: string): Promise<RateLimitStatus> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('company_usage_status')
    .select('*')
    .eq('company_id', companyId)
    .single();

  if (error || !data) {
    console.error('Rate Limit取得エラー:', error);
    return {
      allowed: true,
      limitExceeded: false,
      currentUsage: 0,
      limit: 500,
      resetDate: getNextMonthStart(),
    };
  }

  return {
    allowed: !data.video_limit_exceeded,
    limitExceeded: data.video_limit_exceeded,
    currentUsage: data.current_video_usage,
    limit: data.monthly_video_limit,
    resetDate: getNextMonthStart(),
  };
}

/**
 * 知識アップロードのRate Limitチェック
 */
export async function checkKnowledgeUploadRateLimit(
  companyId: string
): Promise<RateLimitStatus> {
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from('company_usage_status')
    .select('*')
    .eq('company_id', companyId)
    .single();

  if (error || !data) {
    console.error('Rate Limit取得エラー:', error);
    return {
      allowed: true,
      limitExceeded: false,
      currentUsage: 0,
      limit: 100,
      resetDate: getNextMonthStart(),
    };
  }

  return {
    allowed: !data.knowledge_upload_limit_exceeded,
    limitExceeded: data.knowledge_upload_limit_exceeded,
    currentUsage: data.current_knowledge_upload_usage,
    limit: data.monthly_knowledge_upload_limit,
    resetDate: getNextMonthStart(),
  };
}

/**
 * 企業のRate Limit設定を更新
 */
export async function updateCompanyRateLimits(
  companyId: string,
  limits: {
    monthlyChatLimit?: number;
    monthlyVideoLimit?: number;
    monthlyKnowledgeUploadLimit?: number;
  }
) {
  const supabase = getSupabaseAdminClient();

  const updateData: any = {};
  if (limits.monthlyChatLimit !== undefined) {
    updateData.monthly_chat_limit = limits.monthlyChatLimit;
  }
  if (limits.monthlyVideoLimit !== undefined) {
    updateData.monthly_video_limit = limits.monthlyVideoLimit;
  }
  if (limits.monthlyKnowledgeUploadLimit !== undefined) {
    updateData.monthly_knowledge_upload_limit = limits.monthlyKnowledgeUploadLimit;
  }

  const { error } = await supabase
    .from('companies')
    .update(updateData)
    .eq('id', companyId);

  if (error) {
    console.error('Rate Limit更新エラー:', error);
    throw new Error('Rate Limitの更新に失敗しました');
  }
}

/**
 * 次の月初を取得
 */
function getNextMonthStart(): Date {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth;
}

/**
 * エラーログを記録
 */
export async function logError(errorData: {
  licenseId?: string;
  errorType: string;
  errorMessage: string;
  errorData?: any;
  requestPath?: string;
  userAgent?: string;
  ipAddress?: string;
}) {
  try {
    const supabase = getSupabaseAdminClient();

    await supabase.from('error_logs').insert({
      license_id: errorData.licenseId || null,
      error_type: errorData.errorType,
      error_message: errorData.errorMessage,
      error_data: errorData.errorData || null,
      request_path: errorData.requestPath || null,
      user_agent: errorData.userAgent || null,
      ip_address: errorData.ipAddress || null,
    });
  } catch (error) {
    // エラーログの記録自体が失敗してもアプリを停止させない
    console.error('エラーログ記録失敗:', error);
  }
}
