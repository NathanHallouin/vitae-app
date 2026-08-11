# Handoff : calculateur de métabolisme de base (Next.js 16.3.0 + MUI)

## Vue d'ensemble

Application grand public qui calcule le métabolisme de base (MB), la dépense énergétique totale (DET), l'IMC, une fourchette d'apport calorique min/max selon l'objectif (sèche, recomposition corporelle, prise de masse, maintien), une répartition des macronutriments, un poids cible avec projection dans le temps, et des recommandations d'exercices au poids du corps expliquant comment répartir l'écart calorique entre mouvement et alimentation.

Langue de l'interface : français. Cible : desktop et mobile. Deux modes de saisie : guidé en 4 étapes et formulaire complet, permutables à tout moment.

## À propos des fichiers de design

Les fichiers de ce dossier sont des **références de design réalisées en HTML** : un prototype montrant l'apparence et le comportement attendus, pas du code de production à copier tel quel.

Le travail consiste à **recréer ces écrans dans l'environnement cible** (ici Next.js 16.3.0 avec MUI) en utilisant ses conventions : `createTheme`, `CssBaseline`, composants `Box`/`Stack`/`Grid`/`Card`/`TextField`/`ToggleButtonGroup`/`LinearProgress`, `useMediaQuery` pour le responsive. Le prototype n'utilise volontairement aucune dépendance : tous les styles sont inline et pilotés par des variables CSS, ce qui donne une correspondance directe avec un thème MUI (voir « Correspondance MUI » plus bas).

## Fidélité

**Haute fidélité.** Couleurs, typographie, espacements, états et copies sont définitifs et donnés ci-dessous en valeurs exactes. Les libellés français sont à reprendre à l'identique. La grille et les rayons suivent Material Design (rayon 4 px, ombres MUI elevation 1 et 3), donc les composants MUI par défaut conviennent sans surcharge lourde.

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

**Contrainte technique constatée** : dans le prototype, les libellés d'axes ne pouvaient pas vivre dans le `<svg>` ; ils sont rendus en HTML positionné en pourcentage sous le graphique. En React/MUI cette contrainte n'existe pas : utilisez des `<text>` SVG ou une lib de graphique (MUI X Charts `LineChart` convient parfaitement pour cette projection, avec une ligne de référence pour la cible).

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

Le catalogue (`src/lib/recipes.ts`) tient en dur : l'app ne parle à aucun serveur et n'a pas de clé
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

**1. Le NEAT** (`src/lib/neat.ts`, catalogue `NEAT_ACTIONS`) : des gestes du quotidien, répétables
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

**2. Les séances** (`src/lib/training.ts`) : un stimulus, pas un moyen de dépenser. Le programme
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


## Écrans

### 1. Accueil (`screen: "home"`)

- **Objectif** : expliquer en trois lignes et lancer la saisie.
- **Layout** : grille 2 colonnes `repeat(auto-fit, minmax(280px, 1fr))`, gap 32 px, centrée verticalement. Conteneur `max-width: 1200px`, padding `32px 24px 64px`.
- Colonne gauche : `h1` 34 px / 500 / line-height 1.2 (« Combien de calories votre corps dépense-t-il au repos ? »), paragraphe 16 px `--muted`, paragraphe 14 px `--muted2`, puis deux boutons : « COMMENCER » (contained) et « FORMULAIRE COMPLET » (outlined).
- Colonne droite : carte « CE QUE VOUS OBTENEZ », 4 lignes numérotées (pastille ronde 28 px, fond `--primary-tint`, texte `--primary-ink`, 13 px / 700) séparées par `border-top: 1px solid --divider`.

### 2. Saisie (`screen: "input"`)

