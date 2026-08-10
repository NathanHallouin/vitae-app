# Roadmap

État de référence : calculateur complet découpé en quatre pages thématiques (`/metabolisme`,
`/alimentation`, `/poids`, `/bouger`) plus `/profil`, métier isolé dans `src/lib`, profil persisté
en `localStorage`, textes en langage courant, thème clair/sombre. Bun + Biome, 31 tests,
déploiement Vercel.

Estimations en jours-homme. L'ordre à l'intérieur d'un jalon est un ordre de priorité.

**Contrainte structurante : pas de base de données ni de comptes utilisateurs pour l'instant.**
L'app reste entièrement cliente et déployable en statique sur Vercel. Toute donnée persistée vit
dans le navigateur (`localStorage`), et la portabilité entre appareils passe par un export / import
de fichier, pas par une synchronisation. Les chantiers qui exigeraient un backend sont listés en
fin de document avec le signal qui justifierait de rouvrir la question.

## v1.1 — Finitions avant de montrer l'app (≈ 3 j)

### 1. Contraste des textes — fait

Réglé lors de la refonte visuelle : le `faint` de la maquette (`#9e9e9e`, 2,7:1 sur blanc) a été
remplacé par `#6f7d75` (4,6:1), et la palette sombre a été reconstruite sur la même exigence.
Mesuré dans le navigateur : les petits textes tournent autour de 7:1 en mode sombre.

### 2. ARIA des groupes d'options — 0,5 j (élargi)

`ProfilForm` déclare `role="radiogroup"` mais les enfants sont des `<button aria-pressed>` : les
lecteurs d'écran n'annoncent pas « 2 sur 5 » et les flèches directionnelles ne naviguent pas entre
les options.

- `role="radio"` + `aria-checked`, navigation clavier (flèches, Home/End), un seul point d'entrée
  dans l'ordre de tabulation par groupe.
- Concerne : sexe, niveau d'activité, objectif (formulaire et page « Ce que je mange »), poids
  cible sur la page « Mon poids ».

### 3. Persistance `localStorage` — fait pour le profil, reste le thème (0,25 j)

**Livré** : profil complet enregistré sous `vitae.v1.profile` (clé versionnée, lecture tolérante
dans `parseProfile`), date de naissance à la place de l'âge pour que l'âge se recalcule seul,
horodatage des modifications, poids redemandé au-delà de 7 jours, date de naissance figée une fois
enregistrée. Couvert par `src/lib/profile.test.ts`.

**Reste à faire** : le thème, toujours réinitialisé à chaque rechargement.

Sans base de données, `src/lib/storage.ts` est la **fondation de tout le v2** : la qualité de cette
couche conditionne le suivi de poids et les profils multiples.

- Persister le thème choisi, avec `InitColorSchemeScript` pour éviter le flash clair → sombre.
- Respecter `prefers-color-scheme` tant que l'utilisateur n'a pas choisi explicitement.
- Contrainte déjà respectée pour le profil, à conserver : la lecture se fait au montage et non
  pendant le rendu serveur, pour que l'état initial reste déterministe.

### 4. Intégration continue — 0,5 j

Rien ne garde le vert entre deux commits aujourd'hui.

- GitHub Actions sur chaque PR : `bun install --frozen-lockfile`, `bun run check`, `bun test`,
  `bun run typecheck`, `bun run build`.

### 5. SEO et partage — 0,5 j

C'est une app grand public dont l'acquisition passera par la recherche, et le levier est à zéro.

- `robots.txt`, `sitemap.ts`, image Open Graph générée par `next/og`.
- Données structurées, titre et description travaillés sur la requête cible.

## v1.2 — Ce qui fait revenir l'utilisateur (≈ 5 j)

- **État dans l'URL** (`?s=h&n=1992-03-15&t=178&p=86&act=1&g=seche`) — 1 j
  Aujourd'hui les pages ont chacune leur URL, mais elles lisent le profil local : un lien envoyé à
  quelqu'un d'autre le renvoie vers `/profil`. Porter le profil dans la requête rendrait les
  résultats vraiment partageables, et permettrait un rendu serveur.
- **Export du plan** — 1 j
  Feuille d'impression (`@media print`) et bouton « Copier mon résumé ». Le cas d'usage réel est
  d'emmener ces chiffres chez un professionnel ou de les recopier dans une app de suivi.
