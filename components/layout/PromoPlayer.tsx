'use client';

import { useState } from 'react';

const demoVideos = [
  {
    title: 'Liberty Demo',
    src: 'https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4',
  },
  {
    title: 'FOMUS Showcase',
    src: 'https://storage.googleapis.com/coverr-main/mp4/Mer-Sunset.mp4',
  },
];

export function PromoPlayer() {
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="aspect-video w-full overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl shadow-black/60">
        <video key={demoVideos[selected].src} className="h-full w-full object-cover" controls loop>
          <source src={demoVideos[selected].src} type="video/mp4" />
          お使いのブラウザは動画再生に対応していません。
        </video>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {demoVideos.map((video, index) => (
          <button
            key={video.title}
            type="button"
            onClick={() => setSelected(index)}
            className={`rounded-2xl border px-4 py-3 text-left transition hover:border-liberty-300/60 hover:bg-white/10 ${
              selected === index ? 'border-liberty-300 bg-white/10 text-white' : 'border-white/10 text-white/70'
            }`}
          >
            <p className="text-sm font-semibold">{video.title}</p>
            <p className="text-xs text-white/60">企業 PV や展示映像をここに登録できます。</p>
          </button>
        ))}
      </div>
    </div>
  );
}
