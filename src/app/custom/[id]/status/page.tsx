import type { Metadata } from 'next';
import StatusClient from './StatusClient';

export const metadata: Metadata = {
  title: 'Suivi de votre collision',
  robots: { index: false, follow: false },
};

export default function StatusPage({ params }: { params: { id: string } }) {
  return <StatusClient requestId={params.id} />;
}
