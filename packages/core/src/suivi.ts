/**
 * Le suivi de poids dans le temps : une pesée par jour, gardée sur l'appareil.
 *
 * L'application recommandait déjà de refaire le calcul tous les 4 à 5 kg sans donner de quoi le
 * constater. C'est ce que ce module apporte : une suite de pesées, la tendance qu'elles dessinent,
 * et la comparaison avec le rythme que le plan prévoit.
 *
 * Comme le reste de `packages/core`, il ne connaît ni React, ni le stockage, ni l'heure : les
 * fonctions reçoivent l'historique et rendent un nouvel historique. C'est ce qui permet de les
 * éprouver sans environnement de rendu, et c'est indispensable ici — les cas tordus sont dans les
 * dates, pas dans l'affichage.
 *
 * **Une pesée par jour, la dernière gagne.** Se peser deux fois le même matin est courant ; garder
 * les deux ferait une dent dans la courbe qui ne raconte rien. La date sert donc de clé.
 */

import { CHART } from './calc';
import { dec } from './format';

/** Une pesée : un jour, un poids. Rien d'autre — l'heure ne dit rien de plus sur une balance. */
export interface Pesee {
  /** `yyyy-mm-dd` */
  date: string;
  /** en kilogrammes */
  poids: number;
}

/**
 * Bornes de saisie, reprises de la validation du profil : au-delà, c'est une faute de frappe.
 * Les accepter polluerait la courbe pour toujours, et l'utilisateur ne comprendrait pas pourquoi.
 */
export const POIDS_MIN = 30;
export const POIDS_MAX = 300;

const JOUR_MS = 86_400_000;

/** Découpe `yyyy-mm-dd` sans passer par le fuseau UTC, comme `date.ts`. */
function jour(valeur: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valeur);
  if (!m) return null;
  const [, a, mo, j] = m;
  const d = new Date(Number(a), Number(mo) - 1, Number(j));
  if (
    d.getFullYear() !== Number(a) ||
    d.getMonth() !== Number(mo) - 1 ||
    d.getDate() !== Number(j)
  ) {
    return null;
  }
  return d;
}

/** Nombre de jours entre deux dates `yyyy-mm-dd` ; `null` si l'une est illisible. */
export function joursEntre(depuis: string, jusqua: string): number | null {
  const a = jour(depuis);
  const b = jour(jusqua);
  if (!a || !b) return null;
  return Math.round((b.getTime() - a.getTime()) / JOUR_MS);
}

/**
 * Ajoute ou remplace la pesée d'un jour, et rend l'historique trié du plus ancien au plus récent.
 *
 * Le tri est refait à chaque ajout plutôt que supposé : une pesée peut être saisie pour un jour
 * passé — on se rattrape le dimanche soir — et un historique désordonné donnerait une courbe qui
 * revient sur elle-même.
 */
export function ajouterPesee(historique: Pesee[], pesee: Pesee): Pesee[] {
  if (!jour(pesee.date)) return historique;
  if (!Number.isFinite(pesee.poids) || pesee.poids < POIDS_MIN || pesee.poids > POIDS_MAX) {
    return historique;
  }
  const arrondi = Math.round(pesee.poids * 10) / 10;
  return [...historique.filter((p) => p.date !== pesee.date), { ...pesee, poids: arrondi }].sort(
    (a, b) => a.date.localeCompare(b.date),
  );
}

export function retirerPesee(historique: Pesee[], date: string): Pesee[] {
  return historique.filter((p) => p.date !== date);
}

/** La pesée la plus récente, ou `null` si l'historique est vide. */
export function dernierePesee(historique: Pesee[]): Pesee | null {
  return historique.length ? historique[historique.length - 1] : null;
}

/**
 * Tendance en kilogrammes par semaine, sur une fenêtre glissante.
 *
 * **Une régression sur tous les points, pas un écart entre le premier et le dernier.** Le poids
 * d'un jour donné varie d'un kilo ou deux avec l'eau, le sel et le transit ; deux points mal
 * choisis annoncent une perte spectaculaire ou une reprise inquiétante, l'une comme l'autre
 * fausses. La droite des moindres carrés fait dire à tous les points ce qu'ils disent ensemble.
 *
 * `null` en dessous de deux pesées, ou si elles tombent le même jour : il n'y a alors aucune pente
 * à calculer, et en inventer une serait pire que de ne rien afficher.
 */
