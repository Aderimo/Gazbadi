import { getItemsByType } from '@/lib/data';
import type { ContentItem } from '@/types';
import ExploreSectionClient from './ExploreSectionClient';

const MAX_ITEMS = 6;

export default function ExploreSection() {
  const locations: ContentItem[] = getItemsByType('location')
    .filter((item) => item.status === 'published')
    .slice(0, MAX_ITEMS);

  return <ExploreSectionClient items={locations} />;
}
