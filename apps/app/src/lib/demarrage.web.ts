/**
 * Ce que le démarrage fait, selon la plateforme — sur le web.
 *
 * **Aucune redirection.** `/` est la page de présentation, pré-rendue et indexable : c'est
 * l'adresse la plus référencée du site. Quelqu'un qui arrive d'un moteur de recherche n'a pas de
 * profil, et l'envoyer sur un écran de résultats vide serait le pire accueil possible — sans
 * compter que la page la plus visitée sortirait alors sans contenu à indexer, ce qui est
 * exactement le défaut corrigé au commit `69c8ad8`.
 */
export const REDIRIGE_AU_DEMARRAGE = false;
