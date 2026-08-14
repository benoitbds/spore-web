// S7.2: matcher widened to capture all routes (except technical paths
// + transactional landings still living at the root). Root locale
// detection on "/" is now active. Routes in SKIP_LOCALE_PATHS bypass
// the i18n middleware entirely so existing email/Stripe links keep
// working unchanged. To be revisited in S7.2-bis when those routes
// migrate too with proper backend coordination.

import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { ROOT_LOCALE, routing } from './i18n/routing';
import { SITE_URL } from './lib/seo';

const intlMiddleware = createMiddleware(routing);

const SITE_ORIGIN = new URL(SITE_URL).origin;
const SITE_HOSTNAME = new URL(SITE_URL).hostname;

/**
 * Origin to mint absolute redirects from.
 *
 * In production the reverse proxy forwards Host and X-Forwarded-Proto
 * but no X-Forwarded-Port, so anything derived from ``request.url`` /
 * ``request.nextUrl`` carries the internal listening port and produces
 * ``https://spore-research.com:3012/...`` — a dead URL from outside.
 * For requests that really target the public host we therefore ignore
 * the request origin entirely and use SITE_URL.
 *
 * Any other host (localhost in dev, a preview deploy, direct hits on
 * the pm2 port) keeps its own origin, so redirects stay inside whatever
 * environment issued them.
 */
function redirectOrigin(request: NextRequest): string {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? '';
  const hostname = host.split(':')[0].toLowerCase();
  return hostname === SITE_HOSTNAME ? SITE_ORIGIN : request.nextUrl.origin;
}

/**
 * Re-base a self-referencing Location header onto SITE_ORIGIN.
 *
 * The redirects next-intl emits internally — the locale-prefix rescue
 * on /pricing, /briefs/SPR-XXXX, and every other unprefixed path — are
 * built from the request origin, which we can't reach into. On the
 * public host that origin resolves to ``https://spore-research.com:3012``
 * because the proxy forwards no X-Forwarded-Port, so those redirects
 * land users and crawlers on a port that isn't reachable from outside.
 *
 * Rewriting the header after the fact fixes them all at once, whatever
 * next-intl does upstream. Only requests arriving on the public host
 * are touched, and only Locations pointing back at ourselves — an
 * external redirect (none today) would pass through untouched.
 */
function normalizeLocation(response: NextResponse, request: NextRequest): NextResponse {
  const location = response.headers.get('location');
  if (!location || redirectOrigin(request) !== SITE_ORIGIN) return response;

  let target: URL;
  try {
    target = new URL(location, SITE_ORIGIN);
  } catch {
    return response;
  }
  if (target.hostname !== SITE_HOSTNAME) return response;

  response.headers.set(
    'location',
    `${SITE_ORIGIN}${target.pathname}${target.search}${target.hash}`,
  );
  return response;
}

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

  // 2. Bare root — deterministic 308 to ROOT_LOCALE (S1/GSC-F1).
  //
  // Was: Accept-Language sniffing, sending header-less clients to /en
  // and French browsers to /fr. Two problems. The 307 kept "/" itself
  // indexed carrying EN content, which collided with /en's own
  // canonical and got the EN home dropped as a duplicate; and the
  // varying target contradicted the x-default annotation.
  //
  // 308 hands the indexing signals to the target instead of retaining
  // the source, and the target now matches the x-default emitted by
  // localeAlternates — both read ROOT_LOCALE.
  if (pathname === '/' || pathname === '') {
    return NextResponse.redirect(
      new URL(`/${ROOT_LOCALE}${request.nextUrl.search}`, redirectOrigin(request)),
      308,
    );
  }

  // 3. Standard intlMiddleware for everything else, with its Location
  //    header re-based on the public origin (S1/F02).
  return normalizeLocation(intlMiddleware(request), request);
}

export const config = {
  // Captures all routes except API, Next internals, static files, and
  // anything with a file extension (favicon, opengraph-image, …).
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
