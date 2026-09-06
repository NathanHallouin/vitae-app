/** Formats numériques français : espace insécable pour les milliers, virgule décimale, U+2212 pour le moins. */

const MINUS = '−';

/**
 * `toLocaleString('fr-FR')` sépare les milliers par une espace fine insécable (U+202F), que
 * beaucoup de polices (dont celles utilisées ici) ne dessinent pas. On la remplace par une
 * espace insécable classique.
 */
export function kcal(n: number): string {
  return Math.round(n)
    .toLocaleString('fr-FR')
    .replace(/\u202f/g, '\u00a0');
}

/**
 * L'opération inverse : un nombre **saisi par un humain** en français, rendu exploitable.
 *
 * `parseFloat('78,4')` vaut **78**. Pas `NaN`, pas une erreur : soixante-dix-huit. La partie
 * décimale disparaît sans bruit, et la valeur reste assez plausible pour passer toutes les
 * validations de bornes.
 *
 * Ce n'est pas une hypothèse de laboratoire. `NumberField` déclare `keyboardType="decimal-pad"`
 * **précisément pour offrir la virgule** — son commentaire le dit : « un poids se saisit avec une
 * virgule, et le pavé `numeric` d'iOS ne la propose pas ». L'application invitait donc à taper le
 * caractère qu'elle allait tronquer.
 *
 * Le défaut se voyait à l'écran sans se comprendre : le bandeau de profil affiche la chaîne telle
 * que saisie — « Calculé pour 78,4 kg » — pendant que `computeMetrics` calculait sur 78. Mesuré :
 * métabolisme 1 557 au lieu de 1 561, dépense 2 101 au lieu de 2 107, IMC 24,62 au lieu de 24,74.
 * L'écart est petit ; le fait que l'affichage et le calcul ne parlent pas du même poids ne l'est
 * pas.
 *
 * Pire, il n'était pas uniforme : la pesée du suivi faisait déjà `.replace(',', '.')` de son côté.
 * Le même poids valait donc 78,4 dans l'historique et 78 dans le calcul, et `ProfileProvider`
 * comparait les deux. **Cette fonction existe pour qu'il n'y ait plus qu'une règle**, et pour
 * qu'elle soit à un seul endroit.
 *
 * Rend `NaN` sur une saisie vide ou illisible, comme `parseFloat` : les appelants testent déjà la
 * valeur, et rendre `0` transformerait une absence en un nombre.
 */
export function nombreSaisi(texte: string): number {
  return parseFloat(texte.replace(',', '.'));
}

export function dec(n: number, digits = 1): string {
  return n.toFixed(digits).replace('.', ',');
}

/** Écart calorique signé : « +180 kcal », « −450 kcal », « équilibre ». */
export function fmtGap(delta: number): string {
  const v = Math.round(delta);
  if (v === 0) return 'équilibre';
  return `${v > 0 ? '+' : MINUS}${Math.abs(v).toLocaleString('fr-FR')} kcal`;
}

/** Écart de poids signé : « −4,5 kg », « poids actuel ». */
export function fmtKg(delta: number): string {
  const v = Math.round(Math.abs(delta) * 10) / 10;
  if (v < 0.1) return 'poids actuel';
  return `${delta < 0 ? MINUS : '+'}${dec(v)} kg`;
}

/** Rythme hebdomadaire déduit d'un écart calorique quotidien (7 700 kcal ≈ 1 kg). */
export function fmtWeekly(kcalDelta: number): string {
  const kg = (Math.abs(kcalDelta) * 7) / 7700;
  if (kg < 0.05) return 'poids stable';
  return `${kcalDelta < 0 ? MINUS : '+'}${dec(kg, 2)} kg / semaine`;
}

/**
 * Rythme déjà connu en kilogrammes par semaine : « −0,47 kg / semaine ».
 *
 * `fmtWeekly` part d'un écart calorique et fait la conversion ; ici la pente vient d'une
 * régression sur des pesées réelles, elle est déjà dans la bonne unité. Le signe passe par
 * U+2212 comme partout ailleurs : un trait d'union à la place d'un moins se voit, surtout en
 * chasse fixe à côté d'un chiffre.
 */
export function fmtKgParSemaine(kg: number): string {
  if (Math.abs(kg) < 0.01) return 'poids stable';
  return `${kg < 0 ? MINUS : '+'}${dec(Math.abs(kg), 2)} kg / semaine`;
}

/** Nombre de portions : 1,5 reste « 1,5 », mais 2 s'écrit « 2 » et non « 2,0 ». */
export function fmtPortions(n: number): string {
  return Number.isInteger(n) ? String(n) : dec(n);
}

/** « octobre 2026 » */
export function monthIn(weeks: number, from: Date = new Date()): string {
  const d = new Date(from.getTime());
  d.setDate(d.getDate() + weeks * 7);
  return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

/** Facteur d'activité : 1.375 → « 1,375 », 1.2 → « 1,2 ». */
export function fmtFactor(factor: number): string {
  return factor.toFixed(3).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',');
}
