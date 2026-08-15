# Calculateur de métabolisme de base

Application universelle : **iOS, Android et web, depuis une seule base de code Expo**. Elle calcule
le métabolisme de base (MB), la dépense énergétique totale (DET), l'IMC, une fourchette d'apport
calorique selon l'objectif (sèche, recomposition, prise de masse, maintien), une répartition des
macronutriments, un poids cible avec projection dans le temps, un programme d'entraînement au poids
du corps, et un catalogue de recettes.

Langue de l'interface : français. Deux modes de saisie : guidé en quatre étapes et formulaire
complet, permutables à tout moment.

**Aucun compte, aucun serveur, aucune base de données.** Le profil vit sur l'appareil — MMKV en
natif, `localStorage` sur le web — et tous les calculs sont locaux. C'est cette contrainte qui rend
la navigation instantanée : il n'y a jamais rien à attendre.

Ce fichier sert deux usages. La première moitié est la **référence du métier** : formules, tables
de valeurs, copies françaises, jetons de design. Elle fait autorité et n'a pas changé avec le
portage. La seconde décrit **l'architecture** telle qu'elle est aujourd'hui.

## Formules de calcul (le cœur métier)

### Métabolisme de base : Mifflin-St Jeor

```
Homme : MB = 10 × poids(kg) + 6,25 × taille(cm) − 5 × âge + 5
Femme : MB = 10 × poids(kg) + 6,25 × taille(cm) − 5 × âge − 161
```

### Dépense énergétique totale

`DET = MB × facteur d'activité`, avec `facteur = base du quotidien + apport des séances`.

L'activité est saisie sur **deux axes**, parce qu'ils ne varient pas ensemble : on peut marcher
une heure par jour pour aller travailler sans faire de sport, ou s'entraîner cinq fois par semaine
et rester assis le reste du temps. Le NEAT est d'ailleurs la source de variation la plus large
entre deux personnes de même gabarit.

`DAILY`, mouvement du quotidien, sport exclu :

| Index | Libellé UI | Description UI | Base |
|---|---|---|---|
| 0 | Assis toute la journée | Bureau, trajets en voiture ou assis, peu de marche | 1.20 |
| 1 | Assis, mais je marche | Trajets à pied ou à vélo, courses, escaliers | 1.30 |
| 2 | Debout ou en mouvement | Commerce, enseignement, soin, service : rarement assis | 1.45 |
| 3 | Travail physique | Manutention, bâtiment, agriculture, livraison | 1.60 |

`SESSIONS`, entraînement, en plus du quotidien :

| Index | Libellé UI | Description UI | Apport | Séances/sem. |
|---|---|---|---|---|
| 0 | Jamais | Aucune séance dédiée | +0 | 0 |
| 1 | 1 à 2 séances | Environ une heure en tout | +0.05 | 1.5 |
| 2 | 3 à 4 séances | Trois à quatre heures par semaine | +0.12 | 3.5 |
| 3 | 5 à 6 séances | Presque tous les jours | +0.19 | 5.5 |
| 4 | 7 ou plus | Tous les jours, ou deux fois par jour | +0.26 | 7 |

Les apports sont volontairement plus bas que ceux des tables classiques (qui surestiment) : une
séance d'une heure dépense 300 à 400 kcal, soit 150 à 200 kcal par jour une fois lissée sur la
semaine pour trois ou quatre séances, soit de l'ordre de +0,10 sur le facteur, pas +0,35.

Facteur résultant : **1,20 à 1,86**. Valeur par défaut : `daily` 1, `sessions` 1 (×1,35).

`activityLevel(daily, sessions)` ramène les deux axes à un niveau global 0..4 (bandes de facteur
< 1,28 · < 1,40 · < 1,55 · < 1,70 · au-delà), pour les contenus qui dépendent de la dépense totale
et non d'un axe en particulier : répartition assiette / mouvement, ton des conseils.

### Objectifs, fourchettes et protéines

| clé | Libellé | Description UI | min × DET | max × DET | recommandé × DET | protéines g/kg |
|---|---|---|---|---|---|---|
| `seche` | Sèche | Déficit de 10 à 25 % | 0.75 | 0.90 | 0.82 | 2.0 |
| `recomp` | Recomposition corporelle | De −5 % à +5 % | 0.95 | 1.05 | 1.00 | 1.8 |
| `masse` | Prise de masse | Surplus de 5 à 15 % | 1.05 | 1.15 | 1.10 | 1.8 |
| `maintien` | Maintien | Aucun écart | 0.97 | 1.03 | 1.00 | 1.4 |

Objectif par défaut : `seche`.

**Garde-fous obligatoires** (bug corrigé pendant la conception, à ne pas réintroduire) :

```
safeMin = max(DET × goal.min, min(MB, DET))     // jamais sous le MB
safeMax = DET × goal.max
recommandé = clamp(DET × goal.rec, safeMin, safeMax)   // le recommandé RESTE dans [min, max]
```

