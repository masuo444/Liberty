'use client';

import { forwardRef } from 'react';
import { clsx } from 'clsx';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, label, id, ...props },
  ref,
) {
  const inputElement = (
    <input
      id={id}
      ref={ref}
      className={clsx(
        'w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-base text-white outline-none placeholder:text-white/40 focus:border-liberty-400 focus:ring-2 focus:ring-liberty-400/40',
        className,
      )}
      {...props}
    />
  );

  if (!label) {
    return inputElement;
  }

  return (
    <label className="flex w-full flex-col gap-2 text-sm font-medium text-white/80">
      <span>{label}</span>
      {inputElement}
    </label>
  );
});
