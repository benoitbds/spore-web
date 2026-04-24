'use client';

/**
 * Auth context — magic-link login + JWT cookie.
 *
 * On mount, we read ``spore_token`` from the cookie and call ``/api/auth/me``
 * to rehydrate the user profile. If that call 401s (token expired, revoked,
 * or the API is down), the cookie is cleared and the user is anonymous.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, type MeResponse, ApiError } from '@/lib/api';
import { clearToken, getToken, setToken } from '@/lib/auth-storage';

export interface AuthState {
  user: MeResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Request a magic link. Throws on network / rate-limit errors. */
  login: (email: string, next?: string) => Promise<void>;
  /** Exchange a magic-link token for a session JWT; returns the user profile. */
  verify: (token: string) => Promise<MeResponse>;
  /** Clear the local session. */
  logout: () => void;
  /** Re-read `/api/auth/me` (after a purchase updates credits). */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const rehydrate = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const me = await api.me();
      setUser(me);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearToken();
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    rehydrate();
  }, [rehydrate]);

  const login = useCallback(async (email: string, next?: string) => {
    await api.requestMagicLink(email, next);
  }, []);

  const verify = useCallback(async (token: string) => {
    const { token: jwt, user: me } = await api.verifyMagicLink(token);
    setToken(jwt);
    setUser(me);
    return me;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      verify,
      logout,
      refresh: rehydrate,
    }),
    [user, isLoading, login, verify, logout, rehydrate],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
