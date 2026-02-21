'use client';

import type { AuthState } from '@/types';

// localStorage keys
const TOKEN_KEY = 'travel_atlas_token';
const USERNAME_KEY = 'travel_atlas_username';

// Simple hash function (djb2 variant + hex encoding) for client-side password comparison
// Not cryptographically secure, but sufficient for client-side-only static site auth
function simpleHash(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0xffffffff;
  }
  // Convert to unsigned and hex
  return (hash >>> 0).toString(16).padStart(8, '0');
}

// Pre-hashed credentials (username: "admin", password: "Travel@2026Secure!")
const VALID_USERNAME_HASH = simpleHash('admin');
const VALID_PASSWORD_HASH = simpleHash('Travel@2026Secure!');

// Generic error message — never reveals which field is wrong
const GENERIC_ERROR = 'Geçersiz kimlik bilgileri';

/**
 * Generate a simple session token
 */
function generateToken(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Authenticate with username and password.
 * Returns success or a generic error that doesn't leak field info.
 */
export function authenticate(
  username: string,
  password: string
): { success: boolean; error?: string } {
  const usernameHash = simpleHash(username);
  const passwordHash = simpleHash(password);

  if (usernameHash === VALID_USERNAME_HASH && passwordHash === VALID_PASSWORD_HASH) {
    const token = generateToken();
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USERNAME_KEY, username);
    }
    return { success: true };
  }

  return { success: false, error: GENERIC_ERROR };
}

/**
 * Logout — clears token and username from localStorage.
 */
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
  }
}

/**
 * Get current auth state from localStorage.
 */
export function getAuthState(): AuthState {
  if (typeof window === 'undefined') {
    return { isAuthenticated: false, username: null, token: null };
  }

  const token = localStorage.getItem(TOKEN_KEY);
  const username = localStorage.getItem(USERNAME_KEY);

  return {
    isAuthenticated: token !== null,
    username: username,
    token: token,
  };
}

/**
 * Check if user is currently authenticated.
 */
export function isAuthenticated(): boolean {
  return getAuthState().isAuthenticated;
}

// Export for testing
export { simpleHash, GENERIC_ERROR, TOKEN_KEY, USERNAME_KEY };
