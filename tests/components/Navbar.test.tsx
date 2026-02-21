import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from '@/components/layout/Navbar';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

// Mock useLanguage
const mockSetLocale = vi.fn();
let mockLocale: 'tr' | 'en' = 'tr';

vi.mock('@/components/providers/LanguageProvider', () => ({
  useLanguage: () => ({
    locale: mockLocale,
    setLocale: mockSetLocale,
    t: (key: string) => {
      const translations: Record<string, Record<string, string>> = {
        tr: {
          'nav.home': 'Ana Sayfa',
          'nav.explore': 'Keşfet',
          'nav.myRecommendations': 'Önerilerim',
          'nav.friendExperiences': 'Arkadaş Deneyimleri',
          'nav.blog': 'Blog',
        },
        en: {
          'nav.home': 'Home',
          'nav.explore': 'Explore',
          'nav.myRecommendations': 'My Recommendations',
          'nav.friendExperiences': 'Friend Experiences',
          'nav.blog': 'Blog',
        },
      };
      return translations[mockLocale][key] ?? key;
    },
  }),
}));

describe('Navbar', () => {
  beforeEach(() => {
    mockLocale = 'tr';
    mockSetLocale.mockClear();
  });

  it('brand text "TravelAtlas" render eder', () => {
    render(<Navbar />);
    expect(screen.getByText('Travel')).toBeInTheDocument();
    expect(screen.getByText('Atlas')).toBeInTheDocument();
  });

  it('tüm navigasyon linklerini Türkçe render eder', () => {
    render(<Navbar />);
    expect(screen.getAllByText('Ana Sayfa').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Keşfet').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Önerilerim').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Arkadaş Deneyimleri').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Blog').length).toBeGreaterThanOrEqual(1);
  });

  it('İngilizce locale ile İngilizce linkler gösterir', () => {
    mockLocale = 'en';
    render(<Navbar />);
    expect(screen.getAllByText('Home').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Explore').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('My Recommendations').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Friend Experiences').length).toBeGreaterThanOrEqual(1);
  });

  it('doğru href değerlerini içerir', () => {
    render(<Navbar />);
    const links = screen.getAllByRole('link');
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/');
    expect(hrefs).toContain('/explore');
    expect(hrefs).toContain('/my-recommendations');
    expect(hrefs).toContain('/friend-experiences');
    expect(hrefs).toContain('/blog');
  });

  it('dil değiştirme butonları mevcut', () => {
    render(<Navbar />);
    expect(screen.getByLabelText('Türkçe')).toBeInTheDocument();
    expect(screen.getByLabelText('English')).toBeInTheDocument();
  });

  it('EN butonuna tıklayınca setLocale("en") çağrılır', () => {
    render(<Navbar />);
    fireEvent.click(screen.getByLabelText('English'));
    expect(mockSetLocale).toHaveBeenCalledWith('en');
  });

  it('TR butonuna tıklayınca setLocale("tr") çağrılır', () => {
    render(<Navbar />);
    fireEvent.click(screen.getByLabelText('Türkçe'));
    expect(mockSetLocale).toHaveBeenCalledWith('tr');
  });

  it('aktif dil butonu vurgulanır (aria-pressed)', () => {
    render(<Navbar />);
    expect(screen.getByLabelText('Türkçe')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('English')).toHaveAttribute('aria-pressed', 'false');
  });

  it('hamburger menü butonu mobilde mevcut', () => {
    render(<Navbar />);
    expect(screen.getByLabelText('Toggle menu')).toBeInTheDocument();
  });

  it('hamburger tıklanınca mobil menü açılır', () => {
    render(<Navbar />);
    const toggle = screen.getByLabelText('Toggle menu');
    fireEvent.click(toggle);
    // Mobile menu renders duplicate links
    expect(screen.getAllByText('Ana Sayfa').length).toBeGreaterThanOrEqual(2);
  });

  it('mobil menüde link tıklanınca menü kapanır', () => {
    render(<Navbar />);
    fireEvent.click(screen.getByLabelText('Toggle menu'));
    // Click a mobile link
    const mobileLinks = screen.getAllByText('Keşfet');
    fireEvent.click(mobileLinks[mobileLinks.length - 1]);
    // After closing, only desktop links remain
    expect(screen.getAllByText('Keşfet').length).toBe(1);
  });

  it('nav landmark role mevcut', () => {
    render(<Navbar />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
