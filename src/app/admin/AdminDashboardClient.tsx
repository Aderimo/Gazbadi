'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/admin/AuthGuard';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { getLocalizedContent } from '@/lib/i18n-content';
import { logout } from '@/lib/auth';
import { generateSlug } from '@/lib/slug';
import {
  getStoredItems, addItem, editItem, removeItem,
  getTrash, restoreItem, permanentDelete, emptyTrash,
  type TrashedItem,
} from '@/lib/admin-store';
import type { ContentItem } from '@/types';

interface Props { items: ContentItem[] }

type Tab = 'content' | 'trash' | 'create' | 'edit';
type ContentType = ContentItem['type'];

const TYPES: ContentType[] = ['location', 'blog', 'recommendation', 'friend-experience'];

const TYPE_INFO: Record<ContentType, { tr: string; en: string; icon: string; desc_tr: string; desc_en: string }> = {
  location: { tr: 'Lokasyon', en: 'Location', icon: '📍', desc_tr: 'Şehir/ülke seyahat rehberi', desc_en: 'City/country travel guide' },
  blog: { tr: 'Blog', en: 'Blog', icon: '✍️', desc_tr: 'Kişisel anı ve hikaye', desc_en: 'Personal story and memory' },
  recommendation: { tr: 'Öneri', en: 'Recommendation', icon: '⭐', desc_tr: 'Kişisel seyahat önerisi', desc_en: 'Personal travel recommendation' },
  'friend-experience': { tr: 'Arkadaş Deneyimi', en: 'Friend Experience', icon: '👥', desc_tr: 'Arkadaş seyahat deneyimi', desc_en: 'Friend travel experience' },
};

const STATUS_STYLES: Record<ContentItem['status'], string> = {
  published: 'bg-emerald-500/15 text-emerald-400',
  draft: 'bg-amber-500/15 text-amber-400',
  unpublished: 'bg-gray-500/15 text-gray-400',
};

