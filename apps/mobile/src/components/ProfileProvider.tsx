/**
 * Le profil, point de passage unique vers les données persistées.
 *
 * Une seule différence avec la version web, mais elle est structurante : il n'y a pas d'état
 * `loading`. Le support est branché à l'import du module et MMKV lit de façon synchrone, donc le
 * profil est disponible dès l'initialisation de l'état. Le web, lui, doit attendre un effet parce
 * que `localStorage` n'existe pas pendant le rendu serveur.
 *
 * Conséquence visible : l'application s'ouvre sur les chiffres, jamais sur un écran vide qui se
 * remplit après coup.
 */

import { computeMetrics, type Metrics } from '@vitae/core/calc';
import type { GoalKey } from '@vitae/core/constants';
import { ageFrom, isWeightStale } from '@vitae/core/date';
import type { Exclusion } from '@vitae/core/recipes';
import type { StaleWeight } from '@vitae/core/state';
import {
  clearProfile,
  loadProfile,
  type ProfileInput,
  setProfileStore,
  type StoredProfile,
  saveProfile,
} from '@vitae/core/storage';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { nativeProfileStore } from '@/lib/store';

// Avant tout rendu : `loadProfile()` dans l'initialisation d'état ci-dessous en dépend.
setProfileStore(nativeProfileStore);

/** `empty` tant qu'aucun profil n'est enregistré ; il n'y a pas d'état intermédiaire. */
type Status = 'empty' | 'ready';

interface ProfileValue {
  status: Status;
  profile: StoredProfile | null;
  metrics: Metrics | null;
  /** âge recalculé depuis la date de naissance */
  age: number | null;
  /** poids enregistré datant de plus d'une semaine */
  staleWeight: StaleWeight | null;
  /** poids cible choisi à la main sur l'écran « Mon poids » ; `null` = automatique */
  targetKey: string | null;
  setTargetKey: (key: string) => void;
  save: (input: ProfileInput) => void;
  setGoal: (goal: GoalKey) => void;
  /** filtres d'ingrédients, réglés sur l'écran « Ce que je mange » */
  setExcluded: (excluded: Exclusion[]) => void;
  reset: () => void;
}

const ProfileContext = createContext<ProfileValue | null>(null);

export function useProfile(): ProfileValue {
  const value = useContext(ProfileContext);
  if (!value) throw new Error('useProfile doit être utilisé dans <ProfileProvider>');
  return value;
}

export default function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<StoredProfile | null>(() => loadProfile());
  const [staleWeight, setStaleWeight] = useState<StaleWeight | null>(() => {
    const stored = loadProfile();
    if (!stored || !isWeightStale(stored.updatedAt)) return null;
    return { previous: stored.poids, updatedAt: stored.updatedAt };
  });
  const [targetKey, setTargetKey] = useState<string | null>(null);

  const save = useCallback((input: ProfileInput) => {
    saveProfile(input);
    setProfile(loadProfile());
    setStaleWeight(null);
    setTargetKey(null);
  }, []);

  const setGoal = useCallback(
    (goal: GoalKey) => {
      if (!profile || profile.goal === goal) return;
      const { v: _v, updatedAt: _updatedAt, ...rest } = profile;
      saveProfile({ ...rest, goal });
      setProfile(loadProfile());
      // Changer d'objectif invalide le poids cible choisi à la main.
      setTargetKey(null);
    },
    [profile],
  );

  const setExcluded = useCallback(
    (excluded: Exclusion[]) => {
      if (!profile) return;
      const { v: _v, updatedAt: _updatedAt, ...rest } = profile;
      saveProfile({ ...rest, excluded });
      setProfile(loadProfile());
    },
    [profile],
  );

  const reset = useCallback(() => {
    clearProfile();
    setProfile(null);
    setStaleWeight(null);
    setTargetKey(null);
  }, []);

  const age = profile ? ageFrom(profile.naissance) : null;

  const metrics = useMemo(() => {
    if (!profile || age === null) return null;
    return computeMetrics({
      sexe: profile.sexe,
      age: String(age),
      taille: profile.taille,
      poids: profile.poids,
      daily: profile.daily,
      sessions: profile.sessions,
      goal: profile.goal,
    });
  }, [profile, age]);

  const value = useMemo<ProfileValue>(
    () => ({
      status: profile ? 'ready' : 'empty',
      profile,
      metrics,
      age,
      staleWeight,
      targetKey,
      setTargetKey,
      save,
      setGoal,
      setExcluded,
      reset,
    }),
    [profile, metrics, age, staleWeight, targetKey, save, setGoal, setExcluded, reset],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
