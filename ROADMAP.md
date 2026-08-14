# Roadmap

État de référence : une seule base de code Expo qui rend l'application sur iOS et Android et, par
export statique, produit le site. Six écrans (`/metabolisme`, `/alimentation`, `/poids`,
`/bouger`, `/profil`, `/recettes`) plus l'accueil et la confidentialité. Métier isolé dans
`packages/core`, recettes compilées depuis le Markdown, profil persisté sur l'appareil, textes en
langage courant, thème clair/sombre retenu d'un lancement à l'autre. Bun + Biome, 93 tests.

Estimations en jours-homme. L'ordre à l'intérieur d'un jalon est un ordre de priorité.

**Contrainte structurante : pas de base de données ni de comptes utilisateurs pour l'instant.**
Toute donnée persistée vit sur l'appareil — MMKV en natif, `localStorage` sur le web — et la
portabilité entre appareils passe par un export / import de fichier, pas par une synchronisation.
C'est aussi ce qui autorise la déclaration « aucune donnée collectée » chez Apple comme chez
Google, la plus simple à défendre. Les chantiers qui exigeraient un backend sont listés en fin de
document avec le signal qui justifierait de rouvrir la question.

## v1.0 : Sortir sur les magasins (≈ 4 j, hors délais administratifs)

Le chemin critique n'est pas technique. Voir `store/README.md` pour le détail.

### 1. Ouvrir les comptes développeur : bloquant

Rien ne peut être publié avant. Apple : 99 $/an, 24 h à 7 jours de vérification. Google : 25 $ une
fois, plus **12 testeurs pendant 14 jours consécutifs** si le compte est personnel. À lancer en
premier, tout le reste attend.

### 2. Mettre le site en ligne : 0,5 j

Les deux magasins exigent une URL de politique de confidentialité joignable au moment de l'examen.
`bun run build:web` produit `apps/app/dist`, à servir en statique.

### 3. Captures d'écran : 1 j

Quatre écrans, en clair et en sombre, aux formats exigés par chaque magasin. À prendre sur un build
réel, pas sur une maquette.

### 4. Premier build et envoi : 0,5 j

`eas build --profile production --platform all`, puis `eas submit`. Le profil Android dépose en
piste interne, en brouillon : rien ne part en production sans action explicite.

### 5. Essais sur appareil : 2 j

Ce qui ne se vérifie pas depuis une machine de développement : la lecture du profil au démarrage à
froid, le sélecteur de date natif sur les deux plateformes, l'écran maintenu allumé pendant une
recette, le rendu des polices sur Android, le comportement des marges de sécurité sur un iPhone à
encoche et sur un Android à barre gestuelle.

## v1.1 : Finitions avant de montrer l'app (≈ 3 j)

### 1. Contraste des textes : fait

Réglé lors de la refonte visuelle : le `faint` de la maquette (`#9e9e9e`, 2,7:1 sur blanc) a été
remplacé par `#6f7d75` (4,6:1), et la palette sombre a été reconstruite sur la même exigence.
Mesuré dans le navigateur : les petits textes tournent autour de 7:1 en mode sombre.

### 2. Groupes d'options : fait pour les rôles, reste le clavier (0,25 j)

**Livré** : `OptionButton` annonce `radio` et son état de sélection, et chaque groupe est déclaré
`radiogroup`. Les lecteurs d'écran annoncent désormais correctement « sélectionné ». Concerne le
sexe, le niveau d'activité, l'objectif et le poids cible.

**Reste à faire**, et uniquement sur le web, où il y a un clavier : navigation par flèches et
Home/End à l'intérieur d'un groupe, avec un seul point d'entrée dans l'ordre de tabulation.
React Native n'a pas d'équivalent de `roving tabindex` ; il faudra le poser à la main sur la
plateforme web.

### 3. Persistance : fait

**Livré** : profil complet enregistré sous `vitae.v1.profile` (clé versionnée, lecture tolérante
dans `parseProfile`), date de naissance à la place de l'âge pour que l'âge se recalcule seul,
horodatage des modifications, poids redemandé au-delà de 7 jours, date de naissance figée une fois
enregistrée. Couvert par `packages/core/src/profile.test.ts`.

