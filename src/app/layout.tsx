// Root layout (S7.3). Owns the HTML shell, fonts, and the AuthProvider.
// The chrome (Header / Footer / LaunchBanner) lives in
// app/[locale]/layout.tsx so it can call useTranslations.
//
// <html lang> is now driven by getLocale() from next-intl/server. The
// next-intl middleware injects an x-next-intl-locale header on every
// localised request which getLocale picks up here. Non-localised
// routes (auth, newsletter, payment, account, anthology/sent,
// custom/[id]/status) fall back to the routing default (fr) since the
// middleware skips them and no locale header is set.

import type { Metadata } from 'next';
import { Instrument_Serif, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { getLocale } from 'next-intl/server';
import { AuthProvider } from '@/contexts/AuthContext';
import '@/styles/globals.css';
import { SITE_URL, SITE_NAME, SITE_TAGLINE, SITE_DESCRIPTION } from '@/lib/seo';

const display = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TAGLINE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'science',
    'IA',
    'hypothèses scientifiques',
    'recherche interdisciplinaire',
    'collision de domaines',
    'vulgarisation scientifique',
    'SPORE',
  ],
  authors: [{ name: 'SPORE Research' }],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: SITE_NAME,
    title: SITE_TAGLINE,
    description:
      "Des hypothèses scientifiques disruptives, vulgarisées et vérifiées. Zéro hallucination bibliographique.",
    url: SITE_URL,
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'SPORE — Le moteur d\'hypothèses interdisciplinaires',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TAGLINE,
    description: "Des hypothèses scientifiques disruptives, vulgarisées et vérifiées.",
    images: ['/og-default.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="bg-ink-900 text-mist-200 antialiased font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
