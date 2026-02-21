import type { ContentBody } from '@/types';

/**
 * Locale'e göre içerik döndürür.
 * Seçilen locale'in içeriği eksik veya boşsa Türkçe ('tr') fallback kullanır.
 */
export function getLocalizedContent<T extends ContentBody>(
  content: { tr: T; en: T },
  locale: 'tr' | 'en'
): T {
  const localized = content[locale];

  if (locale === 'tr') {
    return localized;
  }

  // Eğer seçilen dildeki title veya summary boşsa, Türkçe fallback
  if (!localized.title || !localized.summary) {
    return content.tr;
  }

  return localized;
}

/**
 * Locale'e göre SEO alanlarını döndürür.
 * Seçilen locale'in SEO alanları eksik veya boşsa Türkçe ('tr') fallback kullanır.
 */
export function getLocalizedSeo(
  seo: { tr: { title: string; description: string }; en: { title: string; description: string } },
  locale: 'tr' | 'en'
): { title: string; description: string } {
  const localized = seo[locale];

  if (locale === 'tr') {
    return localized;
  }

  if (!localized.title || !localized.description) {
    return seo.tr;
  }

  return localized;
}
