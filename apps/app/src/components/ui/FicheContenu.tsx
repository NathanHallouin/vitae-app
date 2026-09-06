/**
 * Ce que `Fiche.tsx` et `Fiche.web.tsx` ont en commun : la ligne courte, et le texte détaillé.
 *
 * Les deux versions de `Fiche` ne diffèrent que par **où** le détail s'affiche — une feuille qui
 * monte depuis le bas en natif, un dépli sur place sur le web. Le reste est identique, et le
 * recopier des deux côtés garantirait qu'un jour la fiche du téléphone et celle du site ne disent
 * plus la même chose. Ce fichier n'a pas de variante de plateforme : Metro le sert tel quel aux
 * trois cibles.
 */

import type { IconName } from '@vitae/core/icons';
import { Text, View } from 'react-native';
import { usePalette } from '@/theme/palette';
import Icon from './Icon';
import { cx } from './primitives';

/**
 * Un morceau du détail.
 *
 * Le titre est facultatif : une explication d'une seule coulée n'en a pas besoin, alors qu'un
 * geste du quotidien se lit en deux temps — pourquoi ça marche, puis comment s'y prendre.
 */
export interface SectionFiche {
  titre?: string;
  texte: string;
}

export interface DonneesFiche {
  titre: string;
  /**
   * Une ligne, et une seule : ce qu'il faut savoir sans ouvrir.
   *
   * C'est la clé du motif. Si le résumé ne suffit pas à décider, la fiche n'est qu'un pavé caché,
   * ce qui est pire qu'un pavé visible.
   */
  resume: string;
  sections: SectionFiche[];
  /** pictogramme du sujet ; exclusif avec `numero` */
  icone?: IconName;
  /** rang dans une suite ordonnée, pour les explications qui se lisent dans l'ordre */
  numero?: number;
  /** chiffre affiché au bout de la ligne, déjà mis en forme (« ≈ 90 kcal ») */
  chiffre?: string;
}

/** La pastille de tête : un pictogramme, un numéro, ou rien. */
function Pastille({
  icone,
  numero,
  ouvert,
}: {
  icone?: IconName;
  numero?: number;
  ouvert: boolean;
}) {
  const palette = usePalette();

  if (numero !== undefined) {
    return (
      <View
        className={cx(
          'size-8 flex-none items-center justify-center rounded-full',
          ouvert ? 'bg-primary-ink' : 'bg-primary-tint',
        )}
      >
        <Text
          style={{ fontVariant: ['tabular-nums'] }}
          className={cx(
            'text-caption font-sans-bold',
            ouvert ? 'text-hero-text' : 'text-primary-ink',
          )}
        >
          {numero}
        </Text>
      </View>
    );
  }

  if (!icone) return null;

  return (
    <View className="size-8 flex-none items-center justify-center rounded-full bg-primary-tint">
      <Icon name={icone} size={18} color={palette.primaryInk} />
    </View>
  );
}

/**
 * La ligne courte : pastille, titre, résumé, chiffre, et l'invitation à ouvrir.
 *
 * Elle est rendue *dans* un `Pressable` fourni par l'appelant, et n'en pose donc pas elle-même :
 * la zone touchable doit couvrir la ligne entière, y compris le chiffre.
 */
export function EnteteFiche({
  titre,
  resume,
  chiffre,
  icone,
  numero,
  action,
  ouvert = false,
}: DonneesFiche & { action: string; ouvert?: boolean }) {
  const palette = usePalette();

  return (
    <View className="flex-row items-start gap-3 py-4">
      <Pastille icone={icone} numero={numero} ouvert={ouvert} />

      <View className="min-w-0 flex-1">
        <View className="flex-row flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <Text
            className={cx(
              'min-w-0 flex-1 text-option font-sans-medium',
              ouvert ? 'text-primary-ink' : 'text-ink',
            )}
          >
            {titre}
          </Text>
          {chiffre ? (
            // En encre et en gras, pas en couleur d'action : c'est une valeur, pas un lien. La
            // couleur d'action est réservée à ce sur quoi on peut appuyer, et l'affordance de la
            // ligne est écrite juste en dessous.
            <Text
              style={{ fontVariant: ['tabular-nums'] }}
              className="flex-none font-sans-bold text-stat3 text-ink"
            >
              {chiffre}
            </Text>
          ) : null}
        </View>

        <Text className="font-sans mt-[2px] text-small leading-[19px] text-muted">{resume}</Text>

        {/* L'affordance est écrite, pas seulement suggérée par un chevron : c'est ce qui distingue
            une ligne informative d'une ligne qui cache quelque chose. */}
        <View className="mt-2 flex-row items-center gap-[6px]">
          <Icon name="info" size={13} color={palette.primaryInk} />
          <Text className="text-caption font-sans-medium text-primary-ink">{action}</Text>
        </View>
      </View>
    </View>
  );
}

/** Le détail lui-même, identique dans la feuille et dans le dépli. */
export function CorpsFiche({ sections }: { sections: SectionFiche[] }) {
  return (
    <View className="gap-4">
      {sections.map((section) => (
        <View key={section.titre ?? section.texte}>
          {section.titre ? (
            <Text className="mb-[6px] text-micro font-sans-medium uppercase tracking-[1.6px] text-muted2">
              {section.titre}
            </Text>
          ) : null}
          <Text className="font-sans text-base leading-[22px] text-muted">{section.texte}</Text>
        </View>
      ))}
    </View>
  );
}
