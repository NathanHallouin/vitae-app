'use client';

import { computeMetrics } from '@vitae/core/calc';
import { activityLabel, goalByKey } from '@vitae/core/constants';
import { dec, kcal } from '@vitae/core/format';
import type { FormState } from '@vitae/core/state';
import Overline from './ui/Overline';
import { cx } from './ui/primitives';

/** Panneau latéral : les chiffres se recalculent à chaque frappe. */
export default function LivePreview({ form, age }: { form: FormState; age: number | null }) {
  const metrics = computeMetrics({
    sexe: form.sexe,
    age: age === null ? '' : String(age),
    taille: form.taille,
    poids: form.poids,
    daily: form.daily,
    sessions: form.sessions,
    goal: form.goal,
  });

  const rows = [
    {
      label: 'Au repos, vous brûlez',
      value: metrics ? `${kcal(metrics.bmr)} kcal` : '…',
      accent: false,
    },
    {
      label: 'Avec votre activité',
      value: metrics ? `${kcal(metrics.tdee)} kcal` : '…',
      accent: false,
    },
    {
      label: 'À manger par jour',
      value: metrics ? `${kcal(metrics.target)} kcal` : '…',
      accent: true,
    },
    {
      label: 'Corpulence (IMC)',
      value: metrics ? `${dec(metrics.bmi)} · ${metrics.band.label}` : '…',
      accent: false,
    },
  ];

  const hint = metrics
    ? `Calculé pour « ${activityLabel(form.daily, form.sessions)} », objectif « ${goalByKey(form.goal).label.toLowerCase()} ». Tout se met à jour pendant que vous tapez.`
    : 'Répondez aux questions : les chiffres se calculent ici au fur et à mesure.';

  return (
    <aside
      aria-live="polite"
      className="card max-w-full flex-[1_1_280px] self-start p-5 md:sticky md:top-[88px] md:max-w-[340px]"
    >
      <Overline className="mb-[14px]">Vos chiffres en direct</Overline>
      <div className="flex flex-col">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-baseline justify-between gap-3 border-t border-divider py-[11px]"
          >
            <span className="text-small text-muted">{row.label}</span>
            <span
              className={cx(
                'text-right text-body font-medium tabular-nums',
                row.accent ? 'text-primary-ink' : 'text-ink',
              )}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-[14px] text-caption leading-[1.55] text-muted2">{hint}</p>
    </aside>
  );
}
