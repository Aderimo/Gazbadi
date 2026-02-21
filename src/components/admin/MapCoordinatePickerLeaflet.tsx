'use client';

import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapCoordinatePickerProps } from '@/types';

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapCoordinatePickerLeaflet({
  coordinates,
  onCoordinateChange,
}: {
  coordinates: { lat: number; lng: number };
  onCoordinateChange: (coords: { lat: number; lng: number }) => void;
}) {
  const handleClick = (lat: number, lng: number) => {
    onCoordinateChange({ lat, lng });
  };

  return (
    <MapContainer
      center={[coordinates.lat, coordinates.lng]}
      zoom={10}
      scrollWheelZoom={true}
      style={{ height: '300px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <Marker position={[coordinates.lat, coordinates.lng]} icon={redIcon} />
      <ClickHandler onClick={handleClick} />
    </MapContainer>
  );
}
