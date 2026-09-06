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

### 6. Le site est installable et fonctionne hors ligne : fait

`manifest.json` et ses icônes sont engendrés depuis `app.config.ts`, qui déclarait déjà le nom, le
nom court, la couleur de thème et la description sans que rien ne s'en serve. Le document les lie,
`apple-touch-icon` comprise — iOS ignore le manifeste et pose sinon une capture de la page.

Le manifeste seul ne suffisait pas, et c'est mesuré : Chrome ne proposait pas l'installation.
Il exige un service worker, et une application installée qui s'ouvre hors ligne montrerait de
toute façon la page d'erreur du navigateur — absurde pour une application dont tout est calculé
sur l'appareil. `tools/build-sw.ts` l'engendre **après** l'export, parce qu'il doit nommer le
paquet et la feuille de style, dont l'empreinte n'existe qu'à ce moment-là.

Trois choix à connaître avant d'y toucher :

- **Les pages passent par le réseau d'abord.** L'inverse est le piège classique du service worker :
  une version fautive reste servie indéfiniment, sans recours pour l'utilisateur.
- **Le précache est tolérant.** `cache.addAll()` est tout ou rien, et une seule adresse en échec
  vidait l'installation entière sans le moindre bruit — c'est arrivé au premier essai, sur un
  serveur qui ne savait pas rendre `/metabolisme` pour `metabolisme.html`.
- **Le cache est versionné sur l'empreinte du paquet**, et les autres sont supprimés à
  l'activation : jamais deux versions du site en mémoire.

Vérifié dans le navigateur, serveur éteint : `/poids` s'affiche complètement, polices comprises,
sur une route qui n'avait jamais été visitée. La CI garde `sw.js`, sa validité syntaxique, son
enregistrement dans le document, et le fait qu'il précache bien le paquet du build courant.

Ce que cela change au chemin critique : l'application est distribuable **avant** l'ouverture des
comptes développeur. Un lien suffit, et le site s'ajoute à l'écran d'accueil en plein écran.

Ce qui reste : les soixante-deux recettes ne sont pas précachées — deux mégaoctets de HTML pour un
catalogue qu'on ne parcourt pas forcément — elles se mettent en cache à la visite. Et les polices
suivent la même règle, ce qui suffit puisqu'elles sont chargées dès la première page.

### 7. Le poids des polices : fait

L'export embarquait **trente-six** fichiers de police, 7,7 Mo, pour cinq coupes affichées :
`@expo-google-fonts` enregistre la famille entière dès qu'on en importe une. Les paquets sont
passés en dépendances de développement et `tools/build-fonts.ts` prélève ce qui sert.

| | avant | après | depuis « Cadran » |
|---|---|---|---|
| Polices livrées au site | 36 fichiers, 7,7 Mo | 5 fichiers, 126 Ko | 3 fichiers, **43 Ko** |
| Export complet | 17 Mo | 9,7 Mo | — |
| Paquet JavaScript | 2 739 Ko | 2 698 Ko | 2 768 Ko |
| Départ du téléchargement des polices | après exécution du paquet | avec l'analyse du HTML | idem |

Mesuré dans le navigateur : la police des titres part en même temps que le paquet et arrive en
2 ms, soit complète avant la fin du téléchargement du paquet. Les coupes restantes suivent à la
découverte du texte qui les emploie.

La refonte « Cadran » a fait tomber la moitié de ce qui restait : une seule famille porte désormais
les titres, les libellés et les chiffres — la Space Grotesk, dont les chiffres sont à chasse
constante par construction, ce qui était la seule raison d'être de la serif de titre.

**Trouvé en vérifiant** : le texte courant ne portait aucune classe `font-*` et retombait sur la
pile système. Les deux tiers des textes de l'application n'étaient donc pas dans la police du
projet, contrairement aux libellés. Corrigé dans un commit séparé, révocable d'un `git revert` si
l'effet ne convient pas. Le défaut reste possible avec une seule famille en jeu — il est seulement
plus facile à attraper.

Le woff2 est fait, sans la dépendance Python redoutée : `subset-font` embarque harfbuzz en wasm et
s'installe par `bun install`, donc la CI le construit comme le reste. Le sous-ensemble est **relevé
dans les sources** et non deviné — le découpage « latin » de Google Fonts ne contient ni `≈`, ni
`⅓`, ni `⅔`, que l'application affiche. Vérifié dans le navigateur : dix-huit glyphes rares
mesurés, aucun perdu.

## v1.1 : Finitions avant de montrer l'app — fait

Les cinq points sont livrés. Ce qui reste avant publication est administratif, et se trouve
au jalon v1.0 ci-dessus : ouvrir les comptes, mettre le site en ligne, prendre les captures.

