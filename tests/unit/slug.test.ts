import { describe, it, expect } from 'vitest';
import { generateSlug, generateUniqueSlug } from '@/lib/slug';

describe('generateSlug', () => {
  it('basit İngilizce başlığı slug yapar', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  it('Türkçe karakterleri ASCII karşılıklarına çevirir', () => {
    expect(generateSlug('İstanbul Güneşli')).toBe('istanbul-gunesli');
  });

  it('tüm Türkçe özel karakterleri dönüştürür', () => {
    // çğıİöşüÇĞÖŞÜ → c g i i o s u c g o s u → cgiiosucgosu
    const slug = generateSlug('çğıİöşüÇĞÖŞÜ');
    expect(slug).toBe('cgiiosucgosu');
    expect(slug).toMatch(/^[a-z0-9-]*$/);
  });

  it('özel karakterleri tire ile değiştirir', () => {
    expect(generateSlug('Hello & World!')).toBe('hello-world');
  });

  it('ardışık tireleri tek tireye indirger', () => {
    expect(generateSlug('a---b')).toBe('a-b');
  });

  it('baş ve sondaki tireleri kaldırır', () => {
    expect(generateSlug('--hello--')).toBe('hello');
  });

  it('tamamen küçük harf çıktı üretir', () => {
    expect(generateSlug('BÜYÜK HARFLER')).toBe('buyuk-harfler');
  });

  it('rakamları korur', () => {
    expect(generateSlug('Top 10 Yerler')).toBe('top-10-yerler');
  });

  it('boş string için boş string döndürür', () => {
    expect(generateSlug('')).toBe('');
  });

  it('sadece özel karakterlerden oluşan string için boş string döndürür', () => {
    expect(generateSlug('!@#$%')).toBe('');
  });

  it('Türkçe cümle slug üretimi', () => {
    expect(generateSlug('Şile ve Ağva Günübirlik Gezi')).toBe('sile-ve-agva-gunubirlik-gezi');
  });
});

describe('generateUniqueSlug', () => {
  it('çakışma yoksa base slug döndürür', () => {
    expect(generateUniqueSlug('Hello World', [])).toBe('hello-world');
  });

  it('çakışma varsa -2 ekler', () => {
    expect(generateUniqueSlug('Istanbul', ['istanbul'])).toBe('istanbul-2');
  });

  it('birden fazla çakışmada sıralı numara ekler', () => {
    expect(
      generateUniqueSlug('Istanbul', ['istanbul', 'istanbul-2', 'istanbul-3']),
    ).toBe('istanbul-4');
  });

  it('farklı slug ile çakışma olmaz', () => {
    expect(generateUniqueSlug('Paris', ['istanbul', 'london'])).toBe('paris');
  });

  it('boş existingSlugs ile çakışma olmaz', () => {
    expect(generateUniqueSlug('Test', [])).toBe('test');
  });
});
