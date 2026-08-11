'use client';

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

/**
 * Les quelques contrôles que MUI fournissait, réécrits en Tailwind.
 *
 * Ils tiennent en un fichier parce qu'ils sont peu nombreux et sans état : le formulaire n'a
 * qu'un champ texte, un groupe de boutons et une barre de progression. Tout le reste de l'app
 * était déjà du `div` stylé.
 */

/** Concatène des classes en ignorant les valeurs vides, pour composer sans `clsx`. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

type ButtonVariant = 'contained' | 'outlined' | 'text';

const BUTTON_BASE =
  'inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)] font-semibold ' +
  'cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-60 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  contained: 'bg-primary text-hero-text hover:bg-primary-dark border border-transparent',
  outlined: 'border border-line text-primary-ink hover:bg-primary-tint hover:border-primary-ink',
  text: 'border border-transparent text-primary-ink hover:bg-primary-tint',
};

const BUTTON_SIZES = {
  large: 'text-option px-[26px] py-[13px]',
  medium: 'text-base px-[18px] py-[10px]',
  small: 'text-small px-3 py-[6px]',
} as const;

export function Button<T extends ElementType = 'button'>({
  as,
  variant = 'text',
  size = 'medium',
  className,
  ...rest
}: {
  as?: T;
  variant?: ButtonVariant;
  size?: keyof typeof BUTTON_SIZES;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className'>) {
  const Tag = (as ?? 'button') as ElementType;
  return (
    <Tag
      // `type` n'a de sens que sur un vrai bouton : sur un <a>, React le rendrait tel quel.
      {...(Tag === 'button' ? { type: 'button' } : {})}
      className={cx(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className)}
      {...rest}
    />
  );
}

/** Carte : bordure fine et fond plein, jamais d'ombre portée. */
export function Card({
  as,
  className,
  children,
  ...rest
}: {
  as?: ElementType;
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<'div'>) {
  const Tag = (as ?? 'div') as ElementType;
  return (
    <Tag className={cx('card', className)} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * Champ numérique avec son unité.
 *
 * L'unité est un `<span aria-hidden>` posé dans le champ plutôt qu'un vrai suffixe : elle est
 * déjà dans le libellé accessible, la répéter ferait « Taille en cm cm » au lecteur d'écran.
 */
export function NumberField({
  id,
  unit,
  className,
  ...rest
}: { id: string; unit: string; className?: string } & ComponentPropsWithoutRef<'input'>) {
  return (
    <div
      className={cx(
        'flex items-center rounded-[var(--radius-control)] bg-surface2 border border-line',
        'focus-within:border-primary focus-within:border-2 focus-within:m-[-1px]',
        'hover:border-line-strong',
        className,
      )}
    >
      <input
        id={id}
        type="number"
        inputMode="numeric"
        className="w-full bg-transparent px-[14px] py-[14px] text-input text-ink outline-none"
        {...rest}
      />
      <span aria-hidden className="pr-[14px] text-small text-muted2">
        {unit}
      </span>
    </div>
  );
}

/** Barre de progression déterminée, pour l'avancement du questionnaire. */
export function ProgressBar({ value, label }: { value: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-[6px] w-full overflow-hidden rounded-full bg-divider"
    >
      <div
        className="h-full rounded-full bg-primary transition-transform duration-300"
        style={{ width: `${value}%` }}
      />
    </div>
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
    <div aria-hidden className="mb-3 flex h-[10px] overflow-hidden rounded-[5px]">
      <div className="h-full bg-primary-ink" style={{ width: `${pct}%` }} />
      <div className="h-full bg-divider" style={{ width: `${100 - pct}%` }} />
    </div>
  );
}

/**
 * Conseil sur fond `surface2`, précédé d'une puce.
 *
 * Le même motif revenait dans trois cartes ; la puce est un `span` décoratif plutôt qu'une vraie
 * `<li>` à puce CSS, pour garder l'alignement du texte sur plusieurs lignes.
 */
export function Bullet({ children }: { children: ReactNode }) {
  return (
    <li className="flex items-start gap-3 rounded-xl bg-surface2 p-[14px]">
      <span aria-hidden className="mt-[7px] size-[6px] flex-none rounded-full bg-primary-ink" />
      <span className="text-base leading-[1.55]">{children}</span>
    </li>
  );
}

/** Attente : un cercle qui tourne, le temps de lire le profil dans le navigateur. */
export function Spinner({ label = 'Chargement' }: { label?: string }) {
  return (
    <span
      role="status"
      aria-label={label}
      className="inline-block size-10 animate-spin rounded-full border-2 border-divider border-t-primary"
    />
  );
}
