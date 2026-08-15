import type { Explainer as ExplainerData } from '@vitae/core/explainers';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';
import Icon from '@/components/ui/Icon';
import { Card, cx } from '@/components/ui/primitives';
import Titre from '@/components/ui/Titre';
import { versRoute } from '@/lib/route';
import { MOTION, useMotionReduite } from '@/theme/motion';
import { usePalette } from '@/theme/palette';

/**
 * Les explications d'un écran de résultats, en parcours plutôt qu'en pavé.
 *
 * Le texte vient de `@vitae/core/explainers`, partagé par les trois plateformes : il n'y a qu'un
 * endroit où le corriger. Ne reste ici que la mise en page — et c'est elle qui posait problème.
 *
 * Quatre longs paragraphes dépliés d'un bloc, sans rien annoncer, se lisaient comme un fourre-tout
 * et se sautaient en entier : beaucoup de matière, mais rien pour décider par où entrer. Trois
 * choses y remédient, et aucune ne retire une ligne de contenu :
 *
 * — le fil, en tête, annonce ce qu'on va lire et dans quel ordre ;
 * — les questions sont numérotées et repliées : la carte tient en un écran et se parcourt du
 *   regard, on ouvre ce qui intéresse ;
 * — la dernière ligne renvoie à l'écran suivant, ce qui relie quatre cartes indépendantes en une
 *   seule progression.
 *
 * Une seule question ouverte à la fois. C'est le point : rouvrir tout d'un coup ramènerait le
 * pavé. La première l'est d'emblée, pour qu'on voie tout de suite de quoi il retourne.
 *
 * Les textes fermés restent dans le document — `display: 'none'` plutôt qu'un rendu conditionnel.
 * Sur le web, ils comptent : ce sont eux qui donnent à lire quelque chose à un moteur de recherche
 * sur des pages dont les chiffres, eux, dépendent de l'appareil du visiteur.
 */
export default function Explainer({ data }: { data: ExplainerData }) {
  const [ouvert, setOuvert] = useState(0);
  const palette = usePalette();

  return (
    <Card taille className="mt-6 p-6">
      <Titre niveau={2} className="mb-2 font-display text-h3 text-ink">
        {data.title}
      </Titre>
      <Text className="font-sans mb-5 text-base leading-[22px] text-muted">{data.fil}</Text>

      <View className="border-t border-divider">
        {data.items.map((item, i) => {
          const actif = i === ouvert;
          return (
            <View key={item.titre} className="border-b border-divider">
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: actif }}
                accessibilityLabel={item.titre}
                accessibilityHint={actif ? 'Replier' : 'Déplier'}
                // Replier une question ouverte referme tout : il reste alors le sommaire seul,
                // ce qui est parfois exactement ce qu'on veut.
                onPress={() => setOuvert(actif ? -1 : i)}
                className="flex-row items-center gap-3 py-4 active:opacity-70"
              >
                <View
                  className={cx(
                    'size-6 flex-none items-center justify-center rounded-full',
                    actif ? 'bg-primary-ink' : 'bg-primary-tint',
                  )}
                >
                  <Text
                    style={{ fontVariant: ['tabular-nums'] }}
                    className={cx(
                      'text-caption font-sans-bold',
                      actif ? 'text-hero-text' : 'text-primary-ink',
                    )}
                  >
                    {i + 1}
                  </Text>
                </View>

                <Text
                  className={cx(
                    'min-w-0 flex-1 text-option font-sans-medium',
                    actif ? 'text-primary-ink' : 'text-ink',
                  )}
                >
                  {item.titre}
                </Text>

                <Chevron actif={actif} />
              </Pressable>

              <View style={{ display: actif ? 'flex' : 'none' }}>
                {/* Aligné sous le titre, pas sous la puce : le retrait rattache visuellement la
                    réponse à sa question. */}
                <Text className="font-sans mb-4 pl-9 text-base leading-[22px] text-muted">
                  {item.texte}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <Link href={versRoute(data.suite.href)} asChild>
        <Pressable
          accessibilityRole="link"
          className="mt-5 flex-row items-center gap-2 self-start rounded-control py-1 active:opacity-70"
        >
          <Text className="text-base font-sans-semibold text-primary-ink">{data.suite.label}</Text>
          <Icon name="flecheDroite" size={15} color={palette.primaryInk} />
        </Pressable>
      </Link>
    </Card>
  );
}

/** La même flèche, tournée d'un demi-tour quand la question s'ouvre. */
function Chevron({ actif }: { actif: boolean }) {
  const palette = usePalette();
  const reduite = useMotionReduite();
  const rotation = useDerivedValue(() =>
    withTiming(actif ? 1 : 0, { duration: reduite ? 0 : MOTION.rapide }),
  );
  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 180}deg` }],
  }));

  return (
    <Animated.View style={style}>
      <Icon name="flecheBas" size={16} color={actif ? palette.primaryInk : palette.muted2} />
    </Animated.View>
  );
}
