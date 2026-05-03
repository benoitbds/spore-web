'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import EmailGate from '@/components/EmailGate';

/**
 * Header auth slot. Renders:
 *   - skeleton dot while rehydrating
 *   - sign-in button (opens inline EmailGate dropdown) if anonymous
 *   - email + credits badge + logout menu if signed in
 *
 * Desktop-first; mobile surface is handled by the drawer separately.
 */
export default function AuthWidget({
  orientation = 'horizontal',
}: {
  orientation?: 'horizontal' | 'vertical';
}) {
  const t = useTranslations('auth');
  const tNav = useTranslations('navigation');
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [showGate, setShowGate] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  // Click-outside to close (both dropdown and gate)
  useEffect(() => {
    if (!open && !showGate) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowGate(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open, showGate]);

  if (isLoading) {
    return (
      <span
        aria-hidden="true"
        className="inline-block h-2 w-2 animate-pulse rounded-full bg-mist-500"
      />
    );
  }

  if (!isAuthenticated) {
    if (orientation === 'vertical') {
      return (
        <div className="border-t border-ink-500/50 px-4 pt-4">
          {showGate ? (
            <EmailGate
              headline={t('connectionHeadline')}
              subtext={t('connectionSubtext')}
              cta={t('connectionCta')}
              onSent={() => setShowGate(false)}
            />
          ) : (
            <button
              onClick={() => setShowGate(true)}
              className="w-full rounded-xl border border-emerald-bio bg-emerald-bio/10 px-4 py-3 text-sm font-semibold text-emerald-glow hover:bg-emerald-bio/20"
            >
              {t('signIn')}
            </button>
          )}
        </div>
      );
    }

    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setShowGate((s) => !s)}
          className="text-sm text-mist-400 hover:text-emerald-glow"
        >
          {t('signIn')}
        </button>
        {showGate && (
          <div className="absolute right-0 top-full z-50 mt-3 w-80">
            <EmailGate
              headline={t('connectionHeadline')}
              subtext={t('connectionSubtext')}
              cta={t('connectionCta')}
              onSent={() => setShowGate(false)}
            />
          </div>
        )}
      </div>
    );
  }

  const email = user?.email ?? '';
  const emailShort = email.length > 22 ? `${email.slice(0, 20)}…` : email;
  // Launch mode: everything is free
  const creditLabel = t('freeAccess');

  if (orientation === 'vertical') {
    return (
      <div className="space-y-1 border-t border-ink-500/50 pt-4">
        <div className="px-4 text-xs text-mist-500">{t('connected')}</div>
        <div className="px-4 text-sm text-mist-200">{emailShort}</div>
        <div className="px-4 text-xs text-emerald-glow">
          {creditLabel}
        </div>
        <Link
          href="/account"
          className="mt-2 block rounded-xl px-4 py-2 text-sm text-mist-200 hover:bg-ink-800/60"
        >
          {t('myAccount')}
        </Link>
        <button
          onClick={logout}
          className="w-full rounded-xl px-4 py-2 text-left text-sm text-mist-400 hover:bg-ink-800/60 hover:text-red-400"
        >
          {t('signOut')}
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full border border-ink-500 bg-ink-800/60 px-3 py-1.5 text-xs text-mist-200 hover:text-mist-100"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="hidden md:inline">{emailShort}</span>
        <span className="rounded-full bg-emerald-bio/15 px-2 py-0.5 font-mono text-emerald-glow">
          ✨
        </span>
        <span className="text-mist-500">▾</span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-ink-500 bg-ink-800 shadow-2xl"
        >
          <div className="border-b border-ink-500/50 px-4 py-3">
            <div className="text-xs text-mist-500">{t('connected')}</div>
            <div className="text-sm text-mist-100">{emailShort}</div>
            <div className="mt-1 text-xs text-emerald-glow">
              {creditLabel}
            </div>
          </div>
          <Link
            href="/account"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-mist-200 hover:bg-ink-700/60"
          >
            {t('myAccount')}
          </Link>
          {/* pricing link hidden during launch */}
          <Link
            href="/custom"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-mist-200 hover:bg-ink-700/60"
          >
            {tNav('custom')}
          </Link>
          <button
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className="block w-full px-4 py-2 text-left text-sm text-mist-400 hover:bg-ink-700/60 hover:text-red-400"
          >
            {t('signOut')}
          </button>
        </div>
      )}
    </div>
  );
}
