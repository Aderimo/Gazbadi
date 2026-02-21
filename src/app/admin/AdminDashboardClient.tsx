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

  useEffect(() => {
    setAllItems(getStoredItems(serverItems));
    setTrash(getTrash());
  }, [serverItems]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const stats = useMemo(() => ({
    total: allItems.length,
    published: allItems.filter((i) => i.status === 'published').length,
    draft: allItems.filter((i) => i.status === 'draft').length,
    trashCount: trash.length,
  }), [allItems, trash]);

  function handleDelete(id: string) {
    const updated = removeItem(allItems, id);
    setAllItems(updated);
    setTrash(getTrash());
    setConfirmDelete(null);
    showToast(locale === 'tr' ? 'Çöp kutusuna taşındı' : 'Moved to trash');
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
        <div className="mx-auto max-w-5xl">
          {/* Toast */}
          {toast && (
            <div className="fixed top-20 right-4 z-50 rounded-lg border border-accent-turquoise/30 bg-dark-card px-4 py-2.5 text-sm text-accent-turquoise shadow-lg backdrop-blur-sm animate-fade-in">
              {toast}
            </div>
          )}

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-100">Admin Panel</h1>
            <button onClick={handleLogout} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-gray-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors">
              {locale === 'tr' ? 'Çıkış' : 'Logout'}
            </button>
          </div>

          {/* Stats */}
          <div className="mb-8 grid grid-cols-4 gap-3">
            {[
              { label: locale === 'tr' ? 'Toplam' : 'Total', val: stats.total, color: 'border-l-accent-turquoise' },
              { label: locale === 'tr' ? 'Yayında' : 'Published', val: stats.published, color: 'border-l-emerald-500' },
              { label: locale === 'tr' ? 'Taslak' : 'Draft', val: stats.draft, color: 'border-l-amber-500' },
              { label: locale === 'tr' ? 'Çöp' : 'Trash', val: stats.trashCount, color: 'border-l-rose-500' },
            ].map((s) => (
              <div key={s.label} className={`rounded-lg border border-white/5 border-l-2 ${s.color} bg-dark-card/50 px-4 py-3`}>
                <p className="text-xl font-bold text-gray-100">{s.val}</p>
                <p className="text-[11px] text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-lg border border-white/5 bg-dark-card/30 p-1">
            {(['content', 'create', 'trash'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setEditingId(null); }}
                className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${tab === t ? 'bg-accent-turquoise/15 text-accent-turquoise' : 'text-gray-400 hover:text-gray-200'}`}
              >
                {t === 'content' ? (locale === 'tr' ? '📋 İçerikler' : '📋 Content') :
                 t === 'create' ? (locale === 'tr' ? '➕ Yeni Oluştur' : '➕ Create New') :
                 `🗑️ ${locale === 'tr' ? 'Çöp Kutusu' : 'Trash'} (${stats.trashCount})`}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {tab === 'content' && !editingId && <ContentList items={allItems} locale={locale} onEdit={(id) => { setEditingId(id); setTab('edit'); }} onDelete={(id) => setConfirmDelete(id)} />}
          {tab === 'edit' && editingItem && <EditForm item={editingItem} locale={locale} onSave={(u) => handleSaveEdit(editingItem.id, u)} onCancel={() => { setEditingId(null); setTab('content'); }} />}
          {tab === 'create' && <CreateForm locale={locale} createType={createType} setCreateType={setCreateType} existingSlugs={allItems.map(i => i.slug)} onSave={handleSaveNew} onCancel={() => setTab('content')} />}
          {tab === 'trash' && <TrashList trash={trash} locale={locale} onRestore={handleRestore} onPermanentDelete={handlePermanentDelete} onEmptyTrash={handleEmptyTrash} />}

          {/* Delete Confirm Modal */}
          {confirmDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="mx-4 w-full max-w-sm rounded-xl border border-white/10 bg-dark-card p-6">
                <p className="mb-4 text-sm text-gray-200">{locale === 'tr' ? 'Bu içeriği silmek istediğinize emin misiniz? Çöp kutusuna taşınacak.' : 'Are you sure you want to delete this? It will be moved to trash.'}</p>
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
function ContentList({ items, locale, onEdit, onDelete }: { items: ContentItem[]; locale: 'tr' | 'en'; onEdit: (id: string) => void; onDelete: (id: string) => void }) {
  if (items.length === 0) {
    return <div className="rounded-xl border border-white/5 bg-dark-card/50 p-12 text-center text-gray-500">{locale === 'tr' ? 'Henüz içerik yok. Yeni oluştur sekmesinden başlayın.' : 'No content yet. Start from the Create New tab.'}</div>;
  }
  return (
    <div className="space-y-2">
      {items.map((item) => {
        const loc = getLocalizedContent(item.content, locale);
        const info = TYPE_INFO[item.type];
        return (
          <div key={item.id} className="flex items-center gap-3 rounded-lg border border-white/5 bg-dark-card/40 px-4 py-3 transition-colors hover:bg-white/[0.03]">
            <span className="text-lg">{info.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-gray-200">{loc.title}</p>
              <p className="text-[11px] text-gray-500">{locale === 'tr' ? info.tr : info.en} · {new Date(item.updatedAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}</p>
            </div>
            <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[item.status]}`}>
              {item.status === 'published' ? (locale === 'tr' ? 'Yayında' : 'Published') : item.status === 'draft' ? (locale === 'tr' ? 'Taslak' : 'Draft') : (locale === 'tr' ? 'Yayından Kaldırıldı' : 'Unpublished')}
            </span>
            <button onClick={() => onEdit(item.id)} className="rounded-md border border-accent-indigo/30 bg-accent-indigo/10 px-2.5 py-1 text-[11px] text-accent-indigo hover:bg-accent-indigo/20 transition-colors">{locale === 'tr' ? 'Düzenle' : 'Edit'}</button>
            <button onClick={() => onDelete(item.id)} className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] text-rose-400 hover:bg-rose-500/20 transition-colors">{locale === 'tr' ? 'Sil' : 'Delete'}</button>
          </div>
        );
      })}
    </div>
  );
}

