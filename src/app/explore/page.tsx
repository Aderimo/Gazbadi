import { getItemsByType } from '@/lib/data';
import type { ContentItem } from '@/types';
import ExploreClient from './ExploreClient';

export default function ExplorePage() {
  const locations: ContentItem[] = getItemsByType('location').filter(
    (item) => item.status === 'published'
  );

  return <ExploreClient items={locations} />;
}
