'use client';

import type { ContentItem } from '@/types';

const STORE_KEY = 'travel_atlas_items';
const TRASH_KEY = 'travel_atlas_trash';
const MAX_TRASH = 10;

/**
 * localStorage'dan tüm içerikleri oku.
 * İlk açılışta server-side JSON verilerini seed olarak kullan.
 */
export function getStoredItems(serverItems: ContentItem[]): ContentItem[] {
  if (typeof window === 'undefined') return serverItems;

  const stored = localStorage.getItem(STORE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as ContentItem[];
    } catch {
      return serverItems;
    }
  }

  // İlk açılış — server verisini localStorage'a kaydet
  localStorage.setItem(STORE_KEY, JSON.stringify(serverItems));
  return serverItems;
}

/**
 * İçerikleri localStorage'a kaydet.
 */
export function saveItems(items: ContentItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORE_KEY, JSON.stringify(items));
}

/**
 * Yeni içerik ekle.
 */
export function addItem(items: ContentItem[], newItem: ContentItem): ContentItem[] {
  const updated = [...items, newItem];
  saveItems(updated);
  return updated;
}

/**
 * İçerik güncelle.
 */
export function editItem(items: ContentItem[], id: string, updates: Partial<ContentItem>): ContentItem[] {
  const updated = items.map((item) => {
    if (item.id !== id) return item;
    const { slug: _s, ...safe } = updates;
    return { ...item, ...safe, slug: item.slug, updatedAt: new Date().toISOString() };
  });
  saveItems(updated);
  return updated;
}

/**
 * İçerik sil — çöp kutusuna taşı (FIFO, max 10).
 */
export function removeItem(items: ContentItem[], id: string): ContentItem[] {
  const item = items.find((i) => i.id === id);
  if (item) {
    const trash = getTrash();
    trash.push({ ...item, deletedAt: new Date().toISOString() });
    // FIFO: 10'dan fazlaysa en eskiyi kalıcı sil
    while (trash.length > MAX_TRASH) trash.shift();
    saveTrash(trash);
  }
  const updated = items.filter((i) => i.id !== id);
  saveItems(updated);
  return updated;
}

// --- Çöp Kutusu ---

export interface TrashedItem extends ContentItem {
  deletedAt: string;
}

export function getTrash(): TrashedItem[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(TRASH_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as TrashedItem[];
  } catch {
    return [];
  }
}

export function saveTrash(trash: TrashedItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TRASH_KEY, JSON.stringify(trash));
}

/**
 * Çöp kutusundan geri al.
 */
export function restoreItem(items: ContentItem[], trashId: string): { items: ContentItem[]; trash: TrashedItem[] } {
  const trash = getTrash();
  const idx = trash.findIndex((t) => t.id === trashId);
  if (idx === -1) return { items, trash };

  const [restored] = trash.splice(idx, 1);
  const { deletedAt: _d, ...cleanItem } = restored;
  const updatedItems = [...items, cleanItem as ContentItem];

  saveItems(updatedItems);
  saveTrash(trash);
  return { items: updatedItems, trash };
}

/**
 * Çöp kutusundan kalıcı sil.
 */
export function permanentDelete(trashId: string): TrashedItem[] {
  const trash = getTrash();
  const updated = trash.filter((t) => t.id !== trashId);
  saveTrash(updated);
  return updated;
}

/**
 * Çöp kutusunu tamamen boşalt.
 */
export function emptyTrash(): TrashedItem[] {
  saveTrash([]);
  return [];
}
