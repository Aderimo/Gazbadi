import { describe, it, expect } from 'vitest';
import { generateMetaTags, generateJsonLd, generatePageMeta } from '@/lib/seo';
import type { ContentItem } from '@/types';

// Test verisi: tam dolu ContentItem
const mockLocation: ContentItem = {
  id: 'loc-001',
  slug: 'istanbul',
  type: 'location',
  status: 'published',
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-20T14:30:00Z',
  coverImage: '/images/locations/istanbul-cover.jpg',
  seo: {
    tr: { title: 'İstanbul Seyahat Rehberi', description: 'İstanbul gezilecek yerler' },
    en: { title: 'Istanbul Travel Guide', description: 'Places to visit in Istanbul' },
  },
  content: {
    tr: { title: 'İstanbul', summary: 'Doğu ile Batının buluştuğu şehir' },
    en: { title: 'Istanbul', summary: 'The city where East meets West' },
  },
};

const mockBlog: ContentItem = {
  id: 'blog-001',
  slug: 'first-post',
  type: 'blog',
  status: 'published',
  createdAt: '2024-02-01T08:00:00Z',
  updatedAt: '2024-02-05T12:00:00Z',
  coverImage: '/images/blog/first-post.jpg',
  seo: {
    tr: { title: 'İlk Blog Yazısı', description: 'Blog açıklaması' },
    en: { title: 'First Blog Post', description: 'Blog description' },
  },
  content: {
    tr: { title: 'İlk Yazı', summary: 'Özet' },
    en: { title: 'First Post', summary: 'Summary' },
  },
};

const mockFriendExp: ContentItem = {
  id: 'fe-001',
  slug: 'ali-istanbul',
  type: 'friend-experience',
  status: 'published',
  createdAt: '2024-03-01T10:00:00Z',
  updatedAt: '2024-03-05T10:00:00Z',
  coverImage: '/images/friends/ali.jpg',
  seo: {
    tr: { title: 'Ali İstanbul Deneyimi', description: 'Ali anlatıyor' },
    en: { title: "Ali's Istanbul Experience", description: 'Ali tells his story' },
  },
  content: {
    tr: { title: 'Ali Deneyimi', summary: 'Kısa özet' },
    en: { title: "Ali's Experience", summary: 'Short summary' },
  },
};

describe('generateMetaTags', () => {
  it('TR locale için doğru title ve description döndürür', () => {
    const meta = generateMetaTags(mockLocation, 'tr');
    expect(meta.title).toBe('İstanbul Seyahat Rehberi');
    expect(meta.description).toBe('İstanbul gezilecek yerler');
  });

  it('EN locale için doğru title ve description döndürür', () => {
    const meta = generateMetaTags(mockLocation, 'en');
    expect(meta.title).toBe('Istanbul Travel Guide');
    expect(meta.description).toBe('Places to visit in Istanbul');
  });

  it('coverImage değerini og:image olarak içerir', () => {
    const meta = generateMetaTags(mockLocation, 'tr');
    expect(meta['og:image']).toBe('/images/locations/istanbul-cover.jpg');
  });

  it('blog tipi için og:type article döndürür', () => {
    const meta = generateMetaTags(mockBlog, 'en');
    expect(meta['og:type']).toBe('article');
  });

  it('location tipi için og:type website döndürür', () => {
    const meta = generateMetaTags(mockLocation, 'tr');
    expect(meta['og:type']).toBe('website');
  });

  it('SEO alanları boşsa content title/summary fallback kullanır', () => {
    const itemWithEmptySeo: ContentItem = {
      ...mockLocation,
      seo: {
        tr: { title: '', description: '' },
        en: { title: '', description: '' },
      },
    };
    const meta = generateMetaTags(itemWithEmptySeo, 'tr');
    expect(meta.title).toBe('İstanbul');
    expect(meta.description).toBe('Doğu ile Batının buluştuğu şehir');
  });
});

describe('generateJsonLd', () => {
  it('location tipi için TouristDestination @type döndürür', () => {
    const ld = generateJsonLd(mockLocation, 'tr');
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('TouristDestination');
  });

  it('blog tipi için Article @type döndürür', () => {
    const ld = generateJsonLd(mockBlog, 'en');
    expect(ld['@type']).toBe('Article');
  });

  it('friend-experience tipi için Review @type döndürür', () => {
    const ld = generateJsonLd(mockFriendExp, 'tr');
    expect(ld['@type']).toBe('Review');
  });

  it('coverImage varsa image alanını içerir', () => {
    const ld = generateJsonLd(mockLocation, 'en');
    expect(ld.image).toBe('/images/locations/istanbul-cover.jpg');
  });
});

describe('generatePageMeta', () => {
  it('doğru yapıda meta objesi döndürür', () => {
    const meta = generatePageMeta('Keşfet', 'Tüm destinasyonlar', '/images/explore.jpg');
    expect(meta.title).toBe('Keşfet');
    expect(meta.description).toBe('Tüm destinasyonlar');
    expect(meta['og:title']).toBe('Keşfet');
    expect(meta['og:description']).toBe('Tüm destinasyonlar');
    expect(meta['og:image']).toBe('/images/explore.jpg');
    expect(meta['og:type']).toBe('website');
  });

  it('image verilmezse og:image alanı olmaz', () => {
    const meta = generatePageMeta('Blog', 'Blog yazıları');
    expect(meta['og:image']).toBeUndefined();
  });
});
