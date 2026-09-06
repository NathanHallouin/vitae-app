import { NavigationBar } from 'expo-navigation-bar';

/**
 * Masque la barre de navigation d'Android : l'application prend tout l'écran.
 *
 * Depuis Android 15, une application dessine **sous** les barres système — le fond passe derrière
 * les trois boutons, et `BarreSections` réserve `insets.bottom` pour que ses libellés ne finissent
 * pas dessous. C'est le comportement voulu par le système, mais ce n'est pas un plein écran : les
 * boutons restent posés par-dessus. Ici on les retire.
 *
 * **Composant plutôt qu'un appel dans un effet.** `setVisibilityAsync('hidden')` au montage se
 * défait tout seul : le système réaffiche la barre au retour d'arrière-plan, et après le balayage
 * qui la rappelle. Le composant, lui, garde l'état appliqué tant qu'il est monté — c'est ce que
 * `expo-navigation-bar` recommande depuis que l'edge-to-edge a supprimé `setBehaviorAsync`.
 *
 * Il rend `null` : rien à placer dans la mise en page, seulement un effet de bord déclaré là où on
 * le lit. Sur iOS il n'y a pas de barre logicielle à masquer, et le paquet n'y fait rien.
 */
export default function PleinEcran() {
  return <NavigationBar hidden />;
}
