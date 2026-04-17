import type { Metadata } from 'next';
import PricingClient from './PricingClient';

export const metadata: Metadata = {
  title: 'Tarifs',
  description:
    "Offre de lancement SPORE : tous les briefs de recherche sont gratuits. Hypothèse, protocole, panel de review, références vérifiées. Inscrivez-vous pour accéder au service.",
  alternates: { canonical: '/pricing' },
};

export default function PricingPage() {
  return <PricingClient />;
}
