/**
 * Données de référence du calculateur.
 * Valeurs et libellés repris à l'identique de la maquette (`maquette/Calculateur MB.dc.html`).
 */

export type GoalKey = 'seche' | 'recomp' | 'masse' | 'maintien';
export type Sexe = '' | 'femme' | 'homme';

export interface Activity {
  label: string;
  desc: string;
  factor: number;
}

export interface Goal {
  key: GoalKey;
  label: string;
  desc: string;
  /** multiplicateur de DET pour la borne basse */
  min: number;
  /** multiplicateur de DET pour la borne haute */
  max: number;
  /** multiplicateur de DET pour l'apport recommandé */
  rec: number;
  /** protéines en g par kg de poids de corps */
  prot: number;
  note: string;
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

export const ACTIVITIES: Activity[] = [
  { label: 'Sédentaire', desc: 'Travail assis, pas de sport', factor: 1.2 },
  { label: 'Légèrement actif', desc: '1 à 3 séances par semaine', factor: 1.375 },
  { label: 'Modérément actif', desc: '3 à 5 séances par semaine', factor: 1.55 },
  { label: 'Très actif', desc: '6 à 7 séances par semaine', factor: 1.725 },
  { label: 'Extrêmement actif', desc: 'Travail physique ou double entraînement', factor: 1.9 },
];

export const GOALS: Goal[] = [
  {
    key: 'seche',
    label: 'Sèche',
    desc: 'Déficit de 10 à 25 %',
    min: 0.75,
    max: 0.9,
    rec: 0.82,
    prot: 2.0,
    note: "Perdre du gras en conservant le muscle. Restez dans la fourchette : au-delà de 25 % de déficit, la perte de masse musculaire s'accélère et l'adhérence chute.",
  },
  {
    key: 'recomp',
    label: 'Recomposition corporelle',
    desc: 'De −5 % à +5 %',
    min: 0.95,
    max: 1.05,
    rec: 1.0,
    prot: 1.8,
    note: "Perdre du gras et gagner du muscle simultanément, autour du niveau d'équilibre. Fonctionne surtout chez les débutants et après une longue pause, avec un apport protéique élevé.",
  },
  {
    key: 'masse',
    label: 'Prise de masse',
    desc: 'Surplus de 5 à 15 %',
    min: 1.05,
    max: 1.15,
    rec: 1.1,
    prot: 1.8,
    note: 'Un surplus modéré suffit à construire du muscle. Au-delà de 15 %, le gain supplémentaire est essentiellement du gras.',
  },
  {
    key: 'maintien',
    label: 'Maintien',
    desc: 'Aucun écart',
    min: 0.97,
    max: 1.03,
    rec: 1.0,
    prot: 1.4,
    note: "Votre poids devrait rester stable à ce niveau d'apport, à activité constante.",
  },
];

export const BMI_BANDS: BmiBand[] = [
  { max: 18.5, label: 'Insuffisance pondérale', color: '#0288d1' },
  { max: 25, label: 'Corpulence normale', color: '#2e7d32' },
  { max: 30, label: 'Surpoids', color: '#f9a825' },
  { max: 35, label: 'Obésité modérée', color: '#ef6c00' },
  { max: 40, label: 'Obésité sévère', color: '#d84315' },
  { max: 999, label: 'Obésité massive', color: '#b71c1c' },
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
  { n: '1', title: 'Métabolisme de base', desc: 'Vos calories au repos, formule Mifflin-St Jeor.' },
  { n: '2', title: 'Dépense énergétique totale', desc: "Ajustée à votre niveau d'activité réel." },
  {
    n: '3',
    title: 'IMC et poids santé',
    desc: "Votre corpulence et l'intervalle de poids correspondant.",
  },
  {
    n: '4',
    title: "Fourchette d'apport",
    desc: "Déficit ou surplus minimum et maximum selon l'objectif, avec les macros.",
  },
];

export const STEP_TITLES = ['Parlons de vous', 'Vos mesures', 'Votre activité', 'Votre objectif'];

export const MACRO_COLORS = { fat: '#f9a825', carb: '#00897b' } as const;

/** Repère visuel de la DET sur la barre de fourchette. */
export const TDEE_MARKER_COLOR = '#90a4ae';

export function goalByKey(key: GoalKey): Goal {
  return GOALS.find((g) => g.key === key) ?? GOALS[3];
}
