import { Text, type TextProps } from 'react-native';

/**
 * Un titre, et son rang dans le document.
 *
 * `accessibilityRole="header"` seul ne suffit pas, et c'est un piège discret : `react-native-web`
 * rend alors un `<h1>`, toujours, quel que soit l'endroit où le titre se trouve. Une page de
 * recette sortait donc avec deux `<h1>` et aucun `<h2>`, et l'index des recettes avec un seul
 * titre pour soixante-deux entrées — un document sans structure, pour un moteur de recherche
 * comme pour qui parcourt une page au lecteur d'écran.
 *
 * Le rang se donne par `aria-level`, que `propsToAccessibilityComponent` lit pour choisir entre
 * `h1` et `h6`. Les types de React Native ne le déclarent pas — un téléphone n'a pas de document
 * à structurer, et le rôle `header` y annonce un titre sans niveau — d'où le transtypage, cantonné
 * à ce fichier plutôt que répété à chaque titre.
 *
 * La règle qui va avec, et que rien ne vérifie automatiquement : **un seul niveau 1 par écran**,
 * celui qui dit de quoi parle la page. Tout le reste descend d'un cran.
 */
type PropsNiveau = TextProps & { 'aria-level'?: number };

const TexteTitre = Text as React.ComponentType<PropsNiveau>;

export default function Titre({ niveau, children, ...rest }: { niveau: 1 | 2 | 3 } & TextProps) {
  return (
    <TexteTitre accessibilityRole="header" aria-level={niveau} {...rest}>
      {children}
    </TexteTitre>
  );
}
