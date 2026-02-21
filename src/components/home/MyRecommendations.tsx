import { getItemsByType } from '@/lib/data';
import type { ContentItem } from '@/types';
import MyRecommendationsClient from './MyRecommendationsClient';

const MAX_ITEMS = 4;

export default function MyRecommendations() {
  const recommendations: ContentItem[] = getItemsByType('recommendation')
    .filter((item) => item.status === 'published')
    .slice(0, MAX_ITEMS);

  return <MyRecommendationsClient items={recommendations} />;
}
