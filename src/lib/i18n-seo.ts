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

export function localeAlternates(locale: string, path: string) {
  // Strip a leading slash if any so we always emit "/{locale}/{rest}".
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `/${l}${cleanPath === '/' ? '' : cleanPath}`;
  }
  // x-default points at whatever locale "/" redirects to (ROOT_LOCALE),
  // not at routing.defaultLocale. Google resolves x-default by following
  // the entry point, so advertising a locale the root never serves is
  // read as a contradiction.
  languages['x-default'] = `/${ROOT_LOCALE}${cleanPath === '/' ? '' : cleanPath}`;
  return {
    canonical: `/${locale}${cleanPath === '/' ? '' : cleanPath}`,
    languages,
  };
}
