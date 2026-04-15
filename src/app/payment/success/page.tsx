import type { Metadata } from 'next';
import SuccessClient from './SuccessClient';

export const metadata: Metadata = {
  title: 'Paiement confirmé',
  robots: { index: false, follow: false },
};

export default function SuccessPage() {
  return <SuccessClient />;
}