**Livré aussi** : le thème est retenu d'un lancement à l'autre, sous une clé distincte du profil —
c'est une préférence d'affichage, pas une donnée de santé, et « Tout effacer » ne doit pas la
remettre en clair.

Sans base de données, `packages/core/src/storage.ts` est la **fondation de tout le v2** : la
qualité de cette couche conditionne le suivi de poids et les profils multiples. Le module ne
connaît aucun support et le reçoit par injection ; toute nouvelle donnée persistée doit passer par
lui, jamais par MMKV ou `localStorage` depuis un écran.

**Reste à faire** : respecter `prefers-color-scheme` tant que l'utilisateur n'a pas choisi
explicitement. La préférence est aujourd'hui retenue dès la première bascule, mais un thème jamais
choisi suit déjà le système (`colorScheme` à `system`).

### 4. Intégration continue : fait

`.github/workflows/ci.yml` sur chaque PR : fichiers engendrés, Biome, types, 93 tests, export du
site. Une étape vérifie le HTML produit — titre, canonique, JSON-LD — parce qu'une page vide
passait toutes les autres, ce qui est précisément arrivé au premier export.

### 5. SEO et partage : fait, sauf l'image de partage (0,5 j)

**Livré** : `robots.txt` et `sitemap.xml` engendrés, balises de titre, description et canonique par
route, JSON-LD `Recipe` sur chaque recette, pré-rendu statique de toutes les routes.

**Reste à faire** : l'image Open Graph. `next/og` n'existe plus ; il faut soit une image fixe par
type de page, soit une génération à la compilation avec `sharp`, déjà présent pour les icônes.

## v1.2 : Ce qui fait revenir l'utilisateur (≈ 5 j)

- **État dans l'URL** (`?s=h&n=1992-03-15&t=178&p=86&act=1&g=seche`) : 1 j
  Aujourd'hui les écrans ont chacun leur adresse, mais ils lisent le profil local : un lien envoyé
  à quelqu'un d'autre le renvoie vers la saisie. Porter le profil dans la requête rendrait les
  résultats vraiment partageables, et donnerait au passage des liens profonds utiles depuis
  l'application native.
- **Export du plan** : 1 j
  Feuille d'impression (`@media print`) et bouton « Copier mon résumé ». Le cas d'usage réel est
  d'emmener ces chiffres chez un professionnel ou de les recopier dans une app de suivi.
- **Unités impériales** (lb, ft/in) avec détection par la locale : 1 j
  Ouvre le marché anglophone sans toucher au métier : `packages/core/src/format.ts` isole déjà les formats.
- **Formule Katch-McArdle en option** (si le taux de masse grasse est connu) : 1 j
  Nettement plus juste pour les personnes musclées, exactement la population que l'IMC pénalise :
  l'app le dit elle-même dans son avertissement.
- **Tests de bout en bout** sur les trois parcours (guidé, formulaire, erreurs de validation) :
  1,5 j. Maestro plutôt que Playwright : il couvre iOS et Android, et le web reste vérifiable par
  l'export statique déjà contrôlé en CI.
- **Suivi des séances** : 1 j
  Cocher une séance faite dans la semaine, et voir la régularité sur le mois. Local, comme le
  reste.
- **Rappels anti-sédentarité : faits.** Réglables sur l'écran « Bouger » (intervalle, plage
  horaire), notifications locales, silencieuses, absentes du site. Deux suites possibles, aucune
  urgente :
  - **Restreindre à la semaine** : demande un déclencheur hebdomadaire par jour et par heure, soit
    cinq fois plus de notifications en attente. iOS en plafonne soixante-quatre : il faudrait
    reprogrammer glissant, à l'ouverture de l'application, plutôt que tout poser d'un coup.
  - **Déclencher sur l'inactivité réelle** plutôt qu'à heure fixe : podomètre (`expo-sensors`) ou
    données de santé. Change la nature du produit — permission sensible, déclaration de collecte
    dans les deux fiches, et la promesse « aucune donnée » tombe. À n'ouvrir que si les retours le
    réclament.

