import fs from 'fs';
import path from 'path';
import type { ContentItem } from '@/types';

const DATA_DIRS = ['locations', 'blog', 'recommendations', 'friend-experiences'];

/**
 * Tüm JSON veri dizinlerinden ContentItem'ları okur.
 */
export function getAllItems(): ContentItem[] {
  const items: ContentItem[] = [];
  const dataRoot = path.join(process.cwd(), 'data');

  for (const dir of DATA_DIRS) {
    const dirPath = path.join(dataRoot, dir);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(dirPath, file), 'utf-8');
        const item = deserializeContentItem(raw);
        items.push(item);
      } catch {
        // JSON parse hatası — logla, atla
        console.error(`Failed to parse ${dir}/${file}`);
      }
    }
  }

  return items;
}

/**
 * Sadece status === 'published' olan içerikleri döndürür.
 */
export function getPublishedItems(): ContentItem[] {
  return getAllItems().filter((item) => item.status === 'published');
}

/**
 * Yayınlanmış içerikleri updatedAt'e göre azalan sırada döndürür.
 * @param limit — Opsiyonel, döndürülecek maksimum öğe sayısı
 */
export function getNewlyAdded(limit?: number): ContentItem[] {
  const sorted = getPublishedItems().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  return limit !== undefined ? sorted.slice(0, limit) : sorted;
}

/**
 * Slug ile eşleşen ilk ContentItem'ı döndürür.
 */
export function getItemBySlug(slug: string): ContentItem | undefined {
  return getAllItems().find((item) => item.slug === slug);
}

/**
 * Belirli bir type'a sahip tüm ContentItem'ları döndürür.
 */
export function getItemsByType(type: ContentItem['type']): ContentItem[] {
  return getAllItems().filter((item) => item.type === type);
}

/**
 * ContentItem nesnesini JSON string'e serialize eder.
 */
export function serializeContentItem(item: ContentItem): string {
  return JSON.stringify(item);
}

/**
 * JSON string'i ContentItem nesnesine deserialize eder.
 */
export function deserializeContentItem(json: string): ContentItem {
  return JSON.parse(json) as ContentItem;
}
