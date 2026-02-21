import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  authenticate,
  logout,
  getAuthState,
  isAuthenticated,
  simpleHash,
  GENERIC_ERROR,
  TOKEN_KEY,
  USERNAME_KEY,
} from '@/lib/auth';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

describe('simpleHash', () => {
  it('aynı girdi için aynı hash üretir', () => {
    expect(simpleHash('test')).toBe(simpleHash('test'));
  });

  it('farklı girdiler için farklı hash üretir', () => {
    expect(simpleHash('admin')).not.toBe(simpleHash('user'));
  });

  it('8 karakter hex string döndürür', () => {
    const hash = simpleHash('anything');
    expect(hash).toMatch(/^[0-9a-f]{8}$/);
  });
});

describe('authenticate', () => {
  it('doğru kimlik bilgileri ile başarılı döner', () => {
    const result = authenticate('admin', 'Travel@2026Secure!');
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('başarılı girişte localStorage\'a token kaydeder', () => {
    authenticate('admin', 'Travel@2026Secure!');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(TOKEN_KEY, expect.any(String));
    expect(localStorageMock.setItem).toHaveBeenCalledWith(USERNAME_KEY, 'admin');
  });

  it('yanlış şifre ile genel hata mesajı döner', () => {
    const result = authenticate('admin', 'wrongpassword');
    expect(result.success).toBe(false);
    expect(result.error).toBe(GENERIC_ERROR);
  });

  it('yanlış kullanıcı adı ile genel hata mesajı döner', () => {
    const result = authenticate('wronguser', 'Travel@2026Secure!');
    expect(result.success).toBe(false);
    expect(result.error).toBe(GENERIC_ERROR);
  });

  it('her iki alan da yanlışken genel hata mesajı döner', () => {
    const result = authenticate('wronguser', 'wrongpassword');
    expect(result.success).toBe(false);
    expect(result.error).toBe(GENERIC_ERROR);
  });

  it('tüm hata mesajları aynıdır — alan bilgisi sızdırmaz', () => {
    const wrongUser = authenticate('wronguser', 'Travel@2026Secure!');
    const wrongPass = authenticate('admin', 'wrongpassword');
    const bothWrong = authenticate('wronguser', 'wrongpassword');
    expect(wrongUser.error).toBe(wrongPass.error);
    expect(wrongPass.error).toBe(bothWrong.error);
  });

  it('hata mesajı gönderilen kullanıcı adını içermez', () => {
    const result = authenticate('secretuser', 'wrongpassword');
    expect(result.error).not.toContain('secretuser');
  });

  it('hata mesajı gönderilen şifreyi içermez', () => {
    const result = authenticate('admin', 'MySecret123');
    expect(result.error).not.toContain('MySecret123');
  });

  it('başarısız girişte localStorage\'a token kaydetmez', () => {
    authenticate('wrong', 'wrong');
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('boş kullanıcı adı ile başarısız döner', () => {
    const result = authenticate('', 'Travel@2026Secure!');
    expect(result.success).toBe(false);
  });

  it('boş şifre ile başarısız döner', () => {
    const result = authenticate('admin', '');
    expect(result.success).toBe(false);
  });
});

describe('logout', () => {
  it('localStorage\'dan token ve username siler', () => {
    authenticate('admin', 'Travel@2026Secure!');
    logout();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(TOKEN_KEY);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith(USERNAME_KEY);
  });

  it('logout sonrası isAuthenticated false döner', () => {
    authenticate('admin', 'Travel@2026Secure!');
    logout();
    expect(isAuthenticated()).toBe(false);
  });
});

describe('getAuthState', () => {
  it('giriş yapılmamışken varsayılan state döner', () => {
    const state = getAuthState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.username).toBeNull();
    expect(state.token).toBeNull();
  });

  it('giriş yapıldıktan sonra doğru state döner', () => {
    authenticate('admin', 'Travel@2026Secure!');
    const state = getAuthState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.username).toBe('admin');
    expect(state.token).toBeTruthy();
  });

  it('logout sonrası state sıfırlanır', () => {
    authenticate('admin', 'Travel@2026Secure!');
    logout();
    const state = getAuthState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.username).toBeNull();
    expect(state.token).toBeNull();
  });
});

describe('isAuthenticated', () => {
  it('giriş yapılmamışken false döner', () => {
    expect(isAuthenticated()).toBe(false);
  });

  it('giriş yapıldıktan sonra true döner', () => {
    authenticate('admin', 'Travel@2026Secure!');
    expect(isAuthenticated()).toBe(true);
  });
});
