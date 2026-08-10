'use client';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useProfile } from '@/components/ProfileProvider';
import ProfilForm from '@/components/screens/ProfilForm';
import { formFromProfile } from '@/lib/state';

export default function ProfilPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProfilPageContent />
    </Suspense>
  );
}

function Loading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
      <CircularProgress aria-label="Chargement" />
    </Box>
  );
}

function ProfilPageContent() {
  const { status, profile, staleWeight, save, reset } = useProfile();
  const router = useRouter();
  const searchParams = useSearchParams();

  if (status === 'loading') return <Loading />;

  // Un profil existant s'édite d'un bloc ; une première visite se fait question par question.
  const mode = searchParams.get('mode') === 'form' || profile ? 'form' : 'wizard';
  const initial = formFromProfile(profile, staleWeight, mode);

  return (
    <Box
      component="main"
      sx={{ width: '100%', maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3 }, pt: 4, pb: 8 }}
    >
      <ProfilForm
        // Réinitialise le formulaire si le profil enregistré change sous ses pieds.
        key={profile?.updatedAt ?? 'nouveau'}
        initial={initial}
        hasProfile={Boolean(profile)}
        onSubmit={(input) => {
          save(input);
          router.push('/metabolisme');
        }}
        onCancel={() => router.push(profile ? '/metabolisme' : '/')}
        onReset={() => {
          reset();
          router.push('/');
        }}
      />
    </Box>
  );
}
