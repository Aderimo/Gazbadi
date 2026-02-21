'use client';

import { useLanguage } from '@/components/providers/LanguageProvider';
import OptimizedImage from '@/components/ui/OptimizedImage';

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative -mt-16 flex min-h-[85vh] items-center justify-center overflow-hidden">
      {/* Background Image — above fold, eager load for LCP */}
      <OptimizedImage
        src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80"
        alt="Travel Atlas Hero"
        lazy={false}
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-dark via-dark/70 to-dark/30"
        aria-hidden="true"
      />

      {/* Parallax-like subtle grain layer */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_50%,_rgba(15,23,42,0.8)_100%)]"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 px-6 text-center">
        <h1 className="animate-fade-in mx-auto max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
          {t('hero.slogan')}
        </h1>

        {/* Decorative accent line */}
        <div className="animate-fade-in-delayed mx-auto mt-6 h-0.5 w-20 rounded-full bg-gradient-to-r from-accent-turquoise via-accent-indigo to-accent-amber" />
      </div>
    </section>
  );
}
