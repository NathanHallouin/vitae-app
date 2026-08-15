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

import { Link } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { Pressable, Text, TextInput, View, type ViewProps } from 'react-native';
import { LinearTransition } from 'react-native-reanimated';
import { versRoute } from '@/lib/route';
import { MOTION, useMotionReduite } from '@/theme/motion';
import { usePalette } from '@/theme/palette';
import { VueAnimee } from './VueAnimee';

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

/**
 * `href` plutôt que `onPress` quand le bouton mène ailleurs.
 *
 * Ce n'est pas une commodité d'écriture : un `onPress` qui appelle le routeur rend un `<div>` sur
 * le web. Rien ne s'ouvre au clic milieu, rien ne se copie au clic droit, l'adresse n'apparaît pas
 * dans la barre d'état — et surtout, un moteur de recherche n'a aucun lien à suivre. L'accueil du
 * site sortait ainsi avec zéro `<a>` : la page la plus visitée ne menait nulle part.
 *
 * `Link asChild` clone le `Pressable` qu'il reçoit et lui passe l'adresse ; c'est le `Pressable`
 * qui doit être son enfant direct, d'où l'enveloppe posée ici et non par l'appelant. La navigation
 * native, elle, ne change pas.
 */
export function Button({
  variant = 'text',
  size = 'medium',
  href,
  onPress,
  disabled,
  className,
  children,
  accessibilityLabel,
}: {
  variant?: ButtonVariant;
  size?: keyof typeof BUTTON_SIZES;
  /** destination ; exclusif avec `onPress` */
  href?: string;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  accessibilityLabel?: string;
}) {
  const bouton = (
    <Pressable
      accessibilityRole={href ? 'link' : 'button'}
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

  if (!href) return bouton;

  return (
    <Link href={versRoute(href)} asChild>
      {bouton}
    </Link>
  );
}

/**
 * Carte : bordure fine et fond plein, jamais d'ombre portée.
 *
 * L'absence d'ombre est un choix, pas un oubli : sur le fond crème, une carte bordée se lit comme
 * une feuille posée, une carte ombrée comme un composant flottant. C'est ce qui donne à
 * l'application son air de papier plutôt que d'interface.
 *
 * `taille` fait animer la carte quand sa hauteur change — le cas des cartes qui se replient. Une
 * propriété plutôt qu'un composant à substituer : le style de la carte reste écrit une seule fois,
 * et l'appelant n'a pas à connaître Reanimated.
 */
export function Card({
  taille = false,
  className,
  children,
  ...rest
}: {
  /** anime le changement de hauteur ; sans effet si le système demande moins de mouvement */
  taille?: boolean;
  className?: string;
  children?: ReactNode;
} & ViewProps) {
  const reduite = useMotionReduite();
  const style = cx('rounded-card border border-divider bg-surface', className);

  if (!taille || reduite) {
    return (
      <View className={style} {...rest}>
        {children}
      </View>
    );
  }

  return (
    <VueAnimee className={style} layout={LinearTransition.duration(MOTION.normal)} {...rest}>
      {children}
    </VueAnimee>
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
