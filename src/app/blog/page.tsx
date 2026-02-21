import { getItemsByType } from '@/lib/data';
import type { ContentItem } from '@/types';
import BlogClient from './BlogClient';

export default function BlogPage() {
  const posts: ContentItem[] = getItemsByType('blog').filter(
    (item) => item.status === 'published'
  );

  return <BlogClient items={posts} />;
}
