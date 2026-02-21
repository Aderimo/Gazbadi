'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import ContentCard from '@/components/ui/ContentCard';
import type { ContentItem } from '@/types';

interface MyRecommendationsClientProps {
  items: ContentItem[];
}

export default function MyRecommendationsClient({ items }: MyRecommendationsClientProps) {
  const { locale, t } = useLanguage();

  return (
    <section className="px-6 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-10 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-gray-100 sm:text-3xl">
            {t('sections.myRecommendations')}
          </h2>
          <Link
            href="/my-recommendations"
            className="text-sm font-medium text-accent-turquoise transition-colors hover:text-accent-turquoise/80"
          >
            {t('sections.viewAll')} →
          </Link>
        </div>

        {/* Card Grid */}
        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <ContentCard key={item.id} item={item} locale={locale} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            {locale === 'tr' ? 'Henüz öneri eklenmedi.' : 'No recommendations yet.'}
          </p>
        )}
      </div>
    </section>
  );
}
