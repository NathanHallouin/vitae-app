/**
 * Données de référence du calculateur.
 * Les valeurs numériques viennent de la maquette (`maquette/Calculateur MB.dc.html`).
 * Les libellés ont été réécrits en langage courant : le terme technique est conservé en
 * second plan (`detail`) pour ceux qui le connaissent.
 */

import type { IconName } from '@/components/ui/Icon';

export type GoalKey = 'seche' | 'recomp' | 'masse' | 'maintien';
export type Sexe = '' | 'femme' | 'homme';

/** Mouvement du quotidien, hors sport : le NEAT. */
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

/**
 * Une brique de mouvement du quotidien : du NEAT, pas une séance.
 * Ce qui la distingue : elle ne demande ni tenue, ni créneau, ni récupération, et elle se répète
 * tous les jours. C'est ce cumul quotidien qui pèse sur la dépense, pas son intensité.
 */
export interface NeatAction {
  label: string;
  detail: string;
  /** équivalent métabolique */
  met: number;
  /** durée en minutes, sur une journée */
  min: number;
  /** indices de `DAILY` auxquels le conseil s'adresse : inutile de faire marcher un livreur */
  daily: number[];
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
    desc: 'Commerce, enseignement, soin, service : rarement assis',
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
 * trois ou quatre séances, soit de l'ordre de +0,10 sur le facteur, pas +0,35.
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

/**
 * Le catalogue NEAT. Aucun exercice ici : ce sont des gestes du quotidien, à répéter tous les
 * jours, y compris les jours de séance. Les MET viennent du Compendium of Physical Activities.
 */
export const NEAT_ACTIONS: NeatAction[] = [
  {
    label: 'Marcher 30 min de plus dans la journée',
    detail: 'En une fois ou en trois : descendre un arrêt plus tôt, faire le tour du pâté à midi.',
    met: 4.3,
    min: 30,
    daily: [0, 1, 2],
  },
  {
    label: 'Se lever 3 min par heure',
    detail: 'Huit fois dans une journée de bureau. C’est ce qui casse le mieux la sédentarité.',
    met: 2,
    min: 24,
    daily: [0, 1],
  },
  {
    label: 'Prendre les escaliers, 10 min cumulées',
    detail: 'Réparti sur la journée, à la place de l’ascenseur ou de l’escalator.',
    met: 8,
    min: 10,
    daily: [0, 1, 2],
  },
  {
    label: 'Passer les appels debout ou en marchant',
    detail: 'Debout, vous dépensez environ 50 % de plus qu’assis, sans effort perçu.',
    met: 2.5,
    min: 30,
    daily: [0, 1],
  },
  {
    label: 'Faire les trajets courts à vélo',
    detail: 'Moins de 3 km : à cette distance, le vélo va souvent aussi vite que la voiture.',
    met: 6.8,
    min: 20,
    daily: [0, 1, 2],
  },
  {
    label: 'Ménage, courses, jardinage',
    detail: 'Compté nulle part et pourtant bien réel : porter, monter, ranger, pousser.',
    met: 3.5,
    min: 30,
    daily: [0, 1, 2, 3],
  },
  {
    label: 'Une marche de 15 min après le repas',
    detail: 'Aide en plus à faire redescendre la glycémie après un repas copieux.',
    met: 3.5,
    min: 15,
    daily: [1, 2, 3],
  },
];

/**
 * Conseils NEAT par niveau de mouvement quotidien, indexés sur `DAILY` seul.
 * Le nombre de séances n'entre pas ici : s'entraîner cinq fois par semaine ne change rien au fait
 * de rester assis les vingt-trois autres heures.
 */
export const NEAT_TIPS: Record<number, string[]> = {
  0: [
    'Commencez par le temps assis, pas par le sport : une pause debout par heure change davantage votre dépense qu’une séance ajoutée.',
    'Visez 7 000 à 8 000 pas par jour avant d’augmenter le volume d’entraînement.',
    'Placez le mouvement dans des trajets déjà existants : c’est ce qui tient dans le temps.',
  ],
  1: [
    'Vous avez déjà l’habitude de marcher : la marge est dans les journées de bureau, pas dans les week-ends.',
    'Portez vos pas à 9 000 par jour, y compris les jours de séance.',
    'Une pause active toutes les 90 min suffit à couper les longues assises.',
  ],
  2: [
    'Votre métier vous fait déjà bouger : inutile d’en rajouter, protégez plutôt cette base les jours de repos.',
    'Maintenez 9 000 à 10 000 pas les jours sans travail : c’est là que le NEAT s’effondre.',
    'Debout longtemps n’est pas dépenser beaucoup : gardez de la marche franche dans la journée.',
  ],
  3: [
    'Votre NEAT est déjà élevé : il n’y a rien à y gagner de plus, et beaucoup à perdre en fatigue.',
    'L’écart doit venir de l’assiette, pas d’un mouvement supplémentaire.',
    'Surveillez le sommeil : une nuit courte fait chuter la dépense du lendemain, séance ou pas.',
  ],
};

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
