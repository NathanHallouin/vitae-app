/**
 * Export et import des données locales, en JSON.
 *
 * C'est le substitut assumé à la synchronisation : sans compte ni serveur, un vidage du cache du
 * navigateur, une navigation privée ou un changement d'appareil font disparaître des mois de
 * pesées sans recours. Ce module est ce recours, et il doit être livré **en même temps** que le
 * suivi de poids — créer des données précieuses sans porte de sortie serait leur tendre un piège.
 *
 * Deux exigences guident le format, et elles ne sont pas les mêmes :
 *
 * — **Il doit se relire soi-même**, y compris une version plus ancienne. D'où le champ `v`, et une
 *   lecture qui accepte ce qu'elle comprend plutôt que de tout rejeter.
 * — **Il doit pouvoir devenir un format d'import serveur** si des comptes apparaissent un jour
 *   (voir ROADMAP). C'est pourquoi il porte des noms de champs explicites plutôt que la forme
 *   interne du stockage, et une date d'export : un serveur qui reçoit deux fichiers doit pouvoir
 *   les départager.
 *
 * Ce que le fichier ne contient pas, volontairement : ni identifiant, ni jeton, ni rien qui
 * désigne un appareil. Il est fait pour être rangé dans un dossier, pas pour être reconnu.
 */

import { lirePesees, parseProfile, type StoredProfile } from './storage';
import type { Pesee } from './suivi';

export const SAUVEGARDE_VERSION = 1;

export interface Sauvegarde {
  profil: StoredProfile | null;
  pesees: Pesee[];
}

/**
 * Le nom du fichier proposé à l'enregistrement.
 *
 * Daté, parce qu'on exporte plusieurs fois et qu'un dossier de téléchargements finit sinon avec
 * `sauvegarde (3).json`, dont personne ne sait ce qu'il contient.
 */
export function nomDeFichier(aujourdhui: string): string {
  return `metabolisme-de-base-${aujourdhui}.json`;
}

export function construireSauvegarde(
  profil: StoredProfile | null,
  pesees: Pesee[],
  exporteLe: string,
): string {
  return `${JSON.stringify(
    {
      v: SAUVEGARDE_VERSION,
      application: 'Métabolisme de base',
      exporteLe,
      profil,
      pesees,
    },
    null,
    2,
  )}\n`;
}

/** Ce qu'une lecture peut renvoyer, pour que l'écran sache quoi dire. */
export type Lecture =
  | { ok: true; sauvegarde: Sauvegarde; message: string }
  | { ok: false; message: string };

/**
 * Relit une sauvegarde.
 *
 * Les messages d'erreur nomment ce qui ne va pas plutôt que de dire « fichier invalide » : quand
 * on restaure des données auxquelles on tient, savoir *pourquoi* ça a échoué décide de la suite —
 * réessayer avec un autre fichier, ou aller le chercher ailleurs.
 */
export function lireSauvegarde(texte: string): Lecture {
  const brut = texte.trim();
  if (!brut) return { ok: false, message: 'Le fichier est vide.' };

  let data: unknown;
  try {
    data = JSON.parse(brut);
  } catch {
    return {
      ok: false,
      message: 'Ce n’est pas un fichier de sauvegarde : le contenu n’est pas du JSON lisible.',
    };
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { ok: false, message: 'Ce fichier ne contient pas une sauvegarde.' };
  }

  const s = data as Record<string, unknown>;
  if (typeof s.v !== 'number') {
    return { ok: false, message: 'Ce fichier ne porte pas de version : il ne vient pas d’ici.' };
  }
  if (s.v > SAUVEGARDE_VERSION) {
    return {
      ok: false,
      message:
        'Ce fichier vient d’une version plus récente de l’application. Mettez-la à jour avant de restaurer.',
    };
  }

  const pesees = Array.isArray(s.pesees) ? lirePesees(s.pesees) : [];
  const profil = lireProfilDeSauvegarde(s.profil);

  if (!profil && pesees.length === 0) {
    return { ok: false, message: 'Ce fichier ne contient ni profil ni pesée à restaurer.' };
  }

  return {
    ok: true,
    sauvegarde: { profil, pesees },
    message: resume(profil !== null, pesees.length),
  };
}

/**
 * Le profil d'une sauvegarde passe par `parseProfile`, comme celui du stockage.
 *
 * Importer un profil est exactement lire un profil : lui appliquer une autre validation ferait
 * accepter par le fichier ce que le stockage refuserait, ou l'inverse.
 */
function lireProfilDeSauvegarde(valeur: unknown): StoredProfile | null {
  if (typeof valeur !== 'object' || valeur === null) return null;
  // `parseProfile` prend la chaîne telle qu'elle sort du stockage : on la lui reconstitue.
  return parseProfile(JSON.stringify(valeur));
}

function resume(avecProfil: boolean, nombreDePesees: number): string {
  const morceaux: string[] = [];
  if (avecProfil) morceaux.push('votre profil');
  if (nombreDePesees === 1) morceaux.push('1 pesée');
  else if (nombreDePesees > 1) morceaux.push(`${nombreDePesees} pesées`);
  return `Prêt à restaurer : ${morceaux.join(' et ')}.`;
}
