'use client';

import React from 'react';
import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';
import type { ContentCardProps } from '@/types';
import { getDetailUrl } from '@/lib/url';
import { getLocalizedContent } from '@/lib/i18n-content';

const typeLabels: Record<string, { tr: string; en: string }> = {
  location: { tr: 'Lokasyon', en: 'Location' },
  blog: { tr: 'Blog', en: 'Blog' },
  recommendation: { tr: 'Öneri', en: 'Recommendation' },
  'friend-experience': { tr: 'Deneyim', en: 'Experience' },
};

const typeBadgeColors: Record<string, string> = {
  location: 'bg-accent-turquoise/20 text-accent-turquoise',
  blog: 'bg-accent-indigo/20 text-accent-indigo',
  recommendation: 'bg-accent-amber/20 text-accent-amber',
  'friend-experience': 'bg-accent-turquoise/20 text-accent-turquoise',
};

const variantStyles = {
  default: {
    wrapper: '',
    imageHeight: 'h-40 sm:h-48',
    titleSize: 'text-lg',
    showSummary: true,
  },
  featured: {
    wrapper: '',
    imageHeight: 'h-48 sm:h-64',
    titleSize: 'text-xl',
    showSummary: true,
  },
  compact: {
    wrapper: '',
    imageHeight: 'h-32',
    titleSize: 'text-base',
    showSummary: false,
  },
} as const;

export default function ContentCard({ item, locale, variant = 'default' }: ContentCardProps) {
  const localized = getLocalizedContent(item.content, locale);
  const href = getDetailUrl(item);
  const styles = variantStyles[variant];
  const badgeLabel = typeLabels[item.type]?.[locale] ?? item.type;
  const badgeColor = typeBadgeColors[item.type] ?? 'bg-white/10 text-gray-300';

  return (
    <Link
      href={href}
      className={`group block ${styles.wrapper} w-full glass-card overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-soft`}
    >
      {/* Cover Image */}
      <div className={`relative ${styles.imageHeight} w-full overflow-hidden`}>
        <OptimizedImage
          src={item.coverImage}
          alt={localized.title}
          lazy={true}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-card/60 to-transparent" />

        {/* Type Badge */}
        <span
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${badgeColor}`}
        >
          {badgeLabel}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className={`${styles.titleSize} font-semibold text-gray-100 line-clamp-2 group-hover:text-accent-turquoise transition-colors duration-300`}>
          {localized.title}
        </h3>

        {styles.showSummary && localized.summary && (
          <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
            {localized.summary}
          </p>
        )}
      </div>
    </Link>
  );
}
