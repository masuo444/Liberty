'use client';

import { forwardRef } from 'react';
import { clsx } from 'clsx';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', disabled, ...props },
  ref,
) {
  const styles = clsx(
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition',
    disabled && 'opacity-60 cursor-not-allowed',
    variant === 'primary' && !disabled &&
      'bg-liberty-500 text-white shadow-lg shadow-liberty-500/30 hover:bg-liberty-400',
    variant === 'secondary' && !disabled &&
      'bg-white/10 text-white hover:bg-white/20 border border-white/20',
    variant === 'ghost' && !disabled && 'text-white hover:bg-white/10',
    className,
  );

  return <button ref={ref} className={styles} disabled={disabled} {...props} />;
});