- **Unités impériales** (lb, ft/in) avec détection par la locale — 1 j
  Ouvre le marché anglophone sans toucher au métier : `src/lib/format.ts` isole déjà les formats.
- **Formule Katch-McArdle en option** (si le taux de masse grasse est connu) — 1 j
  Nettement plus juste pour les personnes musclées, exactement la population que l'IMC pénalise —
  l'app le dit elle-même dans son avertissement.
- **Tests E2E Playwright** sur les trois parcours (guidé, formulaire, erreurs de validation) — 1 j
- **Suivi des séances** — 1 j
  Cocher une séance faite dans la semaine, et voir la régularité sur le mois. Local, comme le
  reste.

## v2 — Local-first, sans backend (≈ 7 j)

Tout ce qui suit tient dans le navigateur et s'appuie sur le module de stockage du v1.1.

- **Suivi de poids dans le temps** — 3 j
  Saisies hebdomadaires stockées en local, courbe réelle superposée à la projection théorique, et
  invitation à réévaluer les besoins tous les 4 à 5 kg — l'app recommande déjà cette réévaluation
  sans l'outiller. `localStorage` suffit largement (une pesée par semaine sur deux ans ≈ 4 ko) ;
  IndexedDB serait de la sur-ingénierie ici.
- **Export / import du profil et de l'historique en JSON** — 1 j
  C'est le substitut assumé à la synchronisation : l'utilisateur récupère un fichier, le range où
  il veut, le réimporte sur un autre appareil. À faire **en même temps** que le suivi de poids,
  sinon on crée des données qu'un simple vidage de cache détruit sans recours.
- **Plusieurs profils en local** — 1 j
  Soi, un proche, ou des clients si l'utilisateur est coach. Sélecteur de profil, chaque profil
  ayant son historique. Sans comptes, la limite à assumer et à afficher : les profils sont liés au
  navigateur, pas à une identité.
- **Choix du menu** — 1 j
  La journée type est faite (`src/lib/nutrition.ts`). Reste à proposer des variantes : version
  végétarienne, sans lactose, et un bouton « une autre journée » qui change les sources.
- **Internationalisation** (`next-intl`) — 1 j, à faire après les unités impériales.

### Limites à afficher clairement dans l'interface

Sans compte, ces trois cas font perdre les données, et l'utilisateur doit le savoir avant
d'investir des semaines de pesées : vidage des données du navigateur, navigation privée, et
changement d'appareil sans export préalable.

## Reporté : comptes et base de données

Écarté volontairement pour l'instant. Ce qui justifierait de rouvrir la question, par ordre de
force du signal :

- des utilisateurs qui perdent leur historique et le signalent (mesurable dès le v2) ;
- une demande récurrente de synchronisation entre téléphone et ordinateur ;
- un usage professionnel — un coach qui suit des clients a besoin d'un partage et d'une sauvegarde
  fiables, pas d'un fichier JSON.

Conséquences si cela arrive : hébergement des données de santé (RGPD, information et consentement),
authentification, sauvegardes, et une app qui n'est plus déployable en statique. Le format d'export
JSON du v2 doit donc être pensé comme un futur format d'import serveur.

## Dette et garde-fous

- `ProfileProvider` est le point de passage unique vers le profil : toute nouvelle donnée persistée
  doit y entrer plutôt que d'appeler `localStorage` depuis un écran.
- Sans backend, le schéma des données locales est un contrat public : une clé versionnée et une
  fonction de migration dès la première écriture évitent de casser les historiques au premier
  changement de format.
- Biome ne couvre pas les règles `next/core-web-vitals` : si `next/image` ou `next/link` entrent
  dans le code, seul `bun run build` les vérifiera.
- Contenu santé : ajouter une exclusion explicite pour la grossesse et les moins de 15 ans. La
  validation bloque déjà l'âge, mais rien ne l'explique à l'utilisateur.
- Vercel Analytics et Speed Insights : deux lignes de code, et cela évite de prioriser à l'aveugle.
- La maquette (`maquette/`) reste la source de vérité des valeurs et des copies. Toute évolution
  qui s'en écarte doit être notée dans `README.md`, comme les deux écarts responsive déjà
  documentés.
