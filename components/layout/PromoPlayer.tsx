'use client';

import { useState, useEffect, useRef } from 'react';
import { PlayIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { useLicense } from '@/lib/hooks/useLicense';
import type { Video } from '@/lib/supabase/types';

interface VideoItem {
  title: string;
  description: string | null;
  src: string;
}

export function PromoPlayer() {
  const { license } = useLicense();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 動画一覧を取得
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        // ライセンスキーがある場合はパラメータとして渡す
        const url = license?.licenseKey
          ? `/api/videos?license_key=${encodeURIComponent(license.licenseKey)}`
          : '/api/videos';

        const response = await fetch(url);
        const data = await response.json();
        if (response.ok && data.videos.length > 0) {
          const videoItems: VideoItem[] = data.videos.map((v: Video) => ({
            title: v.title,
            description: v.description,
            src: v.video_url,
          }));
          setVideos(videoItems);
        }
      } catch (error) {
        console.error('動画一覧取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [license?.licenseKey]);

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
    setSelected((prev) => (prev + 1) % videos.length);
  };

  const handlePrevious = () => {
    setSelected((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const handleVideoClick = (index: number) => {
    setSelected(index);
    setIsFullscreen(true);
  };

  if (loading) {
    return (
      <div className="flex h-full flex-col gap-4">
        <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
          <h2 className="mb-4 text-xl font-semibold text-white">動画ライブラリ</h2>
          <div className="flex items-center justify-center py-12">
            <p className="text-white/60">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex h-full flex-col gap-4">
        <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
          <h2 className="mb-4 text-xl font-semibold text-white">動画ライブラリ</h2>
          <div className="flex items-center justify-center py-12">
            <p className="text-white/60">動画がまだ登録されていません</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 通常表示 */}
      <div className="flex h-full flex-col gap-4">
        <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
          <h2 className="mb-4 text-xl font-semibold text-white">動画ライブラリ</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {videos.map((video, index) => (
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
                  key={videos[selected].src}
                  className="w-full rounded-2xl shadow-2xl"
                  controls
                  autoPlay
                >
                  <source src={videos[selected].src} type="video/mp4" />
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
              <h3 className="text-2xl font-bold text-white">{videos[selected].title}</h3>
              <p className="mt-2 text-white/70">{videos[selected].description}</p>
              <p className="mt-2 text-sm text-white/50">
                {selected + 1} / {videos.length}
              </p>
            </div>

            {/* サムネイルナビゲーション */}
            <div className="mt-6 flex justify-center gap-2 overflow-x-auto pb-2">
              {videos.map((video, index) => (
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
