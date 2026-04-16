import type { Metadata } from 'next';
import AccountClient from './AccountClient';

export const metadata: Metadata = {
  title: 'Mon compte',
  description: 'Crédits, briefs débloqués, collisions sur mesure et historique d\'achats.',
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountClient />;
}
