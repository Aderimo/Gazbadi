'use client';

import type { Comment, CommentStatus } from '@/types';

const COMMENTS_KEY = 'travel_atlas_comments';
const REACTIONS_KEY = 'travel_atlas_reactions';

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

export function getCommentsByAuthor(author: string): Comment[] {
  return getAll().filter(c => c.author === author);
}

export function addComment(slug: string, contentType: Comment['contentType'], author: string, text: string, avatar?: string, parentId?: string): Comment {
  const comments = getAll();
  const comment: Comment = {
    id: `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    contentSlug: slug, contentType, author, avatar, text,
    status: 'pending', reports: 0, likes: 0, dislikes: 0,
    parentId, createdAt: new Date().toISOString(),
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
  const comments = getAll().filter(c => c.id !== id && c.parentId !== id);
  saveAll(comments);
  return comments;
}

// Reactions (like/dislike) tracking per user
function getReactions(): Record<string, 'like' | 'dislike'> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(REACTIONS_KEY) || '{}'); } catch { return {}; }
}

function saveReactions(r: Record<string, 'like' | 'dislike'>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REACTIONS_KEY, JSON.stringify(r));
}

export function getUserReaction(commentId: string): 'like' | 'dislike' | null {
  return getReactions()[commentId] || null;
}

export function toggleReaction(commentId: string, type: 'like' | 'dislike'): Comment[] {
  const reactions = getReactions();
  const prev = reactions[commentId];
  const comments = getAll().map(c => {
    if (c.id !== commentId) return c;
    let { likes, dislikes } = c;
    // Remove previous reaction
    if (prev === 'like') likes = Math.max(0, likes - 1);
    if (prev === 'dislike') dislikes = Math.max(0, dislikes - 1);
    // Toggle or set new
    if (prev === type) { delete reactions[commentId]; }
    else { reactions[commentId] = type; if (type === 'like') likes++; else dislikes++; }
    return { ...c, likes, dislikes };
  });
  saveAll(comments);
  saveReactions(reactions);
  return comments;
}
