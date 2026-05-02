// S7.1 NOTE: matcher restricted to /(fr|en)/:path* to preserve
// existing pages during parallel migration. Root locale detection
// (Accept-Language) will be activated in S7.2 once all pages exist
// in [locale] structure.

import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // Smart locale detection on the bare root.
  //
  // CURRENTLY UNREACHABLE: the matcher below excludes "/" so this
  // branch never fires in S7.1 — kept here verbatim so that activating
  // root-locale-detection in S7.2 is a single-line change to the matcher.
  const pathname = request.nextUrl.pathname;
  if (pathname === '/' || pathname === '') {
    const acceptLanguage = request.headers.get('accept-language') || '';
    const prefersFrench = acceptLanguage.toLowerCase().includes('fr');
    const targetLocale = prefersFrench ? 'fr' : 'en';
    const url = request.nextUrl.clone();
    url.pathname = `/${targetLocale}`;
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  // S7.1 scope: only intercept explicit locale-prefixed paths. All
  // other paths (/, /about, /briefs/..., /custom, ...) bypass this
  // middleware entirely and continue to be served by the legacy
  // non-localised tree under src/app/. To be widened in S7.2.
  matcher: ['/(fr|en)/:path*'],
};
