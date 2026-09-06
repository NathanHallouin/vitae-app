/**
 * Les valeurs de référence du calcul métabolique, dérivées à la main.
 *
 * ## Pourquoi ce fichier existe
 *
 * `calc.test.ts` portait des valeurs dures — 1 649 kcal de métabolisme de base, 2 341 de dépense —
 * et un commentaire disant qu'elles venaient d'un prototype, `maquette/Calculateur MB.dc.html`. Ce
 * prototype a été supprimé du dépôt au commit `15f5222`. Les attentes des tests n'avaient donc plus
 * aucune source : elles n'étaient plus que le souvenir de ce que le code avait un jour produit.
 *
 * C'est le défaut qui compte le plus sur un projet où le code et ses tests sont écrits par le même
 * auteur, dans le même mouvement. **Si les attentes n'ont pas de source indépendante, corriger un
 * test devient indiscernable de casser une règle.** Il suffit d'ajuster le nombre attendu.
 *
 * ## Ce que ce fichier apporte
 *
 * Chaque valeur ci-dessous est **redérivée à la main depuis les formules de `README.md`**, et son
 * calcul est écrit à côté d'elle. Un humain peut vérifier la table sans exécuter le code, avec une
 * calculatrice ; c'est ce qui la rend indépendante de `calc.ts`.
 *
 * Les trois profils ne sont pas choisis au hasard : ils couvrent le cas nominal, le cas où **les
 * trois garde-fous mordent en même temps**, et le cas où les protéines se calculent sur un poids de
 * référence plutôt que sur le poids réel.
 *
 * ## Deux règles à tenir
 *
 * — **Ce module n'est importé que par les tests.** Le jour où le code de production s'en sert, la
 *   référence devient une copie de l'implémentation et ne prouve plus rien.
 * — **On ne corrige pas une valeur ici pour faire passer un test.** Si le code et la table
 *   divergent, l'un des deux a tort et il faut refaire l'arithmétique avant de toucher à quoi que
 *   ce soit. C'est tout l'objet du fichier.
 *
 * Formules, dans `README.md` § « Formules de calcul » :
 *
 *     MB(homme)  = 10 × poids + 6,25 × taille − 5 × âge + 5
 *     MB(femme)  = 10 × poids + 6,25 × taille − 5 × âge − 161
 *     DET        = MB × (base du quotidien + apport des séances)
 *     safeMin    = max(DET × objectif.min, min(MB, DET))
 *     safeMax    = DET × objectif.max
 *     recommandé = clamp(DET × objectif.rec, safeMin, safeMax)
 *     IMC        = poids / taille_m²
 *     poids santé = 18,5 × taille_m²  →  24,9 × taille_m²   (arrondis)
 *
 * **Les arrondis n'ont lieu qu'à l'affichage.** Toute la chaîne se calcule sur le métabolisme de
 * base non arrondi : `1 648,75 × 1,42`, jamais `1 649 × 1,42`. C'est un piège classique, et les
 * écarts qu'il produit sont assez petits pour passer inaperçus tout en étant faux.
 */

import type { GoalKey } from './constants';

export interface ProfilDeReference {
  /** ce que le profil sert à couvrir, en une ligne */
  couvre: string;
  entree: {
    sexe: 'homme' | 'femme';
    age: string;
    taille: string;
    poids: string;
    /** index dans `DAILY` */
    daily: number;
    /** index dans `SESSIONS` */
    sessions: number;
    goal: GoalKey;
  };
  /** le facteur d'activité attendu, base + apport */
  facteur: number;
  attendu: {
    bmr: number;
    tdee: number;
    min: number;
    max: number;
    target: number;
    raised: boolean;
    clamped: boolean;
    belowFloor: boolean;
    /** arrondi à trois décimales pour rester lisible ; les tests comparent avec tolérance */
    bmi: number;
    healthyMin: number;
    healthyMax: number;
    bandLabel: string;
    /** le poids sur lequel les grammes de protéines sont calculés */
    poidsReferenceProteines: number;
    /** grammes de protéines : poids de référence × g/kg de l'objectif */
    proteines: number;
  };
}

