import { Text, View } from 'react-native';
import { usePalette } from '@/theme/palette';
import Icon, { type IconName } from './Icon';

/**
 * Tête de section à l'intérieur d'un écran, avec un filet coloré à gauche.
 * Sert à séparer nettement deux registres qu'on confond facilement (ici le mouvement du
 * quotidien et les séances) sans passer par deux écrans distincts.
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
    <View className="mt-4 border-l-[3px] border-primary-ink pl-[18px]">
      <View className="mb-[2px] flex-row items-center gap-2">
        {icon ? <Icon name={icon} size={16} color={palette.primaryInk} /> : null}
        <Text className="text-micro font-sans-semibold uppercase tracking-[1.1px] text-primary-ink">
          {kicker}
        </Text>
      </View>
      <Text className="mb-[6px] font-display text-h3 leading-[26px] text-ink">{title}</Text>
      <Text className="font-sans text-base leading-[22px] text-muted">{lead}</Text>
    </View>
  );
}
