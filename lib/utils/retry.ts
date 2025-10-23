/**
 * 非同期関数を自動再試行するユーティリティ
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    onRetry?: (error: Error, attempt: number) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    onRetry,
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // 最後の試行の場合はエラーを投げる
      if (attempt === maxRetries) {
        throw lastError;
      }

      // リトライコールバック
      if (onRetry) {
        onRetry(lastError, attempt + 1);
      }

      // 待機
      await new Promise((resolve) => setTimeout(resolve, delay));

      // 次の遅延時間を計算（指数バックオフ）
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  throw lastError!;
}

/**
 * ネットワークエラーかどうかを判定
 */
export function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const networkErrorMessages = [
    'network',
    'fetch',
    'timeout',
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
  ];

  return networkErrorMessages.some((msg) =>
    error.message.toLowerCase().includes(msg.toLowerCase())
  );
}

/**
 * OpenAI APIエラーかどうかを判定
 */
export function isOpenAIError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;

  const openaiErrorMessages = [
    'openai',
    'rate_limit',
    'insufficient_quota',
    'invalid_api_key',
  ];

  return openaiErrorMessages.some((msg) =>
    error.message.toLowerCase().includes(msg.toLowerCase())
  );
}

/**
 * リトライ可能なエラーかどうかを判定
 */
export function isRetryableError(error: unknown): boolean {
  return isNetworkError(error);
}
