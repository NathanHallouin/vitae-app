/**
 * Les séances : l'autre moitié du mouvement, distincte du NEAT (voir `neat.ts`).
 *
 * Une séance n'est pas du mouvement en plus : c'est un stimulus. Elle demande un créneau, une
 * progression et 48 h de récupération, et son intérêt ne se mesure pas aux calories dépensées
 * mais au muscle conservé ou construit. C'est pourquoi tout est calculé ici à partir de la
 * personne (âge, sexe, poids, métabolisme, objectif) et non d'un programme unique.
 *
 * Repères suivis : au moins deux séances de renforcement par semaine (recommandation OMS pour
 * les adultes), 48 h entre deux séances sollicitant les mêmes muscles, progression par
 * répétitions avant progression par difficulté, et arrêt des séries avant l'échec.
 */

import type { Metrics } from './calc';
import { activityLevel, type GoalKey } from './constants';

export interface Exercise {
  name: string;
  /** séries × répétitions ou durée, calculé pour le profil */
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
  /** dépense estimée pour le poids de la personne */
  kcal: number;
  exercises: Exercise[];
}

/** Un réglage du programme et la raison, tirée du profil, qui l'a décidé. */
export interface Adaptation {
  label: string;
  reason: string;
}

export interface WeekPlan {
  /** nombre de séances de renforcement par semaine */
  strengthPerWeek: number;
  sessions: Session[];
  /** ce que les séances de la semaine dépensent au total */
  weeklyKcal: number;
  /** exemple de placement dans la semaine */
  schedule: string;
  warmup: string;
  cardio: string[];
  adaptations: Adaptation[];
  progression: string[];
  note: string;
}

/* ------------------------------------------------------------------ réglages */

/**
 * Les réglages déduits du profil, appliqués ensuite à tous les exercices.
 * Le détail est exposé (`adaptations`) plutôt que caché : un programme qu'on ne comprend pas
 * est un programme qu'on abandonne.
 */
interface Setup {
  sets: number;
  /** fourchette de répétitions pour les mouvements comptés */
  reps: [number, number];
  /** fourchette de durée, en secondes, pour les mouvements tenus */
  hold: [number, number];
  restSeconds: number;
  /** sauts et réceptions écartés : articulations à ménager */
  lowImpact: boolean;
  /** les poussées démarrent sur la variante surélevée */
  assistPush: boolean;
  /** bloc équilibre ajouté en fin de séance */
  balance: boolean;
  adaptations: Adaptation[];
}

/** Déficit relatif à la dépense totale : 0,18 signifie « 18 % sous le DET ». */
function deficitRatio(m: Metrics): number {
  return (m.tdee - m.target) / m.tdee;
}

/** Tranche d'âge retenue pour la récupération et le choix des variantes. */
type AgeBand = 'jeune' | 'quarantaine' | 'avance' | 'senior';

function ageBandOf(age: number): AgeBand {
  if (age >= 65) return 'senior';
  if (age >= 55) return 'avance';
  if (age >= 40) return 'quarantaine';
  return 'jeune';
}

/**
 * Les réglages sont calculés d'abord, les explications ensuite : elles citent ainsi les valeurs
 * réellement appliquées, et non celles d'une étape intermédiaire.
 */
