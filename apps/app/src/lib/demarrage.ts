/**
 * Ce que le démarrage fait, selon la plateforme — en natif.
 *
 * `app/index.tsx` posait la question à l'exécution : `if (Platform.OS === 'web') return`. Cela
 * marchait, et cela enfreignait la règle que `AGENTS.md` énonce depuis le premier jour — une
 * différence de plateforme passe par un fichier que Metro choisit, **jamais** par un test à
 * l'exécution éparpillé dans les écrans. La règle n'existait que dans le texte : rien ne la
 * vérifiait, et l'écran d'accueil l'avait enfreinte sans que personne ne le voie.
 *
 * Le motif est celui de `LECTURE_IMMEDIATE` dans `store.ts` : une constante par plateforme, lue
 * par l'écran, qui n'a plus rien à savoir de l'endroit où il tourne.
 */

/**
 * En natif, l'application s'ouvre là où quelque chose est à faire — voir
 * `destinationAuDemarrage` dans `@vitae/core/nav`.
 */
export const REDIRIGE_AU_DEMARRAGE = true;
