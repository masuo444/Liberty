import { NextResponse } from 'next/server';
import type { LicenseResponse } from '@/lib/types';

const MOCK_LICENSES: Record<string, LicenseResponse> = {
  'LIB-123456': {
    ok: true,
    license: {
      licenseKey: 'LIB-123456',
      features: { chat: true, stt: true, tts: false },
      expiresAt: '2026-12-31T23:59:59.000Z',
    },
  },
  'LIB-654321': {
    ok: true,
    license: {
      licenseKey: 'LIB-654321',
      features: { chat: true, stt: true, tts: true },
      expiresAt: '2026-12-31T23:59:59.000Z',
    },
  },
};

export async function POST(request: Request) {
  const { key } = await request.json();

  if (typeof key !== 'string') {
    return NextResponse.json<LicenseResponse>(
      { ok: false, message: 'ライセンスキーが不正です。' },
      { status: 400 },
    );
  }

  const normalizedKey = key.trim().toUpperCase();
  const license = MOCK_LICENSES[normalizedKey];

  if (!license) {
    return NextResponse.json<LicenseResponse>({ ok: false, message: '無効なライセンスキーです。' }, { status: 404 });
  }

  return NextResponse.json<LicenseResponse>(license);
}
