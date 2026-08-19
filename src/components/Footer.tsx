import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function Footer() {
  const t = useTranslations('footer');
  const tCommon = useTranslations('common');
  return (
    <footer className="border-t border-ink-500/50 bg-ink-800/30 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <Link
          href="/anthology"
          className="group mb-10 flex items-center justify-between gap-4 rounded-2xl border border-emerald-bio/30 bg-emerald-bio/5 px-5 py-4 text-sm transition-colors hover:border-emerald-bio/60 hover:bg-emerald-bio/10"
        >
          <span className="flex items-center gap-3">
            <span aria-hidden className="text-xl">📕</span>
            <span className="text-mist-200">{t('anthologyBanner')}</span>
          </span>
          <span className="font-mono text-xs text-emerald-glow transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>

        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xl">🧬</span>
              <span className="font-display text-lg text-mist-100">{tCommon('siteTitle')}</span>
            </div>
            <p className="text-sm text-mist-400 leading-relaxed">
              {tCommon('siteBlurbShort')}
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-mist-500">
              {t('explore')}
            </h4>
            <ul className="space-y-2 text-sm text-mist-400">
              <li>
                <Link href="/briefs" className="hover:text-emerald-glow transition-colors">
                  {t('explore_briefs')}
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-emerald-glow transition-colors">
                  {t('explore_howItWorks')}
                </Link>
              </li>
              <li>
                <Link href="/stats" className="hover:text-emerald-glow transition-colors">
                  {t('explore_stats')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-mist-500">
              {t('aboutSection')}
            </h4>
            <ul className="space-y-2 text-sm text-mist-400">
              <li>
                <span className="text-mist-300">{t('builtBy')}</span>{' '}
                <span className="font-medium text-mist-100">{t('builtByName')}</span>
              </li>
              <li>
                <span className="text-mist-300">{t('poweredBy')}</span>{' '}
                <span className="font-medium text-emerald-glow">{t('poweredByStack')}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-ink-500/50 pt-6 text-xs text-mist-500 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} {t('copyright')}</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-1">
            <li>
              <Link href="/about" className="hover:text-emerald-glow transition-colors">
                {t('links_about')}
              </Link>
            </li>
            <li>
              <Link href="/methodology" className="hover:text-emerald-glow transition-colors">
                {t('links_methodology')}
              </Link>
            </li>
            <li>
              <Link href="/legal" className="hover:text-emerald-glow transition-colors">
                {t('links_legal')}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-emerald-glow transition-colors">
                {t('links_privacy')}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
