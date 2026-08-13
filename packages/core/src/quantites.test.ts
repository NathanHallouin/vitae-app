/**
 * Mise à l'échelle des quantités.
 * `bun test`
 */

import { describe, expect, test } from 'bun:test';
import { formatQuantite, scaleIngredient } from './quantites';

describe('écriture des quantités', () => {
  test('les fractions courantes s’écrivent en fraction, pas en décimal', () => {
    expect(formatQuantite(0.5)).toBe('½');
    expect(formatQuantite(1.5)).toBe('1 ½');
    expect(formatQuantite(0.25)).toBe('¼');
    expect(formatQuantite(2.75)).toBe('2 ¾');
  });

  test('au-delà de 10, l’unité près suffit : personne ne pèse 337,5 g', () => {
    expect(formatQuantite(337.5)).toBe('338');
    expect(formatQuantite(600)).toBe('600');
  });

  test('les petites valeurs gardent une décimale, à la française', () => {
    expect(formatQuantite(2.2)).toBe('2,2');
    expect(formatQuantite(3)).toBe('3');
  });
});

describe('mise à l’échelle d’un ingrédient', () => {
  test('un facteur de 1 ne reformate rien', () => {
    expect(scaleIngredient('20 cl de lait de coco', 1)).toBe('20 cl de lait de coco');
  });

  test('une ligne sans quantité reste intacte : on ne double pas l’assaisonnement', () => {
    expect(scaleIngredient('Sel, poivre, coriandre fraîche', 3)).toBe(
      'Sel, poivre, coriandre fraîche',
    );
  });

  test('diviser accorde au singulier', () => {
    expect(scaleIngredient('2 carottes en rondelles', 0.5)).toBe('1 carotte en rondelles');
    expect(scaleIngredient("2 gousses d'ail", 0.5)).toBe("1 gousse d'ail");
    expect(scaleIngredient('2 cuillères à soupe de curry', 0.5)).toBe(
      '1 cuillère à soupe de curry',
    );
  });

  test('multiplier accorde au pluriel', () => {
    expect(scaleIngredient('1 courgette en demi-lunes', 2)).toBe('2 courgettes en demi-lunes');
    expect(scaleIngredient('1 oignon émincé', 3)).toBe('3 oignons émincé');
  });

  test('sous 2, le français reste au singulier', () => {
    expect(scaleIngredient('1 courgette en demi-lunes', 1.5)).toBe('1 ½ courgette en demi-lunes');
    expect(scaleIngredient('2 carottes en rondelles', 0.75)).toBe('1 ½ carotte en rondelles');
  });

  test('les unités ne prennent jamais de pluriel', () => {
    expect(scaleIngredient('300 g de poulet', 2)).toBe('600 g de poulet');
    expect(scaleIngredient('20 cl de lait de coco', 2)).toBe('40 cl de lait de coco');
    expect(scaleIngredient('1 kg de pommes de terre', 2)).toBe('2 kg de pommes de terre');
  });

  test('les mots dont le « s » est dans le mot ne sont pas amputés', () => {
    expect(scaleIngredient('2 ananas', 0.5)).toBe('1 ananas');
    expect(scaleIngredient('200 g de riz', 0.5)).toBe('100 g de riz');
  });
});
