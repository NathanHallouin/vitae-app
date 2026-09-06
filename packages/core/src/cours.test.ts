/**
 * Ce que ce fichier protège : le cours est une suite ordonnée d'adresses publiques. Un slug qui
 * change casse un lien indexé et remet la progression de tout le monde à zéro ; un slug en double
 * fait pointer deux notions sur la même page. Ni l'un ni l'autre ne se voit à l'écran.
 * `bun test`
 */

import { describe, expect, test } from 'bun:test';
import {
  CHAPITRES,
  CONTEXTE_PAR_DRAPEAU,
  CONTEXTE_PROGRESSION,
  DRAPEAUX_PAR_ECRAN,
  encartDeLEcran,
  NOTION_PAR_DRAPEAU,
  NOTIONS,
  nombreDeLues,
  notionParSlug,
  notionSuivante,
  prochaineNotion,
  routeNotion,
  TOTAL_NOTIONS,
} from './cours';

describe('les seize notions', () => {
  test('sont les quatre chapitres mis bout à bout', () => {
    expect(TOTAL_NOTIONS).toBe(16);
    expect(CHAPITRES).toHaveLength(4);
    expect(NOTIONS).toHaveLength(CHAPITRES.reduce((n, c) => n + c.items.length, 0));
  });

  test('portent des identifiants uniques', () => {
    expect(new Set(NOTIONS.map((n) => n.slug)).size).toBe(TOTAL_NOTIONS);
  });

  test('n’ont que des identifiants utilisables dans une adresse', () => {
    for (const notion of NOTIONS) {
      expect(notion.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(encodeURIComponent(notion.slug)).toBe(notion.slug);
    }
  });

  test('sont numérotées de 1 à 16, dans l’ordre des chapitres', () => {
    expect(NOTIONS.map((n) => n.rang)).toEqual(
      Array.from({ length: TOTAL_NOTIONS }, (_, i) => i + 1),
    );
    expect(NOTIONS[0].chapitre.slug).toBe(CHAPITRES[0].slug);
    expect(NOTIONS[TOTAL_NOTIONS - 1].chapitre.slug).toBe(CHAPITRES[3].slug);
  });

  test('gardent le texte de leur chapitre, sans le reformuler', () => {
    for (const chapitre of CHAPITRES) {
      for (const item of chapitre.items) {
        const notion = notionParSlug(item.slug);
        expect(notion?.texte).toBe(item.texte);
        expect(notion?.resume).toBe(item.resume);
        expect(notion?.ecran).toEqual(chapitre.ecran);
      }
    }
  });
});

describe('parcours', () => {
  test('chaque notion mène à la suivante, la dernière à rien', () => {
    for (let i = 0; i < TOTAL_NOTIONS - 1; i++) {
      expect(notionSuivante(NOTIONS[i].slug)?.slug).toBe(NOTIONS[i + 1].slug);
    }
    expect(notionSuivante(NOTIONS[TOTAL_NOTIONS - 1].slug)).toBeNull();
  });

  test('un identifiant inconnu ne mène nulle part plutôt qu’au début', () => {
    expect(notionParSlug('inventé')).toBeNull();
    expect(notionSuivante('inventé')).toBeNull();
  });

  test('la proposition est la première non lue, quel que soit l’ordre de lecture', () => {
    expect(prochaineNotion([])?.rang).toBe(1);
    // Lire la troisième avant la première ne fait pas sauter la première.
    expect(prochaineNotion([NOTIONS[2].slug])?.rang).toBe(1);
    expect(prochaineNotion([NOTIONS[0].slug, NOTIONS[1].slug])?.rang).toBe(3);
  });

  test('rien à proposer une fois les seize lues', () => {
    expect(prochaineNotion(NOTIONS.map((n) => n.slug))).toBeNull();
  });
});

describe('nombreDeLues', () => {
  test('ignore les doublons et les identifiants devenus inconnus', () => {
    const slug = NOTIONS[0].slug;
    expect(nombreDeLues([slug, slug, 'notion-retirée'])).toBe(1);
    expect(nombreDeLues([])).toBe(0);
  });
});

describe('table des déclencheurs', () => {
  test('ne désigne que des notions qui existent', () => {
    for (const slug of Object.values(NOTION_PAR_DRAPEAU)) {
      expect(notionParSlug(slug)).not.toBeNull();
    }
  });
});

describe('routeNotion', () => {
  test('donne une adresse absolue sous le cours', () => {
    expect(routeNotion('pourquoi-une-fourchette')).toBe('/comprendre/pourquoi-une-fourchette');
  });
});

describe('encartDeLEcran', () => {
  const tout = NOTIONS.map((n) => n.slug);

  test('un drapeau levé passe avant la suite du cours', () => {
    const encart = encartDeLEcran('/alimentation', { fourchetteRelevee: true }, []);
    expect(encart?.notion.slug).toBe(NOTION_PAR_DRAPEAU.fourchetteRelevee);
    expect(encart?.contexte).toBe(CONTEXTE_PAR_DRAPEAU.fourchetteRelevee);
  });

  test('sans drapeau, il propose la première notion non lue', () => {
    const encart = encartDeLEcran('/alimentation', {}, [NOTIONS[0].slug]);
    expect(encart?.notion.rang).toBe(2);
    expect(encart?.contexte).toBe(CONTEXTE_PROGRESSION);
  });

  test('un drapeau d’un autre écran ne se montre pas ici', () => {
    // `quotidienSature` appartient à « Bouger » : levé, il ne doit rien changer sur l'assiette.
    const encart = encartDeLEcran('/alimentation', { quotidienSature: true }, []);
    expect(encart?.contexte).toBe(CONTEXTE_PROGRESSION);
  });

  /**
   * Le cas qui a échappé aux huit tests précédents, et qui était faux en production.
   *
   * L'écran redéduisait de son côté « est-ce l'encart de progression ? » en regardant si un drapeau
   * quelconque était levé — tous écrans confondus. Un poids vieux de huit jours (`poidsPerime`,
   * qui appartient à « Mon poids ») faisait donc disparaître « Plus tard » du métabolisme.
   *
   * `source` est là pour que cette question ne se repose jamais ailleurs : elle a une réponse, et
   * c'est celle-ci.
   */
  test('la source dit lequel des deux cas s’est produit, pas les drapeaux levés', () => {
    // Un drapeau d'un autre écran est levé : l'encart reste celui de la progression.
    const ailleurs = encartDeLEcran('/metabolisme', { poidsPerime: true }, []);
    expect(ailleurs?.source).toBe('progression');

    // Le drapeau de l'écran est levé : c'est lui.
    const ici = encartDeLEcran('/metabolisme', { imcHorsNorme: true }, []);
    expect(ici?.source).toBe('drapeau');

    // Le drapeau de l'écran est levé mais sa notion est lue : retour à la progression.
    const lue = encartDeLEcran('/metabolisme', { imcHorsNorme: true }, [
      NOTION_PAR_DRAPEAU.imcHorsNorme,
    ]);
    expect(lue?.source).toBe('progression');
  });

  test('deux drapeaux levés n’en montrent qu’un, le premier de la liste', () => {
    const encart = encartDeLEcran(
      '/alimentation',
      { fourchetteRelevee: true, proteinesAjustees: true },
      [],
    );
    expect(encart?.notion.slug).toBe(NOTION_PAR_DRAPEAU.fourchetteRelevee);
  });

  test('une notion déjà lue ne rejoue pas son drapeau', () => {
    const encart = encartDeLEcran('/alimentation', { fourchetteRelevee: true }, [
      NOTION_PAR_DRAPEAU.fourchetteRelevee,
    ]);
    expect(encart?.contexte).toBe(CONTEXTE_PROGRESSION);
  });

  test('plus rien à montrer une fois les seize lues', () => {
    expect(encartDeLEcran('/alimentation', {}, tout)).toBeNull();
    expect(encartDeLEcran('/alimentation', { fourchetteRelevee: true }, tout)).toBeNull();
  });

  test('un écran hors de la table ne lève aucun drapeau', () => {
    const encart = encartDeLEcran('/recettes', { fourchetteRelevee: true }, []);
    expect(encart?.contexte).toBe(CONTEXTE_PROGRESSION);
  });

  test('la table des écrans ne cite que des drapeaux connus', () => {
    for (const drapeaux of Object.values(DRAPEAUX_PAR_ECRAN)) {
      for (const d of drapeaux) {
        expect(NOTION_PAR_DRAPEAU[d]).toBeDefined();
        expect(CONTEXTE_PAR_DRAPEAU[d]).toBeDefined();
      }
    }
  });
});
