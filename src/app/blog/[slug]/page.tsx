import { getAllItems, getItemBySlug } from '@/lib/data';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogDetailClient from './BlogDetailClient';

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  const items = getAllItems().filter(
    (item) => item.type === 'blog' && item.status === 'published'
  );
  return items.map((item) => ({ slug: item.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const item = getItemBySlug(params.slug);
  if (!item) return { title: 'Not Found' };

  return {
    title: item.seo.tr.title,
    description: item.seo.tr.description,
    openGraph: {
      title: item.seo.tr.title,
      description: item.seo.tr.description,
      images: item.coverImage ? [{ url: item.coverImage }] : [],
    },
  };
}

export default function BlogDetailPage({ params }: PageProps) {
  const item = getItemBySlug(params.slug);

  if (!item || item.type !== 'blog') {
    notFound();
  }

  return <BlogDetailClient item={item} />;
}