function buildSetup(m: Metrics, goal: GoalKey, strengthPerWeek: number): Setup {
  const deficit = deficitRatio(m);
  const band = ageBandOf(m.age);
  const obese = m.bmi >= 30;

  // 1. L'objectif décide de la nature du stimulus : charge et densité de la séance.
  let reps: [number, number] =
    goal === 'masse'
      ? [8, 12]
      : goal === 'seche'
        ? [12, 15]
        : goal === 'recomp'
          ? [10, 14]
          : [10, 15];
  let rest = goal === 'masse' ? 90 : goal === 'seche' ? 60 : 75;
  const sets = goal === 'masse' && strengthPerWeek >= 3 ? 4 : 3;

  // 2. L'âge allonge la récupération et déplace la fourchette vers des séries plus longues.
  if (band === 'senior') {
    rest += 45;
    reps = [Math.max(reps[0], 10), Math.max(reps[1], 15)];
  } else if (band === 'avance') {
    rest += 30;
    reps = [Math.max(reps[0], 10), reps[1]];
  } else if (band === 'quarantaine') {
    rest += 15;
  }

  // 3. Au poids du corps, c'est le poids du corps qui fait la charge : à forte corpulence,
  //    un squat complet relève déjà de la force, pas de l'endurance.
  if (obese) {
    reps = [Math.max(6, Math.round(reps[0] * 0.7)), Math.max(10, Math.round(reps[1] * 0.7))];
  }

  // 4. Un déficit marqué se paie sur la récupération, pas sur la motivation.
  if (deficit >= 0.15) rest += 15;

  const lowImpact = obese || m.age >= 60;
  const balance = m.age >= 60;
  const assistPush = m.sexe === 'femme' || m.age >= 60 || obese;
  const restSeconds = Math.min(150, Math.max(45, rest));

  const setup: Setup = {
    sets,
    reps,
    hold: m.age >= 60 || obese ? [20, 30] : [30, 45],
    restSeconds,
    lowImpact,
    assistPush,
    balance,
    adaptations: [],
  };

  setup.adaptations = explainSetup(m, goal, setup, { band, obese, deficit });
  return setup;
}

/**
 * Ce que le profil a changé, et pourquoi. Affiché tel quel à l'utilisateur : c'est la seule
 * façon de distinguer un programme adapté d'un programme générique auquel on aurait mis un nom.
 */
function explainSetup(
  m: Metrics,
  goal: GoalKey,
  setup: Setup,
  ctx: { band: AgeBand; obese: boolean; deficit: number },
): Adaptation[] {
  const { band, obese, deficit } = ctx;
  const out: Adaptation[] = [];

  out.push({
    label: `${setup.sets} séries de ${setup.reps[0]} à ${setup.reps[1]} répétitions, ${restLabel(setup.restSeconds)} de repos`,
    reason:
      goal === 'masse'
        ? 'Des séries exigeantes et des repos complets : c’est la combinaison où le muscle reçoit le signal le plus net de se construire.'
        : goal === 'seche'
          ? 'Des séries un peu plus longues et des repos contenus : à charge égale, la séance est plus dense et le muscle reste stimulé malgré le déficit.'
          : 'Une fourchette intermédiaire, assez lourde pour stimuler le muscle et assez longue pour rester technique.',
  });

  if (band === 'senior') {
    out.push({
      label: 'Séries longues et repos complets',
      reason: `À ${m.age} ans, un travail en séries longues et bien récupérées apporte des gains de force comparables à un travail lourd, avec beaucoup moins de contrainte sur les tendons et les articulations.`,
    });
  } else if (band === 'avance') {
    out.push({
      label: `Repos portés à ${restLabel(setup.restSeconds)}`,
      reason: `À ${m.age} ans, la récupération entre deux séries est plus lente. Écourter le repos ne rend pas la séance plus efficace : cela dégrade seulement les séries suivantes.`,
    });
  } else if (band === 'quarantaine') {
    out.push({
      label: 'Échauffement allongé et repos un peu plus longs',
      reason: `À partir de la quarantaine, les tendons se réchauffent plus lentement que les muscles : c'est là que se produisent la plupart des blessures d'entraînement.`,
    });
  }

  if (obese) {
    out.push({
      label: `Séries courtes : ${setup.reps[0]} à ${setup.reps[1]} répétitions`,
      reason: `À ${Math.round(m.poids)} kg, un squat ou une pompe au sol représentent déjà une charge lourde. Viser vingt répétitions n'aurait aucun sens ici : ce sont des séries de force.`,
    });
    out.push({
      label: 'Aucun saut ni impact',
      reason:
        'À la réception d’un saut, les genoux et les chevilles encaissent plusieurs fois le poids du corps. Le renforcement en appui donne le même résultat sans ce risque.',
    });
  } else if (m.bmi < 18.5) {
    out.push({
      label: 'Renforcement seul, sans cardio ajouté',
      reason: `Avec un IMC de ${m.bmi.toFixed(1).replace('.', ',')}, la priorité est de construire, pas de dépenser. Le cardio viendra quand le poids sera remonté dans la zone santé.`,
    });
  } else if (setup.lowImpact) {
    out.push({
      label: 'Sauts remplacés par du tempo lent',
      reason:
        'Passé 60 ans, ralentir la descente sur 3 secondes stimule autant le muscle qu’un mouvement explosif, sans la contrainte de la réception.',
    });
  }

  if (setup.assistPush) {
    out.push({
      label: 'Poussées démarrées mains surélevées',
      reason: obese
        ? `À ${Math.round(m.poids)} kg, une pompe au sol demande de pousser une charge considérable. Sur un plan de travail, la même série devient complète et propre, puis le support descend au fil des semaines.`
        : m.sexe === 'femme'
          ? 'La force relative du haut du corps est en moyenne plus basse chez les femmes. Partir d’un appui surélevé permet des séries complètes dès la première semaine, puis de descendre le support progressivement : c’est la progression prévue, pas une limite.'
          : `À ${m.age} ans, mieux vaut démarrer les poussées en appui et descendre le support une fois l'épaule et le poignet habitués à la charge.`,
    });
  }

  if (setup.balance) {
    out.push({
      label: 'Un bloc équilibre en fin de séance',
      reason: `Après 60 ans, l'équilibre et la capacité à se relever se perdent plus vite que la force elle-même. Deux minutes par séance suffisent à les entretenir.`,
    });
  }

  if (m.sexe === 'femme' && m.age >= 50) {
    out.push({
      label: 'Jambes et hanches maintenues en charge',
      reason:
        'Après la ménopause, la densité osseuse baisse nettement plus vite. Le renforcement en charge sur les hanches et les jambes est le stimulus le mieux établi pour ralentir cette perte, davantage que la marche seule.',
    });
  }

  if (m.sexe === 'homme' && m.age >= 45 && goal !== 'masse') {
    out.push({
      label: 'Deux séances minimum, même en perte de poids',
      reason: `À partir de 45 ans, la masse musculaire diminue d'environ 1 % par an sans stimulus. Sous ce seuil de séances, une part de ce que vous perdriez sur la balance serait du muscle.`,
    });
  }

  if (deficit >= 0.15) {
    out.push({
      label: 'Volume contenu, repos rallongés',
      reason: `Vous mangez ${Math.round(deficit * 100)} % sous votre dépense (${m.target} kcal pour ${m.tdee} dépensées) : à ce niveau, la récupération est plus lente. Ajouter des séances ne ferait pas fondre plus vite, cela creuserait la fatigue.`,
    });
  } else if (deficit <= -0.05) {
    out.push({
      label: 'Volume complet, récupération confortable',
      reason: `Votre surplus (${m.target} kcal pour ${m.tdee} dépensées) couvre largement ces séances : c'est le moment d'être ambitieux sur le volume, le corps a de quoi reconstruire.`,
    });
  }

  return out;
}

