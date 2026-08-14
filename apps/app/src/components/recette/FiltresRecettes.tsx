import { type Criteres, DUREES, MOMENTS, TRIS } from '@vitae/content';
import { EXCLUSIONS } from '@vitae/core/recipes';
import { type ReactNode, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Icon from '@/components/ui/Icon';
import { useLarge } from '@/components/ui/Page';
import { cx } from '@/components/ui/primitives';
import { usePalette } from '@/theme/palette';

/**
 * Le champ de recherche et les filtres de l'index des recettes.
 *
 * Trois partis pris, tous pour la même raison — les filtres ne doivent pas repousser la liste hors
 * de l'écran :
 *
 * — le champ de recherche et le compte de résultats restent toujours visibles. Le compte est ce
 *   qui dit si le filtre suivant a un sens, et évite d'arriver sur une liste vide sans comprendre.
 * — les quatre groupes de pastilles, eux, occupaient 450 px avant la première recette sur un
 *   téléphone. Ils sont repliés sous ce seuil et dépliés au-dessus, où la place ne manque pas.
 * — replié, le bouton annonce combien de filtres sont actifs. Sans ce compte, on oublie qu'un
 *   filtre traîne et on ne comprend pas pourquoi la liste est courte.
 *
 * Pas de modale ni de panneau latéral : des pastilles se décochent aussi vite qu'elles se cochent,
 * ce qu'un formulaire à valider ne permet pas.
 *
 * Les exclusions d'ingrédients viennent de `@vitae/core/recipes`, les mêmes que sur l'écran « Ce
 * que je mange » : « Végétarien » y écarte le poisson, ici aussi.
 */
export default function FiltresRecettes({
  criteres,
  onChange,
  resultats,
  total,
}: {
  criteres: Criteres;
  onChange: (suivant: Criteres) => void;
  resultats: number;
  total: number;
}) {
  const palette = usePalette();
  const large = useLarge();
  const [deplie, setDeplie] = useState(false);
  const ouvert = large || deplie;

  const modifier = (partiel: Partial<Criteres>) => onChange({ ...criteres, ...partiel });

  const exclusions = criteres.exclusions ?? [];
  // Le tri n'en fait pas partie : il ne réduit rien, il réordonne.
  const actifs = exclusions.length + (criteres.moment ? 1 : 0) + (criteres.dureeMax ? 1 : 0);
  const basculerExclusion = (key: (typeof EXCLUSIONS)[number]['key']) =>
    modifier({
      exclusions: exclusions.includes(key)
        ? exclusions.filter((e) => e !== key)
        : [...exclusions, key],
    });

  return (
    <View className="mb-6 gap-4">
      <View className="flex-row items-center gap-3 rounded-control border border-line bg-surface2 px-[14px]">
        <Icon name="assiette" size={18} color={palette.muted2} />
        <TextInput
          accessibilityLabel="Chercher une recette, un ingrédient"
          placeholder="Poulet, lentilles, dix minutes…"
          placeholderTextColor={palette.faint}
          value={criteres.texte ?? ''}
          onChangeText={(texte) => modifier({ texte })}
          // `search` ferme le clavier sur la touche entrée plutôt que d'insérer un retour à la
          // ligne, et affiche « Rechercher » sur iOS.
          returnKeyType="search"
          autoCorrect={false}
          className="flex-1 py-[14px] text-input text-ink"
          style={{ outline: 'none' }}
        />
        {criteres.texte ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Effacer la recherche"
            onPress={() => modifier({ texte: '' })}
            className="p-1"
          >
            <Icon name="aucun" size={16} color={palette.muted2} />
          </Pressable>
        ) : null}
      </View>

      {large ? null : (
        <View className="flex-row items-center justify-between gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: ouvert }}
            accessibilityLabel={`Filtrer${actifs > 0 ? `, ${actifs} filtres actifs` : ''}`}
            onPress={() => setDeplie((d) => !d)}
            className={cx(
              'flex-row items-center gap-2 rounded-full border px-[14px] py-[6px]',
              actifs > 0 ? 'border-primary-ink bg-primary-tint' : 'border-line',
            )}
          >
            <Text
              className={cx(
                'text-small font-sans-medium',
                actifs > 0 ? 'text-primary-ink' : 'text-muted',
              )}
            >
              {actifs > 0 ? `Filtrer · ${actifs}` : 'Filtrer'}
            </Text>
            <Icon
              name={ouvert ? 'flecheHaut' : 'flecheBas'}
              size={14}
              color={actifs > 0 ? palette.primaryInk : palette.muted2}
            />
          </Pressable>

          <Text accessibilityLiveRegion="polite" className="text-small text-muted2">
            {resultats === total ? `${total} recettes` : `${resultats} sur ${total}`}
          </Text>
        </View>
      )}

      <View style={{ display: ouvert ? 'flex' : 'none' }} className="gap-4">
        <Groupe titre="Moment">
          {MOMENTS.map((m) => (
            <Pastille
              key={m.key}
              label={m.label}
              actif={criteres.moment === m.key}
              onPress={() => modifier({ moment: criteres.moment === m.key ? null : m.key })}
            />
          ))}
        </Groupe>

        <Groupe titre="Temps">
          {DUREES.map((d) => (
            <Pastille
              key={d}
              label={`${d} min ou moins`}
              actif={criteres.dureeMax === d}
              onPress={() => modifier({ dureeMax: criteres.dureeMax === d ? null : d })}
            />
          ))}
        </Groupe>

        <Groupe titre="Sans">
          {EXCLUSIONS.map((f) => (
            <Pastille
              key={f.key}
              label={f.label}
              actif={exclusions.includes(f.key)}
              onPress={() => basculerExclusion(f.key)}
            />
          ))}
        </Groupe>

        <Groupe titre="Trier par">
          {TRIS.map((t) => (
            <Pastille
              key={t.key}
              label={t.label}
              actif={(criteres.tri ?? 'recent') === t.key}
              onPress={() => modifier({ tri: t.key })}
            />
          ))}
        </Groupe>
      </View>

      {large ? (
        <Text accessibilityLiveRegion="polite" className="text-small text-muted2">
          {resultats === total
            ? `${total} recettes`
            : `${resultats} recette${resultats > 1 ? 's' : ''} sur ${total}`}
        </Text>
      ) : null}
    </View>
  );
}

function Groupe({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <View>
      <Text className="mb-2 text-micro font-sans-semibold uppercase tracking-[1.1px] text-muted2">
        {titre}
      </Text>
      <View className="flex-row flex-wrap gap-2">{children}</View>
    </View>
  );
}

function Pastille({
  label,
  actif,
  onPress,
}: {
  label: string;
  actif: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: actif }}
      onPress={onPress}
      className={cx(
        'rounded-full border px-[14px] py-[6px]',
        actif ? 'border-primary-ink bg-primary-tint' : 'border-line',
      )}
    >
      <Text
        className={cx('text-small font-sans-medium', actif ? 'text-primary-ink' : 'text-muted')}
      >
        {label}
      </Text>
    </Pressable>
  );
}
