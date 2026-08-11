'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import ProfileBar from '@/components/ProfileBar';
import { useProfile } from '@/components/ProfileProvider';
import ResultTabs from '@/components/ResultTabs';
import { Spinner } from '@/components/ui/primitives';

/** Toutes les pages de résultats supposent un profil enregistré : sinon, retour à la saisie. */
export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  const { status, metrics } = useProfile();
  const router = useRouter();

  useEffect(() => {
    if (status === 'empty') router.replace('/profil');
  }, [status, router]);

  if (status !== 'ready' || !metrics) {
    return (
      <div className="flex justify-center pt-16">
        <Spinner label="Chargement de vos résultats" />
      </div>
    );
  }

  return (
    <>
      <ResultTabs />
      <main className="mx-auto w-full max-w-[1200px] px-4 pt-6 pb-16 sm:px-6">
        <ProfileBar />
        {children}
        <p className="mt-8 text-caption leading-[1.6] text-faint text-pretty">
          Ces chiffres sont une estimation, pas un avis médical. La dépense réelle varie d’environ
          10 % d’une personne à l’autre. En cas de doute, parlez-en à un médecin ou à un
          diététicien.
        </p>
      </main>
    </>
  );
}