Indicateurs dérivés :
- `clamped` : vrai si `DET × goal.min < MB` et objectif `seche`
- `raised` : vrai si `DET × goal.rec < safeMin`
- `belowFloor` : vrai si `DET × goal.min` < plancher (1500 kcal homme, 1200 kcal femme)

Un encart d'avertissement (fond `--warn-bg`) s'affiche si `clamped || raised || belowFloor`. Textes exacts dans la section « Copies ».

### Macronutriments

```
protéines(g) = poids × goal.prot
lipides(g)   = (recommandé × 0,28) / 9
glucides(g)  = max(0, (recommandé − protéines×4 − lipides×9) / 4)
```
Pourcentage de chaque barre = kcal du macro / recommandé. Couleurs : protéines `--primary` (ou prop `primaryColor`), lipides `#f9a825`, glucides `#00897b`.

### IMC

```
IMC = poids / (taille_m)²
poids santé = 18,5 × (taille_m)²  →  24,9 × (taille_m)²   (arrondis à l'entier)
```

Bandes (libellé + couleur) :

| IMC < | Libellé | Couleur |
|---|---|---|
| 18.5 | Insuffisance pondérale | `#0288d1` |
| 25 | Corpulence normale | `#2e7d32` |
| 30 | Surpoids | `#f9a825` |
| 35 | Obésité modérée | `#ef6c00` |
| 40 | Obésité sévère | `#d84315` |
| ∞ | Obésité massive | `#b71c1c` |

**Jauge IMC** : 4 segments égaux de 25 % affichés (`< 18,5` / `18,5 – 25` / `25 – 30` / `> 30`). Le curseur doit être positionné **par morceaux**, sinon il tombe dans la mauvaise bande (bug corrigé) :

```js
const seg = [[15,18.5],[18.5,25],[25,30],[30,40]];
// index i de la bande contenant l'IMC :
position% = i*25 + clamp((imc - lo)/(hi - lo), 0, 1) * 25   // puis clamp 2..98
```

### Poids cible

Trois propositions, dépendantes de l'IMC (arrondies à 0,1 kg) :

- IMC ≥ 25 : `healthy` « Haut du poids santé » / « IMC 25 » = 24,9×m² ; `mid` « Milieu du poids santé » / « IMC 22 » = 22×m² ; `step` « Première étape » / « −5 % de poids » = poids×0,95
- IMC < 18,5 : `healthy` « Bas du poids santé » / « IMC 18,5 » = 18,6×m² ; `mid` idem 22×m² ; `step` « +5 % de poids » = poids×1,05
- sinon : `cut` « Sèche légère » / « −5 % de poids » ; `stable` « Poids stable » / « recomposition » = poids ; `gain` « Prise de masse » / « +5 % de poids »

Sélection par défaut : IMC ≥ 25 → `step` si objectif `masse`, sinon `healthy` ; IMC < 18,5 → `step` si objectif `seche`, sinon `healthy` ; IMC normal → `gain` / `cut` / `stable` selon l'objectif. Le choix manuel est réinitialisé quand l'objectif change.

### Projection

```
rythme (kg/semaine) = (recommandé − DET) × 7 / 7700
écart = poidsCible − poids
projection valide si |rythme| ≥ 0,03 et |écart| > 0,2 et signe(écart) == signe(rythme)
semaines = ceil(|écart / rythme|)
mois = semaines / 4,345
date d'atteinte = aujourd'hui + semaines×7  →  format fr-FR { month: 'long', year: 'numeric' }
```

Courbe : horizon = `clamp(semaines, 4, 78)`, un point par semaine, `poids(t) = poids + rythme × t` borné au poids cible. Échelle Y = [min(poids, cible) − 1,5 ; max(...) + 1,5]. Repères X toutes les 2 / 4 / 8 / 13 semaines selon l'horizon (> 12 → 4, > 26 → 8, > 52 → 13).

Les libellés d'axe sont des `<text>` à l'intérieur du SVG. La maquette devait les positionner en HTML sous le graphique, faute de pouvoir les y mettre ; la contrainte n'existe plus, et `react-native-svg` les rend de la même façon sur les trois plateformes.

### Répartition de l'écart (mouvement / alimentation)

Part de l'écart attribuée au mouvement selon le niveau d'activité : `[0.45, 0.35, 0.25, 0.15, 0.10]`.

```
écart = DET − recommandé
kcal par le mouvement = |écart| × part
kcal en moins dans l'assiette = |écart| × (1 − part)
```

### Recettes proposées

La page « Ce que je mange » ne fabrique plus de menu au gramme près : elle propose des plats à
cuisiner. Une liste de portions pesées se lit bien mais ne se cuisine pas.

