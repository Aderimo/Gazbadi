import { getItemsByType } from '@/lib/data';
import type { ContentItem } from '@/types';
import PopularRoutesClient from './PopularRoutesClient';

const MAX_ITEMS = 4;

export default function PopularRoutes() {
  const locations: ContentItem[] = getItemsByType('location')
    .filter((item) => item.status === 'published')
    .slice(0, MAX_ITEMS);

  return <PopularRoutesClient items={locations} />;
}
