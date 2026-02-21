'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { authenticate } from '@/lib/auth';
import { useLanguage } from '@/components/providers/LanguageProvider';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Small delay for UX feel
    await new Promise((r) => setTimeout(r, 400));

    const result = authenticate(username, password);

    if (result.success) {
      router.push('/admin');
    } else {
      setError(result.error ?? '');
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="mb-8 text-center">
          <span className="text-3xl font-bold tracking-tight text-accent-turquoise">
            Travel Atlas
          </span>
          <p className="mt-2 text-sm text-gray-400">{t('admin.loginTitle')}</p>
        </div>

        {/* Glassmorphism card */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-dark-card/70 p-8 shadow-glass backdrop-blur-xl"
        >
          {/* Error message */}
          {error && (
            <div className="mb-6 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
              {error}
            </div>
          )}

          {/* Username */}
          <div className="mb-5">
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              {t('admin.username')}
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-white/10 bg-dark-secondary px-4 py-3 text-gray-100 placeholder-gray-500 transition-colors focus:border-accent-turquoise focus:outline-none focus:ring-1 focus:ring-accent-turquoise/50 disabled:opacity-50"
            />
          </div>

          {/* Password */}
          <div className="mb-8">
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              {t('admin.password')}
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full rounded-lg border border-white/10 bg-dark-secondary px-4 py-3 text-gray-100 placeholder-gray-500 transition-colors focus:border-accent-turquoise focus:outline-none focus:ring-1 focus:ring-accent-turquoise/50 disabled:opacity-50"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent-turquoise px-4 py-3 font-semibold text-dark transition-all hover:bg-accent-turquoise/85 focus:outline-none focus:ring-2 focus:ring-accent-turquoise/50 focus:ring-offset-2 focus:ring-offset-dark-card disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? t('admin.loggingIn') : t('admin.login')}
          </button>
        </form>
      </div>
    </div>
  );
}