/* ------------------------------------------------------- catalogue d'exercices */

interface Template {
  name: string;
  /** équivalent métabolique du mouvement, pour l'estimation de dépense */
  met: number;
  /** compté en répétitions, en répétitions par jambe, ou tenu en secondes */
  count: 'reps' | 'parJambe' | 'temps';
  /** proportion de la fourchette de référence : les petits mouvements en font moins */
  ratio: number;
  cue: string;
  easier: string;
  /** progression normale, quand rien n'interdit l'impact */
  harder: string;
  /** progression de repli quand les articulations doivent être ménagées */
  harderLowImpact?: string;
  /** mouvement de poussée : concerné par le réglage `assistPush` */
  push?: boolean;
  /** travail annexe : ni le volume ni les repos d'un exercice de force ne s'y appliquent */
  accessoire?: { sets: number; restSeconds: number };
}

const SQUAT: Template = {
  name: 'Squat au poids du corps',
  met: 5,
  count: 'reps',
  ratio: 1,
  cue: 'Descendez jusqu’à ce que les cuisses soient parallèles au sol, talons au sol, dos droit.',
  easier: 'Squat sur une chaise : asseyez-vous puis relevez-vous sans élan.',
  harder: 'Squat bulgare, un pied surélevé derrière vous.',
  harderLowImpact: 'Descente en 3 secondes, puis 2 secondes d’arrêt en bas avant de remonter.',
};

