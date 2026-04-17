'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import AuthWidget from '@/components/AuthWidget';

const NAV = [
  { href: '/', label: 'Accueil' },
  { href: '/discoveries', label: 'Découvertes' },
  { href: '/how-it-works', label: 'Comment ça marche' },
  // { href: '/pricing', label: 'Tarifs' },  // hidden during launch
  { href: '/stats', label: 'Stats' },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Mount flag so the portal only renders on the client (avoids SSR document ref).
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Close the drawer on route change.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock scroll + react to Escape while the drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const drawer = (
    <div
      id="mobile-nav"
      aria-hidden={!mobileOpen}
      className={`fixed inset-0 z-[100] md:hidden ${
        mobileOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      {/* backdrop */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`absolute inset-0 bg-ink-900/85 backdrop-blur-sm transition-opacity duration-300 ${
          mobileOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* panel — slides from right, fully opaque */}
      <div
        className={`absolute right-0 top-0 flex h-full w-[80%] max-w-sm flex-col border-l border-ink-500/60 bg-ink-900 shadow-2xl transition-transform duration-300 ease-out ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ backgroundColor: '#07070a' }}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-ink-500/50 px-6 py-4">
          <span className="font-display text-lg text-mist-100">Menu</span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Fermer le menu"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink-500 text-mist-300 hover:text-mist-100"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <ul className="flex flex-col gap-1 px-4 py-6">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-base transition-colors ${
                  isActive(item.href)
                    ? 'bg-emerald-bio/10 text-emerald-glow'
                    : 'text-mist-200 hover:bg-ink-800/60 hover:text-mist-100'
                }`}
              >
                <span>{item.label}</span>
                <span className="text-mist-500">→</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-auto px-4 pb-6">
          <AuthWidget orientation="vertical" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-ink-500/50 bg-ink-900/70 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="group flex items-center gap-2">
            <span className="relative inline-flex h-8 w-8 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-emerald-bio/20 blur-md transition-all group-hover:bg-emerald-bio/40" />
              <span className="relative text-xl">🧬</span>
            </span>
            <span className="font-display text-xl tracking-tight text-mist-100">
              SPORE
            </span>
          </Link>

          {/* Desktop nav */}
          <ul className="hidden items-center gap-8 md:flex">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`relative text-sm transition-colors ${
                    isActive(item.href)
                      ? 'text-mist-100'
                      : 'text-mist-400 hover:text-mist-100'
                  }`}
                >
                  {item.label}
                  {isActive(item.href) && (
                    <span className="absolute -bottom-5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-bio to-transparent" />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop auth slot */}
          <div className="hidden md:block">
            <AuthWidget />
          </div>

          {/* Mobile trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink-500 bg-ink-800/50 text-mist-200 hover:text-mist-100"
          >
            <IconHamburger className="h-5 w-5" />
          </button>
        </nav>
      </header>

      {/* Drawer rendered into document.body so it escapes the header's
          `backdrop-blur-xl` containing block (which was clipping the
          fixed-positioned drawer to the ~64px header height). */}
      {mounted ? createPortal(drawer, document.body) : null}
    </>
  );
}

function IconHamburger({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

function IconClose({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}
