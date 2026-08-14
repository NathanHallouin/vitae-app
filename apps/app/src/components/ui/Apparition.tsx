import { Children, type ReactNode, useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { delaiCascade, MOTION, useMotionReduite } from '@/theme/motion';

/**
 * Les cartes d'un écran arrivent l'une après l'autre, de bas en haut.
 *
 * Ce que cela apporte, et qui n'est pas décoratif : sur un écran qui empile huit cartes, une
 * arrivée simultanée ne donne aucun ordre de lecture. Décalées de soixante millisecondes, elles
 * dessinent une direction — on lit du haut vers le bas parce que c'est dans cet ordre qu'elles se
 * sont posées.
 *
 * Le décalage est plafonné : sans cela, la neuvième carte arriverait une demi-seconde après la
 * première, et le rythme deviendrait de l'attente.
 *
 * Rien ne se joue au retour sur un écran, seulement au montage. Les onglets restent montés et
 * gelés, donc l'animation ne rejoue pas à chaque aller-retour — ce qui serait insupportable au
 * dixième passage.
 *
 * L'animation est écrite à la main plutôt qu'avec `entering` de Reanimated, et ce n'est pas un
 * choix de style. Sur le web, `entering` sort l'élément du flux le temps de l'animation : les
 * blocs suivants remontent et se superposent au titre. Ici on n'anime que l'opacité et une
 * translation, deux propriétés qui ne touchent jamais à la mise en page.
 */
export default function Apparition({
  children,
  depuis = 0,
}: {
  children: ReactNode;
  /** rang du premier enfant dans la cascade, quand l'écran a déjà animé des éléments au-dessus */
  depuis?: number;
}) {
  const reduite = useMotionReduite();
  const enfants = Children.toArray(children);

  // Réglage « moins de mouvement » : l'état final, directement. Aucune de ces animations ne porte
  // d'information que l'immobilité ferait perdre.
  if (reduite) return <>{children}</>;

  return (
    <>
      {enfants.map((enfant, i) => (
        // L'ordre est fixe et les cartes n'ont pas d'identité propre : l'index fait une clé stable.
        // biome-ignore lint/suspicious/noArrayIndexKey: liste statique, jamais réordonnée
        <Bloc key={i} delai={delaiCascade(i + depuis)}>
          {enfant}
        </Bloc>
      ))}
    </>
  );
}

function Bloc({ delai, children }: { delai: number; children: ReactNode }) {
  const avancement = useSharedValue(0);

  useEffect(() => {
    avancement.value = withDelay(delai, withTiming(1, { duration: MOTION.normal }));
  }, [avancement, delai]);

  const style = useAnimatedStyle(() => ({
    opacity: avancement.value,
    // Une translation courte : au-delà d'une quinzaine de points, le mouvement se remarque plus que
    // le contenu qu'il amène.
    transform: [{ translateY: (1 - avancement.value) * 12 }],
  }));

  return <Animated.View style={style}>{children}</Animated.View>;
}