const POMPES: Template = {
  name: 'Pompes',
  met: 3.8,
  count: 'reps',
  ratio: 0.7,
  push: true,
  cue: 'Corps aligné de la tête aux talons, coudes à 45° du buste, descente complète.',
  easier: 'Mains surélevées sur une table ou un plan de travail.',
  harder: 'Pieds surélevés sur une chaise.',
  harderLowImpact: 'Descente en 3 secondes, mains sur un support plus bas de semaine en semaine.',
};

const FENTES: Template = {
  name: 'Fentes arrière',
  met: 5,
  count: 'parJambe',
  ratio: 0.8,
  cue: 'Le genou avant reste au-dessus de la cheville, le buste droit.',
  easier: 'Tenez-vous à un mur ou au dossier d’une chaise.',
  harder: 'Un sac à dos chargé de 5 à 10 kg.',
  harderLowImpact: 'Amplitude complète, sans à-coup, en vous tenant d’une seule main.',
};

const HIP_THRUST: Template = {
  name: 'Pont fessier',
  met: 3.5,
  count: 'reps',
  ratio: 1.1,
  cue: 'Poussez avec les talons, serrez les fessiers en haut, une seconde de pause.',
  easier: 'Sans pause en haut, séries plus courtes.',
  harder: 'Sur une seule jambe.',
};

const GAINAGE: Template = {
  name: 'Gainage (planche)',
  met: 3,
  count: 'temps',
  ratio: 1,
  cue: 'Fessiers serrés, bassin dans l’axe : mieux vaut 20 s propres que 60 s en cassant le dos.',
  easier: 'Genoux au sol.',
  harder: 'Levez une jambe en alternance.',
};

const SUPERMAN: Template = {
  name: 'Superman au sol',
  met: 3,
  count: 'reps',
  ratio: 0.9,
  cue: 'À plat ventre, décollez buste et jambes 2 s : c’est le dos qui travaille.',
  easier: 'Bras le long du corps.',
  harder: 'Bras tendus devant, tempo plus lent.',
};

const CHAISE: Template = {
  name: 'Chaise contre le mur',
  met: 4,
  count: 'temps',
  ratio: 1,
  cue: 'Dos plaqué au mur, cuisses parallèles au sol.',
  easier: 'Descendez moins bas.',
  harder: 'Sur une jambe, ou avec du poids sur les cuisses.',
};

const DIPS: Template = {
  name: 'Dips sur chaise',
  met: 3.8,
  count: 'reps',
  ratio: 0.8,
  push: true,
  cue: 'Coudes vers l’arrière, épaules basses, descente contrôlée.',
  easier: 'Pieds proches du corps, genoux pliés.',
  harder: 'Jambes tendues, pieds surélevés.',
};

const ROWING: Template = {
  name: 'Tirage à la serviette',
  met: 3.5,
  count: 'reps',
  ratio: 0.9,
  cue: 'Serviette passée autour d’une poignée de porte, bras tendus, tirez le buste vers vos mains, omoplates serrées.',
  easier: 'Reculez les pieds : plus vous êtes debout, plus c’est léger.',
  harder: 'Avancez les pieds pour vous rapprocher de l’horizontale.',
};

/**
 * Bloc équilibre, ajouté à partir de 60 ans : c'est ce qui se perd le plus vite.
 * Deux séries et des repos courts : l'équilibre se travaille frais, pas à l'épuisement, et il
 * n'a pas à allonger la séance de dix minutes.
 */
const EQUILIBRE: Template = {
  name: 'Équilibre sur une jambe',
  met: 2.5,
  count: 'temps',
  ratio: 0.8,
  accessoire: { sets: 2, restSeconds: 30 },
  cue: 'Près d’un plan de travail, une main disponible en cas de besoin. Regard fixé devant vous.',
  easier: 'Deux doigts posés sur le support.',
  harder: 'Sans appui, puis les yeux fermés.',
};

const LEVER_CHAISE: Template = {
  name: 'Lever de chaise sans les mains',
  met: 3.5,
  count: 'reps',
  ratio: 0.8,
  cue: 'Levez-vous franchement, rasseyez-vous en 3 secondes. C’est le geste du quotidien le plus utile à entretenir.',
  easier: 'Chaise plus haute, ou un coussin sur l’assise.',
  harder: 'Bras croisés sur la poitrine, ou chaise plus basse.',
};

