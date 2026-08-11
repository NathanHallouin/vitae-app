/**
 * Semaine d'entraînement type, au poids du corps, adaptée à l'objectif et au niveau d'activité.
 *
 * Repères suivis : au moins deux séances de renforcement par semaine pour préserver le muscle
 * (recommandation OMS pour les adultes), 150 à 300 min d'activité modérée hebdomadaire, 48 h de
 * récupération entre deux séances sollicitant les mêmes muscles, et progression par répétitions
 * avant progression par difficulté.
 */

import type { Metrics } from './calc';
import { activityLevel, type GoalKey } from './constants';

export interface Exercise {
  name: string;
  /** séries × répétitions ou durée */
  volume: string;
  rest: string;
  /** ce qu'il faut surveiller pendant le mouvement */
  cue: string;
  easier: string;
  harder: string;
}

export interface Session {
  title: string;
  focus: string;
  duration: string;
  exercises: Exercise[];
}

export interface WeekPlan {
  /** nombre de séances de renforcement par semaine */
  strengthPerWeek: number;
  sessions: Session[];
  /** exemple de placement dans la semaine */
  schedule: string;
  cardio: string[];
  steps: string;
  progression: string[];
  note: string;
}

const SQUAT: Exercise = {
  name: 'Squat au poids du corps',
  volume: '4 séries de 12 à 15',
  rest: '60 à 90 s',
  cue: 'Descendez jusqu’à ce que les cuisses soient parallèles au sol, talons au sol, dos droit.',
  easier: 'Squat sur une chaise : asseyez-vous puis relevez-vous sans élan.',
  harder: 'Squat bulgare, un pied surélevé derrière vous.',
};

const POMPES: Exercise = {
  name: 'Pompes',
  volume: '4 séries de 8 à 12',
  rest: '60 à 90 s',
  cue: 'Corps aligné de la tête aux talons, coudes à 45° du buste, descente complète.',
  easier: 'Mains surélevées sur une table ou un plan de travail.',
  harder: 'Pieds surélevés sur une chaise.',
};

const FENTES: Exercise = {
  name: 'Fentes arrière',
  volume: '3 séries de 10 par jambe',
  rest: '60 s',
  cue: 'Le genou avant reste au-dessus de la cheville, le buste droit.',
  easier: 'Tenez-vous à un mur ou au dossier d’une chaise.',
  harder: 'Un sac à dos chargé de 5 à 10 kg.',
};

const HIP_THRUST: Exercise = {
  name: 'Pont fessier',
  volume: '4 séries de 15',
  rest: '45 à 60 s',
  cue: 'Poussez avec les talons, serrez les fessiers en haut, une seconde de pause.',
  easier: 'Sans pause en haut, séries plus courtes.',
  harder: 'Sur une seule jambe.',
};

const GAINAGE: Exercise = {
  name: 'Gainage (planche)',
  volume: '3 séries de 30 à 45 s',
  rest: '45 s',
  cue: 'Fessiers serrés, bassin dans l’axe : mieux vaut 20 s propres que 60 s en cassant le dos.',
  easier: 'Genoux au sol.',
  harder: 'Levez une jambe en alternance.',
};

const SUPERMAN: Exercise = {
  name: 'Superman au sol',
  volume: '3 séries de 12',
  rest: '45 s',
  cue: 'À plat ventre, décollez buste et jambes 2 s : c’est le dos qui travaille.',
  easier: 'Bras le long du corps.',
  harder: 'Bras tendus devant, tempo plus lent.',
};

const CHAISE: Exercise = {
  name: 'Chaise contre le mur',
  volume: '3 séries de 40 s',
  rest: '60 s',
  cue: 'Dos plaqué au mur, cuisses parallèles au sol.',
  easier: 'Descendez moins bas.',
  harder: 'Sur une jambe, ou avec du poids sur les cuisses.',
};

const DIPS: Exercise = {
  name: 'Dips sur chaise',
  volume: '3 séries de 10 à 12',
  rest: '60 s',
  cue: 'Coudes vers l’arrière, épaules basses, descente contrôlée.',
  easier: 'Pieds proches du corps, genoux pliés.',
  harder: 'Jambes tendues, pieds surélevés.',
};

const SESSION_A: Session = {
  title: 'Bas du corps et gainage',
  focus: 'Cuisses, fessiers, ceinture abdominale',
  duration: '30 à 35 min',
  exercises: [SQUAT, FENTES, HIP_THRUST, GAINAGE],
};

const SESSION_B: Session = {
  title: 'Haut du corps et dos',
  focus: 'Pectoraux, épaules, bras, chaîne postérieure',
  duration: '30 à 35 min',
  exercises: [POMPES, DIPS, SUPERMAN, GAINAGE],
};

