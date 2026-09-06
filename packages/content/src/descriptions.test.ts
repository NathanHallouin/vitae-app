/**
 * Ce que ce fichier protège : qu'une recette ne se contredise pas elle-même.
 *
 * Chaque recette porte deux fois la même information — une fois en données (`preparation`,
 * `cuisson`), une fois en toutes lettres dans sa description. La carte de l'index affiche les
 * deux **côte à côte** : « 23 min · 480 kcal · 38 g de protéines » sous « Quinze minutes en tout ».
 * Huit recettes sur soixante-deux se contredisaient ainsi, et l'une annonçait « sans cuisson »
 * alors que sa première étape est « Faites griller le pain ».
 *
 * Aucune relecture ne rattrape ça : la description et l'en-tête YAML sont à vingt lignes l'une de
 * l'autre, et il faut faire une addition pour voir la faute. La soixante-troisième recette
 * recommencera, sauf si quelque chose l'en empêche.
 *
 * ## Ce que le test ne fait pas
 *
 * Il ne vérifie **que les annonces de durée totale** — « en tout », « au total », « prêt en N ». Une
 * phrase qui décrit une étape reste libre : « saisi une minute par face », « les lentilles corail
 * cuisent en quinze minutes » parlent d'un geste ou d'un ingrédient, pas du plat. C'est la
 * distinction qui rend le test utilisable ; sans elle il crierait sur la moitié du catalogue et
 * finirait désactivé.
 *
 * Il ne vérifie pas non plus les calories ni les protéines annoncées : elles sont écrites à la
 * main, sans source dans le dépôt, et rien ici ne peut les recalculer. C'est une limite réelle,
 * pas un oubli — voir `AUDIT.md`.
 *
 * `bun test`
 */

import { describe, expect, test } from 'bun:test';
import { RECETTES } from './recettes.generated';

/** Les nombres qu'une description peut écrire en toutes lettres, jusqu'à une heure. */
const EN_LETTRES: Record<string, number> = {
  une: 1,
  deux: 2,
  trois: 3,
  quatre: 4,
  cinq: 5,
  six: 6,
  sept: 7,
  huit: 8,
  neuf: 9,
  dix: 10,
  onze: 11,
  douze: 12,
  treize: 13,
  quatorze: 14,
  quinze: 15,
  seize: 16,
  'dix-sept': 17,
  'dix-huit': 18,
  'dix-neuf': 19,
  vingt: 20,
  'vingt-deux': 22,
  'vingt-trois': 23,
  'vingt-cinq': 25,
  'vingt-sept': 27,
  trente: 30,
  'trente-cinq': 35,
  quarante: 40,
  'quarante-cinq': 45,
  cinquante: 50,
  soixante: 60,
  'une demi-heure': 30,
  'un quart d’heure': 15,
  'trois quarts d’heure': 45,
  'une heure': 60,
};

/**
 * Les tournures qui annoncent la durée **du plat entier**, et elles seules.
 *
 * `prêt en` et `en tout` ne laissent aucun doute. « en N minutes » est plus large : il attrape
 * « à monter en quinze minutes », qui est bien une annonce de total, et laisse passer « saisi une
 * minute par face », qui n'a pas la forme.
 */
const ANNONCES: RegExp[] = [
  /([\wÀ-ÿ’-]+(?:\s+[\wÀ-ÿ’-]+)?)\s+minutes?\s+en tout/gi,
  /([\wÀ-ÿ’-]+(?:\s+[\wÀ-ÿ’-]+)?)\s+minutes?\s+au total/gi,
  /prêt(?:e)?\s+en\s+((?:une demi-heure|un quart d’heure|trois quarts d’heure|une heure)|[\wÀ-ÿ-]+)\s*(?:minutes?)?/gi,
  /\ben\s+([\wÀ-ÿ-]+)\s+minutes?\b/gi,
];

