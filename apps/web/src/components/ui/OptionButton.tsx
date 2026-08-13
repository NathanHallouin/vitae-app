'use client';

import type { ReactNode } from 'react';
import { cx } from './primitives';

/**
 * Option cliquable (sexe, activité, objectif, poids cible).
 * Sélectionnée : fond `primaryTint`, bordure et texte `primaryInk`.
 */
export default function OptionButton({
  selected,
  onClick,
  children,
  className,
  ariaLabel,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={ariaLabel}
      className={cx(
        'block w-full cursor-pointer rounded-xl border text-left transition-colors',
        'hover:border-primary-ink focus-visible:outline-2 focus-visible:outline-offset-2',
        'focus-visible:outline-primary',
        selected
          ? 'border-primary-ink bg-primary-tint text-primary-ink'
          : 'border-line bg-surface text-ink',
        className,
      )}
    >
      {children}
    </button>
  );
}
