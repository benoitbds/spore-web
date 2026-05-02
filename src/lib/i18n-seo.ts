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

import { routing } from '@/i18n/routing';

export function localeAlternates(locale: string, path: string) {
  // Strip a leading slash if any so we always emit "/{locale}/{rest}".
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = `/${l}${cleanPath === '/' ? '' : cleanPath}`;
  }
  // x-default points at the routing default locale per Google's guidance.
  languages['x-default'] = `/${routing.defaultLocale}${cleanPath === '/' ? '' : cleanPath}`;
  return {
    canonical: `/${locale}${cleanPath === '/' ? '' : cleanPath}`,
    languages,
  };
}
