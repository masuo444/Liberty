'use client';

import { FormEvent, useState } from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type LicenseGateProps = {
  loading: boolean;
  error: string | null;
  onSubmit: (key: string) => Promise<boolean>;
};

export function LicenseGate({ loading, error, onSubmit }: LicenseGateProps) {
  const [key, setKey] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!key) return;
    await onSubmit(key.trim());
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-liberty-900 via-black to-liberty-800 p-6">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-liberty-900/30 backdrop-blur">
        <div className="flex items-center gap-3 pb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-liberty-500/20 text-liberty-200">
            <ShieldCheckIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">Liberty ライセンス認証</h1>
            <p className="text-sm text-white/70">FOMUS から発行されたライセンスキーを入力してください。</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="ライセンスキー"
            name="license"
            autoFocus
            placeholder="LIBERTY-DEMO-2024-FOMUS"
            maxLength={50}
            value={key}
            onChange={(event) => setKey(event.target.value)}
            required
          />
          {error && <p className="text-sm text-red-300">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? '認証中…' : '開始する'}
          </Button>
        </form>
        <p className="pt-6 text-xs text-white/50">
          ライセンスの発行は FOMUS 管理画面から行えます。キーの紛失や更新が必要な場合はサポートまでご連絡ください。
        </p>
      </div>
    </div>
  );
}
