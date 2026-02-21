'use client';

import { useLanguage } from '@/components/providers/LanguageProvider';
import ContentCard from '@/components/ui/ContentCard';
import type { ContentItem } from '@/types';

interface BlogClientProps {
  items: ContentItem[];
}

export default function BlogClient({ items }: BlogClientProps) {
  const { locale, t } = useLanguage();

  return (
    <div className="min-h-screen bg-dark">
      <section aria-labelledby="blog-heading" className="px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <h1 id="blog-heading" className="mb-10 text-3xl font-bold text-gray-100 sm:text-4xl">
            {t('sections.blogPosts')}
          </h1>

          {items.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <ContentCard key={item.id} item={item} locale={locale} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              {locale === 'tr' ? 'Henüz blog yazısı eklenmedi.' : 'No blog posts yet.'}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
