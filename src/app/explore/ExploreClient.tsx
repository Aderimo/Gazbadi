'use client';

import { useState, useMemo } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import ContentCard from '@/components/ui/ContentCard';
import type { ContentItem, LocationContent } from '@/types';

interface ExploreClientProps {
  items: ContentItem[];
}

export default function ExploreClient({ items }: ExploreClientProps) {
  const { locale, t } = useLanguage();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase().trim();
    return items.filter((item) => {
      const content = item.content[locale] as LocationContent;
      const fields = [
        content.title,
        content.summary,
        content.city,
        content.country,
        content.introduction,
        content.citizenship,
      ];
      return fields.some((f) => f?.toLowerCase().includes(q));
    });
  }, [items, query, locale]);

  return (
    <div className="min-h-screen bg-dark">
      <section aria-labelledby="explore-heading" className="px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h1 id="explore-heading" className="mb-6 text-3xl font-bold text-gray-100 sm:text-4xl">
            {t('sections.explore')}
          </h1>

          {/* Search */}
          <div className="mb-10">
            <div className="relative max-w-xl">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" strokeLinecap="round" />
                </svg>
              </span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={locale === 'tr'
                  ? 'Şehir, ülke, vatandaşlık, vize ara...'
                  : 'Search city, country, citizenship, visa...'}
                className="w-full rounded-xl border border-white/10 bg-dark-secondary pl-11 pr-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none transition-colors focus:border-accent-turquoise/50"
                aria-label={locale === 'tr' ? 'Lokasyon ara' : 'Search locations'}
              />
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <ContentCard key={item.id} item={item} locale={locale} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              {query.trim()
                ? (locale === 'tr' ? 'Sonuç bulunamadı.' : 'No results found.')
                : (locale === 'tr' ? 'Henüz lokasyon eklenmedi.' : 'No locations yet.')}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
