import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RoutePointEditor from '@/components/admin/RoutePointEditor';
import type { RoutePoint } from '@/types';

// Mock LanguageProvider
vi.mock('@/components/providers/LanguageProvider', () => ({
  useLanguage: () => ({
    locale: 'tr' as const,
    setLocale: vi.fn(),
    t: (key: string) => {
      const map: Record<string, string> = {
        'admin.routePoints': 'Rota Noktaları',
        'admin.addRoutePoint': 'Nokta Ekle',
        'admin.pointName': 'Nokta Adı',
        'admin.pointDescription': 'Açıklama',
        'admin.pointTips': 'İpuçları',
        'admin.moveUp': 'Yukarı',
        'admin.moveDown': 'Aşağı',
        'admin.removePoint': 'Kaldır',
        'admin.noContent': 'Henüz içerik bulunmuyor.',
        'admin.latitude': 'Enlem',
        'admin.longitude': 'Boylam',
      };
      return map[key] ?? key;
    },
  }),
}));

function makePoint(overrides: Partial<RoutePoint> = {}): RoutePoint {
  return {
    name: 'Ayasofya',
    coordinates: { lat: 41.0086, lng: 28.9802 },
    description: 'Bizans bazilika',
    tips: 'Sabah erken gidin',
    order: 1,
    ...overrides,
  };
}

describe('RoutePointEditor', () => {
  let onChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onChange = vi.fn();
  });

  it('boş durum mesajı gösterir (rota noktası yokken)', () => {
    render(<RoutePointEditor routePoints={[]} onRoutePointsChange={onChange} />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('Rota Noktaları')).toBeInTheDocument();
  });

  it('mevcut rota noktalarını render eder', () => {
    const points = [
      makePoint({ name: 'Ayasofya', order: 1 }),
      makePoint({ name: 'Sultanahmet', order: 2 }),
    ];
    render(<RoutePointEditor routePoints={points} onRoutePointsChange={onChange} />);

    expect(screen.getByText('Ayasofya')).toBeInTheDocument();
    expect(screen.getByText('Sultanahmet')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
  });

  it('yeni nokta eklendiğinde onRoutePointsChange çağrılır', () => {
    render(<RoutePointEditor routePoints={[]} onRoutePointsChange={onChange} />);

    fireEvent.change(screen.getByTestId('new-point-name'), { target: { value: 'Topkapı' } });
    fireEvent.change(screen.getByTestId('new-point-description'), { target: { value: 'Saray' } });
    fireEvent.change(screen.getByTestId('new-point-tips'), { target: { value: 'Harem ayrı bilet' } });
    fireEvent.change(screen.getByTestId('new-point-lat'), { target: { value: '41.0115' } });
    fireEvent.change(screen.getByTestId('new-point-lng'), { target: { value: '28.9833' } });

    fireEvent.click(screen.getByTestId('add-point-btn'));

    expect(onChange).toHaveBeenCalledTimes(1);
    const result = onChange.mock.calls[0][0] as RoutePoint[];
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Topkapı');
    expect(result[0].order).toBe(1);
    expect(result[0].coordinates.lat).toBeCloseTo(41.0115);
  });

  it('nokta silindiğinde onRoutePointsChange çağrılır ve order güncellenir', () => {
    const points = [
      makePoint({ name: 'A', order: 1 }),
      makePoint({ name: 'B', order: 2 }),
      makePoint({ name: 'C', order: 3 }),
    ];
    render(<RoutePointEditor routePoints={points} onRoutePointsChange={onChange} />);

    fireEvent.click(screen.getByTestId('remove-1'));

    expect(onChange).toHaveBeenCalledTimes(1);
    const result = onChange.mock.calls[0][0] as RoutePoint[];
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('A');
    expect(result[0].order).toBe(1);
    expect(result[1].name).toBe('C');
    expect(result[1].order).toBe(2);
  });

  it('yukarı taşıma doğru sıralama yapar', () => {
    const points = [
      makePoint({ name: 'A', order: 1 }),
      makePoint({ name: 'B', order: 2 }),
    ];
    render(<RoutePointEditor routePoints={points} onRoutePointsChange={onChange} />);

    fireEvent.click(screen.getByTestId('move-up-1'));

    expect(onChange).toHaveBeenCalledTimes(1);
    const result = onChange.mock.calls[0][0] as RoutePoint[];
    expect(result[0].name).toBe('B');
    expect(result[0].order).toBe(1);
    expect(result[1].name).toBe('A');
    expect(result[1].order).toBe(2);
  });

  it('aşağı taşıma doğru sıralama yapar', () => {
    const points = [
      makePoint({ name: 'A', order: 1 }),
      makePoint({ name: 'B', order: 2 }),
    ];
    render(<RoutePointEditor routePoints={points} onRoutePointsChange={onChange} />);

    fireEvent.click(screen.getByTestId('move-down-0'));

    expect(onChange).toHaveBeenCalledTimes(1);
    const result = onChange.mock.calls[0][0] as RoutePoint[];
    expect(result[0].name).toBe('B');
    expect(result[0].order).toBe(1);
    expect(result[1].name).toBe('A');
    expect(result[1].order).toBe(2);
  });

  it('ilk elemanın yukarı butonu tıklanınca onChange çağrılmaz', () => {
    const points = [makePoint({ name: 'A', order: 1 })];
    render(<RoutePointEditor routePoints={points} onRoutePointsChange={onChange} />);

    fireEvent.click(screen.getByTestId('move-up-0'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('son elemanın aşağı butonu tıklanınca onChange çağrılmaz', () => {
    const points = [makePoint({ name: 'A', order: 1 })];
    render(<RoutePointEditor routePoints={points} onRoutePointsChange={onChange} />);

    fireEvent.click(screen.getByTestId('move-down-0'));
    expect(onChange).not.toHaveBeenCalled();
  });
});
