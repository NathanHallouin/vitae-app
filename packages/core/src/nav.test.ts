import { describe, expect, test } from 'bun:test';
import { destinationAuDemarrage, MOBILE_PAGES, RESULT_PAGES, SECTIONS, sectionDe } from './nav';

describe('destinationAuDemarrage', () => {
  test('la pesée périmée passe avant tout : c’est le seul cas où il y a un geste à faire', () => {
    expect(destinationAuDemarrage({ peseePerimee: true, profilModifie: true })).toBe('/poids');
    expect(destinationAuDemarrage({ peseePerimee: true, profilModifie: false })).toBe('/poids');
  });

  test('un profil modifié ouvre sur le calcul qui vient d’être refait', () => {
    expect(destinationAuDemarrage({ peseePerimee: false, profilModifie: true })).toBe(
      '/metabolisme',
    );
  });

  test('le cas ordinaire est l’assiette du jour', () => {
    expect(destinationAuDemarrage({ peseePerimee: false, profilModifie: false })).toBe(
      '/alimentation',
    );
  });

  test('les trois arrivées sont des destinations qui existent dans le plan', () => {
    const connues = new Set(MOBILE_PAGES.map((p) => p.href));
    for (const peseePerimee of [true, false]) {
      for (const profilModifie of [true, false]) {
        expect(connues.has(destinationAuDemarrage({ peseePerimee, profilModifie }))).toBe(true);
      }
    }
  });
});

describe('plan de navigation', () => {
  test('la barre du bas reprend les pages de résultats, dans le même ordre', () => {
    expect(MOBILE_PAGES.slice(0, RESULT_PAGES.length)).toEqual(RESULT_PAGES);
  });

  test('aucune destination n’est déclarée deux fois', () => {
    expect(new Set(MOBILE_PAGES.map((p) => p.href)).size).toBe(MOBILE_PAGES.length);
  });
});

describe('sectionDe', () => {
  test('range chaque écran dans sa section', () => {
    expect(sectionDe('/metabolisme')?.cle).toBe('chiffres');
    expect(sectionDe('/bouger')?.cle).toBe('chiffres');
    expect(sectionDe('/recettes')?.cle).toBe('recettes');
    expect(sectionDe('/comprendre')?.cle).toBe('comprendre');
    expect(sectionDe('/profil')?.cle).toBe('profil');
  });

  test('un détail reste dans la section de son index', () => {
    expect(sectionDe('/recettes/curry-de-poulet')?.cle).toBe('recettes');
    expect(sectionDe('/comprendre/pourquoi-une-fourchette')?.cle).toBe('comprendre');
    // Les réglages et la confidentialité sont des sous-pages du profil : la barre ne doit pas se
    // vider quand on les ouvre.
    expect(sectionDe('/reglages')?.cle).toBe('profil');
    expect(sectionDe('/confidentialite')?.cle).toBe('profil');
  });

  test('l’accueil n’est dans aucune section', () => {
    expect(sectionDe('/')).toBeNull();
  });

  test('compare sur le segment entier, pas sur le début de chaîne', () => {
    // Sans la coupe au `/`, `/recettes-du-jour` tomberait dans la section des recettes.
    expect(sectionDe('/recettes-du-jour')).toBeNull();
    expect(sectionDe('/comprendre-vite')).toBeNull();
  });

  test('les quatre écrans de résultats forment une seule section', () => {
    const cles = new Set(RESULT_PAGES.map((p) => sectionDe(p.href)?.cle));
    expect([...cles]).toEqual(['chiffres']);
  });

  test('chaque section a une racine qui lui appartient', () => {
    for (const s of SECTIONS) expect(sectionDe(s.racine)?.cle).toBe(s.cle);
  });
});
