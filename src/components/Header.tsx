'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/', label: 'Accueil' },
  { href: '/discoveries', label: 'Découvertes' },
  { href: '/how-it-works', label: 'Comment ça marche' },
  { href: '/stats', label: 'Stats' },
];

export default function Header() {
  const pathname = usePathname();

  return (
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

        <ul className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => {
            const isActive =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`relative text-sm transition-colors ${
                    isActive
                      ? 'text-mist-100'
                      : 'text-mist-400 hover:text-mist-100'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-5 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-bio to-transparent" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <Link
          href="/discoveries"
          className="md:hidden rounded-full border border-emerald-bio/30 px-3 py-1 text-xs text-emerald-glow"
        >
          Découvertes
        </Link>
      </nav>
    </header>
  );
}
