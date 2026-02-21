import { describe, it, expect } from 'vitest';
import { getLocalizedContent, getLocalizedSeo } from '@/lib/i18n-content';
import type { ContentBody } from '@/types';

const fullContent = {
  tr: { title: 'İstanbul', summary: 'Doğu ile Batının buluştuğu şehir' },
  en: { title: 'Istanbul', summary: 'The city where East meets West' },
};

const emptyEnContent = {
  tr: { title: 'Paris', summary: 'Işıklar şehri' },
  en: { title: '', summary: '' },
};

const partialEnContent = {
  tr: { title: 'Roma', summary: 'Ebedi şehir' },
  en: { title: 'Rome', summary: '' },
};

describe('getLocalizedContent', () => {
  it('tr locale seçildiğinde Türkçe içerik döndürür', () => {
    const result = getLocalizedContent(fullContent, 'tr');
    expect(result).toEqual(fullContent.tr);
  });

  it('en locale seçildiğinde ve çeviri mevcutsa İngilizce içerik döndürür', () => {
    const result = getLocalizedContent(fullContent, 'en');
    expect(result).toEqual(fullContent.en);
  });

  it('en locale seçildiğinde ve İngilizce içerik boşsa Türkçe fallback döndürür', () => {
    const result = getLocalizedContent(emptyEnContent, 'en');
    expect(result).toEqual(emptyEnContent.tr);
  });

  it('en locale seçildiğinde ve summary boşsa Türkçe fallback döndürür', () => {
    const result = getLocalizedContent(partialEnContent, 'en');
    expect(result).toEqual(partialEnContent.tr);
  });

  it('tr locale seçildiğinde her zaman Türkçe döndürür (boş olsa bile)', () => {
    const content = {
      tr: { title: '', summary: '' },
      en: { title: 'Test', summary: 'Test' },
    };
    const result = getLocalizedContent(content, 'tr');
    expect(result).toEqual(content.tr);
  });

  it('extended ContentBody ile çalışır', () => {
    interface LocationBody extends ContentBody {
      city: string;
    }
    const content: { tr: LocationBody; en: LocationBody } = {
      tr: { title: 'İstanbul', summary: 'Özet', city: 'İstanbul' },
      en: { title: 'Istanbul', summary: 'Summary', city: 'Istanbul' },
    };
    const result = getLocalizedContent(content, 'en');
    expect(result.city).toBe('Istanbul');
  });
});

const fullSeo = {
  tr: { title: 'İstanbul Rehberi', description: 'İstanbul seyahat rehberi' },
  en: { title: 'Istanbul Guide', description: 'Istanbul travel guide' },
};

const emptySeoEn = {
  tr: { title: 'Paris Rehberi', description: 'Paris seyahat rehberi' },
  en: { title: '', description: '' },
};

const partialSeoEn = {
  tr: { title: 'Roma Rehberi', description: 'Roma seyahat rehberi' },
  en: { title: 'Rome Guide', description: '' },
};

describe('getLocalizedSeo', () => {
  it('tr locale seçildiğinde Türkçe SEO döndürür', () => {
    const result = getLocalizedSeo(fullSeo, 'tr');
    expect(result).toEqual(fullSeo.tr);
  });

  it('en locale seçildiğinde ve çeviri mevcutsa İngilizce SEO döndürür', () => {
    const result = getLocalizedSeo(fullSeo, 'en');
    expect(result).toEqual(fullSeo.en);
  });

  it('en locale seçildiğinde ve İngilizce SEO boşsa Türkçe fallback döndürür', () => {
    const result = getLocalizedSeo(emptySeoEn, 'en');
    expect(result).toEqual(emptySeoEn.tr);
  });

  it('en locale seçildiğinde ve description boşsa Türkçe fallback döndürür', () => {
    const result = getLocalizedSeo(partialSeoEn, 'en');
    expect(result).toEqual(partialSeoEn.tr);
  });

  it('tr locale seçildiğinde her zaman Türkçe döndürür', () => {
    const seo = {
      tr: { title: '', description: '' },
      en: { title: 'Test', description: 'Test' },
    };
    const result = getLocalizedSeo(seo, 'tr');
    expect(result).toEqual(seo.tr);
  });
});
