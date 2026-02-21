'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/admin/AuthGuard';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { getLocalizedContent } from '@/lib/i18n-content';
import { logout } from '@/lib/auth';
import type { ContentItem } from '@/types';

interface AdminDashboardClientProps {
  items: ContentItem[];
}

const TYPE_STYLES: Record<ContentItem['type'], string> = {
  location: 'bg-accent-turquoise/15 text-accent-turquoise border-accent-turquoise/30',
  blog: 'bg-accent-indigo/15 text-accent-indigo border-accent-indigo/30',
  recommendation: 'bg-accent-amber/15 text-accent-amber border-accent-amber/30',
  'friend-experience': 'bg-purple-500/15 text-purple-400 border-purple-500/30',
};

const STATUS_STYLES: Record<ContentItem['status'], string> = {
  published: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  draft: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  unpublished: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
};

export default function AdminDashboardClient({ items }: AdminDashboardClientProps) {
  const router = useRouter();
  const { t, locale } = useLanguage();

  const stats = useMemo(() => {
    const published = items.filter((i) => i.status === 'published').length;
    const draft = items.filter((i) => i.status === 'draft').length;
    const unpublished = items.filter((i) => i.status === 'unpublished').length;
    return { total: items.length, published, draft, unpublished };
  }, [items]);

  function handleLogout() {
    logout();
    router.push('/');
  }

  function typeLabel(type: ContentItem['type']): string {
    const map: Record<ContentItem['type'], string> = {
      location: t('admin.location'),
      blog: t('admin.blog'),
      recommendation: t('admin.recommendation'),
      'friend-experience': t('admin.friendExperience'),
    };
    return map[type];
  }

  function statusLabel(status: ContentItem['status']): string {
    const map: Record<ContentItem['status'], string> = {
      published: t('admin.published'),
      draft: t('admin.draft'),
      unpublished: t('admin.unpublished'),
    };
    return map[status];
  }

  const contentTypes: ContentItem['type'][] = [
    'location',
    'blog',
    'recommendation',
    'friend-experience',
  ];

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-4rem)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-10 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-gray-100">
              {t('admin.dashboard')}
            </h1>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-white/10 bg-dark-card/60 px-4 py-2 text-sm font-medium text-gray-300 backdrop-blur-sm transition-colors hover:border-rose-500/30 hover:text-rose-400"
            >
              {t('admin.logout')}
            </button>
          </div>

          {/* Stats */}
          <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label={t('admin.totalItems')} value={stats.total} accent="border-accent-turquoise/40" />
            <StatCard label={t('admin.published')} value={stats.published} accent="border-emerald-500/40" />
            <StatCard label={t('admin.draft')} value={stats.draft} accent="border-amber-500/40" />
            <StatCard label={t('admin.unpublished')} value={stats.unpublished} accent="border-gray-500/40" />
          </div>

          {/* Create New */}
          <div className="mb-10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
              {t('admin.createNew')}
            </h2>
            <div className="flex flex-wrap gap-3">
              {contentTypes.map((type) => (
                <button
                  key={type}
                  className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-all hover:scale-[1.02] ${TYPE_STYLES[type]}`}
                >
                  + {typeLabel(type)}
                </button>
              ))}
            </div>
          </div>

          {/* Content List */}
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
              {t('admin.contentList')}
            </h2>

            {items.length === 0 ? (
              <div className="rounded-2xl border border-white/5 bg-dark-card/50 p-12 text-center text-gray-500 backdrop-blur-sm">
                {t('admin.noContent')}
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/5 bg-dark-card/50 backdrop-blur-sm">
                {/* Table header */}
                <div className="hidden border-b border-white/5 px-6 py-3 sm:grid sm:grid-cols-12 sm:gap-4">
                  <span className="col-span-4 text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.title')}</span>
                  <span className="col-span-2 text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.type')}</span>
                  <span className="col-span-2 text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.status')}</span>
                  <span className="col-span-2 text-xs font-semibold uppercase tracking-wider text-gray-500">{t('admin.date')}</span>
                  <span className="col-span-2 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">{t('admin.actions')}</span>
                </div>

                {/* Rows */}
                {items.map((item) => {
                  const localized = getLocalizedContent(item.content, locale);
                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-1 gap-2 border-b border-white/5 px-6 py-4 transition-colors last:border-b-0 hover:bg-white/[0.02] sm:grid-cols-12 sm:items-center sm:gap-4"
                    >
                      {/* Title */}
                      <div className="col-span-4 truncate font-medium text-gray-200">
                        {localized.title}
                      </div>
                      {/* Type badge */}
                      <div className="col-span-2">
                        <span className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-medium ${TYPE_STYLES[item.type]}`}>
                          {typeLabel(item.type)}
                        </span>
                      </div>
                      {/* Status badge */}
                      <div className="col-span-2">
                        <span className={`inline-block rounded-md border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[item.status]}`}>
                          {statusLabel(item.status)}
                        </span>
                      </div>
                      {/* Date */}
                      <div className="col-span-2 text-sm text-gray-500">
                        {new Date(item.updatedAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}
                      </div>
                      {/* Actions */}
                      <div className="col-span-2 flex gap-2 sm:justify-end">
                        <button className="rounded-md border border-accent-indigo/30 bg-accent-indigo/10 px-3 py-1 text-xs font-medium text-accent-indigo transition-colors hover:bg-accent-indigo/20">
                          {t('admin.edit')}
                        </button>
                        <button className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-400 transition-colors hover:bg-rose-500/20">
                          {t('admin.delete')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

/* Stat card sub-component */
function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className={`rounded-xl border-l-2 ${accent} border border-l-2 border-white/5 bg-dark-card/50 px-5 py-4 backdrop-blur-sm`}>
      <p className="text-2xl font-bold text-gray-100">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
}
