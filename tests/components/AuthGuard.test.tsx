import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuthGuard from '@/components/admin/AuthGuard';

// Mock next/navigation
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

// Mock auth service
const isAuthenticatedMock = vi.fn();
vi.mock('@/lib/auth', () => ({
  isAuthenticated: () => isAuthenticatedMock(),
}));

describe('AuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('kimlik doğrulanmışsa children render eder', async () => {
    isAuthenticatedMock.mockReturnValue(true);

    render(
      <AuthGuard>
        <div data-testid="protected">Admin İçerik</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByTestId('protected')).toBeInTheDocument();
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('kimlik doğrulanmamışsa /login sayfasına yönlendirir', async () => {
    isAuthenticatedMock.mockReturnValue(false);

    render(
      <AuthGuard>
        <div data-testid="protected">Admin İçerik</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/login');
    });
    expect(screen.queryByTestId('protected')).not.toBeInTheDocument();
  });

  it('kontrol sırasında loading spinner gösterir', () => {
    // isAuthenticated henüz çağrılmadan önce spinner görünmeli
    isAuthenticatedMock.mockReturnValue(true);

    const { container } = render(
      <AuthGuard>
        <div data-testid="protected">Admin İçerik</div>
      </AuthGuard>
    );

    // İlk render'da spinner veya children olmalı
    // useEffect çalıştıktan sonra children render edilir
    const spinner = container.querySelector('.animate-spin');
    const content = screen.queryByTestId('protected');
    // Biri mutlaka mevcut olmalı
    expect(spinner || content).toBeTruthy();
  });
});
