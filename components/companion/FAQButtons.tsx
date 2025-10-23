'use client';

import { useState } from 'react';
import { getFAQsByLocale, groupFAQsByCategory, getCategoryLabel, type FAQ } from '@/lib/faq-data';
import { QuestionMarkCircleIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

type FAQButtonsProps = {
  locale: string;
  onSelectFAQ: (question: string, answer: string) => void;
};

export function FAQButtons({ locale, onSelectFAQ }: FAQButtonsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const faqs = getFAQsByLocale(locale);
  const groupedFAQs = groupFAQsByCategory(faqs);

  return (
    <div className="w-full">
      {/* トグルボタン */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mb-3 flex w-full items-center justify-between rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10"
      >
        <div className="flex items-center gap-2">
          <QuestionMarkCircleIcon className="h-5 w-5 text-liberty-400" />
          <span className="text-sm font-semibold text-white">
            {locale === 'ja' ? 'よく聞かれる質問' : 'Frequently Asked Questions'}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="h-5 w-5 text-white/60" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-white/60" />
        )}
      </button>

      {/* FAQボタン一覧 */}
      {isExpanded && (
        <div className="space-y-3 rounded-xl border border-white/10 bg-black/40 p-4">
          {Object.entries(groupedFAQs).map(([category, categoryFAQs]) => (
            <div key={category}>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/60">
                {getCategoryLabel(category, locale)}
              </h4>
              <div className="space-y-2">
                {categoryFAQs.map((faq) => (
                  <button
                    key={faq.id}
                    onClick={() => onSelectFAQ(faq.question, faq.answer)}
                    className="group w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm transition hover:border-liberty-400/50 hover:bg-liberty-500/10"
                  >
                    <div className="flex items-start gap-2">
                      <QuestionMarkCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-liberty-400" />
                      <span className="text-white/80 group-hover:text-white">
                        {faq.question}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
