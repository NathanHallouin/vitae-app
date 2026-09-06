/**
 * Le plan de navigation, partagé par les onglets du haut (à partir de `sm`) et la barre du bas
 * (sur mobile). Un seul tableau : les deux barres ne peuvent pas diverger.
 *
 * Deux libellés par destination. Le long est une question que l'utilisateur se pose et sert sur
 * grand écran ; le court tient dans un cinquième de la largeur d'un téléphone, où le libellé n'a
 * de toute façon qu'à confirmer l'icône.
 */

import type { IconName } from './icons';

/**
 * Largeur à partir de laquelle les quatre onglets du haut tiennent sans déborder. Mesurée, pas
 * devinée : à 600 px, « Mon poids » est déjà coupé et « Bouger » sort de l'écran.
 *
 * Ce seuil ne coïncide avec aucun palier MUI, et c'est normal : il dépend de la longueur des
 * libellés français, pas d'une taille d'appareil. Les deux barres s'y réfèrent, ce qui garantit
 * qu'il y en a toujours exactement une à l'écran.
 */
export const NAV_BREAKPOINT = 700;

export interface NavPage {
  href: string;
  label: string;
  /** libellé de la barre basse : un mot, jamais tronqué */
  short: string;
  icon: IconName;
}

/** Une page par question que l'utilisateur se pose. */
export const RESULT_PAGES: NavPage[] = [
  { href: '/metabolisme', label: 'Mon métabolisme', short: 'Métabolisme', icon: 'flamme' },
  { href: '/alimentation', label: 'Ce que je mange', short: 'Manger', icon: 'assiette' },
  { href: '/poids', label: 'Mon poids', short: 'Poids', icon: 'balance' },
  { href: '/bouger', label: 'Bouger', short: 'Bouger', icon: 'course' },
];

/**
 * Les écrans qui restent montés et gelés d'une visite à l'autre.
 *
 * Ce ne sont plus les destinations de la barre du bas — celle-ci porte désormais quatre
 * **sections** (voir `SECTIONS`) — mais les cinq écrans qu'un navigateur d'onglets garde en
 * mémoire pour que le passage de l'un à l'autre soit instantané. Le profil y figure parce qu'on y
 * revient corriger un poids, et qu'un formulaire remonté à chaque visite reperdrait sa position de
 * défilement.
 */
export const MOBILE_PAGES: NavPage[] = [
  ...RESULT_PAGES,
  { href: '/profil', label: 'Mon profil', short: 'Profil', icon: 'silhouette' },
];

/**
 * Les quatre sections de l'application, et le seul niveau de navigation qui soit permanent.
 *
 * L'application a sept destinations, ce qui est trop pour une barre — d'où la tentation, un temps
 * suivie, de mettre les deux moins fréquentes dans l'en-tête. C'était une erreur : sur un
 * téléphone, le haut de l'écran est hors de portée du pouce, et il porte l'identité, pas la
 * navigation.
 *
 * La bonne coupe n'est pas « les cinq plus utilisées, puis le reste », mais **quatre intentions
 * différentes** : mes chiffres, quoi cuisiner, comprendre, mes informations. Les quatre écrans de
 * résultats n'en font qu'une : ils partagent un profil, une chaîne de lecture, et ils étaient déjà
 * présentés ensemble sur grand écran par `ResultTabs`. Ce bandeau descend simplement sur mobile,
 * où il devient le second niveau.
 *
 * Deux niveaux, tous deux atteignables au pouce, et aucune destination cachée.
 *
 * `racine` est l'adresse par défaut de la section ; celle des chiffres est remplacée à
 * l'exécution par le dernier écran vu — revenir à « Mes chiffres » doit rouvrir là où l'on était.
 * `prefixes` sert à savoir quelle section est active, détail compris : une fiche de recette est
 * dans « Recettes », une notion dans « Comprendre ».
 */
