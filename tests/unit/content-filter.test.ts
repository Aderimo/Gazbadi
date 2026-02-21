import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ContentItem } from '@/types';

// Mock fs and path before importing the module
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
    readFileSync: vi.fn(),
  },
}));

import fs from 'fs';
import {
  getAllItems,
  getPublishedItems,
  getNewlyAdded,
  getItemBySlug,
  getItemsByType,
  serializeContentItem,
  deserializeContentItem,
} from '@/lib/data';

function makeItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: 'test-001',
    slug: 'test-item',
    type: 'blog',
    status: 'published',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
    coverImage: '/images/test.jpg',
    seo: {
      tr: { title: 'Test TR', description: 'Desc TR' },
      en: { title: 'Test EN', description: 'Desc EN' },
    },
    content: {
      tr: { title: 'Test TR', summary: 'Özet TR' },
      en: { title: 'Test EN', summary: 'Summary EN' },
    },
    ...overrides,
  };
}

const sampleItems: ContentItem[] = [
  makeItem({ id: '1', slug: 'istanbul', type: 'location', status: 'published', updatedAt: '2024-01-20T14:30:00Z' }),
  makeItem({ id: '2', slug: 'blog-post', type: 'blog', status: 'published', updatedAt: '2024-02-12T16:45:00Z' }),
  makeItem({ id: '3', slug: 'draft-item', type: 'blog', status: 'draft', updatedAt: '2024-03-01T00:00:00Z' }),
  makeItem({ id: '4', slug: 'unpublished', type: 'recommendation', status: 'unpublished', updatedAt: '2024-02-01T00:00:00Z' }),
  makeItem({ id: '5', slug: 'friend-exp', type: 'friend-experience', status: 'published', updatedAt: '2024-01-05T00:00:00Z' }),
];

function setupFsMock(items: ContentItem[]) {
  const mockedFs = vi.mocked(fs);

  // Group items by type to simulate directory structure
  const dirMap: Record<string, ContentItem[]> = {};
  for (const item of items) {
    const dir = item.type === 'friend-experience' ? 'friend-experiences' : 
                item.type === 'location' ? 'locations' :
                item.type === 'blog' ? 'blog' : 'recommendations';
    if (!dirMap[dir]) dirMap[dir] = [];
    dirMap[dir].push(item);
  }

  mockedFs.existsSync.mockImplementation((p: unknown) => {
    const dirName = String(p).split(/[\\/]/).pop() || '';
    return ['locations', 'blog', 'recommendations', 'friend-experiences'].includes(dirName);
  });

  mockedFs.readdirSync.mockImplementation((p: unknown) => {
    const dirName = String(p).split(/[\\/]/).pop() || '';
    const dirItems = dirMap[dirName] || [];
    return dirItems.map((item) => `${item.slug}.json`) as unknown as ReturnType<typeof fs.readdirSync>;
  });

  mockedFs.readFileSync.mockImplementation((p: unknown) => {
    const fileName = String(p).split(/[\\/]/).pop() || '';
    const slug = fileName.replace('.json', '');
    const item = items.find((i) => i.slug === slug);
    if (!item) throw new Error(`File not found: ${p}`);
    return JSON.stringify(item);
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  setupFsMock(sampleItems);
});

describe('getAllItems', () => {
  it('tüm JSON dosyalarından ContentItem döndürür', () => {
    const items = getAllItems();
    expect(items).toHaveLength(5);
  });

  it('boş dizinlerde boş dizi döndürür', () => {
    setupFsMock([]);
    const items = getAllItems();
    expect(items).toHaveLength(0);
  });
});

describe('getPublishedItems', () => {
  it('sadece published status olan öğeleri döndürür', () => {
    const items = getPublishedItems();
    expect(items).toHaveLength(3);
    expect(items.every((i) => i.status === 'published')).toBe(true);
  });

  it('draft ve unpublished öğeleri içermez', () => {
    const items = getPublishedItems();
    const slugs = items.map((i) => i.slug);
    expect(slugs).not.toContain('draft-item');
    expect(slugs).not.toContain('unpublished');
  });
});

describe('getNewlyAdded', () => {
  it('updatedAt azalan sırada döndürür', () => {
    const items = getNewlyAdded();
    for (let i = 1; i < items.length; i++) {
      expect(new Date(items[i - 1].updatedAt).getTime())
        .toBeGreaterThanOrEqual(new Date(items[i].updatedAt).getTime());
    }
  });

  it('limit parametresi ile sonuç sayısını kısıtlar', () => {
    const items = getNewlyAdded(2);
    expect(items).toHaveLength(2);
  });

  it('limit verilmezse tüm published öğeleri döndürür', () => {
    const items = getNewlyAdded();
    expect(items).toHaveLength(3);
  });

  it('sadece published öğeleri içerir', () => {
    const items = getNewlyAdded();
    expect(items.every((i) => i.status === 'published')).toBe(true);
  });
});

describe('getItemBySlug', () => {
  it('slug ile eşleşen öğeyi döndürür', () => {
    const item = getItemBySlug('istanbul');
    expect(item).toBeDefined();
    expect(item!.slug).toBe('istanbul');
  });

  it('eşleşme yoksa undefined döndürür', () => {
    const item = getItemBySlug('nonexistent');
    expect(item).toBeUndefined();
  });
});

describe('getItemsByType', () => {
  it('belirli type ile filtreleme yapar', () => {
    const blogs = getItemsByType('blog');
    expect(blogs).toHaveLength(2);
    expect(blogs.every((i) => i.type === 'blog')).toBe(true);
  });

  it('eşleşme yoksa boş dizi döndürür', () => {
    setupFsMock([makeItem({ type: 'blog', slug: 'only-blog' })]);
    const locations = getItemsByType('location');
    expect(locations).toHaveLength(0);
  });
});

describe('serializeContentItem / deserializeContentItem', () => {
  it('JSON round-trip eşdeğer nesne üretir', () => {
    const original = makeItem();
    const json = serializeContentItem(original);
    const restored = deserializeContentItem(json);
    expect(restored).toEqual(original);
  });

  it('iç içe yapıları (seo, content) korur', () => {
    const original = makeItem();
    const json = serializeContentItem(original);
    const restored = deserializeContentItem(json);
    expect(restored.seo.tr.title).toBe(original.seo.tr.title);
    expect(restored.content.en.summary).toBe(original.content.en.summary);
  });

  it('geçersiz JSON parse hatası fırlatır', () => {
    expect(() => deserializeContentItem('invalid json')).toThrow();
  });
});
