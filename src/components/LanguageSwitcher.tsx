'use client';

import { useLocale } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';

/**
 * Inline FR ↔ EN switcher rendered in the Header (and reusable wherever).
 *
 * Renders a single link that toggles to the *other* locale, preserving
 * the current pathname. The next-intl ``Link`` rewrites the URL to
 * include the target locale prefix, so clicking on ``/fr/about`` lands
 * on ``/en/about`` (or vice versa).
 */
export default function LanguageSwitcher() {
  const pathname = usePathname();
  const locale = useLocale();
  const otherLocale = locale === 'fr' ? 'en' : 'fr';
  const otherLabel = otherLocale.toUpperCase();

  return (
    <Link
      href={pathname}
      locale={otherLocale}
      aria-label={`Switch to ${otherLabel}`}
      className="rounded-full border border-ink-500 px-3 py-1 font-mono text-xs text-mist-400 transition-colors hover:border-mist-500/60 hover:text-mist-100"
    >
      {otherLabel}
    </Link>
  );
}
