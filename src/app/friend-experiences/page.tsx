import { getItemsByType } from '@/lib/data';
import type { ContentItem } from '@/types';
import FriendExperiencesClient from './FriendExperiencesClient';

export default function FriendExperiencesPage() {
  const experiences: ContentItem[] = getItemsByType('friend-experience').filter(
    (item) => item.status === 'published'
  );

  return <FriendExperiencesClient items={experiences} />;
}
