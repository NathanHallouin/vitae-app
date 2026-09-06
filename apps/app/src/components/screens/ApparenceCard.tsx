import { Pressable, Text, View } from 'react-native';
import Icon, { type IconName } from '@/components/ui/Icon';
import Overline from '@/components/ui/Overline';
import { Card, cx } from '@/components/ui/primitives';
import type { StoredTheme } from '@/lib/store';
import { useColorMode } from '@/theme/ColorMode';
import { usePalette } from '@/theme/palette';

/**
 * Le thème : trois choix nommés, sur l'écran du profil.
 *
 * Il a d'abord été une bascule dans l'en-tête. Deux défauts, et le second a fini par emporter le
 * premier :
 *
 * — **une icône ne dit pas son état.** Une lune se lit aussi bien « vous êtes en sombre » que
 *   « passer en sombre », et l'ambiguïté ne se lève qu'en essayant ;
 * — **deux états ne peuvent pas exprimer « suis le téléphone »**, qui est pourtant le réglage par
 *   défaut, et celui que la plupart des gens gardent.
 *
 * Il vit désormais dans le profil, avec les autres réglages, et l'en-tête ne porte plus que la
 * marque. On y perd le geste rapide depuis n'importe quel écran ; on y gagne un réglage qui se
 * trouve là où l'on cherche les réglages, et qui sait dire ce qu'il vaut.
 */
export default function ApparenceCard() {
  const { preference, setPreference } = useColorMode();

  // Le téléphone plutôt que la roue dentée pour « Système » : l'option dit qu'elle suit le réglage
  // de l'appareil, et le pictogramme le dit aussi. C'était une roue — dont le tracé, à 17 px, se
  // confondait avec le soleil de « Clair » posé deux cases plus loin.
  const choix: Array<{ cle: StoredTheme; label: string; icone: IconName }> = [
    { cle: 'light', label: 'Clair', icone: 'soleil' },
    { cle: 'dark', label: 'Sombre', icone: 'lune' },
    { cle: 'system', label: 'Système', icone: 'telephone' },
  ];

  return (
    <Card className="px-[18px] py-4">
      <Overline niveau={2} className="mb-1">
        Apparence
      </Overline>
      <Text className="font-sans mb-4 text-base leading-[22px] text-muted">
        Le thème sombre reprend la même maquette en lavande plutôt qu’en indigo : ce n’est pas la
        version claire assombrie, les contrastes ont été repris un par un. Votre choix est retenu
        d’une ouverture à l’autre.
      </Text>

      <View accessibilityRole="radiogroup" className="flex-row gap-2">
        {choix.map((c) => (
          <ChoixTheme
            key={c.cle}
            label={c.label}
            icone={c.icone}
            selectionne={preference === c.cle}
            onPress={() => setPreference(c.cle)}
          />
        ))}
      </View>

      <Text className="font-sans mt-3 text-caption leading-[19px] text-muted2">
        {preference === 'system'
          ? 'Suit le réglage de votre téléphone.'
          : 'Votre choix prime sur le réglage du téléphone.'}
      </Text>
    </Card>
  );
}

function ChoixTheme({
  label,
  icone,
  selectionne,
  onPress,
}: {
  label: string;
  icone: IconName;
  selectionne: boolean;
  onPress: () => void;
}) {
  const palette = usePalette();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: selectionne, checked: selectionne }}
      // `accessibilityState` ne devient pas `aria-checked` sur le web : sans lui, un lecteur
      // d'écran annonce les trois modes sans dire lequel est actif.
      aria-checked={selectionne}
      accessibilityLabel={`Thème ${label.toLowerCase()}`}
      onPress={onPress}
      className={cx(
        // Bordure épaissie et marge négative, comme les autres options de l'application : sans la
        // compensation, la ligne choisie grandirait d'un point et ferait sauter le groupe.
        'min-w-0 flex-1 flex-row items-center justify-center gap-2 rounded-control py-3',
        selectionne ? 'm-[-1px] border-2 border-primary-ink bg-primary-tint' : 'border border-line',
      )}
    >
      <Icon name={icone} size={17} color={selectionne ? palette.primaryInk : palette.muted2} />
      <Text
        numberOfLines={1}
        className={cx(
          'text-option font-sans-medium',
          selectionne ? 'text-primary-ink' : 'text-muted',
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
