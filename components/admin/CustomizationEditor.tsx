'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { PaintBrushIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { LicenseCustomization } from '@/lib/supabase/types';

interface CustomizationEditorProps {
  licenseId: string;
  currentCustomization: LicenseCustomization | null;
  onSave: (customization: LicenseCustomization) => Promise<void>;
  onClose: () => void;
}

const themes = [
  { value: 'default', label: 'デフォルト', color: '#6366f1' },
  { value: 'modern', label: 'モダン', color: '#06b6d4' },
  { value: 'minimal', label: 'ミニマル', color: '#8b5cf6' },
  { value: 'classic', label: 'クラシック', color: '#10b981' },
];

const fontFamilies = [
  { value: '', label: 'デフォルト' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Noto Sans JP', label: 'Noto Sans JP' },
  { value: 'Poppins', label: 'Poppins' },
];

export function CustomizationEditor({
  licenseId,
  currentCustomization,
  onSave,
  onClose,
}: CustomizationEditorProps) {
  const [customization, setCustomization] = useState<LicenseCustomization>(
    currentCustomization || {
      theme: 'default',
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      backgroundColor: '#000000',
      fontFamily: '',
      logoUrl: '',
      customCss: '',
    }
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(customization);
      onClose();
    } catch (error) {
      console.error('カスタマイズ保存エラー:', error);
      alert('カスタマイズの保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 to-black p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PaintBrushIcon className="h-6 w-6 text-liberty-400" />
            <h2 className="text-xl font-bold text-white">カスタマイズ設定</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* テーマ選択 */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-white/80">テーマ</label>
            <div className="grid grid-cols-2 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => setCustomization({ ...customization, theme: theme.value as any })}
                  className={`rounded-lg border p-3 transition ${
                    customization.theme === theme.value
                      ? 'border-liberty-500 bg-liberty-500/20'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-full"
                      style={{ backgroundColor: theme.color }}
                    />
                    <span className="font-semibold text-white">{theme.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* カラー設定 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-white/80">
                プライマリーカラー
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customization.primaryColor || '#6366f1'}
                  onChange={(e) =>
                    setCustomization({ ...customization, primaryColor: e.target.value })
                  }
                  className="h-10 w-16 cursor-pointer rounded-lg border border-white/10"
                />
                <input
                  type="text"
                  value={customization.primaryColor || '#6366f1'}
                  onChange={(e) =>
                    setCustomization({ ...customization, primaryColor: e.target.value })
                  }
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  placeholder="#6366f1"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/80">
                セカンダリーカラー
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customization.secondaryColor || '#8b5cf6'}
                  onChange={(e) =>
                    setCustomization({ ...customization, secondaryColor: e.target.value })
                  }
                  className="h-10 w-16 cursor-pointer rounded-lg border border-white/10"
                />
                <input
                  type="text"
                  value={customization.secondaryColor || '#8b5cf6'}
                  onChange={(e) =>
                    setCustomization({ ...customization, secondaryColor: e.target.value })
                  }
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  placeholder="#8b5cf6"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/80">背景色</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customization.backgroundColor || '#000000'}
                  onChange={(e) =>
                    setCustomization({ ...customization, backgroundColor: e.target.value })
                  }
                  className="h-10 w-16 cursor-pointer rounded-lg border border-white/10"
                />
                <input
                  type="text"
                  value={customization.backgroundColor || '#000000'}
                  onChange={(e) =>
                    setCustomization({ ...customization, backgroundColor: e.target.value })
                  }
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                  placeholder="#000000"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-white/80">フォント</label>
              <select
                value={customization.fontFamily || ''}
                onChange={(e) =>
                  setCustomization({ ...customization, fontFamily: e.target.value })
                }
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
              >
                {fontFamilies.map((font) => (
                  <option key={font.value} value={font.value} className="bg-gray-900">
                    {font.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ロゴURL */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-white/80">
              カスタムロゴURL（オプション）
            </label>
            <input
              type="url"
              value={customization.logoUrl || ''}
              onChange={(e) => setCustomization({ ...customization, logoUrl: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white"
              placeholder="https://example.com/logo.png"
            />
          </div>

          {/* カスタムCSS */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-white/80">
              カスタムCSS（上級者向け）
            </label>
            <textarea
              value={customization.customCss || ''}
              onChange={(e) => setCustomization({ ...customization, customCss: e.target.value })}
              className="h-32 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white"
              placeholder=".custom-class { color: red; }"
            />
          </div>

          {/* アクションボタン */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-liberty-500 hover:bg-liberty-600"
            >
              {saving ? '保存中...' : 'カスタマイズを保存'}
            </Button>
            <Button onClick={onClose} variant="ghost" className="border border-white/10">
              キャンセル
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
