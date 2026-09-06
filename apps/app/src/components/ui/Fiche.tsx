/**
 * Une explication courte, et son détail dans une feuille qui monte.
 *
 * C'est le motif d'explication de l'application, et il répond à un défaut qu'on retrouvait partout :
 * chaque écran finissait par accumuler des paragraphes justes mais longs, que personne ne lit parce
 * que rien ne dit lesquels valent le détour. Le repli seul ne suffisait pas — une carte dépliée
 * repousse tout le reste vers le bas, et la page redevient un mur.
 *
 * D'où le découpage, appliqué de la même façon partout :
 *
 * — **la ligne courte** dit le sujet, un ordre de grandeur et une phrase. Elle se lit d'un coup
 *   d'œil, et elle suffit à décider dans la grande majorité des cas ;
 * — **le détail** ne s'ouvre que si on le demande, et il s'ouvre *par-dessus* la page plutôt que
 *   dedans : on lit, on referme, et on retrouve la liste exactement où on l'avait laissée.
 *
 * La feuille monte du bas parce que c'est le bord que le pouce atteint : le geste pour fermer —
 * appuyer à côté, ou toucher la croix — est à portée sans changer de main.
 *
 * **Sur le web, ce fichier n'est pas utilisé.** Metro choisit `Fiche.web.tsx`, qui déplie le détail
 * sur place en le laissant dans le document. Une feuille n'existe qu'à l'ouverture : son contenu ne
 * serait pas dans le HTML livré, et c'est précisément ce texte-là qu'un moteur de recherche vient
 * lire sur des pages dont les chiffres, eux, dépendent de l'appareil du visiteur.
 */

import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMotionReduite } from '@/theme/motion';
import { usePalette } from '@/theme/palette';
import { CorpsFiche, type DonneesFiche, EnteteFiche } from './FicheContenu';
import Icon from './Icon';
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
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const reduite = useMotionReduite();

  return (
    <View className={cx(separateur && 'border-t border-divider')}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: ouvert }}
        accessibilityLabel={`${donnees.titre}. ${donnees.resume}`}
        accessibilityHint="Ouvrir le détail"
        onPress={() => setOuvert(true)}
        className="active:opacity-70"
      >
        <EnteteFiche {...donnees} action="En savoir plus" />
      </Pressable>

      <Modal
        visible={ouvert}
        transparent
        // Le réglage « moins de mouvement » supprime la montée plutôt que de la ralentir : une
        // translation lente reste une translation, et c'est elle qui gêne.
        animationType={reduite ? 'none' : 'slide'}
        // Le bouton retour d'Android referme la feuille et ne quitte pas l'écran.
        onRequestClose={() => setOuvert(false)}
        statusBarTranslucent
        accessibilityViewIsModal
      >
        {/* Le voile est lui-même le bouton « fermer » : c'est le geste qu'on tente en premier, et
            il doit marcher. Il porte un libellé, sinon un lecteur d'écran annonce un bouton vide
            occupant tout l'écran. */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer le détail"
          onPress={() => setOuvert(false)}
          className="flex-1"
          style={{ backgroundColor: palette.scrim }}
        />

        <View
          className="max-h-[82%] rounded-t-[24px] border-t border-divider bg-surface px-6 pt-3"
          // La feuille s'arrête au-dessus de la barre de gestes : sans cela, le dernier paragraphe
          // se lit sous le trait d'accueil d'un iPhone.
          style={{ paddingBottom: insets.bottom + 24 }}
        >
          {/* La poignée ne fait rien — la feuille ne se tire pas — mais elle dit d'un coup d'œil
              que ce panneau est temporaire et qu'il se referme. */}
          <View aria-hidden className="mb-4 h-1 w-10 self-center rounded-full bg-divider" />

          <View className="mb-4 flex-row items-start justify-between gap-4">
            <Text className="min-w-0 flex-1 font-display text-h3 leading-[26px] text-ink">
              {donnees.titre}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fermer"
              onPress={() => setOuvert(false)}
              // 44 px de côté : la cible minimale confortable pour un pouce.
              className="size-11 flex-none items-center justify-center rounded-full active:bg-surface2"
              style={{ marginTop: -10, marginRight: -10 }}
            >
              <Icon name="croix" size={18} color={palette.muted} />
            </Pressable>
          </View>

          {donnees.chiffre ? (
            <Text
              style={{ fontVariant: ['tabular-nums'] }}
              className="mb-4 text-small font-sans-medium text-primary-ink"
            >
              {donnees.chiffre}
            </Text>
          ) : null}

          {/* Un détail peut être long : il défile à l'intérieur de la feuille, pas la page dessous.
              `alwaysBounceVertical` désactivé, sinon un texte court rebondit sans avoir de quoi
              défiler, ce qui laisse croire qu'il manque quelque chose. */}
          <ScrollView alwaysBounceVertical={false} showsVerticalScrollIndicator={false}>
            <CorpsFiche sections={donnees.sections} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
