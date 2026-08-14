import { type ReactNode, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { usePalette } from '@/theme/palette';
import Icon from './Icon';
import { Card, cx } from './primitives';

/**
 * Une carte qui se replie, avec de quoi décider sans l'ouvrir.
 *
 * L'écran « Bouger » empilait treize cartes de même poids visuel : le programme d'entraînement, ses
 * adaptations, une carte par séance, la progression, le cardio, les gestes du quotidien, les
 * repères. Chaque carte était justifiée, mais rien ne disait laquelle regarder en premier, et sept
 * mille pixels défilaient sans hiérarchie.
 *
 * Ce composant sert à en replier une partie sans en retirer une ligne. Deux choses le rendent
 * utilisable :
 *
 * — le résumé, visible fermé comme ouvert, dit ce qu'il y a dedans. « Haut du corps · 40 min ·
 *   5 exercices » suffit souvent : on n'ouvre que si l'on va s'entraîner maintenant.
 * — plusieurs peuvent être ouvertes à la fois, contrairement aux questions d'`Explainer`. Ici on
 *   compare deux séances ; là on lit une explication après l'autre.
 *
 * Le contenu fermé reste dans le document (`display: 'none'`, pas de rendu conditionnel), pour la
 * même raison qu'ailleurs : c'est lui qui donne à lire quelque chose à un moteur de recherche.
 */
export default function Repliable({
  titre,
  resume,
  ouvert: ouvertParDefaut = false,
  children,
}: {
  titre: string;
  /** ce que la carte contient, en une ligne — assez pour ne pas avoir à l'ouvrir */
  resume: string;
  ouvert?: boolean;
  children: ReactNode;
}) {
  const [ouvert, setOuvert] = useState(ouvertParDefaut);
  const palette = usePalette();

  return (
    <Card className={cx('px-6', ouvert ? 'pt-6 pb-6' : 'py-2')}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: ouvert }}
        accessibilityLabel={`${titre}. ${resume}`}
        accessibilityHint={ouvert ? 'Replier' : 'Déplier'}
        onPress={() => setOuvert((o) => !o)}
        className="flex-row items-center gap-4 py-4 active:opacity-70"
      >
        <View className="min-w-0 flex-1">
          <Text className="font-display text-stat3 leading-[24px] text-ink">{titre}</Text>
          <Text className="mt-[2px] text-small text-muted2">{resume}</Text>
        </View>
        <Icon
          name={ouvert ? 'flecheHaut' : 'flecheBas'}
          size={18}
          color={ouvert ? palette.primaryInk : palette.muted2}
        />
      </Pressable>

      <View style={{ display: ouvert ? 'flex' : 'none' }}>
        <View className="border-t border-divider pt-4">{children}</View>
      </View>
    </Card>
  );
}
