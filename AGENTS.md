# Travailler sur ce dépôt

Une seule base de code Expo produit l'application iOS, l'application Android et le site. Il n'y a
pas de projet web séparé — le site est un mode de livraison de l'application, pas un second front.

Avant de coder, lire la section « Architecture » de `README.md`. Elle explique ce que chaque paquet
contient et pourquoi, et la moitié des pièges de ce dépôt y sont déjà écrits.

## Commandes

```sh
bun install
bun run generate     # jetons, icônes, recettes, sitemap, manifeste — indispensable après un clone
bun run dev:web      # navigateur, rechargement à chaud
bun run dev          # Expo, choix de la plateforme au lancement

bun test packages    # le métier et le contenu
bun run typecheck
bun run check        # Biome : format, règles, imports
bun run check:fix
bun run build:web    # export statique du site → apps/app/dist, service worker compris
```

## Ce qu'il faut savoir avant de toucher au code

**Le métier ne connaît aucune plateforme.** `packages/core` n'importe ni React, ni React Native, ni
`node:fs`. C'est ce qui permet de le tester sans environnement de rendu. Une fonction qui a besoin
du stockage ou du routeur reçoit ce dont elle a besoin en paramètre.

**Les fichiers engendrés ne se modifient pas à la main.** `recettes.generated.ts` vient des Markdown,
`tokens.generated.css` vient de `packages/core/src/tokens.ts`. Un `bun run generate` les réécrit.

**Le site doit rester lisible sans JavaScript.** Chaque route est pré-rendue. Un contenu replié se
cache avec `display: 'none'`, jamais par un rendu conditionnel — sinon il disparaît du HTML livré
aux moteurs de recherche. La CI le vérifie sur le fichier produit.

**Une seule concession de plateforme est admise**, et elle est déjà écrite : le moment où le profil
est lu au démarrage. Tout le reste doit se comporter pareil partout. Quand une différence est
inévitable, elle passe par un fichier `.web.ts` que Metro choisit, jamais par un test à l'exécution
éparpillé dans les écrans.

**Les textes sont en français, dans le métier.** Les copies d'interface vivent dans
`packages/core` (`constants.ts`, `explainers.ts`, `legal.ts`, `nutrition.ts`, `training.ts`), pas
dans les composants — c'est ce qui les rend traduisibles un jour, et corrigeables à un seul endroit.

**Les commentaires expliquent pourquoi, pas quoi.** Ce dépôt en compte beaucoup, et ils portent des
décisions et des pièges rencontrés. Les garder à jour fait partie du changement.
