'use client';

import { useCallback, useEffect, useRef } from 'react';

export function useAutoReset(callback: () => void, timeoutMs: number) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      callback();
    }, timeoutMs);
  }, [callback, timeoutMs]);

  useEffect(() => {
    const events = ['click', 'keydown', 'touchstart'];
    const handler = () => resetTimer();

    events.forEach((event) => window.addEventListener(event, handler));
    resetTimer();

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((event) => window.removeEventListener(event, handler));
    };
  }, [resetTimer]);

  return { resetTimer };
}
