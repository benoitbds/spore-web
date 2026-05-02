'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useAuth } from '@/contexts/AuthContext';

const COOKIE_NAME = 'spore_launch_banner_dismissed';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

function writeCookie(name: string, value: string, maxAgeSec: number) {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSec}; SameSite=Lax`;
}

/**
 * Thin sticky banner advertising the launch offer. Sits above <Header>
 * and disappears (persistently) when the user clicks the ✕.
 *
 * The banner's initial state is ``visible=true`` so it renders during
 * SSR (search crawlers + social previews see the launch copy) and
 * matches the first client render — no hydration mismatch. A useEffect
 * then flips it off if the dismissal cookie is present.
 */
export default function LaunchBanner() {
  const { isAuthenticated } = useAuth();
  const t = useTranslations('launchBanner');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (readCookie(COOKIE_NAME) === '1') setVisible(false);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    writeCookie(COOKIE_NAME, '1', COOKIE_MAX_AGE);
    setVisible(false);
  };

  return (
    <div className="relative z-[60] h-9 bg-gradient-to-r from-emerald-bio/80 via-cyan-bio/70 to-emerald-bio/80 text-white">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-center gap-3 px-6 text-xs md:text-sm">
        <span className="truncate">
          {isAuthenticated ? (
            <>
              <span aria-hidden>🚀</span>{' '}
              <span className="font-medium">{t('labelOffer')}</span>{' '}
              {t('authedText')}
            </>
          ) : (
            <>
              <span aria-hidden>🚀</span>{' '}
              <span className="font-medium">{t('labelOffer')}</span>{' '}
              {t('anonText')}{' '}
              <Link
                href="/pricing"
                className="underline decoration-white/60 underline-offset-2 hover:decoration-white"
              >
                {t('createAccountLink')}
              </Link>
            </>
          )}
        </span>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t('close')}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
        >
          <svg
            className="h-3 w-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
