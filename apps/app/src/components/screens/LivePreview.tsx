import { computeMetrics } from '@vitae/core/calc';
import { activityLabel, goalByKey } from '@vitae/core/constants';
import { dec, kcal } from '@vitae/core/format';
import type { FormState } from '@vitae/core/state';
import { Text } from 'react-native';
import { Ligne, Lignes } from '@/components/ui/Ligne';
import Overline from '@/components/ui/Overline';
import { Card } from '@/components/ui/primitives';

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
    { label: 'Au repos, vous brûlez', value: metrics ? kcal(metrics.bmr) : '…', suffixe: 'kcal' },
    { label: 'Avec votre activité', value: metrics ? kcal(metrics.tdee) : '…', suffixe: 'kcal' },
    { label: 'À manger par jour', value: metrics ? kcal(metrics.target) : '…', suffixe: 'kcal' },
    {
      label: 'Corpulence (IMC)',
      value: metrics ? dec(metrics.bmi) : '…',
      suffixe: metrics ? metrics.band.label : undefined,
    },
  ];

  const hint = metrics
    ? `Calculé pour « ${activityLabel(form.daily, form.sessions)} », objectif « ${goalByKey(form.goal).label.toLowerCase()} ». Tout se met à jour pendant que vous tapez.`
    : 'Répondez aux questions : les chiffres se calculent ici au fur et à mesure.';

  // Sur `surface2` et sans bordure : l'aperçu n'est pas une carte de résultat, c'est un brouillon
  // qui se met à jour pendant qu'on remplit le formulaire juste au-dessus. Le fond le range d'un
  // cran en arrière, là où la même carte blanche l'aurait mis sur le même plan.
  return (
    <Card
      accessibilityLiveRegion="polite"
      className="mt-4 border-transparent bg-surface2 px-4 py-4"
    >
      <Overline niveau={2} className="mb-2">
        Déjà calculé
      </Overline>
      <Lignes>
        {rows.map((row) => (
          <Ligne key={row.label} label={row.label} valeur={row.value} suffixe={row.suffixe} />
        ))}
      </Lignes>
      <Text className="font-sans mt-[10px] text-caption leading-[19px] text-muted2">{hint}</Text>
    </Card>
  );
}
