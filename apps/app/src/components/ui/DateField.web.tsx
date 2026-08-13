import { formatBirthDate, todayISO } from '@vitae/core/date';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useColorMode } from '@/theme/ColorMode';
import { usePalette } from '@/theme/palette';

/**
 * La même saisie, dans un navigateur : un vrai `<input type="date">`.
 *
 * Metro choisit ce fichier plutôt que `DateField.tsx` sur le web. Le sélecteur natif employé par
 * l'application n'y existe pas, et rien ne justifierait de le remplacer par un calendrier maison :
 * le contrôle du navigateur est traduit, accessible au clavier, et déjà connu du visiteur.
 *
 * C'est un élément du DOM et non un composant React Native, ce qui est licite ici et nulle part
 * ailleurs : sur le web, `react-native-web` rend de toute façon dans le DOM.
 */
export default function DateField({
  value,
  onChange,
  locked,
  label,
}: {
  /** `yyyy-mm-dd`, ou chaîne vide */
  value: string;
  onChange: (value: string) => void;
  locked: boolean;
  label: string;
}) {
  const palette = usePalette();
  const { mode } = useColorMode();
  const [focalise, setFocalise] = useState(false);

  if (locked) {
    return (
      <View className="rounded-control border border-line bg-surface2 px-[14px] py-[14px]">
        <Text
          accessibilityLabel={`${label} enregistrée : ${formatBirthDate(value)}`}
          className="text-input text-muted"
        >
          {formatBirthDate(value)}
        </Text>
      </View>
    );
  }

  return (
    <input
      type="date"
      aria-label={label}
      value={value}
      max={todayISO()}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocalise(true)}
      onBlur={() => setFocalise(false)}
      // Les classes NativeWind ne s'appliquent pas à un élément du DOM : les jetons du thème sont
      // donc lus par `usePalette`, ce qui garde la bascule clair / sombre.
      style={{
        width: '100%',
        boxSizing: 'border-box',
        padding: '14px',
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        color: palette.text,
        backgroundColor: palette.surface2,
        // Même repère de focalisation que les champs numériques : bordure d'action, pas le
        // contour par défaut du navigateur.
        border: focalise ? `2px solid ${palette.primary}` : `1px solid ${palette.border}`,
        margin: focalise ? -1 : 0,
        borderRadius: 10,
        outline: 'none',
        // Sans cela, le calendrier et l'icône que le navigateur ajoute au champ restent clairs
        // sur un fond sombre.
        colorScheme: mode,
      }}
    />
  );
}