export const PROFILS_DE_REFERENCE: ProfilDeReference[] = [
  {
    couvre: 'le cas nominal : aucun garde-fou ne mord, IMC dans la bande saine',
    entree: {
      sexe: 'homme',
      age: '30',
      taille: '175',
      poids: '70',
      daily: 1, // « Assis, mais je marche » · base 1,30
      sessions: 2, // « 3 à 4 séances » · +0,12
      goal: 'seche', // min 0,75 · max 0,90 · rec 0,82 · 2,0 g/kg
    },
    facteur: 1.42, // 1,30 + 0,12
    attendu: {
      // 10×70 + 6,25×175 − 5×30 + 5 = 700 + 1 093,75 − 150 + 5 = 1 648,75
      bmr: 1649,
      // 1 648,75 × 1,42 = 2 341,225
      tdee: 2341,
      // rawMin = 2 341,225 × 0,75 = 1 755,919 ; MB = 1 648,75 → le max est rawMin
      min: 1756,
      // 2 341,225 × 0,90 = 2 107,103
      max: 2107,
      // 2 341,225 × 0,82 = 1 919,805, déjà dans [1 755,919 ; 2 107,103]
      target: 1920,
      raised: false, // 1 919,805 ≥ 1 755,919
      clamped: false, // rawMin 1 755,919 ≥ MB 1 648,75
      belowFloor: false, // rawMin 1 755,919 ≥ plancher homme 1 500
      // 70 / 1,75² = 70 / 3,0625
      bmi: 22.857,
      healthyMin: 57, // 18,5 × 3,0625 = 56,656
      healthyMax: 76, // 24,9 × 3,0625 = 76,256
      bandLabel: 'Corpulence normale', // 22,857 < 25
      poidsReferenceProteines: 70, // IMC < 30 → le poids réel
      proteines: 140, // 70 × 2,0
    },
  },
  {
    couvre:
      'les trois garde-fous en même temps : fourchette relevée, recommandé relevé, sous le plancher',
    entree: {
      sexe: 'femme',
      age: '25',
      taille: '160',
      poids: '50',
      daily: 0, // « Assis toute la journée » · base 1,20
      sessions: 0, // « Jamais » · +0
      goal: 'seche',
    },
    facteur: 1.2,
    attendu: {
      // 10×50 + 6,25×160 − 5×25 − 161 = 500 + 1 000 − 125 − 161 = 1 214
      bmr: 1214,
      // 1 214 × 1,20 = 1 456,8
      tdee: 1457,
      // rawMin = 1 456,8 × 0,75 = 1 092,6, sous le MB → relevé au MB, soit 1 214
      min: 1214,
      // 1 456,8 × 0,90 = 1 311,12
      max: 1311,
      // 1 456,8 × 0,82 = 1 194,576, sous safeMin → remonté à 1 214
      target: 1214,
      raised: true, // 1 194,576 < 1 214
      clamped: true, // rawMin 1 092,6 < MB 1 214, et objectif « sèche »
      belowFloor: true, // rawMin 1 092,6 < plancher femme 1 200
      // 50 / 1,60² = 50 / 2,56
      bmi: 19.531,
      healthyMin: 47, // 18,5 × 2,56 = 47,36
      healthyMax: 64, // 24,9 × 2,56 = 63,744
      bandLabel: 'Corpulence normale',
      poidsReferenceProteines: 50,
      proteines: 100, // 50 × 2,0
    },
  },
  {
    couvre:
      'IMC ≥ 30 : les protéines se calculent sur un poids de référence, pas sur le poids réel',
    entree: {
      sexe: 'homme',
      age: '40',
      taille: '175',
      poids: '100',
      daily: 0,
      sessions: 0,
      goal: 'seche',
    },
    facteur: 1.2,
    attendu: {
      // 10×100 + 6,25×175 − 5×40 + 5 = 1 000 + 1 093,75 − 200 + 5 = 1 898,75
      bmr: 1899,
      // 1 898,75 × 1,20 = 2 278,5
      tdee: 2279,
      // rawMin = 2 278,5 × 0,75 = 1 708,875, sous le MB → relevé au MB 1 898,75
      min: 1899,
      // 2 278,5 × 0,90 = 2 050,65
      max: 2051,
      // 2 278,5 × 0,82 = 1 868,37, sous safeMin → remonté à 1 898,75
      target: 1899,
      raised: true, // 1 868,37 < 1 898,75
      clamped: true, // rawMin 1 708,875 < MB 1 898,75
      belowFloor: false, // rawMin 1 708,875 ≥ plancher homme 1 500
      // 100 / 3,0625
      bmi: 32.653,
      healthyMin: 57,
      healthyMax: 76,
      bandLabel: 'Obésité modérée', // 30 ≤ 32,653 < 35
      // haut du poids santé + 25 % de l'excès : 76 + 0,25 × (100 − 76) = 76 + 6 = 82
      // Le calcul part du poids santé **arrondi**, comme l'affichage : c'est la valeur que
      // l'utilisateur lit à l'écran, et faire diverger les deux serait invérifiable pour lui.
      poidsReferenceProteines: 82,
      proteines: 164, // 82 × 2,0
    },
  },
];

