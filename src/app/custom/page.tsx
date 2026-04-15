import type { Metadata } from 'next';
import CustomClient from './CustomClient';

export const metadata: Metadata = {
  title: 'Collision sur mesure',
  description:
    "Choisissez deux domaines scientifiques, SPORE génère une hypothèse disruptive, un protocole expérimental et un panel de review. Brief livré sous 24 h pour 25 €.",
  alternates: { canonical: '/custom' },
};

export default function CustomPage() {
  return <CustomClient />;
}
