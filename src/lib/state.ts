/**
 * État du formulaire de saisie. La navigation est gérée par le routeur : ce module ne connaît
 * que les champs, l'étape courante et la validation.
 */

import type { GoalKey, Sexe } from './constants';
import { ageFrom } from './date';
import type { ProfileInput, StoredProfile } from './storage';

export type Mode = 'wizard' | 'form';

/** Poids restauré mais périmé : conservé pour information, le champ est vidé. */
export interface StaleWeight {
  previous: string;
  updatedAt: string;
}

export interface FormState {
  mode: Mode;
  /** 0..3, uniquement en mode guidé */
  step: number;
  sexe: Sexe;
  /** date de naissance `yyyy-mm-dd` ; l'âge est recalculé à chaque affichage */
  naissance: string;
  taille: string;
  poids: string;
  activity: number;
  goal: GoalKey;
  /** défini quand le profil enregistré avait un poids de plus d'une semaine */
  staleWeight: StaleWeight | null;
  /** la date de naissance vient du profil enregistré : elle n'est plus modifiable */
  naissanceLocked: boolean;
  error: string;
}

export const emptyForm: FormState = {
  mode: 'wizard',
  step: 0,
  sexe: '',
  naissance: '',
  taille: '',
  poids: '',
  activity: 2,
  goal: 'seche',
  staleWeight: null,
  naissanceLocked: false,
  error: '',
};

/** Pré-remplit le formulaire depuis un profil enregistré. */
export function formFromProfile(
  profile: StoredProfile | null,
  staleWeight: StaleWeight | null,
  mode: Mode = 'wizard',
): FormState {
  if (!profile) return { ...emptyForm, mode };
  return {
    ...emptyForm,
    mode,
    sexe: profile.sexe,
    naissance: profile.naissance,
    taille: profile.taille,
    // Poids périmé : on vide le champ pour forcer une saisie à jour.
    poids: staleWeight ? '' : profile.poids,
    activity: profile.activity,
    goal: profile.goal,
    staleWeight,
    // Une date de naissance enregistrée est figée : « Recommencer » est la seule sortie.
    naissanceLocked: Boolean(profile.naissance),
  };
}

/** Champs à enregistrer, une fois le formulaire validé. */
export function profileFromForm(state: FormState): ProfileInput | null {
  if (state.sexe === '') return null;
  return {
    sexe: state.sexe,
    naissance: state.naissance,
    taille: state.taille,
    poids: state.poids,
    activity: state.activity,
    goal: state.goal,
  };
}

export type MeasureField = 'naissance' | 'taille' | 'poids';

export type Action =
  | { type: 'toggleMode' }
  | { type: 'setSexe'; value: Exclude<Sexe, ''> }
  | { type: 'setField'; field: MeasureField; value: string }
  | { type: 'setActivity'; value: number }
  | { type: 'setGoal'; value: GoalKey }
  | { type: 'next' }
  | { type: 'previous' }
  | { type: 'error'; message: string };

export interface StepFields {
  sex: boolean;
  body: boolean;
  activity: boolean;
  goal: boolean;
}

export function stepFields(state: FormState): StepFields {
  if (state.mode === 'form') return { sex: true, body: true, activity: true, goal: true };
  const { step } = state;
  return { sex: step === 0, body: step === 1, activity: step === 2, goal: step === 3 };
}

/** Dernière étape : la validation suivante enregistre et ouvre les résultats. */
export function isLastStep(state: FormState): boolean {
  return state.mode === 'form' || state.step === 3;
}

/** Message d'erreur pour les champs visibles à cette étape ; chaîne vide si tout est valide. */
export function validate(state: FormState, now: Date = new Date()): string {
  const f = stepFields(state);
  if (f.sex && !state.sexe) {
    return 'Choisissez femme ou homme : le calcul n’est pas le même.';
  }
  if (f.body) {
    const age = ageFrom(state.naissance, now);
    const taille = parseFloat(state.taille);
    const poids = parseFloat(state.poids);
    if (age === null || !taille || !poids) {
      return 'Renseignez la date de naissance, la taille et le poids.';
    }
    if (age < 15 || age > 100) return 'Ce calcul est prévu pour les 15 à 100 ans.';
    if (taille < 120 || taille > 230) return 'La taille doit être comprise entre 120 et 230 cm.';
    if (poids < 30 || poids > 300) return 'Le poids doit être compris entre 30 et 300 kg.';
  }
  return '';
}

export function reducer(state: FormState, action: Action): FormState {
  // Toute interaction efface l'erreur affichée ; seule la validation la repose.
  const clear = { ...state, error: '' };

  switch (action.type) {
    case 'toggleMode':
      return { ...clear, mode: state.mode === 'wizard' ? 'form' : 'wizard', step: 0 };
    case 'setSexe':
      return { ...clear, sexe: action.value };
    case 'setField':
      if (action.field === 'naissance' && state.naissanceLocked) return clear;
      return {
        ...clear,
        [action.field]: action.value,
        // Le rappel de poids périmé disparaît dès qu'un nouveau poids est saisi.
        staleWeight: action.field === 'poids' ? null : state.staleWeight,
      };
    case 'setActivity':
      return { ...clear, activity: action.value };
    case 'setGoal':
      return { ...clear, goal: action.value };
    case 'next':
      return { ...clear, step: Math.min(3, state.step + 1) };
    case 'previous':
      return { ...clear, step: Math.max(0, state.step - 1) };
    case 'error':
      return { ...state, error: action.message };
    default:
      return state;
  }
}
