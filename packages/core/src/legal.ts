/**
 * La politique de confidentialité.
 *
 * Elle est ici, en données, et non dans un document à part, pour une raison pratique : Apple et
 * Google exigent tous deux une URL publique, et cette URL doit dire exactement ce que
 * l'application fait. Écrite dans le dépôt, à côté du code qu'elle décrit, elle se corrige dans le
 * même commit que le comportement qu'elle documente.
 *
 * Le texte est court parce que le sujet l'est : rien ne sort de l'appareil.
 */

export interface Section {
  titre: string;
  paragraphes: string[];
}

/** Date de dernière révision, affichée en bas de page. À corriger à chaque modification du texte. */
export const CONFIDENTIALITE_MAJ = '2026-08-14';

export const CONFIDENTIALITE_RESUME =
  'Cette application ne collecte aucune donnée. Vos réponses sont enregistrées sur votre appareil, et nulle part ailleurs.';

export const CONFIDENTIALITE: Section[] = [
  {
    titre: 'Ce que nous collectons',
    paragraphes: [
      'Rien. Il n’y a ni compte, ni serveur, ni base de données. Nous ne recevons ni votre sexe, ni votre date de naissance, ni votre taille, ni votre poids, ni votre objectif, ni les recettes que vous consultez.',
      'L’application ne contient aucun outil de mesure d’audience, aucun traceur publicitaire et aucun service d’analyse tiers.',
    ],
  },
  {
    titre: 'Où vont vos réponses',
    paragraphes: [
      'Les informations que vous saisissez sont écrites dans l’espace de stockage privé de l’application, sur votre appareil. Sur le site, elles sont écrites dans le stockage local de votre navigateur.',
      'Les calculs — métabolisme de base, dépense totale, IMC, répartition des macronutriments, projection de poids, programme d’entraînement — sont faits sur votre appareil, à partir de ces seules informations.',
    ],
  },
  {
    titre: 'Comment les effacer',
    paragraphes: [
      'Le bouton « Tout effacer », sur l’écran de votre profil, supprime immédiatement et définitivement l’ensemble des informations enregistrées.',
      'Désinstaller l’application produit le même effet. Sur le site, vider les données du navigateur pour ce domaine suffit.',
      'Comme rien n’est envoyé nulle part, il n’y a aucune demande de suppression à nous adresser : nous n’avons rien à supprimer.',
    ],
  },
  {
    titre: 'Les rappels de mouvement',
    paragraphes: [
      'Si vous activez les rappels qui invitent à vous lever, ils sont programmés sur votre téléphone, par votre téléphone. Aucun serveur ne nous prévient, et aucun identifiant d’appareil n’est créé : ce sont des notifications locales, pas des notifications poussées.',
      'Nous ne savons donc ni que vous les avez activés, ni à quelle heure ils sonnent, ni si vous les ouvrez. Les désactiver se fait au même endroit, sur l’écran « Bouger ».',
    ],
  },
  {
    titre: 'Ce qui sort de l’application',
    paragraphes: [
      'Un seul cas : les suggestions de recettes renvoient vers des sites de cuisine extérieurs. Toucher l’une d’elles ouvre une page web, et le site visité applique alors sa propre politique. Le lien ne transporte aucune de vos informations : c’est une simple recherche par mots-clés.',
      'Aucune autre fonction de l’application n’ouvre de connexion réseau.',
    ],
  },
  {
    titre: 'Enfants et santé',
    paragraphes: [
      'L’application n’est pas destinée aux moins de quinze ans, et le calcul est refusé en deçà.',
      'Les chiffres affichés sont des estimations issues de formules établies, pas un avis médical. En cas de doute, notamment en cas de grossesse, d’allaitement, de maladie chronique ou de traitement en cours, parlez-en à un médecin ou à un diététicien.',
    ],
  },
  {
    titre: 'Modifications',
    paragraphes: [
      'Si cette politique change, la date de révision ci-dessous change avec elle. Toute évolution qui introduirait une collecte de données serait annoncée dans l’application avant d’entrer en vigueur.',
    ],
  },
  {
    titre: 'Nous écrire',
    paragraphes: ['Pour toute question sur cette politique : wilhelm.rosental@gmail.com'],
  },
];
