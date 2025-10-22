'use client';

import { useEffect, useState } from 'react';

const FALLBACK_LOCALE = 'ja';

export function useLocale() {
  const [locale, setLocale] = useState(FALLBACK_LOCALE);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    const language = navigator.language ?? FALLBACK_LOCALE;
    setLocale(language.split('-')[0]);
  }, []);

  return locale;
}
