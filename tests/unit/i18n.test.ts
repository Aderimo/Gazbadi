import { describe, it, expect, beforeEach } from 'vitest';
import trTranslations from '../../data/i18n/tr.json';
import enTranslations from '../../data/i18n/en.json';
import type { Translations } from '@/types';

// Helper: replicates the getNestedValue logic from LanguageProvider
function getNestedValue(obj: Translations, path: string): string {
  const keys = path.split('.');
  let current: string | Translations = obj;

  for (const key of keys) {
    if (typeof current !== 'object' || current === null) {
      return path;
    }
    const value = current[key];
    if (value === undefined) {
      return path;
    }
    current = value;
  }

  return typeof current === 'string' ? current : path;
}

describe('i18n Translation Files', () => {
  it('tr.json and en.json should have the same top-level keys', () => {
    const trKeys = Object.keys(trTranslations).sort();
    const enKeys = Object.keys(enTranslations).sort();
    expect(trKeys).toEqual(enKeys);
  });

  it('tr.json and en.json should have the same nested structure', () => {
    function getKeyPaths(obj: Record<string, unknown>, prefix = ''): string[] {
      const paths: string[] = [];
      for (const key of Object.keys(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        if (typeof value === 'object' && value !== null) {
          paths.push(...getKeyPaths(value as Record<string, unknown>, fullKey));
        } else {
          paths.push(fullKey);
        }
      }
      return paths;
    }

    const trPaths = getKeyPaths(trTranslations).sort();
    const enPaths = getKeyPaths(enTranslations).sort();
    expect(trPaths).toEqual(enPaths);
  });

  it('all leaf values should be non-empty strings', () => {
    function checkLeafValues(obj: Record<string, unknown>, lang: string, prefix = '') {
      for (const key of Object.keys(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        if (typeof value === 'object' && value !== null) {
          checkLeafValues(value as Record<string, unknown>, lang, fullKey);
        } else {
          expect(value, `${lang}:${fullKey} should be a non-empty string`).toBeTypeOf('string');
          expect((value as string).length, `${lang}:${fullKey} should not be empty`).toBeGreaterThan(0);
        }
      }
    }

    checkLeafValues(trTranslations, 'tr');
    checkLeafValues(enTranslations, 'en');
  });
});

describe('getNestedValue (t function logic)', () => {
  it('should resolve top-level nested keys with dot notation', () => {
    expect(getNestedValue(trTranslations, 'nav.home')).toBe('Ana Sayfa');
    expect(getNestedValue(enTranslations, 'nav.home')).toBe('Home');
  });

  it('should resolve deeply nested keys', () => {
    expect(getNestedValue(trTranslations, 'hero.slogan')).toBe('Dünyayı Keşfet, Anılarını Paylaş');
    expect(getNestedValue(enTranslations, 'hero.slogan')).toBe('Explore the World, Share Your Memories');
  });

  it('should return the key itself when key is not found', () => {
    expect(getNestedValue(trTranslations, 'nonexistent.key')).toBe('nonexistent.key');
    expect(getNestedValue(trTranslations, 'nav.nonexistent')).toBe('nav.nonexistent');
  });

  it('should return the key when accessing a non-leaf node', () => {
    expect(getNestedValue(trTranslations, 'nav')).toBe('nav');
  });

  it('should handle all admin keys correctly', () => {
    expect(getNestedValue(trTranslations, 'admin.login')).toBe('Giriş Yap');
    expect(getNestedValue(enTranslations, 'admin.login')).toBe('Login');
    expect(getNestedValue(trTranslations, 'admin.publish')).toBe('Yayınla');
    expect(getNestedValue(enTranslations, 'admin.publish')).toBe('Publish');
  });
});

describe('localStorage language persistence', () => {
  const STORAGE_KEY = 'travel-atlas-locale';

  beforeEach(() => {
    localStorage.clear();
  });

  it('should store and retrieve locale from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, 'en');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('en');
  });

  it('should default to no stored value initially', () => {
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('should overwrite previous locale', () => {
    localStorage.setItem(STORAGE_KEY, 'tr');
    localStorage.setItem(STORAGE_KEY, 'en');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('en');
  });
});
