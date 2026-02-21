'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { getLocalizedContent } from '@/lib/i18n-content';
import OptimizedImage from '@/components/ui/OptimizedImage';
import type { ContentItem, FriendExperienceContent } from '@/types';

interface FriendExperienceDetailClientProps {
  item: ContentItem;
}

export default function FriendExperienceDetailClient({ item }: FriendExperienceDetailClientProps) {
  const { locale } = useLanguage();
  const content = getLocalizedContent(
    item.content as { tr: FriendExperienceContent; en: FriendExperienceContent },
    locale
  );

  return (
    <article className="min-h-screen bg-dark">
      {/* Cover */}
      <CoverSection
        coverImage={item.coverImage}
        friendName={content.friendName}
        summary={content.summary}
      />

      <div className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
        {/* Narrative */}
        <section className="pt-12">
          <SectionHeading text={locale === 'tr' ? 'Kişisel Anlatım' : 'Personal Narrative'} />
          <div className="mt-6 glass-card p-6 sm:p-8">
            <NarrativeRenderer markdown={content.narrative} />
          </div>
        </section>

        {/* Visited Locations */}
        {content.visitedLocations && content.visitedLocations.length > 0 && (
          <section className="mt-16">
            <SectionHeading text={locale === 'tr' ? 'Ziyaret Edilen Yerler' : 'Visited Locations'} />
            <div className="mt-6 flex flex-wrap gap-3">
              {content.visitedLocations.map((loc, i) => (
                <VisitedLocationChip key={i} name={loc.name} slug={loc.slug} />
              ))}
            </div>
          </section>
        )}

        {/* Location Comments */}
        {content.locationComments && content.locationComments.length > 0 && (
          <section className="mt-16">
            <SectionHeading text={locale === 'tr' ? 'Lokasyon Yorumları' : 'Location Comments'} />
            <div className="mt-6 space-y-4">
              {content.locationComments.map((lc, i) => (
                <div key={i} className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-accent-turquoise">{lc.locationName}</h3>
                  <p className="mt-2 leading-relaxed text-gray-300">{lc.comment}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Photo Gallery */}
        {content.gallery && content.gallery.length > 0 && (
          <section className="mt-16">
            <SectionHeading text={locale === 'tr' ? 'Fotoğraf Galerisi' : 'Photo Gallery'} />
            <PhotoGallery images={content.gallery} friendName={content.friendName} />
          </section>
        )}
      </div>
    </article>
  );
}

/* ─── Cover Section ─── */
function CoverSection({
  coverImage,
  friendName,
  summary,
}: {
  coverImage: string;
  friendName: string;
  summary: string;
}) {
  return (
    <header className="relative h-[50vh] sm:h-[55vh] lg:h-[60vh] min-h-[300px] sm:min-h-[400px] w-full overflow-hidden">
      <OptimizedImage
        src={coverImage}
        alt={friendName}
        lazy={false}
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium uppercase tracking-widest text-accent-turquoise">
            ✦ Friend Experience
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {friendName}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-300/90">{summary}</p>
        </div>
      </div>
    </header>
  );
}

/* ─── Section Heading ─── */
function SectionHeading({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-4">
      <h2 className="text-2xl font-semibold text-white">{text}</h2>
      <div className="h-px flex-1 bg-gradient-to-r from-accent-turquoise/40 to-transparent" />
    </div>
  );
}

/* ─── Visited Location Chip ─── */
function VisitedLocationChip({ name, slug }: { name: string; slug?: string }) {
  const base =
    'inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-medium transition-colors';

  if (slug) {
    return (
      <Link
        href={`/location/${slug}`}
        className={`${base} bg-accent-indigo/10 text-accent-indigo hover:bg-accent-indigo/20`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-accent-indigo" />
        {name}
        <span className="text-xs opacity-60">→</span>
      </Link>
    );
  }

  return (
    <span className={`${base} bg-white/5 text-gray-400`}>
      <span className="h-1.5 w-1.5 rounded-full bg-gray-500" />
      {name}
    </span>
  );
}

/* ─── Narrative Renderer (simple Markdown → HTML) ─── */
function NarrativeRenderer({ markdown }: { markdown: string }) {
  if (!markdown) return null;

  const blocks = markdown.split('\n\n').filter(Boolean);

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        const trimmed = block.trim();

        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={i} className="text-xl font-semibold text-accent-amber pt-2">
              {trimmed.replace('## ', '')}
            </h3>
          );
        }

        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={i} className="text-2xl font-bold text-white pt-2">
              {trimmed.replace('# ', '')}
            </h2>
          );
        }

        return (
          <p key={i} className="leading-relaxed text-gray-300">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}

/* ─── Photo Gallery ─── */
function PhotoGallery({ images, friendName }: { images: string[]; friendName: string }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelected(src)}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-white/5 transition-transform hover:scale-[1.02]"
          >
            <OptimizedImage
              src={src}
              alt={`${friendName} - ${i + 1}`}
              lazy={true}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Photo lightbox"
        >
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="absolute right-6 top-6 text-3xl text-white/70 hover:text-white transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
          <div className="relative max-h-[85vh] max-w-4xl w-full aspect-[4/3]">
            <OptimizedImage
              src={selected}
              alt={friendName}
              lazy={false}
              className="h-full w-full object-contain rounded-lg"
              sizes="90vw"
            />
          </div>
        </div>
      )}
    </>
  );
}
