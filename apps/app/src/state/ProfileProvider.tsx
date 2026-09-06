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

import { type CleCible, computeMetrics, type Metrics } from '@vitae/core/calc';
import type { GoalKey } from '@vitae/core/constants';
import { ageFrom, isWeightStale } from '@vitae/core/date';
import type { Exclusion } from '@vitae/core/recipes';
import type { Sauvegarde } from '@vitae/core/sauvegarde';
import type { StaleWeight } from '@vitae/core/state';
import {
  clearProfile,
  loadLu,
  loadProfile,
  loadSuivi,
  marquerLue,
  oublierLue,
  type ProfileInput,
  type StoredProfile,
  saveLu,
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
  /** les notions du cours déjà lues */
  lu: string[];
}

/** Tout ce qui est persisté, lu d'un bloc pour n'ouvrir le stockage qu'une fois. */
function lire(): Donnees {
  const stored = loadProfile();
  const pesees = loadSuivi();
  const lu = loadLu();
  if (!stored) return { profile: null, staleWeight: null, pesees, lu };
  return {
    profile: stored,
    staleWeight: isWeightStale(stored.updatedAt)
      ? { previous: stored.poids, updatedAt: stored.updatedAt }
      : null,
    pesees,
    lu,
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
  targetKey: CleCible | null;
  setTargetKey: (key: CleCible) => void;
  save: (input: ProfileInput) => void;
  setGoal: (goal: GoalKey) => void;
  /** filtres d'ingrédients, réglés sur l'écran « Ce que je mange » */
  setExcluded: (excluded: Exclusion[]) => void;
  /** les pesées et ce qu'elles disent, recalculé à chaque changement */
  suivi: Suivi;
  /** les identifiants des notions du cours déjà lues */
  lu: string[];
  marquerNotionLue: (slug: string) => void;
  oublierNotionLue: (slug: string) => void;
  /**
   * L'encart du cours a-t-il été rangé pour cette session ?
   *
   * Le seul état d'interface de ce fournisseur, et il y est parce qu'il concerne le cours comme
   * `lu`, et parce qu'il doit valoir pour l'application entière : « Plus tard » sur l'écran des
   * chiffres ne doit pas laisser le même encart réapparaître sur celui du poids trois secondes
   * après. Non persisté, à dessein — c'est un report, pas un refus.
   */
  coursRepousse: boolean;
  repousserCours: () => void;
  /** rend `false` si l'écriture n'a pas abouti — stockage plein, navigation privée verrouillée */
  ajouterPesee: (pesee: Pesee) => boolean;
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
  const [{ profile, staleWeight, pesees, lu }, setDonnees] = useState<Donnees>(() =>
    LECTURE_IMMEDIATE ? lire() : { profile: null, staleWeight: null, pesees: [], lu: [] },
  );
  const [targetKey, setTargetKey] = useState<CleCible | null>(null);
  const [coursRepousse, setCoursRepousse] = useState(false);

  const setProfile = useCallback((next: StoredProfile | null) => {
    setDonnees((avant) => ({ ...avant, profile: next, staleWeight: null }));
  }, []);

  useEffect(() => {
    // Sur le web seulement : rattrape la lecture qui ne pouvait pas avoir lieu au premier rendu.
    if (LECTURE_IMMEDIATE) return;
    const donnees = lire();
    // Les pesées et le cours comptent même sans profil : on peut avoir tout effacé et gardé sa
    // courbe, ou lire les seize notions sans jamais remplir le formulaire.
    if (donnees.profile || donnees.pesees.length || donnees.lu.length) setDonnees(donnees);
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
    const ecrit = saveSuivi(prochaines);
    setDonnees((avant) => ({ ...avant, pesees: loadSuivi() }));
    return ecrit;
  }, []);

  /**
   * Enregistre une pesée, et fige le poids de départ si c'est la première.
   *
   * Le poids de départ ne se déduit pas de l'historique : la première pesée en sortirait, mais elle
   * change dès qu'on supprime une entrée, et le chemin que le cadran affiche reculerait sans que
   * rien ne se soit passé sur la balance. Il est donc écrit une fois, dans le profil, et jamais
   * réécrit — pas même après un « Tout effacer » suivi d'un nouveau profil, qui repart de zéro de
   * toute façon.
   *
   * L'écriture passe par le résultat d'`ajouter` et non par la pesée reçue : le métier borne,
   * arrondit et dédoublonne, et une saisie aberrante qu'il aurait écartée ne doit pas devenir un
   * point de départ.
   *
   * Deux précautions pour que cette écriture ne se voie nulle part ailleurs. L'horodatage d'origine
   * est réécrit tel quel — `saveProfile` le rafraîchit par défaut, et un profil ainsi rajeuni
   * passerait pour à jour alors que son poids, lui, n'a pas bougé : l'invitation à le corriger
   * disparaîtrait au pire moment, juste après une pesée. Et l'état est mis à jour ici plutôt que
   * par `setProfile`, qui efface `staleWeight` — ce qu'une pesée n'a aucune raison de faire.
   */
  const ajouterPesee = useCallback(
    (pesee: Pesee) => {
      const prochaines = ajouter(pesees, pesee);
      const ecrit = enregistrerPesees(prochaines);

      if (!profile || profile.poidsDepart !== undefined) return ecrit;
      if (pesees.length !== 0 || prochaines.length !== 1) return ecrit;

      const { v: _v, updatedAt, ...rest } = profile;
      saveProfile({ ...rest, poidsDepart: prochaines[0].poids }, new Date(updatedAt));
      setDonnees((avant) => ({ ...avant, profile: loadProfile() }));

      // Le sort du poids de départ n'entre pas dans le retour, et c'est délibéré : s'il n'a pas pu
      // s'écrire alors que la pesée l'a été, l'écran retombe sur la première pesée de l'historique
      // (voir `PoidsScreen`), qui vaut exactement la même chose à cet instant. Il n'y a rien à
      // annoncer, donc rien à faire remonter — c'est le repli qui tient lieu de compensation.
      return ecrit;
    },
    [pesees, enregistrerPesees, profile],
  );

  const supprimerPesee = useCallback(
    (date: string) => enregistrerPesees(retirerPesee(pesees, date)),
    [pesees, enregistrerPesees],
  );

  /**
   * Note qu'une notion a été lue.
   *
   * Appelé au montage de la page de la notion, pas sur un bouton : le geste de l'ouvrir *est* la
   * déclaration, et un « J'ai compris » à cocher ferait du cours un formulaire. Idempotent côté
   * stockage, donc relire une notion n'écrit rien.
   */
  const repousserCours = useCallback(() => setCoursRepousse(true), []);

  const marquerNotionLue = useCallback((slug: string) => {
    setDonnees((avant) => ({ ...avant, lu: marquerLue(slug) }));
  }, []);

  const oublierNotionLue = useCallback((slug: string) => {
    setDonnees((avant) => ({ ...avant, lu: oublierLue(slug) }));
  }, []);

  const restaurer = useCallback((sauvegarde: Sauvegarde) => {
    if (sauvegarde.profil) {
      const { v: _v, updatedAt: _updatedAt, ...champs } = sauvegarde.profil;
      saveProfile(champs);
    }
    saveSuivi(sauvegarde.pesees);
    saveLu(sauvegarde.lu);
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
    // Le cours n'est pas effacé : ce n'est pas une donnée personnelle, c'est une lecture. Repartir
    // de la première notion parce qu'on a corrigé son poids n'aurait aucun sens, et le bouton ne
    // promet que d'effacer ce qui vous concerne.
    setDonnees({ profile: null, staleWeight: null, pesees: [], lu: loadLu() });
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
      lu,
      marquerNotionLue,
      oublierNotionLue,
      coursRepousse,
      repousserCours,
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
      lu,
      marquerNotionLue,
      oublierNotionLue,
      coursRepousse,
      repousserCours,
      ajouterPesee,
      supprimerPesee,
      restaurer,
      reset,
    ],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
