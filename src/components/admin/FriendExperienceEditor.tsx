'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { generateSlug } from '@/lib/slug';
import type { ContentItem, FriendExperienceContent } from '@/types';

interface FriendExperienceEditorProps {
  experience?: ContentItem;
  onSave: (data: ContentItem) => void;
}

type Tab = 'tr-content' | 'en-content' | 'tr-seo' | 'en-seo';

const STATUS_OPTIONS: ContentItem['status'][] = ['draft', 'published', 'unpublished'];

export default function FriendExperienceEditor({ experience, onSave }: FriendExperienceEditorProps) {
  const { t } = useLanguage();
  const isEditMode = !!experience;

  const trContent = experience?.content.tr as FriendExperienceContent | undefined;
  const enContent = experience?.content.en as FriendExperienceContent | undefined;

  const [activeTab, setActiveTab] = useState<Tab>('tr-content');
  const [status, setStatus] = useState<ContentItem['status']>(experience?.status ?? 'draft');
  const [slug, setSlug] = useState(experience?.slug ?? '');
  const [coverImage, setCoverImage] = useState(experience?.coverImage ?? '');
  const [friendName, setFriendName] = useState(trContent?.friendName ?? '');

  // TR/EN content fields
  const [trTitle, setTrTitle] = useState(trContent?.title ?? '');
  const [trSummary, setTrSummary] = useState(trContent?.summary ?? '');
  const [enTitle, setEnTitle] = useState(enContent?.title ?? '');
  const [enSummary, setEnSummary] = useState(enContent?.summary ?? '');

  // Narrative
  const [narrative, setNarrative] = useState(trContent?.narrative ?? '');

  // Visited locations
  const [visitedLocations, setVisitedLocations] = useState<{ name: string; slug?: string }[]>(
    trContent?.visitedLocations ?? []
  );

  // Location comments
  const [locationComments, setLocationComments] = useState<{ locationName: string; comment: string }[]>(
    trContent?.locationComments ?? []
  );

  // Gallery
  const [gallery, setGallery] = useState<string[]>(trContent?.gallery ?? []);

  // SEO fields
  const [seoTrTitle, setSeoTrTitle] = useState(experience?.seo.tr.title ?? '');
  const [seoTrDesc, setSeoTrDesc] = useState(experience?.seo.tr.description ?? '');
  const [seoEnTitle, setSeoEnTitle] = useState(experience?.seo.en.title ?? '');
  const [seoEnDesc, setSeoEnDesc] = useState(experience?.seo.en.description ?? '');

  // Auto-generate slug from friend name in create mode
  useEffect(() => {
    if (!isEditMode && friendName.trim()) {
      setSlug(generateSlug(friendName));
    }
  }, [friendName, isEditMode]);

  // --- List helpers ---
  const addVisitedLocation = useCallback(() => {
    setVisitedLocations((prev) => [...prev, { name: '', slug: '' }]);
  }, []);

  const removeVisitedLocation = useCallback((index: number) => {
    setVisitedLocations((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateVisitedLocation = useCallback((index: number, field: 'name' | 'slug', value: string) => {
    setVisitedLocations((prev) =>
      prev.map((loc, i) => (i === index ? { ...loc, [field]: value } : loc))
    );
  }, []);

  const addLocationComment = useCallback(() => {
    setLocationComments((prev) => [...prev, { locationName: '', comment: '' }]);
  }, []);

  const removeLocationComment = useCallback((index: number) => {
    setLocationComments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateLocationComment = useCallback((index: number, field: 'locationName' | 'comment', value: string) => {
    setLocationComments((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c))
    );
  }, []);

  const addGalleryImage = useCallback(() => {
    setGallery((prev) => [...prev, '']);
  }, []);

  const removeGalleryImage = useCallback((index: number) => {
    setGallery((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateGalleryImage = useCallback((index: number, value: string) => {
    setGallery((prev) => prev.map((img, i) => (i === index ? value : img)));
  }, []);

  const handleSave = useCallback(() => {
    const now = new Date().toISOString();
    const friendContent: FriendExperienceContent = {
      title: trTitle,
      summary: trSummary,
      friendName,
      visitedLocations,
      narrative,
      locationComments,
      gallery,
    };
    const friendContentEn: FriendExperienceContent = {
      title: enTitle,
      summary: enSummary,
      friendName,
      visitedLocations,
      narrative,
      locationComments,
      gallery,
    };

    const data: ContentItem = {
      id: experience?.id ?? crypto.randomUUID(),
      slug,
      type: 'friend-experience',
      status,
      createdAt: experience?.createdAt ?? now,
      updatedAt: now,
      coverImage,
      seo: {
        tr: { title: seoTrTitle, description: seoTrDesc },
        en: { title: seoEnTitle, description: seoEnDesc },
      },
      content: {
        tr: friendContent,
        en: friendContentEn,
      },
    };
    onSave(data);
  }, [
    experience, slug, status, coverImage, friendName,
    trTitle, trSummary, enTitle, enSummary,
    narrative, visitedLocations, locationComments, gallery,
    seoTrTitle, seoTrDesc, seoEnTitle, seoEnDesc, onSave,
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

  const inputCls =
    'w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-200 outline-none transition-colors focus:border-accent-turquoise';
  const labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-400';

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="mb-8 text-xl font-bold text-gray-100">
        {isEditMode ? t('admin.editContent') : t('admin.newContent')}
      </h2>

      <div className="rounded-2xl border border-white/10 bg-dark-card/60 p-6 backdrop-blur-md sm:p-8">
        {/* Friend Name */}
        <div className="mb-6">
          <label className={labelCls}>{t('admin.friendName')}</label>
          <input type="text" value={friendName} onChange={(e) => setFriendName(e.target.value)} className={inputCls} />
        </div>

        {/* Status */}
        <div className="mb-6">
          <label className={labelCls}>{t('admin.status')}</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ContentItem['status'])}
            className={inputCls}
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
          <label className={labelCls}>{t('admin.slug')}</label>
          <input
            type="text"
            value={slug}
            readOnly={isEditMode}
            onChange={(e) => !isEditMode && setSlug(e.target.value)}
            className={`${inputCls} ${isEditMode ? 'cursor-not-allowed opacity-60' : ''}`}
          />
          <p className="mt-1 text-xs text-gray-500">
            {isEditMode ? t('admin.slugPreserved') : t('admin.slugAutoGenerated')}
          </p>
        </div>

        {/* Cover Image */}
        <div className="mb-8">
          <label className={labelCls}>{t('admin.coverImage')}</label>
          <input
            type="text"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder={t('admin.coverImagePlaceholder')}
            className={`${inputCls} placeholder:text-gray-600`}
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
              <div>
                <label className={labelCls}>{t('admin.titleField')}</label>
                <input type="text" value={trTitle} onChange={(e) => setTrTitle(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t('admin.summaryField')}</label>
                <textarea value={trSummary} onChange={(e) => setTrSummary(e.target.value)} rows={3} className={`${inputCls} resize-none`} />
              </div>
            </>
          )}
          {activeTab === 'en-content' && (
            <>
              <div>
                <label className={labelCls}>{t('admin.titleField')}</label>
                <input type="text" value={enTitle} onChange={(e) => setEnTitle(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t('admin.summaryField')}</label>
                <textarea value={enSummary} onChange={(e) => setEnSummary(e.target.value)} rows={3} className={`${inputCls} resize-none`} />
              </div>
            </>
          )}
          {activeTab === 'tr-seo' && (
            <>
              <div>
                <label className={labelCls}>{t('admin.seoTitle')}</label>
                <input type="text" value={seoTrTitle} onChange={(e) => setSeoTrTitle(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t('admin.seoDescription')}</label>
                <textarea value={seoTrDesc} onChange={(e) => setSeoTrDesc(e.target.value)} rows={3} className={`${inputCls} resize-none`} />
              </div>
            </>
          )}
          {activeTab === 'en-seo' && (
            <>
              <div>
                <label className={labelCls}>{t('admin.seoTitle')}</label>
                <input type="text" value={seoEnTitle} onChange={(e) => setSeoEnTitle(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>{t('admin.seoDescription')}</label>
                <textarea value={seoEnDesc} onChange={(e) => setSeoEnDesc(e.target.value)} rows={3} className={`${inputCls} resize-none`} />
              </div>
            </>
          )}
        </div>

        {/* Narrative */}
        <div className="mt-8">
          <label className={labelCls}>{t('admin.narrative')}</label>
          <textarea
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            rows={5}
            className={`${inputCls} resize-none`}
          />
        </div>

        {/* Visited Locations */}
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <label className={labelCls}>{t('admin.visitedLocations')}</label>
            <button
              type="button"
              onClick={addVisitedLocation}
              className="rounded-lg bg-accent-turquoise/10 px-3 py-1.5 text-xs font-medium text-accent-turquoise transition-colors hover:bg-accent-turquoise/20"
            >
              + {t('admin.addLocation')}
            </button>
          </div>
          <div className="space-y-3">
            {visitedLocations.map((loc, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={loc.name}
                  onChange={(e) => updateVisitedLocation(i, 'name', e.target.value)}
                  placeholder={t('admin.locationName')}
                  className={`${inputCls} flex-1 placeholder:text-gray-600`}
                />
                <input
                  type="text"
                  value={loc.slug ?? ''}
                  onChange={(e) => updateVisitedLocation(i, 'slug', e.target.value)}
                  placeholder={t('admin.slug')}
                  className={`${inputCls} w-36 placeholder:text-gray-600`}
                />
                <button
                  type="button"
                  onClick={() => removeVisitedLocation(i)}
                  className="shrink-0 rounded-lg bg-red-500/10 px-3 py-2.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Location Comments */}
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <label className={labelCls}>{t('admin.locationComments')}</label>
            <button
              type="button"
              onClick={addLocationComment}
              className="rounded-lg bg-accent-turquoise/10 px-3 py-1.5 text-xs font-medium text-accent-turquoise transition-colors hover:bg-accent-turquoise/20"
            >
              + {t('admin.addComment')}
            </button>
          </div>
          <div className="space-y-3">
            {locationComments.map((c, i) => (
              <div key={i} className="flex items-start gap-2">
                <input
                  type="text"
                  value={c.locationName}
                  onChange={(e) => updateLocationComment(i, 'locationName', e.target.value)}
                  placeholder={t('admin.locationName')}
                  className={`${inputCls} w-40 placeholder:text-gray-600`}
                />
                <textarea
                  value={c.comment}
                  onChange={(e) => updateLocationComment(i, 'comment', e.target.value)}
                  placeholder={t('admin.comment')}
                  rows={2}
                  className={`${inputCls} flex-1 resize-none placeholder:text-gray-600`}
                />
                <button
                  type="button"
                  onClick={() => removeLocationComment(i)}
                  className="shrink-0 rounded-lg bg-red-500/10 px-3 py-2.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Gallery */}
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <label className={labelCls}>{t('admin.gallery')}</label>
            <button
              type="button"
              onClick={addGalleryImage}
              className="rounded-lg bg-accent-turquoise/10 px-3 py-1.5 text-xs font-medium text-accent-turquoise transition-colors hover:bg-accent-turquoise/20"
            >
              + {t('admin.addImage')}
            </button>
          </div>
          <div className="space-y-3">
            {gallery.map((url, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => updateGalleryImage(i, e.target.value)}
                  placeholder={t('admin.imageUrl')}
                  className={`${inputCls} flex-1 placeholder:text-gray-600`}
                />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(i)}
                  className="shrink-0 rounded-lg bg-red-500/10 px-3 py-2.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
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
