import type { ContentItem } from '@/types';

/**
 * Mevcut slug'larla çakışmayan benzersiz bir slug döndürür.
 * Çakışma varsa sonuna -2, -3, … ekler.
 * excludeId verilirse o id'ye ait öğenin slug'ı çakışma sayılmaz (düzenleme senaryosu).
 */
export function ensureUniqueSlug(
  items: ContentItem[],
  slug: string,
  excludeId?: string,
): string {
  const existingSlugs = items
    .filter((item) => item.id !== excludeId)
    .map((item) => item.slug);

  if (!existingSlugs.includes(slug)) return slug;

  let counter = 2;
  while (existingSlugs.includes(`${slug}-${counter}`)) {
    counter++;
  }

  return `${slug}-${counter}`;
}

/**
 * Yeni bir ContentItem ekler. Slug benzersizliğini garanti eder.
 */
export function createItem(
  items: ContentItem[],
  newItem: ContentItem,
): ContentItem[] {
  const uniqueSlug = ensureUniqueSlug(items, newItem.slug);
  return [...items, { ...newItem, slug: uniqueSlug }];
}

/**
 * Mevcut bir ContentItem'ı günceller.
 * Slug alanı korunur (değiştirilemez), updatedAt otomatik güncellenir.
 */
export function updateItem(
  items: ContentItem[],
  id: string,
  updates: Partial<ContentItem>,
): ContentItem[] {
  return items.map((item) => {
    if (item.id !== id) return item;

    // slug korunur — updates içinde gelse bile yok sayılır
    const { slug: _ignoredSlug, ...safeUpdates } = updates;

    return {
      ...item,
      ...safeUpdates,
      slug: item.slug,
      updatedAt: new Date().toISOString(),
    };
  });
}

/**
 * Bir ContentItem'ı id'ye göre siler.
 * Eşleşme yoksa diziyi olduğu gibi döndürür.
 */
export function deleteItem(
  items: ContentItem[],
  id: string,
): ContentItem[] {
  return items.filter((item) => item.id !== id);
}

/**
 * Id'ye göre ContentItem bulur.
 */
export function getItemById(
  items: ContentItem[],
  id: string,
): ContentItem | undefined {
  return items.find((item) => item.id === id);
}

/**
 * Slug'a göre ContentItem bulur.
 */
export function getItemBySlug(
  items: ContentItem[],
  slug: string,
): ContentItem | undefined {
  return items.find((item) => item.slug === slug);
}
