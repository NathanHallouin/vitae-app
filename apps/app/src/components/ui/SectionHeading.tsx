import { Text, View } from 'react-native';
import { usePalette } from '@/theme/palette';
import Icon, { type IconName } from './Icon';

/**
 * Tête de section à l'intérieur d'un écran.
 *
 * Sert à séparer nettement deux registres qu'on confond facilement (ici le mouvement du quotidien
 * et les séances) sans passer par deux écrans distincts.
 *
 * Deux choses ont changé avec la refonte, et pour la même raison : la couleur d'action est celle
 * du cadran, et tout ce qui l'emprunte ailleurs lui dispute la première lecture. Le surtitre passe
 * donc en `accent`, la couleur de ce qui se constate, et le filet vertical `primary` qui bordait la
 * section disparaît — sur un écran où l'arc porte déjà la couleur, il faisait un second accent
 * vertical sans rien nommer de plus que le titre juste à côté.
 */
export default function SectionHeading({
  kicker,
  title,
  lead,
  icon,
}: {
  kicker: string;
  title: string;
  lead: string;
  icon?: IconName;
}) {
  const palette = usePalette();
  return (
    <View className="mt-2 px-[2px] pb-1">
      <View className="mb-1 flex-row items-center gap-2">
        {icon ? <Icon name={icon} size={16} color={palette.accent} /> : null}
        <Text className="text-micro font-sans-medium uppercase tracking-[1.6px] text-accent">
          {kicker}
        </Text>
      </View>
      <Text className="mb-[6px] font-display text-h3 leading-[24px] text-ink">{title}</Text>
      <Text className="font-sans text-base leading-[21px] text-muted">{lead}</Text>
    </View>
  );
}