Le catalogue (`packages/core/src/recipes.ts`) tient en dur : l'app ne parle à aucun serveur et n'a pas de clé
d'API. Chaque entrée porte un plat, ses kcal et protéines **pour une portion courante**, son
`slot` (`matin` ou `plat`), sa `base` (ingrédient dominant, pour la variété) et ce qu'elle
`contient` (pour les filtres). L'URL est **une recherche** sur Marmiton ou Femme Actuelle, pas une
recette précise.

Pourquoi une recherche plutôt qu'une URL de recette : Marmiton publie bien des valeurs
nutritionnelles en JSON-LD, mais elles sont calculées automatiquement, absentes sur une partie des
recettes et parfois très fausses — 19 g de protéines pour 427 g de poulet rôti, 6 g pour un curry
de poulet. Caler un budget calorique là-dessus donnerait de mauvais conseils. Les deux URL de
recherche répondent et ne sont pas interdites par leur `robots.txt` (seules les variantes paginées
le sont chez Marmiton).

Pour ajouter un plat : une ligne dans `CATALOGUE`, avec des ordres de grandeur plausibles pour une
portion. L'URL et les ingrédients implicites (viande, poisson, œufs, laitier selon la `base`) sont
dérivés automatiquement.

Sélection, dans `buildRecipeSuggestions()` :

| Étape | Règle |
|---|---|
| Budget du repas | 25 % de l'apport visé au petit-déjeuner, 35 % au déjeuner, 30 % au dîner ; les 10 % restants sont la collation |
| Filtres | `excluded` écarte les plats concernés ; « Végétarien » couvre aussi le poisson. Enregistré dans le profil |
| Tri | densité protéique (`prot / kcal`) en sèche et recomposition, kcal par portion en prise de masse, proximité au budget en maintien |
| Vivier | en déficit, tout ce qui tient 7 g de protéines pour 100 kcal ; sinon la moitié haute du classement. Jamais moins de 8 plats, quitte à descendre en qualité — un repas sans proposition serait pire |
| Tirage | aléatoire dans le vivier, graine dérivée du profil : reproductible d'un rendu à l'autre, sinon le serveur et le client afficheraient deux plats différents |
| Variété | deux plats par repas, jamais la même base dans un repas ; les bases sont suivies séparément pour le matin et pour les plats |
| « Changer » | `offsets[slotKey]` avance d'un cran dans l'ordre tiré, pour ce créneau seul. Vit dans l'état du composant, pas dans le profil : c'est le geste d'une visite |
| Portions | `budget / kcal` arrondi au demi, plafonné à 2 : au-delà, le manque est annoncé plutôt que couvert par une portion démesurée |

Le titre est un lien `target="_blank" rel="noopener noreferrer"`, pas la carte entière : « changer »
est un bouton, et un bouton dans un lien est du HTML invalide. La zone cliquable du titre est
étendue à la carte par un `::after`, pour garder une cible confortable au doigt.

Le mouvement est traité sur deux registres distincts, jamais additionnés dans une même liste.

**1. Le NEAT** (`packages/core/src/neat.ts`, catalogue `NEAT_ACTIONS`) : des gestes du quotidien, répétables
tous les jours, sans récupération. Indexés sur le seul axe `daily` : le nombre de séances n'y change
rien. kcal ≈ `MET × poids × minutes / 60`, arrondi au multiple de 5.

| Libellé | MET | min | crans `daily` |
|---|---|---|---|
| Marcher 30 min de plus dans la journée | 4.3 | 30 | 0, 1, 2 |
| Se lever 3 min par heure | 2 | 24 | 0, 1 |
| Prendre les escaliers, 10 min cumulées | 8 | 10 | 0, 1, 2 |
| Passer les appels debout ou en marchant | 2.5 | 30 | 0, 1 |
| Faire les trajets courts à vélo | 6.8 | 20 | 0, 1, 2 |
| Ménage, courses, jardinage | 3.5 | 30 | 0, 1, 2, 3 |
| Une marche de 15 min après le repas | 3.5 | 15 | 1, 2, 3 |

Conseils NEAT par cran de mouvement quotidien : voir `NEAT_TIPS`, textes à reprendre verbatim.

`movementSplit()` départage les deux dépenses : le NEAT vaut `MB × (base − 1)`, les séances valent
`MB × add`, chacun sur son axe de saisie. La somme redonne `DET − MB`.

**2. Les séances** (`packages/core/src/training.ts`) : un stimulus, pas un moyen de dépenser. Le programme
n'est pas un texte fixe : `buildSetup()` calcule séries, répétitions, repos et variantes à partir du
profil, puis `explainSetup()` produit la liste des adaptations affichées à l'utilisateur, construite
sur les valeurs finales.

