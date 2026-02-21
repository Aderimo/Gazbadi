'use client';

import dynamic from 'next/dynamic';
import type { RouteMapProps } from '@/types';

const RouteMapLeaflet = dynamic(() => import('./RouteMapLeaflet'), { ssr: false });

export default function RouteMap(props: RouteMapProps) {
  return (
    <div className="relative z-0 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
      <RouteMapLeaflet {...props} />
    </div>
  );
}