const SESSION_C: Session = {
  title: 'Corps entier, en circuit',
  focus: 'Tout le corps, en circuit',
  duration: '25 à 30 min',
  exercises: [SQUAT, POMPES, CHAISE, SUPERMAN],
};

/**
 * Nombre de séances de renforcement, selon l'objectif et le volume d'entraînement déjà en place.
 * On se cale sur `sessions` seul : un métier physique fatigue, il ne remplace pas le renforcement.
 */
function strengthCount(goal: GoalKey, sessions: number): number {
  if (goal === 'masse') return sessions >= 3 ? 4 : 3;
  if (goal === 'recomp') return 3;
  if (goal === 'maintien') return sessions <= 1 ? 2 : 3;
  // Perte de gras : deux séances suffisent à protéger le muscle, le reste passe par le mouvement.
  return sessions >= 3 ? 3 : 2;
}

export function buildWeek(
  metrics: Metrics,
  daily: number,
  sessions: number,
  goal: GoalKey,
): WeekPlan {
  const strengthPerWeek = strengthCount(goal, sessions);
  const level = activityLevel(daily, sessions);
  const rotation =
    strengthPerWeek >= 4
      ? [SESSION_A, SESSION_B, SESSION_A, SESSION_B]
      : strengthPerWeek === 3
        ? [SESSION_A, SESSION_B, SESSION_C]
        : [SESSION_A, SESSION_B];

  // Numérotées dans l'ordre de la semaine : une rotation peut repasser sur la même séance.
  const weekSessions = rotation.map((session, i) => ({
    ...session,
    title: `Séance ${i + 1} — ${session.title.toLowerCase()}`,
  }));

  const schedule =
    strengthPerWeek >= 4
      ? 'Lundi, mardi, jeudi, vendredi — deux jours de repos d’affilée en fin de semaine.'
      : strengthPerWeek === 3
        ? 'Lundi, mercredi, vendredi : un jour de récupération entre chaque séance.'
        : 'Mardi et samedi, ou deux jours espacés d’au moins 48 h.';

  const cardio: string[] = [];
  const perteDeGras = goal === 'seche' || goal === 'recomp';

  if (perteDeGras && level <= 1) {
    cardio.push(
      '2 à 3 marches rapides de 30 min dans la semaine, en plus des séances : peu fatigant, facile à tenir.',
      'Une séance courte et intense (10 min de montées d’escaliers ou de corde à sauter) si le temps manque.',
    );
  } else if (perteDeGras) {
    cardio.push(
      '1 à 2 sorties cardio de 30 min à allure conversationnelle, les jours sans renforcement.',
      'Évitez d’en rajouter davantage : au-delà, la récupération et les séances de force en pâtissent.',
    );
  } else if (goal === 'masse') {
    cardio.push(
      '1 sortie cardio légère de 20 à 30 min par semaine, pour le cœur, sans creuser l’écart calorique.',
    );
  } else {
    cardio.push('150 min d’activité modérée par semaine, réparties comme vous voulez.');
  }

  // Les pas relèvent du quotidien, pas des séances : c'est `daily` qui décide, pas `sessions`.
  const steps =
    daily <= 0
      ? 'Objectif 7 000 à 8 000 pas par jour pour commencer, puis 10 000.'
      : 'Maintenez 8 000 à 10 000 pas par jour, y compris les jours de repos.';

  const progression = [
    'Semaine 1 et 2 : restez en bas de la fourchette de répétitions, soignez la technique.',
    'Ensuite, ajoutez une répétition par série chaque semaine, jusqu’au haut de la fourchette.',
    'Quand le haut de la fourchette devient facile sur toutes les séries, passez à la variante plus difficile et repartez en bas.',
    'Arrêtez chaque série 2 à 3 répétitions avant l’échec : c’est suffisant pour progresser, et bien moins fatigant.',
  ];

  const note =
    goal === 'masse'
      ? `Avec ${strengthPerWeek} séances par semaine et un surplus modéré, le gain réaliste est de 0,2 à 0,5 kg par mois chez un débutant, moitié moins ensuite. Le muscle se construit lentement : la régularité prime sur l’intensité.`
      : goal === 'seche'
        ? `Ces ${strengthPerWeek} séances ne servent pas d’abord à brûler des calories — une séance en dépense 150 à 250 — mais à garder le muscle pendant que le poids baisse. Sans elles, une partie de ce que vous perdez serait du muscle.`
        : `Ces ${strengthPerWeek} séances entretiennent la masse musculaire, qui est justement ce qui maintient votre métabolisme à ${Math.round(metrics.bmr)} kcal au repos.`;

  return { strengthPerWeek, sessions: weekSessions, schedule, cardio, steps, progression, note };
}