| Entrée du profil | Effet sur les séances |
|---|---|
| Objectif | fourchette de répétitions (masse 8–12, sèche 12–15, recomp 10–14, maintien 10–15), repos de base (90 / 60 / 75 s), 4 séries en masse |
| Âge ≥ 40 | +15 s de repos, échauffement allongé à 6–8 min |
| Âge ≥ 55 | +30 s de repos, plancher à 10 répétitions, échauffement 8–10 min, semaine allégée périodique |
| Âge ≥ 60 | bloc équilibre en fin de séance, sauts remplacés par du tempo lent, chaise murale → lever de chaise |
| Âge ≥ 65 | +45 s de repos, semaine plafonnée à 3 séances |
| IMC ≥ 30 | répétitions × 0,7, aucune progression par saut, cardio sans impact |
| IMC < 18,5 | aucun cardio ajouté |
| Sexe femme | poussées démarrées mains surélevées ; après 50 ans, charge maintenue sur hanches et jambes (densité osseuse) |
| Sexe homme ≥ 45 | plancher de deux séances justifié par la perte de masse musculaire |
| Déficit ≥ 15 % | +15 s de repos, volume contenu |
| Poids | dépense estimée de chaque séance (`MET × poids × durée`, repos comptés à 2 MET) |


## Ce qui n'est plus ici

Trois sections décrivaient le prototype d'origine : le détail des écrans au pixel près, un modèle
d'état à trois vues (`screen: "home" | "input" | "result"`), et une palette Material bleue en
Roboto avec ses ombres. Rien de tout cela n'a survécu au portage — l'application a des routes et
non un état d'écran, et sa palette est crème et bleu profond, sans ombre, en Fraunces et Inter.

Ce qui les remplace, et qui fait autorité :

- **les jetons** — couleurs, typographie, rayons, durées : `packages/core/src/tokens.ts` ;
- **le système visuel et le mouvement** : la section « Architecture » ci-dessous ;
- **les écrans** : `apps/app/app/`, une route par fichier ;
- **l'état** : `packages/core/src/state.ts` pour la saisie, `ProfileProvider` pour le profil.

Les formules ci-dessus, elles, n'ont pas bougé et restent la référence du métier.

---

## Architecture

Un dépôt, quatre paquets, deux cibles de livraison.

```
apps/app/            application Expo — iOS, Android, et le site par export statique
packages/core/       métier pur : calculs, plan, entraînement, recettes, persistance, textes
packages/content/    62 recettes en Markdown, compilées en module TypeScript, et leur recherche
tools/               scripts de génération (jetons, icônes, polices, sitemap, manifeste, service worker)
store/               fiches App Store et Play Store, conformité
```

### Pourquoi une seule base de code

Le site était auparavant une application Next.js distincte. Deux interfaces pour un même produit,
c'est deux fois la charge de maintenance et une divergence garantie à moyen terme. Expo Router sait
rendre les mêmes écrans en natif et les exporter en HTML statique : le site est désormais un mode
de livraison de l'application, pas un projet parallèle.

Ce que le changement coûte, et qu'il faut assumer : le paquet JavaScript est plus lourd qu'un
rendu serveur React. Ce qu'il rapporte : un seul écran à écrire, un seul jeu de textes, un seul
thème.

Ce qui a été préservé de l'ancien site, parce que l'acquisition en dépend : chaque route est
**pré-rendue en HTML** à la compilation, une page par recette comprise. Titres, descriptions,
canoniques et données structurées `Recipe` sont dans le fichier livré, lisibles sans exécuter une
ligne de JavaScript. La CI le vérifie sur le fichier produit, pas sur l'intention.

### Le balisage n'est pas donné, il se demande

`react-native-web` rend bien un balisage sémantique — `<main>`, `<nav>`, `<header>`, `<ul>`, `<a>`,
`<h1>` à `<h6>` — mais seulement quand un rôle le lui demande. Par défaut il rend des `<div>`, et
c'est un défaut silencieux : rien n'échoue, la page est identique à l'œil, et le HTML livré n'a
plus de structure. Trois pièges se sont refermés avant d'être vus.

- **Un `Pressable` qui appelle le routeur est un `<div>`.** L'accueil du site est sorti sans un
  seul `<a>` : ni clic milieu, ni adresse à copier, ni chemin qu'un moteur puisse suivre vers le
  reste du site. La navigation passe donc par `<Link asChild>` autour d'un `Pressable`
  `accessibilityRole="link"`, ou par la propriété `href` de `Button`, qui pose l'enveloppe
  elle-même.
- **`accessibilityRole="header"` rend un `<h1>`, toujours.** Sans `aria-level`, une page de recette
  sortait avec deux niveaux 1 et aucun niveau 2. Les titres passent par `Titre`, qui exige son
  rang, et par `Overline niveau={2}` pour les cartes dont le surtitre est bien le titre.
