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
import type { Sauvegarde } from '@vitae/core/sauvegarde';
import type { StaleWeight } from '@vitae/core/state';
import {
  clearProfile,
  loadProfile,
  loadSuivi,
  type ProfileInput,
  type StoredProfile,
  saveProfile,
  saveSuivi,
  setProfileStore,
} from '@vitae/core/storage';
import {
  ajouterPesee as ajouter,
  construireSuivi,
  type Pesee,
  retirerPesee,
  type Suivi,
} from '@vitae/core/suivi';
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

interface Donnees {
  profile: StoredProfile | null;
  staleWeight: StaleWeight | null;
  pesees: Pesee[];
}

/** Tout ce qui est persisté, lu d'un bloc pour n'ouvrir le stockage qu'une fois. */
function lire(): Donnees {
  const stored = loadProfile();
  const pesees = loadSuivi();
  if (!stored) return { profile: null, staleWeight: null, pesees };
  return {
    profile: stored,
    staleWeight: isWeightStale(stored.updatedAt)
      ? { previous: stored.poids, updatedAt: stored.updatedAt }
      : null,
    pesees,
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
  /** les pesées et ce qu'elles disent, recalculé à chaque changement */
  suivi: Suivi;
  ajouterPesee: (pesee: Pesee) => void;
  supprimerPesee: (date: string) => void;
  /** remplace le profil et les pesées par ceux d'un fichier de sauvegarde */
  restaurer: (sauvegarde: Sauvegarde) => void;
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
  const [{ profile, staleWeight, pesees }, setDonnees] = useState<Donnees>(() =>
    LECTURE_IMMEDIATE ? lire() : { profile: null, staleWeight: null, pesees: [] },
  );
  const [targetKey, setTargetKey] = useState<string | null>(null);

  const setProfile = useCallback((next: StoredProfile | null) => {
    setDonnees((avant) => ({ ...avant, profile: next, staleWeight: null }));
  }, []);

  useEffect(() => {
    // Sur le web seulement : rattrape la lecture qui ne pouvait pas avoir lieu au premier rendu.
    if (LECTURE_IMMEDIATE) return;
    const lu = lire();
    // Les pesées comptent même sans profil : quelqu'un peut avoir tout effacé et gardé sa courbe.
    if (lu.profile || lu.pesees.length) setDonnees(lu);
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

  /**
   * Écrit les pesées, puis relit ce qui a été écrit.
   *
   * Relire plutôt que garder ce qu'on vient de poser : c'est le stockage qui fait autorité sur le
   * tri, le dédoublonnage et les bornes, et l'état de l'écran doit être celui qui survivra au
   * prochain démarrage — pas une version optimiste de celui-ci.
   */
  const enregistrerPesees = useCallback((prochaines: Pesee[]) => {
    saveSuivi(prochaines);
    setDonnees((avant) => ({ ...avant, pesees: loadSuivi() }));
  }, []);

  const ajouterPesee = useCallback(
    (pesee: Pesee) => enregistrerPesees(ajouter(pesees, pesee)),
    [pesees, enregistrerPesees],
  );

  const supprimerPesee = useCallback(
    (date: string) => enregistrerPesees(retirerPesee(pesees, date)),
    [pesees, enregistrerPesees],
  );

  const restaurer = useCallback((sauvegarde: Sauvegarde) => {
    if (sauvegarde.profil) {
      const { v: _v, updatedAt: _updatedAt, ...champs } = sauvegarde.profil;
      saveProfile(champs);
    }
    saveSuivi(sauvegarde.pesees);
    setDonnees(lire());
    setTargetKey(null);
  }, []);

  /**
   * « Tout effacer » efface aussi les pesées.
   *
   * C'est ce que le bouton promet, et une donnée de santé oubliée dans un coin après un effacement
   * demandé serait la pire des surprises. La sauvegarde JSON existe pour qui veut les garder.
   */
  const reset = useCallback(() => {
    clearProfile();
    saveSuivi([]);
    setDonnees({ profile: null, staleWeight: null, pesees: [] });
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

  // Le poids du profil, et non la dernière pesée : c'est sur lui que le plan en cours a été
  // calculé, donc lui qui dit si ce plan est encore d'actualité.
  const suivi = useMemo(
    () => construireSuivi(pesees, profile ? Number.parseFloat(profile.poids) : null),
    [pesees, profile],
  );

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
      suivi,
      ajouterPesee,
      supprimerPesee,
      restaurer,
      reset,
    }),
    [
      profile,
      metrics,
      age,
      staleWeight,
      targetKey,
      save,
      setGoal,
      setExcluded,
      suivi,
      ajouterPesee,
      supprimerPesee,
      restaurer,
      reset,
    ],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
