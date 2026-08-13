/**
 * Cœur métier : Mifflin-St Jeor, DET, fourchettes, IMC, macros, poids cible,
 * projection et répartition de l'écart. Fonctions pures, sans dépendance à React.
 */

import {
  activityFactor,
  activityLabel,
  activityLevel,
  BMI_BANDS,
  type BmiBand,
  FLOORS,
  type Goal,
  type GoalKey,
  goalByKey,
  MOVE_SHARES,
  type Sexe,
} from './constants';
import { dec, kcal } from './format';
import type { IconName } from './icons';

export interface Metrics {
  /** métabolisme de base, arrondi */
  bmr: number;
  /** dépense énergétique totale, arrondie */
  tdee: number;
  poids: number;
  taille: number;
  /** en années révolues, les séances s'y adaptent (récupération, impact, équilibre) */
  age: number;
  sexe: Exclude<Sexe, ''>;
  goal: Goal;
  /** borne basse de la fourchette, jamais sous le MB */
  min: number;
  /** borne haute de la fourchette */
  max: number;
  /** apport recommandé, toujours dans [min, max] */
  target: number;
  /** le recommandé théorique tombait sous la borne basse sécurisée */
  raised: boolean;
  /** la borne basse théorique tombait sous le MB (objectif sèche) */
  clamped: boolean;
  /** la borne basse théorique tombait sous le plancher de sécurité */
  belowFloor: boolean;
  floor: number;
  bmi: number;
  band: BmiBand;
  healthyMin: number;
  healthyMax: number;
}

/** Renvoie `null` tant que le profil est incomplet. */
export function computeMetrics(input: {
  sexe: string;
  age: string;
  taille: string;
  poids: string;
  /** index dans `DAILY` : mouvement du quotidien, hors sport */
  daily: number;
  /** index dans `SESSIONS` : volume d'entraînement */
  sessions: number;
  goal: GoalKey;
}): Metrics | null {
  const p = parseFloat(input.poids);
  const t = parseFloat(input.taille);
  const a = parseFloat(input.age);
  if (!p || !t || !a || !input.sexe) return null;

  const base = 10 * p + 6.25 * t - 5 * a + (input.sexe === 'homme' ? 5 : -161);
  const factor = activityFactor(input.daily, input.sessions);
  const goal = goalByKey(input.goal);
  const tdee = base * factor;
  const floor = input.sexe === 'homme' ? FLOORS.homme : FLOORS.femme;

  // Garde-fous : la fourchette ne descend jamais sous le métabolisme de base,
  // et le recommandé reste borné à l'intérieur de [min, max].
  const rawMin = tdee * goal.min;
  const safeMin = Math.max(rawMin, Math.min(base, tdee));
  const safeMax = tdee * goal.max;

  const bmi = p / (t / 100) ** 2;
  const band = BMI_BANDS.find((b) => bmi < b.max) ?? BMI_BANDS[BMI_BANDS.length - 1];

  return {
    bmr: Math.round(base),
    tdee: Math.round(tdee),
    poids: p,
    taille: t,
    age: a,
    sexe: input.sexe === 'homme' ? 'homme' : 'femme',
    goal,
    min: Math.round(safeMin),
    max: Math.round(safeMax),
    target: Math.round(Math.min(Math.max(tdee * goal.rec, safeMin), safeMax)),
    raised: tdee * goal.rec < safeMin,
    clamped: rawMin < base && goal.key === 'seche',
    belowFloor: rawMin < floor,
    floor,
    bmi,
    band,
    healthyMin: Math.round(18.5 * (t / 100) ** 2),
    healthyMax: Math.round(24.9 * (t / 100) ** 2),
  };
}

/**
 * Position du curseur sur la jauge IMC, en %.
 * Les 4 segments affichés font 25 % chacun : le calcul est fait par morceaux
 * pour que le curseur tombe toujours dans la bande annoncée.
 */
export function bmiGaugePosition(bmi: number): number {
  const seg: [number, number][] = [
    [15, 18.5],
    [18.5, 25],
    [25, 30],
    [30, 40],
  ];
  for (let i = 0; i < seg.length; i++) {
    const [lo, hi] = seg[i];
    if (bmi < hi || i === seg.length - 1) {
      const part = Math.max(0, Math.min(1, (bmi - lo) / (hi - lo)));
      return Math.max(2, Math.min(98, i * 25 + part * 25));
    }
  }
  return 98;
}

export interface Macro {
  label: string;
  /** à quoi sert ce macronutriment, en une ligne */
  hint: string;
  grams: number;
  kcal: number;
  pct: number;
  color: string;
  icon: IconName;
}

/**
 * Poids de référence pour les protéines.
 * Au-delà d'un IMC de 30, appliquer les g/kg au poids total surestime le besoin : la masse grasse
 * ne consomme pas de protéines. On utilise le poids ajusté classique en clinique, soit le haut du
 * poids santé plus 25 % de l'excès.
 */
