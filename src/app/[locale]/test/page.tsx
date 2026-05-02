import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';

/**
 * S7.1 i18n smoke-test page. Renders the ``test.hello`` message and two
 * locale-switch links. Lives at ``/fr/test`` and ``/en/test``.
 *
 * Server component — uses ``getTranslations`` to satisfy
 * ``setRequestLocale`` semantics for static rendering. The legacy root
 * layout still wraps this output (Header / Footer / fonts), which is
 * acceptable for a smoke test — full chrome localisation lands in S7.2.
 */
export default async function TestPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('test');

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: 720, margin: '0 auto' }}>
      <p style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#888' }}>
        S7.1 i18n smoke test · locale = {locale}
      </p>
      <h1 style={{ fontSize: '28px', margin: '12px 0 24px 0' }}>{t('hello')}</h1>
      <p>
        <Link href="/test" locale="fr" style={{ color: '#10B981' }}>
          FR version
        </Link>
        {' | '}
        <Link href="/test" locale="en" style={{ color: '#10B981' }}>
          EN version
        </Link>
      </p>
    </main>
  );
}
