import type { Metadata } from 'next';
import VerifyPage from './VerifyClient';

export const metadata: Metadata = {
  title: 'Vérification du lien',
  description: 'Activation de votre accès SPORE en cours.',
  robots: { index: false, follow: false },
};

export default VerifyPage;
