'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function Footer() {
  const { locale, setLocale } = useLanguage();

  return (
    <footer
      className="border-t border-white/10 bg-dark-secondary"
      role="contentinfo"
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand */}
          <div className="flex flex-col items-center gap-3 sm:items-start">
            <Link href="/" className="text-lg font-semibold tracking-tight text-white">
              Travel<span className="text-accent-turquoise">Atlas</span>
            </Link>
            <a
              href="https://discord.gg/wMmtaG7UCx"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-gray-400 transition-colors hover:bg-[#5865F2]/10 hover:text-[#5865F2]"
            >
              <DiscordIcon />
              Discord
            </a>
          </div>

          {/* Language switcher */}
          <div className="flex flex-col items-center gap-3 sm:items-end">
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
        <div className="mt-8 flex flex-col items-center gap-1 border-t border-white/5 pt-6 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} Travel Atlas</span>
          <span className="text-gray-600">
            Crafted by{' '}
            <a
              href="https://github.com/Aderimo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 transition-colors hover:text-accent-turquoise"
            >
              Aderimo
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ── Discord SVG Icon ── */

function DiscordIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}
