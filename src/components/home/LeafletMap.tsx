'use client';

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapMarker, MapRoute } from '@/types';

// Kırmızı marker ikonu
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LeafletMapProps {
  markers: MapMarker[];
  routes: MapRoute[];
}

export default function LeafletMap({ markers, routes }: LeafletMapProps) {
  return (
    <MapContainer
      center={[39, 35]}
      zoom={5}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%', minHeight: '300px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />

      {markers.map((marker) => (
        <Marker
          key={marker.slug}
          position={[marker.coordinates.lat, marker.coordinates.lng]}
          icon={redIcon}
        >
          <Popup>
            <div className="text-sm">
              <strong>{marker.title}</strong>
              <br />
              <a
                href={`/location/${marker.slug}`}
                className="text-blue-400 underline"
              >
                Detay →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}

      {routes.map((route, idx) => (
        <Polyline
          key={idx}
          positions={route.points.map((p) => [p.lat, p.lng] as [number, number])}
          pathOptions={{ color: route.color, weight: 3, opacity: 0.7 }}
        />
      ))}
    </MapContainer>
  );
}
