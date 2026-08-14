/**
 * Les rappels qui cassent la sédentarité.
 *
 * L'application le dit déjà sur l'écran « Bouger » : se lever trois minutes par heure est le geste
 * qui casse le mieux la sédentarité, et le mouvement du quotidien pèse plusieurs fois ce que pèsent
 * les séances. Le problème n'est pas de le savoir, c'est d'y penser au bon moment — assis depuis
 * quarante-cinq minutes, absorbé par autre chose. D'où ces rappels.
 *
 * Ce module ne notifie rien : il calcule *quand* et *quoi*, en fonctions pures et testables.
 * La planification effective appartient à l'application, parce qu'elle dépend du système.
 *
 * Deux limites à connaître, et assumées :
 *
 * — Les rappels tombent à heure fixe, pas sur une inactivité constatée. Détecter l'immobilité
 *   demanderait le podomètre ou les données de santé, donc une permission sensible et une
 *   déclaration de collecte auprès des deux magasins — pour un gain discutable, puisque quelqu'un
 *   qui vient de marcher n'est pas gêné d'être invité à recommencer.
 * — Les rappels sonnent tous les jours, week-end compris. Les restreindre à la semaine
 *   demanderait un déclencheur hebdomadaire par jour et par heure, soit cinq fois plus de
 *   notifications en attente : iOS en plafonne soixante-quatre, et la plage y passerait.
 */

import { ecrireCle, lireCle } from './storage';

export const RAPPELS_KEY = 'vitae.v1.rappels';

export interface RappelsConfig {
  actif: boolean;
  /** minutes entre deux rappels */
  intervalleMinutes: number;
  /** heure de début, incluse (0–23) */
  debutHeure: number;
  /** heure de fin, incluse (1–24) : au-delà, plus rien ne sonne */
  finHeure: number;
}

/**
 * Quarante-cinq minutes, de 9 h à 19 h.
 *
 * L'intervalle vient de la littérature sur la sédentarité, qui situe la rupture utile entre trente
 * et soixante minutes. La plage couvre une journée de travail sans déborder sur le réveil ni sur
 * la soirée : un rappel à 7 h du matin est désinstallé le jour même.
 */
export const RAPPELS_DEFAUT: RappelsConfig = {
  actif: false,
  intervalleMinutes: 45,
  debutHeure: 9,
  finHeure: 19,
};

/** Les intervalles proposés. Au-delà de 90 minutes, le rappel ne casse plus grand-chose. */
export const INTERVALLES = [30, 45, 60, 90] as const;

/**
 * Plafond d'iOS sur les notifications locales en attente.
 *
 * Au-delà, le système jette silencieusement les suivantes — donc en pratique la fin de journée ne
 * sonnerait plus, sans le moindre message d'erreur. La génération s'arrête d'elle-même avant.
 */
export const MAX_RAPPELS = 60;

export interface Rappel {
  /** heure locale du déclenchement */
  hour: number;
  minute: number;
  titre: string;
  corps: string;
}

/**
 * Ce que disent les rappels.
 *
 * Ils tournent, parce qu'un message unique répété quatorze fois par jour devient du papier peint
 * en trois jours. Ils demandent un geste précis et court plutôt qu'un encouragement : « levez-vous
 * deux minutes » se fait, « bougez plus » ne se fait pas. Et aucun ne culpabilise — le ton est
 * celui du reste de l'application.
 */
const MESSAGES: Array<{ titre: string; corps: string }> = [
  { titre: 'Debout deux minutes', corps: 'Le temps de vous étirer et de regarder au loin.' },
  { titre: 'Un verre d’eau', corps: 'Allez le chercher au point d’eau le plus éloigné.' },
  { titre: 'Trois minutes debout', corps: 'C’est ce qui casse le mieux la sédentarité.' },
  { titre: 'Un étage', corps: 'Monter et redescendre suffit. L’ascenseur attendra.' },
  {
    titre: 'Le prochain appel, debout',
    corps: 'Debout, vous dépensez la moitié en plus. Sans effort.',
  },
  { titre: 'Faites un tour', corps: 'Le couloir, le jardin, le pâté de maisons. Deux minutes.' },
  { titre: 'Dénouez les épaules', corps: 'Levez-vous, roulez les épaules, respirez à fond.' },
  {
    titre: 'Debout un instant',
    corps: 'Rester assis d’affilée coûte plus que d’avoir sauté une séance.',
  },
  { titre: 'Bougez les jambes', corps: 'Debout, dix flexions lentes. Personne ne vous regarde.' },
  { titre: 'Changez de pièce', corps: 'Le trajet compte autant que la destination.' },
];

