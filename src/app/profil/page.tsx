'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useProfile } from '@/components/ProfileProvider';
import ProfilForm from '@/components/screens/ProfilForm';
import { Spinner } from '@/components/ui/primitives';
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
    <div className="flex justify-center pt-16">
      <Spinner />
    </div>
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
    <main className="mx-auto w-full max-w-[1200px] px-4 pt-8 pb-16 sm:px-6">
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
    </main>
  );
}
