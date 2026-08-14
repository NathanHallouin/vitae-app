import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import ProfileBar from './ProfileBar';
import Page from './ui/Page';

/**
 * Le cadre commun des écrans de résultats : rappel du profil, contenu, avertissement.
 *
 * L'équivalent de `apps/web/src/app/(resultats)/layout.tsx`. Comme sur le site, l'écran ne bloque
 * pas en l'absence de profil : les explications valent d'être lues sans avoir rien calculé, et ce
 * sont les composants internes qui proposent la saisie quand ils n'ont pas de chiffres à montrer.
 *
 * Le défilement ne conserve pas sa position d'un onglet à l'autre par accident : les écrans
 * restant montés, `ScrollView` garde son décalage. Revenir sur un onglet le retrouve exactement où
 * on l'avait laissé, ce qui est le comportement attendu d'une application native.
 */
export default function ResultScreen({ children }: { children: ReactNode }) {
  return (
    <Page
      // Le clavier se referme dès qu'on touche ailleurs : sans cela, il masque la moitié des
      // chiffres sur l'écran du poids cible.
      keyboardShouldPersistTaps="handled"
    >
      <ProfileBar />
      {children}
      <View className="mt-8">
        <Text className="text-caption leading-[19px] text-faint">
          Ces chiffres sont une estimation, pas un avis médical. La dépense réelle varie d’environ
          10 % d’une personne à l’autre. En cas de doute, parlez-en à un médecin ou à un
          diététicien.
        </Text>
      </View>
    </Page>
  );
}
