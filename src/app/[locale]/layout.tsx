import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale, getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LaunchBanner from '@/components/LaunchBanner';

/**
 * Locale-scoped layout (S7.2).
 *
 * Owns the chrome — LaunchBanner / Header / Footer — for every page
 * under ``/fr/...`` and ``/en/...``. Wraps children in
 * NextIntlClientProvider so client components can call
 * ``useTranslations`` synchronously.
 *
 * Pages still living at the root (``/auth``, ``/newsletter/*``,
 * ``/payment/*``, ``/account``, ``/anthology/sent``,
 * ``/custom/[id]/status``) bypass this layout and render with the bare
 * root HTML shell. They will be migrated in S7.2-bis.
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
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <LaunchBanner />
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </NextIntlClientProvider>
  );
}
