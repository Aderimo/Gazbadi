'use client';

import type { Comment, CommentStatus } from '@/types';

const COMMENTS_KEY = 'travel_atlas_comments';

function getAll(): Comment[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(COMMENTS_KEY) || '[]'); } catch { return []; }
}

function saveAll(comments: Comment[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
}

export function getComments(): Comment[] { return getAll(); }

export function getCommentsBySlug(slug: string): Comment[] {
  return getAll().filter(c => c.contentSlug === slug);
}

export function addComment(slug: string, contentType: Comment['contentType'], author: string, text: string): Comment {
  const comments = getAll();
  const comment: Comment = {
    id: `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    contentSlug: slug, contentType, author, text,
    status: 'pending', reports: 0, createdAt: new Date().toISOString(),
  };
  comments.push(comment);
  saveAll(comments);
  return comment;
}

export function updateCommentStatus(id: string, status: CommentStatus): Comment[] {
  const comments = getAll().map(c => c.id === id ? { ...c, status } : c);
  saveAll(comments);
  return comments;
}

export function reportComment(id: string): Comment[] {
  const comments = getAll().map(c => {
    if (c.id !== id) return c;
    const reports = c.reports + 1;
    return { ...c, reports, status: reports >= 3 ? 'flagged' as CommentStatus : c.status };
  });
  saveAll(comments);
  return comments;
}

export function deleteComment(id: string): Comment[] {
  const comments = getAll().filter(c => c.id !== id);
  saveAll(comments);
  return comments;
}
