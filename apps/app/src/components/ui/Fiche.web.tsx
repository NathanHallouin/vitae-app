/**
 * La même fiche, mais dépliée sur place.
 *
 * Metro choisit ce fichier sur le web, et l'écart avec la version native n'est pas cosmétique.
 * `Fiche.tsx` ouvre une feuille par-dessus l'écran : son contenu n'existe qu'à l'ouverture. Sur le
 * site, ce serait perdre exactement le texte qui a de la valeur — les explications sont ce qu'un
 * moteur de recherche trouve à lire sur des pages dont les chiffres dépendent de l'appareil du
 * visiteur, et elles disparaîtraient du HTML livré sans que rien n'échoue.
 *
 * Le détail est donc **toujours rendu**, et seulement masqué (`display: 'none'`), comme partout
 * ailleurs dans ce dépôt. La contrepartie assumée : la page s'allonge à l'ouverture. C'est
 * supportable sur un écran large, où le repère visuel ne se perd pas au défilement, et c'est de
 * toute façon le comportement des cartes `Repliable` que le site connaît déjà.
 *
 * Aucune superposition sur le web, donc : une modale y demanderait en plus de piéger le focus, de
 * gérer la touche d'échappement et de bloquer le défilement de la page dessous — trois mécaniques
 * à écrire pour un gain nul par rapport au dépli.
 */

import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { CorpsFiche, type DonneesFiche, EnteteFiche } from './FicheContenu';
import { cx } from './primitives';

export type { DonneesFiche, SectionFiche } from './FicheContenu';

export default function Fiche({
  separateur = false,
  ...donnees
}: DonneesFiche & {
  /** trait au-dessus, quand la fiche suit une autre dans une même carte */
  separateur?: boolean;
}) {
  const [ouvert, setOuvert] = useState(false);

  return (
    <View className={cx(separateur && 'border-t border-divider')}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: ouvert }}
        accessibilityLabel={`${donnees.titre}. ${donnees.resume}`}
        accessibilityHint={ouvert ? 'Replier' : 'Déplier'}
        onPress={() => setOuvert((o) => !o)}
        className="active:opacity-70"
      >
        <EnteteFiche {...donnees} ouvert={ouvert} action={ouvert ? 'Replier' : 'En savoir plus'} />
      </Pressable>

      {/* Aligné sous le titre et non sous la pastille : le retrait rattache le détail à sa ligne. */}
      <View style={{ display: ouvert ? 'flex' : 'none' }} className="pb-4 pl-11">
        <CorpsFiche sections={donnees.sections} />
      </View>
    </View>
  );
}
