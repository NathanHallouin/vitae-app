import type { ReactNode } from 'react';
import { cx } from './primitives';

/** Tuile de statistique sur fond `surface2` : libellé, valeur 22 px, note optionnelle. */
export default function StatTile({
  label,
  value,
  note,
  accent = false,
}: {
  label: ReactNode;
  value: ReactNode;
  note?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl bg-surface2 p-4">
      <div className="mb-1 text-caption text-muted2">{label}</div>
      <div
        className={cx(
          'font-display text-stat2 font-semibold tabular-nums',
          accent && 'text-primary-ink',
        )}
      >
        {value}
      </div>
      {note ? <div className="mt-1 text-caption text-muted">{note}</div> : null}
    </div>
  );
}
