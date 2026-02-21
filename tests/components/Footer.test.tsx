import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from '@/components/layout/Footer';

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
          'footer.contact': 'İletişim',
          'footer.followUs': 'Bizi Takip Edin',
        },
        en: {
          'footer.contact': 'Contact',
          'footer.followUs': 'Follow Us',
        },
      };
      return translations[mockLocale][key] ?? key;
    },
  }),
}));

describe('Footer', () => {
  beforeEach(() => {
    mockLocale = 'tr';
    mockSetLocale.mockClear();
  });

  it('footer landmark role render eder', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('brand text "TravelAtlas" render eder', () => {
    render(<Footer />);
    expect(screen.getByText('Travel')).toBeInTheDocument();
    expect(screen.getByText('Atlas')).toBeInTheDocument();
  });

  it('iletişim başlığını Türkçe gösterir', () => {
    render(<Footer />);
    expect(screen.getByText('İletişim')).toBeInTheDocument();
  });

  it('iletişim başlığını İngilizce gösterir', () => {
    mockLocale = 'en';
    render(<Footer />);
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('email linkini render eder', () => {
    render(<Footer />);
    const emailLink = screen.getByText('hello@travelatlas.com');
    expect(emailLink).toBeInTheDocument();
    expect(emailLink.closest('a')).toHaveAttribute('href', 'mailto:hello@travelatlas.com');
  });

  it('sosyal medya başlığını Türkçe gösterir', () => {
    render(<Footer />);
    expect(screen.getByText('Bizi Takip Edin')).toBeInTheDocument();
  });

  it('sosyal medya başlığını İngilizce gösterir', () => {
    mockLocale = 'en';
    render(<Footer />);
    expect(screen.getByText('Follow Us')).toBeInTheDocument();
  });

  it('Instagram, X ve YouTube sosyal medya linklerini render eder', () => {
    render(<Footer />);
    expect(screen.getByLabelText('Instagram')).toBeInTheDocument();
    expect(screen.getByLabelText('X')).toBeInTheDocument();
    expect(screen.getByLabelText('YouTube')).toBeInTheDocument();
  });

  it('sosyal medya linkleri yeni sekmede açılır', () => {
    render(<Footer />);
    const igLink = screen.getByLabelText('Instagram');
    expect(igLink).toHaveAttribute('target', '_blank');
    expect(igLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('dil değiştirme butonları mevcut', () => {
    render(<Footer />);
    expect(screen.getByLabelText('Türkçe')).toBeInTheDocument();
    expect(screen.getByLabelText('English')).toBeInTheDocument();
  });

  it('EN butonuna tıklayınca setLocale("en") çağrılır', () => {
    render(<Footer />);
    fireEvent.click(screen.getByLabelText('English'));
    expect(mockSetLocale).toHaveBeenCalledWith('en');
  });

  it('TR butonuna tıklayınca setLocale("tr") çağrılır', () => {
    render(<Footer />);
    fireEvent.click(screen.getByLabelText('Türkçe'));
    expect(mockSetLocale).toHaveBeenCalledWith('tr');
  });

  it('aktif dil butonu vurgulanır (aria-pressed)', () => {
    render(<Footer />);
    expect(screen.getByLabelText('Türkçe')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('English')).toHaveAttribute('aria-pressed', 'false');
  });

  it('copyright metnini render eder', () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(screen.getByText(`© ${year} Travel Atlas`)).toBeInTheDocument();
  });

  it('border-top separator sınıfı mevcut', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer.className).toContain('border-t');
  });
});