### 1. Contraste des textes : fait

Réglé lors de la refonte visuelle : le `faint` de la maquette (`#9e9e9e`, 2,7:1 sur blanc) a été
remplacé par une valeur mesurée, et la palette sombre a été reconstruite sur la même exigence.

La palette « Cadran » a été calculée sur la même règle, et vérifiée avant d'être écrite : minimum
**5,35:1** en clair (`faint` sur `surface2`), **5,41:1** en sombre. Les valeurs mesurées sont dans
l'en-tête de `packages/core/src/tokens.ts`, rôle par rôle. Toute couleur ajoutée doit passer 4,5:1
sur son fond, **dans les deux thèmes** — c'est ce qui a écarté l'indigo tel quel en sombre, où il
tombe sous le seuil sans devenir pastel : la teinte est conservée, c'est la clarté qui monte.

### 2. Groupes d'options : fait

`OptionButton` annonce `radio`, chaque groupe est déclaré `radiogroup`, et le web a sa variante
clavier : flèches, Home et End déplacent la sélection, et un seul membre par groupe est dans
l'ordre de tabulation — le motif du *roving tabindex*.

Deux choses ont été trouvées en vérifiant dans le navigateur plutôt qu'en lisant le code.
`react-native-web` ne traduit pas `accessibilityState.checked` en `aria-checked` pour ce rôle : les
quinze options annonçaient leur libellé sans jamais dire laquelle était choisie. L'attribut est
désormais posé explicitement. Et la tabulation demandait quinze arrêts pour traverser l'écran du
profil ; il en reste quatre, un par groupe.

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

**Livré aussi** : tant que rien n'a été choisi, le thème suit le système. Vérifié dans le
navigateur — sur un système en sombre, le fond sort à `#16120e` sans qu'aucune préférence ne soit
enregistrée ; après une bascule explicite, le choix est retenu et prime au rechargement, même si le
système dit le contraire.

### 4. Intégration continue : fait

`.github/workflows/ci.yml` sur chaque PR : fichiers engendrés, Biome, types, 93 tests, export du
site. Une étape vérifie le HTML produit — titre, canonique, JSON-LD — parce qu'une page vide
passait toutes les autres, ce qui est précisément arrivé au premier export.

### 5. SEO et partage : fait

`robots.txt` et `sitemap.xml` engendrés, balises de titre, description et canonique par route,
JSON-LD `Recipe` sur chaque recette, pré-rendu statique de toutes les routes.

Et soixante-trois images de partage, une par recette plus celle de la marque, dessinées par
`tools/build-og.ts` avec les polices du projet plutôt que celles du système — sans quoi une image
engendrée en intégration continue n'aurait pas la même typographie que la même image engendrée sur
un poste de travail, et l'écart ne se verrait qu'une fois un lien partagé.

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
- **Le cours : fait.** Les seize notions d'`explainers.ts` ont quitté le pied des écrans de
  résultats pour devenir seize routes sous `/comprendre`, pré-rendues, dont le contenu est entier
  **sans profil**. Ce qui a été lu vit sous `vitae.v1.lu`, et trois mécanismes relient les écrans au
  cours : le sommaire du chapitre, l'encart qui propose la notion suivante non lue, et le renvoi
  déclenché par un drapeau du métier. Voir `README.md`, « Le cours ».

  Ce qui reste ouvert, et qui n'est pas urgent : **le mot lié**. La maquette prévoyait qu'un terme
  du texte courant — « métabolisme de base », « NEAT » — ouvre une bulle au toucher et mène à la
  notion au second. Cela suppose une convention de balisage dans des chaînes qui sont aujourd'hui
  du texte pur, donc une reprise de toute la copie de `packages/core`. À faire d'un bloc, ou pas du
  tout : à moitié, la moitié des termes seraient liés et l'autre non, ce qui se lit comme un défaut.
- **L'arrivée variable : faite.** L'application s'ouvre là où quelque chose est à faire — pesée de
  plus d'une semaine, profil modifié, sinon l'assiette du jour. En natif seulement.
- **La navigation à quatre sections : faite.** L'en-tête ne porte plus que la marque ; la barre du
  bas porte quatre intentions au lieu de cinq destinations ; les quatre écrans de résultats
  deviennent un second niveau sous l'en-tête. Le thème est passé sur le profil, en trois choix.
  Voir `README.md`, « La navigation ».

  Ce que cela laisse ouvert : `/reglages` n'est plus atteignable que depuis le profil. C'est
  volontaire — on ne règle les rappels qu'une fois — mais si les retours montrent qu'on les cherche
  ailleurs, le bon geste sera de les remonter sur le profil, pas de rouvrir une commande dans
  l'en-tête.
