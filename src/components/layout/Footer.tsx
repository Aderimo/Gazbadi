'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';

const SOCIAL_LINKS = [
  { name: 'Instagram', href: 'https://instagram.com/travelatlas', icon: InstagramIcon },
  { name: 'X', href: 'https://x.com/travelatlas', icon: XIcon },
  { name: 'YouTube', href: 'https://youtube.com/@travelatlas', icon: YouTubeIcon },
] as const;

export default function Footer() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <footer
      className="border-t border-white/10 bg-dark-secondary"
      role="contentinfo"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
          {/* Brand + Contact */}
          <div className="space-y-3">
            <Link href="/" className="text-lg font-semibold tracking-tight text-white">
              Travel<span className="text-accent-turquoise">Atlas</span>
            </Link>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-300">{t('footer.contact')}</h3>
              <a
                href="mailto:hello@travelatlas.com"
                className="block text-sm text-gray-400 transition-colors hover:text-accent-turquoise"
              >
                hello@travelatlas.com
              </a>
            </div>
          </div>

          {/* Social */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">{t('footer.followUs')}</h3>
            <ul className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ name, href, icon: Icon }) => (
                <li key={name}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-colors hover:bg-white/10 hover:text-accent-turquoise"
                  >
                    <Icon />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Language switcher */}
          <div className="space-y-3 sm:text-right">
            <div className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-0.5">
              <button
                onClick={() => setLocale('tr')}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  locale === 'tr'
                    ? 'bg-accent-turquoise/20 text-accent-turquoise'
                    : 'text-gray-400 hover:text-white'
                }`}
                aria-label="Türkçe"
                aria-pressed={locale === 'tr'}
              >
                🇹🇷 TR
              </button>
              <button
                onClick={() => setLocale('en')}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                  locale === 'en'
                    ? 'bg-accent-turquoise/20 text-accent-turquoise'
                    : 'text-gray-400 hover:text-white'
                }`}
                aria-label="English"
                aria-pressed={locale === 'en'}
              >
                🇬🇧 EN
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-white/5 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Travel Atlas
        </div>
      </div>
    </footer>
  );
}

/* ── Inline SVG Icons ── */

function InstagramIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12z" />
    </svg>
  );
}