- **Layout desktop** : en-tête de section (surtitre 12 px majuscules + titre 24 px, bouton texte de bascule de mode à droite), barre de progression 4 px en mode guidé, puis une ligne flex `gap: 24px`, `flex-wrap: wrap` : carte de formulaire `flex: 1 1 460px` et panneau latéral `flex: 1 1 280px; max-width: 340px; position: sticky; top: 88px`. Sur mobile, le panneau passe sous le formulaire.
- **Mode guidé** (4 étapes) : 0 sexe, 1 mesures (âge/taille/poids), 2 activité, 3 objectif. Surtitre « Étape n sur 4 », titres : « Parlons de vous », « Vos mesures », « Votre activité », « Votre objectif ». Progression = (étape+1)/4.
- **Mode formulaire** : les 4 groupes affichés d'un coup, surtitre « Formulaire complet », titre « Vos informations », bouton « CALCULER ».
- **Sexe** : deux boutons 130 px min, padding 16 px. Sélection = fond `--primary-tint`, bordure `--primary-ink`, texte `--primary-ink` ; non sélectionné = fond `--surface`, bordure `--border`, texte `--text`.
- **Mesures** : grille `repeat(auto-fit, minmax(160px, 1fr))`, gap 20 px. Champs numériques avec suffixe (`ans`, `cm`, `kg`), bordure 1 px `--border-strong`, rayon 4 px, hauteur de saisie 14 px de padding vertical, texte 16 px. Spinners masqués.
- **Activité** : deux groupes radio successifs, « Votre quotidien, en dehors du sport ? » (4 lignes) puis « Du sport, combien de fois par semaine ? » (5 lignes). Lignes pleine largeur, pastille 18 px, libellé 15 px / 500, description 13 px `--muted2`, valeur alignée à droite en `--faint` (`×1,2` pour la base, `+0,12` pour l'apport, `+0` si aucune séance). Sous les deux listes, le facteur retenu est rappelé en `aria-live`.
- **Objectif** : grille `repeat(auto-fit, minmax(180px, 1fr))`, gap 10 px, cartes cliquables titre + description.
- **Validation** (messages exacts) : sexe manquant → « Sélectionnez un sexe biologique pour appliquer la bonne équation. » ; champ vide → « Renseignez l'âge, la taille et le poids. » ; âge hors [15, 100] → « L'âge doit être compris entre 15 et 100 ans. » ; taille hors [120, 230] → « La taille doit être comprise entre 120 et 230 cm. » ; poids hors [30, 300] → « Le poids doit être compris entre 30 et 300 kg. » Encart d'erreur : fond `--error-bg`, texte `--error-ink`, 14 px, rayon 4 px.
- **Pied de carte** : `border-top 1px --divider`, bouton texte « RETOUR » / « ANNULER » à gauche, bouton contained « CONTINUER » / « CALCULER » à droite.
- **Panneau « APERÇU EN DIRECT »** : 4 lignes label / valeur (MB, dépense totale, apport recommandé en `--primary-ink`, IMC + libellé de bande), recalculées à chaque frappe, `…` si les données sont incomplètes. Note de bas de panneau 12 px `--faint`.

### 3. Résultats (`screen: "result"`)

Ligne flex `gap: 24px`, `flex-wrap: wrap`.

**Colonne gauche** : `flex: 1 1 320px; max-width: 420px; position: sticky; top: 88px`, gap 24 px :
1. Carte pleine couleur `--primary`, texte blanc, ombre elevation 3, padding 32 px : surtitre « MÉTABOLISME DE BASE », valeur 56 px / 300 tabular-nums + « kcal / jour », légende « au repos absolu, sans aucune activité » ; séparateur `rgba(255,255,255,.25)` ; bloc « DÉPENSE TOTALE · <niveau en minuscules> » valeur 34 px ; bloc « IMC » avec valeur 34 px, libellé de bande 15 px / 500, « Poids santé : x – y kg » à droite, jauge 4 segments 8 px de haut avec curseur blanc 4×16 px (ombre `0 0 0 2px rgba(0,0,0,.18)`), libellés de bandes 11 px, mention « L'IMC ne distingue pas muscle et graisse : il surestime la corpulence des personnes très musclées. »
2. Carte « VOS DONNÉES » : chips 13 px (fond `--divider`, rayon 16 px) listant sexe, âge, taille, poids, niveau d'activité ; boutons « MODIFIER » (outlined, renvoie en mode formulaire) et « RECOMMENCER » (texte) ; avertissement 12 px `--faint` : « Estimation statistique, pas un avis médical. La dépense réelle varie de ±10 % selon la génétique, la masse musculaire et l'état hormonal. »

**Colonne droite** : `flex: 2 1 460px`, gap 24 px :
1. Carte « OBJECTIF · <libellé> » : valeur recommandée 40 px `--primary-ink` + « kcal / jour recommandées », note de l'objectif 14 px, puis section « FOURCHETTE DE DÉFICIT / DE SURPLUS / D'APPORT RECOMMANDÉE » : barre 10 px situant [min, max] entre MB et DET (repère vertical `#90a4ae` sur la DET, échelle 0 → MB, 100 % → DET×1,2), deux tuiles Minimum / Maximum (valeur 22 px, écart en kcal et variation kg/semaine), encart d'avertissement conditionnel.
2. Carte « POIDS CIBLE » : 3 boutons cible (valeur 18 px, libellé, sous-libellé), puis 4 statistiques (écart à combler, durée estimée en semaines + mois, rythme, mois d'atteinte), légende d'échelle, graphique de projection (aire `--primary-tint`, courbe `--primary` 3 px, ligne cible pointillée `--primary-ink` 1,5 px `5 5`, point d'arrivée 5 px), repères de semaines, note 12 px.
3. Carte « RÉPARTITION INDICATIVE » (macros) : 3 lignes label + « x g · y kcal » et barre 6 px.

**Pleine largeur, sous les deux colonnes**, carte « Construire l'écart » (« Construire le surplus » en prise de masse) : titre 20 px, sous-titre « <objectif> · <activité> », paragraphe explicatif, bloc de répartition (barre empilée mouvement/assiette + deux tuiles avec % et kcal), puis grille 2 colonnes : liste d'exercices (libellé 15 px, détail 13 px, kcal ≈ à droite en `--primary-ink`) et liste de conseils « CASSER LA SÉDENTARITÉ » (puces 6 px, fond `--surface2`).

## Interactions et comportement

- Bascule mode guidé ↔ formulaire à tout moment ; le retour à l'étape 0 est fait à la bascule.
- « Modifier » depuis les résultats ouvre le formulaire complet en conservant les valeurs.
- « Recommencer » (en-tête et résultats) remet tout à zéro sauf le thème.
- Sélection d'un objectif → réinitialise le poids cible choisi manuellement.
- Aucune animation complexe : transitions `all .15s ease` sur les options, `width .3s ease` sur la barre de progression.
- Validation à la soumission de l'étape, pas à la frappe ; l'aperçu en direct, lui, se met à jour à chaque frappe.
- Responsive : tout est fluide via `flex-wrap` et `repeat(auto-fit, minmax())`, sans media query. En MUI, préférez `Grid` avec breakpoints ou `useMediaQuery('(min-width:900px)')` pour le passage une/deux colonnes et pour désactiver le `position: sticky` en mobile.
- Mode sombre : bouton pilule dans l'en-tête (pastille + libellé « Clair » / « Sombre »).

## État

```
screen      : "home" | "input" | "result"
mode        : "wizard" | "form"
step        : 0..3
sexe        : "" | "femme" | "homme"
age, taille, poids : string (champs contrôlés)
daily       : 0..3        (défaut 1)  quotidien hors sport
sessions    : 0..4        (défaut 1)  séances par semaine
goal        : "seche" | "recomp" | "masse" | "maintien"   (défaut "seche")
targetKey   : string | null   (poids cible choisi ; null = automatique)
theme       : "light" | "dark" | null (null = valeur par défaut)
error       : string
```

Tout est dérivé de cet état, aucune donnée distante. En Next.js : un composant client unique suffit, ou un `useReducer` + contexte si vous découpez par écran. Persistance optionnelle en `localStorage` (profil + thème), non implémentée dans le prototype.

## Design tokens

Mode clair → mode sombre :

| Token | Clair | Sombre |
|---|---|---|
| `--bg` | `#f4f6f8` | `#121417` |
| `--surface` | `#ffffff` | `#1c1f24` |
| `--surface2` | `#f7f9fa` | `#23272e` |
| `--text` | `#212121` | `#e8eaed` |
| `--muted` | `#5f6368` | `#b0b6bd` |
| `--muted2` | `#757575` | `#9aa1a9` |
| `--faint` | `#9e9e9e` | `#7c848d` |
| `--divider` | `#eceff1` | `#2c3138` |
| `--border` | `#e0e0e0` | `#343a42` |
| `--border-strong` | `#bdbdbd` | `#4a5158` |
| `--primary` | `#1976d2` | `#1565c0` |
| `--primary-dark` | `#1565c0` | `#0d47a1` |
| `--primary-ink` (texte/bordure accent) | `#1565c0` | `#90caf9` |
| `--primary-tint` | `rgba(25,118,210,.08)` | `rgba(144,202,249,.12)` |
| `--error-bg` / `--error-ink` | `#fdecea` / `#b71c1c` | `#3a1f1e` / `#ffb4ab` |
| `--warn-bg` / `--warn-ink` | `#fff8e1` / `#8d6e00` | `#33291a` / `#ffd28a` |

Couleurs fixes (identiques dans les deux thèmes) : lipides `#f9a825`, glucides `#00897b`, repère DET `#90a4ae`, bandes IMC listées plus haut.

Ombres : elevation 1 = `0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12)` ; elevation 3 = `0 3px 5px -1px rgba(0,0,0,.2), 0 6px 10px 0 rgba(0,0,0,.14)`. En sombre : `0 1px 2px rgba(0,0,0,.5)` et `0 6px 14px rgba(0,0,0,.55)`.

Typographie : **Roboto** 400 / 500 / 700, fallback Helvetica, Arial, sans-serif. Échelle utilisée : 56 / 40 / 34 / 24 / 22 / 20 / 18 / 16 / 15 / 14 / 13 / 12 / 11 px. Surtitres : 12 px, 500, `letter-spacing .08em`, majuscules. Libellés de boutons : 14–15 px, 500, `letter-spacing .04em`, majuscules. Chiffres : `font-variant-numeric: tabular-nums` partout.

Rayons : 4 px (cartes, champs, boutons), 16 px (chips et bouton de thème), 50 % (pastilles). Espacements : 2, 4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32 px. Gouttières de grille : 10, 12, 20, 24, 28, 32 px. Conteneur : 1200 px max, padding horizontal 24 px, en-tête haut 64 px, offset sticky 88 px.

Formats numériques : `toLocaleString('fr-FR')` pour les kcal (espace insécable comme séparateur de milliers), virgule décimale pour IMC, kg et rythme, `−` (U+2212) pour les valeurs négatives.

## Correspondance MUI

- Tokens → `createTheme({ palette: { mode, primary: { main: '#1976d2', dark: '#1565c0' }, background: { default: '#f4f6f8', paper: '#fff' }, text: { primary: '#212121', secondary: '#5f6368' }, divider: '#eceff1' }, shape: { borderRadius: 4 }, typography: { fontFamily: 'Roboto, Helvetica, Arial, sans-serif' } })`, avec un second thème pour le mode sombre. `--primary-ink` correspond à `theme.palette.primary.dark` en clair et à `primary.light` (#90caf9) en sombre.
- En-tête → `AppBar` + `Toolbar` (`position: sticky`, elevation 4 visuelle).
- Cartes → `Paper elevation={1}` (elevation 3 pour la carte principale colorée, dont le fond est `primary.main`).
- Champs → `TextField` avec `InputProps={{ endAdornment: <InputAdornment>kg</InputAdornment> }}`, `type="number"`, spinners masqués.
- Sexe / objectifs / poids cible → `ToggleButtonGroup` ou `Card` cliquables ; activité → `RadioGroup` avec `FormControlLabel` personnalisé.
- Progression → `LinearProgress variant="determinate"`.
- Barres de macros et de fourchette → `LinearProgress` ou `Box` avec largeurs en pourcentage.
- Graphique de projection → MUI X Charts `LineChart` (série de poids par semaine + `ChartsReferenceLine` pour la cible), ou SVG maison.
- Chips de récapitulatif → `Chip`.

## Assets

Aucun. Pas d'image, pas d'icône externe : la marque est un cercle avec les initiales « MB », les pastilles et puces sont des `div` ronds. Police Roboto via Google Fonts (ou `next/font/google`).

## Fichiers de ce dossier

- `Calculateur MB.dc.html`, le prototype complet : les trois écrans, toute la logique de calcul (classe `Component`, méthodes `compute`, `weightTargets`, `projection`, `renderVals`), les données de référence (`ACTIVITIES`, `GOALS`, `BMI_BANDS`, `MOVES`, `NEAT`) et les tokens de thème dans le bloc `<style>` du `<helmet>`. C'est la source de vérité pour les valeurs numériques et les copies françaises.
- `support.js`, runtime du prototype, sans intérêt pour l'implémentation.

Ouvrir le HTML directement dans un navigateur pour parcourir les écrans.

---

## Implémentation (Next.js 16.3.0 + MUI 9)

L'application de ce dépôt est la mise en œuvre de ce handoff. La maquette reste dans `maquette/`
comme source de vérité pour les valeurs et les copies.

Outillage : **Bun** (installation, scripts, tests) et **Biome** (lint + format).

```bash
bun install
bun run dev        # http://localhost:3000
bun run build      # build de production
bun test           # tests du métier (src/lib/calc.test.ts)
bun run check      # Biome : lint + format + imports (lecture seule)
bun run check:fix  # Biome : applique les corrections sûres
bun run typecheck  # tsc --noEmit
```

### Organisation

| Chemin | Rôle |
|---|---|
| `src/lib/constants.ts` | données de référence et libellés en langage courant |
| `src/lib/calc.ts` | métier pur : Mifflin-St Jeor, DET, fourchettes, IMC, macros, poids cible, projection, répartition assiette / mouvement |
| `src/lib/format.ts` | formats français (espace insécable, virgule décimale, `−` U+2212) |
| `src/lib/date.ts` | âge calculé depuis la date de naissance, fraîcheur du poids (7 jours) |
| `src/lib/storage.ts` | profil en `localStorage`, clé versionnée `vitae.v1.profile` |
| `src/lib/state.ts` | état du formulaire de saisie + validation (la navigation est au routeur) |
| `src/lib/nutrition.ts` | conseils alimentaires selon l'objectif |
| `src/lib/recipes.ts` | catalogue de plats, filtres d'ingrédients et tirage par repas |
| `src/lib/training.ts` | séances de renforcement, adaptées à l'âge, au sexe, au poids, au métabolisme et à l'objectif |
| `src/lib/neat.ts` | mouvement du quotidien (NEAT), tenu à part des séances |
| `src/lib/nav.ts` | plan de navigation et seuil `NAV_BREAKPOINT`, partagés par les deux barres |
| `src/theme/` | tokens clair/sombre → `createTheme`, exposés via `theme.tokens` |
| `src/components/ProfileProvider.tsx` | profil chargé au montage, métriques dérivées, partagées par toutes les pages |
| `src/components/ResultTabs.tsx` | onglets du haut, à partir de 700 px |
| `src/components/BottomNav.tsx` | barre de navigation fixe en bas, sous 700 px |
| `src/components/screens/` | un composant par page |

### Pages

| Route | Contenu |
|---|---|
| `/` | accueil : à quoi sert le calcul, et reprise du profil s'il existe |
| `/profil` | saisie guidée (4 questions) ou formulaire complet, avec aperçu en direct |
| `/metabolisme` | dépense au repos, dépense totale, IMC |
| `/alimentation` | objectif, combien manger, fourchette, répartition des macros |
| `/poids` | poids cible et projection dans le temps |
| `/bouger` | répartition mouvement / assiette, exercices, anti-sédentarité |

Les quatre dernières partagent un layout (`src/app/(resultats)/layout.tsx`) qui porte les onglets,
le rappel du profil et l'avertissement médical, et renvoie vers `/profil` si aucun profil n'est
enregistré.

Les tokens sont exposés via `theme.tokens` (augmentation de type MUI) : `sx={(t) => ({ color: t.tokens.muted })}`.

### Icônes et illustration

Aucune bibliothèque d'icônes : `src/components/ui/Icon.tsx` porte un jeu maison d'une vingtaine de
tracés sur grille 24 px, au trait de 1,6 px, en `currentColor`, donc une seule version pour les
deux thèmes. Les icônes sont décoratives et toujours doublées d'un libellé lisible : elles sont
masquées aux lecteurs d'écran (`aria-hidden`) sauf si un `title` est passé explicitement.

| Emplacement | Icônes |
|---|---|
| Onglets de résultats | `flamme` · `assiette` · `balance` · `course` |
| Bascule de thème | `soleil` / `lune` (remplace l'ancienne pastille de couleur) |
| Quotidien (`DAILY`) | `bureau` · `marche` · `debout` · `caisse` |
| Séances (`SESSIONS`) | `aucun` pour « Jamais », `haltere` au-delà |
| Objectifs (`GOALS`) | `flecheBas` · `flechesOpposees` · `flecheHaut` · `egal` |
| Macronutriments | `oeuf` · `goutte` · `ble`, teintés par la couleur du macro |
| Accueil, « Ce que vous obtenez » | `flamme` · `eclair` · `silhouette` · `assiette` |

#### Illustrations

`src/components/ui/HomeIllustration.tsx` est dessinée sur mesure : une jauge d'énergie surmontée
d'une flamme, au-dessus du rythme de la dépense sur la journée. Sans texte, donc rien à traduire
ni à faire grossir avec la largeur. Elle lit les tokens via `useTokens()`, comme `ProjectionChart`.

`src/components/ui/doodles/` contient quatre illustrations d'**Open Doodles**
(<https://www.opendoodles.com>, Pablo Stanley), **domaine public CC0** : usage commercial libre,
sans attribution requise. Une par page de résultats, passée à `PageIntro` via la prop
`illustration` et masquée sous `md` : elle est décorative, le texte prime sur mobile.

| Page | Illustration | Poids gzip |
|---|---|---|
| Mon métabolisme | `Meditating`, la dépense au repos | 18 Ko |
| Ce que je mange | `Plant` | 46 Ko |
| Mon poids | `Levitate` | 6 Ko |
| Bouger | `Running` | 10 Ko |

Points d'attention si l'on en ajoute :

- **unDraw est exclu** : sa licence interdit explicitement de « link, embed, scrape, search or
  download the assets » par un moyen automatisé. Les fichiers doivent être récupérés à la main.
- **Ne pas arrondir les coordonnées.** Ces tracés sont en commandes relatives : l'erreur
  s'accumule d'un segment au suivant et le dessin part en morceaux. Un arrondi à une décimale,
  qui divisait le poids par deux, détruisait l'illustration.
- **Un fichier par illustration**, jamais un module commun : Next découpe par route, chaque page
  ne paie ainsi que son propre tracé.
- Les deux couleurs amont (`ink`, `accent`) sont câblées sur les tokens `doodleInk` et
  `doodleAccent`, sinon le bleu marine disparaît sur le fond du thème sombre.
- `Plant` est de loin la plus lourde (46 Ko gzip, dix tracés sans dominante isolable) : à
  remplacer par une plus légère si le poids de `/alimentation` devient un sujet.

### Direction visuelle

La maquette a servi de base fonctionnelle, mais l'habillage a été refait pour correspondre au
secteur (santé / nutrition) :

- **Palette** : bleu profond `#084684` en thème clair, abricot `#f7b97b` en thème sombre, sur des
  fonds chauds plutôt que gris neutres. `primary` ne sert **qu'en aplat** (carte principale, états
  sélectionnés, boutons pleins) ; le texte posé dessus (`heroText`) suit sa clarté. Pour les textes
  et bordures accentués, le token `primaryInk` (`#084684` en clair, 9,4:1 sur blanc) tient
  largement le 4,5:1. Les macronutriments utilisent un trio
  orange / bleu / vert, distinguable en cas de daltonisme.
- **Typographie** : *Fraunces* (serif, axe `SOFT` adouci) pour les titres et les grands chiffres,
  *Inter* pour l'interface. Les chiffres restent en `tabular-nums`.
- **Formes** : cartes de rayon 16 px avec bordure fine et ombre diffuse, boutons de rayon 10 px
  sans majuscules, onglets en pastilles, champs sur fond `surface2`.
- **En-tête clair** au lieu de la barre pleine couleur, pour laisser la carte principale porter
  la couleur.
- **Contraste** : vérifié par mesure dans le navigateur, tous les textes passent le seuil WCAG AA
  dans les deux thèmes (4,5:1, ou 3:1 pour les grands corps). Le `faint` de la maquette
  (`#9e9e9e`, 2,7:1) ne passait pas.

Deux notes d'implémentation :

- `toLocaleString('fr-FR')` sépare les milliers par une espace fine insécable (U+202F) que ni
  Inter ni Fraunces ne dessinent. `kcal()` la remplace par une espace insécable classique.
- MUI 9 n'émet plus les classes combinées `MuiButton-textPrimary` : les surcharges de bouton par
  couleur passent par `components.MuiButton.variants`, sinon elles sont silencieusement ignorées
  et le texte reste sur `palette.primary.main`.

### Choix d'implémentation

- **Écart assumé avec la maquette : les résultats sont découpés en quatre pages** au lieu d'un
  écran unique, avec une URL par sujet et des onglets. Le profil étant persisté, chaque page se
  recharge et se partage indépendamment.
- **Écart assumé : les textes ont été réécrits en langage courant.** Les termes techniques
  restent accessibles en second plan (« Perdre du gras » avec « aussi appelé sèche · −10 à −25 % »).
  Les valeurs numériques, elles, restent celles de la maquette.
- Le profil est chargé une fois par `ProfileProvider` ; les pages n'en dérivent que des calculs
  purs. Aucune donnée distante.
- Le graphique de projection est un SVG maison qui reprend la géométrie du prototype
  (`viewBox` 600 × 196, `x0=6`, `x1=594`, `y0=10`, `y1=170`), avec les libellés d'axe en `<text>`
  SVG : la contrainte du prototype n'existe plus ici, MUI X Charts n'est donc pas nécessaire.
- Responsive sans media query pour l'essentiel (`flex-wrap`, `repeat(auto-fit, minmax())`) ;
  `sx` avec breakpoints uniquement pour désactiver le `position: sticky` sous `md` et compacter
  l'en-tête sur mobile (sous 360 px de large, le titre est tronqué avec une ellipse).
- `biome.json` remplace ESLint et Prettier : `preset: recommended`, guillemets simples,
  largeur 100, imports organisés automatiquement. Les règles spécifiques à Next.js
  (`eslint-config-next`) n'ont pas d'équivalent Biome ; `bun run build` reste le garde-fou
  pour les erreurs propres au framework.
- **Écart assumé avec la maquette : la saisie demande une date de naissance, pas un âge.**
  L'âge est recalculé à chaque affichage (`ageFrom`), donc un profil enregistré ne vieillit pas
  faux. Les copies concernées ont été adaptées : « Renseignez la date de naissance, la taille et
  le poids. » et le libellé du champ. Le message sur les bornes d'âge reste inchangé.
- **Profil persisté en `localStorage`**, sans base de données : le profil complet est enregistré à
  chaque saisie avec sa date de modification. Au retour sur l'app, il est restauré ; si le poids
  date de plus de 7 jours, le champ est vidé et un rappel indique le dernier poids connu. La date
  de naissance restaurée passe en lecture seule ; « Recommencer » efface le profil et la rend à
  nouveau saisissable.
- **Repères nutritionnels vérifiés** : au-delà d'un IMC de 30, les protéines sont calculées sur un
  poids ajusté (haut du poids santé + 25 % de l'excès) plutôt que sur le poids total ; les lipides
  ne descendent jamais sous 0,6 g/kg ; il reste toujours au moins 10 % de l'énergie en glucides.
  `src/lib/plan.test.ts` vérifie ces bornes sur 60 combinaisons de profils, de niveaux d'activité
  et d'objectifs.
- **Journée alimentaire générée**, pas rédigée : les portions découlent des macros, avec un
  plafond par aliment et un rééquilibrage final sur les féculents. Le menu tombe à moins de 1 % de
  l'apport visé sur tous les profils testés.
- **Semaine d'entraînement** construite sur les repères usuels : au moins deux séances de
  renforcement (OMS), 48 h entre deux séances des mêmes muscles, progression par répétitions avant
  progression par difficulté, arrêt des séries 2 à 3 répétitions avant l'échec.
- Les garde-fous de la fourchette (`safeMin`, recommandé borné) et le positionnement par morceaux
  du curseur IMC sont implémentés tels que décrits, avec commentaires dans `src/lib/calc.ts`.
