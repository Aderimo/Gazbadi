'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { LanguageContextValue, Translations } from '@/types';

import trTranslations from '../../../data/i18n/tr.json';
import enTranslations from '../../../data/i18n/en.json';

const translations: Record<'tr' | 'en', Translations> = {
  tr: trTranslations,
  en: enTranslations,
};

const STORAGE_KEY = 'travel-atlas-locale';

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function getNestedValue(obj: Translations, path: string): string {
  const keys = path.split('.');
  let current: string | Translations = obj;

  for (const key of keys) {
    if (typeof current !== 'object' || current === null) {
      return path;
    }
    const value: string | Translations | undefined = (current as Translations)[key];
    if (value === undefined) {
      return path;
    }
    current = value;
  }

  return typeof current === 'string' ? current : path;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<'tr' | 'en'>('tr');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'tr' || stored === 'en') {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = useCallback((newLocale: 'tr' | 'en') => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  }, []);

  const t = useCallback(
    (key: string): string => getNestedValue(translations[locale], key),
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
