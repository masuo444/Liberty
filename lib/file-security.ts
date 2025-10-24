/**
 * ファイルアップロードのセキュリティユーティリティ
 */

// MIME type と拡張子のマッピング
const MIME_TO_EXTENSION: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/csv': ['.csv'],
  'application/json': ['.json'],
};

/**
 * ファイル名をサニタイズしてパストラバーサルを防止
 */
export function sanitizeFilename(filename: string): string {
  // パストラバーサルパターンを削除
  let sanitized = filename.replace(/\.\./g, '');
  sanitized = sanitized.replace(/[\/\\]/g, '');

  // 制御文字を削除
  sanitized = sanitized.replace(/[\x00-\x1f\x80-\x9f]/g, '');

  // NULL バイトを削除
  sanitized = sanitized.replace(/\0/g, '');

  // 先頭と末尾の空白を削除
  sanitized = sanitized.trim();

  // 空の場合はデフォルト名を返す
  if (!sanitized) {
    return 'unnamed';
  }

  return sanitized;
}

/**
 * MIME type と拡張子の整合性をチェック
 */
export function validateMimeTypeAndExtension(
  filename: string,
  mimeType: string
): { valid: boolean; error?: string } {
  // 拡張子を取得（小文字に変換）
  const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();

  // MIME type が許可リストにあるか確認
  const allowedExtensions = MIME_TO_EXTENSION[mimeType];
  if (!allowedExtensions) {
    return {
      valid: false,
      error: `サポートされていないファイル形式です: ${mimeType}`,
    };
  }

  // 拡張子が MIME type と一致するか確認
  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `ファイル拡張子 (${extension}) と MIME type (${mimeType}) が一致しません`,
    };
  }

  return { valid: true };
}

/**
 * 画像ファイルの検証
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  // MIME type チェック
  if (!allowedImageTypes.includes(file.type)) {
    return {
      valid: false,
      error: '画像形式はJPEG、PNG、WebP、GIFのみ対応しています',
    };
  }

  // ファイル名のサニタイズ
  const sanitizedName = sanitizeFilename(file.name);
  if (!sanitizedName || sanitizedName === 'unnamed') {
    return {
      valid: false,
      error: '無効なファイル名です',
    };
  }

  // MIME type と拡張子の整合性チェック
  const mimeCheck = validateMimeTypeAndExtension(file.name, file.type);
  if (!mimeCheck.valid) {
    return mimeCheck;
  }

  return { valid: true };
}

/**
 * ドキュメントファイルの検証
 */
export function validateDocumentFile(file: File): { valid: boolean; error?: string } {
  const allowedDocTypes = [
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv',
    'application/json',
  ];

  // MIME type チェック
  if (!allowedDocTypes.includes(file.type)) {
    return {
      valid: false,
      error: '対応していないファイル形式です（対応: PDF, TXT, MD, DOC, DOCX, CSV, JSON）',
    };
  }

  // ファイル名のサニタイズ
  const sanitizedName = sanitizeFilename(file.name);
  if (!sanitizedName || sanitizedName === 'unnamed') {
    return {
      valid: false,
      error: '無効なファイル名です',
    };
  }

  // MIME type と拡張子の整合性チェック
  const mimeCheck = validateMimeTypeAndExtension(file.name, file.type);
  if (!mimeCheck.valid) {
    return mimeCheck;
  }

  return { valid: true };
}
