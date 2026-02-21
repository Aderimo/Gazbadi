import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContentCard from '@/components/ui/ContentCard';
import type { ContentItem } from '@/types';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

function makeItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: 'test-001',
    slug: 'istanbul',
    type: 'location',
    status: 'published',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    coverImage: '/images/locations/istanbul-cover.jpg',
    seo: {
      tr: { title: 'İstanbul Rehberi', description: 'İstanbul seyahat' },
      en: { title: 'Istanbul Guide', description: 'Istanbul travel' },
    },
    content: {
      tr: { title: 'İstanbul', summary: 'Doğu ile Batı\'nın buluştuğu şehir' },
      en: { title: 'Istanbul', summary: 'Where East meets West' },
    },
    ...overrides,
  };
}

describe('ContentCard', () => {
  it('başlık ve özeti render eder (TR)', () => {
    render(<ContentCard item={makeItem()} locale="tr" />);
    expect(screen.getByText('İstanbul')).toBeInTheDocument();
    expect(screen.getByText("Doğu ile Batı'nın buluştuğu şehir")).toBeInTheDocument();
  });

  it('İngilizce locale ile İngilizce içerik gösterir', () => {
    render(<ContentCard item={makeItem()} locale="en" />);
    expect(screen.getByText('Istanbul')).toBeInTheDocument();
    expect(screen.getByText('Where East meets West')).toBeInTheDocument();
  });

  it('cover image lazy loading ile render eder', () => {
    render(<ContentCard item={makeItem()} locale="tr" />);
    const img = screen.getByAltText('İstanbul');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('doğru detay URL\'ine link verir (location)', () => {
    render(<ContentCard item={makeItem()} locale="tr" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/location/istanbul');
  });

  it('blog tipi için doğru URL üretir', () => {
    render(<ContentCard item={makeItem({ type: 'blog', slug: 'first-post' })} locale="tr" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/blog/first-post');
  });

  it('friend-experience tipi için doğru URL üretir', () => {
    render(<ContentCard item={makeItem({ type: 'friend-experience', slug: 'ali-trip' })} locale="tr" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/friend-experiences/ali-trip');
  });

  it('type badge gösterir', () => {
    render(<ContentCard item={makeItem({ type: 'blog' })} locale="tr" />);
    expect(screen.getByText('Blog')).toBeInTheDocument();
  });

  it('type badge İngilizce locale ile doğru label gösterir', () => {
    render(<ContentCard item={makeItem({ type: 'location' })} locale="en" />);
    expect(screen.getByText('Location')).toBeInTheDocument();
  });

  it('compact variant özeti gizler', () => {
    render(<ContentCard item={makeItem()} locale="tr" variant="compact" />);
    expect(screen.getByText('İstanbul')).toBeInTheDocument();
    expect(screen.queryByText("Doğu ile Batı'nın buluştuğu şehir")).not.toBeInTheDocument();
  });

  it('featured variant başlık ve özeti gösterir', () => {
    render(<ContentCard item={makeItem()} locale="tr" variant="featured" />);
    expect(screen.getByText('İstanbul')).toBeInTheDocument();
    expect(screen.getByText("Doğu ile Batı'nın buluştuğu şehir")).toBeInTheDocument();
  });

  it('İngilizce çeviri eksikse Türkçe fallback kullanır', () => {
    const item = makeItem({
      content: {
        tr: { title: 'Türkçe Başlık', summary: 'Türkçe Özet' },
        en: { title: '', summary: '' },
      },
    });
    render(<ContentCard item={item} locale="en" />);
    expect(screen.getByText('Türkçe Başlık')).toBeInTheDocument();
  });
});
