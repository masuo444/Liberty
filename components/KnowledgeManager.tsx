'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowUpTrayIcon, DocumentIcon, CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline';

interface KnowledgeFile {
  id: string;
  status: string;
  createdAt: number;
  filename?: string;
}

export function KnowledgeManager() {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初回ロード時にファイル一覧を取得
  useEffect(() => {
    loadFiles();
  }, []);

  const uploadFile = async (file: File) => {
    const fileId = `${file.name}-${Date.now()}`;

    try {
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/knowledge/ingest', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'アップロードに失敗しました');
      }

      setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));

      // プログレス表示を少し残してから削除
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      }, 1000);

      return true;
    } catch (err) {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileId];
        return newProgress;
      });
      throw err;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    await handleFiles(selectedFiles);

    // ファイル入力をリセット
    event.target.value = '';
  };

  const handleFiles = async (selectedFiles: File[]) => {
    setUploading(true);
    setError(null);
    setUploadSuccess(false);

    let successCount = 0;
    let errorCount = 0;

    for (const file of selectedFiles) {
      try {
        await uploadFile(file);
        successCount++;
      } catch (err) {
        errorCount++;
        console.error(`${file.name} のアップロードに失敗:`, err);
      }
    }

    setUploading(false);

    if (successCount > 0) {
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
      await loadFiles();
    }

    if (errorCount > 0) {
      setError(`${errorCount}個のファイルのアップロードに失敗しました`);
    }
  };

  const loadFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/knowledge/list');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'ファイル一覧の取得に失敗しました');
      }

      const data = await response.json();
      console.log('ファイル一覧取得成功:', data);
      setFiles(data.files || []);
    } catch (err) {
      console.error('ファイル一覧取得エラー:', err);
      setError(err instanceof Error ? err.message : 'ファイル一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm('このファイルを削除してもよろしいですか？')) return;

    try {
      const response = await fetch('/api/knowledge/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '削除に失敗しました');
      }

      // ファイル一覧を再読み込み
      await loadFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ファイルの削除に失敗しました');
    }
  };

  // ドラッグ&ドロップ
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      await handleFiles(droppedFiles);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-gray-900 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6">📚 知識Box管理</h2>

      {/* ファイルアップロード */}
      <div className="mb-8">
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            flex flex-col items-center justify-center w-full h-48
            border-2 border-dashed rounded-lg cursor-pointer
            transition-all duration-200
            ${isDragging ? 'border-blue-500 bg-blue-500/20 scale-105' : ''}
            ${
              uploading
                ? 'border-yellow-500 bg-yellow-500/10'
                : !isDragging && 'border-gray-600 hover:border-blue-500 bg-gray-800/50 hover:bg-gray-800'
            }
          `}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-4"></div>
                <p className="text-sm text-yellow-400">アップロード中...</p>
                {Object.keys(uploadProgress).length > 0 && (
                  <p className="text-xs text-yellow-300 mt-2">
                    {Object.keys(uploadProgress).length} ファイル処理中
                  </p>
                )}
              </>
            ) : uploadSuccess ? (
              <>
                <CheckCircleIcon className="w-12 h-12 text-green-500 mb-4" />
                <p className="text-sm text-green-400">アップロード完了！</p>
              </>
            ) : isDragging ? (
              <>
                <ArrowUpTrayIcon className="w-12 h-12 text-blue-400 mb-4" />
                <p className="text-sm text-blue-300 font-semibold">ここにドロップ</p>
              </>
            ) : (
              <>
                <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mb-4" />
                <p className="mb-2 text-sm text-gray-300">
                  <span className="font-semibold">クリックまたはドラッグ&ドロップでファイルを追加</span>
                </p>
                <p className="text-xs text-gray-400">PDF, TXT, MD, JSON (最大10MB)</p>
                <p className="text-xs text-gray-500 mt-1">複数ファイルを同時にアップロード可能</p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.txt,.md,.json"
            onChange={handleFileUpload}
            disabled={uploading}
            multiple
          />
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}
      </div>

      {/* ファイル一覧 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">登録済みファイル</h3>
          <button
            onClick={loadFiles}
            disabled={loading}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '読み込み中...' : '更新'}
          </button>
        </div>

        {files.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <DocumentIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">まだファイルが登録されていません</p>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors group"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <DocumentIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {file.filename || `File ID: ${file.id.slice(0, 16)}...`}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(file.createdAt * 1000).toLocaleString('ja-JP')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      file.status === 'completed'
                        ? 'bg-green-900/50 text-green-300'
                        : 'bg-yellow-900/50 text-yellow-300'
                    }`}
                  >
                    {file.status}
                  </span>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-red-900/50 text-red-400 hover:text-red-300"
                    title="削除"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 使い方 */}
      <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-300 mb-2">💡 使い方</h4>
        <ul className="text-xs text-blue-200 space-y-1">
          <li>• PDF、テキスト、Markdown、JSONファイルをアップロードできます</li>
          <li>• <strong>複数ファイルの同時アップロード</strong>が可能です</li>
          <li>• <strong>ドラッグ&ドロップ</strong>でも簡単にアップロードできます</li>
          <li>• アップロードしたファイルはAIが自動的に学習します</li>
          <li>• チャットでの質問に、ファイルの内容を使って回答します</li>
          <li>• ファイルにカーソルを合わせると<strong>削除ボタン</strong>が表示されます</li>
          <li>• ファイルサイズは10MB以下にしてください</li>
        </ul>
      </div>
    </div>
  );
}