/**
 * Les tournures qui ont la **forme** d'une annonce de total sans en être une.
 *
 * L'analyse est linguistique, donc heuristique : « en quinze minutes » annonce le plat dans « un
 * plat de placard en quinze minutes », et un ingrédient dans « les lentilles corail cuisent en
 * quinze minutes ». Aucune expression rationnelle ne fait cette différence, parce qu'elle tient au
 * sujet du verbe.
 *
 * Plutôt que de tordre une phrase juste pour satisfaire un motif, l'exception se déclare ici, avec
 * sa raison. **Et sa longueur est le signal** : deux ou trois entrées, l'heuristique tient ; dix,
 * c'est qu'il faut la changer. Une liste d'exceptions qu'on allonge sans la lire est un test
 * désactivé qui n'ose pas dire son nom.
 */
const PARTIES: { slug: string; fragment: string; pourquoi: string }[] = [
  {
    slug: 'dahl-de-lentilles-corail',
    fragment: 'en quinze minutes',
    pourquoi:
      'le sujet est « les lentilles corail », pas le plat : c’est une propriété de l’ingrédient, vraie indépendamment de la recette',
  },
];

function estUnePartie(slug: string, fragment: string): boolean {
  return PARTIES.some((p) => p.slug === slug && fragment.toLowerCase().includes(p.fragment));
}

function valeur(brut: string): number | null {
  const t = brut.trim().toLowerCase();
  if (t in EN_LETTRES) return EN_LETTRES[t] ?? null;
  const chiffres = /^(\d+)$/.exec(t);
  if (chiffres?.[1]) return Number(chiffres[1]);
  // « à monter en quinze » : seul le dernier mot porte le nombre
  const dernier = t.split(/\s+/).at(-1);
  return dernier && dernier in EN_LETTRES ? (EN_LETTRES[dernier] ?? null) : null;
}

describe('les descriptions ne contredisent pas les durées', () => {
  test('toute durée totale annoncée vaut préparation + cuisson', () => {
    const fautes: string[] = [];

    for (const r of RECETTES) {
      const total = r.preparation + r.cuisson;
      for (const motif of ANNONCES) {
        for (const m of r.description.matchAll(motif)) {
          const dit = valeur(m[1] ?? '');
          if (dit === null || dit === total) continue;
          if (estUnePartie(r.slug, m[0])) continue;
          fautes.push(
            `${r.slug} : « ${m[0].trim()} » annonce ${dit} min, ` +
              `mais ${r.preparation} + ${r.cuisson} = ${total}`,
          );
        }
      }
    }

    expect(fautes).toEqual([]);
  });

  test('le motif attrape bien ce qu’il doit attraper', () => {
    // Sans ce test, une expression rationnelle qui ne trouve plus rien ferait passer le précédent
    // en silence — le pire des deux mondes : un garde-fou vert qui ne garde rien.
    const trouvees = RECETTES.flatMap((r) =>
      ANNONCES.flatMap((motif) =>
        [...r.description.matchAll(motif)].map((m) => valeur(m[1] ?? '')).filter((v) => v !== null),
      ),
    );
    expect(trouvees.length).toBeGreaterThanOrEqual(8);
  });

  test('une description qui annonce « sans cuisson » n’a pas de temps de cuisson', () => {
    // Les tartines au saumon disaient « montées en cinq minutes sans cuisson » ; leur première
    // étape est « Faites griller le pain », et `cuisson` valait 2.
    const fautes = RECETTES.filter((r) => /sans cuisson/i.test(r.description) && r.cuisson > 0).map(
      (r) => `${r.slug} : « sans cuisson » mais cuisson = ${r.cuisson}`,
    );
    expect(fautes).toEqual([]);
  });

  test('la liste d’exceptions reste courte, et chaque entrée porte encore', () => {
    // Deux gardes sur le garde-fou. La longueur d'abord : une liste qui enfle est le signe que
    // l'heuristique ne tient plus, et il vaut mieux le voir échouer que la rallonger sans y penser.
    expect(PARTIES.length).toBeLessThanOrEqual(3);

    // L'utilité ensuite : une exception dont la phrase a disparu du catalogue ne protège plus rien
    // et masquerait un vrai défaut si la tournure revenait ailleurs.
    for (const p of PARTIES) {
      const r = RECETTES.find((x) => x.slug === p.slug);
      expect(r?.description.toLowerCase()).toContain(p.fragment);
    }
  });
});
