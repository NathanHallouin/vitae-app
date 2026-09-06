/**
 * Le cours : les seize notions, sorties des écrans de résultats et mises bout à bout.
 *
 * Rien n'est rédigé ici. Les textes sont ceux d'`explainers.ts`, verbatim — quatre chapitres de
 * quatre notions, écrits pour être lus dans l'ordre où les questions se posent. Ce module ne fait
 * que les aplatir, les numéroter et les relier, parce qu'ils avaient trois défauts tant qu'ils
 * vivaient repliés en bas de quatre écrans :
 *
 * — **ils n'étaient nulle part.** Une notion repliée n'a pas d'adresse : impossible d'y renvoyer
 *   depuis un encart, depuis un mot, ou depuis l'extérieur. Un slug par notion suffit à la rendre
 *   citable ;
 * — **ils se lisaient dans le désordre.** Quatre cartes indépendantes, chacune en pied d'écran :
 *   rien ne disait que la cinquième notion suit la quatrième. Le rang global le dit ;
 * — **ils n'étaient lus qu'une fois, ou jamais.** Sans trace de ce qui est lu, impossible de
 *   proposer la suite plutôt que de tout reproposer.
 *
 * Comme le reste de `packages/core`, ce module ne connaît ni le stockage ni le routeur : ce qui a
 * été lu lui est passé en paramètre, et les adresses qu'il rend sont des chaînes.
 */

import {
  ALIMENTATION_EXPLAINER,
  BOUGER_EXPLAINER,
  type Explainer,
  METABOLISME_EXPLAINER,
  POIDS_EXPLAINER,
} from './explainers';

/**
 * Les quatre chapitres, dans l'ordre du parcours.
 *
 * Le même ordre que les onglets, et ce n'est pas une coïncidence : les écrans suivent déjà la
 * chaîne causale — ce que le corps dépense, ce que ça change dans l'assiette, où cela mène, ce que
 * le mouvement peut prendre en charge. Le cours ne fait que la rendre lisible d'une traite.
 */
export const CHAPITRES: Explainer[] = [
  METABOLISME_EXPLAINER,
  ALIMENTATION_EXPLAINER,
  POIDS_EXPLAINER,
  BOUGER_EXPLAINER,
];

/** Une notion du cours : le texte d'origine, plus sa place dans l'ensemble. */
export interface Notion {
  slug: string;
  titre: string;
  resume: string;
  texte: string;
  /** le chapitre dont elle fait partie */
  chapitre: { slug: string; titre: string };
  /** l'écran de résultats où la notion s'applique */
  ecran: { href: string; label: string };
  /** rang global, de 1 à 16 : c'est lui qu'on affiche, pas le rang dans le chapitre */
  rang: number;
}

/**
 * Les seize notions à plat, du premier chapitre au dernier.
 *
 * Aplaties une fois au chargement du module plutôt qu'à chaque appel : la liste est figée à la
 * compilation, et trois écrans la parcourent.
 */
export const NOTIONS: Notion[] = CHAPITRES.flatMap((chapitre) =>
  chapitre.items.map((item) => ({
    slug: item.slug,
    titre: item.titre,
    resume: item.resume,
    texte: item.texte,
    chapitre: { slug: chapitre.slug, titre: chapitre.title },
    ecran: chapitre.ecran,
    rang: 0,
  })),
).map((notion, i) => ({ ...notion, rang: i + 1 }));

/** Le nombre de notions, écrit partout dans l'interface (« 4 sur 16 »). */
export const TOTAL_NOTIONS = NOTIONS.length;

export function notionParSlug(slug: string): Notion | null {
  return NOTIONS.find((n) => n.slug === slug) ?? null;
}

/** La notion d'après, ou `null` à la fin du cours — où il n'y a rien à promettre de plus. */
export function notionSuivante(slug: string): Notion | null {
  const rang = notionParSlug(slug)?.rang;
  if (rang === undefined) return null;
  return NOTIONS[rang] ?? null;
}

/**
 * La prochaine notion à proposer, compte tenu de ce qui a déjà été lu.
 *
 * **La première non lue, jamais un tirage au hasard.** Un cours qui propose une notion au hasard
 * n'est plus un cours : les seize se lisent dans un ordre, et sauter la cinquième pour lire la
 * douzième fait perdre ce que l'ordre apportait. Reprendre là où l'on s'est arrêté est aussi la
 * seule proposition qu'on n'a pas à expliquer.
 *
 * `null` quand tout est lu : l'encart de progression disparaît alors, plutôt que de féliciter.
 */
export function prochaineNotion(lues: readonly string[]): Notion | null {
  const dejaLues = new Set(lues);
  return NOTIONS.find((n) => !dejaLues.has(n.slug)) ?? null;
}

/** Combien de notions ont été lues, en ignorant les identifiants devenus inconnus. */
export function nombreDeLues(lues: readonly string[]): number {
  const connues = new Set(NOTIONS.map((n) => n.slug));
  return new Set(lues.filter((slug) => connues.has(slug))).size;
}

/**
 * Ce qu'un drapeau du métier donne à expliquer.
 *
 * C'est la table qui relie les écrans au cours, et elle n'invente rien : chacune de ces situations
 * est déjà calculée quelque part — une fourchette relevée, un rythme trop rapide, un poids qui
 * date. Un encart n'apparaît donc que lorsqu'il y a réellement quelque chose à expliquer, ce qui
 * est la seule façon qu'il ne devienne pas un décor qu'on apprend à ignorer.
 *
 * Les clés sont les noms des drapeaux tels que le métier les nomme, pour qu'un `grep` mène de
 * l'un à l'autre.
 */
