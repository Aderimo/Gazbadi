import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDashboardClient from '../../src/app/admin/AdminDashboardClient';
import type { ContentItem } from '../../src/types';

// Mock next/navigation
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

// Mock auth
vi.mock('../../src/lib/auth', () => ({
  isAuthenticated: () => true,
  logout: vi.fn(),
}));

// Mock LanguageProvider
vi.mock('../../src/components/providers/LanguageProvider', () => ({
  useLanguage: () => ({
    locale: 'en' as const,
    setLocale: vi.fn(),
    t: (key: string) => {
      const map: Record<string, string> = {
        'admin.dashboard': 'Dashboard',
        'admin.logout': 'Logout',
        'admin.totalItems': 'Total Items',
        'admin.published': 'Published',
        'admin.draft': 'Draft',
        'admin.unpublished': 'Unpublished',
        'admin.createNew': 'Create New',
        'admin.contentList': 'Content List',
        'admin.noContent': 'No content found.',
        'admin.title': 'Title',
        'admin.type': 'Type',
        'admin.status': 'Status',
        'admin.date': 'Date',
        'admin.actions': 'Actions',
        'admin.location': 'Location',
        'admin.blog': 'Blog',
        'admin.recommendation': 'Recommendation',
        'admin.friendExperience': 'Friend Experience',
        'admin.edit': 'Edit',
        'admin.delete': 'Delete',
      };
      return map[key] ?? key;
    },
  }),
}));

function makeItem(overrides: Partial<ContentItem> = {}): ContentItem {
  return {
    id: 'test-1',
    slug: 'test-item',
    type: 'location',
    status: 'published',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    coverImage: '/images/test.jpg',
    seo: {
      tr: { title: 'Test TR', description: 'Desc TR' },
      en: { title: 'Test EN', description: 'Desc EN' },
    },
    content: {
      tr: { title: 'Test Başlık', summary: 'Özet TR' },
      en: { title: 'Test Title', summary: 'Summary EN' },
    },
    ...overrides,
  };
}

beforeEach(() => {
  pushMock.mockClear();
});

describe('AdminDashboardClient', () => {
  it('header ve logout butonu render eder', () => {
    render(<AdminDashboardClient items={[]} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('boş içerik durumunda mesaj gösterir', () => {
    render(<AdminDashboardClient items={[]} />);
    expect(screen.getByText('No content found.')).toBeInTheDocument();
  });

  it('istatistik kartlarını doğru sayılarla gösterir', () => {
    const items = [
      makeItem({ id: '1', status: 'published' }),
      makeItem({ id: '2', status: 'published' }),
      makeItem({ id: '3', status: 'draft' }),
      makeItem({ id: '4', status: 'unpublished' }),
    ];
    render(<AdminDashboardClient items={items} />);

    expect(screen.getByText('4')).toBeInTheDocument(); // total
    expect(screen.getByText('2')).toBeInTheDocument(); // published
    expect(screen.getAllByText('1').length).toBe(2); // draft=1, unpublished=1
  });

  it('4 içerik türü için oluşturma butonları render eder', () => {
    render(<AdminDashboardClient items={[]} />);
    expect(screen.getByText('+ Location')).toBeInTheDocument();
    expect(screen.getByText('+ Blog')).toBeInTheDocument();
    expect(screen.getByText('+ Recommendation')).toBeInTheDocument();
    expect(screen.getByText('+ Friend Experience')).toBeInTheDocument();
  });

  it('içerik listesinde başlık, tür ve durum badge gösterir', () => {
    const items = [
      makeItem({ id: '1', type: 'location', status: 'published' }),
      makeItem({ id: '2', slug: 'blog-1', type: 'blog', status: 'draft', content: { tr: { title: 'Blog TR', summary: 's' }, en: { title: 'My Blog Post', summary: 's' } } }),
    ];
    render(<AdminDashboardClient items={items} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('My Blog Post')).toBeInTheDocument();
    // Type badges
    expect(screen.getAllByText('Location').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Blog').length).toBeGreaterThanOrEqual(1);
    // Status badges
    expect(screen.getAllByText('Published').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Draft').length).toBeGreaterThanOrEqual(1);
  });

  it('her içerik satırında edit ve delete butonları bulunur', () => {
    render(<AdminDashboardClient items={[makeItem()]} />);
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('logout butonuna tıklanınca ana sayfaya yönlendirir', async () => {
    const { logout: logoutFn } = await import('../../src/lib/auth');
    render(<AdminDashboardClient items={[]} />);

    fireEvent.click(screen.getByText('Logout'));
    expect(logoutFn).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith('/');
  });
});
