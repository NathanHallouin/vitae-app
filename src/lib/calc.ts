/**
 * Cœur métier : Mifflin-St Jeor, DET, fourchettes, IMC, macros, poids cible,
 * projection et répartition de l'écart. Fonctions pures, sans dépendance à React.
 */

import {
  ACTIVITIES,
  BMI_BANDS,
  type BmiBand,
  FLOORS,
  type Goal,
  type GoalKey,
  goalByKey,
  MACRO_COLORS,
  MOVE_SHARES,
  MOVES,
  NEAT,
  NEAT_ACTIVE,
} from './constants';
import { dec } from './format';

export interface Metrics {
  /** métabolisme de base, arrondi */
  bmr: number;
  /** dépense énergétique totale, arrondie */
  tdee: number;
  poids: number;
  taille: number;
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
  activity: number;
  goal: GoalKey;
}): Metrics | null {
  const p = parseFloat(input.poids);
  const t = parseFloat(input.taille);
  const a = parseFloat(input.age);
  if (!p || !t || !a || !input.sexe) return null;

  const base = 10 * p + 6.25 * t - 5 * a + (input.sexe === 'homme' ? 5 : -161);
  const factor = ACTIVITIES[input.activity].factor;
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
  grams: number;
  kcal: number;
  pct: number;
  color: string;
}

export function buildMacros(m: Metrics, primaryColor: string): Macro[] {
  const protG = Math.round(m.poids * m.goal.prot);
  const fatG = Math.round((m.target * 0.28) / 9);
  const carbG = Math.max(0, Math.round((m.target - protG * 4 - fatG * 9) / 4));
  const rows = [
    { label: 'Protéines', grams: protG, kcal: protG * 4, color: primaryColor },
    { label: 'Lipides', grams: fatG, kcal: fatG * 9, color: MACRO_COLORS.fat },
    { label: 'Glucides', grams: carbG, kcal: carbG * 4, color: MACRO_COLORS.carb },
  ];
  return rows.map((row) => ({ ...row, pct: Math.round((row.kcal / m.target) * 100) }));
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

export function rangeCaption(goal: GoalKey): string {
  if (goal === 'masse') return 'Fourchette de surplus recommandée';
  if (goal === 'recomp') return "Fourchette d'apport recommandée";
  return 'Fourchette de déficit recommandée';
}

export function warningText(m: Metrics): string {
  if (m.belowFloor) {
    return (
      'La fourchette théorique descend sous ' +
      m.floor.toLocaleString('fr-FR') +
      " kcal ; elle a été relevée à votre métabolisme de base. Un apport aussi bas ne devrait pas être suivi sans accompagnement d'un professionnel de santé."
    );
  }
  if (m.clamped || m.raised) {
    return 'La fourchette a été relevée à votre métabolisme de base : manger durablement moins que ce que votre corps consomme au repos dégrade la masse musculaire et le métabolisme.';
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
      { key: 'healthy', label: 'Haut du poids santé', sub: 'IMC 25', w: round1(24.9 * m2) },
      { key: 'mid', label: 'Milieu du poids santé', sub: 'IMC 22', w: round1(22 * m2) },
      { key: 'step', label: 'Première étape', sub: '−5 % de poids', w: round1(m.poids * 0.95) },
    ];
  }
  if (m.bmi < 18.5) {
    return [
      { key: 'healthy', label: 'Bas du poids santé', sub: 'IMC 18,5', w: round1(18.6 * m2) },
      { key: 'mid', label: 'Milieu du poids santé', sub: 'IMC 22', w: round1(22 * m2) },
      { key: 'step', label: 'Première étape', sub: '+5 % de poids', w: round1(m.poids * 1.05) },
    ];
  }
  return [
    { key: 'cut', label: 'Sèche légère', sub: '−5 % de poids', w: round1(m.poids * 0.95) },
    { key: 'stable', label: 'Poids stable', sub: 'recomposition', w: round1(m.poids) },
    { key: 'gain', label: 'Prise de masse', sub: '+5 % de poids', w: round1(m.poids * 1.05) },
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
    return "Projection linéaire à apport constant. En pratique la courbe s'aplatit : le métabolisme diminue avec le poids, il faut réévaluer les besoins tous les 4 à 5 kg.";
  }
  if (Math.abs(rate) < 0.03) {
    return "À l'apport recommandé actuel, le poids reste stable : aucune projection possible. Choisissez l'objectif sèche ou prise de masse pour créer un écart, ou visez le poids stable en recomposition.";
  }
  return "Le poids cible choisi va dans le sens opposé à votre objectif calorique. Ajustez l'un ou l'autre pour obtenir une projection.";
}

export interface PlanMove {
  label: string;
  detail: string;
  kcal: number;
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
  moves: PlanMove[];
  tips: string[];
}

export function buildPlan(m: Metrics, activity: number, goal: GoalKey): Plan {
  const share = MOVE_SHARES[activity];
  const gap = m.tdee - m.target;
  const isSurplus = gap < -20;

  const moves = MOVES.filter((mv) => mv.tags.includes(goal) || goal === 'maintien')
    .slice(0, activity <= 1 ? 5 : 4)
    .map((mv) => ({
      label: mv.label,
      detail: mv.detail,
      kcal: Math.round((mv.met * m.poids * mv.min) / 60 / 5) * 5,
    }));

  const movePct = Math.round(share * 100);

  return {
    title: goal === 'masse' ? 'Construire le surplus' : "Construire l'écart",
    note: planNote(goal, activity),
    hasSplit: gap > 20 || isSurplus,
    splitLabel: isSurplus ? 'Surplus quotidien à répartir' : 'Écart quotidien à répartir',
    moveLabel: isSurplus ? "Dépense d'entraînement" : 'Par le mouvement',
    foodLabel: isSurplus ? "En plus dans l'assiette" : "En moins dans l'assiette",
    moveKcal: Math.round(Math.abs(gap) * share),
    foodKcal: Math.round(Math.abs(gap) * (1 - share)),
    movePct,
    foodPct: 100 - movePct,
    moves,
    tips: NEAT[activity] ?? NEAT_ACTIVE,
  };
}

function planNote(goal: GoalKey, activity: number): string {
  if (goal === 'masse') {
    return "En prise de masse, l'exercice ne sert pas à creuser un écart mais à orienter le surplus vers le muscle : 3 à 4 séances de renforcement par semaine, progression en charge ou en répétitions.";
  }
  if (activity <= 1) {
    return (
      'Vous êtes ' +
      ACTIVITIES[activity].label.toLowerCase() +
      " : une partie de l'écart peut venir du mouvement plutôt que d'une restriction alimentaire supplémentaire. Casser la sédentarité augmente aussi la dépense sans fatigue notable."
    );
  }
  return "Votre niveau d'activité est déjà élevé : la majeure partie de l'écart doit venir de l'assiette, sinon la récupération et la performance se dégradent.";
}
