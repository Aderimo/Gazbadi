'use client';

import { useState } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { getLocalizedContent } from '@/lib/i18n-content';
import OptimizedImage from '@/components/ui/OptimizedImage';
import RouteMap from '@/components/map/RouteMap';
import type { ContentItem, LocationContent, RoutePlanDay, BudgetItem } from '@/types';

interface LocationDetailClientProps {
  item: ContentItem;
}

export default function LocationDetailClient({ item }: LocationDetailClientProps) {
  const { locale, t } = useLanguage();
  const content = getLocalizedContent(
    item.content as { tr: LocationContent; en: LocationContent },
    locale
  );

  const allRoutePoints = content.dailyRoutePlan?.flatMap((day) => day.routePoints) ?? [];

  return (
    <article className="min-h-screen bg-dark">
      {/* Cover Section */}
      <CoverSection
        coverImage={item.coverImage}
        city={content.city}
        country={content.country}
        summary={content.summary}
      />

      <div className="mx-auto max-w-5xl px-4 pb-24 sm:px-6 lg:px-8">
        {/* Info Sections */}
        <div className="space-y-6 pt-12">
          <InfoSection
            icon="✦"
            title={locale === 'tr' ? 'Giriş' : 'Introduction'}
            text={content.introduction}
          />
          <InfoSection
            icon="✈"
            title={locale === 'tr' ? 'Ulaşım' : 'Transportation'}
            text={content.transportation}
          />
          <InfoSection
            icon="🏨"
            title={locale === 'tr' ? 'Konaklama' : 'Accommodation'}
            text={content.accommodation}
          />
          <InfoSection
            icon="🏛"
            title={locale === 'tr' ? 'Müzeler' : 'Museums'}
            text={content.museums}
          />
          <InfoSection
            icon="🏰"
            title={locale === 'tr' ? 'Tarihi Yerler' : 'Historical Places'}
            text={content.historicalPlaces}
          />
          <InfoSection
            icon="🍽"
            title={locale === 'tr' ? 'Restoranlar' : 'Restaurants'}
            text={content.restaurants}
          />
        </div>

        {/* Daily Route Plan */}
        {content.dailyRoutePlan && content.dailyRoutePlan.length > 0 && (
          <section className="mt-16">
            <SectionHeading text={locale === 'tr' ? 'Günlük Rota Planı' : 'Daily Route Plan'} />
            <div className="mt-6 space-y-6">
              {content.dailyRoutePlan.map((day) => (
                <DayCard key={day.day} day={day} locale={locale} />
              ))}
            </div>
          </section>
        )}

        {/* Budget */}
        {content.estimatedBudget && content.estimatedBudget.length > 0 && (
          <section className="mt-16">
            <SectionHeading text={locale === 'tr' ? 'Tahmini Bütçe' : 'Estimated Budget'} />
            <BudgetTable items={content.estimatedBudget} locale={locale} />
          </section>
        )}

        {/* Route Map */}
        {content.coordinates && (
          <section className="mt-16">
            <SectionHeading text={locale === 'tr' ? 'Rota Haritası' : 'Route Map'} />
            <div className="mt-6 h-[300px] sm:h-[350px] lg:h-[400px]">
              <RouteMap
                center={content.coordinates}
                routePoints={allRoutePoints}
                zoom={13}
              />
            </div>
          </section>
        )}

        {/* Photo Gallery */}
        {content.gallery && content.gallery.length > 0 && (
          <section className="mt-16">
            <SectionHeading text={locale === 'tr' ? 'Fotoğraf Galerisi' : 'Photo Gallery'} />
            <PhotoGallery images={content.gallery} city={content.city} />
          </section>
        )}

        {/* Comments */}
        <section className="mt-16">
          <SectionHeading text={locale === 'tr' ? 'Yorumlar' : 'Comments'} />
          <CommentsSection locale={locale} />
        </section>
      </div>
    </article>
  );
}