/* ------------------------------------------------------------ mise en séance */

export function restLabel(seconds: number): string {
  if (seconds < 60) return `${seconds} s`;
  const min = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest === 0 ? `${min} min` : `${min} min ${rest}`;
}

/** Séries et repos effectifs : le travail annexe suit ses propres règles. */
function setsOf(tpl: Template, setup: Setup): number {
  return tpl.accessoire?.sets ?? setup.sets;
}

function restOf(tpl: Template, setup: Setup): number {
  return tpl.accessoire?.restSeconds ?? setup.restSeconds;
}

/** Applique les réglages du profil à un exercice : volume, repos et variantes. */
function buildExercise(tpl: Template, setup: Setup): Exercise {
  const sets = setsOf(tpl, setup);
  // Les durées sont arrondies au multiple de 5 s : personne ne tient une planche « 17 s ».
  const scale = (v: number) =>
    tpl.count === 'temps'
      ? Math.max(15, Math.round((v * tpl.ratio) / 5) * 5)
      : Math.max(5, Math.round(v * tpl.ratio));

  const volume =
    tpl.count === 'temps'
      ? `${sets} séries de ${scale(setup.hold[0])} à ${scale(setup.hold[1])} s`
      : `${sets} séries de ${scale(setup.reps[0])} à ${scale(setup.reps[1])}${
          tpl.count === 'parJambe' ? ' par jambe' : ''
        }`;

  // Une poussée démarrée en appui : la variante « plus facile » devient le point de départ, et la
  // progression consiste à descendre le support, pas à passer aux pieds surélevés.
  const assisted = tpl.push && setup.assistPush;

  return {
    name: assisted ? `${tpl.name} (mains surélevées)` : tpl.name,
    volume,
    rest: restLabel(restOf(tpl, setup)),
    cue: assisted
      ? `${tpl.cue} Démarrez mains sur un support stable : l’alignement du corps prime sur la hauteur d’appui.`
      : tpl.cue,
    easier: assisted ? 'Remontez le support : plus il est haut, plus c’est léger.' : tpl.easier,
    harder:
      setup.lowImpact && tpl.harderLowImpact
        ? tpl.harderLowImpact
        : assisted
          ? 'Descendez d’un support : plan de travail, puis table, puis chaise, puis sol.'
          : tpl.harder,
  };
}

/** Minutes d'effort et minutes de repos d'un exercice, séparées pour l'estimation de dépense. */
function exerciseMinutes(tpl: Template, setup: Setup): { work: number; rest: number } {
  const perSet =
    tpl.count === 'temps'
      ? (setup.hold[0] + setup.hold[1]) / 2
      : // ~3 s par répétition, doublé pour les mouvements comptés par jambe
        ((setup.reps[0] + setup.reps[1]) / 2) * 3 * (tpl.count === 'parJambe' ? 2 : 1);
  const sets = setsOf(tpl, setup);
  return { work: (sets * perSet * tpl.ratio) / 60, rest: (sets * restOf(tpl, setup)) / 60 };
}

/**
 * Dépense estimée d'une séance : MET × poids × durée, le temps de repos compté à 2 MET (debout).
 * C'est ce chiffre qui remet les séances à leur place face à l'assiette.
 */
function sessionKcal(templates: Template[], setup: Setup, poids: number): number {
  const total = templates.reduce((sum, tpl) => {
    const { work, rest } = exerciseMinutes(tpl, setup);
    return sum + (tpl.met * poids * work) / 60 + (2 * poids * rest) / 60;
  }, 0);
  return Math.round(total / 5) * 5;
}

function buildSession(
  title: string,
  focus: string,
  templates: Template[],
  setup: Setup,
  poids: number,
): Session {
  const list = setup.balance ? [...templates, EQUILIBRE] : templates;
  const minutes =
    list.reduce((sum, tpl) => {
      const { work, rest } = exerciseMinutes(tpl, setup);
      return sum + work + rest;
    }, 0) + 6; // + échauffement
  const low = Math.round(minutes / 5) * 5;

  return {
    title,
    focus,
    duration: `${low} à ${low + 5} min`,
    kcal: sessionKcal(list, setup, poids),
    exercises: list.map((tpl) => buildExercise(tpl, setup)),
  };
}

