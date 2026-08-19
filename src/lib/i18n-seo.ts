// Helper for per-page i18n metadata. Returns the alternates object that
// every localised page should attach to its generateMetadata output so
// search engines see hreflang annotations on each rendered <head>.
//
// Usage:
//   import { localeAlternates } from '@/lib/i18n-seo';
//   export async function generateMetadata({ params }) {
//     const { locale } = await params;
//     return {
//       title: ...,
//       alternates: localeAlternates(locale, '/about'),
//     };
//   }

import { routing, ROOT_LOCALE } from '@/i18n/routing';
import { SITE_URL } from '@/lib/seo';

/**
 * The path a localised page actually lives at.
 *
 * Single source of truth for every URL we mint for that page: the
 * canonical, the hreflang set, the JSON-LD ``url`` /
 * ``mainEntityOfPage``, the share link. They diverged before (F08) —
 * the canonical carried the locale, the JSON-LD didn't — because each
 * one built its own string.
 */
export function localePath(locale: string, path: string): string {
  // Strip a leading slash if any so we always emit "/{locale}/{rest}".
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${cleanPath === '/' ? '' : cleanPath}`;
}

/** Absolute form of {@link localePath}, for the contexts that can't use
 *  a root-relative URL (JSON-LD, og:url, share links). */
export function localeUrl(locale: string, path: string): string {
  return `${SITE_URL}${localePath(locale, path)}`;
}

export function localeAlternates(locale: string, path: string) {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = localePath(l, path);
  }
  // x-default points at whatever locale "/" redirects to (ROOT_LOCALE),
  // not at routing.defaultLocale. Google resolves x-default by following
  // the entry point, so advertising a locale the root never serves is
  // read as a contradiction.
  languages['x-default'] = localePath(ROOT_LOCALE, path);
  return {
    canonical: localePath(locale, path),
    languages,
  };
}
