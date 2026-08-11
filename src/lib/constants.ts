/**
 * Données de référence du calculateur.
 * Les valeurs numériques viennent de la maquette (`maquette/Calculateur MB.dc.html`).
 * Les libellés ont été réécrits en langage courant : le terme technique est conservé en
 * second plan (`detail`) pour ceux qui le connaissent.
 */

import type { IconName } from '@/components/ui/Icon';

export type GoalKey = 'seche' | 'recomp' | 'masse' | 'maintien';
export type Sexe = '' | 'femme' | 'homme';

/** Mouvement du quotidien, hors sport — le NEAT. */
export interface Daily {
  label: string;
  desc: string;
  /** facteur d'activité de base, sport exclu */
  base: number;
  icon: IconName;
}

/** Volume d'entraînement, en plus du quotidien. */
export interface Sessions {
  label: string;
  desc: string;
  /** ce que ces séances ajoutent au facteur de base */
  add: number;
  /** nombre de séances représenté, pour les plans d'entraînement */
  perWeek: number;
  icon: IconName;
}

export interface Goal {
  key: GoalKey;
  /** formulé en langage courant : « Perdre du gras » plutôt que « Sèche » */
  label: string;
  desc: string;
  /** terme technique et écart en pourcentage, en petit */
  detail: string;
  /** multiplicateur de DET pour la borne basse */
  min: number;
  /** multiplicateur de DET pour la borne haute */
  max: number;
  /** multiplicateur de DET pour l'apport recommandé */
  rec: number;
  /** protéines en g par kg de poids de corps */
  prot: number;
  note: string;
  icon: IconName;
}

export interface BmiBand {
  max: number;
  label: string;
  color: string;
}

export interface Move {
  label: string;
  detail: string;
  /** équivalent métabolique */
  met: number;
  /** durée en minutes */
  min: number;
  tags: GoalKey[];
}

/**
 * L'activité est saisie sur deux axes plutôt qu'un seul, parce qu'ils ne varient pas ensemble :
 * on peut marcher 1 h par jour pour aller travailler sans faire de sport, ou s'entraîner cinq fois
 * par semaine et rester assis le reste du temps. Le NEAT est d'ailleurs la source de variation la
 * plus large entre deux personnes de même gabarit.
 */
export const DAILY: Daily[] = [
  {
    label: 'Assis toute la journée',
    icon: 'bureau',
    desc: 'Bureau, trajets en voiture ou assis, peu de marche',
    base: 1.2,
  },
  {
    label: 'Assis, mais je marche',
    icon: 'marche',
    desc: 'Trajets à pied ou à vélo, courses, escaliers',
    base: 1.3,
  },
  {
    label: 'Debout ou en mouvement',
    icon: 'debout',
    desc: 'Commerce, enseignement, soin, service — rarement assis',
    base: 1.45,
  },
  {
    label: 'Travail physique',
    icon: 'caisse',
    desc: 'Manutention, bâtiment, agriculture, livraison',
    base: 1.6,
  },
];

/**
 * Les incréments sont volontairement plus bas que ceux des tables classiques : une séance d'une
 * heure dépense 300 à 400 kcal, soit 150 à 200 kcal par jour une fois lissée sur la semaine pour
 * trois ou quatre séances — de l'ordre de +0,10 sur le facteur, pas +0,35.
 */
export const SESSIONS: Sessions[] = [
  { label: 'Jamais', desc: 'Aucune séance dédiée', add: 0, perWeek: 0, icon: 'aucun' },
  {
    label: '1 à 2 séances',
    desc: 'Environ une heure en tout',
    add: 0.05,
    perWeek: 1.5,
    icon: 'haltere',
  },
  {
    label: '3 à 4 séances',
    desc: 'Trois à quatre heures par semaine',
    add: 0.12,
    perWeek: 3.5,
    icon: 'haltere',
  },
  {
    label: '5 à 6 séances',
    desc: 'Presque tous les jours',
    add: 0.19,
    perWeek: 5.5,
    icon: 'haltere',
  },
  {
    label: '7 ou plus',
    desc: 'Tous les jours, ou deux fois par jour',
    add: 0.26,
    perWeek: 7,
    icon: 'haltere',
  },
];

