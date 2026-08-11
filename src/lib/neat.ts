/**
 * Le mouvement du quotidien : le NEAT (non-exercise activity thermogenesis).
 *
 * Tenu à part des séances, et volontairement : ce sont deux dépenses de nature différente.
 * Le NEAT se compte tous les jours, ne demande pas de récupération, et sa marge entre deux
 * personnes de même gabarit atteint plusieurs centaines de kcal par jour, bien plus que ce que
 * trois séances hebdomadaires ajoutent une fois lissées. Il ne s'adapte donc ni à l'objectif de
 * performance ni à l'âge : il s'adapte à la place que votre journée laisse au mouvement.
 */

import type { Metrics } from './calc';
import { DAILY, type GoalKey, NEAT_ACTIONS, NEAT_TIPS, SESSIONS } from './constants';

export interface NeatItem {
  label: string;
  detail: string;
  /** dépense estimée pour le poids de la personne, arrondie au multiple de 5 */
  kcal: number;
}

export interface NeatPlan {
  /** ce que le mouvement du quotidien pèse déjà, en kcal par jour */
  currentKcal: number;
  /** ce qu'un cran de plus dans la journée rapporterait ; 0 si le quotidien est déjà au maximum */
  headroom: number;
  /** vrai quand il reste de la marge à aller chercher hors séances */
  hasHeadroom: boolean;
  steps: string;
  actions: NeatItem[];
  tips: string[];
  lead: string;
  note: string;
}

/**
 * Part du NEAT dans une journée : le facteur de base couvre le métabolisme de repos (1,0) plus
 * tout ce qui bouge hors séances. Les séances, elles, sont l'incrément `add` de l'autre axe.
 */
export function neatKcal(m: Metrics, daily: number): number {
  const base = (DAILY[daily] ?? DAILY[0]).base;
  return Math.round(m.bmr * (base - 1));
}

export interface MovementSplit {
  /** kcal par jour dus au mouvement du quotidien */
  neat: number;
  /** kcal par jour dus aux séances, lissés sur la semaine */
  sessions: number;
  neatPct: number;
  sessionsPct: number;
}

/**
 * Départage les deux dépenses de mouvement, chacune sur son axe de saisie.
 * L'écart est en général frappant : le quotidien pèse plusieurs fois ce que pèsent les séances,
 * et c'est précisément ce que ce découpage sert à montrer.
 */
export function movementSplit(m: Metrics, daily: number, sessions: number): MovementSplit {
  const neat = neatKcal(m, daily);
  const seances = Math.round(m.bmr * (SESSIONS[sessions] ?? SESSIONS[0]).add);
  const total = Math.max(1, neat + seances);
  const neatPct = Math.round((neat / total) * 100);
  return { neat, sessions: seances, neatPct, sessionsPct: 100 - neatPct };
}

/** Ce que rapporterait un quotidien plus actif, sans ajouter la moindre séance. */
function headroomKcal(m: Metrics, daily: number): number {
  const next = DAILY[daily + 1];
  if (!next) return 0;
  return Math.round(m.bmr * (next.base - DAILY[daily].base));
}

function stepsTarget(daily: number): string {
  if (daily === 0) {
    return 'Visez 7 000 à 8 000 pas par jour pour commencer, puis 10 000 une fois l’habitude prise.';
  }
  if (daily === 1) return 'Tenez 9 000 à 10 000 pas par jour, y compris les jours de séance.';
  return 'Votre travail assure déjà les pas en semaine : l’enjeu est de les tenir aussi le week-end.';
}

function lead(daily: number, goal: GoalKey): string {
  if (goal === 'masse') {
    return 'Le NEAT reste utile (il entretient l’appétit, la santé cardiovasculaire et la sensibilité à l’insuline), mais ne cherchez pas à l’augmenter : chaque calorie dépensée ici est retirée du surplus qui construit le muscle.';
  }
  if (daily >= 2) {
    return 'Votre journée vous fait déjà beaucoup bouger. Cette base est un atout : entretenez-la plutôt que d’en rajouter, la fatigue accumulée se paierait sur les séances.';
  }
  return 'Ce que vous faites hors séance pèse plus lourd que les séances elles-mêmes. C’est répétable tous les jours, ça ne demande aucune récupération, et ça ne se ressent pas comme un effort.';
}

function note(m: Metrics, daily: number, goal: GoalKey, headroom: number): string {
  if (goal === 'masse') {
    return `Votre quotidien représente environ ${neatKcal(m, daily)} kcal par jour. Gardez-le tel quel : c’est le repère sur lequel votre surplus a été calculé.`;
  }
  if (headroom === 0) {
    return `Votre quotidien représente déjà environ ${neatKcal(m, daily)} kcal par jour, soit le haut de l’échelle. Il n’y a plus de marge à y prendre : l’écart doit venir de l’assiette.`;
  }
  return `Votre quotidien représente environ ${neatKcal(m, daily)} kcal par jour. Passer au cran au-dessus en ajouterait à peu près ${headroom}, sans une seule séance de plus, et sans fatigue supplémentaire à récupérer.`;
}

export function buildNeat(m: Metrics, daily: number, goal: GoalKey): NeatPlan {
  const headroom = headroomKcal(m, daily);

  const actions = NEAT_ACTIONS.filter((a) => a.daily.includes(daily)).map((a) => ({
    label: a.label,
    detail: a.detail,
    // MET × kg × heures : la dépense d'un même geste monte avec le poids porté.
    kcal: Math.round((a.met * m.poids * a.min) / 60 / 5) * 5,
  }));

  return {
    currentKcal: neatKcal(m, daily),
    headroom,
    hasHeadroom: headroom > 0 && goal !== 'masse',
    steps: stepsTarget(daily),
    actions,
    tips: NEAT_TIPS[daily] ?? NEAT_TIPS[3],
    lead: lead(daily, goal),
    note: note(m, daily, goal, headroom),
  };
}
