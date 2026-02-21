'use client';

export interface UserProfile {
  nickname: string;
  avatar: string;
  visitedPlaces: string[];
  createdAt: string;
}

const PROFILE_KEY = 'travel_atlas_profile';
const VIEWS_KEY = 'travel_atlas_views';
const DAILY_VIEWS_KEY = 'travel_atlas_daily_views';

const AVATARS = ['🧑‍💻', '🌍', '✈️', '🎒', '🗺️', '🏔️', '🌊', '🏖️', '🚀', '🦋', '🌸', '🎭', '🐻', '🦊', '🐧', '🦉'];

export function getAvatars(): string[] { return AVATARS; }

export function getProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (!stored) return null;
    const p = JSON.parse(stored);
    if (!p.visitedPlaces) p.visitedPlaces = [];
    return p;
  } catch { return null; }
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function clearProfile(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PROFILE_KEY);
}

export function toggleVisitedPlace(slug: string): UserProfile | null {
  const p = getProfile();
  if (!p) return null;
  const idx = p.visitedPlaces.indexOf(slug);
  if (idx >= 0) p.visitedPlaces.splice(idx, 1);
  else p.visitedPlaces.push(slug);
  saveProfile(p);
  return p;
}

// Page view tracking (total)
export function trackView(slug: string): void {
  if (typeof window === 'undefined') return;
  const views = getViews();
  views[slug] = (views[slug] || 0) + 1;
  localStorage.setItem(VIEWS_KEY, JSON.stringify(views));
  // Daily tracking
  const today = new Date().toISOString().slice(0, 10);
  const daily = getDailyViews();
  if (!daily[today]) daily[today] = {};
  daily[today][slug] = (daily[today][slug] || 0) + 1;
  localStorage.setItem(DAILY_VIEWS_KEY, JSON.stringify(daily));
}

export function getViews(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(VIEWS_KEY) || '{}'); } catch { return {}; }
}

export function getDailyViews(): Record<string, Record<string, number>> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(DAILY_VIEWS_KEY) || '{}'); } catch { return {}; }
}

// Rating system
const RATINGS_KEY = 'travel_atlas_ratings';

export function getRatings(): Record<string, number[]> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(RATINGS_KEY) || '{}'); } catch { return {}; }
}

export function getUserRating(slug: string): number {
  const key = `ta_myrating_${slug}`;
  if (typeof window === 'undefined') return 0;
  return Number(localStorage.getItem(key) || '0');
}

export function setRating(slug: string, rating: number): { avg: number; count: number } {
  const ratings = getRatings();
  if (!ratings[slug]) ratings[slug] = [];
  const prev = getUserRating(slug);
  if (prev > 0) {
    const idx = ratings[slug].indexOf(prev);
    if (idx >= 0) ratings[slug].splice(idx, 1);
  }
  ratings[slug].push(rating);
  localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
  localStorage.setItem(`ta_myrating_${slug}`, String(rating));
  const avg = ratings[slug].reduce((s, v) => s + v, 0) / ratings[slug].length;
  return { avg, count: ratings[slug].length };
}

export function getSlugRating(slug: string): { avg: number; count: number } {
  const ratings = getRatings();
  const arr = ratings[slug] || [];
  if (arr.length === 0) return { avg: 0, count: 0 };
  return { avg: arr.reduce((s, v) => s + v, 0) / arr.length, count: arr.length };
}
