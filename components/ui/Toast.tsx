'use client';

import { useEffect } from 'react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ id, type, message, duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-400" />;
      case 'error':
        return <XCircleIcon className="h-6 w-6 text-red-400" />;
      case 'warning':
        return <ExclamationCircleIcon className="h-6 w-6 text-amber-400" />;
      case 'info':
        return <InformationCircleIcon className="h-6 w-6 text-blue-400" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-900/90 border-green-500/50';
      case 'error':
        return 'bg-red-900/90 border-red-500/50';
      case 'warning':
        return 'bg-amber-900/90 border-amber-500/50';
      case 'info':
        return 'bg-blue-900/90 border-blue-500/50';
    }
  };

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-4 shadow-2xl backdrop-blur-sm ${getBackgroundColor()} animate-slide-in-right`}
    >
      {getIcon()}
      <p className="flex-1 text-sm text-white">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="text-white/60 transition hover:text-white"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
