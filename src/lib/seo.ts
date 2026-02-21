import type { ContentItem } from '@/types';

// ============================================
// SEO Meta Tag & Structured Data Üretimi
// ============================================

export interface MetaTags {
  title: string;
  description: string;
  'og:title': string;
  'og:description': string;
  'og:image': string;
  'og:type': string;
}

export interface PageMeta {
  title: string;
  description: string;
  'og:title': string;
  'og:description': string;
  'og:image'?: string;
  'og:type': string;
}

export interface JsonLd {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  image?: string;
  [key: string]: unknown;
}

/**
 * ContentItem için locale'e göre SEO meta tagları üretir.
 * SEO alanları boşsa, content title/summary'ye fallback yapar.
 */
export function generateMetaTags(item: ContentItem, locale: 'tr' | 'en'): MetaTags {
  const seo = item.seo?.[locale];
  const content = item.content?.[locale];

  const title = seo?.title || content?.title || '';
  const description = seo?.description || content?.summary || '';

  const ogType = item.type === 'blog' ? 'article' : 'website';

  return {
    title,
    description,
    'og:title': title,
    'og:description': description,
    'og:image': item.coverImage || '',
    'og:type': ogType,
  };
}

/**
 * ContentItem için locale'e göre JSON-LD structured data üretir.
 * Schema.org tipleri:
 *  - location → TouristDestination
 *  - blog → Article
 *  - friend-experience → Review
 *  - recommendation → Article
 */
export function generateJsonLd(item: ContentItem, locale: 'tr' | 'en'): JsonLd {
  const seo = item.seo?.[locale];
  const content = item.content?.[locale];

  const name = seo?.title || content?.title || '';
  const description = seo?.description || content?.summary || '';

  const schemaTypeMap: Record<ContentItem['type'], string> = {
    location: 'TouristDestination',
    blog: 'Article',
    'friend-experience': 'Review',
    recommendation: 'Article',
  };

  const jsonLd: JsonLd = {
    '@context': 'https://schema.org',
    '@type': schemaTypeMap[item.type],
    name,
    description,
  };

  if (item.coverImage) {
    jsonLd.image = item.coverImage;
  }

  return jsonLd;
}

/**
 * Statik sayfalar (explore, blog listesi vb.) için genel meta tag üretir.
 */
export function generatePageMeta(title: string, description: string, image?: string): PageMeta {
  const meta: PageMeta = {
    title,
    description,
    'og:title': title,
    'og:description': description,
    'og:type': 'website',
  };

  if (image) {
    meta['og:image'] = image;
  }

  return meta;
}
