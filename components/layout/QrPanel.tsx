'use client';

import QRCode from 'qrcode';
import { useEffect, useRef, useState } from 'react';

const DEFAULT_URL = 'https://fomus.jp/liberty';

export function QrPanel() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [url] = useState(DEFAULT_URL);

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
    <div className="mt-auto flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
      <canvas ref={canvasRef} className="h-40 w-40" />
      <div>
        <p className="text-sm font-semibold text-white">今すぐ体験する</p>
        <p className="text-xs text-white/60">QR を読み取って商品サイトへアクセス</p>
      </div>
    </div>
  );
}