export function tendance(historique: Pesee[], fenetreJours = 28): number | null {
  const recent = dernierePesee(historique);
  if (!recent) return null;

  const points = historique
    .map((p) => ({ t: joursEntre(p.date, recent.date), poids: p.poids }))
    .filter((p): p is { t: number; poids: number } => p.t !== null && p.t <= fenetreJours);

  if (points.length < 2) return null;

  const n = points.length;
  const moyenneT = points.reduce((s, p) => s + p.t, 0) / n;
  const moyenneP = points.reduce((s, p) => s + p.poids, 0) / n;

  let numerateur = 0;
  let denominateur = 0;
  for (const p of points) {
    numerateur += (p.t - moyenneT) * (p.poids - moyenneP);
    denominateur += (p.t - moyenneT) ** 2;
  }
  if (denominateur === 0) return null;

  // `t` compte les jours **avant** la dernière pesée : la pente est donc inversée pour se lire
  // dans le sens du temps, puis ramenée à la semaine.
  return (-numerateur / denominateur) * 7;
}

/** Ce que l'écran a besoin de savoir, une fois l'historique lu. */
export interface Suivi {
  historique: Pesee[];
  dernier: Pesee | null;
  /** kg par semaine, signé ; `null` s'il n'y a pas de quoi conclure */
  tendance: number | null;
  /** écart depuis la première pesée, en kg signés ; `null` sans historique */
  depuisLeDebut: number | null;
  /** vrai quand le poids a bougé de 4 kg ou plus depuis le dernier calcul */
  aReevaluer: boolean;
  /** ce qu'il faut dire à l'utilisateur, en une phrase */
  message: string;
}

/**
 * L'écart au-delà duquel les besoins ont assez changé pour refaire le calcul.
 *
 * Quatre kilos, et non cinq : c'est le bas de la fourchette que l'application annonce déjà
 * (« refaites le calcul tous les 4 à 5 kg »), et prévenir un peu tôt vaut mieux que tard — le
 * métabolisme de base baisse à mesure qu'on s'allège, et un plan qui ne suit pas fait stagner.
 */
export const ECART_REEVALUATION = 4;

/**
 * Rassemble ce qui se dit d'un historique.
 *
 * `poidsDuProfil` est le poids sur lequel le plan en cours a été calculé : c'est lui, et non la
 * première pesée, qui dit si le plan est encore d'actualité.
 */
export function construireSuivi(historique: Pesee[], poidsDuProfil: number | null): Suivi {
  const dernier = dernierePesee(historique);
  const premier = historique.length ? historique[0] : null;
  const pente = tendance(historique);
  const depuisLeDebut = dernier && premier ? dernier.poids - premier.poids : null;

  const ecart = dernier && poidsDuProfil !== null ? Math.abs(dernier.poids - poidsDuProfil) : 0;
  const aReevaluer = ecart >= ECART_REEVALUATION;

  return {
    historique,
    dernier,
    tendance: pente,
    depuisLeDebut,
    aReevaluer,
    message: messageDeSuivi(historique.length, pente, aReevaluer),
  };
}

function messageDeSuivi(nombre: number, pente: number | null, aReevaluer: boolean): string {
  if (nombre === 0) {
    return 'Pesez-vous une fois par semaine, le matin à jeun, toujours dans les mêmes conditions. C’est la régularité qui rend la courbe lisible, pas la précision de la balance.';
  }
  if (aReevaluer) {
    return 'Votre poids a changé d’au moins 4 kg depuis le calcul : vos besoins ont bougé avec lui. Mettez votre poids à jour dans le profil pour recalculer.';
  }
  if (pente === null) {
    return 'Une deuxième pesée, à une semaine d’intervalle, suffira à dessiner une tendance.';
  }
  if (Math.abs(pente) < 0.05) {
    return 'Votre poids est stable sur les quatre dernières semaines. Si ce n’est pas ce que vous visez, l’écart se joue dans l’assiette plus que sur la balance.';
  }
  return 'La tendance se lit sur plusieurs semaines, jamais d’un jour à l’autre : un ou deux kilos d’eau vont et viennent sans rien dire de votre masse grasse.';
}

export interface PointCourbe {
  x: number;
  y: number;
  /** la pesée d'origine, pour l'étiquette accessible */
  pesee: Pesee;
}

export interface Courbe {
  points: PointCourbe[];
  ticks: Array<{ x: number; label: string }>;
  /** ordonnée de la ligne de cible, ou `null` si la cible sort du cadre dessiné */
  cibleY: number | null;
  basLabel: string;
  hautLabel: string;
}

