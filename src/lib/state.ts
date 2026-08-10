/** État unique de l'application et transitions. Tout le reste est dérivé (voir `calc.ts`). */

import type { GoalKey, Sexe } from './constants';

export type Screen = 'home' | 'input' | 'result';
export type Mode = 'wizard' | 'form';

export interface State {
  screen: Screen;
  mode: Mode;
  /** 0..3, uniquement en mode guidé */
  step: number;
  sexe: Sexe;
  age: string;
  taille: string;
  poids: string;
  activity: number;
  goal: GoalKey;
  /** poids cible choisi manuellement ; `null` = sélection automatique */
  targetKey: string | null;
  error: string;
}

export const initialState: State = {
  screen: 'home',
  mode: 'wizard',
  step: 0,
  sexe: '',
  age: '',
  taille: '',
  poids: '',
  activity: 2,
  goal: 'seche',
  targetKey: null,
  error: '',
};

export type Action =
  | { type: 'startWizard' }
  | { type: 'startForm' }
  | { type: 'toggleMode' }
  | { type: 'editInputs' }
  | { type: 'reset' }
  | { type: 'setSexe'; value: Exclude<Sexe, ''> }
  | { type: 'setField'; field: 'age' | 'taille' | 'poids'; value: string }
  | { type: 'setActivity'; value: number }
  | { type: 'setGoal'; value: GoalKey }
  | { type: 'setTargetKey'; value: string }
  | { type: 'submit' }
  | { type: 'back' }
  | { type: 'error'; message: string };

export interface StepFields {
  sex: boolean;
  body: boolean;
  activity: boolean;
  goal: boolean;
}

export function stepFields(state: State): StepFields {
  if (state.mode === 'form') return { sex: true, body: true, activity: true, goal: true };
  const { step } = state;
  return { sex: step === 0, body: step === 1, activity: step === 2, goal: step === 3 };
}

/** Message d'erreur pour les champs visibles à cette étape ; chaîne vide si tout est valide. */
export function validate(state: State): string {
  const f = stepFields(state);
  if (f.sex && !state.sexe) {
    return 'Sélectionnez un sexe biologique pour appliquer la bonne équation.';
  }
  if (f.body) {
    const age = parseFloat(state.age);
    const taille = parseFloat(state.taille);
    const poids = parseFloat(state.poids);
    if (!age || !taille || !poids) return "Renseignez l'âge, la taille et le poids.";
    if (age < 15 || age > 100) return "L'âge doit être compris entre 15 et 100 ans.";
    if (taille < 120 || taille > 230) return 'La taille doit être comprise entre 120 et 230 cm.';
    if (poids < 30 || poids > 300) return 'Le poids doit être compris entre 30 et 300 kg.';
  }
  return '';
}

export function reducer(state: State, action: Action): State {
  // Toute interaction efface l'erreur affichée ; seule la soumission la repose.
  const clear = { ...state, error: '' };

  switch (action.type) {
    case 'startWizard':
      return { ...clear, screen: 'input', mode: 'wizard', step: 0 };
    case 'startForm':
      return { ...clear, screen: 'input', mode: 'form' };
    case 'toggleMode':
      return { ...clear, mode: state.mode === 'wizard' ? 'form' : 'wizard', step: 0 };
    case 'editInputs':
      return { ...clear, screen: 'input', mode: 'form' };
    case 'reset':
      return { ...initialState };
    case 'setSexe':
      return { ...clear, sexe: action.value };
    case 'setField':
      return { ...clear, [action.field]: action.value };
    case 'setActivity':
      return { ...clear, activity: action.value };
    case 'setGoal':
      // Changer d'objectif invalide le poids cible choisi à la main.
      return { ...clear, goal: action.value, targetKey: null };
    case 'setTargetKey':
      return { ...clear, targetKey: action.value };
    case 'submit': {
      const error = validate(state);
      if (error) return { ...state, error };
      if (state.mode === 'form' || state.step === 3) return { ...clear, screen: 'result' };
      return { ...clear, step: state.step + 1 };
    }
    case 'back':
      if (state.mode === 'wizard' && state.step > 0) return { ...clear, step: state.step - 1 };
      return { ...clear, screen: 'home', step: 0 };
    case 'error':
      return { ...state, error: action.message };
    default:
      return state;
  }
}