/**
 * Nombre de séances de renforcement, selon l'objectif et le volume d'entraînement déjà en place.
 * On se cale sur `sessions` seul : un métier physique fatigue, il ne remplace pas le renforcement.
 * L'âge plafonne ensuite ce nombre : c'est la récupération, pas la motivation, qui limite.
 */
function strengthCount(m: Metrics, goal: GoalKey, sessions: number): number {
  let count: number;
  if (goal === 'masse') count = sessions >= 3 ? 4 : 3;
  else if (goal === 'recomp') count = 3;
  else if (goal === 'maintien') count = sessions <= 1 ? 2 : 3;
  // Perte de gras : deux séances suffisent à protéger le muscle, le reste passe par le mouvement.
  else count = sessions >= 3 ? 3 : 2;

  // Au-delà de 65 ans, 48 h de récupération entre deux séances ne suffisent plus toujours.
  if (m.age >= 65) count = Math.min(count, 3);
  return Math.max(2, count);
}

function warmupText(m: Metrics): string {
  if (m.age >= 55) {
    return '8 à 10 min avant chaque séance : marche sur place, cercles de bras et d’épaules, 10 squats à vide, 10 montées sur la pointe des pieds. À votre âge, c’est la partie de la séance qu’il ne faut jamais sauter.';
  }
  if (m.age >= 40) {
    return '6 à 8 min avant chaque séance : marche sur place, cercles d’épaules, 10 squats à vide. Les tendons se réchauffent plus lentement que les muscles.';
  }
  return '5 min avant chaque séance : marche sur place, cercles d’épaules, 10 squats à vide.';
}

function cardioLines(m: Metrics, goal: GoalKey, level: number, lowImpact: boolean): string[] {
  const lines: string[] = [];
  const perteDeGras = goal === 'seche' || goal === 'recomp';

  if (m.bmi < 18.5) {
    return [
      'Pas de cardio ajouté pour l’instant : il creuserait un écart dont vous n’avez pas besoin. Une marche quotidienne suffit.',
    ];
  }

  if (perteDeGras && level <= 1) {
    lines.push(
      '2 à 3 marches rapides de 30 min dans la semaine, en plus des séances : peu fatigant, facile à tenir.',
    );
    lines.push(
      lowImpact
        ? 'Si le temps manque : 10 min de vélo ou de marche en côte, à allure soutenue. Sans course ni sauts, pour ménager les articulations.'
        : 'Une séance courte et intense (10 min de montées d’escaliers ou de corde à sauter) si le temps manque.',
    );
  } else if (perteDeGras) {
    lines.push(
      '1 à 2 sorties cardio de 30 min à allure conversationnelle, les jours sans renforcement.',
      'Évitez d’en rajouter davantage : au-delà, la récupération et les séances de force en pâtissent.',
    );
  } else if (goal === 'masse') {
    lines.push(
      '1 sortie cardio légère de 20 à 30 min par semaine, pour le cœur, sans creuser l’écart calorique.',
    );
  } else {
    lines.push('150 min d’activité modérée par semaine, réparties comme vous voulez.');
  }

  if (lowImpact && m.bmi >= 30) {
    lines.push(
      `À ${Math.round(m.poids)} kg, privilégiez le vélo, la marche ou le vélo elliptique à la course : même dépense, sans les impacts répétés sur les genoux.`,
    );
  }
  return lines;
}

function progressionSteps(m: Metrics, setup: Setup): string[] {
  const steps = [
    `Semaine 1 et 2 : restez à ${setup.reps[0]} répétitions par série, soignez la technique.`,
    `Ensuite, ajoutez une répétition par série chaque semaine, jusqu’à ${setup.reps[1]}.`,
    `Quand ${setup.reps[1]} répétitions deviennent faciles sur toutes les séries, passez à la variante plus difficile et repartez de ${setup.reps[0]}.`,
    'Arrêtez chaque série 2 à 3 répétitions avant l’échec : c’est suffisant pour progresser, et bien moins fatigant.',
  ];
  if (m.age >= 55) {
    steps.push(
      'Une semaine allégée toutes les 6 à 8 semaines (moitié des séries) : c’est pendant la récupération que les gains se consolident.',
    );
  }
  return steps;
}

