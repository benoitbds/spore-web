// S7.2: matcher widened to capture all routes (except technical paths
// + transactional landings still living at the root). Root locale
// detection on "/" is now active. Routes in SKIP_LOCALE_PATHS bypass
// the i18n middleware entirely so existing email/Stripe links keep
// working unchanged. To be revisited in S7.2-bis when those routes
// migrate too with proper backend coordination.

import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

/**
 * Routes left at the non-localised root in S7.2.
 *
 * These are reached from external sources (email links, Stripe
 * redirects) whose URLs were minted before the migration. Skipping the
 * locale middleware keeps those external links working until S7.2-bis
 * coordinates the backend (api/emails.py, Stripe success_url) update.
 */
const SKIP_LOCALE_PATHS: readonly string[] = [
  '/auth',
  '/newsletter',
  '/payment',
  '/account',
  '/anthology/sent',
];

const CUSTOM_STATUS_RE = /^\/custom\/[^/]+\/status(\/|$)/;

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Skip transactional landings still at the root.
  if (
    SKIP_LOCALE_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`)) ||
    CUSTOM_STATUS_RE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Smart locale detection on the bare root.
  if (pathname === '/' || pathname === '') {
    const acceptLanguage = request.headers.get('accept-language') || '';
    const prefersFrench = acceptLanguage.toLowerCase().includes('fr');
    const targetLocale = prefersFrench ? 'fr' : 'en';
    const url = request.nextUrl.clone();
    url.pathname = `/${targetLocale}`;
    return NextResponse.redirect(url);
  }

  // 3. Standard intlMiddleware for everything else.
  return intlMiddleware(request);
}

export const config = {
  // Captures all routes except API, Next internals, static files, and
  // anything with a file extension (favicon, opengraph-image, …).
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