- **Le contenu principal doit se déclarer.** `Page` porte `role="main"`, l'en-tête `role="banner"`,
  les onglets du haut `role="navigation"`, le catalogue `role="list"`.

La CI vérifie tout cela sur le fichier produit — un `<h1>` et un seul par page, un `<main>`, un
lien sortant sur l'accueil, une liste dans le catalogue.

### Les polices, et pourquoi elles ne se chargent pas de la même façon

`@expo-google-fonts` enregistre la famille **entière** dès qu'on importe une seule coupe : trente-six
fichiers et 7,7 Mo partaient dans l'export du site pour les cinq coupes affichées. Les paquets sont
donc passés en dépendances de développement à la racine — plus rien ne les importe — et
`tools/build-fonts.ts` prélève les cinq fichiers utiles vers deux destinations, parce que les deux
plateformes ne chargent pas une police de la même façon :

| | Où | Comment |
|---|---|---|
| Natif | `assets/polices/` | `expo-font`, au démarrage, le splash tenant l'écran pendant ce temps |
| Web | `public/polices/` | `@font-face` dans le document, plus un préchargement pour la coupe des titres |

La différence est loin d'être cosmétique. Chargées par `expo-font` comme en natif, les polices
n'étaient demandées qu'une fois les 2,7 Mo de JavaScript téléchargés **et exécutés**. Déclarées dans
le document, elles partent avec l'analyse du HTML : mesuré dans le navigateur, la Fraunces des
titres est arrivée en 2 ms, complète avant même la fin du téléchargement du paquet.

Une seule coupe est préchargée, celle des titres — 71 Ko, et c'est le plus grand texte de l'écran.
Précharger une coupe qui ne s'affiche pas la ferait télécharger pour rien, et les Inter pèsent
335 Ko chacune.

**À savoir avant de toucher aux polices** : le texte courant de l'application ne porte aucune classe
`font-*`, il retombe donc sur la pile système du navigateur. Seules les coupes nommées
explicitement — medium, semibold, bold, et la Fraunces — s'affichent vraiment. `Inter_400Regular`
est déclarée mais n'est employée nulle part. Ce n'est pas une décision écrite quelque part, c'est un
oubli que la vérification en navigateur a mis au jour.

Le nom des cinq coupes est écrit à quatre endroits qu'aucun contrôle ne rapproche : `tools/polices.ts`
(les scripts), `apps/app/tailwind.config.js` (une famille par graisse), `src/lib/polices.ts` (le
chargement natif) et `+html.tsx` (les `@font-face`). Une divergence fait retomber l'interface sur la
police système, sans erreur.

### Le site s'installe, et fonctionne hors ligne

C'est le cas type : aucun compte, aucune requête, tout est calculé sur l'appareil et les recettes
sont dans le paquet. Une application qui n'a rien à charger n'a aucune raison de rester un onglet,
ni de montrer une page d'erreur quand le réseau manque.

Deux fichiers engendrés y suffisent, et aucun ne s'écrit à la main :

- **`manifest.json`** (`tools/build-seo.ts`) reprend le nom, le nom court, la couleur de thème et
  la description d'`app.config.ts`, qui les déclarait déjà pour le natif. Ses icônes viennent de
  `tools/build-icons.ts`, dont une *maskable* dessinée plus petite dans son carré — Android rogne
  jusqu'à la forme du thème du téléphone, et la flamme en sortait amputée.
- **`sw.js`** (`tools/build-sw.ts`) est écrit **après** l'export, seul moment où le nom empreinté du
  paquet et de la feuille de style est connu. Le manifeste seul ne suffisait pas : Chrome ne
  proposait pas l'installation tant qu'il n'y avait pas de service worker.

Trois règles, et se tromper sur l'une se paie cher :

| | Pourquoi |
|---|---|
| Les pages : **réseau d'abord**, cache en secours | Le cache d'abord est le piège du service worker : une version fautive reste servie indéfiniment, sans recours |
| Les ressources empreintées : **cache d'abord** | Leur nom change à chaque build ; une réponse en cache ne peut pas être périmée, seulement absente |
| Le précache est **tolérant** | `cache.addAll()` est tout ou rien : une seule adresse en échec vidait l'installation entière, en silence |

Le cache est versionné sur l'empreinte du paquet et les autres sont supprimés à l'activation : il
n'y a jamais deux versions du site en mémoire.

### Métier partagé (`packages/core`)

