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
 * **Des plages, et non une plage.** Le réglage a d'abord été une seule bande continue, de 9 h à
 * 19 h. Elle ne ressemble à aucune journée réelle : elle sonne pendant le déjeuner, pendant la
 * sieste d'un enfant, pendant le trajet. Or un rappel qui tombe au mauvais moment ne coûte pas
 * zéro — c'est celui qui fait couper les notifications, et avec elles les treize autres qui
 * étaient utiles. Plusieurs plages permettent de dire « ma matinée et mon après-midi », ce qui
 * est la forme qu'ont les journées.
 *
 * Deux limites à connaître, et assumées :
 *
 * — Les rappels tombent à heure fixe, pas sur une inactivité constatée. Détecter l'immobilité
 *   demanderait le podomètre ou les données de santé, donc une permission sensible et une
 *   déclaration de collecte auprès des deux magasins — pour un gain discutable, puisque quelqu'un
 *   qui vient de marcher n'est pas gêné d'être invité à recommencer.
 * — Les rappels sonnent tous les jours, week-end compris. Les restreindre à la semaine
 *   demanderait un déclencheur hebdomadaire par jour et par heure, soit cinq fois plus de
 *   notifications en attente : iOS en plafonne soixante-quatre, et les plages y passeraient.
 */

import { ecrireCle, lireCle } from './storage';

export const RAPPELS_KEY = 'vitae.v1.rappels';

/** Le jour entier, en minutes. Les bornes des plages vivent dans [0, JOUR]. */
export const JOUR = 24 * 60;

/**
 * Une plage horaire, en minutes depuis minuit.
 *
 * Des minutes plutôt qu'un couple heure/minute : les comparaisons, les fusions et les
 * chevauchements s'écrivent sur un seul entier, et c'est là que sont tous les cas tordus.
 */
export interface Plage {
  /** début, inclus */
  debut: number;
  /** fin, incluse : un rappel tombe exactement à cette heure si l'intervalle y arrive juste */
  fin: number;
}

/**
 * Le pas de réglage : la demi-heure.
 *
 * L'heure pleine ne permet pas de dire « je reprends à 13 h 30 », et le quart d'heure demande
 * quatre appuis pour déplacer une plage d'une heure. La demi-heure couvre les journées réelles
 * sans transformer le réglage en corvée.
 */
export const PAS_MINUTES = 30;

/** Durée minimale d'une plage : en dessous, elle ne contiendrait au mieux qu'un seul rappel. */
export const DUREE_MINIMALE = PAS_MINUTES;

/**
 * Nombre de plages maximum.
 *
 * Quatre suffisent à décrire n'importe quelle journée (matin, après-midi, soirée, et une
 * exception), et bornent le nombre de notifications en attente bien avant le plafond d'iOS.
 */
export const MAX_PLAGES = 4;

export interface RappelsConfig {
  actif: boolean;
  /** minutes entre deux rappels, à l'intérieur d'une plage */
  intervalleMinutes: number;
  /** les moments de la journée où les rappels sonnent, triés et sans chevauchement */
  plages: Plage[];
}

/** Une plage toute faite, proposée d'un geste. */
export interface PlagePrete {
  nom: string;
  plage: Plage;
}

/** Raccourci de lecture : `h(9, 30)` vaut 570. */
function h(heures: number, minutes = 0): number {
  return heures * 60 + minutes;
}

/**
 * Les plages proposées d'un appui.
 *
 * Elles décrivent la journée de travail la plus courante en France, coupure de midi comprise. Ce
 * n'est pas une contrainte : chacune se déplace ensuite à la demi-heure.
 */
export const PLAGES_PRETES: PlagePrete[] = [
  { nom: 'Matinée', plage: { debut: h(9), fin: h(12) } },
  { nom: 'Après-midi', plage: { debut: h(14), fin: h(19) } },
  { nom: 'Soirée', plage: { debut: h(19), fin: h(22) } },
];

