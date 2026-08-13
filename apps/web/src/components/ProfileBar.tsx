'use client';

import Link from 'next/link';
import { activityLabel } from '@vitae/core/constants';
import { useProfile } from './ProfileProvider';

/**
 * Rappel discret de ce sur quoi les chiffres sont calculés, présent sur toutes les pages.
 *
 * Deux versions du même rappel. Sur mobile, la liste complète prenait quatre lignes en tête de
 * chaque page, avant le premier chiffre : on n'y garde que ce qui change souvent, à commencer par
 * le poids, puisque c'est lui qu'on vient corriger. Le détail reste accessible d'une touche.
 */
export default function ProfileBar() {
  const { profile, age, metrics } = useProfile();
  if (!profile || !metrics) return null;

  const identite = [
    profile.sexe === 'homme' ? 'Homme' : 'Femme',
    age === null ? null : `${age} ans`,
  ].filter(Boolean);

  const court = [`${profile.poids} kg`, ...identite].join(' · ');
  const complet = [
    ...identite,
    `${profile.taille} cm`,
    `${profile.poids} kg`,
    activityLabel(profile.daily, profile.sessions),
    metrics.goal.label.toLowerCase(),
  ].join(' · ');

  return (
    <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
      <p className="min-w-0 flex-1 text-small text-muted2">
        <span className="hidden nav:inline">Calculé pour : {complet}</span>
        <span className="inline nav:hidden">Calculé pour {court}</span>
      </p>
      <Link
        href="/profil"
        className="flex-none rounded-[var(--radius-control)] px-2 py-1 text-caption font-semibold text-primary-ink hover:bg-primary-tint"
      >
        Modifier
      </Link>
    </div>
  );
}
