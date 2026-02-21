'use client';

import { useLanguage } from '@/components/providers/LanguageProvider';
import ContentCard from '@/components/ui/ContentCard';
import type { ContentItem } from '@/types';

interface PopularRoutesClientProps {
  items: ContentItem[];
}

export default function PopularRoutesClient({ items }: PopularRoutesClientProps) {
  const { locale, t } = useLanguage();

  return (
    <section className="px-6 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-10 text-2xl font-bold text-gray-100 sm:text-3xl">
          {t('sections.popularRoutes')}
        </h2>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <ContentCard key={item.id} item={item} locale={locale} variant="featured" />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            {locale === 'tr' ? 'Henüz popüler rota eklenmedi.' : 'No popular routes yet.'}
          </p>
        )}
      </div>
    </section>
  );
}