export function proteinReferenceWeight(m: Metrics): number {
  if (m.bmi < 30) return m.poids;
  return m.healthyMax + 0.25 * (m.poids - m.healthyMax);
}

export interface MacroColors {
  prot: string;
  fat: string;
  carb: string;
}

export function buildMacros(m: Metrics, colors: MacroColors): Macro[] {
  const refWeight = proteinReferenceWeight(m);
  const protG = Math.round(refWeight * m.goal.prot);

  // Plancher de lipides : sous 0,6 g/kg, la production hormonale et l'absorption des vitamines
  // liposolubles finissent par en pâtir. 28 % de l'apport reste la valeur cible habituelle.
  const fatFloor = Math.round(0.6 * refWeight);
  let fatG = Math.max(Math.round((m.target * 0.28) / 9), fatFloor);

  // Garde-fou : protéines et lipides ne doivent pas absorber tout l'apport ; on garde au moins
  // 10 % de l'énergie pour les glucides, sauf si le plancher lipidique l'interdit.
  const maxFatKcal = m.target * 0.9 - protG * 4;
  if (fatG * 9 > maxFatKcal) fatG = Math.max(fatFloor, Math.floor(maxFatKcal / 9));

  const carbG = Math.max(0, Math.round((m.target - protG * 4 - fatG * 9) / 4));

  const rows = [
    {
      label: 'Protéines',
      icon: 'oeuf' as IconName,
      hint: 'pour garder vos muscles',
      grams: protG,
      kcal: protG * 4,
      color: colors.prot,
    },
    {
      label: 'Lipides',
      icon: 'goutte' as IconName,
      hint: 'pour les hormones et les vitamines',
      grams: fatG,
      kcal: fatG * 9,
      color: colors.fat,
    },
    {
      label: 'Glucides',
      icon: 'ble' as IconName,
      hint: 'le carburant de la journée et de l’effort',
      grams: carbG,
      kcal: carbG * 4,
      color: colors.carb,
    },
  ];
  return rows.map((row) => ({ ...row, pct: Math.round((row.kcal / m.target) * 100) }));
}

/** Explique sur quelle base les protéines sont calculées, quand ce n'est pas le poids affiché. */
export function proteinBasisNote(m: Metrics): string {
  const ref = proteinReferenceWeight(m);
  if (ref === m.poids) {
    return `Soit ${m.goal.prot.toFixed(1).replace('.', ',')} g de protéines par kilo de poids de corps.`;
  }
  return `Calculé sur un poids de référence de ${Math.round(ref)} kg plutôt que sur vos ${Math.round(m.poids)} kg : au-delà d'un IMC de 30, appliquer les grammes par kilo au poids total gonfle inutilement la quantité de protéines.`;
}

/** Décomposition de la dépense quotidienne, pour rendre le chiffre concret. */
export function energyBreakdown(m: Metrics) {
  const movement = Math.max(0, m.tdee - m.bmr);
  // Thermogenèse alimentaire : environ 10 % de ce qui est mangé, déjà compris dans la dépense
  // totale via le facteur d'activité. Affiché à part parce que c'est contre-intuitif.
  const digestion = Math.round(m.target * 0.1);
  return {
    bmr: m.bmr,
    bmrPct: Math.round((m.bmr / m.tdee) * 100),
    movement: Math.round(movement),
    movementPct: Math.round((movement / m.tdee) * 100),
    digestion,
  };
}

/**
 * Un rythme de perte sain se situe autour de 0,5 à 1 % du poids de corps par semaine.
 * Plus vite, la part de muscle perdue augmente nettement.
 */
export function rateAssessment(
  m: Metrics,
  kgPerWeek: number,
): { level: 'lent' | 'bon' | 'rapide'; text: string } {
  const pct = Math.abs(kgPerWeek) / m.poids;
  if (pct > 0.01) {
    return {
      level: 'rapide',
      text: `Ce rythme représente plus de 1 % de votre poids par semaine. C'est rapide : au-delà, une partie de ce que vous perdez est du muscle, et la faim devient difficile à gérer. Remontez un peu l'apport ou visez une cible intermédiaire.`,
    };
  }
  if (pct < 0.0025 && Math.abs(kgPerWeek) > 0) {
    return {
      level: 'lent',
      text: `Ce rythme est très progressif : les variations d'eau d'un jour à l'autre le masqueront sur la balance. Pesez-vous toujours dans les mêmes conditions et regardez la moyenne sur la semaine.`,
    };
  }
  return {
    level: 'bon',
    text: `Ce rythme se situe dans la zone recommandée, entre 0,5 et 1 % du poids de corps par semaine : assez rapide pour se voir, assez lent pour préserver le muscle.`,
  };
}

