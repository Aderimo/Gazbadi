import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ContentItem } from '@/types';
import {
  createItem,
  updateItem,
  deleteItem,
  getItemById,
  getItemBySlug,
  ensureUniqueSlug,
} from '@/lib/content-manager';

function makeItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: 'item-001',
    slug: 'test-item',
    type: 'blog',
    status: 'draft',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
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

describe('createItem', () => {
  it('öğeyi diziye ekler', () => {
    const items: ContentItem[] = [];
    const newItem = makeItem();
    const result = createItem(items, newItem);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('item-001');
  });

  it('benzersiz slug varsa olduğu gibi kullanır', () => {
    const items: ContentItem[] = [];
    const newItem = makeItem({ slug: 'paris' });
    const result = createItem(items, newItem);
    expect(result[0].slug).toBe('paris');
  });

  it('çakışan slug varsa -2 ekler', () => {
    const existing = [makeItem({ id: 'existing', slug: 'istanbul' })];
    const newItem = makeItem({ id: 'new', slug: 'istanbul' });
    const result = createItem(existing, newItem);
    expect(result).toHaveLength(2);
    expect(result[1].slug).toBe('istanbul-2');
  });

  it('birden fazla çakışmada -3 ekler', () => {
    const existing = [
      makeItem({ id: 'a', slug: 'istanbul' }),
      makeItem({ id: 'b', slug: 'istanbul-2' }),
    ];
    const newItem = makeItem({ id: 'c', slug: 'istanbul' });
    const result = createItem(existing, newItem);
    expect(result[2].slug).toBe('istanbul-3');
  });

  it('orijinal diziyi değiştirmez (immutable)', () => {
    const items = [makeItem({ id: 'a', slug: 'a' })];
    const original = [...items];
    createItem(items, makeItem({ id: 'b', slug: 'b' }));
    expect(items).toEqual(original);
  });
});

describe('updateItem', () => {
  const now = new Date('2024-06-15T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('belirtilen alanları günceller', () => {
    const items = [makeItem({ id: 'item-001', status: 'draft' })];
    const result = updateItem(items, 'item-001', { status: 'published' });
    expect(result[0].status).toBe('published');
  });

  it('slug alanını korur (değiştirmez)', () => {
    const items = [makeItem({ id: 'item-001', slug: 'original-slug' })];
    const result = updateItem(items, 'item-001', {
      slug: 'changed-slug',
      status: 'published',
    } as Partial<ContentItem>);
    expect(result[0].slug).toBe('original-slug');
  });

  it('updatedAt zaman damgasını günceller', () => {
    const items = [makeItem({ id: 'item-001', updatedAt: '2024-01-01T00:00:00Z' })];
    const result = updateItem(items, 'item-001', { status: 'published' });
    expect(result[0].updatedAt).toBe(now.toISOString());
  });

  it('eşleşmeyen id için diziyi değiştirmez', () => {
    const items = [makeItem({ id: 'item-001' })];
    const result = updateItem(items, 'nonexistent', { status: 'published' });
    expect(result[0].status).toBe('draft');
  });

  it('orijinal diziyi değiştirmez (immutable)', () => {
    const items = [makeItem({ id: 'item-001' })];
    const original = items[0].status;
    updateItem(items, 'item-001', { status: 'published' });
    expect(items[0].status).toBe(original);
  });
});

describe('deleteItem', () => {
  it('id ile eşleşen öğeyi siler', () => {
    const items = [
      makeItem({ id: 'a', slug: 'a' }),
      makeItem({ id: 'b', slug: 'b' }),
    ];
    const result = deleteItem(items, 'a');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('b');
  });

  it('eşleşme yoksa diziyi olduğu gibi döndürür', () => {
    const items = [makeItem({ id: 'a', slug: 'a' })];
    const result = deleteItem(items, 'nonexistent');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('a');
  });

  it('boş dizide boş dizi döndürür', () => {
    const result = deleteItem([], 'any');
    expect(result).toHaveLength(0);
  });
});

describe('getItemById', () => {
  it('id ile eşleşen öğeyi döndürür', () => {
    const items = [
      makeItem({ id: 'a', slug: 'a' }),
      makeItem({ id: 'b', slug: 'b' }),
    ];
    const result = getItemById(items, 'b');
    expect(result).toBeDefined();
    expect(result!.id).toBe('b');
  });

  it('eşleşme yoksa undefined döndürür', () => {
    const items = [makeItem({ id: 'a', slug: 'a' })];
    const result = getItemById(items, 'nonexistent');
    expect(result).toBeUndefined();
  });
});

describe('getItemBySlug', () => {
  it('slug ile eşleşen öğeyi döndürür', () => {
    const items = [
      makeItem({ id: 'a', slug: 'istanbul' }),
      makeItem({ id: 'b', slug: 'paris' }),
    ];
    const result = getItemBySlug(items, 'paris');
    expect(result).toBeDefined();
    expect(result!.slug).toBe('paris');
  });

  it('eşleşme yoksa undefined döndürür', () => {
    const items = [makeItem({ id: 'a', slug: 'istanbul' })];
    const result = getItemBySlug(items, 'nonexistent');
    expect(result).toBeUndefined();
  });
});

describe('ensureUniqueSlug', () => {
  it('benzersiz slug olduğu gibi döner', () => {
    const items = [makeItem({ id: 'a', slug: 'istanbul' })];
    expect(ensureUniqueSlug(items, 'paris')).toBe('paris');
  });

  it('çakışma varsa -2 ekler', () => {
    const items = [makeItem({ id: 'a', slug: 'istanbul' })];
    expect(ensureUniqueSlug(items, 'istanbul')).toBe('istanbul-2');
  });

  it('ardışık çakışmalarda doğru sayı ekler', () => {
    const items = [
      makeItem({ id: 'a', slug: 'istanbul' }),
      makeItem({ id: 'b', slug: 'istanbul-2' }),
      makeItem({ id: 'c', slug: 'istanbul-3' }),
    ];
    expect(ensureUniqueSlug(items, 'istanbul')).toBe('istanbul-4');
  });

  it('excludeId ile kendi slug çakışmasını yok sayar', () => {
    const items = [makeItem({ id: 'a', slug: 'istanbul' })];
    expect(ensureUniqueSlug(items, 'istanbul', 'a')).toBe('istanbul');
  });

  it('boş dizide slug olduğu gibi döner', () => {
    expect(ensureUniqueSlug([], 'any-slug')).toBe('any-slug');
  });
});
