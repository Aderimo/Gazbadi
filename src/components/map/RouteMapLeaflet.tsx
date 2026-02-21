'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { RouteMapProps, RoutePoint } from '@/types';

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function RouteMapLeaflet({ center, routePoints, zoom = 13 }: RouteMapProps) {
  const sorted = [...routePoints].sort((a, b) => a.order - b.order);

  const polylinePositions: [number, number][] = sorted.map(
    (p) => [p.coordinates.lat, p.coordinates.lng] as [number, number]
  );

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      scrollWheelZoom={false}
      style={{ height: '400px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {sorted.map((point, idx) => (
        <Marker
          key={`${point.name}-${idx}`}
          position={[point.coordinates.lat, point.coordinates.lng]}
          icon={redIcon}
        >
          <Popup>
            <div className="text-sm min-w-[180px]">
              <p className="font-bold text-base mb-1">{point.name}</p>
              <p className="text-gray-700 mb-1">{point.description}</p>
              <p className="italic text-gray-500 text-xs">{point.tips}</p>
            </div>
          </Popup>
        </Marker>
      ))}

      {polylinePositions.length > 1 && (
        <Polyline
          positions={polylinePositions}
          pathOptions={{ color: '#ef4444', weight: 3, opacity: 0.7 }}
        />
      )}
    </MapContainer>
  );
}
