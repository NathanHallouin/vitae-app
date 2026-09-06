/**
 * Une explication courte, et son détail déplié sur place.
 *
 * C'est le motif d'explication de l'application, et il répond à un défaut qu'on retrouvait partout :
 * chaque écran finissait par accumuler des paragraphes justes mais longs, que personne ne lit parce
 * que rien ne dit lesquels valent le détour.
 *
 * D'où le découpage :
 *
 * — **la ligne courte** dit le sujet, un ordre de grandeur et une phrase. Elle se lit d'un coup
 *   d'œil, et elle suffit à décider dans la grande majorité des cas ;
 * — **le détail** ne s'ouvre que si on le demande, et il reste **toujours rendu**, seulement masqué
 *   par `display: 'none'`. C'est la règle du dépôt, et elle a ici une raison précise : ces
 *   explications sont ce qu'un moteur de recherche trouve à lire sur des pages dont les chiffres
 *   dépendent de l'appareil du visiteur. Un rendu conditionnel les ferait disparaître du HTML livré
 *   sans que rien n'échoue.
 *
 * ## Ce que ce composant a cessé d'être
 *
 * Il ouvrait, **en natif seulement**, une feuille modale par-dessus l'écran : `Modal`, voile,
 * marges de sécurité, réglage « moins de mouvement », et un fichier `.web.tsx` qui dépliait sur
 * place pour ne pas perdre le texte du HTML livré. Trois fichiers, 344 lignes, une paire de
 * plateforme — **pour un seul appelant**, la liste des gestes du quotidien de `NeatCard`.
 *
 * Deux raisons de n'avoir gardé que le dépli :
 *
 * — l'argument du dépôt est que tout doit se comporter pareil partout, et une feuille sur un
 *   téléphone contre un dépli sur un site est exactement la divergence que les fichiers `.web`
 *   servent à éviter, pas à installer ;
 * — le commentaire de la version web l'admettait déjà : le dépli est « de toute façon le
 *   comportement des cartes `Repliable` que le site connaît déjà ». Deux modèles d'interaction
 *   pour un seul besoin, dont l'un se disait équivalent à l'autre.
 *
 * Ce qu'on y perd, et qui est réel : sur un téléphone, ouvrir un geste allonge la carte et pousse
 * les suivants vers le bas. C'est le comportement de tous les autres replis de l'application.
 */

import type { IconName } from '@vitae/core/icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
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
 * Elle est rendue *dans* le `Pressable` de `Fiche` et n'en pose donc pas elle-même : la zone
 * touchable doit couvrir la ligne entière, y compris le chiffre.
 */
function EnteteFiche({
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

/** Le détail lui-même, masqué tant que la ligne n'est pas ouverte. */
function CorpsFiche({ sections }: { sections: SectionFiche[] }) {
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

/** La ligne courte, et son détail sous elle. */
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
