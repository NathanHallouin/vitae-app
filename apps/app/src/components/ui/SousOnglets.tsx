/**
 * Deux registres dans un écran, sans en faire deux pages.
 *
 * L'écran « Bouger » traitait le mouvement du quotidien et les séances à la suite, séparés par un
 * simple intertitre. Les deux sujets sont justes et ils ont chacun leur carte de chiffres, leurs
 * gestes, leurs repères — mis bout à bout, ils faisaient une page qu'on ne parcourt pas : quelqu'un
 * venu voir son programme de la semaine traversait sept gestes du quotidien avant d'y arriver.
 *
 * Ce composant les met côte à côte. Ce n'est pas de la navigation : on ne quitte pas l'écran, la
 * position de défilement de chaque panneau lui reste propre, et rien n'est chargé — les deux
 * panneaux sont montés en permanence.
 *
 * **Le panneau caché reste dans le document** (`display: 'none'`, jamais de rendu conditionnel).
 * C'est la règle du dépôt, et elle a ici une conséquence directe : le site continue de livrer les
 * deux moitiés de « Bouger » dans un seul fichier HTML, avec ses explications, alors qu'un rendu
 * conditionnel en aurait effacé la moitié sans que rien n'échoue.
 *
 * Distinct visuellement de la navigation principale, à dessein : celle-ci est soulignée, celui-ci
 * est un segment plein. Deux barres d'onglets identiques l'une sous l'autre laisseraient croire
 * qu'on a changé de page.
 */

import type { IconName } from '@vitae/core/icons';
import { type ReactNode, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { usePalette } from '@/theme/palette';
import Icon from './Icon';
import { cx } from './primitives';

export interface Onglet {
  cle: string;
  label: string;
  /** libellé long, annoncé aux lecteurs d'écran quand le libellé visible est un raccourci */
  labelLong?: string;
  icon?: IconName;
  contenu: ReactNode;
}

export default function SousOnglets({
  onglets,
  aria,
}: {
  onglets: Onglet[];
  /** ce que ce groupe d'onglets départage, pour un lecteur d'écran */
  aria: string;
}) {
  const [actif, setActif] = useState(onglets[0]?.cle);
  const palette = usePalette();

  return (
    <View className="gap-6">
      <View
        accessibilityRole="tablist"
        aria-label={aria}
        // Le rail : un fond creux dans lequel le segment sélectionné vient se poser.
        className="flex-row gap-1 rounded-control bg-surface2 p-1"
      >
        {onglets.map((onglet) => {
          const selectionne = onglet.cle === actif;
          return (
            <Pressable
              key={onglet.cle}
              accessibilityRole="tab"
              accessibilityState={{ selected: selectionne }}
              // `accessibilityState` ne devient pas `aria-selected` sur le web : sans cette
              // seconde déclaration, un lecteur d'écran de navigateur annonce l'onglet sans
              // jamais dire lequel est ouvert. Même défaut, même correctif que `OptionButton`.
              aria-selected={selectionne}
              accessibilityLabel={onglet.labelLong ?? onglet.label}
              onPress={() => setActif(onglet.cle)}
              className={cx(
                'min-w-0 flex-1 flex-row items-center justify-center gap-2 rounded-[7px] px-3 py-[10px]',
                selectionne ? 'border border-line bg-surface' : 'active:bg-surface',
              )}
            >
              {onglet.icon ? (
                <Icon
                  name={onglet.icon}
                  size={16}
                  color={selectionne ? palette.primaryInk : palette.muted2}
                />
              ) : null}
              <Text
                numberOfLines={1}
                className={cx(
                  'text-base',
                  selectionne
                    ? 'font-sans-medium text-primary-ink'
                    : 'font-sans-medium text-muted2',
                )}
              >
                {onglet.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {onglets.map((onglet) => (
        <View
          key={onglet.cle}
          role="tabpanel"
          aria-label={onglet.labelLong ?? onglet.label}
          // Masqué, jamais démonté : le contenu reste dans le HTML livré, et revenir sur un
          // panneau le retrouve tel qu'on l'avait laissé.
          style={{ display: onglet.cle === actif ? 'flex' : 'none' }}
        >
          {onglet.contenu}
        </View>
      ))}
    </View>
  );
}