/** Positions en % de la barre de fourchette (échelle MB → DET × 1,2). */
export function rangeBar(m: Metrics) {
  const span = Math.max(1, m.tdee * 1.2 - m.bmr);
  return {
    low: Math.round(((m.min - m.bmr) / span) * 100),
    width: Math.round(((m.max - m.min) / span) * 100),
    tdee: Math.round(((m.tdee - m.bmr) / span) * 100),
  };
}

/** Intitulé de la fourchette, formulé comme une question que l'utilisateur se pose. */
export function rangeCaption(goal: GoalKey): string {
  if (goal === 'masse') return 'Entre combien et combien manger pour prendre du muscle';
  if (goal === 'recomp') return 'Entre combien et combien manger';
  return 'Entre combien et combien manger pour perdre du gras';
}

export function warningText(m: Metrics): string {
  if (m.belowFloor) {
    return (
      'Le calcul descendait sous ' +
      kcal(m.floor) +
      " kcal par jour, ce qui est trop bas. La fourchette a été remontée au niveau que votre corps consomme au repos. Manger aussi peu ne devrait pas se faire sans l'avis d'un médecin ou d'un diététicien."
    );
  }
  if (m.clamped || m.raised) {
    return 'La fourchette a été remontée au niveau que votre corps consomme au repos. Manger durablement moins que ça fatigue l’organisme et fait fondre du muscle, pas seulement de la graisse.';
  }
  return '';
}

export interface WeightTarget {
  key: string;
  label: string;
  sub: string;
  /** poids cible en kg */
  w: number;
}

const round1 = (v: number) => Math.round(v * 10) / 10;

export function weightTargets(m: Metrics): WeightTarget[] {
  const m2 = (m.taille / 100) ** 2;
  if (m.bmi >= 25) {
    return [
      { key: 'healthy', label: 'Poids santé maximum', sub: 'IMC 25', w: round1(24.9 * m2) },
      { key: 'mid', label: 'Milieu du poids santé', sub: 'IMC 22', w: round1(22 * m2) },
      {
        key: 'step',
        label: 'Une première étape',
        sub: '−5 % de votre poids',
        w: round1(m.poids * 0.95),
      },
    ];
  }
  if (m.bmi < 18.5) {
    return [
      { key: 'healthy', label: 'Poids santé minimum', sub: 'IMC 18,5', w: round1(18.6 * m2) },
      { key: 'mid', label: 'Milieu du poids santé', sub: 'IMC 22', w: round1(22 * m2) },
      {
        key: 'step',
        label: 'Une première étape',
        sub: '+5 % de votre poids',
        w: round1(m.poids * 1.05),
      },
    ];
  }
  return [
    { key: 'cut', label: 'Perdre un peu', sub: '−5 % de votre poids', w: round1(m.poids * 0.95) },
    { key: 'stable', label: 'Garder mon poids', sub: 'sans changement', w: round1(m.poids) },
    { key: 'gain', label: 'Prendre un peu', sub: '+5 % de votre poids', w: round1(m.poids * 1.05) },
  ];
}

export function defaultTargetKey(m: Metrics, goal: GoalKey): string {
  if (m.bmi >= 25) return goal === 'masse' ? 'step' : 'healthy';
  if (m.bmi < 18.5) return goal === 'seche' ? 'step' : 'healthy';
  return goal === 'masse' ? 'gain' : goal === 'seche' ? 'cut' : 'stable';
}

/** Géométrie du graphique de projection (repère SVG). */
export const CHART = { width: 600, x0: 6, x1: 594, y0: 10, y1: 170 } as const;

export interface ProjectionTick {
  x: number;
  label: string;
}

export interface Projection {
  options: WeightTarget[];
  key: string;
  selected: WeightTarget;
  /** kg par semaine, signé */
  rate: number;
  weeks: number;
  /** une projection n'a de sens que si l'écart et le rythme vont dans le même sens */
  coherent: boolean;
  months: number;
  points: { x: number; y: number }[];
  ticks: ProjectionTick[];
  targetX: number;
  targetY: number;
  loLabel: string;
  hiLabel: string;
  note: string;
}

