import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const LibertyShell = dynamic(() => import('@/components/LibertyShell'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-black text-white">
      <p className="text-lg tracking-wide">Liberty を初期化しています…</p>
    </div>
  ),
});

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LibertyShell />
    </Suspense>
  );
}
