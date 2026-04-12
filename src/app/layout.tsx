import type { Metadata } from 'next';
import { Instrument_Serif, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '@/styles/globals.css';

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
  title: {
    default: 'SPORE — L\'IA qui imagine les découvertes de demain',
    template: '%s · SPORE',
  },
  description:
    'SPORE génère des hypothèses scientifiques disruptives en croisant aléatoirement des domaines éloignés, puis les valide avec 5 reviewers IA spécialisés.',
  keywords: ['science', 'AI', 'research', 'hypothesis', 'interdisciplinary', 'SPORE'],
  authors: [{ name: 'Bac' }],
  openGraph: {
    type: 'website',
    title: 'SPORE — Système de Production d\'Opportunités de Recherche',
    description:
      'L\'IA qui croise les sciences pour imaginer les découvertes de demain.',
    siteName: 'SPORE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SPORE',
    description: 'L\'IA qui croise les sciences pour imaginer les découvertes de demain.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="bg-ink-900 text-mist-200 antialiased font-sans">
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