/**
 * Quarante-cinq minutes, sur la matinée et l'après-midi.
 *
 * L'intervalle vient de la littérature sur la sédentarité, qui situe la rupture utile entre trente
 * et soixante minutes. Les deux plages laissent le déjeuner tranquille et ne débordent ni sur le
 * réveil ni sur la soirée : un rappel à 7 h du matin est désinstallé le jour même.
 */
export const RAPPELS_DEFAUT: RappelsConfig = {
  actif: false,
  intervalleMinutes: 45,
  plages: [PLAGES_PRETES[0].plage, PLAGES_PRETES[1].plage],
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
 * Bornes incluses des deux côtés : un intervalle de 60 minutes entre 9 h et 12 h donne bien un
 * rappel à 12 h. Les messages sont distribués à tour de rôle **sur la journée entière** et non
 * plage par plage, si bien que deux rappels voisins ne disent jamais la même chose, y compris de
 * part et d'autre de la coupure de midi.
 */
export function planifierRappels(config: RappelsConfig): Rappel[] {
  const c = normaliser(config);
  if (!c.actif) return [];

  const rappels: Rappel[] = [];

  for (const plage of c.plages) {
    for (let t = plage.debut; t <= plage.fin; t += c.intervalleMinutes) {
      if (rappels.length >= MAX_RAPPELS) return rappels;
      // Minuit exactement (24 h) n'existe pas comme heure : le dernier créneau est 23 h 59.
      if (t >= JOUR) break;
      const message = MESSAGES[rappels.length % MESSAGES.length];
      rappels.push({ hour: Math.floor(t / 60), minute: t % 60, ...message });
    }
  }

  return rappels;
}

/**
 * Ramène une configuration douteuse dans ses bornes, plutôt que de la refuser.
 *
 * Trois choses s'y jouent, et chacune évite un réglage qui s'afficherait bien sans rien produire :
 * les bornes de chaque plage, l'ordre, et la fusion de celles qui se chevauchent ou se touchent.
 * Deux plages superposées feraient sonner deux fois la même minute ; « 9 h – 12 h » et
 * « 12 h – 14 h » se lisent mieux en « 9 h – 14 h », qui est ce qu'elles disent.
 */
export function normaliser(config: RappelsConfig): RappelsConfig {
  const intervalle = INTERVALLES.includes(config.intervalleMinutes as (typeof INTERVALLES)[number])
    ? config.intervalleMinutes
    : RAPPELS_DEFAUT.intervalleMinutes;

  const brutes = Array.isArray(config.plages) ? config.plages : [];

  const bornees = brutes
    .map((p) => {
      const debut = borner(p?.debut, 0, JOUR - DUREE_MINIMALE);
      return { debut, fin: borner(p?.fin, debut + DUREE_MINIMALE, JOUR) };
    })
    .sort((a, b) => a.debut - b.debut);

  const plages: Plage[] = [];
  for (const plage of bornees) {
    const precedente = plages[plages.length - 1];
    // `>=` et non `>` : deux plages qui se touchent n'en font qu'une.
    if (precedente && plage.debut <= precedente.fin) {
      precedente.fin = Math.max(precedente.fin, plage.fin);
      continue;
    }
    if (plages.length >= MAX_PLAGES) break;
    plages.push({ ...plage });
  }

  return {
    actif: Boolean(config.actif),
    intervalleMinutes: intervalle,
    // Aucune plage et l'interrupteur allumé, ce serait la promesse que le système ne tiendra pas :
    // l'interface interdit de supprimer la dernière, et la lecture d'un réglage abîmé repart d'ici.
    plages: plages.length > 0 ? plages : RAPPELS_DEFAUT.plages.map((p) => ({ ...p })),
  };
}

/** Arrondit au pas de réglage et borne, sans jamais rendre autre chose qu'un nombre valide. */
function borner(valeur: unknown, min: number, max: number): number {
  if (typeof valeur !== 'number' || !Number.isFinite(valeur)) return min;
  const arrondie = Math.round(valeur / PAS_MINUTES) * PAS_MINUTES;
  return Math.min(max, Math.max(min, arrondie));
}

/**
 * Une plage libre à ajouter, ou `null` s'il n'y a plus de place.
 *
 * Proposée plutôt que demandée : personne n'a envie de choisir deux heures avant de voir à quoi
 * ressemble une troisième plage. Elle se pose après la dernière, une heure plus tard pour ne pas
 * fusionner aussitôt avec elle, et dure deux heures si la journée le permet.
 */
export function plageSuivante(plages: Plage[]): Plage | null {
  if (plages.length >= MAX_PLAGES) return null;

  const derniere = plages[plages.length - 1];
  const debut = derniere ? derniere.fin + 60 : h(9);
  if (debut + DUREE_MINIMALE > JOUR) return null;

  return { debut, fin: Math.min(debut + 120, JOUR) };
}

/**
 * Le nom d'une plage, déduit de son heure de début.
 *
 * Un nom donné plutôt que saisi : on règle des horaires, on ne baptise pas des plages. Il sert de
 * repère dans la liste — « Matinée » se retrouve du regard plus vite que « 9 h – 12 h ».
 */
export function nomDePlage(plage: Plage): string {
  const heure = plage.debut / 60;
  if (heure < 5) return 'Nuit';
  if (heure < 12) return 'Matinée';
  if (heure < 18) return 'Après-midi';
  if (heure < 22) return 'Soirée';
  return 'Nuit';
}

/** « 9 h », « 9 h 30 », « minuit » : l'écriture française, et pas un horaire de gare. */
export function formatHeure(minutes: number): string {
  if (minutes >= JOUR) return 'minuit';
  const heures = Math.floor(minutes / 60);
  const reste = minutes % 60;
  return reste === 0 ? `${heures} h` : `${heures} h ${String(reste).padStart(2, '0')}`;
}

export function formatPlage(plage: Plage): string {
  return `de ${formatHeure(plage.debut)} à ${formatHeure(plage.fin)}`;
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

  const quand = c.plages.map(formatPlage).join(' et ');

  return `${nombre} rappel${nombre > 1 ? 's' : ''} par jour, toutes les ${intervalle}, ${quand}.`;
}

/**
 * Lecture tolérante : un réglage illisible repart des valeurs par défaut, sans faire d'histoires.
 *
 * Elle sait aussi relire l'ancien réglage — une seule plage, écrite en `debutHeure` / `finHeure` —
 * et le convertit. Sans cela, quelqu'un qui avait allumé ses rappels les aurait vus se replacer
 * silencieusement sur les heures par défaut à la mise à jour.
 */
export function loadRappels(): RappelsConfig {
  const brut = lireCle(RAPPELS_KEY);
  if (!brut) return RAPPELS_DEFAUT;
  try {
    const data = JSON.parse(brut) as Partial<RappelsConfig> & {
      debutHeure?: number;
      finHeure?: number;
    };
    if (typeof data !== 'object' || data === null) return RAPPELS_DEFAUT;

    const plages = Array.isArray(data.plages)
      ? data.plages
      : ancienneForme(data.debutHeure, data.finHeure);

    return normaliser({ ...RAPPELS_DEFAUT, ...data, plages });
  } catch {
    return RAPPELS_DEFAUT;
  }
}

/** L'unique plage de l'ancien réglage, en minutes. Rend une liste vide si rien n'est lisible. */
function ancienneForme(debutHeure?: number, finHeure?: number): Plage[] {
  if (typeof debutHeure !== 'number' || typeof finHeure !== 'number') return [];
  return [{ debut: debutHeure * 60, fin: finHeure * 60 }];
}

export function saveRappels(config: RappelsConfig): void {
  ecrireCle(RAPPELS_KEY, JSON.stringify(normaliser(config)));
}
