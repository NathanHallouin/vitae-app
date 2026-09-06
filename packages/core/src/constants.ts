/**
 * Données de référence du calculateur.
 * Les valeurs numériques viennent de la maquette (`maquette/Calculateur MB.dc.html`).
 * Les libellés ont été réécrits en langage courant : le terme technique est conservé en
 * second plan (`detail`) pour ceux qui le connaissent.
 */

import type { IconName } from './icons';

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
  /**
   * Le pictogramme du geste.
   *
   * Il ne décore pas : dans une liste de sept lignes qui se ressemblent toutes, c'est lui qu'on
   * retrouve du regard, avant d'avoir relu le libellé.
   */
  icon: IconName;
  /**
   * Pourquoi ce geste marche, en deux phrases.
   *
   * Séparé de `comment` parce que ce sont deux questions distinctes, et qu'on ne se les pose pas
   * en même temps : la première décide d'essayer, la seconde se lit au moment de s'y mettre. Les
   * deux vivent derrière « En savoir plus », le geste et son ordre de grandeur suffisant à décider.
   */
  pourquoi: string;
  /** Comment s'y prendre, concrètement. */
  comment: string;
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

/**
 * Les graduations de l'axe d'IMC : les bornes des quatre segments de `bmiGaugePosition`.
 *
 * Des bornes et non des noms de bandes depuis la refonte. Les quatre libellés « < 18,5 » ·
 * « 18,5 – 25 » · « 25 – 30 » · « > 30 » nommaient chacun un segment, ce qui obligeait à les
 * centrer sous lui ; alignés aux extrémités, ils désignaient le mauvais. Cinq bornes se posent aux
 * limites, là où l'axe change de sens, et la bande saine est marquée sur l'axe lui-même plutôt que
 * répétée en toutes lettres.
 */
