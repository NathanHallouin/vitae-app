import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import AppHeader from '@/components/AppHeader';
import BottomNav from '@/components/BottomNav';
import BottomNavSpacer from '@/components/BottomNavSpacer';
import ProfileProvider from '@/components/ProfileProvider';
import ThemeRegistry from '@/theme/ThemeRegistry';

/** Titres et grands chiffres. */
const display = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
  // Axe optique adouci : la Fraunces par défaut est très contrastée sur les grands corps.
  axes: ['SOFT'],
});

/** Interface et textes courants. */
const sans = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Métabolisme de base : combien de calories votre corps dépense',
  description:
    'Calculez ce que votre corps dépense au repos et dans la journée, votre IMC, et combien manger selon votre objectif. Expliqué simplement, sans compte à créer.',
};

export const viewport: Viewport = {
  themeColor: '#2e7d54',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${sans.variable}`}>
      <body>
        <ThemeRegistry>
          <ProfileProvider>
            <AppHeader />
            {children}
            {/* Dégage la hauteur de la barre du bas : sinon elle recouvrirait la fin de page. */}
            <BottomNavSpacer />
            <BottomNav />
          </ProfileProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