export const NOTION_PAR_DRAPEAU = {
  /** `clamped`, `raised` ou `belowFloor` : la fourchette a été remontée */
  fourchetteRelevee: 'pourquoi-une-fourchette',
  /** `proteinBasisNote` calcule sur un poids de référence : IMC ≥ 30 */
  proteinesAjustees: 'les-proteines-d-abord',
  /** `rateAssessment` ne rend pas « bon » : le rythme visé est trop rapide ou trop lent */
  rythmeInhabituel: 'le-palier',
  /** la tendance constatée s'écarte du rythme prévu */
  tendanceEcartee: 'la-balance-varie',
  /** `isWeightStale` : le poids enregistré date de plus d'une semaine */
  poidsPerime: 'refaire-le-calcul',
  /** la bande d'IMC n'est pas « Corpulence normale » */
  imcHorsNorme: 'ce-que-l-imc-ne-dit-pas',
  /** `daily >= 3` : un métier physique, où l'écart ne peut plus venir du mouvement */
  quotidienSature: 'ne-pas-tout-additionner',
} as const;

export type Drapeau = keyof typeof NOTION_PAR_DRAPEAU;

/**
 * Pourquoi l'encart est là, en une ligne.
 *
 * C'est la **seule** chose qui distingue deux encarts à l'écran : ils ont la même forme, le même
 * fond, la même pastille, le même bouton. On doit reconnaître au premier coup d'œil « ceci
 * explique, ceci ne demande rien » — et lire ensuite pourquoi celui-ci s'est montré.
 *
 * Toutes commencent par « Parce que » : ce sont des réponses à la question que l'encart provoque.
 */
export const CONTEXTE_PAR_DRAPEAU: Record<Drapeau, string> = {
  fourchetteRelevee: 'Parce que votre minimum a été relevé',
  proteinesAjustees: 'Parce que vos protéines sont calculées sur un poids de référence',
  rythmeInhabituel: 'Parce que le rythme visé sort de la zone habituelle',
  tendanceEcartee: 'Parce que votre rythme diverge du plan',
  poidsPerime: 'Parce que votre poids date de plus d’une semaine',
  imcHorsNorme: 'Parce que votre IMC sort de la bande dite normale',
  quotidienSature: 'Parce que votre quotidien vous fait déjà beaucoup bouger',
};

/** Ce que dit l'encart quand aucun drapeau n'est levé : il propose simplement la suite. */
export const CONTEXTE_PROGRESSION = 'La suite de votre lecture';

/**
 * Quels drapeaux chaque écran peut lever, **dans l'ordre de priorité**.
 *
 * Un seul encart par écran, sans exception : deux blocs de même forme l'un sous l'autre cessent
 * d'être des exceptions et deviennent un décor. Quand deux drapeaux sont levés en même temps,
 * c'est le premier de cette liste qui gagne — et l'ordre n'est pas arbitraire, il va du plus
 * inattendu au plus général.
 */
export const DRAPEAUX_PAR_ECRAN: Record<string, Drapeau[]> = {
  '/metabolisme': ['imcHorsNorme'],
  '/alimentation': ['fourchetteRelevee', 'proteinesAjustees'],
  '/poids': ['tendanceEcartee', 'rythmeInhabituel', 'poidsPerime'],
  '/bouger': ['quotidienSature'],
};

/** Ce qu'un écran a de particulier à expliquer aujourd'hui : une notion, et pourquoi elle. */
export interface EncartDeclenche {
  notion: Notion;
  contexte: string;
  /**
   * Ce qui a fait apparaître l'encart.
   *
   * Rendu explicitement, et c'est le correctif d'un défaut réel : l'écran recalculait cette
   * distinction de son côté, en regardant si **un** drapeau était levé — n'importe lequel, y
   * compris ceux d'un autre écran. Un poids vieux de huit jours suffisait donc à faire disparaître
   * « Plus tard » de l'écran du métabolisme, où ce drapeau n'est pas consulté.
   *
   * La règle et son résultat vivent désormais au même endroit. Un appelant qui a besoin de savoir
   * lequel des deux cas s'est produit le lit, il ne le devine plus.
   */
  source: 'drapeau' | 'progression';
}

/**
 * L'encart d'un écran, drapeaux d'abord, suite du cours à défaut.
 *
 * La règle tient en trois lignes et elle est la même partout : si le métier a quelque chose à
 * expliquer **sur votre cas**, c'est cela qui se montre ; sinon, la prochaine notion non lue ;
 * sinon rien, parce que les seize ont été lues et qu'il n'y a plus rien à proposer.
 *
 * Une notion déjà lue ne rejoue pas le drapeau : la relire ne servirait à rien, et un encart qui
 * revient après qu'on l'a suivi apprend qu'on peut l'ignorer.
 */
export function encartDeLEcran(
  ecran: string,
  drapeaux: Partial<Record<Drapeau, boolean>>,
  lues: readonly string[],
): EncartDeclenche | null {
  const dejaLues = new Set(lues);

  for (const drapeau of DRAPEAUX_PAR_ECRAN[ecran] ?? []) {
    if (!drapeaux[drapeau]) continue;
    const notion = notionParSlug(NOTION_PAR_DRAPEAU[drapeau]);
    if (notion && !dejaLues.has(notion.slug)) {
      return { notion, contexte: CONTEXTE_PAR_DRAPEAU[drapeau], source: 'drapeau' };
    }
  }

  const suite = prochaineNotion(lues);
  return suite ? { notion: suite, contexte: CONTEXTE_PROGRESSION, source: 'progression' } : null;
}

/** L'adresse publique d'une notion. Une seule écriture, pour que le cours ne se renomme qu'ici. */
export function routeNotion(slug: string): string {
  return `/comprendre/${slug}`;
}

export const ROUTE_COURS = '/comprendre';
