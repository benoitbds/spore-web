/**
 * JWT cookie helpers.
 *
 * The session JWT is stored in a non-httpOnly cookie ``spore_token``
 * because this frontend owns the token (no same-origin API, no proxy
 * layer). Consequence: any XSS on this site can exfiltrate the token,
 * so the site must keep its XSS hygiene tight (no dangerouslySetInnerHTML
 * with user-controlled strings, etc.). For a POC monetisation flow this
 * tradeoff is acceptable; the next step is a BFF proxy that sets an
 * httpOnly cookie.
 */
import Cookies from 'js-cookie';

export const TOKEN_COOKIE = 'spore_token';
export const TOKEN_MAX_AGE_DAYS = 30;

export function setToken(token: string): void {
  Cookies.set(TOKEN_COOKIE, token, {
    expires: TOKEN_MAX_AGE_DAYS,
    sameSite: 'lax',
    secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
  });
}

export function getToken(): string | null {
  return Cookies.get(TOKEN_COOKIE) ?? null;
}

export function clearToken(): void {
  Cookies.remove(TOKEN_COOKIE);
}
