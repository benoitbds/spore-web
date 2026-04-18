import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Comment SPORE protège vos données personnelles.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-16 text-mist-200">
      <h1 className="mb-2 font-display text-4xl text-mist-100">
        Politique de confidentialité
      </h1>
      <p className="mb-10 text-sm text-mist-500">
        Dernière mise à jour : avril 2026
      </p>

      <Section title="Responsable du traitement">
        <p>SPORE Research (structure en cours de création)</p>
        <p>
          Email :{' '}
          <a
            href="mailto:benoit@spore-research.com"
            className="text-emerald-glow hover:text-emerald-bio"
          >
            benoit@spore-research.com
          </a>
        </p>
      </Section>

      <Section title="Données collectées">
        <ul className="list-disc space-y-3 pl-5">
          <li>
            <span className="font-medium text-mist-100">
              Adresse email
            </span>{' '}
            : collectée lors de la création de compte via magic link.
            Finalité : authentification, envoi des briefs custom,
            notifications. Base légale : consentement (article 6.1.a du
            RGPD).
          </li>
          <li>
            <span className="font-medium text-mist-100">
              Données de navigation
            </span>{' '}
            : aucun cookie de tracking, aucun analytics tiers. Le site
            utilise uniquement un cookie technique (<code>spore_token</code>)
            pour maintenir la session.
          </li>
        </ul>
      </Section>

      <Section title="Données NON collectées">
        <ul className="list-disc space-y-3 pl-5">
          <li>
            Aucune donnée de paiement n&apos;est collectée par SPORE. Le
            service est actuellement gratuit. Lorsque le service payant
            sera activé, les paiements seront traités par Stripe, Inc. qui
            agit comme sous-traitant. SPORE ne stocke ni numéro de carte,
            ni données bancaires.
          </li>
          <li>Aucune donnée de géolocalisation.</li>
          <li>Aucun tracking publicitaire.</li>
        </ul>
      </Section>

      <Section title="Durée de conservation">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Email et compte : conservés tant que le compte est actif.
            Suppression sur demande.
          </li>
          <li>Cookies techniques : 30 jours.</li>
        </ul>
      </Section>

      <Section title="Vos droits (RGPD)">
        <p>
          Conformément au Règlement Général sur la Protection des Données,
          vous disposez des droits suivants :
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-medium text-mist-100">Droit d&apos;accès</span>{' '}
            : obtenir une copie de vos données.
          </li>
          <li>
            <span className="font-medium text-mist-100">
              Droit de rectification
            </span>{' '}
            : corriger vos données.
          </li>
          <li>
            <span className="font-medium text-mist-100">
              Droit à l&apos;effacement
            </span>{' '}
            : supprimer votre compte et vos données.
          </li>
          <li>
            <span className="font-medium text-mist-100">
              Droit à la portabilité
            </span>{' '}
            : recevoir vos données dans un format lisible.
          </li>
          <li>
            <span className="font-medium text-mist-100">
              Droit d&apos;opposition
            </span>{' '}
            : vous opposer au traitement de vos données.
          </li>
        </ul>
        <p>
          Pour exercer vos droits :{' '}
          <a
            href="mailto:benoit@spore-research.com"
            className="text-emerald-glow hover:text-emerald-bio"
          >
            benoit@spore-research.com
          </a>
          . Délai de réponse : 30 jours maximum.
        </p>
      </Section>

      <Section title="Transferts hors UE">
        <p>
          Les emails sont envoyés via Resend (serveurs US). Ce transfert
          est encadré par les clauses contractuelles types de la Commission
          européenne.
        </p>
      </Section>

      <Section title="Autorité de contrôle">
        <p>
          Vous pouvez adresser une réclamation à la CNIL :{' '}
          <a
            href="https://www.cnil.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-glow hover:text-emerald-bio"
          >
            www.cnil.fr
          </a>{' '}
          — 3 Place de Fontenoy, 75007 Paris.
        </p>
      </Section>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10 space-y-3 text-sm leading-relaxed">
      <h2 className="font-display text-xl text-mist-100">{title}</h2>
      <div className="space-y-3 text-mist-300">{children}</div>
    </section>
  );
}
