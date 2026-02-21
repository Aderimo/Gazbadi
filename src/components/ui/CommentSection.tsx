'use client';

import React, { useState, useEffect } from 'react';
import type { Comment } from '@/types';
import { getCommentsBySlug, addComment, reportComment } from '@/lib/comments-store';

interface Props {
  slug: string;
  contentType: Comment['contentType'];
  locale: 'tr' | 'en';
}

export default function CommentSection({ slug, contentType, locale }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [reported, setReported] = useState<Set<string>>(new Set());

  useEffect(() => {
    setComments(getCommentsBySlug(slug));
    try {
      const r = JSON.parse(localStorage.getItem('ta_reported') || '[]');
      setReported(new Set(r));
    } catch { /* */ }
  }, [slug]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!author.trim() || !text.trim()) return;
    addComment(slug, contentType, author.trim(), text.trim());
    setComments(getCommentsBySlug(slug));
    setAuthor(''); setText('');
  }

  function handleReport(id: string) {
    if (reported.has(id)) return;
    reportComment(id);
    setComments(getCommentsBySlug(slug));
    const next = new Set(reported).add(id);
    setReported(next);
    localStorage.setItem('ta_reported', JSON.stringify(Array.from(next)));
  }

  const approved = comments.filter(c => c.status === 'approved');
  const pending = comments.filter(c => c.status === 'pending');

  return (
    <section className="mt-10 border-t border-white/10 pt-8">
      <h3 className="mb-6 text-lg font-semibold text-white">
        💬 {locale === 'tr' ? 'Yorumlar' : 'Comments'}
        {approved.length > 0 && <span className="ml-2 text-sm text-gray-500">({approved.length})</span>}
      </h3>

      {/* Comment list */}
      <div className="space-y-4 mb-8">
        {approved.map(c => (
          <div key={c.id} className="rounded-xl border border-white/5 bg-dark-card/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-turquoise/15 text-xs font-bold text-accent-turquoise">
                  {c.author[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-200">{c.author}</span>
                <span className="text-[10px] text-gray-600">{new Date(c.createdAt).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}</span>
              </div>
              <button
                onClick={() => handleReport(c.id)}
                disabled={reported.has(c.id)}
                className={`text-[10px] transition-colors ${reported.has(c.id) ? 'text-gray-600 cursor-default' : 'text-gray-500 hover:text-rose-400'}`}
                title={locale === 'tr' ? 'Şikayet et' : 'Report'}
              >
                {reported.has(c.id) ? '✓ ' : '⚑ '}{locale === 'tr' ? 'Şikayet' : 'Report'}
              </button>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{c.text}</p>
          </div>
        ))}
        {pending.length > 0 && (
          <p className="text-[11px] text-gray-600 italic">
            {locale === 'tr' ? `${pending.length} yorum onay bekliyor` : `${pending.length} comment(s) awaiting approval`}
          </p>
        )}
        {approved.length === 0 && pending.length === 0 && (
          <p className="text-sm text-gray-600">{locale === 'tr' ? 'Henüz yorum yok. İlk yorumu sen yaz!' : 'No comments yet. Be the first!'}</p>
        )}
      </div>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-white/5 bg-dark-card/20 p-4">
        <p className="text-xs font-medium text-gray-400">{locale === 'tr' ? 'Yorum Yaz' : 'Write a Comment'}</p>
        <input
          type="text" value={author} onChange={e => setAuthor(e.target.value)}
          placeholder={locale === 'tr' ? 'Adın' : 'Your name'}
          className="w-full rounded-lg border border-white/10 bg-dark-card/40 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-accent-turquoise/40"
          required
        />
        <textarea
          value={text} onChange={e => setText(e.target.value)}
          placeholder={locale === 'tr' ? 'Yorumun...' : 'Your comment...'}
          className="w-full rounded-lg border border-white/10 bg-dark-card/40 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-accent-turquoise/40 min-h-[80px] resize-y"
          required
        />
        <button type="submit" className="rounded-lg bg-accent-turquoise/15 border border-accent-turquoise/30 px-4 py-2 text-xs font-medium text-accent-turquoise hover:bg-accent-turquoise/25 transition-all">
          {locale === 'tr' ? 'Gönder' : 'Submit'}
        </button>
      </form>
    </section>
  );
}
