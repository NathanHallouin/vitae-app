import { MOTION } from '@vitae/core/tokens';
import { useReducedMotion } from 'react-native-reanimated';

export { MOTION };

/**
 * L'utilisateur a-t-il demandé moins de mouvement ?
 *
 * Ce n'est pas une préférence esthétique. Les animations d'entrée et de défilement déclenchent des
 * nausées et des vertiges chez les personnes sujettes au mal des transports vestibulaire, et les
 * deux systèmes exposent un réglage pour cela — « Réduire les animations » sur iOS, « Supprimer les
 * animations » sur Android, `prefers-reduced-motion` dans un navigateur. Reanimated lit les trois.
 *
 * La règle appliquée partout dans cette application : quand c'est vrai, on ne ralentit pas le
 * mouvement, on le supprime. Un fondu lent reste un mouvement. L'état final s'affiche directement,
 * et rien n'est perdu — aucune de nos animations ne porte d'information à elle seule.
 */
export function useMotionReduite(): boolean {
  return useReducedMotion();
}

/**
 * Le délai d'un élément dans une arrivée en cascade, borné.
 *
 * Sans plafond, la neuvième carte d'un écran arriverait plus d'une demi-seconde après la première :
 * ce qui devait donner du rythme se transformerait en attente.
 */
export function delaiCascade(rang: number, max = 6): number {
  return Math.min(rang, max) * MOTION.cascade;
}
