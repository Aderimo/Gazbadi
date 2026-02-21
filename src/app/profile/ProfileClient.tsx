'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { getProfile, saveProfile, getAvatars, clearProfile, getUserRatings, type UserProfile } from '@/lib/user-profile';
import { getCommentsByAuthor } from '@/lib/comments-store';
import { getFavorites } from '@/lib/favorites';
import type { Comment } from '@/types';

export default function ProfileClient() {
  const { locale } = useLanguage();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('🧑‍💻');
  const [newPlace, setNewPlace] = useState('');
  const [myRatings, setMyRatings] = useState<Record<string, number>>({});
  const [shareMsg, setShareMsg] = useState('');
  const basePath = process.env.NEXT_PUBLIC_REPO_NAME ? `/${process.env.NEXT_PUBLIC_REPO_NAME}` : '';

  useEffect(() => {
    const p = getProfile();
    if (p) {
      setProfile(p);
      setNickname(p.nickname);
      setAvatar(p.avatar);
      setComments(getCommentsByAuthor(p.nickname));
      setMyRatings(getUserRatings());
    }
    setFavorites(getFavorites());
  }, []);

  function handleSave() {
    if (!nickname.trim()) return;
    const updated: UserProfile = {
      ...profile!,
      nickname: nickname.trim(),
      avatar,
    };
    saveProfile(updated);
    setProfile(updated);
    setEditing(false);
  }

  function handleAddPlace() {
    if (!newPlace.trim() || !profile) return;
    const updated = { ...profile, visitedPlaces: [...profile.visitedPlaces, newPlace.trim()] };
    saveProfile(updated);
    setProfile(updated);
    setNewPlace('');
  }

  function handleRemovePlace(place: string) {
    if (!profile) return;
    const updated = { ...profile, visitedPlaces: profile.visitedPlaces.filter(p => p !== place) };
    saveProfile(updated);
    setProfile(updated);
  }

  function handleLogout() {
    clearProfile();
    setProfile(null);
  }

  // No profile — show create form
  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6 rounded-2xl border border-white/5 bg-dark-card/30 p-8">
          <div className="text-center">
            <p className="text-3xl">👤</p>
            <h1 className="mt-3 text-xl font-bold text-white">{locale === 'tr' ? 'Profil Oluştur' : 'Create Profile'}</h1>
            <p className="mt-1 text-xs text-gray-500">{locale === 'tr' ? 'Yorum yap, puanla, gezi listeni oluştur' : 'Comment, rate, build your travel list'}</p>
          </div>
          <div>
            <p className="mb-2 text-[11px] text-gray-400">{locale === 'tr' ? 'Avatar seç' : 'Pick avatar'}</p>
            <div className="flex flex-wrap gap-1.5">
              {getAvatars().map(a => (
                <button key={a} onClick={() => setAvatar(a)}
                  className={`rounded-lg p-2 text-xl transition-all ${avatar === a ? 'bg-accent-turquoise/20 ring-1 ring-accent-turquoise/50' : 'hover:bg-white/5'}`}>{a}</button>
              ))}
            </div>
          </div>
          <input type="text" value={nickname} onChange={e => setNickname(e.target.value)}
            placeholder={locale === 'tr' ? 'Takma adın' : 'Nickname'}
            className="w-full rounded-lg border border-white/10 bg-dark-card/40 px-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-accent-turquoise/40" />
          <button onClick={() => {
            if (!nickname.trim()) return;
            const p: UserProfile = { nickname: nickname.trim(), avatar, visitedPlaces: [], createdAt: new Date().toISOString() };
            saveProfile(p); setProfile(p);
          }} disabled={!nickname.trim()}
            className="w-full rounded-lg bg-accent-turquoise/15 border border-accent-turquoise/30 py-3 text-sm font-medium text-accent-turquoise hover:bg-accent-turquoise/25 disabled:opacity-30 transition-all">
            {locale === 'tr' ? 'Oluştur' : 'Create'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">

        {/* Profile Header */}
        <div className="flex items-center gap-5 rounded-2xl border border-white/5 bg-dark-card/30 p-6">
          <span className="text-5xl">{profile.avatar}</span>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white truncate">{profile.nickname}</h1>
            <p className="text-xs text-gray-500">{locale === 'tr' ? 'Üye:' : 'Member since:'} {new Date(profile.createdAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => {
              const url = `${window.location.origin}${basePath}/profile?user=${encodeURIComponent(profile.nickname)}`;
              navigator.clipboard.writeText(url).then(() => { setShareMsg('✓'); setTimeout(() => setShareMsg(''), 2000); });
            }} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10 transition-colors">
              {shareMsg || '🔗'}
            </button>
            <button onClick={() => setEditing(!editing)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300 hover:bg-white/10 transition-colors">
              {editing ? (locale === 'tr' ? 'İptal' : 'Cancel') : '✏️'}
            </button>
            <button onClick={handleLogout} className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/20 transition-colors">
              {locale === 'tr' ? 'Çıkış' : 'Logout'}
            </button>
          </div>
        </div>

        {/* Edit Form */}
        {editing && (
          <div className="rounded-2xl border border-white/5 bg-dark-card/30 p-6 space-y-4">
            <p className="text-xs font-medium text-gray-400">{locale === 'tr' ? 'Profili Düzenle' : 'Edit Profile'}</p>
            <div className="flex flex-wrap gap-1.5">
              {getAvatars().map(a => (
                <button key={a} onClick={() => setAvatar(a)}
                  className={`rounded-lg p-2 text-xl transition-all ${avatar === a ? 'bg-accent-turquoise/20 ring-1 ring-accent-turquoise/50' : 'hover:bg-white/5'}`}>{a}</button>
              ))}
            </div>
            <input type="text" value={nickname} onChange={e => setNickname(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-dark-card/40 px-4 py-2.5 text-sm text-gray-200 outline-none focus:border-accent-turquoise/40" />
            <button onClick={handleSave} disabled={!nickname.trim()}
              className="rounded-lg bg-accent-turquoise/15 border border-accent-turquoise/30 px-5 py-2 text-sm font-medium text-accent-turquoise hover:bg-accent-turquoise/25 disabled:opacity-30 transition-all">
              {locale === 'tr' ? 'Kaydet' : 'Save'}
            </button>
          </div>
        )}

        {/* Visited Places */}
        <div className="rounded-2xl border border-white/5 bg-dark-card/30 p-6">
          <p className="mb-4 text-xs font-medium text-gray-400">📍 {locale === 'tr' ? 'Gittiğim Yerler' : 'Visited Places'} ({profile.visitedPlaces.length})</p>
          {profile.visitedPlaces.length === 0 ? (
            <p className="text-sm text-gray-600">{locale === 'tr' ? 'Henüz bir yer eklenmedi' : 'No places added yet'}</p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-4">
              {profile.visitedPlaces.map(place => (
                <span key={place} className="inline-flex items-center gap-1.5 rounded-full bg-accent-turquoise/10 border border-accent-turquoise/20 px-3 py-1 text-xs text-accent-turquoise">
                  {place}
                  <button onClick={() => handleRemovePlace(place)} className="ml-0.5 text-accent-turquoise/50 hover:text-rose-400 transition-colors">&times;</button>
                </span>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input type="text" value={newPlace} onChange={e => setNewPlace(e.target.value)}
              placeholder={locale === 'tr' ? 'Yer adı ekle...' : 'Add a place...'}
              onKeyDown={e => e.key === 'Enter' && handleAddPlace()}
              className="flex-1 rounded-lg border border-white/10 bg-dark-card/40 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-accent-turquoise/40" />
            <button onClick={handleAddPlace} disabled={!newPlace.trim()}
              className="rounded-lg bg-accent-turquoise/15 border border-accent-turquoise/30 px-4 py-2 text-xs font-medium text-accent-turquoise hover:bg-accent-turquoise/25 disabled:opacity-30 transition-all">+</button>
          </div>
        </div>

        {/* Comment History */}
        <div className="rounded-2xl border border-white/5 bg-dark-card/30 p-6">
          <p className="mb-4 text-xs font-medium text-gray-400">💬 {locale === 'tr' ? 'Yorumlarım' : 'My Comments'} ({comments.length})</p>
          {comments.length === 0 ? (
            <p className="text-sm text-gray-600">{locale === 'tr' ? 'Henüz yorum yapılmadı' : 'No comments yet'}</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {comments.slice(0, 20).map(c => (
                <div key={c.id} className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <p className="text-sm text-gray-300 line-clamp-2">{c.text}</p>
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-500">
                    <Link href={`${basePath}/${c.contentType === 'blog' ? 'blog' : 'location'}/${c.contentSlug}`} className="text-accent-turquoise/70 hover:text-accent-turquoise">
                      {c.contentSlug}
                    </Link>
                    <span>{new Date(c.createdAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}</span>
                    <span className="flex items-center gap-1">👍 {c.likes} 👎 {c.dislikes}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Ratings */}
        <div className="rounded-2xl border border-white/5 bg-dark-card/30 p-6">
          <p className="mb-4 text-xs font-medium text-gray-400">⭐ {locale === 'tr' ? 'Puanlarım' : 'My Ratings'} ({Object.keys(myRatings).length})</p>
          {Object.keys(myRatings).length === 0 ? (
            <p className="text-sm text-gray-600">{locale === 'tr' ? 'Henüz puan verilmedi' : 'No ratings yet'}</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {Object.entries(myRatings).map(([slug, rating]) => (
                <div key={slug} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
                  <Link href={`${basePath}/location/${slug}`} className="text-sm text-accent-turquoise/70 hover:text-accent-turquoise truncate flex-1">
                    {slug}
                  </Link>
                  <span className="ml-3 text-xs text-amber-400 whitespace-nowrap">
                    {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Favorites */}
        <div className="rounded-2xl border border-white/5 bg-dark-card/30 p-6">
          <p className="mb-4 text-xs font-medium text-gray-400">❤️ {locale === 'tr' ? 'Favorilerim' : 'My Favorites'} ({favorites.length})</p>
          {favorites.length === 0 ? (
            <p className="text-sm text-gray-600">{locale === 'tr' ? 'Henüz favori eklenmedi' : 'No favorites yet'}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {favorites.map(slug => (
                <Link key={slug} href={`${basePath}/location/${slug}`}
                  className="rounded-full bg-rose-500/10 border border-rose-500/20 px-3 py-1 text-xs text-rose-400 hover:bg-rose-500/20 transition-colors">
                  ❤️ {slug}
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