- **Rappels anti-sédentarité : faits.** Réglables dans `/reglages` (intervalle, et autant de
  **plages horaires** qu'on veut, au pas de la demi-heure), notifications locales, silencieuses,
  absentes du site.

  **Deux écarts avec ce qui était prévu ici.** Le réglage vivait sur l'écran « Bouger », sous la
  phrase qu'il prolonge ; il a déménagé dans les réglages, parce qu'un réglage se cherche là où
  l'on cherche les réglages — « Bouger » garde une carte qui dit son état et y mène. Et la plage
  unique de 9 h à 19 h est devenue une liste de plages : une bande continue sonne pendant le
  déjeuner et le trajet, et un rappel au mauvais moment fait couper *toutes* les notifications de
  l'application. L'ancien réglage est relu et converti. Voir `README.md`.

  Deux suites possibles, aucune urgente :
  - **Restreindre à la semaine** : demande un déclencheur hebdomadaire par jour et par heure, soit
    cinq fois plus de notifications en attente. iOS en plafonne soixante-quatre : il faudrait
    reprogrammer glissant, à l'ouverture de l'application, plutôt que tout poser d'un coup.
  - **Déclencher sur l'inactivité réelle** plutôt qu'à heure fixe : podomètre (`expo-sensors`) ou
    données de santé. Change la nature du produit — permission sensible, déclaration de collecte
    dans les deux fiches, et la promesse « aucune donnée » tombe. À n'ouvrir que si les retours le
    réclament.

## v2 : Local-first, sans backend (≈ 7 j)

Tout ce qui suit tient dans le navigateur et s'appuie sur le module de stockage du v1.1.

- **Suivi de poids dans le temps : fait.** Pesées stockées sous `vitae.v1.suivi`, tendance par
  régression sur quatre semaines, courbe, comparaison au rythme du plan et invitation à recalculer
  au-delà de 4 kg d'écart. Le métier est dans `packages/core/src/suivi.ts`, couvert par 34 tests.

  **Un écart avec ce qui était prévu ici** : la courbe réelle n'est pas superposée à la projection
  théorique. La projection repart du poids d'aujourd'hui à chaque recalcul, elle n'a donc pas
  d'origine commune avec un historique qui remonte le temps ; les deux courbes partageraient un
  cadre en racontant deux échelles différentes. La comparaison se fait en toutes lettres, ce qui
  est de toute façon ce qu'on vient chercher. Voir `README.md`.
- **Export / import du profil et de l'historique en JSON : fait**, et livré dans le même lot,
  comme cette ligne l'exigeait. Fichier versionné, lecture qui juge chaque pesée séparément,
  restauration qui remplace plutôt que de fusionner. Sur le web un vrai fichier dans les deux sens ;
  en natif la feuille de partage pour sortir et un champ à coller pour rentrer — sans ajouter de
  module natif. Vérifié dans le navigateur : export, « Tout effacer », restauration, profil et cinq
  pesées retrouvés.
- **Plusieurs profils en local** : 1 j
  Soi, un proche, ou des clients si l'utilisateur est coach. Sélecteur de profil, chaque profil
  ayant son historique. Sans comptes, la limite à assumer et à afficher : les profils sont liés au
  navigateur, pas à une identité.
- **Catalogue de recettes : fait.**
  Soixante-deux recettes couvrent une journée entière sans aucun lien extérieur, sur les quatre
  objectifs et avec chacun des filtres d'ingrédients — y compris « végétarien et sans œufs », qui
  était le dernier trou. Les propositions renvoyant vers Marmiton ou Femme Actuelle ont disparu de
  l'écran « Ce que je mange ».
  Trois tests gardent cet état : aucune proposition extérieure sur trente-six combinaisons de
  profil, aucun titre qui double un plat du catalogue extérieur, et des valeurs nutritionnelles
  cohérentes entre elles.
  L'index des recettes a sa recherche et ses filtres : texte libre sur le titre, la description et
  les ingrédients, moment de la journée, durée totale, exclusions d'ingrédients — les mêmes que sur
  « Ce que je mange » —, et quatre classements. Tout se fait en mémoire, sans index ni délai.
  Ce qui reste :
  - **Faire relire les valeurs nutritionnelles.** Elles sont estimées à partir des ingrédients, pas
    mesurées. Sur soixante-deux fiches d'une application de santé, un œil de diététicien avant
    publication n'est pas du luxe.
  - **Le catalogue extérieur de 76 plats** ne sert plus qu'aux combinaisons de filtres non testées.
    Le retirer un jour supprimerait toute dépendance à un site tiers ; le garder coûte peu.
  - **Photographier les recettes** : la chaîne est prête et n'attend que les fichiers. Déposer
    `photos/<slug>.jpg` et lancer `bun run generate` suffit — trois largeurs en AVIF et WebP, un
    aperçu flou, le champ `image` du JSON-LD, et le catalogue qui bascule en grille photo une fois
    les soixante-deux réunies. `photos/CHOIX.md` dit ce que chaque photo doit montrer, et
    `photos/README.md` ce que la licence doit permettre. Reste à les prendre ou à les acquérir.
  - **Porter les critères de recherche dans l'adresse**, si un jour on veut partager « les recettes
    végétariennes de moins de 30 minutes ». Aujourd'hui ils vivent dans l'état de l'écran, pour que
    la page livrée aux moteurs contienne bien les soixante-deux recettes.
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
- **Le thème sur le web se jouait en deux moitiés qui divergeaient**, et c'est corrigé. Les
  variables CSS dépendent d'une classe `dark` sur `<html>` que NativeWind ne posait pas tant que la
  préférence valait « système » : la palette JavaScript passait en sombre, les variables restaient
  claires, et tout premier visiteur d'un système en sombre voyait une page mi-claire mi-ambre.
  `src/theme/classeTheme.web.ts` écrit désormais le mode effectif dans le document. Le défaut ne se
  voyait pas en lisant le code — il est apparu en ajoutant une courbe qui sortait en ambre sur fond
  clair. La vérification du jalon v1.1 avait mesuré le fond du `<body>`, posé par `+html.tsx`, et
  l'avait pris pour le thème.
- Le pré-rendu du site est fragile par nature : tout composant qui refuse de rendre hors navigateur
  produit une page vide sans faire échouer le build. La CI garde une vérification sur le HTML
  produit ; l'étendre à chaque nouvelle route indexable.
- **L'hydratation échoue sur toutes les pages du site** (React #418), et ce depuis avant les
  derniers jalons — vérifié en rebuildant la version de référence. Deux causes indépendantes, et
  c'est la même : le premier rendu du navigateur s'appuie sur ce que le pré-rendu ne peut pas
  savoir.
  - **Le thème.** Le pré-rendu suppose le clair et livre l'icône lune ; sur un système en sombre le
    navigateur rend l'icône soleil dès le premier rendu.
  - **La largeur.** `useWindowDimensions()` vaut 0 sous Node : le HTML livré n'a donc pas de
    `<nav>`, que le navigateur rend au-delà de `NAV_BREAKPOINT`. Même mécanisme pour `useLarge` et
    `useColumns`.

  Conséquence, **et elle dépend de la largeur** — la première rédaction de cette entrée ne le disait
  pas, et se trompait donc sur le cas qui compte le plus :

  - **Au-dessus de `NAV_BREAKPOINT`**, l'écart est franc : React jette l'arbre servi et refait tout
    côté client. Le référencement n'en souffre pas — les moteurs lisent le HTML livré, la CI le
    vérifie — mais la peinture pré-rendue est perdue, ce qui est précisément ce que le pré-rendu
    devait éviter.
  - **En dessous**, c'est-à-dire sur téléphone, l'arbre servi correspond et l'hydratation
    **réussit**. React 18 ne répare alors pas les attributs divergents : les couleurs que
    `usePalette` a cuites dans le HTML restent celles du pré-rendu. Mesuré sur l'export, préférence
    enregistrée « sombre » : le disque du cadran d'accueil sort en `#e7e6f0` à 390 et 430 px, en
    `#1c1b2a` à 700 px et au-delà. La page était donc à moitié sombre — fonds et textes par le CSS,
    tracés SVG et icônes restés clairs — de façon durable, pas le temps d'une peinture.

  Le remède tient en un point de passage : un `useHydrate()` qui rend `false` au premier rendu web
  et `true` ensuite (toujours `true` en natif), dont dépendraient le thème et les trois mesures de
  largeur.

  **La moitié thème est appliquée** (`apps/app/src/theme/hydrate.web.ts`) : elle ne coûte rien, la
  classe CSS étant déjà posée dans un effet, donc après le premier rendu. Aligner `usePalette`
  dessus ne fait que remettre les deux moitiés du thème d'accord.

  **La moitié largeur reste à arbitrer, et le prix est visible** : sur un écran large, une peinture
  en mise en page mobile avant bascule. Le mouvement compte autant que la vitesse dans ce projet.
- `react-native-web` sait rendre un balisage sémantique, mais seulement là où un rôle le demande —
  et il échoue en silence : la page reste identique à l'œil. Un `Pressable` qui appelle le routeur
  sort en `<div>` au lieu de `<a>`, un `accessibilityRole="header"` sans `aria-level` sort en
  `<h1>` quel que soit son rang. Voir « Le balisage n'est pas donné, il se demande » dans
  `README.md` ; la CI garde la structure du fichier produit.
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
