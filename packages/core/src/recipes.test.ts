/**
 * Ce que ce fichier protège : le compte de résultats de l'index des recettes.
 *
 * La règle tient en une phrase — **le même état se lit pareil partout**. Le libellé était écrit
 * deux fois dans `FiltresRecettes.tsx`, une fois par largeur d'écran, et les deux avaient divergé.
 * Un test sur la fonction seule suffit à empêcher que ça recommence : il n'y a plus qu'un endroit
 * où le texte existe, et il est vérifié.
 *
 * Les cas ne sont pas décoratifs. Le pluriel de zéro et celui de un sont les deux que le français
 * traite à l'envers de l'intuition anglophone, et ce sont exactement ceux qu'une formulation en
 * dur rate.
 *
 * `bun test`
 */

import { describe, expect, test } from 'bun:test';
import { compteurRecettes } from './recipes';

describe('compteurRecettes', () => {
  test('sans filtre actif, il annonce le catalogue entier', () => {
    expect(compteurRecettes(62, 62)).toBe('62 recettes');
  });

  test('un catalogue d’une seule recette ne dit pas « 1 recettes »', () => {
    expect(compteurRecettes(1, 1)).toBe('1 recette');
  });

  test('filtré, il donne les deux nombres et accorde le premier', () => {
    expect(compteurRecettes(8, 62)).toBe('8 recettes sur 62');
    expect(compteurRecettes(1, 62)).toBe('1 recette sur 62');
  });

  test('zéro prend le singulier, comme en français', () => {
    expect(compteurRecettes(0, 62)).toBe('0 recette sur 62');
  });
});
