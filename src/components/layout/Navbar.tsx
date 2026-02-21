'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/components/providers/LanguageProvider';

const NAV_LINKS = [
  { key: 'nav.home', href: '/' },
  { key: 'nav.explore', href: '/explore' },
  { key: 'nav.myRecommendations', href: '/my-recommendations' },
  { key: 'nav.friendExperiences', href: '/friend-experiences' },
  { key: 'nav.blog', href: '/blog' },
] as const;

export default function Navbar() {
  const { locale, setLocale, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-dark/70 backdrop-blur-[14px]"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="text-lg font-semibold tracking-tight text-white">
          Travel<span className="text-accent-turquoise">Atlas</span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ key, href }) => (
            <li key={href}>
              <Link
                href={href}
                className="rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                {t(key)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {/* Admin Panel Button */}
          <Link
            href="/login"
            className="hidden rounded-lg border border-accent-indigo/30 bg-accent-indigo/10 px-3 py-1.5 text-xs font-medium text-accent-indigo transition-colors hover:bg-accent-indigo/20 md:inline-flex items-center gap-1.5"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Admin
          </Link>

          {/* Language switcher */}
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-0.5">
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

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-gray-300 transition-colors hover:bg-white/5 hover:text-white md:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/5 bg-dark/90 backdrop-blur-[14px] md:hidden">
          <ul className="space-y-1 px-4 py-3">
            {NAV_LINKS.map(({ key, href }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {t(key)}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-accent-indigo transition-colors hover:bg-accent-indigo/10"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin Panel
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
