'use client';

import { useState, useEffect, useRef } from 'react';
import { PlayIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const demoVideos = [
  {
    title: 'Liberty Demo 1',
    description: '企業紹介ビデオ - 会社概要',
    src: 'https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4',
  },
  {
    title: 'FOMUS Showcase',
    description: 'プロダクト紹介 - 主要機能',
    src: 'https://storage.googleapis.com/coverr-main/mp4/Mer-Sunset.mp4',
  },
  {
    title: 'Liberty Demo 3',
    description: '使い方ガイド - 基本操作',
    src: 'https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4',
  },
  {
    title: 'Liberty Demo 4',
    description: 'お客様事例 - 導入実績',
    src: 'https://storage.googleapis.com/coverr-main/mp4/Mer-Sunset.mp4',
  },
  {
    title: 'Liberty Demo 5',
    description: '技術紹介 - AI機能',
    src: 'https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4',
  },
  {
    title: 'Liberty Demo 6',
    description: 'サポート案内 - お問い合わせ',
    src: 'https://storage.googleapis.com/coverr-main/mp4/Mer-Sunset.mp4',
  },
  {
    title: 'Liberty Demo 7',
    description: '料金プラン - 価格体系',
    src: 'https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4',
  },
  {
    title: 'Liberty Demo 8',
    description: '導入事例 - 成功ストーリー',
    src: 'https://storage.googleapis.com/coverr-main/mp4/Mer-Sunset.mp4',
  },
  {
    title: 'Liberty Demo 9',
    description: 'FAQ - よくある質問',
    src: 'https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4',
  },
  {
    title: 'Liberty Demo 10',
    description: '最新情報 - アップデート',
    src: 'https://storage.googleapis.com/coverr-main/mp4/Mer-Sunset.mp4',
  },
];

export function PromoPlayer() {
  const [selected, setSelected] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // キーボードショートカット
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          setIsFullscreen(false);
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, selected]);

  // 動画が変わったら自動再生
  useEffect(() => {
    if (isFullscreen && videoRef.current) {
      videoRef.current.play().catch(() => {
        // 自動再生が失敗した場合は無視
      });
    }
  }, [selected, isFullscreen]);

  const handleNext = () => {
    setSelected((prev) => (prev + 1) % demoVideos.length);
  };

  const handlePrevious = () => {
    setSelected((prev) => (prev - 1 + demoVideos.length) % demoVideos.length);
  };

  const handleVideoClick = (index: number) => {
    setSelected(index);
    setIsFullscreen(true);
  };

  return (
    <>
      {/* 通常表示 */}
      <div className="flex h-full flex-col gap-4">
        <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
          <h2 className="mb-4 text-xl font-semibold text-white">動画ライブラリ</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {demoVideos.map((video, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleVideoClick(index)}
                className="group relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-black/60 transition hover:border-liberty-300/60 hover:shadow-lg hover:shadow-liberty-500/20"
              >
                {/* サムネイル（ビデオの最初のフレーム） */}
                <video
                  className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100"
                  src={video.src}
                  muted
                  preload="metadata"
                />
                {/* 再生ボタンオーバーレイ */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 transition group-hover:bg-black/60">
                  <div className="rounded-full bg-liberty-500/80 p-3 transition group-hover:scale-110 group-hover:bg-liberty-500">
                    <PlayIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                {/* タイトル */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-xs font-semibold text-white">{video.title}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* フルスクリーンモーダル */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
          <div className="relative flex h-full w-full max-w-7xl flex-col p-8">
            {/* 閉じるボタン */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-3 text-white transition hover:bg-black/80"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {/* 動画プレイヤー */}
            <div className="flex flex-1 items-center justify-center">
              <div className="relative w-full">
                <video
                  ref={videoRef}
                  key={demoVideos[selected].src}
                  className="w-full rounded-2xl shadow-2xl"
                  controls
                  autoPlay
                >
                  <source src={demoVideos[selected].src} type="video/mp4" />
                  お使いのブラウザは動画再生に対応していません。
                </video>

                {/* 前へボタン */}
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-4 text-white transition hover:bg-black/80 hover:scale-110"
                >
                  <ChevronLeftIcon className="h-8 w-8" />
                </button>

                {/* 次へボタン */}
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-4 text-white transition hover:bg-black/80 hover:scale-110"
                >
                  <ChevronRightIcon className="h-8 w-8" />
                </button>
              </div>
            </div>

            {/* 動画情報 */}
            <div className="mt-6 text-center">
              <h3 className="text-2xl font-bold text-white">{demoVideos[selected].title}</h3>
              <p className="mt-2 text-white/70">{demoVideos[selected].description}</p>
              <p className="mt-2 text-sm text-white/50">
                {selected + 1} / {demoVideos.length}
              </p>
            </div>

            {/* サムネイルナビゲーション */}
            <div className="mt-6 flex justify-center gap-2 overflow-x-auto pb-2">
              {demoVideos.map((video, index) => (
                <button
                  key={index}
                  onClick={() => setSelected(index)}
                  className={`group relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    selected === index
                      ? 'border-liberty-400 shadow-lg shadow-liberty-500/50'
                      : 'border-white/20 hover:border-liberty-300/60'
                  }`}
                >
                  <video
                    className="h-full w-full object-cover"
                    src={video.src}
                    muted
                    preload="metadata"
                  />
                  {selected === index && (
                    <div className="absolute inset-0 flex items-center justify-center bg-liberty-500/30">
                      <PlayIcon className="h-6 w-6 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