export default function AdminDashboardClient({ items: serverItems }: Props) {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [allItems, setAllItems] = useState<ContentItem[]>([]);
  const [trash, setTrash] = useState<TrashedItem[]>([]);
  const [tab, setTab] = useState<Tab>('content');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [createType, setCreateType] = useState<ContentType>('location');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<ContentType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ContentItem['status'] | 'all'>('all');

  useEffect(() => {
    setAllItems(getStoredItems(serverItems));
    setTrash(getTrash());
  }, [serverItems]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const stats = useMemo(() => {
    const byType: Record<string, number> = {};
    TYPES.forEach((t) => { byType[t] = allItems.filter((i) => i.type === t).length; });
    return {
      total: allItems.length,
      published: allItems.filter((i) => i.status === 'published').length,
      draft: allItems.filter((i) => i.status === 'draft').length,
      trashCount: trash.length,
      byType,
    };
  }, [allItems, trash]);

  const filteredItems = useMemo(() => {
    let result = allItems;
    if (filterType !== 'all') result = result.filter((i) => i.type === filterType);
    if (filterStatus !== 'all') result = result.filter((i) => i.status === filterStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((i) => {
        const loc = getLocalizedContent(i.content, locale);
        return loc.title?.toLowerCase().includes(q) || i.slug.toLowerCase().includes(q) || i.type.toLowerCase().includes(q);
      });
    }
    return result;
  }, [allItems, filterType, filterStatus, searchQuery, locale]);

  function handleDelete(id: string) {
    const updated = removeItem(allItems, id);
    setAllItems(updated);
    setTrash(getTrash());
    setConfirmDelete(null);
    showToast(locale === 'tr' ? 'Çöp kutusuna taşındı' : 'Moved to trash');
  }

  function handleQuickStatus(id: string, status: ContentItem['status']) {
    const updated = editItem(allItems, id, { status });
    setAllItems(updated);
    showToast(locale === 'tr' ? 'Durum güncellendi' : 'Status updated');
  }

  function handleRestore(id: string) {
    const result = restoreItem(allItems, id);
    setAllItems(result.items);
    setTrash(result.trash);
    showToast(locale === 'tr' ? 'Geri alındı' : 'Restored');
  }

  function handlePermanentDelete(id: string) {
    const updated = permanentDelete(id);
    setTrash(updated);
    showToast(locale === 'tr' ? 'Kalıcı olarak silindi' : 'Permanently deleted');
  }

  function handleEmptyTrash() {
    setTrash(emptyTrash());
    showToast(locale === 'tr' ? 'Çöp kutusu boşaltıldı' : 'Trash emptied');
  }

  function handleSaveNew(item: ContentItem) {
    const updated = addItem(allItems, item);
    setAllItems(updated);
    setTab('content');
    showToast(locale === 'tr' ? 'İçerik oluşturuldu' : 'Content created');
  }

  function handleSaveEdit(id: string, updates: Partial<ContentItem>) {
    const updated = editItem(allItems, id, updates);
    setAllItems(updated);
    setEditingId(null);
    setTab('content');
    showToast(locale === 'tr' ? 'İçerik güncellendi' : 'Content updated');
  }

  function handleLogout() {
    logout();
    router.push('/');
  }

  const editingItem = editingId ? allItems.find((i) => i.id === editingId) : null;

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Toast */}
          {toast && (
            <div className="fixed top-20 right-4 z-50 rounded-lg border border-accent-turquoise/30 bg-dark-card px-4 py-2.5 text-sm text-accent-turquoise shadow-lg backdrop-blur-sm animate-fade-in">
              {toast}
            </div>
          )}

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-100 tracking-tight">
                {locale === 'tr' ? '🛠 Yönetim Paneli' : '🛠 Admin Panel'}
              </h1>
              <p className="mt-1 text-xs text-gray-500">
                {locale === 'tr' ? 'İçeriklerini yönet, düzenle ve yayınla.' : 'Manage, edit and publish your content.'}
              </p>
            </div>
            <button onClick={handleLogout} className="rounded-lg border border-white/10 px-4 py-2 text-xs text-gray-400 hover:text-rose-400 hover:border-rose-500/30 transition-all">
              {locale === 'tr' ? '🚪 Çıkış' : '🚪 Logout'}
            </button>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: locale === 'tr' ? 'Toplam İçerik' : 'Total Content', val: stats.total, icon: '📊', color: 'border-l-accent-turquoise' },
              { label: locale === 'tr' ? 'Yayında' : 'Published', val: stats.published, icon: '🟢', color: 'border-l-emerald-500' },
              { label: locale === 'tr' ? 'Taslak' : 'Draft', val: stats.draft, icon: '📝', color: 'border-l-amber-500' },
              { label: locale === 'tr' ? 'Çöp Kutusu' : 'Trash', val: stats.trashCount, icon: '🗑️', color: 'border-l-rose-500' },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border border-white/5 border-l-2 ${s.color} bg-dark-card/50 px-4 py-4`}>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-gray-100">{s.val}</p>
                  <span className="text-lg">{s.icon}</span>
                </div>
                <p className="mt-1 text-[11px] text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Type Breakdown */}
          <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TYPES.map((type) => {
              const info = TYPE_INFO[type];
              return (
                <div key={type} className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-dark-card/30 px-3 py-2.5">
                  <span className="text-base">{info.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-200">{stats.byType[type] || 0}</p>
                    <p className="text-[10px] text-gray-500">{locale === 'tr' ? info.tr : info.en}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-xl border border-white/5 bg-dark-card/30 p-1">
            {(['content', 'create', 'trash'] as Tab[]).map((tabItem) => (
              <button
                key={tabItem}
                onClick={() => { setTab(tabItem); setEditingId(null); }}
                className={`flex-1 rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${tab === tabItem ? 'bg-accent-turquoise/15 text-accent-turquoise shadow-sm' : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'}`}
              >
                {tabItem === 'content' ? (locale === 'tr' ? '📋 İçerikler' : '📋 Content') :
                 tabItem === 'create' ? (locale === 'tr' ? '➕ Yeni Oluştur' : '➕ Create New') :
                 `🗑️ ${locale === 'tr' ? 'Çöp' : 'Trash'} (${stats.trashCount})`}
              </button>
            ))}
          </div>

          {/* Content Tab with Search & Filters */}
          {tab === 'content' && !editingId && (
            <>
              {/* Search & Filter Bar */}
              <div className="mb-4 space-y-3">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">🔍</span>
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={locale === 'tr' ? 'İçerik ara (başlık, slug, tür)...' : 'Search content (title, slug, type)...'}
                    className="w-full rounded-xl border border-white/10 bg-dark-card/60 pl-10 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-accent-turquoise/40 transition-colors"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {/* Type Filter */}
                  <button onClick={() => setFilterType('all')} className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${filterType === 'all' ? 'bg-accent-turquoise/20 text-accent-turquoise' : 'border border-white/10 text-gray-500 hover:text-gray-300'}`}>
                    {locale === 'tr' ? 'Tüm Türler' : 'All Types'}
                  </button>
                  {TYPES.map((type) => {
                    const info = TYPE_INFO[type];
                    return (
                      <button key={type} onClick={() => setFilterType(filterType === type ? 'all' : type)} className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${filterType === type ? 'bg-accent-turquoise/20 text-accent-turquoise' : 'border border-white/10 text-gray-500 hover:text-gray-300'}`}>
                        {info.icon} {locale === 'tr' ? info.tr : info.en}
                      </button>
                    );
                  })}
                  <span className="mx-1 border-l border-white/10" />
                  {/* Status Filter */}
                  {(['all', 'published', 'draft', 'unpublished'] as const).map((s) => (
                    <button key={s} onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)} className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${filterStatus === s ? 'bg-accent-turquoise/20 text-accent-turquoise' : 'border border-white/10 text-gray-500 hover:text-gray-300'}`}>
                      {s === 'all' ? (locale === 'tr' ? 'Tüm Durumlar' : 'All Status') : s === 'published' ? (locale === 'tr' ? '🟢 Yayında' : '🟢 Published') : s === 'draft' ? (locale === 'tr' ? '📝 Taslak' : '📝 Draft') : (locale === 'tr' ? '⏸ Kaldırıldı' : '⏸ Unpublished')}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-500">
                  {locale === 'tr' ? `${filteredItems.length} / ${allItems.length} içerik gösteriliyor` : `Showing ${filteredItems.length} / ${allItems.length} items`}
                </p>
              </div>
              <ContentList items={filteredItems} locale={locale} onEdit={(id) => { setEditingId(id); setTab('edit'); }} onDelete={(id) => setConfirmDelete(id)} onQuickStatus={handleQuickStatus} />
            </>
          )}
          {tab === 'edit' && editingItem && <EditForm item={editingItem} locale={locale} onSave={(u) => handleSaveEdit(editingItem.id, u)} onCancel={() => { setEditingId(null); setTab('content'); }} />}
          {tab === 'create' && <CreateForm locale={locale} createType={createType} setCreateType={setCreateType} existingSlugs={allItems.map(i => i.slug)} onSave={handleSaveNew} onCancel={() => setTab('content')} />}
          {tab === 'trash' && <TrashList trash={trash} locale={locale} onRestore={handleRestore} onPermanentDelete={handlePermanentDelete} onEmptyTrash={handleEmptyTrash} />}

          {/* Delete Confirm Modal */}
          {confirmDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
              <div className="mx-4 w-full max-w-sm rounded-xl border border-white/10 bg-dark-card p-6" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/15 text-lg">⚠️</span>
                  <div>
                    <p className="text-sm font-medium text-gray-200">{locale === 'tr' ? 'İçeriği Sil' : 'Delete Content'}</p>
                    <p className="text-xs text-gray-500">{locale === 'tr' ? 'Çöp kutusuna taşınacak.' : 'Will be moved to trash.'}</p>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setConfirmDelete(null)} className="rounded-lg border border-white/10 px-4 py-2 text-xs text-gray-400 hover:text-white transition-colors">{locale === 'tr' ? 'İptal' : 'Cancel'}</button>
                  <button onClick={() => handleDelete(confirmDelete)} className="rounded-lg bg-rose-500/20 border border-rose-500/30 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/30 transition-colors">{locale === 'tr' ? 'Sil' : 'Delete'}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}

/* --- Content List --- */
function ContentList({ items, locale, onEdit, onDelete, onQuickStatus }: {
  items: ContentItem[]; locale: 'tr' | 'en'; onEdit: (id: string) => void; onDelete: (id: string) => void;
  onQuickStatus: (id: string, status: ContentItem['status']) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-dark-card/30 p-16 text-center">
        <p className="text-lg text-gray-600">📭</p>
        <p className="mt-2 text-sm text-gray-500">{locale === 'tr' ? 'İçerik bulunamadı.' : 'No content found.'}</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const loc = getLocalizedContent(item.content, locale);
        const info = TYPE_INFO[item.type];
        return (
          <div key={item.id} className="group flex items-center gap-3 rounded-xl border border-white/5 bg-dark-card/40 px-4 py-3.5 transition-all hover:bg-white/[0.04] hover:border-white/10">
            {/* Cover Image Thumbnail */}
            {item.coverImage && (
              <div className="hidden sm:block h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-white/5">
                <img src={item.coverImage} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            <span className="text-lg flex-shrink-0">{info.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-gray-200">{loc.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-gray-500">{locale === 'tr' ? info.tr : info.en}</span>
                <span className="text-[10px] text-gray-600">·</span>
                <span className="text-[10px] text-gray-500">{item.slug}</span>
                <span className="text-[10px] text-gray-600">·</span>
                <span className="text-[10px] text-gray-500">{new Date(item.updatedAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}</span>
              </div>
            </div>
            {/* Quick Status Toggle */}
            <div className="hidden sm:flex items-center gap-1">
              {(['published', 'draft', 'unpublished'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => onQuickStatus(item.id, s)}
                  title={s}
                  className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition-all ${item.status === s ? STATUS_STYLES[s] : 'text-gray-600 hover:text-gray-400'}`}
                >
                  {s === 'published' ? '🟢' : s === 'draft' ? '📝' : '⏸'}
                </button>
              ))}
            </div>
            <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium sm:hidden ${STATUS_STYLES[item.status]}`}>
              {item.status === 'published' ? (locale === 'tr' ? 'Yayında' : 'Live') : item.status === 'draft' ? (locale === 'tr' ? 'Taslak' : 'Draft') : '⏸'}
            </span>
            <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
              <button onClick={() => onEdit(item.id)} className="rounded-lg border border-accent-indigo/30 bg-accent-indigo/10 px-3 py-1.5 text-[11px] text-accent-indigo hover:bg-accent-indigo/20 transition-colors">{locale === 'tr' ? 'Düzenle' : 'Edit'}</button>
              <button onClick={() => onDelete(item.id)} className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-[11px] text-rose-400 hover:bg-rose-500/20 transition-colors">{locale === 'tr' ? 'Sil' : 'Del'}</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* --- Trash List --- */
function TrashList({ trash, locale, onRestore, onPermanentDelete, onEmptyTrash }: { trash: TrashedItem[]; locale: 'tr' | 'en'; onRestore: (id: string) => void; onPermanentDelete: (id: string) => void; onEmptyTrash: () => void }) {
  if (trash.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-dark-card/30 p-16 text-center">
        <p className="text-lg text-gray-600">🗑️</p>
        <p className="mt-2 text-sm text-gray-500">{locale === 'tr' ? 'Çöp kutusu boş.' : 'Trash is empty.'}</p>
      </div>
    );
  }
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] text-gray-500">{locale === 'tr' ? 'Son 10 silinen içerik. En eski otomatik silinir.' : 'Last 10 deleted items. Oldest auto-removed.'}</p>
        <button onClick={onEmptyTrash} className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-[11px] text-rose-400 hover:bg-rose-500/20 transition-colors">{locale === 'tr' ? 'Tümünü Sil' : 'Empty All'}</button>
      </div>
      <div className="space-y-2">
        {trash.map((item) => {
          const loc = getLocalizedContent(item.content, locale);
          const info = TYPE_INFO[item.type];
          return (
            <div key={item.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-dark-card/30 px-4 py-3 opacity-60 hover:opacity-90 transition-opacity">
              <span className="text-lg">{info.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm text-gray-300">{loc.title}</p>
                <p className="text-[10px] text-gray-500">{locale === 'tr' ? 'Silinme:' : 'Deleted:'} {new Date(item.deletedAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}</p>
              </div>
              <button onClick={() => onRestore(item.id)} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] text-emerald-400 hover:bg-emerald-500/20 transition-colors">{locale === 'tr' ? '↩ Geri Al' : '↩ Restore'}</button>
              <button onClick={() => onPermanentDelete(item.id)} className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-[11px] text-rose-400 hover:bg-rose-500/20 transition-colors">{locale === 'tr' ? '✕ Kalıcı Sil' : '✕ Delete'}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* --- Create Form --- */
function CreateForm({ locale, createType, setCreateType, existingSlugs, onSave, onCancel }: {
  locale: 'tr' | 'en'; createType: ContentType; setCreateType: (t: ContentType) => void;
  existingSlugs: string[]; onSave: (item: ContentItem) => void; onCancel: () => void;
}) {
  const [titleTr, setTitleTr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [summaryTr, setSummaryTr] = useState('');
  const [summaryEn, setSummaryEn] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [status, setStatus] = useState<ContentItem['status']>('draft');
  const [previewImage, setPreviewImage] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titleTr.trim()) return;

    let slug = generateSlug(titleTr);
    while (existingSlugs.includes(slug)) slug = `${slug}-${Date.now() % 1000}`;

    const now = new Date().toISOString();
    const newItem: ContentItem = {
      id: `${createType.slice(0, 3)}-${Date.now()}`,
      slug,
      type: createType,
      status,
      createdAt: now,
      updatedAt: now,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
      seo: {
        tr: { title: titleTr, description: summaryTr },
        en: { title: titleEn || titleTr, description: summaryEn || summaryTr },
      },
      content: {
        tr: { title: titleTr, summary: summaryTr },
        en: { title: titleEn || titleTr, summary: summaryEn || summaryTr },
      },
    };
    onSave(newItem);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-white/5 bg-dark-card/30 p-5">
        <label className="mb-3 block text-xs font-medium text-gray-400">{locale === 'tr' ? 'İçerik Türü Seç' : 'Select Content Type'}</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TYPES.map((type) => {
            const info = TYPE_INFO[type];
            return (
              <button key={type} type="button" onClick={() => setCreateType(type)}
                className={`rounded-xl border p-4 text-left transition-all ${createType === type ? 'border-accent-turquoise/50 bg-accent-turquoise/10 shadow-sm' : 'border-white/5 bg-dark-card/40 hover:border-white/10'}`}>
                <span className="text-xl">{info.icon}</span>
                <p className="mt-2 text-xs font-medium text-gray-200">{locale === 'tr' ? info.tr : info.en}</p>
                <p className="mt-0.5 text-[10px] text-gray-500">{locale === 'tr' ? info.desc_tr : info.desc_en}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-white/5 bg-dark-card/30 p-5 space-y-4">
        <p className="text-xs font-medium text-gray-400">{locale === 'tr' ? '📝 İçerik Bilgileri' : '📝 Content Details'}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={`${locale === 'tr' ? 'Başlık' : 'Title'} (TR) *`} value={titleTr} onChange={setTitleTr} required />
          <Field label={`${locale === 'tr' ? 'Başlık' : 'Title'} (EN)`} value={titleEn} onChange={setTitleEn} placeholder={locale === 'tr' ? 'Boş bırakılırsa TR kullanılır' : 'Falls back to TR if empty'} />
          <Field label={`${locale === 'tr' ? 'Özet' : 'Summary'} (TR)`} value={summaryTr} onChange={setSummaryTr} multiline />
          <Field label={`${locale === 'tr' ? 'Özet' : 'Summary'} (EN)`} value={summaryEn} onChange={setSummaryEn} multiline />
        </div>
      </div>

      <div className="rounded-xl border border-white/5 bg-dark-card/30 p-5 space-y-3">
        <p className="text-xs font-medium text-gray-400">{locale === 'tr' ? '🖼 Kapak Görseli' : '🖼 Cover Image'}</p>
        <Field label="URL" value={coverImage} onChange={(v) => { setCoverImage(v); setPreviewImage(false); }} placeholder="https://images.unsplash.com/..." />
        {coverImage && (
          <div>
            <button type="button" onClick={() => setPreviewImage(!previewImage)} className="text-[11px] text-accent-turquoise hover:underline">
              {previewImage ? (locale === 'tr' ? 'Önizlemeyi Gizle' : 'Hide Preview') : (locale === 'tr' ? 'Önizle' : 'Preview')}
            </button>
            {previewImage && (
              <div className="mt-2 h-40 w-full overflow-hidden rounded-lg border border-white/10">
                <img src={coverImage} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-white/5 bg-dark-card/30 p-5">
        <label className="mb-2 block text-xs font-medium text-gray-400">{locale === 'tr' ? 'Yayın Durumu' : 'Publish Status'}</label>
        <div className="flex gap-2">
          {(['draft', 'published'] as const).map((s) => (
            <button key={s} type="button" onClick={() => setStatus(s)}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${status === s ? STATUS_STYLES[s] + ' shadow-sm' : 'border border-white/10 text-gray-500 hover:text-gray-300'}`}>
              {s === 'draft' ? (locale === 'tr' ? '📝 Taslak' : '📝 Draft') : (locale === 'tr' ? '🟢 Yayınla' : '🟢 Publish')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onCancel} className="rounded-lg border border-white/10 px-5 py-2.5 text-xs text-gray-400 hover:text-white transition-colors">{locale === 'tr' ? 'İptal' : 'Cancel'}</button>
        <button type="submit" className="rounded-lg bg-accent-turquoise/20 border border-accent-turquoise/30 px-5 py-2.5 text-xs font-medium text-accent-turquoise hover:bg-accent-turquoise/30 transition-all">{locale === 'tr' ? '✓ Oluştur' : '✓ Create'}</button>
      </div>
    </form>
  );
}

