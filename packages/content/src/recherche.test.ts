/**
 * Recherche et filtres du catalogue de recettes.
 * `bun test`
 */

import { describe, expect, test } from 'bun:test';
import { getAllRecipes } from './index';
import { aDesCriteres, aplatir, chercherRecettes } from './recherche';

const TOUTES = getAllRecipes();
const slugs = (r: ReturnType<typeof chercherRecettes>) => r.map((x) => x.slug);

describe('mise à plat du texte', () => {
  test('les accents ne comptent pas', () => {
    expect(aplatir('Poêlée')).toBe('poelee');
    expect(aplatir('Émincé')).toBe('emince');
  });

  test('les ligatures non plus', () => {
    // « Œufs » se tape « oeufs » : sans cela, la recette la plus évidente reste introuvable.
    expect(aplatir('Œufs')).toBe('oeufs');
  });

  test('l’apostrophe ne coupe pas la recherche', () => {
    expect(aplatir("l'avoine")).toBe('l avoine');
    expect(aplatir('l’avoine')).toBe('l avoine');
  });
});

describe('recherche texte', () => {
  test('sans critère, tout le catalogue ressort', () => {
    expect(chercherRecettes(TOUTES)).toHaveLength(TOUTES.length);
  });

  test('trouve par le titre, sans accent ni ligature', () => {
    expect(slugs(chercherRecettes(TOUTES, { texte: 'oeufs brouilles' }))).toContain(
      'oeufs-brouilles-au-fromage-frais',
    );
  });

  test('trouve par un ingrédient absent du titre', () => {
    // « Kala namak » n'apparaît que dans la liste d'ingrédients du tofu brouillé.
    const trouvees = slugs(chercherRecettes(TOUTES, { texte: 'kala namak' }));
    expect(trouvees).toEqual(['tofu-brouille-aux-legumes']);
  });

  test('tous les mots doivent être présents', () => {
    const deux = chercherRecettes(TOUTES, { texte: 'poulet quinoa' });
    const un = chercherRecettes(TOUTES, { texte: 'poulet' });
    expect(deux.length).toBeLessThan(un.length);
    for (const r of deux) {
      const texte = aplatir([r.titre, r.description, ...r.ingredients].join(' '));
      expect(texte).toContain('poulet');
      expect(texte).toContain('quinoa');
    }
  });

  test('une lettre isolée n’est pas un critère', () => {
    // Sinon « à » ou « l » filtrerait le catalogue au hasard des mots outils.
    expect(chercherRecettes(TOUTES, { texte: 'a' })).toHaveLength(TOUTES.length);
  });

  test('une recherche sans résultat rend une liste vide, pas tout le catalogue', () => {
    expect(chercherRecettes(TOUTES, { texte: 'chocolat blanc truffé' })).toHaveLength(0);
  });
});

describe('filtres', () => {
  test('le moment de la journée', () => {
    const matin = chercherRecettes(TOUTES, { moment: 'matin' });
    expect(matin.length).toBeGreaterThan(0);
    expect(matin.every((r) => r.moment === 'matin')).toBe(true);
    expect(matin.length).toBeLessThan(TOUTES.length);
  });

  test('la durée totale, préparation comprise', () => {
    const rapides = chercherRecettes(TOUTES, { dureeMax: 15 });
    expect(rapides.length).toBeGreaterThan(0);
    expect(rapides.every((r) => r.preparation + r.cuisson <= 15)).toBe(true);
  });

  test('les exclusions d’ingrédients suivent la même règle qu’ailleurs', () => {
    const vege = chercherRecettes(TOUTES, { exclusions: ['vegetarien'] });
    // « Végétarien » écarte aussi le poisson : c'est la règle du moteur de suggestions, et les
    // deux écrans doivent répondre pareil.
    expect(vege.every((r) => !r.contient.includes('poisson'))).toBe(true);
    expect(vege.every((r) => !r.contient.includes('viande'))).toBe(true);
  });

  test('les critères se cumulent', () => {
    const seul = chercherRecettes(TOUTES, { moment: 'plat' });
    const cumule = chercherRecettes(TOUTES, { moment: 'plat', exclusions: ['vegetarien'] });
    expect(cumule.length).toBeLessThan(seul.length);
    expect(cumule.every((r) => r.moment === 'plat')).toBe(true);
  });
});

describe('classement', () => {
  test('par protéines décroissantes', () => {
    const r = chercherRecettes(TOUTES, { tri: 'proteines' });
    for (let i = 1; i < r.length; i++) {
      expect(r[i - 1].proteines).toBeGreaterThanOrEqual(r[i].proteines);
    }
  });

  test('par durée croissante', () => {
    const r = chercherRecettes(TOUTES, { tri: 'rapide' });
    for (let i = 1; i < r.length; i++) {
      const a = r[i - 1].preparation + r[i - 1].cuisson;
      const b = r[i].preparation + r[i].cuisson;
      expect(a).toBeLessThanOrEqual(b);
    }
  });

  test('par calories croissantes', () => {
    const r = chercherRecettes(TOUTES, { tri: 'leger' });
    for (let i = 1; i < r.length; i++) expect(r[i - 1].kcal).toBeLessThanOrEqual(r[i].kcal);
  });

  test('le classement ne perd ni n’ajoute de recette', () => {
    for (const tri of ['recent', 'proteines', 'rapide', 'leger'] as const) {
      expect(chercherRecettes(TOUTES, { tri })).toHaveLength(TOUTES.length);
    }
  });

  test('le catalogue d’origine n’est pas réordonné au passage', () => {
    const avant = TOUTES.map((r) => r.slug);
    chercherRecettes(TOUTES, { tri: 'proteines' });
    expect(TOUTES.map((r) => r.slug)).toEqual(avant);
  });
});

describe('présence de critères', () => {
  test('rien de coché', () => {
    expect(aDesCriteres({})).toBe(false);
    expect(aDesCriteres({ texte: '   ' })).toBe(false);
    expect(aDesCriteres({ tri: 'proteines' })).toBe(false);
  });

  test('un critère suffit', () => {
    expect(aDesCriteres({ texte: 'poulet' })).toBe(true);
    expect(aDesCriteres({ moment: 'matin' })).toBe(true);
    expect(aDesCriteres({ dureeMax: 30 })).toBe(true);
    expect(aDesCriteres({ exclusions: ['porc'] })).toBe(true);
  });
});