/* --- Trash List --- */
function TrashList({ trash, locale, onRestore, onPermanentDelete, onEmptyTrash }: { trash: TrashedItem[]; locale: 'tr' | 'en'; onRestore: (id: string) => void; onPermanentDelete: (id: string) => void; onEmptyTrash: () => void }) {
  if (trash.length === 0) {
    return <div className="rounded-xl border border-white/5 bg-dark-card/50 p-12 text-center text-gray-500">{locale === 'tr' ? 'Çöp kutusu boş.' : 'Trash is empty.'}</div>;
  }
  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button onClick={onEmptyTrash} className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-[11px] text-rose-400 hover:bg-rose-500/20 transition-colors">{locale === 'tr' ? 'Çöp Kutusunu Boşalt' : 'Empty Trash'}</button>
      </div>
      <p className="mb-3 text-[11px] text-gray-500">{locale === 'tr' ? 'Son 10 silinen içerik burada saklanır. En eski otomatik silinir.' : 'Last 10 deleted items are kept here. Oldest are auto-removed.'}</p>
      <div className="space-y-2">
        {trash.map((item) => {
          const loc = getLocalizedContent(item.content, locale);
          const info = TYPE_INFO[item.type];
          return (
            <div key={item.id} className="flex items-center gap-3 rounded-lg border border-white/5 bg-dark-card/40 px-4 py-3 opacity-70">
              <span className="text-lg">{info.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm text-gray-300">{loc.title}</p>
                <p className="text-[10px] text-gray-500">{locale === 'tr' ? 'Silinme:' : 'Deleted:'} {new Date(item.deletedAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}</p>
              </div>
              <button onClick={() => onRestore(item.id)} className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-400 hover:bg-emerald-500/20 transition-colors">{locale === 'tr' ? 'Geri Al' : 'Restore'}</button>
              <button onClick={() => onPermanentDelete(item.id)} className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-[11px] text-rose-400 hover:bg-rose-500/20 transition-colors">{locale === 'tr' ? 'Kalıcı Sil' : 'Delete Forever'}</button>
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
      {/* Type Selector */}
      <div>
        <label className="mb-2 block text-xs font-medium text-gray-400">{locale === 'tr' ? 'İçerik Türü' : 'Content Type'}</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TYPES.map((type) => {
            const info = TYPE_INFO[type];
            return (
              <button key={type} type="button" onClick={() => setCreateType(type)}
                className={`rounded-lg border p-3 text-left transition-all ${createType === type ? 'border-accent-turquoise/50 bg-accent-turquoise/10' : 'border-white/5 bg-dark-card/40 hover:border-white/10'}`}>
                <span className="text-lg">{info.icon}</span>
                <p className="mt-1 text-xs font-medium text-gray-200">{locale === 'tr' ? info.tr : info.en}</p>
                <p className="text-[10px] text-gray-500">{locale === 'tr' ? info.desc_tr : info.desc_en}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={`${locale === 'tr' ? 'Başlık' : 'Title'} (TR) *`} value={titleTr} onChange={setTitleTr} required />
        <Field label={`${locale === 'tr' ? 'Başlık' : 'Title'} (EN)`} value={titleEn} onChange={setTitleEn} />
        <Field label={`${locale === 'tr' ? 'Özet' : 'Summary'} (TR)`} value={summaryTr} onChange={setSummaryTr} multiline />
        <Field label={`${locale === 'tr' ? 'Özet' : 'Summary'} (EN)`} value={summaryEn} onChange={setSummaryEn} multiline />
      </div>

      <Field label={`${locale === 'tr' ? 'Kapak Görseli URL' : 'Cover Image URL'}`} value={coverImage} onChange={setCoverImage} placeholder="https://images.unsplash.com/..." />

      {/* Status */}
      <div>
        <label className="mb-2 block text-xs font-medium text-gray-400">{locale === 'tr' ? 'Durum' : 'Status'}</label>
        <div className="flex gap-2">
          {(['draft', 'published'] as const).map((s) => (
            <button key={s} type="button" onClick={() => setStatus(s)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${status === s ? STATUS_STYLES[s] : 'border border-white/10 text-gray-500 hover:text-gray-300'}`}>
              {s === 'draft' ? (locale === 'tr' ? 'Taslak' : 'Draft') : (locale === 'tr' ? 'Yayınla' : 'Publish')}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onCancel} className="rounded-lg border border-white/10 px-4 py-2 text-xs text-gray-400 hover:text-white transition-colors">{locale === 'tr' ? 'İptal' : 'Cancel'}</button>
        <button type="submit" className="rounded-lg bg-accent-turquoise/20 border border-accent-turquoise/30 px-4 py-2 text-xs font-medium text-accent-turquoise hover:bg-accent-turquoise/30 transition-colors">{locale === 'tr' ? 'Oluştur' : 'Create'}</button>
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
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{info.icon}</span>
        <span className="text-xs text-gray-400">{locale === 'tr' ? info.tr : info.en} · {item.slug}</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={`${locale === 'tr' ? 'Başlık' : 'Title'} (TR) *`} value={titleTr} onChange={setTitleTr} required />
        <Field label={`${locale === 'tr' ? 'Başlık' : 'Title'} (EN)`} value={titleEn} onChange={setTitleEn} />
        <Field label={`${locale === 'tr' ? 'Özet' : 'Summary'} (TR)`} value={summaryTr} onChange={setSummaryTr} multiline />
        <Field label={`${locale === 'tr' ? 'Özet' : 'Summary'} (EN)`} value={summaryEn} onChange={setSummaryEn} multiline />
      </div>

      <Field label={`${locale === 'tr' ? 'Kapak Görseli URL' : 'Cover Image URL'}`} value={coverImage} onChange={setCoverImage} />

      <div>
        <label className="mb-2 block text-xs font-medium text-gray-400">{locale === 'tr' ? 'Durum' : 'Status'}</label>
        <div className="flex gap-2">
          {(['draft', 'published', 'unpublished'] as const).map((s) => (
            <button key={s} type="button" onClick={() => setStatus(s)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${status === s ? STATUS_STYLES[s] : 'border border-white/10 text-gray-500 hover:text-gray-300'}`}>
              {s === 'draft' ? (locale === 'tr' ? 'Taslak' : 'Draft') : s === 'published' ? (locale === 'tr' ? 'Yayında' : 'Published') : (locale === 'tr' ? 'Yayından Kaldır' : 'Unpublish')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onCancel} className="rounded-lg border border-white/10 px-4 py-2 text-xs text-gray-400 hover:text-white transition-colors">{locale === 'tr' ? 'İptal' : 'Cancel'}</button>
        <button type="submit" className="rounded-lg bg-accent-turquoise/20 border border-accent-turquoise/30 px-4 py-2 text-xs font-medium text-accent-turquoise hover:bg-accent-turquoise/30 transition-colors">{locale === 'tr' ? 'Kaydet' : 'Save'}</button>
      </div>
    </form>
  );
}

/* --- Reusable Field --- */
function Field({ label, value, onChange, multiline, placeholder, required }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string; required?: boolean;
}) {
  const cls = "w-full rounded-lg border border-white/10 bg-dark-card/60 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-accent-turquoise/40 transition-colors";
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
