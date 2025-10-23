'use client';

import { useState, useEffect } from 'react';
import { ArrowUpTrayIcon, DocumentIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface KnowledgeFile {
  id: string;
  status: string;
  createdAt: number;
}

export function KnowledgeManager() {
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<KnowledgeFile[]>([]);
  const [loading, setLoading] = useState(false);

  // 初回ロード時にファイル一覧を取得
  useEffect(() => {
    loadFiles();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setUploadSuccess(false);

    try {
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

      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);

      // ファイル一覧を再読み込み
      await loadFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setUploading(false);
      // ファイル入力をリセット
      event.target.value = '';
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

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-gray-900 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-white mb-6">📚 知識Box管理</h2>

      {/* ファイルアップロード */}
      <div className="mb-8">
        <label
          htmlFor="file-upload"
          className={`
            flex flex-col items-center justify-center w-full h-48
            border-2 border-dashed rounded-lg cursor-pointer
            transition-all duration-200
            ${
              uploading
                ? 'border-yellow-500 bg-yellow-500/10'
                : 'border-gray-600 hover:border-blue-500 bg-gray-800/50 hover:bg-gray-800'
            }
          `}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-4"></div>
                <p className="text-sm text-yellow-400">アップロード中...</p>
              </>
            ) : uploadSuccess ? (
              <>
                <CheckCircleIcon className="w-12 h-12 text-green-500 mb-4" />
                <p className="text-sm text-green-400">アップロード完了！</p>
              </>
            ) : (
              <>
                <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mb-4" />
                <p className="mb-2 text-sm text-gray-300">
                  <span className="font-semibold">クリックしてファイルを選択</span>
                </p>
                <p className="text-xs text-gray-400">PDF, TXT, MD, JSON (最大10MB)</p>
              </>
            )}
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".pdf,.txt,.md,.json"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>

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
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <DocumentIcon className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-white">File ID: {file.id.slice(0, 16)}...</p>
                    <p className="text-xs text-gray-400">
                      {new Date(file.createdAt * 1000).toLocaleString('ja-JP')}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    file.status === 'completed'
                      ? 'bg-green-900/50 text-green-300'
                      : 'bg-yellow-900/50 text-yellow-300'
                  }`}
                >
                  {file.status}
                </span>
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
          <li>• アップロードしたファイルはAIが自動的に学習します</li>
          <li>• チャットでの質問に、ファイルの内容を使って回答します</li>
          <li>• ファイルサイズは10MB以下にしてください</li>
        </ul>
      </div>
    </div>
  );
}
