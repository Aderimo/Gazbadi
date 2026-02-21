import type { ContentItem } from '@/types';

/**
 * Content_Item type'ına göre detay URL'i üretir.
 *
 * - location        → /location/{slug}
 * - blog            → /blog/{slug}
 * - friend-experience → /friend-experiences/{slug}
 * - recommendation  → /my-recommendations
 */
export function getDetailUrl(item: { type: ContentItem['type']; slug: string }): string {
  switch (item.type) {
    case 'location':
      return `/location/${item.slug}`;
    case 'blog':
      return `/blog/${item.slug}`;
    case 'friend-experience':
      return `/friend-experiences/${item.slug}`;
    case 'recommendation':
      return '/my-recommendations';
  }
}
