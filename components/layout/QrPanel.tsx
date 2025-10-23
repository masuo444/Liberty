'use client';

import QRCode from 'qrcode';
import { useEffect, useRef, useState } from 'react';
import { PlayCircleIcon } from '@heroicons/react/24/solid';

const DEFAULT_URL = 'https://fomus.jp/liberty';

// ツアー動画のリスト
const TOUR_VIDEOS = [
  {
    id: '1',
    title: '東京タワー',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: '/tour-tokyo-tower.jpg',
  },
  {
    id: '2',
    title: '富士山',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: '/tour-fuji.jpg',
  },
  {
    id: '3',
    title: '京都の寺院',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnail: '/tour-kyoto.jpg',
  },
];

export function QrPanel() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [url] = useState(DEFAULT_URL);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: 180,
      color: {
        dark: '#FFFFFF',
        light: '#00000000',
      },
      margin: 1,
    }).catch((error) => console.error('QRコード生成に失敗しました', error));
  }, [url]);

  return (
    <>
      <div className="mt-auto flex flex-col gap-4">
        {/* QRコード */}
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
          <canvas ref={canvasRef} className="h-40 w-40" />
          <div>
            <p className="text-sm font-semibold text-white">今すぐ体験する</p>
            <p className="text-xs text-white/60">QR を読み取って商品サイトへアクセス</p>
          </div>
        </div>

        {/* スペシャルツアー */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <h3 className="mb-3 text-center text-sm font-semibold text-amber-300">
            スペシャルツアー
          </h3>
          <div className="space-y-2">
            {TOUR_VIDEOS.map((video) => (
              <button
                key={video.id}
                onClick={() => setSelectedVideo(video.url)}
                className="group flex w-full items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 text-left transition hover:border-amber-400/50 hover:bg-amber-500/20"
              >
                <PlayCircleIcon className="h-8 w-8 flex-shrink-0 text-amber-400 transition group-hover:scale-110" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{video.title}</p>
                  <p className="text-xs text-white/60">動画を再生</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 動画モーダル */}
      {selectedVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6"
          onClick={() => setSelectedVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute -right-4 -top-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white transition hover:bg-red-600"
            >
              ✕
            </button>
            <div className="aspect-video w-full overflow-hidden rounded-2xl">
              <iframe
                src={selectedVideo}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
