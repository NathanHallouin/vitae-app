/**
 * Chercher et filtrer dans le catalogue de recettes.
 *
 * Soixante-deux recettes ne se parcourent plus à l'œil. Ce module répond à la seule question que se
 * pose quelqu'un devant la liste : « qu'est-ce que je peux faire, là, maintenant, avec ce que j'ai
 * et le temps que j'ai ».
 *
 * Tout est pur et synchrone : le catalogue est déjà en mémoire, compilé à la construction. Il n'y a
 * ni index à charger ni requête à faire, et la liste se recalcule à chaque frappe sans que cela se
 * voie.
 */

import { type Exclusion, respecteExclusions } from '@vitae/core/recipes';
import type { Recipe, RecipeMeta } from './types';

export type Moment = RecipeMeta['moment'];

export const MOMENTS: { key: Moment; label: string }[] = [
  { key: 'matin', label: 'Petit-déjeuner' },
  { key: 'plat', label: 'Plat' },
];

/**
 * Les durées proposées.
 *
 * Trente minutes est le seuil qui compte un soir de semaine ; quinze, celui du petit-déjeuner ou du
 * dépannage. Au-delà d'une heure, un filtre n'aide plus personne à choisir.
 */
export const DUREES = [15, 30, 60] as const;

export type Tri = 'recent' | 'proteines' | 'rapide' | 'leger';

export const TRIS: { key: Tri; label: string }[] = [
  { key: 'recent', label: 'Les plus récentes' },
  { key: 'proteines', label: 'Plus de protéines' },
  { key: 'rapide', label: 'Les plus rapides' },
  { key: 'leger', label: 'Les moins caloriques' },
];

export interface Criteres {
  /** texte libre : titre, description, ingrédients */
  texte?: string;
  moment?: Moment | null;
  exclusions?: Exclusion[];
  /** durée totale maximale, en minutes */
  dureeMax?: number | null;
  tri?: Tri;
}

/**
 * Met un texte à plat pour la comparaison.
 *
 * Sans cela, « poelee » ne trouve pas « poêlée » et « Oeufs » ne trouve pas « Œufs » — ce qui est
 * exactement ce qu'on tape quand on cherche vite, sans accent et sans ligature. La décomposition
 * Unicode sépare les lettres de leurs accents, qu'on retire ensuite ; les ligatures, elles, n'ont
 * pas de décomposition canonique et se remplacent à la main.
 */
export function aplatir(texte: string): string {
  return texte
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’]/g, ' ');
}

/** Découpe la requête en mots : « poulet citron » doit trouver une recette qui a les deux. */
function mots(texte: string): string[] {
  return aplatir(texte)
    .split(/[^a-z0-9]+/)
    .filter((m) => m.length > 1);
}

/** Tout ce dans quoi on cherche, mis à plat une fois. */
function corpus(r: Recipe): string {
  return aplatir([r.titre, r.description, r.categorie, ...r.ingredients].join(' '));
}

const dureeTotale = (r: RecipeMeta): number => r.preparation + r.cuisson;

/**
 * Le classement, à égalité de pertinence.
 *
 * `recent` est le défaut et reprend l'ordre du catalogue — les dernières publiées d'abord. Les
 * trois autres répondent à une intention précise : manger plus de protéines, cuisiner vite, ou
 * alléger le repas.
 */
function comparer(tri: Tri): (a: Recipe, b: Recipe) => number {
  switch (tri) {
    case 'proteines':
      return (a, b) => b.proteines - a.proteines;
    case 'rapide':
      return (a, b) => dureeTotale(a) - dureeTotale(b);
    case 'leger':
      return (a, b) => a.kcal - b.kcal;
    default:
      return (a, b) => b.publiee.localeCompare(a.publiee);
  }
}

/**
 * Applique les critères et rend les recettes retenues.
 *
 * Les filtres se cumulent : chercher « poulet », cocher « moins de 30 minutes » et « sans porc »
 * demande les trois à la fois. Un critère vide ne filtre rien — c'est ce qui permet à l'écran de
 * n'avoir aucun état particulier quand rien n'est coché.
 */
export function chercherRecettes(recettes: Recipe[], criteres: Criteres = {}): Recipe[] {
  const { texte = '', moment = null, exclusions = [], dureeMax = null, tri = 'recent' } = criteres;
  const termes = mots(texte);

  const retenues = recettes.filter((r) => {
    if (moment && r.moment !== moment) return false;
    if (dureeMax !== null && dureeTotale(r) > dureeMax) return false;
    if (!respecteExclusions(r.contient, exclusions)) return false;
    if (termes.length === 0) return true;
    // Tous les mots doivent être présents, où que ce soit : c'est ce qu'on attend en tapant deux
    // mots, et cela évite qu'une recherche large ne rende tout le catalogue.
    const texteRecette = corpus(r);
    return termes.every((m) => texteRecette.includes(m));
  });

  return retenues.sort(comparer(tri));
}

/** Y a-t-il au moins un critère actif ? Sert à proposer « tout effacer » et à expliquer un vide. */
export function aDesCriteres(criteres: Criteres): boolean {
  return Boolean(
    criteres.texte?.trim() ||
      criteres.moment ||
      criteres.dureeMax ||
      (criteres.exclusions?.length ?? 0) > 0,
  );
}