/**
 * La géométrie de la courbe réelle, dans le même repère que la projection.
 *
 * Comme `buildProjection`, elle vit dans le métier : le composant qui l'affiche ne calcule rien.
 * C'est ce qui permet au site et à l'application de tracer exactement la même courbe sans que deux
 * implémentations aient à rester d'accord — et c'est ce qui rend la géométrie testable sans écran.
 *
 * `null` en dessous de deux pesées : un point isolé n'est pas une courbe, et en tracer une donnerait
 * à voir une tendance qui n'existe pas.
 *
 * **L'abscisse suit les jours, pas le rang des pesées.** Se peser trois fois en une semaine puis
 * plus rien pendant un mois donnerait, à pas régulier, une courbe qui ment sur le temps écoulé.
 */
export function construireCourbe(pesees: Pesee[], cible: number | null = null): Courbe | null {
  if (pesees.length < 2) return null;

  const premier = pesees[0];
  const dernier = pesees[pesees.length - 1];
  const duree = joursEntre(premier.date, dernier.date);
  if (duree === null || duree <= 0) return null;

  const poids = pesees.map((p) => p.poids);
  let bas = Math.min(...poids);
  let haut = Math.max(...poids);

  // Une courbe parfaitement plate diviserait par zéro, et une variation d'un demi-kilo étirée sur
  // toute la hauteur ferait d'un poids stable un montagne russe. D'où une amplitude minimale.
  const AMPLITUDE_MIN = 2;
  if (haut - bas < AMPLITUDE_MIN) {
    const milieu = (haut + bas) / 2;
    bas = milieu - AMPLITUDE_MIN / 2;
    haut = milieu + AMPLITUDE_MIN / 2;
  } else {
    const marge = (haut - bas) * 0.15;
    bas -= marge;
    haut += marge;
  }

  const px = (jours: number) => CHART.x0 + (jours / duree) * (CHART.x1 - CHART.x0);
  const py = (p: number) => CHART.y1 - ((p - bas) / (haut - bas)) * (CHART.y1 - CHART.y0);

  const points: PointCourbe[] = [];
  for (const pesee of pesees) {
    const jours = joursEntre(premier.date, pesee.date);
    if (jours === null) continue;
    points.push({ x: px(jours), y: py(pesee.poids), pesee });
  }

  return {
    points,
    // Deux repères seulement, aux extrémités : la place manque pour davantage sans que les dates
    // se chevauchent, et ce sont ces deux-là qui disent la période couverte.
    ticks: [
      { x: px(0), label: dateCourte(premier.date) },
      { x: px(duree), label: dateCourte(dernier.date) },
    ],
    // La cible n'est dessinée que si elle tombe dans le cadre : une ligne collée au bord
    // laisserait croire qu'elle est presque atteinte.
    cibleY: cible !== null && cible >= bas && cible <= haut ? py(cible) : null,
    basLabel: `${dec(Math.round(bas * 10) / 10)} kg`,
    hautLabel: `${dec(Math.round(haut * 10) / 10)} kg`,
  };
}

/** « 15 mars » : l'année alourdirait un repère d'axe, et la courbe dit déjà l'ordre. */
export function dateCourte(date: string): string {
  const d = jour(date);
  if (!d) return '';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

/**
 * Compare la tendance constatée au rythme que le plan prévoit.
 *
 * Les deux sont en kilogrammes par semaine et signés. Rendre `null` plutôt qu'une phrase creuse
 * quand il n'y a pas de tendance : promettre une comparaison qu'on ne peut pas faire est pire que
 * de se taire.
 */
export function comparerAuPlan(constatee: number | null, prevue: number): string | null {
  if (constatee === null) return null;

  // En deçà, l'écart est du bruit de balance : le dire serait donner du sens à du hasard.
  const SEUIL = 0.1;
  const ecart = constatee - prevue;

  if (Math.abs(ecart) < SEUIL) return 'Vous suivez le rythme prévu.';
  if (prevue === 0) {
    return Math.abs(constatee) < SEUIL
      ? 'Vous suivez le rythme prévu.'
      : 'Le plan vise la stabilité, mais votre poids bouge : vérifiez les portions avant de changer quoi que ce soit.';
  }
  // Plus vite que prévu, dans le sens voulu.
  if (prevue < 0 && constatee < prevue) {
    return 'Vous allez plus vite que prévu. C’est flatteur sur la balance, mais au-delà d’un kilo par semaine une partie de ce qui part est du muscle.';
  }
  if (prevue > 0 && constatee > prevue) {
    return 'Vous prenez plus vite que prévu : au-delà du rythme visé, le surplus part surtout en gras.';
  }
  return 'Vous avancez moins vite que le plan ne le prévoit. Deux explications, dans cet ordre : les portions réelles dépassent souvent l’estimation, et la dépense baisse avec le poids.';
}