/* ─── Cover Section ─── */
function CoverSection({
  coverImage,
  city,
  country,
  summary,
}: {
  coverImage: string;
  city: string;
  country: string;
  summary: string;
}) {
  return (
    <header className="relative h-[50vh] sm:h-[55vh] lg:h-[60vh] min-h-[300px] sm:min-h-[400px] w-full overflow-hidden">
      <OptimizedImage
        src={coverImage}
        alt={`${city}, ${country}`}
        lazy={false}
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-medium uppercase tracking-widest text-accent-turquoise">
            {country}
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {city}
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

/* ─── Info Section ─── */
function InfoSection({
  icon,
  title,
  text,
}: {
  icon: string;
  title: string;
  text: string;
}) {
  if (!text) return null;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xl" role="img" aria-hidden="true">{icon}</span>
        <h3 className="text-lg font-semibold text-accent-turquoise">{title}</h3>
      </div>
      <p className="leading-relaxed text-gray-300">{text}</p>
    </div>
  );
}

/* ─── Day Card ─── */
function DayCard({ day, locale }: { day: RoutePlanDay; locale: 'tr' | 'en' }) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-baseline gap-3 mb-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-indigo/20 text-sm font-bold text-accent-indigo">
          {day.day}
        </span>
        <h3 className="text-lg font-semibold text-white">{day.title}</h3>
      </div>
      <ul className="space-y-2 pl-12">
        {day.activities.map((activity, i) => (
          <li key={i} className="flex items-start gap-2 text-gray-300">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-turquoise" />
            {activity}
          </li>
        ))}
      </ul>
      {day.routePoints && day.routePoints.length > 0 && (
        <div className="mt-4 border-t border-white/5 pt-4 pl-12">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
            {locale === 'tr' ? 'Rota Noktaları' : 'Route Points'}
          </p>
          <div className="flex flex-wrap gap-2">
            {day.routePoints
              .sort((a, b) => a.order - b.order)
              .map((point, i) => (
                <span
                  key={i}
                  className="rounded-full bg-accent-turquoise/10 px-3 py-1 text-xs text-accent-turquoise"
                >
                  {point.order}. {point.name}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Budget Table ─── */
function BudgetTable({
  items,
  locale,
}: {
  items: BudgetItem[];
  locale: 'tr' | 'en';
}) {
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const currency = items[0]?.currency ?? 'TRY';

  return (
    <div className="glass-card mt-6 overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-400">
            <th className="px-6 py-4 font-medium">
              {locale === 'tr' ? 'Kategori' : 'Category'}
            </th>
            <th className="px-6 py-4 font-medium text-right">
              {locale === 'tr' ? 'Tutar' : 'Amount'}
            </th>
            <th className="hidden px-6 py-4 font-medium sm:table-cell">
              {locale === 'tr' ? 'Not' : 'Note'}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {items.map((item, i) => (
            <tr key={i} className="text-gray-300 transition-colors hover:bg-white/[0.02]">
              <td className="px-6 py-3">{item.category}</td>
              <td className="px-6 py-3 text-right font-medium text-accent-amber">
                {item.amount.toLocaleString()} {item.currency}
              </td>
              <td className="hidden px-6 py-3 text-gray-500 sm:table-cell">{item.note}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-white/10 font-semibold text-white">
            <td className="px-6 py-4">
              {locale === 'tr' ? 'Toplam' : 'Total'}
            </td>
            <td className="px-6 py-4 text-right text-accent-amber">
              {total.toLocaleString()} {currency}
            </td>
            <td className="hidden px-6 py-4 sm:table-cell" />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ─── Photo Gallery ─── */
function PhotoGallery({ images, city }: { images: string[]; city: string }) {
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
              alt={`${city} - ${i + 1}`}
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
              alt={city}
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

/* ─── Comments Section (Placeholder) ─── */
function CommentsSection({ locale }: { locale: 'tr' | 'en' }) {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState<{ text: string; date: string }[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setComments((prev) => [
      { text: comment.trim(), date: new Date().toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US') },
      ...prev,
    ]);
    setComment('');
  };

  return (
    <div className="mt-6 space-y-6">
      <form onSubmit={handleSubmit} className="glass-card p-6">
        <label htmlFor="comment-input" className="sr-only">
          {locale === 'tr' ? 'Yorumunuz' : 'Your comment'}
        </label>
        <textarea
          id="comment-input"
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={locale === 'tr' ? 'Yorumunuzu yazın...' : 'Write your comment...'}
          className="w-full resize-none rounded-xl border border-white/10 bg-dark/60 px-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none transition-colors focus:border-accent-turquoise/50"
        />
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            className="rounded-lg bg-accent-turquoise/20 px-5 py-2 text-sm font-medium text-accent-turquoise transition-colors hover:bg-accent-turquoise/30"
          >
            {locale === 'tr' ? 'Gönder' : 'Submit'}
          </button>
        </div>
      </form>

      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((c, i) => (
            <div key={i} className="glass-card px-6 py-4">
              <p className="text-sm text-gray-300">{c.text}</p>
              <p className="mt-2 text-xs text-gray-500">{c.date}</p>
            </div>
          ))}
        </div>
      )}

      {comments.length === 0 && (
        <p className="text-center text-sm text-gray-500">
          {locale === 'tr' ? 'Henüz yorum yok. İlk yorumu siz yapın!' : 'No comments yet. Be the first to comment!'}
        </p>
      )}
    </div>
  );
}
