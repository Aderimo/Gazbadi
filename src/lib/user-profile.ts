'use client';

export interface UserProfile {
  nickname: string;
  avatar: string;
  createdAt: string;
}

const PROFILE_KEY = 'travel_atlas_profile';
const VIEWS_KEY = 'travel_atlas_views';

const AVATARS = ['🧑‍💻', '🌍', '✈️', '🎒', '🗺️', '🏔️', '🌊', '🏖️', '🚀', '🦋', '🌸', '🎭', '🐻', '🦊', '🐧', '🦉'];

export function getAvatars(): string[] { return AVATARS; }

export function getProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(PROFILE_KEY);
    return stored ? JSON.parse(stored) : null;
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

// Page view tracking
export function trackView(slug: string): void {
  if (typeof window === 'undefined') return;
  const views = getViews();
  views[slug] = (views[slug] || 0) + 1;
  localStorage.setItem(VIEWS_KEY, JSON.stringify(views));
}

export function getViews(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(VIEWS_KEY) || '{}');
  } catch { return {}; }
}
