import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import MapCoordinatePicker from '@/components/admin/MapCoordinatePicker';

// Mock LanguageProvider
vi.mock('@/components/providers/LanguageProvider', () => ({
  useLanguage: () => ({
    locale: 'tr' as const,
    setLocale: vi.fn(),
    t: (key: string) => {
      const map: Record<string, string> = {
        'admin.coordinatePicker': 'Koordinat Seçici',
        'admin.latitude': 'Enlem',
        'admin.longitude': 'Boylam',
        'admin.clickToSelect': 'Haritaya tıklayarak koordinat seçin',
      };
      return map[key] ?? key;
    },
  }),
}));

// Mock the dynamic Leaflet component
let capturedOnChange: ((coords: { lat: number; lng: number }) => void) | null = null;

vi.mock('next/dynamic', () => ({
  default: () => {
    const MockMap = (props: {
      coordinates: { lat: number; lng: number };
      onCoordinateChange: (coords: { lat: number; lng: number }) => void;
    }) => {
      capturedOnChange = props.onCoordinateChange;
      return (
        <div data-testid="mock-leaflet-map">
          Map at {props.coordinates.lat},{props.coordinates.lng}
        </div>
      );
    };
    MockMap.displayName = 'MockMapCoordinatePickerLeaflet';
    return MockMap;
  },
}));

describe('MapCoordinatePicker', () => {
  let onCoordinateChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onCoordinateChange = vi.fn();
    capturedOnChange = null;
  });

  it('başlık ve açıklama metnini gösterir', () => {
    render(<MapCoordinatePicker onCoordinateChange={onCoordinateChange} />);
    expect(screen.getByText('Koordinat Seçici')).toBeInTheDocument();
    expect(screen.getByText('Haritaya tıklayarak koordinat seçin')).toBeInTheDocument();
  });

  it('initialCoordinates verilmediğinde İstanbul varsayılan koordinatlarını gösterir', () => {
    render(<MapCoordinatePicker onCoordinateChange={onCoordinateChange} />);
    expect(screen.getByTestId('lat-display')).toHaveTextContent('Enlem: 41.0082');
    expect(screen.getByTestId('lng-display')).toHaveTextContent('Boylam: 28.9784');
  });

  it('initialCoordinates verildiğinde o koordinatları gösterir', () => {
    render(
      <MapCoordinatePicker
        initialCoordinates={{ lat: 48.8566, lng: 2.3522 }}
        onCoordinateChange={onCoordinateChange}
      />
    );
    expect(screen.getByTestId('lat-display')).toHaveTextContent('Enlem: 48.8566');
    expect(screen.getByTestId('lng-display')).toHaveTextContent('Boylam: 2.3522');
  });

  it('harita bileşenini render eder', () => {
    render(<MapCoordinatePicker onCoordinateChange={onCoordinateChange} />);
    expect(screen.getByTestId('mock-leaflet-map')).toBeInTheDocument();
  });

  it('koordinat değiştiğinde onCoordinateChange çağrılır ve gösterim güncellenir', () => {
    render(<MapCoordinatePicker onCoordinateChange={onCoordinateChange} />);

    // Simulate a map click via the captured callback
    expect(capturedOnChange).not.toBeNull();
    act(() => {
      capturedOnChange!({ lat: 35.6762, lng: 139.6503 });
    });

    expect(onCoordinateChange).toHaveBeenCalledWith({ lat: 35.6762, lng: 139.6503 });
    expect(screen.getByTestId('lat-display')).toHaveTextContent('Enlem: 35.6762');
    expect(screen.getByTestId('lng-display')).toHaveTextContent('Boylam: 139.6503');
  });
});
