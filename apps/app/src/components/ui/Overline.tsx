import type { ReactNode } from 'react';
import { Text } from 'react-native';
import { cx } from './primitives';

/** Surtitre 11 px majuscules, gris `muted2`, utilisé en tête de chaque carte. */
export default function Overline({
  children,
  className,
  onDark = false,
}: {
  children: ReactNode;
  className?: string;
  onDark?: boolean;
}) {
  return (
    <Text
      className={cx(
        'text-micro font-sans-semibold uppercase tracking-[1.1px]',
        onDark ? 'text-hero-text opacity-80' : 'text-muted2',
        className,
      )}
    >
      {children}
    </Text>
  );
}
