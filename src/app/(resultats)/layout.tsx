'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ProfileBar from '@/components/ProfileBar';
import { useProfile } from '@/components/ProfileProvider';
import ResultTabs from '@/components/ResultTabs';
import { FS } from '@/theme/theme';

/** Toutes les pages de résultats supposent un profil enregistré : sinon, retour à la saisie. */
export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  const { status, metrics } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (status === 'empty') router.replace('/profil');
  }, [status, router]);

  if (status !== 'ready' || !metrics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
        <CircularProgress aria-label="Chargement de vos résultats" />
      </Box>
    );
  }

  return (
    <>
      <ResultTabs />
      <Box
        component="main"
        sx={{ width: '100%', maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3 }, pt: 3, pb: 8 }}
      >
        <ProfileBar />
        {children}
        <Typography
          sx={(t) => ({
            fontSize: FS.caption,
            lineHeight: 1.6,
            color: t.tokens.faint,
            mt: 4,
            textWrap: 'pretty',
          })}
        >
          Ces chiffres sont une estimation, pas un avis médical. La dépense réelle varie d’environ
          10 % d’une personne à l’autre. En cas de doute, parlez-en à un médecin ou à un
          diététicien.
        </Typography>
      </Box>
    </>
  );
}
