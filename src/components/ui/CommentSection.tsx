'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { Comment } from '@/types';
import { getCommentsBySlug, addComment, reportComment, toggleReaction, getUserReaction } from '@/lib/comments-store';
import { getProfile, getAvatars, saveProfile, type UserProfile } from '@/lib/user-profile';

interface Props {
  slug: string;
  contentType: Comment['contentType'];
  locale: 'tr' | 'en';
}

export default function CommentSection({ slug, contentType, locale }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [reported, setReported] = useState<Set<string>>(new Set());
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('🧑‍💻');
  const [nickname, setNickname] = useState('');

  const refresh = useCallback(() => { setComments(getCommentsBySlug(slug)); }, [slug]);

  useEffect(() => {
    refresh();
    const p = getProfile();
    if (p) { setProfile(p); setAuthor(p.nickname); }
    try {
      const r = JSON.parse(localStorage.getItem('ta_reported') || '[]');
      setReported(new Set(r));
    } catch { /* */ }
  }, [slug, refresh]);

  function handleSaveProfile() {
    if (!nickname.trim()) return;
    const p: UserProfile = { nickname: nickname.trim(), avatar: selectedAvatar, visitedPlaces: [], createdAt: new Date().toISOString() };
    saveProfile(p); setProfile(p); setAuthor(p.nickname); setShowProfileSetup(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!author.trim() || !text.trim()) return;
    addComment(slug, contentType, author.trim(), text.trim(), profile?.avatar);
    refresh(); setAuthor(profile?.nickname || ''); setText('');
  }

  function handleReply(parentId: string) {
    if (!replyText.trim()) return;
    const name = profile?.nickname || author || 'Anonim';
    addComment(slug, contentType, name, replyText.trim(), profile?.avatar, parentId);
    refresh(); setReplyTo(null); setReplyText('');
  }

  function handleReport(id: string) {
    if (reported.has(id)) return;
    reportComment(id); refresh();
    const next = new Set(reported); next.add(id);
    setReported(next);
    localStorage.setItem('ta_reported', JSON.stringify(Array.from(next)));
  }

  function handleReaction(id: string, type: 'like' | 'dislike') {
    toggleReaction(id, type); refresh();
  }

  const visible = comments.filter(c => c.status !== 'flagged');
  const topLevel = visible.filter(c => !c.parentId);
  const replies = visible.filter(c => c.parentId);

  return (
    <section className="mt-10 border-t border-white/10 pt-8">
      <h3 className="mb-6 text-lg font-semibold text-white">
        💬 {locale === 'tr' ? 'Yorumlar' : 'Comments'}
        {visible.length > 0 && <span className="ml-2 text-sm text-gray-500">({visible.length})</span>}
      </h3>

      <div className="space-y-4 mb-8">
        {topLevel.map(c => (
          <CommentCard key={c.id} comment={c} replies={replies.filter(r => r.parentId === c.id)}
            locale={locale} reported={reported} replyTo={replyTo} replyText={replyText}
            onReport={handleReport} onReaction={handleReaction}
            onReplyTo={setReplyTo} onReplyTextChange={setReplyText} onReplySubmit={handleReply} />
        ))}
        {visible.length === 0 && (
          <p className="text-sm text-gray-600">{locale === 'tr' ? 'Henüz yorum yok. İlk yorumu sen yaz!' : 'No comments yet. Be the first!'}</p>
        )}
      </div>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-white/5 bg-dark-card/20 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-gray-400">{locale === 'tr' ? 'Yorum Yaz' : 'Write a Comment'}</p>
          {!profile && (
            <button type="button" onClick={() => setShowProfileSetup(!showProfileSetup)}
              className="text-[10px] text-accent-turquoise hover:underline">
              {locale === 'tr' ? '👤 Profil Oluştur' : '👤 Create Profile'}
            </button>
          )}
          {profile && (
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <span>{profile.avatar}</span><span>{profile.nickname}</span>
            </div>
          )}
        </div>
        {showProfileSetup && !profile && (
          <div className="rounded-lg border border-accent-turquoise/20 bg-accent-turquoise/5 p-3 space-y-2">
            <p className="text-[11px] text-gray-400">{locale === 'tr' ? 'Avatar seç ve takma ad belirle' : 'Pick avatar & nickname'}</p>
            <div className="flex flex-wrap gap-1.5">
              {getAvatars().map(a => (
                <button key={a} type="button" onClick={() => setSelectedAvatar(a)}
                  className={`rounded-lg p-1.5 text-lg transition-all ${selectedAvatar === a ? 'bg-accent-turquoise/20 ring-1 ring-accent-turquoise/50' : 'hover:bg-white/5'}`}>{a}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={nickname} onChange={e => setNickname(e.target.value)}
                placeholder={locale === 'tr' ? 'Takma adın' : 'Nickname'}
                className="flex-1 rounded-lg border border-white/10 bg-dark-card/40 px-3 py-1.5 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-accent-turquoise/40" />
              <button type="button" onClick={handleSaveProfile} disabled={!nickname.trim()}
                className="rounded-lg bg-accent-turquoise/15 border border-accent-turquoise/30 px-3 py-1.5 text-[11px] text-accent-turquoise disabled:opacity-30">
                {locale === 'tr' ? 'Kaydet' : 'Save'}
              </button>
            </div>
          </div>
        )}
        {!profile && (
          <input type="text" value={author} onChange={e => setAuthor(e.target.value)}
            placeholder={locale === 'tr' ? 'Adın' : 'Your name'}
            className="w-full rounded-lg border border-white/10 bg-dark-card/40 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-accent-turquoise/40" required />
        )}
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder={locale === 'tr' ? 'Yorumun...' : 'Your comment...'}
          className="w-full rounded-lg border border-white/10 bg-dark-card/40 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-accent-turquoise/40 min-h-[80px] resize-y" required />
        <button type="submit" className="rounded-lg bg-accent-turquoise/15 border border-accent-turquoise/30 px-4 py-2 text-xs font-medium text-accent-turquoise hover:bg-accent-turquoise/25 transition-all">
          {locale === 'tr' ? 'Gönder' : 'Submit'}
        </button>
      </form>
    </section>
  );
}

/* Comment Card with replies, like/dislike */
function CommentCard({ comment: c, replies, locale, reported, replyTo, replyText, onReport, onReaction, onReplyTo, onReplyTextChange, onReplySubmit }: {
  comment: Comment; replies: Comment[]; locale: 'tr' | 'en'; reported: Set<string>;
  replyTo: string | null; replyText: string;
  onReport: (id: string) => void; onReaction: (id: string, type: 'like' | 'dislike') => void;
  onReplyTo: (id: string | null) => void; onReplyTextChange: (t: string) => void; onReplySubmit: (parentId: string) => void;
}) {
  const myReaction = getUserReaction(c.id);
  return (
    <div className={`rounded-xl border p-4 ${c.status === 'pending' ? 'border-amber-500/10 bg-amber-500/5' : 'border-white/5 bg-dark-card/30'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-turquoise/15 text-xs">
            {c.avatar || c.author[0]?.toUpperCase()}
          </div>
          <span className="text-sm font-medium text-gray-200">{c.author}</span>
          <span className="text-[10px] text-gray-600">{new Date(c.createdAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}</span>
          {c.status === 'pending' && <span className="rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[9px] text-amber-400">{locale === 'tr' ? 'Onay bekliyor' : 'Pending'}</span>}
        </div>
      </div>
      <p className="text-sm text-gray-300 leading-relaxed mb-3">{c.text}</p>

      {/* Actions: like, dislike, reply, report */}
      <div className="flex items-center gap-3 text-[11px]">
        <button onClick={() => onReaction(c.id, 'like')}
          className={`flex items-center gap-1 transition-colors ${myReaction === 'like' ? 'text-emerald-400' : 'text-gray-500 hover:text-emerald-400'}`}>
          👍 {c.likes > 0 && c.likes}
        </button>
        <button onClick={() => onReaction(c.id, 'dislike')}
          className={`flex items-center gap-1 transition-colors ${myReaction === 'dislike' ? 'text-rose-400' : 'text-gray-500 hover:text-rose-400'}`}>
          👎 {c.dislikes > 0 && c.dislikes}
        </button>
        <button onClick={() => onReplyTo(replyTo === c.id ? null : c.id)}
          className="text-gray-500 hover:text-accent-turquoise transition-colors">
          💬 {locale === 'tr' ? 'Yanıtla' : 'Reply'}
        </button>
        <button onClick={() => onReport(c.id)} disabled={reported.has(c.id)}
          className={`ml-auto transition-colors ${reported.has(c.id) ? 'text-gray-600' : 'text-gray-500 hover:text-rose-400'}`}>
          {reported.has(c.id) ? '✓' : '⚑'} {locale === 'tr' ? 'Şikayet' : 'Report'}
        </button>
      </div>

      {/* Reply form */}
      {replyTo === c.id && (
        <div className="mt-3 flex gap-2">
          <input type="text" value={replyText} onChange={e => onReplyTextChange(e.target.value)}
            placeholder={locale === 'tr' ? 'Yanıtın...' : 'Your reply...'}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onReplySubmit(c.id); } }}
            className="flex-1 rounded-lg border border-white/10 bg-dark-card/40 px-3 py-1.5 text-xs text-gray-200 placeholder-gray-600 outline-none focus:border-accent-turquoise/40" />
          <button type="button" onClick={() => onReplySubmit(c.id)} disabled={!replyText.trim()}
            className="rounded-lg bg-accent-turquoise/10 border border-accent-turquoise/30 px-3 py-1.5 text-[11px] text-accent-turquoise disabled:opacity-30">
            {locale === 'tr' ? 'Gönder' : 'Send'}
          </button>
        </div>
      )}

      {/* Replies */}
      {replies.length > 0 && (
        <div className="mt-3 ml-6 space-y-2 border-l border-white/5 pl-4">
          {replies.map(r => {
            const rReaction = getUserReaction(r.id);
            return (
              <div key={r.id} className="rounded-lg border border-white/5 bg-dark-card/20 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs">{r.avatar || r.author[0]?.toUpperCase()}</span>
                  <span className="text-xs font-medium text-gray-300">{r.author}</span>
                  <span className="text-[9px] text-gray-600">{new Date(r.createdAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{r.text}</p>
                <div className="flex items-center gap-2 mt-2 text-[10px]">
                  <button onClick={() => onReaction(r.id, 'like')}
                    className={`${rReaction === 'like' ? 'text-emerald-400' : 'text-gray-600 hover:text-emerald-400'}`}>
                    👍 {r.likes > 0 && r.likes}
                  </button>
                  <button onClick={() => onReaction(r.id, 'dislike')}
                    className={`${rReaction === 'dislike' ? 'text-rose-400' : 'text-gray-600 hover:text-rose-400'}`}>
                    👎 {r.dislikes > 0 && r.dislikes}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
