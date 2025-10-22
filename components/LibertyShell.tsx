'use client';

import { useCallback } from 'react';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { LicenseGate } from '@/components/license/LicenseGate';
import { PromoPlayer } from '@/components/layout/PromoPlayer';
import { QrPanel } from '@/components/layout/QrPanel';
import { Button } from '@/components/ui/Button';
import { useLicense } from '@/lib/hooks/useLicense';
import { useLocale } from '@/lib/hooks/useLocale';

export default function LibertyShell() {
  const locale = useLocale();
  const { license, loading, error, verify, reset } = useLicense();

  const handleLogout = useCallback(() => {
    reset();
  }, [reset]);

  if (!license) {
    return <LicenseGate loading={loading} error={error} onSubmit={verify} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-black via-liberty-900 to-black p-6 text-white">
      <header className="flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-8 py-4 shadow-lg shadow-black/50">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/60">FOMUS Cultural AI Platform</p>
          <h1 className="text-2xl font-semibold">Liberty — あなたの知識を世界へ</h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-white/70">
          <div className="text-right">
            <p className="font-mono">{license.licenseKey}</p>
            <p>有効期限: {new Date(license.expiresAt).toLocaleDateString()}</p>
          </div>
          <Button variant="ghost" onClick={handleLogout}>
            ログアウト
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-6 py-6 xl:flex-row">
        <section className="flex flex-1 flex-col gap-4">
          <PromoPlayer />
          <QrPanel />
        </section>
        <section className="flex flex-1 flex-col">
          <ChatPanel locale={locale} license={license} />
        </section>
      </main>
    </div>
  );
}