/** Facteur d'activité complet : mouvement du quotidien + entraînement. */
export function activityFactor(daily: number, sessions: number): number {
  const base = (DAILY[daily] ?? DAILY[0]).base;
  const add = (SESSIONS[sessions] ?? SESSIONS[0]).add;
  // Arrondi au centième : évite `1.4300000000000002` dans l'affichage et les tests.
  return Math.round((base + add) * 100) / 100;
}

/**
 * Ramène les deux axes à un niveau global 0..4, pour les contenus qui dépendent de la dépense
 * totale et non d'un axe en particulier (répartition assiette / mouvement, ton des conseils).
 */
export function activityLevel(daily: number, sessions: number): number {
  const f = activityFactor(daily, sessions);
  if (f < 1.28) return 0;
  if (f < 1.4) return 1;
  if (f < 1.55) return 2;
  if (f < 1.7) return 3;
  return 4;
}

/** Résumé d'une ligne, pour les rappels de profil. */
export function activityLabel(daily: number, sessions: number): string {
  const d = (DAILY[daily] ?? DAILY[0]).label.toLowerCase();
  const s = SESSIONS[sessions] ?? SESSIONS[0];
  return s.perWeek === 0 ? `${d}, sans sport` : `${d}, ${s.label.toLowerCase()} par semaine`;
}

export const GOALS: Goal[] = [
  {
    key: 'seche',
    icon: 'flecheBas',
    label: 'Perdre du gras',
    desc: 'Manger un peu moins que ce que vous dépensez',
    detail: 'aussi appelé « sèche » · −10 à −25 %',
    min: 0.75,
    max: 0.9,
    rec: 0.82,
    prot: 2.0,
    note: 'Vous perdez de la graisse sans perdre vos muscles. Ne descendez pas sous la fourchette : si vous mangez trop peu, le corps puise dans le muscle et la faim devient vite ingérable.',
  },
  {
    key: 'recomp',
    icon: 'flechesOpposees',
    label: 'Perdre du gras et prendre du muscle',
    desc: 'Manger à peu près ce que vous dépensez',
    detail: 'recomposition corporelle · −5 à +5 %',
    min: 0.95,
    max: 1.05,
    rec: 1.0,
    prot: 1.8,
    note: "Vous mangez à peu près ce que vous dépensez : la graisse baisse pendant que le muscle monte. Cela marche surtout quand on débute la musculation ou qu'on reprend après une longue pause, à condition de manger beaucoup de protéines.",
  },
  {
    key: 'masse',
    icon: 'flecheHaut',
    label: 'Prendre du muscle',
    desc: 'Manger un peu plus que ce que vous dépensez',
    detail: 'prise de masse · +5 à +15 %',
    min: 1.05,
    max: 1.15,
    rec: 1.1,
    prot: 1.8,
    note: 'Un surplus modéré suffit à construire du muscle. Au-delà de 15 %, le gain supplémentaire est essentiellement du gras.',
  },
  {
    key: 'maintien',
    icon: 'egal',
    label: 'Rester à mon poids',
    desc: 'Manger autant que ce que vous dépensez',
    detail: 'maintien · aucun écart',
    min: 0.97,
    max: 1.03,
    rec: 1.0,
    prot: 1.4,
    note: "Votre poids devrait rester stable à ce niveau d'apport, à activité constante.",
  },
];

export const BMI_BANDS: BmiBand[] = [
  { max: 18.5, label: 'Insuffisance pondérale', color: '#3a6ea5' },
  { max: 25, label: 'Corpulence normale', color: '#2e7d54' },
  { max: 30, label: 'Surpoids', color: '#b06f10' },
  { max: 35, label: 'Obésité modérée', color: '#b4551c' },
  { max: 40, label: 'Obésité sévère', color: '#9e3b23' },
  { max: 999, label: 'Obésité massive', color: '#7d2a1c' },
];

/** Les 4 segments affichés sur la jauge (les bandes d'obésité sont regroupées en « > 30 »). */
export const BMI_GAUGE_LABELS = ['< 18,5', '18,5 – 25', '25 – 30', '> 30'];