/**
 * Les heures auxquelles un rappel doit sonner, avec son message.
 *
 * Bornes incluses des deux côtés : un intervalle de 60 minutes entre 9 h et 19 h donne bien un
 * rappel à 19 h. Les messages sont distribués à tour de rôle, si bien que deux rappels voisins
 * ne disent jamais la même chose.
 */
export function planifierRappels(config: RappelsConfig): Rappel[] {
  const c = normaliser(config);
  if (!c.actif) return [];

  const debut = c.debutHeure * 60;
  const fin = c.finHeure * 60;
  const rappels: Rappel[] = [];

  for (let t = debut; t <= fin && rappels.length < MAX_RAPPELS; t += c.intervalleMinutes) {
    // Minuit exactement (24 h) n'existe pas comme heure : le dernier créneau est 23 h 59.
    if (t >= 24 * 60) break;
    const message = MESSAGES[rappels.length % MESSAGES.length];
    rappels.push({ hour: Math.floor(t / 60), minute: t % 60, ...message });
  }

  return rappels;
}

/** Ramène une configuration douteuse dans ses bornes, plutôt que de la refuser. */
export function normaliser(config: RappelsConfig): RappelsConfig {
  const intervalle = INTERVALLES.includes(config.intervalleMinutes as (typeof INTERVALLES)[number])
    ? config.intervalleMinutes
    : RAPPELS_DEFAUT.intervalleMinutes;

  const debut = borner(config.debutHeure, 0, 23);
  // La fin reste après le début : sinon la plage est vide et rien ne sonnerait, sans explication.
  const fin = borner(config.finHeure, debut + 1, 24);

  return {
    actif: Boolean(config.actif),
    intervalleMinutes: intervalle,
    debutHeure: debut,
    finHeure: fin,
  };
}

function borner(valeur: unknown, min: number, max: number): number {
  if (typeof valeur !== 'number' || !Number.isFinite(valeur)) return min;
  return Math.min(max, Math.max(min, Math.round(valeur)));
}

/** Phrase de récapitulatif, affichée sous le réglage. */
export function resumeRappels(config: RappelsConfig): string {
  const c = normaliser(config);
  if (!c.actif) return 'Aucun rappel n’est programmé.';

  const nombre = planifierRappels(c).length;
  const intervalle =
    c.intervalleMinutes >= 60 && c.intervalleMinutes % 60 === 0
      ? `${c.intervalleMinutes / 60} h`
      : `${c.intervalleMinutes} min`;

  return `${nombre} rappel${nombre > 1 ? 's' : ''} par jour, toutes les ${intervalle}, de ${c.debutHeure} h à ${c.finHeure} h.`;
}

/** Lecture tolérante : un réglage illisible repart des valeurs par défaut, sans faire d'histoires. */
export function loadRappels(): RappelsConfig {
  const brut = lireCle(RAPPELS_KEY);
  if (!brut) return RAPPELS_DEFAUT;
  try {
    const data = JSON.parse(brut) as Partial<RappelsConfig>;
    if (typeof data !== 'object' || data === null) return RAPPELS_DEFAUT;
    return normaliser({ ...RAPPELS_DEFAUT, ...data });
  } catch {
    return RAPPELS_DEFAUT;
  }
}

export function saveRappels(config: RappelsConfig): void {
  ecrireCle(RAPPELS_KEY, JSON.stringify(normaliser(config)));
}
