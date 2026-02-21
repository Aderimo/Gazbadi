/**
 * Türkçe karakter haritası — URL-safe ASCII dönüşümü
 */
const TURKISH_CHAR_MAP: Record<string, string> = {
  ç: 'c',
  Ç: 'c',
  ğ: 'g',
  Ğ: 'g',
  ı: 'i',
  İ: 'i',
  ö: 'o',
  Ö: 'o',
  ş: 's',
  Ş: 's',
  ü: 'u',
  Ü: 'u',
};

/**
 * Başlığı URL-safe slug'a dönüştürür.
 *
 * - Türkçe karakterleri ASCII karşılıklarına çevirir
 * - Küçük harfe dönüştürür
 * - Harf, rakam ve tire dışındaki karakterleri tire ile değiştirir
 * - Ardışık tireleri tek tireye indirger
 * - Baş ve sondaki tireleri kaldırır
 */
export function generateSlug(title: string): string {
  let slug = '';

  for (const char of title) {
    slug += TURKISH_CHAR_MAP[char] ?? char;
  }

  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Mevcut slug'larla çakışmayan benzersiz bir slug üretir.
 *
 * Çakışma varsa sonuna -2, -3, … ekler.
 */
export function generateUniqueSlug(
  title: string,
  existingSlugs: string[],
): string {
  const base = generateSlug(title);
  if (!existingSlugs.includes(base)) return base;

  let counter = 2;
  while (existingSlugs.includes(`${base}-${counter}`)) {
    counter++;
  }

  return `${base}-${counter}`;
}