export const MOVES: Move[] = [
  {
    label: '3 × 15 squats au poids du corps',
    detail: 'Le plus rentable : les cuisses et les fessiers sont vos plus gros muscles.',
    met: 5,
    min: 6,
    tags: ['seche', 'recomp', 'masse'],
  },
  {
    label: '3 × 12 fentes par jambe',
    detail: "Sollicite l'équilibre et complète les squats.",
    met: 5,
    min: 7,
    tags: ['seche', 'recomp', 'masse'],
  },
  {
    label: '3 × 10 pompes',
    detail: "Genoux au sol si besoin, l'important est l'amplitude complète.",
    met: 3.8,
    min: 5,
    tags: ['seche', 'recomp', 'masse'],
  },
  {
    label: '3 × 45 s de gainage',
    detail: 'Protège le dos, indispensable quand on est assis toute la journée.',
    met: 3,
    min: 4,
    tags: ['seche', 'recomp', 'masse'],
  },
  {
    label: "10 min de montées d'escaliers",
    detail: "À la place de l'ascenseur, fractionné dans la journée.",
    met: 8,
    min: 10,
    tags: ['seche', 'recomp'],
  },
  {
    label: '30 min de marche rapide',
    detail: 'Le pilier du déficit : peu fatigant, facile à répéter tous les jours.',
    met: 4.3,
    min: 30,
    tags: ['seche', 'recomp'],
  },
  {
    label: '10 min de corde à sauter ou burpees',
    detail: 'Option courte et intense les jours sans temps.',
    met: 11,
    min: 10,
    tags: ['seche'],
  },
];

/** Conseils anti-sédentarité par niveau d'activité (0 et 1 ; ≥ 2 utilise NEAT_ACTIVE). */
export const NEAT: Record<number, string[]> = {
  0: [
    'Levez-vous 3 min par heure : 8 fois par jour, cela représente à peu près 100 kcal sans y penser.',
    "Visez 7 000 à 8 000 pas quotidiens avant d'ajouter des séances.",
    'Prenez les appels debout ou en marchant.',
  ],
  1: [
    'Ajoutez une séance de renforcement par semaine à ce que vous faites déjà.',
    'Portez vos pas à 9 000 par jour les jours sans entraînement.',
    'Étirez le temps assis : une pause active toutes les 90 min.',
  ],
};

export const NEAT_ACTIVE: string[] = [
  "Vous bougez déjà beaucoup : l'écart doit venir surtout de l'assiette, pas d'un volume d'entraînement supplémentaire.",
  'Gardez 2 séances de renforcement par semaine pour protéger le muscle.',
  'Surveillez la récupération : un sommeil court fait chuter la dépense quotidienne.',
];

/** Part de l'écart calorique attribuée au mouvement, par niveau d'activité. */
export const MOVE_SHARES = [0.45, 0.35, 0.25, 0.15, 0.1];

/** Plancher calorique de sécurité, en kcal. */
export const FLOORS = { homme: 1500, femme: 1200 } as const;

export const BENEFITS = [
  {
    n: '1',
    icon: 'flamme' as IconName,
    title: 'Ce que vous brûlez au repos',
    desc: 'L’énergie que votre corps consomme sans rien faire.',
  },
  {
    n: '2',
    icon: 'eclair' as IconName,
    title: 'Ce que vous brûlez en tout',
    desc: 'En comptant votre travail, vos déplacements et votre sport.',
  },
  {
    n: '3',
    icon: 'silhouette' as IconName,
    title: 'Votre corpulence',
    desc: 'Où vous vous situez et le poids conseillé pour votre taille.',
  },
  {
    n: '4',
    icon: 'assiette' as IconName,
    title: 'Combien manger',
    desc: 'Entre combien et combien, selon votre objectif, avec la répartition.',
  },
];

export const STEP_TITLES = ['Vous êtes', 'Vos mesures', 'Vous bougez', 'Votre objectif'];

export function goalByKey(key: GoalKey): Goal {
  return GOALS.find((g) => g.key === key) ?? GOALS[3];
}
