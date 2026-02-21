'use client';

import { useLanguage } from '@/components/providers/LanguageProvider';
import ContentCard from '@/components/ui/ContentCard';
import type { ContentItem } from '@/types';

interface NewlyAddedClientProps {
  items: ContentItem[];
}

export default function NewlyAddedClient({ items }: NewlyAddedClientProps) {
  const { locale, t } = useLanguage();

  return (
    <section className="px-6 py-16 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-100 sm:text-3xl">
            {t('sections.newlyAdded')}
          </h2>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ContentCard key={item.id} item={item} locale={locale} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            {locale === 'tr' ? 'Henüz içerik eklenmedi.' : 'No content yet.'}
          </p>
        )}
      </div>
    </section>
  );
}
