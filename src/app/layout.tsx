import type { Metadata, Viewport } from 'next';
import { Roboto } from 'next/font/google';
import ThemeRegistry from '@/theme/ThemeRegistry';

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: 'Métabolisme de base — calculateur de besoins caloriques',
  description:
    "Calculez votre métabolisme de base et votre dépense énergétique totale (Mifflin-St Jeor), votre IMC et la fourchette d'apport adaptée à votre objectif.",
};

export const viewport: Viewport = {
  themeColor: '#1976d2',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={roboto.variable}>
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
