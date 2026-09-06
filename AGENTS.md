# Travailler sur ce dépôt

Une seule base de code Expo produit l'application iOS, l'application Android et le site. Il n'y a
pas de projet web séparé — le site est un mode de livraison de l'application, pas un second front.

Avant de coder, lire la section « Architecture » de `README.md`. Elle explique ce que chaque paquet
contient et pourquoi, et la moitié des pièges de ce dépôt y sont déjà écrits.

## Avant le premier commit

```sh
git config core.hooksPath .githooks
```

Le crochet lance format, types et tests avant chaque commit — sept secondes — et refuse un commit
qui touche à `.github/workflows/` sans un `VITAE_CI=1` explicite. La raison : la CI est ce qui
vérifie le travail, et un agent qui peut la modifier au fil d'un commit ordinaire peut désarmer son
propre contrôle sans que personne ne le voie.

Ce que l'allowlist de `.claude/settings.local.json` **ne protège pas**, et qu'il vaut mieux savoir
que croire : `python3 -` y figure, donc l'exécution de code arbitraire est ouverte. C'est délibéré
— les modifications de fichiers passent par là dans cet environnement — mais cela veut dire que
l'allowlist est une commodité, pas une frontière. La frontière est ailleurs : pas de secret dans le
dépôt, pas de serveur, pas de base, et le crochet ci-dessus.

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

**Aucun test `Platform.OS` entre le web et le natif, nulle part.** Quand la différence est
inévitable, elle passe par un fichier `.web.ts` ou `.web.tsx` que Metro choisit — c'est le cas de
la lecture du profil au démarrage (`lib/store.ts`), de la redirection (`lib/demarrage.ts`), de
l'écran de lancement (`lib/splash.ts`), des balises de tête (`components/layout/Seo.tsx`) et de
quatre autres. La CI le vérifie sur `app/` et `src/components/`.

La seule exception est une distinction qui **n'est pas** web contre natif : `DateField.tsx`
distingue iOS d'Android, ce qu'aucun fichier `.web` ne saurait exprimer.

**Les textes sont en français, dans le métier.** Les copies d'interface vivent dans
`packages/core` (`constants.ts`, `explainers.ts`, `legal.ts`, `nutrition.ts`, `training.ts`), pas
dans les composants — c'est ce qui les rend traduisibles un jour, et corrigeables à un seul endroit.

**Un seul objet signature par écran, et un seul encart.** Le cadran dit toujours une part d'un
tout — jamais un ornement ; `Hero` rend `part` obligatoire pour cela. L'encart pédagogique a une
forme unique quel que soit son déclencheur, et il n'y en a jamais deux : c'est `encartDeLEcran`
(`packages/core/src/cours.ts`) qui tranche, dans le métier, pour que la règle se teste sans écran.

**La navigation a quatre sections et deux niveaux.** Barre du bas : mes chiffres, recettes,
comprendre, profil. Les quatre écrans de résultats n'en font qu'un — `ResultTabs` est leur second
niveau. L'en-tête ne porte que la marque : le haut de l'écran est hors de portée du pouce.

**Les commentaires expliquent pourquoi, pas quoi.** Ce dépôt en compte beaucoup, et ils portent des
décisions et des pièges rencontrés. Les garder à jour fait partie du changement — un commentaire
qui affirme n'est vérifié par personne, et il survit à ce qu'il décrit. C'est arrivé.