/**
 * La position attendue du curseur d'IMC, bande par bande.
 *
 * L'axe compte quatre segments de 25 % : 15 – 18,5 · 18,5 – 25 · 25 – 30 · 30 – 40. Le curseur se
 * place **à l'intérieur du segment**, pas sur l'échelle entière — c'est un bug corrigé pendant la
 * conception, consigné dans `README.md`, et il ne se voyait qu'en comparant deux profils.
 *
 * Les quatre segments sont couverts : une seule bande testée laissait les trois autres libres de
 * régresser sans que rien ne le signale.
 *
 *     position = i × 25 + (imc − bas) / (haut − bas) × 25,  borné à [2 ; 98]
 */
export const CURSEUR_IMC: Array<{ imc: number; attendu: number; calcul: string }> = [
  // Segment 0 (15 – 18,5) : 2 / 3,5 × 25 = 14,285714…
  { imc: 17, attendu: 14.2857143, calcul: '0 × 25 + (17 − 15) / 3,5 × 25' },
  // Segment 1 (18,5 – 25) : 25 + 4,357 / 6,5 × 25 = 25 + 16,757692… = 41,757692…
  { imc: 22.857, attendu: 41.7576923, calcul: '1 × 25 + (22,857 − 18,5) / 6,5 × 25' },
  // Segment 2 (25 – 30) : 50 + 2,5 / 5 × 25 = 50 + 12,5 = 62,5
  { imc: 27.5, attendu: 62.5, calcul: '2 × 25 + (27,5 − 25) / 5 × 25' },
  // Segment 3 (30 – 40) : 75 + 2,653 / 10 × 25 = 75 + 6,6325 = 81,6325
  //
  // Cette valeur a été écrite « 81,633 » à la première rédaction, et le test a échoué. L'erreur
  // était dans la dérivation, pas dans le code : c'est exactement ce que la table doit produire,
  // et la démonstration ci-dessus est ce qui permet de trancher lequel des deux a tort.
  { imc: 32.653, attendu: 81.6325, calcul: '3 × 25 + (32,653 − 30) / 10 × 25' },
  // Bornes : l'axe ne colle jamais aux extrémités, sinon le curseur sort du tracé
  { imc: 12, attendu: 2, calcul: 'sous l’échelle → borné à 2' },
  { imc: 55, attendu: 98, calcul: 'au-delà de l’échelle → borné à 98' },
];
