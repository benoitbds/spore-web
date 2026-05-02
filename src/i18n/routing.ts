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

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
