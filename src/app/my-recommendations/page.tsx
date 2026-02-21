import { getItemsByType } from '@/lib/data';
import type { ContentItem } from '@/types';
import MyRecommendationsClient from './MyRecommendationsClient';

export default function MyRecommendationsPage() {
  const recommendations: ContentItem[] = getItemsByType('recommendation').filter(
    (item) => item.status === 'published'
  );

  return <MyRecommendationsClient items={recommendations} />;
}
