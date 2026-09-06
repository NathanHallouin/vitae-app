/**
 * Ce que ce fichier protège : que le cours n'enseigne pas autre chose que ce que l'application
 * calcule.
 *
 * Les seize notions expliquent les chiffres des écrans. Elles sont écrites en français, dans un
 * fichier que rien ne reliait aux formules — et l'encart pédagogique s'affiche **sur l'écran même**
 * qui montre le chiffre personnel du lecteur. Quand les deux divergent, la contradiction est à
 * quelques centimètres l'une de l'autre.
 *
 * C'est arrivé : la notion sur le métabolisme de base annonçait « 60 à 70 % de la dépense totale
 * d'une personne peu sportive », affichée sous un écran indiquant 74 % — et le modèle ne produit
 * jamais 60-70 % pour un profil peu sportif. Il produit **83 %** : moins on bouge, plus la part du
 * métabolisme de base est grande, ce que le texte disait à l'envers.
 *
 * ## Ce que ce fichier ne teste pas
 *
 * Les repères extérieurs — 13 kcal par kilo de muscle, 25 à 30 g de fibres, les 150 à 300 minutes
 * de l'OMS — ne se dérivent d'aucune formule d'ici. Ils sont justes et vérifiés à la main ; aucun
 * test ne peut le refaire, et prétendre le contraire serait pire que se taire.
 *
 * `bun test`
 */

import { describe, expect, test } from 'bun:test';
import { computeMetrics } from './calc';
import { activityFactor, DAILY, GOALS, SESSIONS } from './constants';
import { notionParSlug } from './cours';

/** Le texte entier d'une notion, résumé compris — les deux sont affichés. */
function textes(slug: string): string {
  const n = notionParSlug(slug);
  if (!n) throw new Error(`notion inconnue : ${slug}`);
  return `${n.resume} ${n.texte}`;
}

describe('le cours ne contredit pas le modèle', () => {
  test('la part du métabolisme de base annoncée couvre bien ce que le modèle produit', () => {
    const parts: number[] = [];
    for (let d = 0; d < DAILY.length; d++) {
      for (let s = 0; s < SESSIONS.length; s++) parts.push(1 / activityFactor(d, s));
    }
    const mini = Math.min(...parts) * 100;
    const maxi = Math.max(...parts) * 100;

    // Le modèle : de 54 % (travail physique + 7 séances) à 83 % (assis toute la journée, jamais).
    expect(Math.round(mini)).toBe(54);
    expect(Math.round(maxi)).toBe(83);

    // Le texte doit encadrer cet intervalle sans le démentir. « 60 à 70 % » ne le faisait pas.
    const texte = textes('metabolisme-de-base');
    const bornes = [...texte.matchAll(/(\d{2})\s*%/g)].map((m) => Number(m[1]));
    expect(bornes.length).toBeGreaterThanOrEqual(2);
    expect(Math.min(...bornes)).toBeLessThanOrEqual(Math.round(mini) + 1);
    expect(Math.max(...bornes)).toBeGreaterThanOrEqual(Math.round(maxi) - 4);
  });

  test('le sens est le bon : moins on bouge, plus la part est grande', () => {
    // La faute d'origine n'était pas seulement chiffrée, elle était inversée — elle attribuait la
    // part la plus basse au profil le moins actif.
    expect(1 / activityFactor(0, 0)).toBeGreaterThan(
      1 / activityFactor(DAILY.length - 1, SESSIONS.length - 1),
    );
  });

  test('les grammes de protéines annoncés sont ceux des objectifs', () => {
    const texte = textes('les-proteines-d-abord');
    const perte = GOALS.filter((g) => g.key === 'seche' || g.key === 'recomp').map((g) => g.prot);
    const maintien = GOALS.find((g) => g.key === 'maintien')?.prot;

    for (const g of [...perte, maintien]) {
      expect(texte).toContain(String(g).replace('.', ','));
    }
  });

  test('le plancher de lipides annoncé est celui du calcul', () => {
    // `calc.ts` : `Math.round(0.6 * refWeight)`. Le nombre est écrit dans les deux fichiers ; ce
    // test est ce qui les empêche de diverger.
    expect(textes('lipides-et-glucides')).toContain('0,6 g');
  });

  test('les 10 kcal par kilo perdu sont le premier terme de la formule', () => {
    const avant = computeMetrics({
      sexe: 'femme',
      age: '35',
      taille: '178',
      poids: '80',
      daily: 1,
      sessions: 1,
      goal: 'seche',
    });
    const apres = computeMetrics({
      sexe: 'femme',
      age: '35',
      taille: '178',
      poids: '79',
      daily: 1,
      sessions: 1,
      goal: 'seche',
    });
    expect((avant?.bmr ?? 0) - (apres?.bmr ?? 0)).toBe(10);
    expect(textes('refaire-le-calcul')).toContain('10 kcal');
  });
});
