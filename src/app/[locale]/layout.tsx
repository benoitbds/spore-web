import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

/**
 * Locale-scoped layout — S7.1.
 *
 * Intentionally NOT a root layout: ``app/layout.tsx`` keeps ownership
 * of ``<html>`` / ``<body>`` / fonts / providers for the whole site
 * during the parallel migration. This nested layout only mounts the
 * ``NextIntlClientProvider`` so client components under ``/[locale]/...``
 * can call ``useTranslations``.
 *
 * S7.2 follow-up: refactor the root layout so ``lang`` on ``<html>``
 * becomes locale-aware (currently hardcoded ``"fr"``). Either by moving
 * the root layout into this file (replacing the legacy one) or by
 * deriving lang from ``headers()`` at the root.
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return <NextIntlClientProvider>{children}</NextIntlClientProvider>;
}
