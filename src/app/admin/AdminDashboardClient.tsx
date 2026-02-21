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
import type { ContentItem, LocationContent, Comment } from '@/types';
import { getComments, updateCommentStatus, deleteComment as deleteCommentStore } from '@/lib/comments-store';
import { getViews, getDailyViews } from '@/lib/user-profile';

interface Props { items: ContentItem[] }
type Tab = 'content' | 'trash' | 'create' | 'edit' | 'comments' | 'analytics';
type ContentType = ContentItem['type'];
type SortKey = 'date' | 'name' | 'type';

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
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);

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
    TYPES.forEach((tp) => { byType[tp] = allItems.filter((i) => i.type === tp).length; });
    return { total: allItems.length, published: allItems.filter((i) => i.status === 'published').length, draft: allItems.filter((i) => i.status === 'draft').length, trashCount: trash.length, byType };
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
    // Sort
    result = [...result].sort((a, b) => {
      if (sortKey === 'name') {
        const aT = getLocalizedContent(a.content, locale).title || '';
        const bT = getLocalizedContent(b.content, locale).title || '';
        return aT.localeCompare(bT);
      }
      if (sortKey === 'type') return a.type.localeCompare(b.type);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    return result;
  }, [allItems, filterType, filterStatus, searchQuery, locale, sortKey]);

  // Bulk operations
  function handleBulkDelete() {
    let updated = allItems;
    selectedIds.forEach((id) => { updated = removeItem(updated, id); });
    setAllItems(updated);
    setTrash(getTrash());
    setSelectedIds(new Set());
    showToast(locale === 'tr' ? `${selectedIds.size} içerik silindi` : `${selectedIds.size} items deleted`);
  }
  function handleBulkStatus(status: ContentItem['status']) {
    let updated = allItems;
    selectedIds.forEach((id) => { updated = editItem(updated, id, { status }); });
    setAllItems(updated);
    setSelectedIds(new Set());
    showToast(locale === 'tr' ? 'Durumlar güncellendi' : 'Status updated');
  }
  function toggleSelect(id: string) {
    setSelectedIds((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }
  function selectAll() {
    if (selectedIds.size === filteredItems.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredItems.map((i) => i.id)));
  }

  function handleDelete(id: string) {
    setAllItems(removeItem(allItems, id)); setTrash(getTrash()); setConfirmDelete(null);
    showToast(locale === 'tr' ? 'Çöp kutusuna taşındı' : 'Moved to trash');
  }
  function handleQuickStatus(id: string, status: ContentItem['status']) {
    setAllItems(editItem(allItems, id, { status }));
    showToast(locale === 'tr' ? 'Durum güncellendi' : 'Status updated');
  }
  function handleRestore(id: string) {
    const r = restoreItem(allItems, id); setAllItems(r.items); setTrash(r.trash);
    showToast(locale === 'tr' ? 'Geri alındı' : 'Restored');
  }
  function handlePermanentDelete(id: string) { setTrash(permanentDelete(id)); showToast(locale === 'tr' ? 'Kalıcı silindi' : 'Permanently deleted'); }
  function handleEmptyTrash() { setTrash(emptyTrash()); showToast(locale === 'tr' ? 'Çöp boşaltıldı' : 'Trash emptied'); }
  function handleSaveNew(item: ContentItem) { setAllItems(addItem(allItems, item)); setTab('content'); showToast(locale === 'tr' ? 'İçerik oluşturuldu' : 'Content created'); }
  function handleSaveEdit(id: string, updates: Partial<ContentItem>) { setAllItems(editItem(allItems, id, updates)); setEditingId(null); setTab('content'); showToast(locale === 'tr' ? 'İçerik güncellendi' : 'Content updated'); }
  function handleLogout() { logout(); router.push('/'); }

  const editingItem = editingId ? allItems.find((i) => i.id === editingId) : null;

  return (
    <AuthGuard>
      <div className="min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {toast && <div className="fixed top-20 right-4 z-50 rounded-lg border border-accent-turquoise/30 bg-dark-card px-4 py-2.5 text-sm text-accent-turquoise shadow-lg backdrop-blur-sm">{toast}</div>}

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-100 tracking-tight">{locale === 'tr' ? '🛠 Yönetim Paneli' : '🛠 Admin Panel'}</h1>
              <p className="mt-1 text-xs text-gray-500">{locale === 'tr' ? 'İçeriklerini yönet, düzenle ve yayınla.' : 'Manage, edit and publish your content.'}</p>
            </div>
            <button onClick={handleLogout} className="rounded-lg border border-white/10 px-4 py-2 text-xs text-gray-400 hover:text-rose-400 hover:border-rose-500/30 transition-all">{locale === 'tr' ? '🚪 Çıkış' : '🚪 Logout'}</button>
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: locale === 'tr' ? 'Toplam' : 'Total', val: stats.total, icon: '📊', color: 'border-l-accent-turquoise' },
              { label: locale === 'tr' ? 'Yayında' : 'Published', val: stats.published, icon: '🟢', color: 'border-l-emerald-500' },
              { label: locale === 'tr' ? 'Taslak' : 'Draft', val: stats.draft, icon: '📝', color: 'border-l-amber-500' },
              { label: locale === 'tr' ? 'Çöp' : 'Trash', val: stats.trashCount, icon: '🗑️', color: 'border-l-rose-500' },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl border border-white/5 border-l-2 ${s.color} bg-dark-card/50 px-4 py-4`}>
                <div className="flex items-center justify-between"><p className="text-2xl font-bold text-gray-100">{s.val}</p><span className="text-lg">{s.icon}</span></div>
                <p className="mt-1 text-[11px] text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Type Breakdown */}
          <div className="mb-8 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TYPES.map((type) => { const info = TYPE_INFO[type]; return (
              <div key={type} className="flex items-center gap-2.5 rounded-lg border border-white/5 bg-dark-card/30 px-3 py-2.5">
                <span className="text-base">{info.icon}</span>
                <div><p className="text-sm font-semibold text-gray-200">{stats.byType[type] || 0}</p><p className="text-[10px] text-gray-500">{locale === 'tr' ? info.tr : info.en}</p></div>
              </div>
            ); })}
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-xl border border-white/5 bg-dark-card/30 p-1">
            {(['content', 'create', 'comments', 'analytics', 'trash'] as Tab[]).map((tabItem) => (
              <button key={tabItem} onClick={() => { setTab(tabItem); setEditingId(null); setBulkMode(false); setSelectedIds(new Set()); }}
                className={`flex-1 rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${tab === tabItem ? 'bg-accent-turquoise/15 text-accent-turquoise shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}>
                {tabItem === 'content' ? (locale === 'tr' ? '📋 İçerikler' : '📋 Content') : tabItem === 'create' ? (locale === 'tr' ? '➕ Yeni' : '➕ New') : tabItem === 'comments' ? (locale === 'tr' ? '💬 Yorumlar' : '💬 Comments') : tabItem === 'analytics' ? (locale === 'tr' ? '📊 Analitik' : '📊 Analytics') : `🗑️ ${locale === 'tr' ? 'Çöp' : 'Trash'} (${stats.trashCount})`}
              </button>
            ))}
          </div>

          {/* Content Tab */}
          {tab === 'content' && !editingId && (
            <>
              <div className="mb-4 space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">🔍</span>
                    <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={locale === 'tr' ? 'İçerik ara...' : 'Search content...'}
                      className="w-full rounded-xl border border-white/10 bg-dark-card/60 pl-10 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-accent-turquoise/40 transition-colors" />
                  </div>
                  {/* Sort */}
                  <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}
                    className="rounded-xl border border-white/10 bg-dark-card/60 px-3 py-2 text-xs text-gray-300 outline-none focus:border-accent-turquoise/40">
                    <option value="date">{locale === 'tr' ? '📅 Tarih' : '📅 Date'}</option>
                    <option value="name">{locale === 'tr' ? '🔤 İsim' : '🔤 Name'}</option>
                    <option value="type">{locale === 'tr' ? '📁 Tür' : '📁 Type'}</option>
                  </select>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setFilterType('all')} className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${filterType === 'all' ? 'bg-accent-turquoise/20 text-accent-turquoise' : 'border border-white/10 text-gray-500 hover:text-gray-300'}`}>{locale === 'tr' ? 'Tüm Türler' : 'All Types'}</button>
                  {TYPES.map((type) => { const info = TYPE_INFO[type]; return (
                    <button key={type} onClick={() => setFilterType(filterType === type ? 'all' : type)} className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${filterType === type ? 'bg-accent-turquoise/20 text-accent-turquoise' : 'border border-white/10 text-gray-500 hover:text-gray-300'}`}>{info.icon} {locale === 'tr' ? info.tr : info.en}</button>
                  ); })}
                  <span className="mx-1 border-l border-white/10" />
                  {(['all', 'published', 'draft', 'unpublished'] as const).map((s) => (
                    <button key={s} onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)} className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${filterStatus === s ? 'bg-accent-turquoise/20 text-accent-turquoise' : 'border border-white/10 text-gray-500 hover:text-gray-300'}`}>
                      {s === 'all' ? (locale === 'tr' ? 'Tümü' : 'All') : s === 'published' ? '🟢' : s === 'draft' ? '📝' : '⏸'}
                    </button>
                  ))}
                </div>
                {/* Bulk Mode Bar */}
                <div className="flex items-center gap-3">
                  <button onClick={() => { setBulkMode(!bulkMode); setSelectedIds(new Set()); }} className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-colors ${bulkMode ? 'bg-accent-indigo/20 text-accent-indigo' : 'border border-white/10 text-gray-500 hover:text-gray-300'}`}>
                    {bulkMode ? (locale === 'tr' ? '✕ Toplu Modu Kapat' : '✕ Exit Bulk') : (locale === 'tr' ? '☑ Toplu İşlem' : '☑ Bulk Actions')}
                  </button>
                  {bulkMode && (
                    <>
                      <button onClick={selectAll} className="text-[11px] text-gray-500 hover:text-gray-300">{selectedIds.size === filteredItems.length ? (locale === 'tr' ? 'Seçimi Kaldır' : 'Deselect All') : (locale === 'tr' ? 'Tümünü Seç' : 'Select All')}</button>
                      {selectedIds.size > 0 && (
                        <>
                          <span className="text-[10px] text-gray-600">|</span>
                          <button onClick={() => handleBulkStatus('published')} className="rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[11px] text-emerald-400 hover:bg-emerald-500/20">🟢 {locale === 'tr' ? 'Yayınla' : 'Publish'} ({selectedIds.size})</button>
                          <button onClick={() => handleBulkStatus('draft')} className="rounded-md bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-[11px] text-amber-400 hover:bg-amber-500/20">📝 {locale === 'tr' ? 'Taslak' : 'Draft'} ({selectedIds.size})</button>
                          <button onClick={handleBulkDelete} className="rounded-md bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 text-[11px] text-rose-400 hover:bg-rose-500/20">🗑️ {locale === 'tr' ? 'Sil' : 'Delete'} ({selectedIds.size})</button>
                        </>
                      )}
                    </>
                  )}
                  <span className="ml-auto text-[11px] text-gray-500">{filteredItems.length} / {allItems.length}</span>
                </div>
              </div>
              <ContentList items={filteredItems} locale={locale} onEdit={(id) => { setEditingId(id); setTab('edit'); }} onDelete={(id) => setConfirmDelete(id)} onQuickStatus={handleQuickStatus} bulkMode={bulkMode} selectedIds={selectedIds} onToggleSelect={toggleSelect} />
            </>
          )}
          {tab === 'edit' && editingItem && <EditForm item={editingItem} locale={locale} onSave={(u) => handleSaveEdit(editingItem.id, u)} onCancel={() => { setEditingId(null); setTab('content'); }} />}
          {tab === 'create' && <CreateForm locale={locale} createType={createType} setCreateType={setCreateType} existingSlugs={allItems.map(i => i.slug)} onSave={handleSaveNew} onCancel={() => setTab('content')} />}
          {tab === 'trash' && <TrashList trash={trash} locale={locale} onRestore={handleRestore} onPermanentDelete={handlePermanentDelete} onEmptyTrash={handleEmptyTrash} />}
          {tab === 'comments' && <CommentModeration locale={locale} onToast={showToast} />}
          {tab === 'analytics' && <AnalyticsDashboard items={allItems} locale={locale} />}

          {confirmDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
              <div className="mx-4 w-full max-w-sm rounded-xl border border-white/10 bg-dark-card p-6" onClick={(e) => e.stopPropagation()}>
                <p className="mb-4 text-sm text-gray-200">{locale === 'tr' ? 'Bu içeriği silmek istediğinize emin misiniz?' : 'Are you sure you want to delete this?'}</p>
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

/* --- Content List with Bulk Select --- */
function ContentList({ items, locale, onEdit, onDelete, onQuickStatus, bulkMode, selectedIds, onToggleSelect }: {
  items: ContentItem[]; locale: 'tr' | 'en'; onEdit: (id: string) => void; onDelete: (id: string) => void;
  onQuickStatus: (id: string, status: ContentItem['status']) => void;
  bulkMode: boolean; selectedIds: Set<string>; onToggleSelect: (id: string) => void;
}) {
  if (items.length === 0) return <div className="rounded-xl border border-dashed border-white/10 bg-dark-card/30 p-16 text-center"><p className="text-lg text-gray-600">📭</p><p className="mt-2 text-sm text-gray-500">{locale === 'tr' ? 'İçerik bulunamadı.' : 'No content found.'}</p></div>;
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const loc = getLocalizedContent(item.content, locale);
        const info = TYPE_INFO[item.type];
        const isSelected = selectedIds.has(item.id);
        return (
          <div key={item.id} className={`group flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-all hover:bg-white/[0.04] ${isSelected ? 'border-accent-turquoise/30 bg-accent-turquoise/5' : 'border-white/5 bg-dark-card/40'}`}>
            {bulkMode && (
              <button onClick={() => onToggleSelect(item.id)} className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-colors ${isSelected ? 'border-accent-turquoise bg-accent-turquoise text-dark' : 'border-white/20 hover:border-white/40'}`}>
                {isSelected && <span className="text-[10px]">✓</span>}
              </button>
            )}
            {item.coverImage && <div className="hidden sm:block h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-white/5"><img src={item.coverImage} alt="" className="h-full w-full object-cover" /></div>}
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
            <div className="hidden sm:flex items-center gap-1">
              {(['published', 'draft', 'unpublished'] as const).map((s) => (
                <button key={s} onClick={() => onQuickStatus(item.id, s)} title={s} className={`rounded-md px-2 py-0.5 text-[10px] font-medium transition-all ${item.status === s ? STATUS_STYLES[s] : 'text-gray-600 hover:text-gray-400'}`}>
                  {s === 'published' ? '🟢' : s === 'draft' ? '📝' : '⏸'}
                </button>
              ))}
            </div>
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
  if (trash.length === 0) return <div className="rounded-xl border border-dashed border-white/10 bg-dark-card/30 p-16 text-center"><p className="text-lg text-gray-600">🗑️</p><p className="mt-2 text-sm text-gray-500">{locale === 'tr' ? 'Çöp kutusu boş.' : 'Trash is empty.'}</p></div>;
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] text-gray-500">{locale === 'tr' ? 'Son 10 silinen içerik.' : 'Last 10 deleted items.'}</p>
        <button onClick={onEmptyTrash} className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-[11px] text-rose-400 hover:bg-rose-500/20 transition-colors">{locale === 'tr' ? 'Tümünü Sil' : 'Empty All'}</button>
      </div>
      <div className="space-y-2">
        {trash.map((item) => { const loc = getLocalizedContent(item.content, locale); const info = TYPE_INFO[item.type]; return (
          <div key={item.id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-dark-card/30 px-4 py-3 opacity-60 hover:opacity-90 transition-opacity">
            <span className="text-lg">{info.icon}</span>
            <div className="flex-1 min-w-0"><p className="truncate text-sm text-gray-300">{loc.title}</p><p className="text-[10px] text-gray-500">{new Date(item.deletedAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}</p></div>
            <button onClick={() => onRestore(item.id)} className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-[11px] text-emerald-400 hover:bg-emerald-500/20 transition-colors">{locale === 'tr' ? '↩ Geri Al' : '↩ Restore'}</button>
            <button onClick={() => onPermanentDelete(item.id)} className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-[11px] text-rose-400 hover:bg-rose-500/20 transition-colors">{locale === 'tr' ? '✕ Sil' : '✕ Delete'}</button>
          </div>
        ); })}
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
  // Location-specific
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [citizenship, setCitizenship] = useState('');
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [budgetItems, setBudgetItems] = useState([{ category: '', amount: '', currency: 'EUR', note: '' }]);
  // Blog-specific
  const [bodyTr, setBodyTr] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [tagsTr, setTagsTr] = useState('');
  const [tagsEn, setTagsEn] = useState('');

  function addBudgetRow() { setBudgetItems([...budgetItems, { category: '', amount: '', currency: 'EUR', note: '' }]); }
  function updateBudget(idx: number, field: string, val: string) {
    const updated = [...budgetItems]; (updated[idx] as Record<string, string>)[field] = val; setBudgetItems(updated);
  }
  function removeBudgetRow(idx: number) { setBudgetItems(budgetItems.filter((_, i) => i !== idx)); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titleTr.trim()) return;
    let slug = generateSlug(titleTr);
    while (existingSlugs.includes(slug)) slug = `${slug}-${Date.now() % 1000}`;
    const now = new Date().toISOString();
    const gallery = galleryUrls.filter(u => u.trim());
    const budget = budgetItems.filter(b => b.category && b.amount).map(b => ({ category: b.category, amount: Number(b.amount), currency: b.currency, note: b.note }));

    const baseContent = { title: titleTr, summary: summaryTr };
    const baseContentEn = { title: titleEn || titleTr, summary: summaryEn || summaryTr };

    const locationExtra = createType === 'location' ? {
      city, country, citizenship, gallery,
      estimatedBudget: budget,
      introduction: '', transportation: '', accommodation: '', museums: '', historicalPlaces: '', restaurants: '',
      dailyRoutePlan: [], coordinates: { lat: 0, lng: 0 },
    } : {};

    const blogExtra = createType === 'blog' ? {
      body: bodyTr, tags: tagsTr.split(',').map(t => t.trim()).filter(Boolean),
    } : {};
    const blogExtraEn = createType === 'blog' ? {
      body: bodyEn || bodyTr, tags: (tagsEn || tagsTr).split(',').map(t => t.trim()).filter(Boolean),
    } : {};

    const newItem: ContentItem = {
      id: `${createType.slice(0, 3)}-${Date.now()}`, slug, type: createType, status, createdAt: now, updatedAt: now,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
      seo: { tr: { title: titleTr, description: summaryTr }, en: { title: titleEn || titleTr, description: summaryEn || summaryTr } },
      content: { tr: { ...baseContent, ...locationExtra, ...blogExtra }, en: { ...baseContentEn, ...locationExtra, ...blogExtraEn } },
    };
    onSave(newItem);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-xl border border-white/5 bg-dark-card/30 p-5">
        <label className="mb-3 block text-xs font-medium text-gray-400">{locale === 'tr' ? 'İçerik Türü' : 'Content Type'}</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TYPES.map((type) => { const info = TYPE_INFO[type]; return (
            <button key={type} type="button" onClick={() => setCreateType(type)}
              className={`rounded-xl border p-3 text-left transition-all ${createType === type ? 'border-accent-turquoise/50 bg-accent-turquoise/10' : 'border-white/5 bg-dark-card/40 hover:border-white/10'}`}>
              <span className="text-xl">{info.icon}</span>
              <p className="mt-1 text-xs font-medium text-gray-200">{locale === 'tr' ? info.tr : info.en}</p>
            </button>
          ); })}
        </div>
      </div>

      <div className="rounded-xl border border-white/5 bg-dark-card/30 p-5 space-y-4">
        <p className="text-xs font-medium text-gray-400">📝 {locale === 'tr' ? 'Temel Bilgiler' : 'Basic Info'}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={`${locale === 'tr' ? 'Başlık' : 'Title'} (TR) *`} value={titleTr} onChange={setTitleTr} required />
          <Field label={`${locale === 'tr' ? 'Başlık' : 'Title'} (EN)`} value={titleEn} onChange={setTitleEn} />
          <Field label={`${locale === 'tr' ? 'Özet' : 'Summary'} (TR)`} value={summaryTr} onChange={setSummaryTr} multiline />
          <Field label={`${locale === 'tr' ? 'Özet' : 'Summary'} (EN)`} value={summaryEn} onChange={setSummaryEn} multiline />
        </div>
        <CoverImageField value={coverImage} onChange={setCoverImage} locale={locale} />
      </div>

      {/* Location-specific fields */}
      {createType === 'location' && (
        <>
          <div className="rounded-xl border border-white/5 bg-dark-card/30 p-5 space-y-4">
            <p className="text-xs font-medium text-gray-400">📍 {locale === 'tr' ? 'Lokasyon Bilgileri' : 'Location Details'}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label={locale === 'tr' ? 'Şehir' : 'City'} value={city} onChange={setCity} />
              <Field label={locale === 'tr' ? 'Ülke' : 'Country'} value={country} onChange={setCountry} />
              <Field label={locale === 'tr' ? 'Vatandaşlık/Vize' : 'Citizenship/Visa'} value={citizenship} onChange={setCitizenship} />
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-dark-card/30 p-5 space-y-3">
            <p className="text-xs font-medium text-gray-400">💰 {locale === 'tr' ? 'Tahmini Bütçe' : 'Estimated Budget'}</p>
            {budgetItems.map((b, i) => (
              <div key={i} className="flex gap-2 items-end">
                <div className="flex-1"><Field label={locale === 'tr' ? 'Kategori' : 'Category'} value={b.category} onChange={(v) => updateBudget(i, 'category', v)} placeholder={locale === 'tr' ? 'Konaklama, Yemek...' : 'Accommodation, Food...'} /></div>
                <div className="w-24"><Field label={locale === 'tr' ? 'Tutar' : 'Amount'} value={b.amount} onChange={(v) => updateBudget(i, 'amount', v)} placeholder="50" /></div>
                <div className="w-20"><Field label={locale === 'tr' ? 'Para' : 'Curr.'} value={b.currency} onChange={(v) => updateBudget(i, 'currency', v)} /></div>
                {budgetItems.length > 1 && <button type="button" onClick={() => removeBudgetRow(i)} className="mb-0.5 text-rose-400 hover:text-rose-300 text-sm">✕</button>}
              </div>
            ))}
            <button type="button" onClick={addBudgetRow} className="text-[11px] text-accent-turquoise hover:underline">+ {locale === 'tr' ? 'Satır Ekle' : 'Add Row'}</button>
          </div>

          <div className="rounded-xl border border-white/5 bg-dark-card/30 p-5 space-y-3">
            <p className="text-xs font-medium text-gray-400">🖼 {locale === 'tr' ? 'Galeri URL\'leri' : 'Gallery URLs'}</p>
            <GalleryEditor urls={galleryUrls} onChange={setGalleryUrls} locale={locale} />
          </div>
        </>
      )}

      {/* Blog-specific fields */}
      {createType === 'blog' && (
        <div className="rounded-xl border border-white/5 bg-dark-card/30 p-5 space-y-4">
          <p className="text-xs font-medium text-gray-400">✍️ {locale === 'tr' ? 'Blog İçeriği (Markdown)' : 'Blog Content (Markdown)'}</p>
          <p className="text-[10px] text-gray-600">{locale === 'tr' ? 'Markdown desteklenir: # başlık, **kalın**, *italik*, `kod`, > alıntı, - liste, [link](url), ```kod bloğu```' : 'Markdown supported: # heading, **bold**, *italic*, `code`, > quote, - list, [link](url), ```code block```'}</p>
          <Field label={`${locale === 'tr' ? 'İçerik' : 'Body'} (TR)`} value={bodyTr} onChange={setBodyTr} multiline placeholder={locale === 'tr' ? '## Başlık\n\nBlog yazınızı buraya yazın...' : '## Heading\n\nWrite your blog post here...'} />
          <Field label={`${locale === 'tr' ? 'İçerik' : 'Body'} (EN)`} value={bodyEn} onChange={setBodyEn} multiline placeholder="Optional — falls back to TR" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={`${locale === 'tr' ? 'Etiketler' : 'Tags'} (TR)`} value={tagsTr} onChange={setTagsTr} placeholder={locale === 'tr' ? 'seyahat, ipucu, rehber' : 'travel, tips, guide'} />
            <Field label={`${locale === 'tr' ? 'Etiketler' : 'Tags'} (EN)`} value={tagsEn} onChange={setTagsEn} placeholder="travel, tips, guide" />
          </div>
        </div>
      )}

      <div className="rounded-xl border border-white/5 bg-dark-card/30 p-5">
        <label className="mb-2 block text-xs font-medium text-gray-400">{locale === 'tr' ? 'Durum' : 'Status'}</label>
        <div className="flex gap-2">
          {(['draft', 'published'] as const).map((s) => (
            <button key={s} type="button" onClick={() => setStatus(s)} className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${status === s ? STATUS_STYLES[s] : 'border border-white/10 text-gray-500 hover:text-gray-300'}`}>
              {s === 'draft' ? (locale === 'tr' ? '📝 Taslak' : '📝 Draft') : (locale === 'tr' ? '🟢 Yayınla' : '🟢 Publish')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="rounded-lg border border-white/10 px-5 py-2.5 text-xs text-gray-400 hover:text-white transition-colors">{locale === 'tr' ? 'İptal' : 'Cancel'}</button>
        <button type="submit" className="rounded-lg bg-accent-turquoise/20 border border-accent-turquoise/30 px-5 py-2.5 text-xs font-medium text-accent-turquoise hover:bg-accent-turquoise/30 transition-all">{locale === 'tr' ? '✓ Oluştur' : '✓ Create'}</button>
      </div>
    </form>
  );
}

/* --- Edit Form with Location Fields --- */
function EditForm({ item, locale, onSave, onCancel }: { item: ContentItem; locale: 'tr' | 'en'; onSave: (updates: Partial<ContentItem>) => void; onCancel: () => void }) {
  const trContent = item.content?.tr || { title: '', summary: '' };
  const enContent = item.content?.en || { title: '', summary: '' };
  const trLoc = trContent as LocationContent;

  const [titleTr, setTitleTr] = useState(trContent.title || '');
  const [titleEn, setTitleEn] = useState(enContent.title || '');
  const [summaryTr, setSummaryTr] = useState(trContent.summary || '');
  const [summaryEn, setSummaryEn] = useState(enContent.summary || '');
  const [coverImage, setCoverImage] = useState(item.coverImage || '');
  const [status, setStatus] = useState(item.status);
  // Location fields
  const [city, setCity] = useState(trLoc.city || '');
  const [country, setCountry] = useState(trLoc.country || '');
  const [citizenship, setCitizenship] = useState(trLoc.citizenship || '');
  const [galleryUrls, setGalleryUrls] = useState<string[]>(trLoc.gallery || []);
  const [budgetItems, setBudgetItems] = useState(
    (trLoc.estimatedBudget || []).length > 0
      ? trLoc.estimatedBudget.map(b => ({ category: b.category, amount: String(b.amount), currency: b.currency, note: b.note }))
      : [{ category: '', amount: '', currency: 'EUR', note: '' }]
  );
  // Blog fields
  const trBlog = trContent as unknown as Record<string, unknown>;
  const enBlog = enContent as unknown as Record<string, unknown>;
  const [bodyTr, setBodyTr] = useState((trBlog.body as string) || '');
  const [bodyEn, setBodyEn] = useState((enBlog.body as string) || '');
  const [tagsTr, setTagsTr] = useState(((trBlog.tags as string[]) || []).join(', '));
  const [tagsEn, setTagsEn] = useState(((enBlog.tags as string[]) || []).join(', '));

  function addBudgetRow() { setBudgetItems([...budgetItems, { category: '', amount: '', currency: 'EUR', note: '' }]); }
  function updateBudget(idx: number, field: string, val: string) {
    const updated = [...budgetItems]; (updated[idx] as Record<string, string>)[field] = val; setBudgetItems(updated);
  }
  function removeBudgetRow(idx: number) { setBudgetItems(budgetItems.filter((_, i) => i !== idx)); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const gallery = galleryUrls.filter(u => u.trim());
    const budget = budgetItems.filter(b => b.category && b.amount).map(b => ({ category: b.category, amount: Number(b.amount), currency: b.currency, note: b.note }));

    const locationUpdates = item.type === 'location' ? { city, country, citizenship, gallery, estimatedBudget: budget } : {};
    const blogUpdates = item.type === 'blog' ? { body: bodyTr, tags: tagsTr.split(',').map(t => t.trim()).filter(Boolean) } : {};
    const blogUpdatesEn = item.type === 'blog' ? { body: bodyEn || bodyTr, tags: (tagsEn || tagsTr).split(',').map(t => t.trim()).filter(Boolean) } : {};

    onSave({
      status, coverImage,
      seo: { tr: { title: titleTr, description: summaryTr }, en: { title: titleEn, description: summaryEn } },
      content: {
        tr: { ...trContent, title: titleTr, summary: summaryTr, ...locationUpdates, ...blogUpdates },
        en: { ...enContent, title: titleEn, summary: summaryEn, ...locationUpdates, ...blogUpdatesEn },
      },
    });
  }

  const info = TYPE_INFO[item.type];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-dark-card/30 px-4 py-3">
        <span className="text-xl">{info.icon}</span>
        <div><p className="text-sm font-medium text-gray-200">{locale === 'tr' ? 'Düzenleniyor' : 'Editing'}</p><p className="text-[11px] text-gray-500">{item.slug}</p></div>
        {item.coverImage && <div className="ml-auto h-10 w-16 overflow-hidden rounded-lg border border-white/10"><img src={item.coverImage} alt="" className="h-full w-full object-cover" /></div>}
      </div>

      <div className="rounded-xl border border-white/5 bg-dark-card/30 p-5 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={`${locale === 'tr' ? 'Başlık' : 'Title'} (TR) *`} value={titleTr} onChange={setTitleTr} required />
          <Field label={`${locale === 'tr' ? 'Başlık' : 'Title'} (EN)`} value={titleEn} onChange={setTitleEn} />
          <Field label={`${locale === 'tr' ? 'Özet' : 'Summary'} (TR)`} value={summaryTr} onChange={setSummaryTr} multiline />
          <Field label={`${locale === 'tr' ? 'Özet' : 'Summary'} (EN)`} value={summaryEn} onChange={setSummaryEn} multiline />
        </div>
        <CoverImageField value={coverImage} onChange={setCoverImage} locale={locale} />
      </div>

      {/* Location-specific edit fields */}
      {item.type === 'location' && (
        <>
          <div className="rounded-xl border border-white/5 bg-dark-card/30 p-5 space-y-4">
            <p className="text-xs font-medium text-gray-400">📍 {locale === 'tr' ? 'Lokasyon Bilgileri' : 'Location Details'}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label={locale === 'tr' ? 'Şehir' : 'City'} value={city} onChange={setCity} />
              <Field label={locale === 'tr' ? 'Ülke' : 'Country'} value={country} onChange={setCountry} />
              <Field label={locale === 'tr' ? 'Vatandaşlık/Vize' : 'Citizenship/Visa'} value={citizenship} onChange={setCitizenship} />
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-dark-card/30 p-5 space-y-3">
            <p className="text-xs font-medium text-gray-400">💰 {locale === 'tr' ? 'Tahmini Bütçe' : 'Estimated Budget'}</p>
            {budgetItems.map((b, i) => (
              <div key={i} className="flex gap-2 items-end">
                <div className="flex-1"><Field label={locale === 'tr' ? 'Kategori' : 'Category'} value={b.category} onChange={(v) => updateBudget(i, 'category', v)} /></div>
                <div className="w-24"><Field label={locale === 'tr' ? 'Tutar' : 'Amount'} value={b.amount} onChange={(v) => updateBudget(i, 'amount', v)} /></div>
                <div className="w-20"><Field label={locale === 'tr' ? 'Para' : 'Curr.'} value={b.currency} onChange={(v) => updateBudget(i, 'currency', v)} /></div>
                {budgetItems.length > 1 && <button type="button" onClick={() => removeBudgetRow(i)} className="mb-0.5 text-rose-400 hover:text-rose-300 text-sm">✕</button>}
              </div>
            ))}
            <button type="button" onClick={addBudgetRow} className="text-[11px] text-accent-turquoise hover:underline">+ {locale === 'tr' ? 'Satır Ekle' : 'Add Row'}</button>
          </div>

          <div className="rounded-xl border border-white/5 bg-dark-card/30 p-5 space-y-3">
            <p className="text-xs font-medium text-gray-400">🖼 {locale === 'tr' ? 'Galeri URL\'leri' : 'Gallery URLs'}</p>
            <GalleryEditor urls={galleryUrls} onChange={setGalleryUrls} locale={locale} />
          </div>
        </>
      )}

      {/* Blog-specific edit fields */}
      {item.type === 'blog' && (
        <div className="rounded-xl border border-white/5 bg-dark-card/30 p-5 space-y-4">
          <p className="text-xs font-medium text-gray-400">✍️ {locale === 'tr' ? 'Blog İçeriği (Markdown)' : 'Blog Content (Markdown)'}</p>
          <p className="text-[10px] text-gray-600">{locale === 'tr' ? '# başlık, **kalın**, *italik*, `kod`, > alıntı, - liste, [link](url), ```kod bloğu```' : '# heading, **bold**, *italic*, `code`, > quote, - list, [link](url), ```code block```'}</p>
          <Field label={`${locale === 'tr' ? 'İçerik' : 'Body'} (TR)`} value={bodyTr} onChange={setBodyTr} multiline />
          <Field label={`${locale === 'tr' ? 'İçerik' : 'Body'} (EN)`} value={bodyEn} onChange={setBodyEn} multiline />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={`${locale === 'tr' ? 'Etiketler' : 'Tags'} (TR)`} value={tagsTr} onChange={setTagsTr} placeholder="seyahat, ipucu, rehber" />
            <Field label={`${locale === 'tr' ? 'Etiketler' : 'Tags'} (EN)`} value={tagsEn} onChange={setTagsEn} placeholder="travel, tips, guide" />
          </div>
        </div>
      )}

      <div className="rounded-xl border border-white/5 bg-dark-card/30 p-5">
        <label className="mb-2 block text-xs font-medium text-gray-400">{locale === 'tr' ? 'Durum' : 'Status'}</label>
        <div className="flex gap-2">
          {(['draft', 'published', 'unpublished'] as const).map((s) => (
            <button key={s} type="button" onClick={() => setStatus(s)} className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${status === s ? STATUS_STYLES[s] : 'border border-white/10 text-gray-500 hover:text-gray-300'}`}>
              {s === 'draft' ? '📝' : s === 'published' ? '🟢' : '⏸'} {s === 'draft' ? (locale === 'tr' ? 'Taslak' : 'Draft') : s === 'published' ? (locale === 'tr' ? 'Yayında' : 'Published') : (locale === 'tr' ? 'Kaldır' : 'Unpublish')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="rounded-lg border border-white/10 px-5 py-2.5 text-xs text-gray-400 hover:text-white transition-colors">{locale === 'tr' ? 'İptal' : 'Cancel'}</button>
        <button type="submit" className="rounded-lg bg-accent-turquoise/20 border border-accent-turquoise/30 px-5 py-2.5 text-xs font-medium text-accent-turquoise hover:bg-accent-turquoise/30 transition-all">{locale === 'tr' ? '✓ Kaydet' : '✓ Save'}</button>
      </div>
    </form>
  );
}

/* --- Reusable Field --- */
function AnalyticsDashboard({ items, locale }: { items: ContentItem[]; locale: 'tr' | 'en' }) {
  const [views, setViews] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Comment[]>([]);
  const [dailyData, setDailyData] = useState<{ date: string; total: number }[]>([]);

  useEffect(() => {
    setViews(getViews());
    setComments(getComments());
    // Build last 7 days trend
    const daily = getDailyViews();
    const days: { date: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayViews = daily[key] || {};
      const total = Object.values(dayViews).reduce((s: number, v: number) => s + v, 0);
      days.push({ date: key, total });
    }
    setDailyData(days);
  }, []);

  const topViewed = items
    .map(item => ({ ...item, views: views[item.slug] || 0 }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  const totalViews = Object.values(views).reduce((s, v) => s + v, 0);
  const totalComments = comments.length;
  const pendingComments = comments.filter(c => c.status === 'pending').length;
  const flaggedComments = comments.filter(c => c.status === 'flagged').length;

  const commentsBySlug: Record<string, number> = {};
  comments.forEach(c => { commentsBySlug[c.contentSlug] = (commentsBySlug[c.contentSlug] || 0) + 1; });
  const topCommented = items
    .map(item => ({ ...item, commentCount: commentsBySlug[item.slug] || 0 }))
    .filter(i => i.commentCount > 0)
    .sort((a, b) => b.commentCount - a.commentCount)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: locale === 'tr' ? 'Toplam Görüntülenme' : 'Total Views', val: totalViews, icon: '👁', color: 'border-l-accent-turquoise' },
          { label: locale === 'tr' ? 'Toplam Yorum' : 'Total Comments', val: totalComments, icon: '💬', color: 'border-l-accent-indigo' },
          { label: locale === 'tr' ? 'Bekleyen Yorum' : 'Pending Comments', val: pendingComments, icon: '⏳', color: 'border-l-amber-500' },
          { label: locale === 'tr' ? 'Şikayet Edilen' : 'Flagged', val: flaggedComments, icon: '🚩', color: 'border-l-rose-500' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border border-white/5 border-l-2 ${s.color} bg-dark-card/50 px-4 py-4`}>
            <div className="flex items-center justify-between"><p className="text-2xl font-bold text-gray-100">{s.val}</p><span className="text-lg">{s.icon}</span></div>
            <p className="mt-1 text-[11px] text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Daily trend chart */}
      {(() => {
        const maxDay = Math.max(...dailyData.map(d => d.total), 1);
        return (
          <div className="rounded-xl border border-white/5 bg-dark-card/30 p-5">
            <p className="mb-4 text-xs font-medium text-gray-400">📈 {locale === 'tr' ? 'Son 7 Gün Görüntülenme' : 'Last 7 Days Views'}</p>
            <div className="flex items-end gap-2 h-32">
              {dailyData.map(d => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-gray-400">{d.total}</span>
                  <div className="w-full rounded-t-md bg-accent-turquoise/30 transition-all" style={{ height: `${(d.total / maxDay) * 100}%`, minHeight: d.total > 0 ? '4px' : '2px' }} />
                  <span className="text-[9px] text-gray-600">{d.date.slice(5)}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Top viewed */}
      <div className="rounded-xl border border-white/5 bg-dark-card/30 p-5">
        <p className="mb-4 text-xs font-medium text-gray-400">🏆 {locale === 'tr' ? 'En Çok Görüntülenen' : 'Most Viewed'}</p>
        {topViewed.length === 0 ? (
          <p className="text-sm text-gray-600">{locale === 'tr' ? 'Henüz görüntülenme verisi yok' : 'No view data yet'}</p>
        ) : (
          <div className="space-y-2">
            {topViewed.map((item, idx) => {
              const loc = getLocalizedContent(item.content, locale);
              const maxViews = topViewed[0]?.views || 1;
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="w-5 text-right text-[11px] font-bold text-gray-500">{idx + 1}</span>
                  <span className="text-sm">{TYPE_INFO[item.type].icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm text-gray-200">{loc.title}</p>
                    <div className="mt-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-accent-turquoise/40 transition-all" style={{ width: `${(item.views / maxViews) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-400">{item.views}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top commented */}
      {topCommented.length > 0 && (
        <div className="rounded-xl border border-white/5 bg-dark-card/30 p-5">
          <p className="mb-4 text-xs font-medium text-gray-400">💬 {locale === 'tr' ? 'En Çok Yorum Alan' : 'Most Commented'}</p>
          <div className="space-y-2">
            {topCommented.map((item, idx) => {
              const loc = getLocalizedContent(item.content, locale);
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <span className="w-5 text-right text-[11px] font-bold text-gray-500">{idx + 1}</span>
                  <span className="text-sm">{TYPE_INFO[item.type].icon}</span>
                  <p className="flex-1 truncate text-sm text-gray-200">{loc.title}</p>
                  <span className="rounded-full bg-accent-indigo/15 px-2 py-0.5 text-[10px] font-medium text-accent-indigo">{item.commentCount} 💬</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CommentModeration({ locale, onToast }: { locale: 'tr' | 'en'; onToast: (msg: string) => void }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'flagged'>('all');

  useEffect(() => { setComments(getComments()); }, []);

  function handleApprove(id: string) {
    const updated = updateCommentStatus(id, 'approved');
    setComments(updated);
    onToast(locale === 'tr' ? 'Yorum onaylandı' : 'Comment approved');
  }
  function handleFlag(id: string) {
    const updated = updateCommentStatus(id, 'flagged');
    setComments(updated);
    onToast(locale === 'tr' ? 'Yorum sıkıntılı olarak işaretlendi' : 'Comment flagged');
  }
  function handleDelete(id: string) {
    const updated = deleteCommentStore(id);
    setComments(updated);
    onToast(locale === 'tr' ? 'Yorum silindi' : 'Comment deleted');
  }

  const filtered = filter === 'all' ? comments : comments.filter(c => c.status === filter);
  const counts = { all: comments.length, pending: comments.filter(c => c.status === 'pending').length, approved: comments.filter(c => c.status === 'approved').length, flagged: comments.filter(c => c.status === 'flagged').length };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'approved', 'flagged'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${filter === f ? 'bg-accent-turquoise/15 text-accent-turquoise' : 'text-gray-500 hover:text-gray-300'}`}>
            {f === 'all' ? `📋 ${locale === 'tr' ? 'Tümü' : 'All'} (${counts.all})` :
             f === 'pending' ? `⏳ ${locale === 'tr' ? 'Bekleyen' : 'Pending'} (${counts.pending})` :
             f === 'approved' ? `✅ ${locale === 'tr' ? 'Onaylı' : 'Approved'} (${counts.approved})` :
             `🚩 ${locale === 'tr' ? 'Sıkıntılı' : 'Flagged'} (${counts.flagged})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-dark-card/20 p-8 text-center text-sm text-gray-600">
          {locale === 'tr' ? 'Yorum bulunamadı' : 'No comments found'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c.id} className={`rounded-xl border p-4 ${c.status === 'flagged' ? 'border-rose-500/20 bg-rose-500/5' : c.status === 'pending' ? 'border-amber-500/20 bg-amber-500/5' : 'border-white/5 bg-dark-card/30'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-200">{c.author}</span>
                    <span className="text-[10px] text-gray-600">→ {c.contentSlug}</span>
                    {c.reports > 0 && <span className="rounded-full bg-rose-500/15 px-1.5 py-0.5 text-[9px] text-rose-400">⚑ {c.reports}</span>}
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-medium ${c.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400' : c.status === 'pending' ? 'bg-amber-500/15 text-amber-400' : 'bg-rose-500/15 text-rose-400'}`}>
                      {c.status === 'approved' ? (locale === 'tr' ? 'Onaylı' : 'Approved') : c.status === 'pending' ? (locale === 'tr' ? 'Bekliyor' : 'Pending') : (locale === 'tr' ? 'Sıkıntılı' : 'Flagged')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{c.text}</p>
                  <span className="mt-1 block text-[10px] text-gray-600">{new Date(c.createdAt).toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-US')}</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  {c.status !== 'approved' && (
                    <button onClick={() => handleApprove(c.id)} className="rounded-lg border border-emerald-500/20 px-2 py-1 text-[10px] text-emerald-400 hover:bg-emerald-500/10 transition-colors">✓</button>
                  )}
                  {c.status !== 'flagged' && (
                    <button onClick={() => handleFlag(c.id)} className="rounded-lg border border-amber-500/20 px-2 py-1 text-[10px] text-amber-400 hover:bg-amber-500/10 transition-colors">⚑</button>
                  )}
                  <button onClick={() => handleDelete(c.id)} className="rounded-lg border border-rose-500/20 px-2 py-1 text-[10px] text-rose-400 hover:bg-rose-500/10 transition-colors">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CoverImageField({ value, onChange, locale }: { value: string; onChange: (v: string) => void; locale: 'tr' | 'en' }) {
  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [value]);
  return (
    <div className="space-y-2">
      <label className="mb-1.5 block text-[11px] font-medium text-gray-400">{locale === 'tr' ? 'Kapak Görseli URL' : 'Cover Image URL'}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)}
        placeholder="https://images.unsplash.com/..."
        className="w-full rounded-lg border border-white/10 bg-dark-card/60 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-accent-turquoise/40 transition-colors" />
      {value.trim() && (
        <div className="relative h-32 w-full overflow-hidden rounded-lg border border-white/10 bg-dark-card/40">
          {imgError ? (
            <div className="flex h-full items-center justify-center gap-2 text-rose-400">
              <span>🖼️</span><span className="text-xs">{locale === 'tr' ? 'Görsel yüklenemedi' : 'Image failed to load'}</span>
            </div>
          ) : (
            <img src={value} alt="Cover preview" className="h-full w-full object-cover" onError={() => setImgError(true)} />
          )}
        </div>
      )}
    </div>
  );
}

function GalleryEditor({ urls, onChange, locale }: { urls: string[]; onChange: (urls: string[]) => void; locale: 'tr' | 'en' }) {
  const [newUrl, setNewUrl] = useState('');
  const [errors, setErrors] = useState<Record<number, boolean>>({});
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  function addUrl() {
    const trimmed = newUrl.trim();
    if (!trimmed) return;
    onChange([...urls, trimmed]);
    setNewUrl('');
  }

  function removeUrl(idx: number) {
    const updated = urls.filter((_, i) => i !== idx);
    onChange(updated);
    setErrors(prev => { const n = { ...prev }; delete n[idx]; return n; });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { e.preventDefault(); addUrl(); }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').trim();
    if (pasted && (pasted.startsWith('http://') || pasted.startsWith('https://'))) {
      e.preventDefault();
      const newUrls = pasted.split('\n').map(u => u.trim()).filter(u => u.startsWith('http'));
      onChange([...urls, ...newUrls]);
      setNewUrl('');
    }
  }

  function markError(idx: number) {
    setErrors(prev => ({ ...prev, [idx]: true }));
  }

  function handleDragStart(idx: number) { setDragIdx(idx); }
  function handleDragOver(e: React.DragEvent, idx: number) { e.preventDefault(); setDragOverIdx(idx); }
  function handleDragEnd() {
    if (dragIdx !== null && dragOverIdx !== null && dragIdx !== dragOverIdx) {
      const updated = [...urls];
      const [moved] = updated.splice(dragIdx, 1);
      updated.splice(dragOverIdx, 0, moved);
      onChange(updated);
      setErrors({});
    }
    setDragIdx(null); setDragOverIdx(null);
  }

  return (
    <div className="space-y-3">
      {urls.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {urls.map((url, idx) => (
            <div
              key={`${idx}-${url}`}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={`group relative aspect-square cursor-grab overflow-hidden rounded-lg border bg-dark-card/60 transition-all active:cursor-grabbing ${
                dragOverIdx === idx ? 'border-accent-turquoise/50 scale-105' : dragIdx === idx ? 'opacity-40 border-white/5' : 'border-white/10'
              }`}
            >
              {errors[idx] ? (
                <div className="flex h-full flex-col items-center justify-center gap-1 p-1">
                  <span className="text-lg">🖼️</span>
                  <span className="text-[9px] text-rose-400 text-center leading-tight">{locale === 'tr' ? 'Yüklenemedi' : 'Failed'}</span>
                </div>
              ) : (
                <img src={url} alt={`Gallery ${idx + 1}`} className="h-full w-full object-cover" onError={() => markError(idx)} />
              )}
              <span className="absolute left-1 top-1 rounded bg-black/60 px-1 py-0.5 text-[9px] text-gray-400">{idx + 1}</span>
              <button type="button" onClick={() => removeUrl(idx)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-[10px] text-rose-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-rose-500/30"
                aria-label={locale === 'tr' ? 'Görseli kaldır' : 'Remove image'}>✕</button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input type="text" value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={locale === 'tr' ? 'Görsel URL yapıştır (otomatik eklenir)...' : 'Paste image URL (auto-adds)...'}
          className="flex-1 rounded-lg border border-white/10 bg-dark-card/40 px-3 py-2 text-xs text-gray-200 placeholder-gray-600 outline-none transition-colors focus:border-accent-turquoise/40" />
        <button type="button" onClick={addUrl} disabled={!newUrl.trim()}
          className="rounded-lg border border-accent-turquoise/30 bg-accent-turquoise/10 px-3 py-2 text-xs font-medium text-accent-turquoise transition-all hover:bg-accent-turquoise/20 disabled:opacity-30 disabled:cursor-not-allowed">
          + {locale === 'tr' ? 'Ekle' : 'Add'}
        </button>
      </div>
      {urls.length > 1 && <p className="text-[10px] text-gray-600">💡 {locale === 'tr' ? 'Sıralamak için görselleri sürükle-bırak' : 'Drag & drop to reorder'}</p>}
    </div>
  );
}

function Field({ label, value, onChange, multiline, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string; required?: boolean;
}) {
  const cls = "w-full rounded-lg border border-white/10 bg-dark-card/60 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-accent-turquoise/40 transition-colors";
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-medium text-gray-400">{label}</label>
      {multiline ? <textarea value={value} onChange={(e) => onChange(e.target.value)} className={`${cls} min-h-[80px] resize-y`} placeholder={placeholder} required={required} />
        : <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={cls} placeholder={placeholder} required={required} />}
    </div>
  );
}
