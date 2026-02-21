import { getAllItems, getItemBySlug } from '@/lib/data';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LocationDetailClient from './LocationDetailClient';

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  const items = getAllItems().filter(
    (item) => item.type === 'location' && item.status === 'published'
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

export default function LocationDetailPage({ params }: PageProps) {
  const item = getItemBySlug(params.slug);

  if (!item || item.type !== 'location') {
    notFound();
  }

  return <LocationDetailClient item={item} />;
}
