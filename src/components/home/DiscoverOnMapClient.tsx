'use client';

import dynamic from 'next/dynamic';
import { useLanguage } from '@/components/providers/LanguageProvider';
import type { MapMarker, MapRoute } from '@/types';

const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false });

interface DiscoverOnMapClientProps {
  markers: MapMarker[];
  routes: MapRoute[];
}

export default function DiscoverOnMapClient({ markers, routes }: DiscoverOnMapClientProps) {
  const { t } = useLanguage();

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-8 text-center sm:text-3xl lg:text-4xl">
        {t('sections.discoverOnMap')}
      </h2>
      <div className="h-[350px] sm:h-[450px] lg:h-[500px] rounded-2xl overflow-hidden border border-white/10 shadow-lg">
        <LeafletMap markers={markers} routes={routes} />
      </div>
    </section>
  );
}
