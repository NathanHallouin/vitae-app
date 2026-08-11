'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { computeMetrics, type Metrics } from '@/lib/calc';
import type { GoalKey } from '@/lib/constants';
import { ageFrom, isWeightStale } from '@/lib/date';
import type { Exclusion } from '@/lib/recipes';
import type { StaleWeight } from '@/lib/state';
import {
  clearProfile,
  loadProfile,
  type ProfileInput,
  type StoredProfile,
  saveProfile,
} from '@/lib/storage';

/** `loading` couvre le rendu serveur et le premier rendu client, avant lecture du stockage. */
type Status = 'loading' | 'empty' | 'ready';

interface ProfileValue {
  status: Status;
  profile: StoredProfile | null;
  metrics: Metrics | null;
  /** âge recalculé depuis la date de naissance */
  age: number | null;
  /** poids enregistré datant de plus d'une semaine */
  staleWeight: StaleWeight | null;
  /** poids cible choisi à la main sur la page « Mon poids » ; `null` = automatique */
  targetKey: string | null;
  setTargetKey: (key: string) => void;
  save: (input: ProfileInput) => void;
  setGoal: (goal: GoalKey) => void;
  /** filtres d'ingrédients, réglés sur la page « Ce que je mange » */
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
  const [status, setStatus] = useState<Status>('loading');
  const [profile, setProfile] = useState<StoredProfile | null>(null);
  const [staleWeight, setStaleWeight] = useState<StaleWeight | null>(null);
  const [targetKey, setTargetKey] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadProfile();
    if (!stored) {
      setStatus('empty');
      return;
    }
    setProfile(stored);
    if (isWeightStale(stored.updatedAt)) {
      setStaleWeight({ previous: stored.poids, updatedAt: stored.updatedAt });
    }
    setStatus('ready');
  }, []);

  const save = useCallback((input: ProfileInput) => {
    saveProfile(input);
    setProfile(loadProfile());
    setStaleWeight(null);
    setTargetKey(null);
    setStatus('ready');
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
    setStatus('empty');
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
      status,
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
    [status, profile, metrics, age, staleWeight, targetKey, save, setGoal, setExcluded, reset],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
