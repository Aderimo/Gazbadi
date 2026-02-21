import { describe, it, expect } from 'vitest';
import { getDetailUrl } from '@/lib/url';

describe('getDetailUrl', () => {
  it('location tipi için /location/{slug} döndürür', () => {
    expect(getDetailUrl({ type: 'location', slug: 'istanbul' })).toBe('/location/istanbul');
  });

  it('blog tipi için /blog/{slug} döndürür', () => {
    expect(getDetailUrl({ type: 'blog', slug: 'first-post' })).toBe('/blog/first-post');
  });

  it('friend-experience tipi için /friend-experiences/{slug} döndürür', () => {
    expect(getDetailUrl({ type: 'friend-experience', slug: 'ali-istanbul' })).toBe(
      '/friend-experiences/ali-istanbul',
    );
  });

  it('recommendation tipi için /my-recommendations döndürür', () => {
    expect(getDetailUrl({ type: 'recommendation', slug: 'my-top-picks' })).toBe(
      '/my-recommendations',
    );
  });

  it('recommendation tipi slug değerinden bağımsız aynı URL döndürür', () => {
    expect(getDetailUrl({ type: 'recommendation', slug: 'anything' })).toBe('/my-recommendations');
    expect(getDetailUrl({ type: 'recommendation', slug: '' })).toBe('/my-recommendations');
  });

  it('slug içinde tire olan location doğru URL üretir', () => {
    expect(getDetailUrl({ type: 'location', slug: 'new-york-city' })).toBe(
      '/location/new-york-city',
    );
  });

  it('slug içinde rakam olan blog doğru URL üretir', () => {
    expect(getDetailUrl({ type: 'blog', slug: 'top-10-places-2024' })).toBe(
      '/blog/top-10-places-2024',
    );
  });
});
