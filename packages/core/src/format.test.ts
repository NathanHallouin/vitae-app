/**
 * Ce que ce fichier protège : qu'un nombre saisi en français soit lu en entier.
 *
 * `parseFloat('78,4')` vaut 78. Silencieusement — pas `NaN`, pas une exception : un nombre
 * plausible, qui traverse toutes les validations de bornes. Le profil calculait donc sur 78 pendant
 * que l'écran affichait « Calculé pour 78,4 kg », et l'application invitait à taper cette virgule :
 * `NumberField` choisit `keyboardType="decimal-pad"` **pour l'offrir**.
 *
 * Le test qui compte est le dernier — la parité. Le suivi de poids gérait déjà la virgule de son
 * côté, le calcul non : le même poids valait deux nombres différents selon le module qui le lisait.
 * C'est la classe de défaut qu'une règle écrite deux fois finit toujours par produire, et ce test
 * échoue si l'on en réécrit une troisième.
 *
 * `bun test`
 */

import { describe, expect, test } from 'bun:test';
import { computeMetrics } from './calc';
import { nombreSaisi } from './format';
import { type FormState, validate } from './state';

describe('nombreSaisi', () => {
  test('la virgule décimale est lue, pas tronquée', () => {
    expect(nombreSaisi('78,4')).toBe(78.4);
    expect(nombreSaisi('0,5')).toBe(0.5);
    // Le comportement d'origine, celui contre lequel ce fichier existe.
    expect(parseFloat('78,4')).toBe(78);
  });

  test('le point continue de marcher : les deux claviers coexistent', () => {
    expect(nombreSaisi('78.4')).toBe(78.4);
    expect(nombreSaisi('78')).toBe(78);
  });

  test('une saisie vide ou illisible rend NaN, et non zéro', () => {
    // Rendre 0 ferait passer une absence pour un poids de zéro kilo, que les bornes rejetteraient
    // avec le mauvais message — « le poids doit être compris entre 30 et 300 » au lieu de
    // « renseignez le poids ».
    expect(nombreSaisi('')).toBeNaN();
    expect(nombreSaisi('abc')).toBeNaN();
  });
});

const PROFIL = {
  sexe: 'femme' as const,
  age: '35',
  taille: '178',
  daily: 1,
  sessions: 1,
  goal: 'seche' as const,
  excluded: [],
};

describe('le calcul lit la virgule', () => {
  test('« 78,4 » et « 78.4 » donnent exactement les mêmes chiffres', () => {
    const virgule = computeMetrics({ ...PROFIL, poids: '78,4' });
    const point = computeMetrics({ ...PROFIL, poids: '78.4' });
    expect(virgule).toEqual(point);
  });

  test('et ces chiffres ne sont pas ceux de 78 kg', () => {
    // Sans quoi le test précédent passerait aussi si les deux étaient tronqués de la même façon.
    const virgule = computeMetrics({ ...PROFIL, poids: '78,4' });
    const entier = computeMetrics({ ...PROFIL, poids: '78' });
    expect(virgule?.bmr).not.toBe(entier?.bmr);
    expect(virgule?.bmr).toBe(1561);
    expect(entier?.bmr).toBe(1557);
  });
});

describe('la validation lit la même chose que le calcul', () => {
  const etat = (poids: string): FormState =>
    ({
      mode: 'form',
      step: 1,
      sexe: 'femme',
      naissance: '1991-03-14',
      taille: '178',
      poids,
      daily: 1,
      sessions: 1,
      goal: 'seche',
      excluded: [],
      error: '',
      staleWeight: null,
      naissanceLocked: false,
    }) as unknown as FormState;

  const le6septembre = new Date('2026-09-06T12:00:00Z');

  test('un poids sous la borne écrit à la virgule est refusé', () => {
    // « 29,9 » valait 29 avec `parseFloat` : refusé aussi, mais par accident. Le cas qui comptait
    // était l'inverse — « 30,5 » sur la borne basse, où tronquer change la réponse.
    expect(validate(etat('29,9'), le6septembre)).not.toBe('');
    expect(validate(etat('30,5'), le6septembre)).toBe('');
  });
});

describe('parité entre le suivi et le calcul', () => {
  test('la pesée et le profil lisent le même poids', () => {
    // `SuiviCard` faisait `.replace(',', '.')` de son côté et le calcul non : le même « 78,4 »
    // valait 78,4 dans l'historique et 78 dans le plan, et `ProfileProvider` comparait les deux.
    const commeUnePesee = nombreSaisi('78,4');
    const commeUnProfil = computeMetrics({ ...PROFIL, poids: '78,4' });
    expect(commeUnProfil?.bmr).toBe(Math.round(10 * commeUnePesee + 6.25 * 178 - 5 * 35 - 161));
  });
});
