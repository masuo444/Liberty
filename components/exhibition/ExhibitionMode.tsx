'use client';

import { useState } from 'react';
import { CheckCircleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { Product, sampleProducts } from '@/lib/types/products';
import Image from 'next/image';

type LayoutMode = 'auto' | 'horizontal' | 'vertical';

interface ExhibitionModeProps {
  layoutMode?: LayoutMode;
}

export function ExhibitionMode({ layoutMode = 'auto' }: ExhibitionModeProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product>(sampleProducts[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('すべて');

  // カテゴリーのユニークリストを取得
  const categories = ['すべて', ...Array.from(new Set(sampleProducts.map((p) => p.category)))];

  // フィルタリングされた商品リスト
  const filteredProducts =
    selectedCategory === 'すべて'
      ? sampleProducts
      : sampleProducts.filter((p) => p.category === selectedCategory);

  return (
    <div className={`flex h-full gap-6 ${layoutMode === 'vertical' ? 'flex-col overflow-y-auto' : layoutMode === 'auto' ? 'portrait:flex-col portrait:overflow-y-auto' : ''}`}>
      {/* 左側: 商品リストとカテゴリー（縦型では上部） */}
      <div className={`flex w-1/3 flex-col gap-4 ${layoutMode === 'vertical' ? 'w-full flex-shrink-0' : layoutMode === 'auto' ? 'portrait:w-full portrait:flex-shrink-0' : ''}`}>
        {/* カテゴリーフィルター */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
          <h3 className="mb-3 text-sm font-semibold text-white/80">カテゴリー</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-liberty-500 text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* 商品リスト */}
        <div className={`flex-1 overflow-y-auto rounded-2xl border border-white/10 bg-black/40 p-4 ${layoutMode === 'vertical' ? 'max-h-96' : layoutMode === 'auto' ? 'portrait:max-h-96' : ''}`}>
          <h3 className="mb-3 text-sm font-semibold text-white/80">
            製品一覧 ({filteredProducts.length})
          </h3>
          <div className={`space-y-2 ${layoutMode === 'vertical' ? 'grid grid-cols-2 gap-2 space-y-0' : layoutMode === 'auto' ? 'portrait:grid portrait:grid-cols-2 portrait:gap-2 portrait:space-y-0' : ''}`}>
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className={`w-full rounded-xl border p-4 text-left transition-all ${
                  selectedProduct.id === product.id
                    ? 'border-liberty-400 bg-liberty-500/20 shadow-lg shadow-liberty-500/20'
                    : 'border-white/10 bg-white/5 hover:border-liberty-300/50 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{product.name}</p>
                    <p className="mt-1 text-xs text-white/60">{product.category}</p>
                    {selectedProduct.id === product.id && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-liberty-300">
                        <CheckCircleIcon className="h-4 w-4" />
                        <span>選択中</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 右側: 商品詳細（縦型では下部） */}
      <div className={`flex flex-1 flex-col gap-4 overflow-y-auto ${layoutMode === 'vertical' ? 'w-full' : layoutMode === 'auto' ? 'portrait:w-full' : ''}`}>
        {/* 商品ヘッダー */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-liberty-900/40 to-black/40 p-6">
          <div className="flex items-start gap-6">
            {selectedProduct.image && (
              <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl bg-white/5">
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="mb-2 inline-block rounded-full bg-liberty-500/20 px-3 py-1 text-xs font-medium text-liberty-300">
                {selectedProduct.category}
              </div>
              <h2 className="mb-2 text-3xl font-bold text-white">{selectedProduct.name}</h2>
              <p className="text-white/70">{selectedProduct.description}</p>
              {selectedProduct.price && (
                <p className="mt-4 text-xl font-semibold text-liberty-300">{selectedProduct.price}</p>
              )}
            </div>
          </div>
        </div>

        {/* 特徴 */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
            <CheckCircleIcon className="h-6 w-6 text-liberty-400" />
            主な特徴
          </h3>
          <div className={`grid gap-3 md:grid-cols-2 ${layoutMode === 'vertical' ? 'grid-cols-1' : layoutMode === 'auto' ? 'portrait:grid-cols-1' : ''}`}>
            {selectedProduct.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg bg-white/5 p-3 transition hover:bg-white/10"
              >
                <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-liberty-400"></div>
                <p className="text-sm text-white/90">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 仕様 */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
          <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
            <DocumentTextIcon className="h-6 w-6 text-liberty-400" />
            詳細仕様
          </h3>
          <div className="space-y-3">
            {selectedProduct.specifications.map((spec, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
              >
                <span className="text-sm font-medium text-white/70">{spec.label}</span>
                <span className="text-sm font-semibold text-white">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* アクション */}
        {selectedProduct.brochureUrl && (
          <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
            <a
              href={selectedProduct.brochureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg bg-liberty-500 px-6 py-3 font-semibold text-white transition hover:bg-liberty-600"
            >
              <DocumentTextIcon className="h-5 w-5" />
              資料をダウンロード
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
