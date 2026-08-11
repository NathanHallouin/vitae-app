import type { ReactNode } from 'react';
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
    <div
      className={cx(
        'text-micro font-semibold uppercase tracking-[.1em] leading-[1.5]',
        onDark ? 'opacity-80' : 'text-muted2',
        className,
      )}
    >
      {children}
    </div>
  );
}