function weekNote(
  m: Metrics,
  goal: GoalKey,
  strengthPerWeek: number,
  kcalParSeance: number,
): string {
  const part = Math.round((kcalParSeance / m.tdee) * 100);

  if (goal === 'masse') {
    return `Avec ${strengthPerWeek} séances par semaine et un surplus modéré, le gain réaliste est de 0,2 à 0,5 kg par mois chez un débutant, moitié moins ensuite. Une séance dépense environ ${kcalParSeance} kcal, soit ${part} % de votre dépense d'une journée : ce n'est pas là que se joue la prise de muscle, mais dans le stimulus et dans l'assiette.`;
  }
  if (goal === 'seche') {
    return `Une de ces séances dépense environ ${kcalParSeance} kcal pour vos ${Math.round(m.poids)} kg, soit ${part} % de ce que vous dépensez dans une journée. Ces ${strengthPerWeek} séances ne servent donc pas d'abord à brûler : elles servent à garder le muscle pendant que le poids baisse. Sans elles, une partie de ce que vous perdez serait du muscle.`;
  }
  return `Ces ${strengthPerWeek} séances, à environ ${kcalParSeance} kcal l'unité, entretiennent la masse musculaire, celle-là même qui maintient votre métabolisme à ${Math.round(m.bmr)} kcal au repos.`;
}

export function buildWeek(
  metrics: Metrics,
  daily: number,
  sessions: number,
  goal: GoalKey,
): WeekPlan {
  const strengthPerWeek = strengthCount(metrics, goal, sessions);
  const setup = buildSetup(metrics, goal, strengthPerWeek);

  // Après 60 ans, la chaise contre le mur cède la place au lever de chaise : même muscles, mais
  // c'est le geste qui décide du maintien de l'autonomie.
  const BAS = {
    label: 'bas du corps et gainage',
    focus: 'Cuisses, fessiers, ceinture abdominale',
    templates: [SQUAT, FENTES, HIP_THRUST, GAINAGE],
  };
  const HAUT = {
    label: 'haut du corps et dos',
    focus: 'Pectoraux, épaules, bras, chaîne postérieure',
    templates: [POMPES, ROWING, DIPS, SUPERMAN],
  };
  const ENTIER = {
    label: 'corps entier',
    focus: 'Tout le corps, en circuit',
    templates:
      metrics.age >= 60
        ? [SQUAT, POMPES, LEVER_CHAISE, SUPERMAN]
        : [SQUAT, POMPES, CHAISE, SUPERMAN],
  };

  const rotation =
    strengthPerWeek >= 4
      ? [BAS, HAUT, BAS, HAUT]
      : strengthPerWeek === 3
        ? [BAS, HAUT, ENTIER]
        : [BAS, HAUT];

  // Numérotées dans l'ordre de la semaine : une rotation peut repasser sur la même séance.
  const weekSessions = rotation.map((r, i) =>
    buildSession(`Séance ${i + 1} · ${r.label}`, r.focus, r.templates, setup, metrics.poids),
  );

  const weeklyKcal = weekSessions.reduce((sum, s) => sum + s.kcal, 0);
  const kcalParSeance = Math.round(weeklyKcal / weekSessions.length / 5) * 5;

  const schedule =
    strengthPerWeek >= 4
      ? 'Lundi, mardi, jeudi, vendredi, puis deux jours de repos d’affilée en fin de semaine.'
      : strengthPerWeek === 3
        ? 'Lundi, mercredi, vendredi : un jour de récupération entre chaque séance.'
        : 'Mardi et samedi, ou deux jours espacés d’au moins 48 h.';

  return {
    strengthPerWeek,
    sessions: weekSessions,
    weeklyKcal,
    schedule,
    warmup: warmupText(metrics),
    cardio: cardioLines(metrics, goal, activityLevel(daily, sessions), setup.lowImpact),
    adaptations: setup.adaptations,
    progression: progressionSteps(metrics, setup),
    note: weekNote(metrics, goal, strengthPerWeek, kcalParSeance),
  };
}
