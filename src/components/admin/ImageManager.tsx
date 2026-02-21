'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import type { ImageManagerProps } from '@/types';

type Tab = 'upload' | 'url' | 'search';

interface SearchResult {
  id: string;
  url: string;
  thumb: string;
  alt: string;
  author: string;
}

// Simulated search results for Unsplash/Pexels (static export — no real backend)
const MOCK_RESULTS: SearchResult[] = [
  { id: '1', url: '/images/stock/travel-1.jpg', thumb: '/images/stock/travel-1.jpg', alt: 'Mountain landscape', author: 'John Doe' },
  { id: '2', url: '/images/stock/travel-2.jpg', thumb: '/images/stock/travel-2.jpg', alt: 'Beach sunset', author: 'Jane Smith' },
  { id: '3', url: '/images/stock/travel-3.jpg', thumb: '/images/stock/travel-3.jpg', alt: 'City skyline', author: 'Alex Turner' },
  { id: '4', url: '/images/stock/travel-4.jpg', thumb: '/images/stock/travel-4.jpg', alt: 'Forest path', author: 'Maria Garcia' },
  { id: '5', url: '/images/stock/travel-5.jpg', thumb: '/images/stock/travel-5.jpg', alt: 'Desert dunes', author: 'Sam Wilson' },
  { id: '6', url: '/images/stock/travel-6.jpg', thumb: '/images/stock/travel-6.jpg', alt: 'Snowy peaks', author: 'Lena Park' },
];

function simulateSearch(query: string): Promise<SearchResult[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!query.trim()) return resolve([]);
      const q = query.toLowerCase();
      const filtered = MOCK_RESULTS.filter(
        (r) => r.alt.toLowerCase().includes(q) || r.author.toLowerCase().includes(q)
      );
      resolve(filtered.length > 0 ? filtered : MOCK_RESULTS.slice(0, 3));
    }, 600);
  });
}

export default function ImageManager({ onImageSelect, currentImage }: ImageManagerProps) {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [urlValue, setUrlValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      // In a real app this would upload to a server; for static export we use a local object URL
      const objectUrl = URL.createObjectURL(file);
      onImageSelect(objectUrl);
    },
    [onImageSelect]
  );

  const handleUrlSubmit = useCallback(() => {
    if (urlValue.trim()) {
      onImageSelect(urlValue.trim());
    }
  }, [urlValue, onImageSelect]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await simulateSearch(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  }, [searchQuery]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSearch();
    },
    [handleSearch]
  );

  const tabs: { key: Tab; label: string }[] = [
    { key: 'upload', label: t('admin.uploadImage') },
    { key: 'url', label: t('admin.imageUrl') },
    { key: 'search', label: t('admin.searchImages') },
  ];

  return (
    <div className="space-y-5">
      {/* Current image preview */}
      {currentImage && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
            {t('admin.currentImage')}
          </label>
          <div className="relative h-40 overflow-hidden rounded-xl border border-white/10">
            <img
              src={currentImage}
              alt="current"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-white/5 bg-white/[0.02] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            data-testid={`tab-${tab.key}`}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all sm:text-sm ${
              activeTab === tab.key
                ? 'bg-accent-turquoise/15 text-accent-turquoise'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Upload tab */}
      {activeTab === 'upload' && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] py-12 transition-colors hover:border-accent-turquoise/40"
        >
          <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <span className="text-sm text-gray-400">{t('admin.dragOrClick')}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            data-testid="file-input"
          />
        </div>
      )}

      {/* URL tab */}
      {activeTab === 'url' && (
        <div className="flex gap-2">
          <input
            type="text"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            placeholder={t('admin.enterImageUrl')}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-200 outline-none transition-colors placeholder:text-gray-600 focus:border-accent-turquoise"
            data-testid="url-input"
          />
          <button
            onClick={handleUrlSubmit}
            className="rounded-lg bg-accent-turquoise/20 px-4 py-2.5 text-sm font-medium text-accent-turquoise transition-all hover:bg-accent-turquoise/30 active:scale-95"
          >
            {t('admin.useThisImage')}
          </button>
        </div>
      )}

      {/* Search tab */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={t('admin.searchPlaceholder')}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-200 outline-none transition-colors placeholder:text-gray-600 focus:border-accent-turquoise"
              data-testid="search-input"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="rounded-lg bg-accent-indigo/20 px-4 py-2.5 text-sm font-medium text-accent-indigo transition-all hover:bg-accent-indigo/30 active:scale-95 disabled:opacity-50"
            >
              {isSearching ? t('admin.searching') : t('admin.searchImages')}
            </button>
          </div>

          {/* Results grid */}
          {searchResults.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => onImageSelect(result.url)}
                  className="group relative overflow-hidden rounded-lg border border-white/10 transition-all hover:border-accent-turquoise/50"
                >
                  <div className="aspect-[4/3] bg-dark-secondary">
                    <img
                      src={result.thumb}
                      alt={result.alt}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="p-2 text-xs text-gray-300">{result.author}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {searchResults.length === 0 && searchQuery && !isSearching && (
            <p className="text-center text-sm text-gray-500">{t('admin.noResults')}</p>
          )}
        </div>
      )}
    </div>
  );
}
