'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { generateSlug } from '@/lib/slug';
import type { ContentItem } from '@/types';

interface ContentEditorProps {
  item?: ContentItem;
  onSave: (data: ContentItem) => void;
  contentType: ContentItem['type'];
}

type Tab = 'tr-content' | 'en-content' | 'tr-seo' | 'en-seo';

const STATUS_OPTIONS: ContentItem['status'][] = ['draft', 'published', 'unpublished'];

const TYPE_LABELS: Record<ContentItem['type'], { tr: string; en: string }> = {
  location: { tr: 'Lokasyon', en: 'Location' },
  blog: { tr: 'Blog', en: 'Blog' },
  recommendation: { tr: 'Öneri', en: 'Recommendation' },
  'friend-experience': { tr: 'Arkadaş Deneyimi', en: 'Friend Experience' },
};

export default function ContentEditor({ item, onSave, contentType }: ContentEditorProps) {
  const { t, locale } = useLanguage();
  const isEditMode = !!item;

  const [activeTab, setActiveTab] = useState<Tab>('tr-content');
  const [status, setStatus] = useState<ContentItem['status']>(item?.status ?? 'draft');
  const [slug, setSlug] = useState(item?.slug ?? '');
  const [coverImage, setCoverImage] = useState(item?.coverImage ?? '');

  // Content fields
  const [trTitle, setTrTitle] = useState(item?.content.tr.title ?? '');
  const [trSummary, setTrSummary] = useState(item?.content.tr.summary ?? '');
  const [enTitle, setEnTitle] = useState(item?.content.en.title ?? '');
  const [enSummary, setEnSummary] = useState(item?.content.en.summary ?? '');

  // SEO fields
  const [seoTrTitle, setSeoTrTitle] = useState(item?.seo.tr.title ?? '');
  const [seoTrDesc, setSeoTrDesc] = useState(item?.seo.tr.description ?? '');
  const [seoEnTitle, setSeoEnTitle] = useState(item?.seo.en.title ?? '');
  const [seoEnDesc, setSeoEnDesc] = useState(item?.seo.en.description ?? '');

  // Auto-generate slug from TR title in create mode
  useEffect(() => {
    if (!isEditMode && trTitle.trim()) {
      setSlug(generateSlug(trTitle));
    }
  }, [trTitle, isEditMode]);

  const handleSave = useCallback(() => {
    const now = new Date().toISOString();
    const data: ContentItem = {
      id: item?.id ?? crypto.randomUUID(),
      slug,
      type: contentType,
      status,
      createdAt: item?.createdAt ?? now,
      updatedAt: now,
      coverImage,
      seo: {
        tr: { title: seoTrTitle, description: seoTrDesc },
        en: { title: seoEnTitle, description: seoEnDesc },
      },
      content: {
        tr: { title: trTitle, summary: trSummary },
        en: { title: enTitle, summary: enSummary },
      },
    };
    onSave(data);
  }, [
    item, slug, contentType, status, coverImage,
    seoTrTitle, seoTrDesc, seoEnTitle, seoEnDesc,
    trTitle, trSummary, enTitle, enSummary, onSave,
  ]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'tr-content', label: t('admin.trContent') },
    { key: 'en-content', label: t('admin.enContent') },
    { key: 'tr-seo', label: t('admin.trSeo') },
    { key: 'en-seo', label: t('admin.enSeo') },
  ];

  const statusLabels: Record<ContentItem['status'], string> = {
    draft: t('admin.statusDraft'),
    published: t('admin.statusPublished'),
    unpublished: t('admin.statusUnpublished'),
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <h2 className="mb-8 text-xl font-bold text-gray-100">
        {isEditMode ? t('admin.editContent') : t('admin.newContent')}
      </h2>

      <div className="rounded-2xl border border-white/10 bg-dark-card/60 p-6 backdrop-blur-md sm:p-8">
        {/* Content Type (readonly) */}
        <div className="mb-6">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
            {t('admin.contentType')}
          </label>
          <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-300">
            {TYPE_LABELS[contentType][locale]}
          </div>
        </div>

        {/* Status */}
        <div className="mb-6">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
            {t('admin.status')}
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ContentItem['status'])}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-200 outline-none transition-colors focus:border-accent-turquoise"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s} className="bg-dark-card text-gray-200">
                {statusLabels[s]}
              </option>
            ))}
          </select>
        </div>

        {/* Slug */}
        <div className="mb-6">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
            {t('admin.slug')}
          </label>
          <input
            type="text"
            value={slug}
            readOnly={isEditMode}
            onChange={(e) => !isEditMode && setSlug(e.target.value)}
            className={`w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-200 outline-none transition-colors focus:border-accent-turquoise ${
              isEditMode ? 'cursor-not-allowed opacity-60' : ''
            }`}
          />
          <p className="mt-1 text-xs text-gray-500">
            {isEditMode ? t('admin.slugPreserved') : t('admin.slugAutoGenerated')}
          </p>
        </div>

        {/* Cover Image */}
        <div className="mb-8">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
            {t('admin.coverImage')}
          </label>
          <input
            type="text"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder={t('admin.coverImagePlaceholder')}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-200 outline-none transition-colors placeholder:text-gray-600 focus:border-accent-turquoise"
          />
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl border border-white/5 bg-white/[0.02] p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all sm:text-sm ${
                activeTab === tab.key
                  ? 'bg-accent-turquoise/15 text-accent-turquoise'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-5">
          {activeTab === 'tr-content' && (
            <>
              <InputField
                label={t('admin.titleField')}
                value={trTitle}
                onChange={setTrTitle}
              />
              <TextareaField
                label={t('admin.summaryField')}
                value={trSummary}
                onChange={setTrSummary}
              />
            </>
          )}

          {activeTab === 'en-content' && (
            <>
              <InputField
                label={t('admin.titleField')}
                value={enTitle}
                onChange={setEnTitle}
              />
              <TextareaField
                label={t('admin.summaryField')}
                value={enSummary}
                onChange={setEnSummary}
              />
            </>
          )}

          {activeTab === 'tr-seo' && (
            <>
              <InputField
                label={t('admin.seoTitle')}
                value={seoTrTitle}
                onChange={setSeoTrTitle}
              />
              <TextareaField
                label={t('admin.seoDescription')}
                value={seoTrDesc}
                onChange={setSeoTrDesc}
              />
            </>
          )}

          {activeTab === 'en-seo' && (
            <>
              <InputField
                label={t('admin.seoTitle')}
                value={seoEnTitle}
                onChange={setSeoEnTitle}
              />
              <TextareaField
                label={t('admin.seoDescription')}
                value={seoEnDesc}
                onChange={setSeoEnDesc}
              />
            </>
          )}
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="mt-8 w-full rounded-xl bg-accent-turquoise/20 py-3 text-sm font-semibold text-accent-turquoise transition-all hover:bg-accent-turquoise/30 active:scale-[0.98]"
        >
          {t('admin.save')}
        </button>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function InputField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-200 outline-none transition-colors focus:border-accent-turquoise"
      />
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-200 outline-none transition-colors focus:border-accent-turquoise"
      />
    </div>
  );
}