| Module | Rôle |
|---|---|
| `calc.ts` | Mifflin-St Jeor, DET, fourchettes, IMC, macros, poids cible, projection, répartition assiette / mouvement |
| `constants.ts` | données de référence et libellés en langage courant |
| `training.ts` | séances de renforcement, adaptées à l'âge, au sexe, au poids, au métabolisme et à l'objectif |
| `neat.ts` | mouvement du quotidien (NEAT), tenu à part des séances |
| `recipes.ts` | suggestions par repas : recettes de l'application d'abord, plats extérieurs ensuite |
| `nutrition.ts` | conseils alimentaires selon l'objectif |
| `quantites.ts` | mise à l'échelle des quantités d'une recette |
| `rappels.ts` | rappels anti-sédentarité : créneaux, messages, réglage persisté |
| `state.ts` | état du formulaire de saisie et validation |
| `storage.ts` | profil versionné (`vitae.v1.profile`), support de stockage **injecté** |
| `format.ts` | formats français (espace insécable, virgule décimale, `−` U+2212) |
| `date.ts` | âge calculé depuis la date de naissance, fraîcheur du poids (7 jours) |
| `tokens.ts` | palette claire et sombre, échelle typographique, rayons |
| `icons.ts` | le nom des icônes, pas leur tracé |
| `nav.ts` | plan de navigation, partagé par la barre d'onglets |
| `explainers.ts` | les textes d'explication des quatre écrans de résultats |
| `legal.ts` | politique de confidentialité |

Rien ici n'importe React, ni `react-native`, ni `node:fs`. C'est ce qui permet aux 93 tests de
tourner sous `bun test` sans environnement de rendu.

Trois choix méritent d'être connus avant de toucher au code :

- **`storage.ts` ne connaît aucun support.** Il expose un contrat synchrone et l'application lui
  injecte MMKV ou `localStorage` au démarrage. Sans cela, il faudrait une branche de plateforme
  dans un module qui doit rester pur.
- **Le nom des icônes est du métier.** `constants.ts` et `nav.ts` désignent une icône par option
  d'activité et par écran ; le tracé, lui, vit dans l'interface. `Record<IconName, ReactNode>` fait
  échouer la compilation si le jeu dessiné et le jeu désigné divergent.
- **Les textes d'explication et les jetons de couleur sont des données.** Ils étaient du JSX et du
  CSS recopiés ; ils sont désormais engendrés (`tools/build-tokens.ts`) ou lus directement.

### Application (`apps/app`)

Expo SDK 57, React Native 0.87, expo-router en routes typées, NativeWind 4, `react-native-svg`,
MMKV, Reanimated.

```
app/
  _layout.tsx           polices, thème, profil, pile de navigation
  +html.tsx             le document HTML — web uniquement, rendu à la compilation
  index.tsx             redirection : les chiffres si un profil existe, la présentation sinon
  accueil.tsx           présentation
  confidentialite.tsx   politique de confidentialité
  (tabs)/               les cinq onglets, tirés de `MOBILE_PAGES`
  recettes/            index et détail, `generateStaticParams` pour le pré-rendu
src/
  components/
    layout/             ce qui encadre un écran : en-tête, onglets, cadre, balises de tête
    screens/            le contenu d'un écran, découpé en cartes
    recette/            l'atelier de cuisine et les filtres du catalogue
    ui/                 le système visuel : Hero, Chiffre, Card, Repliable, icônes…
  state/                le profil, point de passage unique vers les données persistées
  theme/                palette, mouvement, bascule clair / sombre
  lib/                  les adaptateurs de plateforme, et eux seuls
    store.ts            MMKV — et `store.web.ts`, que Metro choisit sur le web
    rappels.ts          notifications locales — et `rappels.web.ts`, qui ne fait rien
    route.ts            le seul endroit où une adresse du métier devient une route typée
    polices.ts          `expo-font` — et `polices.web.ts`, les `@font-face` faisant le travail
```

`lib/` ne contient que ce qui dépend de la plateforme, et c'est une règle : quand un fichier y
atterrit sans avoir de variante `.web`, c'est qu'il appartient au métier ou à un composant.

### Les rappels anti-sédentarité

L'écran « Bouger » explique que se lever quelques minutes par heure est le geste qui casse le mieux
la sédentarité. Le réglage est posé juste sous cette phrase, et non dans un écran de préférences :
c'en est la suite immédiate.

Le partage des rôles est le même que partout ailleurs. `packages/core/src/rappels.ts` calcule
*quand* et *quoi*, en fonctions pures couvertes par quinze tests — c'est là que sont les cas
tordus : bornes incluses, plage inversée, plafond de soixante-quatre notifications en attente
qu'impose iOS. `apps/app/src/lib/rappels.ts` se contente de le dire au système.

Trois décisions à connaître avant d'y toucher :

- **Notifications locales, jamais poussées.** Programmées sur l'appareil, sans jeton d'envoi et
  sans serveur. C'est ce qui permet de garder « aucune donnée collectée » chez Apple comme chez
  Google. Passer aux notifications distantes exigerait un identifiant d'appareil, donc une
  déclaration de collecte dans les deux fiches.
- **À heure fixe, pas sur une inactivité constatée.** Détecter l'immobilité demanderait le
  podomètre ou les données de santé — une permission sensible, pour un gain discutable.
