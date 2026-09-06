/**
 * Faux au premier rendu web, vrai ensuite.
 *
 * ## Ce que ça répare
 *
 * Le site est pré-rendu sous Node, qui ne sait rien du thème du visiteur : le HTML livré est donc
 * toujours en clair. Si le premier rendu du navigateur, lui, part en sombre, les deux arbres ne
 * correspondent pas — et React 18 ne répare **pas** les attributs divergents quand l'hydratation
 * réussit malgré tout. Le `fill` d'un tracé SVG reste alors celui du pré-rendu, pour toujours.
 *
 * Ce n'est pas une hypothèse. Sur l'export statique, préférence enregistrée « sombre » :
 *
 *     largeur 390 px  →  disque du cadran `#e7e6f0`   (palette claire, faux)
 *     largeur 430 px  →  disque du cadran `#e7e6f0`   (palette claire, faux)
 *     largeur 700 px  →  disque du cadran `#1c1b2a`   (palette sombre, juste)
 *     largeur 1280 px →  disque du cadran `#1c1b2a`   (palette sombre, juste)
 *
 * Le seuil est `NAV_BREAKPOINT`. Au-dessus, le navigateur rend un `<nav>` que le pré-rendu n'a pas,
 * l'hydratation échoue franchement, React jette l'arbre servi et refait tout — ce qui repeint les
 * couleurs au passage. **En dessous, l'arbre servi correspond, l'hydratation réussit, et la page
 * reste à moitié claire** : fonds et textes en sombre par le CSS, tracés SVG et icônes en clair par
 * `usePalette`. C'est-à-dire précisément sur téléphone, la cible principale.
 *
 * `ROADMAP.md` décrivait la conséquence à l'envers — « React jette l'arbre servi et refait tout
 * côté client », donc une simple peinture perdue. C'est vrai sur grand écran seulement, et l'entrée
 * a été corrigée.
 *
 * ## Ce que ça ne répare pas
 *
 * L'autre cause d'écart reste entière : `useWindowDimensions()` vaut 0 sous Node, donc `useLarge`,
 * `useColumns` et le `<nav>` divergent encore. Les brancher ici coûterait une peinture en mise en
 * page mobile avant bascule sur écran large — le prix que `ROADMAP.md` réserve à un arbitrage.
 * Le thème, lui, ne coûte rien de plus : la classe CSS était **déjà** posée dans un effet, donc
 * après le premier rendu. Aligner `usePalette` dessus ne fait que remettre les deux moitiés du
 * thème d'accord.
 */

import { useEffect, useState } from 'react';

export function useHydrate(): boolean {
  const [hydrate, setHydrate] = useState(false);
  // Vide en dépendances : une seule bascule, au montage, et jamais de retour en arrière.
  useEffect(() => setHydrate(true), []);
  return hydrate;
}
