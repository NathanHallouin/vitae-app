# Publier l'application

Tout ce qui est dans ce dossier est du texte à recopier dans les consoles d'Apple et de Google.
Rien ici n'est lu par le code : ce sont les fiches, les réponses aux questionnaires de conformité,
et l'ordre dans lequel s'y prendre.

L'état de départ, au moment où ceci est écrit : **aucun compte développeur n'est ouvert**. C'est le
chemin critique — tout le reste est prêt et attend ces deux comptes.

## 1. Ouvrir les comptes (à faire en premier, ça prend des jours)

| | Apple | Google |
|---|---|---|
| Programme | Apple Developer Program | Google Play Console |
| Coût | 99 $ / an, renouvelable | 25 $, une seule fois |
| Délai | 24 h à 7 jours (vérification d'identité) | 1 à 2 jours |
| Pièces | Pièce d'identité ; en société, un numéro D-U-N-S | Pièce d'identité, adresse |

Deux pièges qui coûtent des semaines si on les découvre trop tard :

- **Apple** : s'inscrire en **personne physique** est immédiat et suffisant ici. S'inscrire en
  société exige un numéro D-U-N-S, dont l'obtention prend à elle seule une à deux semaines.
- **Google, compte personnel** : depuis 2023, une première publication faite depuis un compte
  personnel exige **12 testeurs inscrits à un test fermé pendant 14 jours consécutifs** avant de
  pouvoir demander l'accès à la production. Ce n'est pas contournable, et cela ne se déclenche
  qu'une fois le compte créé. À lancer le plus tôt possible. Un compte d'organisation en est
  dispensé, mais demande une vérification d'entreprise.

## 2. Créer le projet EAS

Le compte Expo `nathanhallouin` est déjà connecté sur cette machine.

```sh
cd apps/app
bunx eas-cli@latest init          # crée le projet et écrit son identifiant
bunx eas-cli@latest build:configure
```

`eas init` renvoie un identifiant de projet. Le passer par l'environnement plutôt que de le
committer :

```sh
export EAS_PROJECT_ID=...         # ou dans le fichier .env local, jamais versionné
```

`app.config.ts` le lit dans `extra.eas.projectId`.

## 3. Réserver les identifiants d'application

Ils sont figés dans `app.config.ts` et **ne pourront plus changer après la première publication** :

- iOS et Android : `fr.metabolismedebase.app`

Côté Apple, créer l'App ID dans le portail développeur puis la fiche dans App Store Connect. Côté
Google, la fiche se crée directement dans la Play Console.

## 4. Construire et envoyer

```sh
bun run generate                                   # jetons, icônes, recettes, sitemap
cd apps/app
bunx eas-cli@latest build --profile production --platform all
bunx eas-cli@latest submit --profile production --platform ios
bunx eas-cli@latest submit --profile production --platform android
```

Les numéros de build sont gérés par EAS (`appVersionSource: "remote"`, `autoIncrement: true`) : il
n'y a rien à incrémenter à la main. Seul `VERSION`, dans `app.config.ts`, se met à jour à chaque
version visible par l'utilisateur.

Le profil `production` d'Android livre un **app bundle** et le dépose en **piste interne, en
brouillon** : rien ne part en production sans une action explicite dans la console.

## 5. Remplir les fiches

- Apple : [`app-store.md`](app-store.md)
- Google : [`play-store.md`](play-store.md)

Les deux exigent une URL de politique de confidentialité. C'est
`https://metabolisme-de-base.fr/confidentialite`, produite par la même base de code
(`apps/app/app/confidentialite.tsx`) : le site doit donc être en ligne **avant** de soumettre.

## 6. Captures d'écran

Aucune n'est fournie ici : elles se prennent sur l'application construite, pas sur une maquette.

| | Formats exigés |
|---|---|
| Apple | iPhone 6,9″ (1320 × 2868) **et** 6,5″ (1242 × 2688). L'iPad n'est exigé que si l'on coche la compatibilité iPad — c'est le cas (`supportsTablet: true`), prévoir donc aussi 13″. |
| Google | 2 captures minimum, 320 à 3840 px de côté ; plus une **icône 512 × 512** et une **bannière 1024 × 500**. |

Les quatre écrans qui montrent le mieux l'application : Mon métabolisme (le grand chiffre), Ce que
je mange (la fourchette et les macros), Bouger (le programme), une recette (l'atelier de cuisine).

Le mode sombre est un argument : en montrer au moins une.

## Ce qui reste à décider

- **Compte Apple en personne physique ou en société** : le nom du compte est celui qui s'affiche
  sous le nom de l'application sur la fiche. Un nom propre y est visible publiquement.
- **Prix** : gratuit, sans achat intégré, dans les deux fiches préparées ici.
- **Pays de diffusion** : l'interface n'existe qu'en français. Diffuser partout ne coûte rien, mais
  une diffusion limitée à la France, la Belgique, la Suisse et le Canada donne des retours plus
  cohérents au démarrage.