- **Silencieux, sans vibration.** `VIBRATE` est refusée exprès dans `app.config.ts` : quatorze
  vibrations par jour font désinstaller l'application le jour même.

### D'où vient la navigation instantanée

Ce n'est pas un réglage mais une conséquence, et chaque point compte :

1. **Rien n'est chargé.** Le profil est en mémoire, les calculs sont des fonctions pures mémoïsées
   dans `ProfileProvider`, les recettes sont compilées dans le paquet. Aucun écran n'a d'état de
   chargement, parce qu'aucun écran n'a rien à attendre.
2. **MMKV lit de façon synchrone.** Le profil est disponible dès l'initialisation de l'état, donc
   l'application s'ouvre sur les chiffres et non sur un écran vide qui se remplit après coup.
   `AsyncStorage` aurait imposé un rendu vide à chaque démarrage.
3. **Les écrans restent montés.** Les onglets ne sont jamais démontés, seulement gelés hors écran
   (`enableFreeze`, `freezeOnBlur`) : y revenir n'est qu'un changement de visibilité, et le
   défilement est retrouvé là où on l'avait laissé.
4. **Les transitions sont natives.** `react-native-screens` les rend au niveau du système : elles
   ne passent pas par le fil JavaScript et restent fluides même pendant un recalcul.
5. **Les polices sont attendues avant le premier rendu**, en natif seulement. Le splash tient
   l'écran pendant ce temps : pas d'écran blanc, et pas de saut de police — un défaut que l'œil lit
   comme de la lenteur alors que tout est déjà là.

### Le système visuel

Ce qui rend un écran de cette application reconnaissable tient en quatre éléments, et ce sont des
composants plutôt que des conventions — une convention se perd au troisième écran.

| | Rôle |
|---|---|
| `Hero` | la réponse de l'écran : dégradé plein, surtitre, grand chiffre. **Une par écran, jamais deux** — c'est elle qui dit ce qui est la réponse et ce qui est le détail |
| `Chiffre` | le grand nombre. Fraunces, chasse fixe, unité en Inter plus petite. Quatre tailles, de la réponse principale à la tuile |
| `Card` | bordure fine, fond plein, **jamais d'ombre**. C'est ce qui donne l'air de papier plutôt que d'interface |
| `Overline` | le surtitre 11 px en majuscules espacées, en tête de chaque carte. `niveau` en fait un vrai titre de document |
| `Titre` | un titre et son rang. Le rang est obligatoire : sans lui, le web rendrait un `<h1>` de plus |

Le grand chiffre est l'élément signature, et ce n'est pas arbitraire : c'est une application de
chiffres. Le traitement était réécrit dans huit fichiers avec des tailles et des interlignes qui
divergeaient ; `Chiffre` les remet d'aplomb et impose la chasse fixe, sans laquelle un nombre qui se
met à jour fait sautiller toute la ligne.

### Le mouvement

Les durées vivent dans `@vitae/core/tokens` (`MOTION`), avec les couleurs. Une échelle plutôt que
des valeurs au cas par cas : c'est ce qui fait qu'une application paraît réglée plutôt qu'animée.

Quatre mouvements, et un seul porte du sens :

- **Le compteur.** Quand un chiffre change parce que le profil a changé, il monte jusqu'à sa
  nouvelle valeur. C'est la seule animation qui dit quelque chose : que le calcul vient d'être
  refait pour vous. Affiché sec, le même nombre passe inaperçu.
- **La cascade d'arrivée** (`Apparition`) : les cartes se posent de haut en bas, décalées de 60 ms.
  Sur un écran qui en empile huit, cela donne un ordre de lecture qu'une arrivée simultanée ne
  donne pas. Le décalage est plafonné, sinon le rythme devient de l'attente.
- **Le repli** : la carte anime sa hauteur, le chevron pivote d'un demi-tour.
- **Les transitions d'écran**, rendues par le système et non par le fil JavaScript.

Trois pièges rencontrés, et qui se reproduiront :

- **`entering` de Reanimated sort l'élément du flux sur le web** : les blocs suivants remontent et
  se superposent au titre. Les arrivées n'animent donc que l'opacité et une translation, deux
  propriétés qui ne touchent jamais à la mise en page.
- **NativeWind ignore `className` sur un `Animated.View`** non enregistré — une carte animée perd
  sa bordure et son fond, sans la moindre erreur. D'où `VueAnimee`, enregistrée une fois.
- **`useMotionReduite` n'est pas une préférence esthétique.** Les animations d'entrée déclenchent
  des vertiges chez les personnes sensibles, et les trois systèmes exposent un réglage. Quand il est
  actif, on **supprime** le mouvement, on ne le ralentit pas : un fondu lent reste un mouvement.

### Deux façons de replier, et quand employer laquelle

