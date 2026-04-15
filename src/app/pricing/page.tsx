import type { Metadata } from 'next';
import PricingClient from './PricingClient';

export const metadata: Metadata = {
  title: 'Tarifs',
  description:
    "Premier brief offert. Brief unitaire à 9 €, pack de 5 à 29 €, collision sur mesure à 25 €. Tous les briefs incluent hypothèse formelle, protocole expérimental, panel de review et base de preuves.",
  alternates: { canonical: '/pricing' },
};

export default function PricingPage() {
  return <PricingClient />;
}
