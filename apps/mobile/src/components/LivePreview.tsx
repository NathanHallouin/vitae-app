import { computeMetrics } from '@vitae/core/calc';
import { activityLabel, goalByKey } from '@vitae/core/constants';
import { dec, kcal } from '@vitae/core/format';
import type { FormState } from '@vitae/core/state';
import { Text, View } from 'react-native';
import Overline from './ui/Overline';
import { Card, cx } from './ui/primitives';

/**
 * Les chiffres se recalculent à chaque frappe.
 *
 * Sur le site c'est un panneau latéral collant ; ici il se place sous le formulaire, faute de
 * colonne où le mettre. Le calcul, lui, est le même et reste immédiat : `computeMetrics` est une
 * fonction pure de quelques opérations, il n'y a rien à différer ni à mémoïser.
 */
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
    { label: 'Au repos, vous brûlez', value: metrics ? `${kcal(metrics.bmr)} kcal` : '…', accent: false },
    { label: 'Avec votre activité', value: metrics ? `${kcal(metrics.tdee)} kcal` : '…', accent: false },
    { label: 'À manger par jour', value: metrics ? `${kcal(metrics.target)} kcal` : '…', accent: true },
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
    <Card accessibilityLiveRegion="polite" className="mt-6 p-5">
      <Overline className="mb-[14px]">Vos chiffres en direct</Overline>
      <View>
        {rows.map((row) => (
          <View
            key={row.label}
            className="flex-row items-baseline justify-between gap-3 border-t border-divider py-[11px]"
          >
            <Text className="min-w-0 flex-1 text-small text-muted">{row.label}</Text>
            <Text
              style={{ fontVariant: ['tabular-nums'] }}
              className={cx(
                'flex-none text-right text-body font-sans-medium',
                row.accent ? 'text-primary-ink' : 'text-ink',
              )}
            >
              {row.value}
            </Text>
          </View>
        ))}
      </View>
      <Text className="mt-[14px] text-caption leading-[19px] text-muted2">{hint}</Text>
    </Card>
  );
}
