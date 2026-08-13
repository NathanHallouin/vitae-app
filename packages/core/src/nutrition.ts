/**
 * Conseils alimentaires, formulés en fonction de l'objectif.
 *
 * Ce module contenait aussi une table de composition des aliments et un générateur de journée
 * type au gramme près. Les deux ont été retirés avec la carte qu'ils alimentaient : les repas
 * sont désormais de vraies recettes publiées ailleurs (voir `recipes.ts`), ce qui se cuisine
 * nettement mieux qu'une liste de portions pesées.
 */

import type { Metrics } from './calc';

export function eatingTips(metrics: Metrics): string[] {
  const base = [
    'Répartissez les protéines sur la journée plutôt que tout au dîner : le corps les utilise mieux ainsi.',
    'Visez 25 à 30 g de fibres par jour (légumes, fruits, céréales complètes, légumineuses) : c’est ce qui cale le plus.',
    'Buvez environ 1,5 L d’eau par jour, davantage les jours d’entraînement.',
  ];

  if (metrics.goal.key === 'masse') {
    return [
      'Ajoutez plutôt une collation qu’une portion énorme au dîner : c’est plus facile à digérer et à tenir.',
      ...base.slice(1),
      'Si le poids ne monte pas après deux semaines, ajoutez 150 kcal par jour, pas plus.',
    ];
  }

  return [
    ...base,
    'Le volume compte autant que les calories : légumes et protéines remplissent l’estomac pour peu d’énergie.',
    'Un ou deux repas plus libres par semaine ne compromettent rien, tant que la moyenne de la semaine tient.',
  ];
}