export interface Section {
  cle: 'chiffres' | 'recettes' | 'comprendre' | 'profil';
  label: string;
  racine: string;
  icon: IconName;
  /** chemins qui appartiennent à la section, préfixe compris */
  prefixes: string[];
}

export const SECTIONS: Section[] = [
  {
    cle: 'chiffres',
    label: 'Mes chiffres',
    racine: '/metabolisme',
    icon: 'flamme',
    prefixes: RESULT_PAGES.map((p) => p.href),
  },
  {
    cle: 'recettes',
    label: 'Recettes',
    racine: '/recettes',
    icon: 'assiette',
    prefixes: ['/recettes'],
  },
  {
    cle: 'comprendre',
    label: 'Comprendre',
    racine: '/comprendre',
    icon: 'info',
    prefixes: ['/comprendre'],
  },
  {
    cle: 'profil',
    label: 'Profil',
    racine: '/profil',
    icon: 'silhouette',
    // Les réglages et la confidentialité sont des sous-pages du profil : c'est là qu'on va les
    // chercher, et la barre ne doit pas se vider quand on les ouvre.
    prefixes: ['/profil', '/reglages', '/confidentialite'],
  },
];

/**
 * La section à laquelle appartient un chemin, ou `null` sur l'accueil — qui n'est dans aucune
 * section et n'affiche donc pas la barre.
 *
 * La comparaison se fait sur le préfixe suivi d'une fin de chaîne ou d'une barre oblique :
 * `/recettes` et `/recettes/curry` sont dans la même section, `/recettes-bis` ne le serait pas.
 */
export function sectionDe(chemin: string): Section | null {
  return (
    SECTIONS.find((s) => s.prefixes.some((p) => chemin === p || chemin.startsWith(`${p}/`))) ?? null
  );
}

/**
 * L'écran sur lequel l'application s'ouvre, en natif.
 *
 * Quatre onglets sans hiérarchie posent une question à chaque lancement : lequel regarder ? La
 * réponse dépend de ce qui s'est passé depuis la dernière fois, et cette fonction la donne — elle
 * ouvre l'application **là où quelque chose est à faire**, plutôt que toujours au même endroit.
 *
 * Les trois cas sont exclusifs et testés dans cet ordre :
 *
 * 1. la dernière pesée date de plus d'une semaine — il y a un geste à faire, et la tendance ne se
 *    dessine pas sans lui ;
 * 2. le profil a changé depuis la dernière ouverture — le calcul vient d'être refait, et c'est le
 *    seul moment où le compteur qui monte a quelque chose à dire ;
 * 3. sinon, ce qu'on mange aujourd'hui : le seul écran dont la réponse sert le jour même, et le
 *    seul qui change d'un jour à l'autre.
 *
 * **Le risque, et pourquoi il est tenu.** Une arrivée variable est une arrivée qu'on n'apprend pas :
 * si l'application s'ouvre chaque fois ailleurs, la mémoire des lieux ne se construit jamais. Les
 * deux premiers cas sont donc rares et font suite à un événement que l'utilisateur a lui-même
 * provoqué — une semaine sans se peser, une modification de profil. Le troisième est le cas
 * ordinaire, et c'est lui qu'on apprend.
 *
 * Rien de tout cela sur le web : `/` y reste la page de présentation, pré-rendue et indexable.
 * Quelqu'un qui arrive d'un moteur de recherche n'a pas de profil, et l'envoyer sur un écran de
 * résultats vide serait le pire accueil possible.
 */
export function destinationAuDemarrage({
  peseePerimee,
  profilModifie,
}: {
  /** vrai quand la dernière pesée date de plus d'une semaine, ou qu'il n'y en a aucune */
  peseePerimee: boolean;
  /** vrai quand le profil a été modifié depuis la dernière ouverture de l'application */
  profilModifie: boolean;
}): string {
  if (peseePerimee) return '/poids';
  if (profilModifie) return '/metabolisme';
  return '/alimentation';
}
