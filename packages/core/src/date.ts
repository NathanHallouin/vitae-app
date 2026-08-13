/**
 * Dates du profil : l'âge est recalculé à chaque affichage à partir de la date de naissance,
 * et le poids est considéré comme périmé au-delà d'une semaine sans modification.
 */

/** Au-delà de ce délai sans modification, on redemande le poids. */
export const STALE_WEIGHT_DAYS = 7;

const DAY_MS = 86_400_000;

/** Découpe une date `yyyy-mm-dd` sans passer par le fuseau UTC de `new Date(string)`. */
function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  const date = new Date(year, month - 1, day);
  // Rejette les dates inexistantes (31 février) que `Date` corrigerait silencieusement.
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

/**
 * Âge en années révolues à partir d'une date de naissance `yyyy-mm-dd`.
 * Renvoie `null` si la date est invalide ou dans le futur.
 */
export function ageFrom(birth: string, now: Date = new Date()): number | null {
  const date = parseISODate(birth);
  if (!date) return null;

  let age = now.getFullYear() - date.getFullYear();
  const beforeBirthday =
    now.getMonth() < date.getMonth() ||
    (now.getMonth() === date.getMonth() && now.getDate() < date.getDate());
  if (beforeBirthday) age -= 1;

  return age < 0 ? null : age;
}

/** Date maximale acceptée par le champ de naissance (aujourd'hui), au format `yyyy-mm-dd`. */
export function todayISO(now: Date = new Date()): string {
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/** Nombre de jours écoulés depuis un horodatage ISO ; `null` si l'horodatage est illisible. */
export function daysSince(isoTimestamp: string, now: Date = new Date()): number | null {
  const then = new Date(isoTimestamp).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((now.getTime() - then) / DAY_MS);
}

/** Vrai si le poids enregistré n'a pas été modifié depuis plus d'une semaine. */
export function isWeightStale(isoTimestamp: string, now: Date = new Date()): boolean {
  const days = daysSince(isoTimestamp, now);
  return days === null || days >= STALE_WEIGHT_DAYS;
}

/** Date de naissance `yyyy-mm-dd` affichée en clair : « 15 mars 1992 ». */
export function formatBirthDate(value: string): string {
  const date = parseISODate(value);
  if (!date) return '';
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** « 3 août 2026 » */
export function formatLongDate(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}
