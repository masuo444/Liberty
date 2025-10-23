import { KnowledgeManager } from '@/components/KnowledgeManager';

export default function KnowledgePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Liberty 管理画面</h1>
          <p className="text-gray-400">知識Boxにファイルをアップロードして、AIに学習させましょう</p>
        </div>

        <KnowledgeManager />

        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            ← アプリに戻る
          </a>
        </div>
      </div>
    </div>
  );
}
