import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

/**
 * SPORE locale routing — S7.1 foundation.
 *
 *  - ``locales``: French (FR) and English (EN). EN doubles as lingua
 *    franca for any other browser language.
 *  - ``defaultLocale``: French. Used as fallback when the middleware
 *    can't determine a preference and no explicit locale is in the URL.
 *  - ``localePrefix: 'always'``: every localised URL carries an explicit
 *    locale segment (``/fr/...`` or ``/en/...``). No bare paths under
 *    the localised tree.
 */
export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];

/**
 * Locale the bare root ("/") resolves to — S1/GSC-F1.
 *
 * Deliberately separate from ``defaultLocale``. ``defaultLocale`` drives
 * next-intl's own fallbacks; this constant drives two things that must
 * agree with each other or Google sees a contradiction:
 *
 *   1. the target of the 308 the middleware serves on "/",
 *   2. the ``x-default`` hreflang emitted by ``localeAlternates``.
 *
 * They previously disagreed — "/" sent header-less clients (Googlebot
 * included) to /en while x-default advertised /fr — which is what got
 * the EN home dropped as a duplicate. Change this in one place or not
 * at all.
 */
export const ROOT_LOCALE: Locale = 'en';

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