export function buildProjection(m: Metrics, goal: GoalKey, targetKey: string | null): Projection {
  const options = weightTargets(m);
  const key =
    targetKey && options.some((o) => o.key === targetKey) ? targetKey : defaultTargetKey(m, goal);
  const selected = options.find((o) => o.key === key) ?? options[0];

  const rate = ((m.target - m.tdee) * 7) / 7700; // kg / semaine
  const delta = selected.w - m.poids;
  const coherent = Math.abs(rate) >= 0.03 && Math.abs(delta) > 0.2 && delta > 0 === rate > 0;
  const weeks = coherent ? Math.ceil(Math.abs(delta / rate)) : 0;

  const base = {
    options,
    key,
    selected,
    rate,
    weeks,
    months: weeks / 4.345,
    note: projectionNote(coherent, rate),
  };

  if (!coherent) {
    return {
      ...base,
      coherent: false,
      points: [],
      ticks: [],
      targetX: 0,
      targetY: 0,
      loLabel: '',
      hiLabel: '',
    };
  }

  const horizon = Math.min(Math.max(weeks, 4), 78);
  const lo = Math.min(m.poids, selected.w) - 1.5;
  const hi = Math.max(m.poids, selected.w) + 1.5;
  const px = (t: number) => CHART.x0 + (t / horizon) * (CHART.x1 - CHART.x0);
  const py = (w: number) => CHART.y1 - ((w - lo) / (hi - lo)) * (CHART.y1 - CHART.y0);

  const points: { x: number; y: number }[] = [];
  for (let t = 0; t <= horizon; t++) {
    const w =
      rate > 0
        ? Math.min(m.poids + rate * t, selected.w)
        : Math.max(m.poids + rate * t, selected.w);
    points.push({ x: px(t), y: py(w) });
  }

  const stepWeeks = horizon > 52 ? 13 : horizon > 26 ? 8 : horizon > 12 ? 4 : 2;
  const ticks: ProjectionTick[] = [];
  for (let t = 0; t <= horizon; t += stepWeeks) {
    ticks.push({ x: px(t), label: `S${t}` });
  }

  return {
    ...base,
    coherent: true,
    points,
    ticks,
    targetX: px(Math.min(weeks, horizon)),
    targetY: py(selected.w),
    loLabel: `${dec(Math.round(lo * 10) / 10)} kg`,
    hiLabel: `${dec(Math.round(hi * 10) / 10)} kg`,
  };
}

function projectionNote(coherent: boolean, rate: number): string {
  if (coherent) {
    return "Cette courbe suppose que vous mangez pareil tous les jours. En vrai elle s'aplatit avec le temps : plus vous êtes léger, moins vous dépensez. Refaites le calcul tous les 4 à 5 kg.";
  }
  if (Math.abs(rate) < 0.03) {
    return "À ce niveau, vous mangez ce que vous dépensez : votre poids ne bouge pas, il n'y a donc rien à projeter. Choisissez « perdre du gras » ou « prendre du muscle » pour créer un écart.";
  }
  return "Ce poids cible va dans le sens inverse de ce que vous mangez : vous ne pouvez pas grossir en mangeant moins, ni maigrir en mangeant plus. Changez la cible ou l'objectif.";
}

export interface Plan {
  title: string;
  note: string;
  /** l'écart est assez grand pour être réparti mouvement / assiette */
  hasSplit: boolean;
  splitLabel: string;
  moveLabel: string;
  foodLabel: string;
  moveKcal: number;
  foodKcal: number;
  movePct: number;
  foodPct: number;
}

export function buildPlan(m: Metrics, daily: number, sessions: number, goal: GoalKey): Plan {
  const share = MOVE_SHARES[activityLevel(daily, sessions)];
  const gap = m.tdee - m.target;
  const isSurplus = gap < -20;
  const movePct = Math.round(share * 100);

  return {
    title: goal === 'masse' ? 'Comment utiliser ce surplus' : 'Comment créer cet écart',
    note: planNote(goal, daily, sessions),
    hasSplit: gap > 20 || isSurplus,
    splitLabel: isSurplus ? 'Où mettre ce surplus chaque jour' : 'Où prendre cet écart chaque jour',
    moveLabel: isSurplus ? 'Dépensé à l’entraînement' : 'En bougeant plus',
    foodLabel: isSurplus ? 'En mangeant un peu plus' : 'En mangeant un peu moins',
    moveKcal: Math.round(Math.abs(gap) * share),
    foodKcal: Math.round(Math.abs(gap) * (1 - share)),
    movePct,
    foodPct: 100 - movePct,
  };
}

function planNote(goal: GoalKey, daily: number, sessions: number): string {
  if (goal === 'masse') {
    return 'Ici, le sport ne sert pas à brûler des calories mais à envoyer ce que vous mangez vers le muscle plutôt que vers la graisse. Comptez 3 à 4 séances de renforcement par semaine, en augmentant peu à peu les charges ou les répétitions.';
  }
  if (activityLevel(daily, sessions) <= 1) {
    return (
      'Votre profil (' +
      activityLabel(daily, sessions) +
      ") laisse de la marge : une bonne partie de l'écart peut venir du mouvement, plutôt que de manger encore moins. Bouger dans la journée dépense aussi beaucoup, sans vous fatiguer."
    );
  }
  return "Vous bougez déjà beaucoup : l'écart doit surtout venir de l'assiette. En ajouter encore à l'entraînement se paierait en fatigue et en baisse de performance.";
}