export const BMI_GAUGE_LABELS = ['15', '18,5', '25', '30', '40'];

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
    icon: 'marche',
    pourquoi:
      'La marche est le seul mouvement que le corps accepte tous les jours sans jamais réclamer de récupération. Trente minutes de plus, c’est aussi environ 3 000 pas — l’écart exact entre une journée assise et une journée ordinaire.',
    comment:
      'Ne cherchez pas un créneau : accrochez la marche à un trajet qui existe déjà. Descendre un arrêt plus tôt le matin et le soir suffit à faire les trente minutes, sans rien ajouter à l’emploi du temps. Le rythme importe peu, la régularité fait tout.',
  },
  {
    label: 'Se lever 3 min par heure',
    detail: 'Huit fois dans une journée de bureau. C’est ce qui casse le mieux la sédentarité.',
    met: 2,
    min: 24,
    daily: [0, 1],
    icon: 'debout',
    pourquoi:
      'Rester assis d’affilée fait chuter l’activité des enzymes qui traitent les graisses du sang, et la marche du soir ne rattrape pas complètement une journée immobile. Ce qui compte ici est le nombre de ruptures, pas leur durée.',
    comment:
      'Trois minutes suffisent : aller chercher un verre d’eau, faire un aller-retour dans le couloir, rester debout le temps d’un message. Un rappel discret y aide plus que la volonté — c’est exactement ce que règle « Me rappeler de bouger », dans les réglages.',
  },
  {
    label: 'Prendre les escaliers, 10 min cumulées',
    detail: 'Réparti sur la journée, à la place de l’ascenseur ou de l’escalator.',
    met: 8,
    min: 10,
    daily: [0, 1, 2],
    icon: 'escalier',
    pourquoi:
      'C’est le geste le plus dense du quotidien : à intensité, monter des marches vaut presque le double de la marche rapide. Dix minutes cumulées pèsent donc autant qu’une demi-heure de marche, et sollicitent en plus les cuisses et les fessiers.',
    comment:
      'Inutile de tout monter à pied le premier jour : prenez l’ascenseur trois étages plus bas que votre destination, et montez le reste. La descente compte aussi, moins en dépense mais beaucoup pour les articulations, qui apprennent à encaisser.',
  },
  {
    label: 'Passer les appels debout ou en marchant',
    detail: 'Debout, vous dépensez environ 50 % de plus qu’assis, sans effort perçu.',
    met: 2.5,
    min: 30,
    daily: [0, 1],
    icon: 'telephone',
    pourquoi:
      'Debout, les grands muscles des jambes travaillent en continu pour vous tenir : la dépense monte d’environ la moitié sans que l’effort se ressente. Sur une journée d’appels, l’écart se compte en dizaines de kilocalories, tous les jours.',
    comment:
      'Levez-vous à la sonnerie, avant de décrocher : le geste se prend en trois jours s’il est lié au déclencheur. En visioconférence sans caméra, marchez ; caméra allumée, restez debout, ce qui améliore au passage le souffle et la voix.',
  },
  {
    label: 'Faire les trajets courts à vélo',
    detail: 'Moins de 3 km : à cette distance, le vélo va souvent aussi vite que la voiture.',
    met: 6.8,
    min: 20,
    daily: [0, 1, 2],
    icon: 'velo',
    pourquoi:
      'Un trajet à vélo remplace un trajet immobile : la dépense n’est pas ajoutée à la journée, elle prend la place de zéro. Et sous trois kilomètres en ville, le temps de porte à porte est le même qu’en voiture, stationnement compris.',
    comment:
      'Commencez par le trajet que vous faites le plus souvent, pas par le plus long. Un vélo qui dort à la cave ne sert jamais : rangez-le là où vous passez, et laissez le casque avec.',
  },
  {
    label: 'Ménage, courses, jardinage',
    detail: 'Compté nulle part et pourtant bien réel : porter, monter, ranger, pousser.',
    met: 3.5,
    min: 30,
    daily: [0, 1, 2, 3],
    icon: 'menage',
    pourquoi:
      'Ce sont les heures que personne ne compte comme du mouvement, et elles pèsent pourtant autant qu’une marche soutenue. Porter et pousser y ajoutent une charge que la marche seule n’a pas.',
    comment:
      'Rien à ajouter à votre semaine : il s’agit de reconnaître ce qui s’y trouve déjà, et de ne pas l’optimiser. Faire deux voyages plutôt qu’un, étendre le linge plutôt que le sécher en machine, aller aux courses à pied.',
  },
  {
    label: 'Une marche de 15 min après le repas',
    detail: 'Aide en plus à faire redescendre la glycémie après un repas copieux.',
    met: 3.5,
    min: 15,
    daily: [1, 2, 3],
    icon: 'assiette',
    pourquoi:
      'Les muscles qui travaillent captent le sucre du sang sans passer par l’insuline : quinze minutes de marche après un repas écrêtent nettement le pic de glycémie qui suit. C’est le même mouvement qu’ailleurs dans la journée, mais placé au moment où il rend le plus.',
    comment:
      'Dans l’heure qui suit le repas, pas avant. Une allure de promenade suffit — l’objectif n’est pas l’essoufflement. Le tour du quartier, le trajet vers le café d’après, ou le retour au bureau à pied font l’affaire.',
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

/**
 * Ce que dit l'écran quand aucun profil n'est enregistré.
 *
 * C'est le seul état vide de l'application, et il est le même sur les quatre écrans de résultats :
 * `quoi` seul change, et vient de l'écran. Les trois autres phrases vivent ici plutôt que dans le
 * composant, comme toute copie d'interface — c'est ce qui les rend corrigeables à un endroit.
 *
 * `surtitre` et `valeur` sont ce que porte le cadran vide. Un tiret plutôt qu'un zéro : zéro est
 * une valeur, et celle-là serait fausse.
 */
export const ETAT_VIDE = {
  surtitre: 'Rien à afficher',
  valeur: '—',
  action: 'Répondre aux 4 questions',
  duree: 'Environ une minute.',
  /** ce qui suit le `quoi` de l'écran, et qui ne dépend pas de lui */
  suite:
    'demande quatre réponses. Rien n’est envoyé nulle part, et vous pouvez tout effacer d’un bouton.',
  /**
   * Ce que chaque écran de résultats n'a pas pu calculer.
   *
   * Des groupes nominaux, et non des phrases : ils sont suivis de `suite`, et « Combien manger
   * chaque jour demande quatre réponses » ne se dit pas. C'est aussi ce qui permet de les relire
   * les uns à la suite des autres pour vérifier qu'ils annoncent bien quatre choses différentes.
   */
  quoi: {
    metabolisme: 'Le calcul de votre métabolisme et de votre dépense sur une journée',
    alimentation: 'Le calcul de ce que vous pouvez manger, et de la répartition de ces calories',
    poids: 'Le calcul du poids que vous pourriez viser, et du temps qu’il demanderait',
    bouger:
      'Le calcul de la part de l’écart que le mouvement peut prendre en charge, et de votre programme',
  },
} as const;

export function goalByKey(key: GoalKey): Goal {
  return GOALS.find((g) => g.key === key) ?? GOALS[3];
}
