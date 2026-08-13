/**
 * Les contrôles de base, en React Native.
 *
 * Ils reprennent un à un ceux de `apps/web/src/components/ui/primitives.tsx`, avec les mêmes noms
 * et les mêmes classes NativeWind. Trois écarts, imposés par la plateforme et non par le goût :
 *
 * — `hover:` n'existe pas sur un écran tactile : l'état survolé devient un état pressé, rendu par
 *   `active:` que NativeWind branche sur la pression.
 * — le texte doit être dans un `<Text>` : les composants qui portaient une classe de texte sur
 *   leur conteneur la portent désormais sur leur libellé.
 * — les largeurs en `ch` et `text-pretty` n'ont pas d'équivalent ; sur un téléphone, la colonne
 *   est de toute façon plus étroite que la mesure qu'elles cherchaient à borner.
 */

import { type ReactNode, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View, type ViewProps } from 'react-native';
import { usePalette } from '@/theme/palette';

/** Concatène des classes en ignorant les valeurs vides, pour composer sans `clsx`. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

type ButtonVariant = 'contained' | 'outlined' | 'text';

const BUTTON_BASE = 'flex-row items-center justify-center gap-2 rounded-control border';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  contained: 'bg-primary border-transparent active:bg-primary-dark',
  outlined: 'border-line active:bg-primary-tint active:border-primary-ink',
  text: 'border-transparent active:bg-primary-tint',
};

const BUTTON_LABELS: Record<ButtonVariant, string> = {
  contained: 'text-hero-text',
  outlined: 'text-primary-ink',
  text: 'text-primary-ink',
};

const BUTTON_SIZES = {
  large: 'px-[26px] py-[13px]',
  medium: 'px-[18px] py-[10px]',
  small: 'px-3 py-[6px]',
} as const;

const BUTTON_LABEL_SIZES = {
  large: 'text-option',
  medium: 'text-base',
  small: 'text-small',
} as const;

export function Button({
  variant = 'text',
  size = 'medium',
  onPress,
  disabled,
  className,
  children,
  accessibilityLabel,
}: {
  variant?: ButtonVariant;
  size?: keyof typeof BUTTON_SIZES;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: Boolean(disabled) }}
      onPress={onPress}
      disabled={disabled}
      className={cx(
        BUTTON_BASE,
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        disabled && 'opacity-60',
        className,
      )}
    >
      <Text
        className={cx('font-sans-semibold', BUTTON_LABELS[variant], BUTTON_LABEL_SIZES[size])}
        numberOfLines={1}
      >
        {children}
      </Text>
    </Pressable>
  );
}

/** Carte : bordure fine et fond plein, jamais d'ombre portée. */
export function Card({
  className,
  children,
  ...rest
}: { className?: string; children?: ReactNode } & ViewProps) {
  return (
    <View className={cx('rounded-card border border-divider bg-surface', className)} {...rest}>
      {children}
    </View>
  );
}

/**
 * Champ numérique avec son unité.
 *
 * `keyboardType` vaut `decimal-pad` et non `numeric` : un poids se saisit avec une virgule, et le
 * pavé `numeric` d'iOS ne la propose pas. L'unité reste décorative — elle est déjà dans le libellé
 * accessible, la répéter ferait « Taille en cm cm » au lecteur d'écran.
 */
export function NumberField({
  value,
  onChangeText,
  unit,
  label,
  placeholder,
  editable = true,
  className,
}: {
  value: string;
  onChangeText: (value: string) => void;
  unit: string;
  /** libellé accessible, unité comprise */
  label: string;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}) {
  const palette = usePalette();
  const [focalise, setFocalise] = useState(false);

  return (
    <View
      className={cx(
        'flex-row items-center rounded-control bg-surface2',
        // La bordure passe à la couleur d'action et s'épaissit à la saisie, comme sur la maquette.
        // Elle remplace le contour que le navigateur dessinerait de lui-même — supprimé juste en
        // dessous, mais pas sans le remplacer : un champ focalisé doit rester repérable à l'œil.
        focalise ? 'border-2 border-primary m-[-1px]' : 'border border-line',
        !editable && 'opacity-60',
        className,
      )}
    >
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocalise(true)}
        onBlur={() => setFocalise(false)}
        editable={editable}
        placeholder={placeholder}
        placeholderTextColor={palette.faint}
        keyboardType="decimal-pad"
        inputMode="decimal"
        className="flex-1 px-[14px] py-[14px] text-input text-ink"
        // Sans effet en natif ; sur le web, retire le contour par défaut du navigateur, dont la
        // bordure ci-dessus prend le relais.
        style={{ outline: 'none' }}
      />
      <Text
        // Décoratif : le libellé du champ porte déjà l'unité.
        aria-hidden
        className="pr-[14px] text-small text-muted2"
      >
        {unit}
      </Text>
    </View>
  );
}

/** Barre de progression déterminée, pour l'avancement du questionnaire. */
export function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value) }}
      className="h-[6px] w-full overflow-hidden rounded-full bg-divider"
    >
      <View className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
    </View>
  );
}

/**
 * Barre en deux segments : la part accentuée, puis le reste.
 *
 * Décorative — les deux valeurs sont toujours écrites en clair juste en dessous, sous forme de
 * tuiles. La barre ne fait que rendre le rapport visible d'un coup d'œil.
 */
export function SplitBar({ pct }: { pct: number }) {
  return (
    <View aria-hidden className="mb-3 h-[10px] flex-row overflow-hidden rounded-[5px]">
      <View className="h-full bg-primary-ink" style={{ width: `${pct}%` }} />
      <View className="h-full bg-divider" style={{ width: `${100 - pct}%` }} />
    </View>
  );
}

/**
 * Conseil sur fond `surface2`, précédé d'une puce.
 *
 * La puce est une `View` décorative plutôt qu'un caractère, pour garder l'alignement du texte sur
 * plusieurs lignes.
 */
export function Bullet({ children }: { children: ReactNode }) {
  return (
    <View className="flex-row items-start gap-3 rounded-xl bg-surface2 p-[14px]">
      <View className="mt-[7px] size-[6px] flex-none rounded-full bg-primary-ink" />
      <Text className="flex-1 text-base leading-[22px] text-ink">{children}</Text>
    </View>
  );
}

/** Attente. Rare ici : tout est calculé sur l'appareil, et lu de façon synchrone. */
export function Spinner({ label = 'Chargement' }: { label?: string }) {
  const palette = usePalette();
  return <ActivityIndicator accessibilityLabel={label} color={palette.primary} />;
}
