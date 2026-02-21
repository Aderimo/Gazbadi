import { getItemsByType } from '@/lib/data';
import type { ContentItem } from '@/types';
import FriendExperiencesSectionClient from './FriendExperiencesSectionClient';

const MAX_ITEMS = 4;

export default function FriendExperiencesSection() {
  const experiences: ContentItem[] = getItemsByType('friend-experience')
    .filter((item) => item.status === 'published')
    .slice(0, MAX_ITEMS);

  return <FriendExperiencesSectionClient items={experiences} />;
}
