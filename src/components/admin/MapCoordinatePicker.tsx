'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/components/providers/LanguageProvider';
import type { MapCoordinatePickerProps } from '@/types';

const MapCoordinatePickerLeaflet = dynamic(
  () => import('./MapCoordinatePickerLeaflet'),
  { ssr: false }
);

const DEFAULT_CENTER = { lat: 41.0082, lng: 28.9784 }; // Istanbul

export default function MapCoordinatePicker({
  initialCoordinates,
  onCoordinateChange,
}: MapCoordinatePickerProps) {
  const { t } = useLanguage();
  const [coordinates, setCoordinates] = useState(
    initialCoordinates ?? DEFAULT_CENTER
  );

  const handleCoordinateChange = (coords: { lat: number; lng: number }) => {
    setCoordinates(coords);
    onCoordinateChange(coords);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#1e293b]/80 backdrop-blur-md p-4 space-y-3">
      <h3 className="text-sm font-semibold text-white/90">
        {t('admin.coordinatePicker')}
      </h3>
      <p className="text-xs text-white/50">{t('admin.clickToSelect')}</p>

      <div className="rounded-xl overflow-hidden border border-white/5">
        <MapCoordinatePickerLeaflet
          coordinates={coordinates}
          onCoordinateChange={handleCoordinateChange}
        />
      </div>

      <div className="flex gap-4 text-xs text-white/70">
        <span data-testid="lat-display">
          {t('admin.latitude')}: {coordinates.lat.toFixed(4)}
        </span>
        <span data-testid="lng-display">
          {t('admin.longitude')}: {coordinates.lng.toFixed(4)}
        </span>
      </div>
    </div>
  );
}
