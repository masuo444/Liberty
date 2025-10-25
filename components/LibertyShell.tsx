'use client';

import { useCallback, useState } from 'react';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { LicenseGate } from '@/components/license/LicenseGate';
import { PromoPlayer } from '@/components/layout/PromoPlayer';
import { QrPanel } from '@/components/layout/QrPanel';
import { CompanionMode } from '@/components/companion/CompanionMode';
import { ExhibitionMode } from '@/components/exhibition/ExhibitionMode';
import { CustomizationApplier } from '@/components/CustomizationApplier';
import { Button } from '@/components/ui/Button';
import { useLicense } from '@/lib/hooks/useLicense';
import { useLocale } from '@/lib/hooks/useLocale';

type ViewMode = 'both' | 'video' | 'chat' | 'companion' | 'exhibition';
type LayoutMode = 'auto' | 'horizontal' | 'vertical';

export default function LibertyShell() {
  const locale = useLocale();
  const { license, loading, error, verify, reset } = useLicense();
  const [viewMode, setViewMode] = useState<ViewMode>('both');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('auto');

  const handleLogout = useCallback(() => {
    reset();
  }, [reset]);

  if (!license) {
    return <LicenseGate loading={loading} error={error} onSubmit={verify} />;
  }

  // レイアウトモードに応じたクラス名を生成
  const getLayoutClass = (baseClass: string, portraitClass: string) => {
    if (layoutMode === 'vertical') return portraitClass;
    if (layoutMode === 'horizontal') return baseClass;
    return `${baseClass} portrait:${portraitClass.split(' ').join(' portrait:')}`;
  };

  return (
    <>
      <CustomizationApplier customization={license?.customization} />
      <div className={`flex min-h-screen flex-col bg-gradient-to-br from-black via-liberty-900 to-black p-6 text-white ${layoutMode === 'vertical' ? 'p-4' : layoutMode === 'auto' ? 'portrait:p-4' : ''}`}>
      <header className={`flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-6 py-3 shadow-lg shadow-black/50 ${layoutMode === 'vertical' ? 'flex-col gap-3 px-4 py-3' : layoutMode === 'auto' ? 'portrait:flex-col portrait:gap-3 portrait:px-4 portrait:py-3' : ''}`}>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">FOMUS Cultural AI Platform</p>
          <h1 className="text-xl font-semibold">Liberty</h1>
        </div>
        <div className={`flex items-center gap-3 text-sm text-white/70 ${layoutMode === 'vertical' ? 'w-full flex-col items-stretch' : layoutMode === 'auto' ? 'portrait:w-full portrait:flex-col portrait:items-stretch' : ''}`}>
          {/* レイアウト切り替えボタン */}
          <div className="flex gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-1">
            <button
              onClick={() => setLayoutMode('auto')}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-all ${
                layoutMode === 'auto'
                  ? 'bg-amber-500/30 text-white shadow-lg'
                  : 'text-white/60 hover:text-white/90'
              }`}
              title="自動検出"
            >
              🔄 自動
            </button>
            <button
              onClick={() => setLayoutMode('horizontal')}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-all ${
                layoutMode === 'horizontal'
                  ? 'bg-amber-500/30 text-white shadow-lg'
                  : 'text-white/60 hover:text-white/90'
              }`}
              title="横型レイアウト"
            >
              ↔️ 横型
            </button>
            <button
              onClick={() => setLayoutMode('vertical')}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-all ${
                layoutMode === 'vertical'
                  ? 'bg-amber-500/30 text-white shadow-lg'
                  : 'text-white/60 hover:text-white/90'
              }`}
              title="縦型レイアウト"
            >
              ↕️ 縦型
            </button>
          </div>

          {/* 表示モード切り替えボタン */}
          <div className={`flex gap-2 rounded-lg border border-white/20 bg-white/5 p-1 ${layoutMode === 'vertical' ? 'flex-wrap justify-center' : layoutMode === 'auto' ? 'portrait:flex-wrap portrait:justify-center' : ''}`}>
            <button
              onClick={() => setViewMode('both')}
              className={`rounded px-4 py-2 text-xs font-medium transition-all ${
                viewMode === 'both'
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white/60 hover:text-white/90'
              }`}
            >
              両方
            </button>
            <button
              onClick={() => setViewMode('video')}
              className={`rounded px-4 py-2 text-xs font-medium transition-all ${
                viewMode === 'video'
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white/60 hover:text-white/90'
              }`}
            >
              動画のみ
            </button>
            <button
              onClick={() => setViewMode('chat')}
              className={`rounded px-4 py-2 text-xs font-medium transition-all ${
                viewMode === 'chat'
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white/60 hover:text-white/90'
              }`}
            >
              チャットのみ
            </button>
            <button
              onClick={() => setViewMode('companion')}
              className={`rounded px-4 py-2 text-xs font-medium transition-all ${
                viewMode === 'companion'
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white/60 hover:text-white/90'
              }`}
            >
              コンパニオン
            </button>
            <button
              onClick={() => setViewMode('exhibition')}
              className={`rounded px-4 py-2 text-xs font-medium transition-all ${
                viewMode === 'exhibition'
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white/60 hover:text-white/90'
              }`}
            >
              展示会
            </button>
          </div>
          <div className={`text-right ${layoutMode === 'vertical' ? 'text-center' : layoutMode === 'auto' ? 'portrait:text-center' : ''}`}>
            <p className="font-mono text-xs">{license.licenseKey}</p>
            <p className="text-xs">有効期限: {new Date(license.expiresAt).toLocaleDateString()}</p>
          </div>
          <Button variant="ghost" onClick={handleLogout} className={layoutMode === 'vertical' ? 'w-full' : layoutMode === 'auto' ? 'portrait:w-full' : ''}>
            ログアウト
          </Button>
        </div>
      </header>

      <main className={`flex flex-1 flex-col gap-6 py-6 ${layoutMode === 'horizontal' ? 'xl:flex-row' : layoutMode === 'vertical' ? 'flex-col py-4' : 'xl:flex-row portrait:flex-col portrait:py-4'}`}>
        {/* 展示会モード - 全画面表示 */}
        {viewMode === 'exhibition' ? (
          <section className="flex flex-1 flex-col">
            <ExhibitionMode layoutMode={layoutMode} />
          </section>
        ) : /* コンパニオンモード - 全画面表示 */
        viewMode === 'companion' ? (
          <section className="flex flex-1 flex-col">
            <CompanionMode locale={locale} license={license} layoutMode={layoutMode} />
          </section>
        ) : (
          <>
            {/* 動画セクション */}
            {(viewMode === 'both' || viewMode === 'video') && (
              <section className={`flex flex-col gap-4 ${viewMode === 'video' ? 'flex-1' : 'flex-1'}`}>
                <PromoPlayer />
                <QrPanel />
              </section>
            )}
            {/* チャットセクション */}
            {(viewMode === 'both' || viewMode === 'chat') && (
              <section className={`flex flex-col ${viewMode === 'chat' ? 'flex-1' : 'flex-1'}`}>
                <ChatPanel locale={locale} license={license} />
              </section>
            )}
          </>
        )}
      </main>
    </div>
    </>
  );
}
