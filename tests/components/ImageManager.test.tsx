import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImageManager from '@/components/admin/ImageManager';

// Mock LanguageProvider
vi.mock('@/components/providers/LanguageProvider', () => ({
  useLanguage: () => ({
    locale: 'tr' as const,
    setLocale: vi.fn(),
    t: (key: string) => {
      const map: Record<string, string> = {
        'admin.imageManager': 'Görsel Yöneticisi',
        'admin.uploadImage': 'Yükle',
        'admin.imageUrl': 'URL',
        'admin.searchImages': 'Ara',
        'admin.searchPlaceholder': 'Görsel ara...',
        'admin.enterImageUrl': 'Görsel URL\'si girin',
        'admin.selectImage': 'Seç',
        'admin.currentImage': 'Mevcut Görsel',
        'admin.noResults': 'Sonuç bulunamadı',
        'admin.searching': 'Aranıyor...',
        'admin.chooseFile': 'Dosya Seç',
        'admin.dragOrClick': 'Sürükle veya tıkla',
        'admin.useThisImage': 'Bu Görseli Kullan',
      };
      return map[key] ?? key;
    },
  }),
}));

describe('ImageManager', () => {
  let onImageSelect: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onImageSelect = vi.fn();
  });

  it('mevcut görsel varsa önizleme gösterir', () => {
    render(<ImageManager onImageSelect={onImageSelect} currentImage="/images/test.jpg" />);
    expect(screen.getByText('Mevcut Görsel')).toBeInTheDocument();
    const img = screen.getByAltText('current');
    expect(img).toHaveAttribute('src', '/images/test.jpg');
  });

  it('mevcut görsel yoksa önizleme göstermez', () => {
    render(<ImageManager onImageSelect={onImageSelect} />);
    expect(screen.queryByText('Mevcut Görsel')).not.toBeInTheDocument();
  });

  it('üç tab gösterir: Yükle, URL, Ara', () => {
    render(<ImageManager onImageSelect={onImageSelect} />);
    expect(screen.getByText('Yükle')).toBeInTheDocument();
    expect(screen.getByText('URL')).toBeInTheDocument();
    expect(screen.getByText('Ara')).toBeInTheDocument();
  });

  it('URL tabına geçiş yapılabilir ve input görünür', () => {
    render(<ImageManager onImageSelect={onImageSelect} />);
    fireEvent.click(screen.getByTestId('tab-url'));
    expect(screen.getByTestId('url-input')).toBeInTheDocument();
  });

  it('URL girip "Bu Görseli Kullan" tıklanınca onImageSelect çağrılır', () => {
    render(<ImageManager onImageSelect={onImageSelect} />);
    fireEvent.click(screen.getByTestId('tab-url'));

    const input = screen.getByTestId('url-input');
    fireEvent.change(input, { target: { value: 'https://example.com/photo.jpg' } });
    fireEvent.click(screen.getByText('Bu Görseli Kullan'));

    expect(onImageSelect).toHaveBeenCalledWith('https://example.com/photo.jpg');
  });

  it('arama tabına geçiş yapılabilir ve search input görünür', () => {
    render(<ImageManager onImageSelect={onImageSelect} />);
    fireEvent.click(screen.getByTestId('tab-search'));
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  it('arama yapılınca sonuçlar gösterilir', async () => {
    render(<ImageManager onImageSelect={onImageSelect} />);
    fireEvent.click(screen.getByTestId('tab-search'));

    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'mountain' } });
    fireEvent.click(screen.getAllByText('Ara')[1]); // search button (second "Ara")

    await waitFor(() => {
      expect(screen.getByAltText('Mountain landscape')).toBeInTheDocument();
    });
  });

  it('arama sonucuna tıklanınca onImageSelect çağrılır', async () => {
    render(<ImageManager onImageSelect={onImageSelect} />);
    fireEvent.click(screen.getByTestId('tab-search'));

    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'mountain' } });
    fireEvent.click(screen.getAllByText('Ara')[1]);

    await waitFor(() => {
      expect(screen.getByAltText('Mountain landscape')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByAltText('Mountain landscape').closest('button')!);
    expect(onImageSelect).toHaveBeenCalledWith('/images/stock/travel-1.jpg');
  });

  it('varsayılan olarak upload tabı aktiftir', () => {
    render(<ImageManager onImageSelect={onImageSelect} />);
    expect(screen.getByText('Sürükle veya tıkla')).toBeInTheDocument();
  });

  it('dosya seçilince onImageSelect çağrılır', () => {
    // Mock URL.createObjectURL
    const mockUrl = 'blob:http://localhost/test-image';
    global.URL.createObjectURL = vi.fn(() => mockUrl);

    render(<ImageManager onImageSelect={onImageSelect} />);
    const fileInput = screen.getByTestId('file-input');

    const file = new File(['test'], 'photo.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(onImageSelect).toHaveBeenCalledWith(mockUrl);
  });
});
