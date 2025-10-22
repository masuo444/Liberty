'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { verifyLicense } from '../api';
import type { LicensePayload, LicenseResponse } from '../types';

const STORAGE_KEY = 'liberty-license';

function readStoredLicense(): LicensePayload | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as LicensePayload;
    const isExpired = new Date(parsed.expiresAt).getTime() < Date.now();
    if (isExpired) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch (error) {
    console.warn('ライセンス情報の読み込みに失敗しました', error);
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function useLicense() {
  const [license, setLicenseState] = useState<LicensePayload | null>(() => readStoredLicense());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!license) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(license));
  }, [license]);

  const verify = useCallback(async (key: string) => {
    setLoading(true);
    setError(null);
    let response: LicenseResponse;
    try {
      response = await verifyLicense(key);
    } catch (err) {
      console.error(err);
      setError('サーバーに接続できませんでした。');
      setLoading(false);
      return false;
    }

    if (!response.ok || !response.license) {
      setError(response.message ?? 'ライセンスが無効です。');
      setLoading(false);
      return false;
    }

    setLicenseState(response.license);
    setLoading(false);
    return true;
  }, []);

  const reset = useCallback(() => {
    setLicenseState(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return useMemo(
    () => ({
      license,
      loading,
      error,
      verify,
      reset,
    }),
    [license, loading, error, verify, reset],
  );
}