## v2 : Local-first, sans backend (≈ 7 j)

Tout ce qui suit tient dans le navigateur et s'appuie sur le module de stockage du v1.1.

- **Suivi de poids dans le temps** : 3 j
  Saisies hebdomadaires stockées en local, courbe réelle superposée à la projection théorique, et
  invitation à réévaluer les besoins tous les 4 à 5 kg, ce que l'app recommande déjà sans
  l'outiller. `localStorage` suffit largement (une pesée par semaine sur deux ans ≈ 4 ko) ;
  IndexedDB serait de la sur-ingénierie ici.
- **Export / import du profil et de l'historique en JSON** : 1 j
  C'est le substitut assumé à la synchronisation : l'utilisateur récupère un fichier, le range où
  il veut, le réimporte sur un autre appareil. À faire **en même temps** que le suivi de poids,
  sinon on crée des données qu'un simple vidage de cache détruit sans recours.
- **Plusieurs profils en local** : 1 j
  Soi, un proche, ou des clients si l'utilisateur est coach. Sélecteur de profil, chaque profil
  ayant son historique. Sans comptes, la limite à assumer et à afficher : les profils sont liés au
  navigateur, pas à une identité.
- **Choix du menu** : 1 j
  La journée type est faite (`packages/core/src/nutrition.ts`). Reste à proposer des variantes : version
  végétarienne, sans lactose, et un bouton « une autre journée » qui change les sources.
- **Internationalisation** : 1 j, à faire après les unités impériales. `expo-localization` pour la
  détection, `i18n-js` ou équivalent pour les catalogues. Les textes sont déjà rassemblés dans
  `packages/core` (`constants.ts`, `explainers.ts`, `nutrition.ts`, `training.ts`), ce qui est le
  gros du travail d'extraction.

### Limites à afficher clairement dans l'interface

Sans compte, ces trois cas font perdre les données, et l'utilisateur doit le savoir avant
d'investir des semaines de pesées : vidage des données du navigateur, navigation privée, et
changement d'appareil sans export préalable.

## Reporté : comptes et base de données

Écarté volontairement pour l'instant. Ce qui justifierait de rouvrir la question, par ordre de
force du signal :

- des utilisateurs qui perdent leur historique et le signalent (mesurable dès le v2) ;
- une demande récurrente de synchronisation entre téléphone et ordinateur ;
- un usage professionnel : un coach qui suit des clients a besoin d'un partage et d'une sauvegarde
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
- Le pré-rendu du site est fragile par nature : tout composant qui refuse de rendre hors navigateur
  produit une page vide sans faire échouer le build. La CI garde une vérification sur le HTML
  produit ; l'étendre à chaque nouvelle route indexable.
- `react-native-web` rend des `<div>`, pas un balisage sémantique. Les rôles d'accessibilité
  (`accessibilityRole="header"`, `"link"`, `"radio"`) sont ce qui tient lieu de structure : les
  omettre dégrade le référencement autant que les lecteurs d'écran.
- Contenu santé : ajouter une exclusion explicite pour la grossesse et les moins de 15 ans. La
  validation bloque déjà l'âge, mais rien ne l'explique à l'utilisateur.
- Mesure d'audience : **aucune, et c'est un choix qui a un prix**. L'ajouter rendrait fausses la
  déclaration « aucune donnée collectée » chez Apple, le formulaire Data Safety chez Google et
  `packages/core/src/legal.ts`. Si le besoin devient réel, les trois se corrigent dans le même
  commit, et une mesure sans identifiant persistant reste préférable.
- Contenu santé : ajouter une exclusion explicite pour la grossesse. La validation bloque déjà
  l'âge, mais rien ne l'explique à l'utilisateur.
- Les jetons de couleur et les textes d'explication sont engendrés depuis `packages/core` : les
  modifier dans les fichiers `*.generated.*` est sans effet, ils sont réécrits au prochain
  `bun run generate`.
- Les écarts avec la maquette sont listés en fin de `README.md`. Toute nouvelle divergence doit y
  être notée.
