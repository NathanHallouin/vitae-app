/**
 * Le profil, point de passage unique vers les données persistées.
 *
 * Le moment de la lecture dépend de la plateforme, et c'est la seule concession de tout le
 * portage. En natif, MMKV lit de façon synchrone : l'état initial contient déjà le profil, et
 * l'application s'ouvre sur les chiffres. Sur le web, les pages sont pré-rendues à la compilation,
 * où `localStorage` n'existe pas ; lire au premier rendu produirait un balisage différent de celui
 * qui a été livré, et React refuserait l'hydratation. La lecture y est donc reportée d'un rendu.
 *
 * `LECTURE_IMMEDIATE` porte cette différence, et elle est décidée par le fichier que Metro choisit
 * selon la plateforme — pas par un test à l'exécution.
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
  type StoredProfile,
  saveProfile,
  setProfileStore,
} from '@vitae/core/storage';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { LECTURE_IMMEDIATE, nativeProfileStore } from '@/lib/store';

// Avant tout rendu : `loadProfile()` dans l'initialisation d'état ci-dessous en dépend.
setProfileStore(nativeProfileStore);

/** `empty` tant qu'aucun profil n'est enregistré ; il n'y a pas d'état intermédiaire. */
type Status = 'empty' | 'ready';

/** Le profil et la fraîcheur de son poids, lus d'un bloc pour n'ouvrir le stockage qu'une fois. */
function lire(): { profile: StoredProfile | null; staleWeight: StaleWeight | null } {
  const stored = loadProfile();
  if (!stored) return { profile: null, staleWeight: null };
  return {
    profile: stored,
    staleWeight: isWeightStale(stored.updatedAt)
      ? { previous: stored.poids, updatedAt: stored.updatedAt }
      : null,
  };
}

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
  // Le profil et la fraîcheur du poids vont ensemble : un seul état, donc une seule lecture au
  // montage, et pas de rendu intermédiaire où l'un serait à jour et l'autre non.
  const [{ profile, staleWeight }, setDonnees] = useState(() =>
    LECTURE_IMMEDIATE ? lire() : { profile: null, staleWeight: null },
  );
  const [targetKey, setTargetKey] = useState<string | null>(null);

  const setProfile = useCallback((next: StoredProfile | null) => {
    setDonnees({ profile: next, staleWeight: null });
  }, []);

  useEffect(() => {
    // Sur le web seulement : rattrape la lecture qui ne pouvait pas avoir lieu au premier rendu.
    if (LECTURE_IMMEDIATE) return;
    const lu = lire();
    if (lu.profile) setDonnees(lu);
  }, []);

  const save = useCallback(
    (input: ProfileInput) => {
      saveProfile(input);
      setProfile(loadProfile());
      setTargetKey(null);
    },
    [setProfile],
  );

  const setGoal = useCallback(
    (goal: GoalKey) => {
      if (!profile || profile.goal === goal) return;
      const { v: _v, updatedAt: _updatedAt, ...rest } = profile;
      saveProfile({ ...rest, goal });
      setProfile(loadProfile());
      // Changer d'objectif invalide le poids cible choisi à la main.
      setTargetKey(null);
    },
    [profile, setProfile],
  );

  const setExcluded = useCallback(
    (excluded: Exclusion[]) => {
      if (!profile) return;
      const { v: _v, updatedAt: _updatedAt, ...rest } = profile;
      saveProfile({ ...rest, excluded });
      setProfile(loadProfile());
    },
    [profile, setProfile],
  );

  const reset = useCallback(() => {
    clearProfile();
    setProfile(null);
    setTargetKey(null);
  }, [setProfile]);

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