Les écrans portent beaucoup de matière — c'est voulu, on y apprend des choses — mais tout déplier
d'un bloc revient à ne rien donner à lire. Deux composants s'en chargent, et ils ne sont pas
interchangeables :

- `Explainer` déplie **une** question à la fois, numérotée, sous un fil qui annonce l'ordre. C'est
  une lecture suivie : on va de la première à la dernière.
- `Repliable` est une carte qui se plie, plusieurs pouvant être ouvertes ensemble. C'est de la
  consultation : on compare deux séances, on ouvre celle du jour. Son résumé — « Haut du corps ·
  40 min · 5 exercices » — doit suffire à décider sans ouvrir ; une carte dont le résumé n'apprend
  rien n'a pas à être repliée.

Dans les deux cas le contenu fermé reste dans le document (`display: 'none'`, jamais un rendu
conditionnel) : c'est lui qui donne à lire quelque chose à un moteur de recherche sur des pages dont
les chiffres dépendent de l'appareil.

### La seule concession de plateforme

Le moment de la lecture du stockage, et rien d'autre. En natif, MMKV lit tout de suite. Sur le web,
les pages sont pré-rendues par Node, où `localStorage` n'existe pas : lire au premier rendu
produirait un balisage différent de celui qui a été livré, et React refuserait l'hydratation.

`LECTURE_IMMEDIATE`, exporté par `apps/app/src/lib/store.ts` et sa variante `.web.ts`, porte cette
différence — décidée par le fichier que Metro choisit, pas par un test à l'exécution.

## Commandes

```sh
bun install

bun run dev             # Expo, choix de la plateforme au lancement
bun run dev:web         # directement dans le navigateur

bun run generate        # jetons, icônes, recettes, sitemap, manifeste — avant tout build
bun run build:web       # export statique du site → apps/app/dist, service worker compris
bun run prebuild        # projets natifs ios/ et android/

bun test packages/core  # 93 tests du métier
bun run typecheck
bun run check           # Biome : format, règles, imports
bun run check:fix
```

Les fichiers engendrés sont committés (`recettes.generated.ts`, `tokens.generated.css`) ; la CI
vérifie qu'ils correspondent bien à leur source.

## Publier

Voir [`store/README.md`](store/README.md) : ouverture des comptes, création du projet EAS, build,
envoi. Les fiches et les réponses aux questionnaires de conformité sont dans
[`store/app-store.md`](store/app-store.md) et [`store/play-store.md`](store/play-store.md).

Le chemin critique est l'**ouverture des comptes développeur** — plusieurs jours chez Apple, et
14 jours de test fermé chez Google si le compte est personnel. Tout le reste est prêt.

## Écarts assumés avec la maquette

- **Les résultats sont découpés en quatre écrans** au lieu d'un écran unique, avec une adresse par
  sujet. Le profil étant persisté, chaque écran s'ouvre et se partage indépendamment.
- **Les textes ont été réécrits en langage courant.** Les termes techniques restent accessibles en
  second plan (« Perdre du gras », puis « aussi appelé sèche · −10 à −25 % »). Les valeurs
  numériques, elles, restent celles de la maquette.
- **La saisie demande une date de naissance, pas un âge.** L'âge est recalculé à chaque affichage,
  donc un profil enregistré ne vieillit pas faux. Une date de naissance enregistrée passe en
  lecture seule ; « Tout effacer » est la seule sortie.
- **Les illustrations d'écran ne s'affichent qu'au-delà de 768 px.** Sur un téléphone, la largeur
  revient au texte — c'est la règle qu'appliquait déjà le site.
- **Les groupes d'options annoncent `radio` et non `bouton pressé`.** Le site ne le faisait pas, et
  le portage était l'occasion de ne pas reconduire le défaut.

## Repères vérifiés par les tests

- Au-delà d'un IMC de 30, les protéines sont calculées sur un poids ajusté (haut du poids santé
  + 25 % de l'excès) plutôt que sur le poids total ; les lipides ne descendent jamais sous
  0,6 g/kg ; il reste toujours au moins 10 % de l'énergie en glucides. `plan.test.ts` vérifie ces
  bornes sur 60 combinaisons de profils, de niveaux d'activité et d'objectifs.
- La journée alimentaire est engendrée, pas rédigée : les portions découlent des macros, avec un
  plafond par aliment et un rééquilibrage final sur les féculents. Le menu tombe à moins de 1 % de
  l'apport visé sur tous les profils testés.
- La semaine d'entraînement suit les repères usuels : au moins deux séances de renforcement (OMS),
  48 h entre deux séances des mêmes muscles, progression par répétitions avant progression par
  difficulté, arrêt des séries deux à trois répétitions avant l'échec.
- Les garde-fous de la fourchette (`safeMin`, recommandé borné) et le positionnement par morceaux
  du curseur IMC sont implémentés tels que décrits, avec commentaires dans `calc.ts`.