/* --- Edit Form --- */
function EditForm({ item, locale, onSave, onCancel }: { item: ContentItem; locale: 'tr' | 'en'; onSave: (updates: Partial<ContentItem>) => void; onCancel: () => void }) {
  const trContent = item.content?.tr || { title: '', summary: '' };
  const enContent = item.content?.en || { title: '', summary: '' };

  const [titleTr, setTitleTr] = useState(trContent.title || '');
  const [titleEn, setTitleEn] = useState(enContent.title || '');
  const [summaryTr, setSummaryTr] = useState(trContent.summary || '');
  const [summaryEn, setSummaryEn] = useState(enContent.summary || '');
  const [coverImage, setCoverImage] = useState(item.coverImage || '');
  const [status, setStatus] = useState(item.status);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      status,
      coverImage,
      seo: {
        tr: { title: titleTr, description: summaryTr },
        en: { title: titleEn, description: summaryEn },
      },
      content: {
        tr: { ...trContent, title: titleTr, summary: summaryTr },
        en: { ...enContent, title: titleEn, summary: summaryEn },
      },
    });
  }

  const info = TYPE_INFO[item.type];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-dark-card/30 px-4 py-3">
        <span className="text-xl">{info.icon}</span>
        <div>
          <p className="text-sm font-medium text-gray-200">{locale === 'tr' ? 'Düzenleniyor' : 'Editing'}</p>
          <p className="text-[11px] text-gray-500">{locale === 'tr' ? info.tr : info.en} · {item.slug}</p>
        </div>
        {item.coverImage && (
          <div className="ml-auto h-10 w-16 overflow-hidden rounded-lg border border-white/10">
            <img src={item.coverImage} alt="" className="h-full w-full object-cover" />
          </div>
        )}
      </div>

      <div className="rounded-xl border border-white/5 bg-dark-card/30 p-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={`${locale === 'tr' ? 'Başlık' : 'Title'} (TR) *`} value={titleTr} onChange={setTitleTr} required />
          <Field label={`${locale === 'tr' ? 'Başlık' : 'Title'} (EN)`} value={titleEn} onChange={setTitleEn} />
          <Field label={`${locale === 'tr' ? 'Özet' : 'Summary'} (TR)`} value={summaryTr} onChange={setSummaryTr} multiline />
          <Field label={`${locale === 'tr' ? 'Özet' : 'Summary'} (EN)`} value={summaryEn} onChange={setSummaryEn} multiline />
        </div>
      </div>

      <div className="rounded-xl border border-white/5 bg-dark-card/30 p-5">
        <Field label={`${locale === 'tr' ? 'Kapak Görseli URL' : 'Cover Image URL'}`} value={coverImage} onChange={setCoverImage} />
      </div>

      <div className="rounded-xl border border-white/5 bg-dark-card/30 p-5">
        <label className="mb-2 block text-xs font-medium text-gray-400">{locale === 'tr' ? 'Durum' : 'Status'}</label>
        <div className="flex gap-2">
          {(['draft', 'published', 'unpublished'] as const).map((s) => (
            <button key={s} type="button" onClick={() => setStatus(s)}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${status === s ? STATUS_STYLES[s] + ' shadow-sm' : 'border border-white/10 text-gray-500 hover:text-gray-300'}`}>
              {s === 'draft' ? (locale === 'tr' ? '📝 Taslak' : '📝 Draft') : s === 'published' ? (locale === 'tr' ? '🟢 Yayında' : '🟢 Published') : (locale === 'tr' ? '⏸ Kaldır' : '⏸ Unpublish')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onCancel} className="rounded-lg border border-white/10 px-5 py-2.5 text-xs text-gray-400 hover:text-white transition-colors">{locale === 'tr' ? 'İptal' : 'Cancel'}</button>
        <button type="submit" className="rounded-lg bg-accent-turquoise/20 border border-accent-turquoise/30 px-5 py-2.5 text-xs font-medium text-accent-turquoise hover:bg-accent-turquoise/30 transition-all">{locale === 'tr' ? '✓ Kaydet' : '✓ Save'}</button>
      </div>
    </form>
  );
}

/* --- Reusable Field --- */
function Field({ label, value, onChange, multiline, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string; required?: boolean;
}) {
  const cls = "w-full rounded-lg border border-white/10 bg-dark-card/60 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-accent-turquoise/40 transition-colors";
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-medium text-gray-400">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} className={`${cls} min-h-[80px] resize-y`} placeholder={placeholder} required={required} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={cls} placeholder={placeholder} required={required} />
      )}
    </div>
  );
}
