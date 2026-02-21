import { getItemsByType } from '@/lib/data';
import type { ContentItem, LocationContent, MapMarker, MapRoute } from '@/types';
import DiscoverOnMapClient from './DiscoverOnMapClient';

export default function DiscoverOnMap() {
  const locations = getItemsByType('location').filter(
    (item) => item.status === 'published'
  );

  const markers: MapMarker[] = locations.map((item) => {
    const content = item.content.tr as unknown as LocationContent;
    return {
      slug: item.slug,
      title: content.title,
      coordinates: content.coordinates,
      coverImage: item.coverImage,
      color: 'red' as const,
    };
  });

  // Aynı rotadaki lokasyonları bağlayan polyline'lar
  // Tüm published lokasyonları tek bir rota olarak bağla
  const routes: MapRoute[] = [];
  if (markers.length > 1) {
    routes.push({
      points: markers.map((m) => m.coordinates),
      color: '#ef4444', // red-500
      label: 'Travel Route',
    });
  }

  return <DiscoverOnMapClient markers={markers} routes={routes} />;
}
