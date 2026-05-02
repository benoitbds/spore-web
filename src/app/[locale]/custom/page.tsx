import type { Metadata } from 'next';
import CustomClient from './CustomClient';

export const metadata: Metadata = {
  title: 'Collision sur mesure',
  description:
    "Choisissez deux domaines scientifiques, SPORE génère une hypothèse inédite à leur intersection. Offre de lancement : votre première collision est gratuite.",
  alternates: { canonical: '/custom' },
};

export default function CustomPage() {
  return <CustomClient />;
}
