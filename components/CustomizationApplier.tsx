'use client';

import { useEffect } from 'react';
import type { LicenseCustomization } from '@/lib/types';

interface CustomizationApplierProps {
  customization: LicenseCustomization | null | undefined;
}

export function CustomizationApplier({ customization }: CustomizationApplierProps) {
  useEffect(() => {
    if (!customization) return;

    const root = document.documentElement;

    // カラーのカスタマイズを適用
    if (customization.primaryColor) {
      root.style.setProperty('--color-liberty-primary', customization.primaryColor);
    }
    if (customization.secondaryColor) {
      root.style.setProperty('--color-liberty-secondary', customization.secondaryColor);
    }
    if (customization.backgroundColor) {
      root.style.setProperty('--color-bg', customization.backgroundColor);
    }

    // フォントファミリーの適用
    if (customization.fontFamily) {
      root.style.setProperty('--font-family-custom', customization.fontFamily);
      document.body.style.fontFamily = customization.fontFamily;
    }

    // カスタムCSSの適用
    if (customization.customCss) {
      const styleEl = document.createElement('style');
      styleEl.id = 'liberty-custom-css';
      styleEl.textContent = customization.customCss;
      document.head.appendChild(styleEl);

      return () => {
        const existingStyle = document.getElementById('liberty-custom-css');
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, [customization]);

  return null;
}
