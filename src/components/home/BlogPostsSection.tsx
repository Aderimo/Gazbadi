import { getItemsByType } from '@/lib/data';
import type { ContentItem } from '@/types';
import BlogPostsSectionClient from './BlogPostsSectionClient';

const MAX_ITEMS = 4;

export default function BlogPostsSection() {
  const blogs: ContentItem[] = getItemsByType('blog')
    .filter((item) => item.status === 'published')
    .slice(0, MAX_ITEMS);

  return <BlogPostsSectionClient items={blogs} />;
}
