# Audit technique — vitae-app

**Date :** 6 septembre 2026 · **Périmètre :** le code produit **et** le dispositif qui le produit
· **Révision auditée :** `d1257eb` + arbre de travail non commité (76 fichiers modifiés, 17 non suivis)

> **Mise à jour du 6 septembre.** Cinq passes de travaux : les cinq corrections prioritaires, puis
> les constats abordables du journal. Bilan : **19 constats résolus** · **1 découvert par une
> correction** (`V7`, lui-même résolu) · **1 évalué puis écarté avec sa mesure** (`V5`) ·
> **2 affirmations de l'audit corrigées** (le « 0 `any` » et le « fichier suivi par git » étaient
> faux, méthode en cause dans les deux cas). L'état de chaque constat est dans les tableaux de la
> Phase 1 ; le journal des travaux est en fin de document.

> **Conflit d'intérêts, à lire avant le reste.** Cet audit a été produit par l'agent qui a écrit une
> part majoritaire du code audité. Ce n'est pas un audit indépendant : il connaît les intentions, ce
> qui lui fait voir de la cohérence là où un tiers verrait de l'opacité, et il ne peut pas constater
> ses propres angles morts. Les constats les plus sévères ci-dessous portent sur du code écrit dans
> les heures qui ont précédé. **Une relecture de `packages/core/src/calc.ts`, `suivi.ts` et
> `training.ts` par quelqu'un qui n'a pas participé à leur écriture reste nécessaire.**

---

## Phase 0 — Le dispositif

### Niveau d'autonomie : Tier 3 (agentique)

| Indice | Preuve |
|---|---|
| Trailer de session d'agent dans les commits | 7 commits sur 35 portent `Claude-Session: https://claude.ai/code/session_…` |
| Instructions machine versionnées | `AGENTS.md` (47 l.), `CLAUDE.md` (1 l. : `@AGENTS.md`) |
| Permissions d'exécution larges | `.claude/settings.local.json` : `Bash(bun run *)`, `Bash(git add *)`, `Bash(git commit *)`, `Bash(python3 -)`, `Bash(bun x *)` |
| Volume incompatible avec la frappe manuelle | `623ad6b` 6 541 l. · `749cc21` 5 263 l. · `e5548e4` 4 878 l. — 35 commits en **5 jours** |
| L'agent lance lui-même sa boucle de vérification | `check`, `typecheck`, `bun test`, `build:web` dans l'allowlist, exécutés en boucle |

L'agent écrit, exécute, corrige, itère et **peut committer**.

### Part du code non écrite à la main

**Estimation : > 80 %, marge ± 15 points.** Méthode : trailer de session (7/35, non systématique donc
non concluant seul), vélocité (17 104 l. de code + 2 554 l. de tests + 1 404 l. de documentation en
5 jours par un contributeur unique), densité et homogénéité des commentaires (2 908 lignes, 17 %).
**Non vérifiable précisément** — il faudrait un trailer systématique ou les journaux de session.

### Qui relit quoi : personne, structurellement

- `git log --merges` → **0**. Aucune PR, aucun merge, 35 commits directs sur `main`.
- Aucun `CODEOWNERS`, aucun template de PR (`.github/` ne contient que `workflows/`).
- Contributeur unique.

### Complexité du domaine

Calcul déterministe, sans serveur, sans authentification, sans paiement, sans donnée sortante.
**Neuf règles non triviales :**

1. Mifflin-St Jeor + facteur d'activité sur deux axes — `packages/core/src/calc.ts`, `constants.ts:activityFactor`
2. Garde-fous de la fourchette (`safeMin`, recommandé borné) — `calc.ts`
3. Poids de référence des protéines au-delà d'un IMC de 30 — `calc.ts:proteinReferenceWeight`
4. Position du curseur IMC par morceaux — `calc.ts:111`
5. Tendance de poids par moindres carrés sur fenêtre glissante — `suivi.ts:tendance`
6. Cohérence de la projection (sens du plan vs sens de la cible) — `calc.ts:367`
7. Planification des rappels sous le plafond iOS de 64 notifications — `rappels.ts`
8. Mise à l'échelle des quantités de recette — `quantites.ts:scaleIngredient`
9. Règle de l'encart unique par écran — `cours.ts:encartDeLEcran`

### Niveau de formalisme justifié

**Modeste.** Pas de réglementaire opposable, pas de SLA, pas de donnée qui quitte l'appareil. Deux
risques réels : **une régression silencieuse sur un calcul de santé affiché comme repère**, et **la
casse du référencement**, seul canal d'acquisition. Le dispositif doit être bon sur deux points —
l'ancrage des tests de calcul et la vérification du HTML livré — et peut rester léger ailleurs.

---

## Phase 1 — Constats

Gravité : 🔴 critique · 🟠 majeur · 🟡 mineur · ⚪ convention · 💭 hypothèse (non prouvé)

### Axe 1 — La spécification comme source de vérité · **Écart majeur**

| # | Gr. | Constat | Référence |
|---|---|---|---|
| S1 | ✅ | **Résolu.** La règle « jamais un test à l'exécution » était violée 6 fois. Il ne reste que deux `Platform.OS`, tous deux iOS/Android — une distinction qu'aucun fichier `.web` ne sait exprimer, et qui est désormais l'exception écrite dans la règle | Correctifs : `src/lib/demarrage.ts` + `.web.ts`, `src/lib/splash.ts` + `.web.ts`, `components/layout/Seo.tsx` + `.web.tsx` + `SeoProps.ts`. Exception : `ui/DateField.tsx:40` et `:83` |
| S2 | ✅ | **Résolu.** `tokens.ts` se déclarait source unique mais l'échelle typographique et les rayons étaient recopiés à la main ; `FONT_SIZES` était du code mort et la copie était la vraie source | `tools/build-tokens.ts` engendre désormais `apps/app/tailwind.generated.js`, que `tailwind.config.js` étend. `RADII.gauge` en est exclu : c'est une épaisseur de trait, pas un rayon de coin |
| S3 | ✅ | **Résolu.** `expo-linear-gradient` était déclaré sans un seul import, et un commentaire affirmait le contraire — il avait survécu à ce qu'il décrivait | Dépendance retirée du manifeste ; le commentaire de `Hero.tsx` dit maintenant ce qui s'est passé, parce que c'est le défaut du registre narratif : un commentaire qui affirme n'est vérifié par personne |
| S4 | ✅ | **Résolu.** Les tests de calcul citaient `maquette/Calculateur MB.dc.html`, supprimé au commit `15f5222` : les attentes n'avaient plus de source | `packages/core/src/calc.reference.ts` — trois profils redérivés à la main depuis `README.md`, arithmétique écrite à côté de chaque valeur, module non importé par le code de production |

**Ce qui est conforme.** `README.md` (982 l.) contient une vraie spécification métier — formules,
tables, copies exactes, garde-fous — et elle est effectivement utilisée : `calc.test.ts` en reprend
les valeurs. `ROADMAP.md` (374 l.) consigne les décisions **avec leur raison**. Les décisions
structurantes vivent dans les en-têtes de module ; c'est un substitut acceptable à des ADR formels
à cette échelle.

**Traçabilité.** Exigence → code → test : possible pour les formules, impossible pour l'interface
(aucun identifiant d'exigence, aucune convention reliant un § du README à un test).

### Axe 2 — Contexte machine (AGENTS.md, CLAUDE.md) · **Écart mineur**

| # | Gr. | Constat | Référence |
|---|---|---|---|
| C1 | ✅ | **Résolu.** `AGENTS.md` ignorait la règle « un encart par écran » et la navigation à quatre sections — deux invariants qui ne vivaient que dans le README, 982 lignes plus loin | `AGENTS.md`, deux paragraphes ajoutés, plus l'activation du crochet de pré-commit |
| C2 | ✅ | **Résolu.** Deux règles sont vérifiées en CI : aucun test de plateforme web/natif dans `app/` et `src/components/`, et `packages/core` sans import de plateforme. Contre-épreuve faite — la règle mord sur une violation introduite exprès | `.github/workflows/ci.yml`, étape « Les règles du dépôt sont tenues » |

**Ce qui est conforme.** Format court (tient dans une fenêtre de contexte), règles **vérifiables**
et non des généralités. Deux d'entre elles sont effectivement tenues :
- `packages/core` n'importe ni React, ni React Native, ni `node:fs` — vérifié ;
- contenu replié caché par `display: 'none'` — vérifié partout : `Repliable.tsx:78`,
  `Fiche.web.tsx:50`, `SousOnglets.tsx:106`, `FiltresRecettes.tsx:119`, `SuiviCard.tsx:73` et `:99`.

Dépôt structuré pour qu'un agent s'y repère : un module métier par sujet, nommage prévisible,
exports un par un (`packages/core/package.json` : `"./*": "./src/*.ts"`).

### Axe 3 — Garde-fous d'exécution · **Écart majeur**

| # | Gr. | Constat | Référence |
|---|---|---|---|
| G1 | ✅ | **Résolu en partie, et le reste documenté.** L'allowlist passe de **53 à 12 entrées** : 36 commandes jetables retirées, plus `bun x *` et `bash -e -c` — deux trous béants qu'aucun usage réel ne réclamait. `python3 -` reste, délibérément : cet environnement demande des modifications de fichiers par le shell. **`AGENTS.md` le dit maintenant en toutes lettres** — l'allowlist est une commodité, pas une frontière | `.claude/settings.local.json`, `AGENTS.md` § « Avant le premier commit » |
| G2 | ✅ | **Résolu.** L'agent pouvait modifier `.github/workflows/ci.yml` au fil d'un commit ordinaire, donc désarmer sa propre vérification. C'est arrivé deux fois pendant la refonte | `.githooks/pre-commit` refuse tout commit touchant `.github/workflows/` sans `VITAE_CI=1` explicite. Contre-épreuve faite : le crochet mord |
| G3 | ✅ | **Résolu.** Aucun crochet git n'existait : rien n'obligeait à lancer la boucle de vérification avant d'écrire dans l'historique | `.githooks/pre-commit` — format, types, tests, sept secondes. Volontairement court : un crochet lent finit contourné par `--no-verify`, et un garde-fou contourné vaut moins que pas de garde-fou |
| G4 | ✅ | **Résolu, et le constat corrigé.** L'audit affirmait que `.claude/settings.local.json` était *suivi par git* : **c'était faux**, `git ls-files .claude/` a toujours rendu zéro. Erreur de méthode — une chaîne `&&`/`\|\|` mal lue. Ce qui était vrai : 53 entrées accumulées, dont 36 jetables, dans un fichier que personne ne relit | Fichier élagué à 12 entrées et **explicitement ignoré** (`.gitignore:31`) : il était jusqu'ici non suivi *et* non ignoré, donc à un `git add -A` près d'entrer dans le dépôt |

**Ce qui limite le risque, factuellement :** pas de serveur, pas de base, pas de système de paiement,
pas de MCP configuré (`.mcp.json` absent), aucun secret dans le dépôt (`.gitignore:24-28` exclut
`*.jks`, `*.p8`, `*.p12`, `*.key`, `*.mobileprovision`). Le rayon d'action est le disque local et
le dépôt.

### Axe 4 — Vérification et circularité · **🔴 CRITIQUE**

C'est l'axe qui porte le vrai problème.

| # | Gr. | Constat | Référence |
|---|---|---|---|
| V1 | ✅ | **Résolu.** L'ancre externe des tests de calcul avait été supprimée : les valeurs dures n'étaient plus que le souvenir de ce que le code avait produit | `calc.reference.ts` + `calc.test.ts`. **La dérivation a immédiatement servi** : elle a fait échouer un test sur une valeur du curseur IMC que j'avais arrondie de travers (81,633 au lieu de 81,6325). L'erreur était dans la table, pas dans le code — et c'est la démonstration écrite à côté qui a permis de trancher |
| V2 | ✅ | **Résolu.** « Plus tard » disparaissait pour quiconque n'avait pas touché son profil depuis 7 jours | `encartDeLEcran` rend désormais `source: 'drapeau' \| 'progression'` (`cours.ts`), lu par `EncartCours.tsx:53` au lieu d'être redéduit. Test de non-régression : `cours.test.ts`, « la source dit lequel des deux cas s'est produit » |
| V3 | ✅ | **Résolu.** Trois tests ne pouvaient pas échouer : ils redisaient la définition qu'ils prétendaient vérifier | Remplacés par des invariants qui peuvent casser — chaque écran monté appartient à une section ; les libellés courts tiennent dans un quart de barre (11 signes, mesuré) ; quatre chapitres de quatre, comme la copie l'affirme ; **le contrat éditorial du résumé**. Ce dernier a échoué à la première exécution, voir le journal |
| V4 | ✅ | **Résolu.** `bmiGaugePosition` n'était testé qu'avec une valeur exacte sur **une bande sur quatre**, encadrements ailleurs — or le bug visé donne des valeurs qui restent dans le bon quart la moitié du temps | `CURSEUR_IMC` dans `calc.reference.ts` : les quatre segments, les deux bornes, et les trois valeurs de charnière (18,5 · 25 · 30) |
| V5 | ⚖️ | **Évalué, mesuré, écarté.** Activer `noUncheckedIndexedAccess` fait remonter **123 erreurs, dont 38 hors tests**. Aucune n'est un bug : tableaux constants (`DAILY`, `BMI_BANDS`, `PLAGES_PRETES`), captures de groupes non facultatifs, accès déjà gardés par `??`. Les corriger demanderait une centaine d'assertions non nulles — troquer un garde-fou réel (zéro `!`, zéro `as`) contre un théorique | Décision et mesure consignées dans `tsconfig.base.json:9` |
| V6 | ✅ | **Résolu.** `WeightTarget.key` était `string` alors que les valeurs forment un ensemble fermé de six, et cette chaîne traversait le fournisseur de profil et l'écran | `CleCible` dans `calc.ts` ; propagée à `Projection`, `buildProjection` et `ProfileProvider`. Le repli défensif de `buildProjection` rattrapait une erreur que le compilateur refuse désormais d'écrire |
| V7 | ✅ | **Nouveau, découvert par la correction n°5, et résolu.** `tools/` n'étant typechecké par aucun script, **deux erreurs de type y dormaient** : `subset-font` sans déclaration (donc un `any` implicite sur l'appel qui réduit les polices) et `sharp.Sharp` référencé comme un espace de noms inexistant | `tools/build-fonts.ts:27` et `tools/build-photos.ts:83`. Correctifs : `tools/subset-font.d.ts`, import nommé `type Sharp`, `tools/tsconfig.json`, et `typecheck` racine étendu aux quatre périmètres |

#### Détail V2 — pourquoi c'est l'illustration du problème

La règle a été extraite dans le métier et testée **huit fois** (`cours.test.ts:170-215`). Le bug vit
dans les **six lignes de glu qui n'ont pas été extraites**, recalculées depuis un signal différent.
Les tests passent, le comportement est faux. C'est exactement la faille de la vérification
circulaire : le test vérifie ce que l'agent a écrit, pas ce que l'écran fait.

Deux défaillances concrètes :
1. `poidsPerime` (vrai dès 7 jours sans modification de profil) rend `repoussable` faux sur
   `/metabolisme`, où ce drapeau n'est même pas consulté ⇒ bouton absent, `coursRepousse` sans effet.
2. Si la notion du drapeau est déjà lue, `encartDeLEcran` retombe sur la progression mais
   `repoussable` reste faux ⇒ même symptôme.

#### Détail V3 — les trois tests tautologiques

| Test | Pourquoi il ne peut pas échouer |
|---|---|
| `nav.test.ts:34` `expect(MOBILE_PAGES.slice(0, RESULT_PAGES.length)).toEqual(RESULT_PAGES)` | `MOBILE_PAGES` est **défini** comme `[...RESULT_PAGES, profil]` (`nav.ts:46`) |
| `cours.test.ts:25` `expect(NOTIONS).toHaveLength(CHAPITRES.reduce(…))` | `NOTIONS` est un `flatMap` de `CHAPITRES` — garanti par construction |
| `cours.test.ts:50-56` « gardent le texte de leur chapitre » | Compare un champ à celui dont il est copié trois lignes plus haut (`cours.ts:63-73`) |

#### Trois invariants confrontés à la suite

| Invariant | Test qui casserait | Verdict |
|---|---|---|
| La fourchette ne descend jamais sous le MB | `calc.test.ts:52` (femme 25 ans, 160 cm, 50 kg, sédentaire — cas où le garde-fou mord) | ✅ protégé |
| Curseur IMC positionné par morceaux | `calc.test.ts:86` | ⚠️ une bande sur quatre |
| Un seul encart par écran | `cours.test.ts:170-215` | ❌ **règle cassée en production, tests verts** |

#### Typage et linter : garde-corps réel — **Conforme**

> **Correction apportée à ce constat.** Il annonçait « 0 occurrence de `any` ». C'était faux, et la
> méthode était en cause : le relevé se faisait par `grep` sur les sources, ce qui ne voit pas un
> `any` **implicite**, introduit par un module sans déclaration de types. `tools/build-fonts.ts:27`
> en portait un — invisible parce que `tools/` n'était typechecké par rien. Voir `V7`.

`0` occurrence **explicite** de `any` · `0` `@ts-ignore` / `@ts-expect-error` · `0` assertion
non-nulle `!`. Depuis `V7`, `0` implicite également : les quatre périmètres sont typechecké.
5 `biome-ignore`, tous sur la même règle (`noArrayIndexKey`), tous justifiés en une ligne
(`Ligne.tsx:37`, `Apparition.tsx:49`, `Page.tsx:81`, `WeekPlanCard.tsx:42`, `RappelsCard.tsx:178`).
Les ~15 transtypages réels sont **tous** à des frontières de désérialisation
(`storage.ts:92,127`, `sauvegarde.ts:100`, `content/build.ts:169`) et suivis d'une validation runtime.

### Axe 5 — Boucle de retour lisible par la machine · **Conforme**

| Mesure | Valeur |
|---|---|
| Cycle complet `check + typecheck + test` | **3,5 s** |
| Tests seuls | **0,16 s** pour 260 tests, 12 fichiers |
| Marqueurs de contournement (`skip`, `only`, `retry`, timeout allongé) | **aucun** |

Déterminisme : les fonctions dépendant de l'heure prennent `now` en paramètre —
`state.ts:133`, `date.ts:ageFrom`, `suivi.ts:depuisEnClair`. Appliqué systématiquement.

| # | Gr. | Constat | Référence |
|---|---|---|---|
| B1 | 🟡 | **Aucun test de composant, aucun test de bout en bout.** `bun test packages` ne couvre pas `apps/app`. La vérification de l'interface passe par des assertions `grep` sur le HTML exporté : ingénieux et bon marché, mais ne teste que la présence de chaînes | `.github/workflows/ci.yml` étapes « Le HTML livré… » |

**Note hors tableau — `tools/` n'est typechecké par rien.** Prouvé : une erreur de type volontaire
insérée dans `tools/build-seo.ts` passe `bun run typecheck` sans échec. `tools/` n'apparaît dans
aucun `include` de tsconfig, et le script racine ne lance que celui d'`apps/app`
(`package.json:23`). Or ces scripts s'exécutent à chaque `bun run generate`.

### Axe 6 — Signatures de génération dans le code · **Écart majeur**

| # | Gr. | Constat | Référence |
|---|---|---|---|
| Sg1 | ✅ | **Résolu** — c'est `S2` sous un autre angle : la duplication de source de vérité entre `tokens.ts` et `tailwind.config.js` | `tools/build-tokens.ts` engendre `tailwind.generated.js` |
| Sg2 | ✅ | **Résolu** — c'est `S3` : `expo-linear-gradient` déclaré sans usage | Dépendance retirée du manifeste |
| Sg6 | ✅ | **Nouveau, découvert en regardant l'écran, et résolu.** `reglage` et `soleil` étaient **le même tracé** — un cercle et huit rayons, à un rayon près — et je les avais posés côte à côte sur le choix de thème : « Système » ressemblait à « Clair ». Deux glyphes jumeaux dans un jeu d'icônes ne se voient pas en les dessinant ; ils se voient le jour où quelqu'un les met à vingt pixels l'un de l'autre | `reglage` redessiné en deux curseurs ; « Système » prend `telephone`, qui dit ce que l'option fait. **Balayage du jeu entier** : les seules paires proches restantes sont les trois flèches, qui sont le même tracé pivoté à dessein |
| Sg3 | ✅ | **Résolu.** Un `sed` global `font-sans-semibold` → `font-sans-medium` avait rendu les deux branches d'un ternaire identiques : la distinction actif/inactif que le ternaire portait avait disparu, sans que rien ne le signale | `SousOnglets.tsx` : la graisse redevient distinctive, avec la trace de l'accident dans le commentaire. **Balayage du dépôt : aucun autre ternaire aplati**, y compris sur plusieurs lignes |
| Sg4 | ✅ | **Résolu, et le constat corrigé.** L'audit annonçait « 41 exports orphelins ». Le chiffre confondait *non nommé ailleurs* et *inatteignable* : la plupart sont des **types** qui n'apparaissent que dans des signatures exportées — `WeightTarget` dans `Projection`, `Session` dans `WeekPlan` — et les retirer les rendrait innommables par un consommateur, ce qui est une régression et non un nettoyage. Les vrais orphelins étaient **14 valeurs** | 13 `export` retirés (fonctions et clés internes à leur module), `FROM_NAV` supprimé — vestige de l'ère Next.js, référencé nulle part, pas même dans son propre fichier |
| Sg5 | ✅ | **Résolu, et le constat corrigé.** « Six mécanismes de divulgation » en confondait trois besoins : `SousOnglets` est de la navigation entre pairs, `EncartCours` est un rejet. Les vrais mécanismes de divulgation étaient **quatre**. L'un d'eux — la feuille modale de `Fiche`, en natif — était redondant : **trois fichiers, 344 lignes et une paire de plateforme pour un seul appelant**, `NeatCard` | `Fiche.web.tsx` et `FicheContenu.tsx` supprimés, tout fondu dans `Fiche.tsx` (220 l.) qui déplie sur place partout. `scrim` retiré de la palette, son unique consommateur ayant disparu. Les deux autres — le panneau de `SuiviCard` et celui de `FiltresRecettes` — ont un déclencheur posé à l'extérieur par nécessité (deux boutons sous le cadran, une pastille qui porte un compte) : ce sont des variantes d'un même geste, pas des mécanismes de plus |

**Ce qui n'est *pas* une signature de génération, à ne pas confondre.** Les commentaires narratifs
longs sont une convention **explicite** (`AGENTS.md:45` : « Les commentaires expliquent pourquoi,
pas quoi »), appliquée avec constance, et ils portent des pièges réels (échec d'hydratation,
chargement des polices, curseur IMC). C'est de la documentation dense, pas du remplissage. Le seul
reproche vérifiable est qu'**au moins un affirme un fait faux** (S3) — le risque du registre
narratif : un commentaire qui affirme n'est jamais vérifié.

**Absents :** code mort défensif, paquet inexistant ou quasi-homonyme, API absente de la version
installée. `typecheck` et `check` passent, `bun install --frozen-lockfile` en CI, `bun.lock` versionné.

### Axe 7 — Revue humaine et gouvernance · **🔴 CRITIQUE**

| # | Gr. | Constat | Référence |
|---|---|---|---|
| Gv1 | ✅ | **Résolu.** Deux refontes vivaient dans un seul arbre de travail sans point de retour | Trois commits : `7dd32c8` refonte visuelle, `da38631` navigation + cours, puis le présent lot de corrections |
| Gv2 | 🔴 | **Ouvert. 0 PR, 0 merge, 35 commits directs sur `main`.** Seuil retenu au-delà duquel une revue n'a pas eu lieu : **400 lignes changées**. **25 commits sur 35 le dépassent**, dont **15 dépassent 1 000 lignes**. Les trois commits du jour ne corrigent pas cela : ils créent des points de retour, ils ne créent pas de revue | `git log --merges` → 0 ; distribution mesurée |
| Gv3 | ✅ | **Résolu.** Aucun point d'arrêt avant un changement de format persisté. Une version qui monte sans migration fait repartir les profils existants à zéro — `parseProfile` rend `null`, l'application ouvre un formulaire vide, et l'utilisateur croit avoir tout effacé lui-même | `.githooks/pre-commit` refuse tout commit touchant `PROFILE_VERSION` ou `SUIVI_VERSION` sans `VITAE_FORMAT=1`. Contre-épreuve faite : le crochet mord |
| — | 💭 | **Taux de retouche : non mesurable.** 35 commits sur 5 jours, fenêtre trop courte pour distinguer réécriture et itération normale. Signal disponible seulement : `4c91800` (−419 l.) et `8dac797` (−4 383 l.) suggèrent des cycles génération → suppression par grandes passes | — |

### Axe 8 — Dette de compréhension · **Écart mineur**

Contre-intuitivement, un point fort : les modules critiques sont documentés au niveau de la
**décision**, et le README rejoue les formules. Un humain reprenant le projet sans l'outil pourrait
le maintenir.

| # | Gr. | Constat | Référence |
|---|---|---|---|
| Cp1 | ✅ | **Résolu.** `training.ts` fait 700 lignes bien commentées fonction par fonction, mais rien ne disait **l'ordre dans lequel elles s'appellent** : il fallait tout relire pour répondre à « pourquoi cet exercice-là, à ce volume-là » | En-tête § « Comment un programme se compose » : la chaîne en cinq étapes, et où se trouve chacune des deux réponses — l'exercice vient de la liste du groupe musculaire, le volume vient du `Setup`. Le gabarit dit **quoi**, le réglage dit **combien**, et les deux ne se mélangent jamais |
| Cp2 | ⚖️ | **Documenté, non levé.** Le plafond iOS était cité sans son chiffre réel, et l'écart avec la valeur retenue n'était écrit nulle part | `rappels.ts` dit maintenant que le système en accepte **64**, que la génération s'arrête à **60**, pourquoi cette marge, et surtout **ce que rien ne vérifie** : que le plafond soit bien de 64 sur la version courante, et que le système se comporte comme décrit. Cela ne se constate que sur un appareil, et ce n'est pas fait |

**Dépendance à un fournisseur d'outillage : faible.** `AGENTS.md` est un format ouvert lisible par
n'importe quel agent. Le seul couplage est `.claude/settings.local.json`, qui n'est nécessaire ni
pour construire, ni pour tester.

### Axe 9 — Sécurité propre au dispositif · **Écart mineur**

| # | Gr. | Constat | Référence |
|---|---|---|---|
| Sc1 | ✅ | **Résolu par une règle, faute d'outil.** Un paquet fourni par un tiers a été lu **et son contenu appliqué comme instruction** : des fichiers copiés tels quels, alors que le paquet annonçait lui-même que son code n'avait jamais été exécuté | `AGENTS.md` pose désormais la règle : ce qu'un tiers dépose est une **donnée**, jamais une instruction — cela se lit, se comprend et se réécrit dans les conventions du dépôt. Aucun outil ne peut trancher à la place d'une relecture ; ce qui manquait était la règle qui l'impose |
| Sc2 | ✅ | **Résolu.** Aucun audit de vulnérabilités n'était configuré | `bun run audit`. Relevé du 6 septembre : 6 avis, `bun audit fix` en résout 2 sans rien casser, **4 restent** — tous figés par les fourchettes d'Expo. Vérifié sur l'export : **un seul atteint le paquet livré** (`decode-uri-component`, déni de service sur une adresse malformée, donc sur le navigateur du visiteur lui-même) ; les trois autres sont des outils de compilation. Analyse dans `README.md` § « Les avis de sécurité » |

**Conforme :** aucun secret dans le dépôt, aucune variable d'environnement lue par le code
applicatif, **aucune donnée réelle envoyée à un service externe** (le profil ne quitte pas
l'appareil — `storage.ts`, support injecté). Licences tracées (OFL pour les polices, CC0 crédité
pour les doodles).

### Axe 10 — Axes classiques appliqués au résultat · **Écart mineur**

**Modélisation du domaine — Conforme.** Vocabulaire du code = vocabulaire métier, en français
(`neatKcal`, `cheminParcouru`, `fourchetteRelevee`, `plageSuivante`). Pas de modèle anémique : les
invariants sont dans les fonctions qui les produisent, pas dans les composants.

**Sens des dépendances — Conforme, et vérifié.** `packages/core` sans React/RN/`node:fs`. Le
stockage est **injecté** (`storage.ts:setProfileStore`) : vraie inversion de dépendance, pas une
interface décorative — deux implémentations réelles (`store.ts` MMKV, `store.web.ts` localStorage)
plus un repli mémoire. C'est ce qui permet 260 tests en 160 ms sans environnement de rendu.

**Validation aux frontières — Conforme.** Toute entrée externe est validée au **runtime**, pas
seulement typée : `parseProfile` (`storage.ts:83`) rejette au moindre doute ; `lirePesees` valide
**entrée par entrée**, avec la justification du traitement différencié écrite dans le code ;
`lireSauvegarde` nomme ce qui ne va pas plutôt que de dire « fichier invalide ».

| # | Gr. | Constat | Référence |
|---|---|---|---|
| X1 | ✅ | **Résolu.** Toutes les écritures de stockage échouaient en silence. L'utilisateur qui enregistrait une pesée la croyait gardée et ne s'en apercevait qu'au lancement suivant, la courbe amputée sans explication | `saveProfile`, `saveSuivi`, `ecrireCle` et `clearProfile` rendent un booléen ; `SuiviCard` l'affiche à l'endroit — le seul — où l'utilisateur crée une donnée qu'il ne peut pas reconstituer. `storage.test.ts` simule un support en lecture seule : l'échec est **rendu**, jamais **levé** |
| X2 | ✅ | **Résolu par démonstration, sans code.** Si `saveSuivi` réussit et l'écriture de `poidsDepart` échoue, l'écran retombe sur la première pesée de l'historique — qui vaut exactement la même chose à cet instant. Il n'y a rien à annoncer parce qu'il n'y a rien de perdu | Le repli tient lieu de compensation ; c'est écrit dans `ProfileProvider.ajouterPesee`, là où le doute se posait |

**Exploitabilité — Non applicable.** Pas de serveur, pas de logs, pas de rollback à opérer.
`console.log` n'apparaît que dans les scripts de build.

---

## Phase 2 — Restitution

### 1. Synthèse

Ouverts après les travaux du 6 septembre, verdict réévalué entre parenthèses.
⚖️ = évalué, mesuré, écarté avec sa raison.

| Axe | Verdict initial (actuel) | 🔴 | 🟠 | 🟡 | ✅ |
|---|---|---|---|---|---|
| 1. Spécification comme source de vérité | Écart majeur (**conforme**) | — | — | — | 4 |
| 2. Contexte machine | Écart mineur (**conforme**) | — | — | — | 2 |
| 3. Garde-fous d'exécution | Écart majeur (**conforme**) | — | — | — | 4 |
| 4. Vérification et circularité | **Critique** (**conforme**) | — | — | ⚖️ 1 | 6 |
| 5. Boucle de retour | Conforme | — | — | 1 | — |
| 6. Signatures de génération | Écart majeur (**conforme**) | — | — | — | 6 |
| 7. Revue et gouvernance | **Critique** (**critique**) | 1 | — | — | 2 |
| 8. Dette de compréhension | Écart mineur (**conforme**) | — | — | ⚖️ 1 | 1 |
| 9. Sécurité du dispositif | Écart mineur (**conforme**) | — | — | — | 2 |
| 10. Axes classiques | Écart mineur (**conforme**) | — | — | — | 2 |
| **Total** | | **1** | **0** | **1 + 2 ⚖️** | **30** |

**Le seul constat critique restant est `Gv2` : aucune revue.** Il n'est pas corrigeable par du
code — et les vingt et une corrections ci-dessus ne l'entament pas d'un pouce, puisqu'elles ont
toutes été produites par l'agent qui a écrit le code qu'elles corrigent. Seul un tiers peut le
lever, et c'est précisément ce que cet audit ne peut pas faire lui-même.

### 2. Diagnostic du dispositif

**Le niveau de garde-fous n'est pas aligné sur le niveau d'autonomie.** Le projet est en Tier 3 —
l'agent écrit, exécute, corrige, committe — avec les garde-fous d'un Tier 1.

Ce qui existe est du bon côté : typage strict sans échappatoire, linter bloquant, 260 tests en
160 ms, et une CI qui vérifie le **fichier livré** et non le code. Dispositif supérieur à la moyenne.

**L'écart le plus dangereux n'est pas là.** Il est que **la vérification est entièrement produite
par l'entité vérifiée, et que la seule ancre externe qui existait a été supprimée du dépôt** (V1).
Pour une application qui affiche des repères caloriques, c'est le seul risque qui compte.

**Second écart, de nature différente :** l'absence totale de points d'arrêt (Gv1, Gv2). Il n'existe
aucun état vérifié auquel revenir.

### 3. Les cinq corrections au meilleur rapport impact/effort

- [x] **1 — Réancrer les tests de calcul sur une source externe** · *processus* · **0,5 j** · résout V1
  **Symptôme :** `calc.test.ts:2` cite `maquette/Calculateur MB.dc.html`, supprimé au commit `15f5222`.
  **Cause :** l'ancre a été supprimée sans que les tests qui en dépendaient soient réancrés.
  **Correction :** créer `packages/core/src/calc.reference.ts` — table figée profil → attendus,
  **non importée par le code de production**, en-tête portant la source et la date de vérification.
  Faire lire `calc.test.ts` depuis là. Ajouter les trois bandes IMC manquantes (V4).

- [x] **2 — Créer des points d'arrêt** · *processus* · **0,25 j** · résout Gv1, atténue Gv2
  **Symptôme :** 76 fichiers non commités portant deux refontes ; aucun état vérifié dans l'historique.
  **Cause :** le commit est autorisé mais jamais exigé à un point de contrôle.
  **Correction :** committer en deux temps (refonte visuelle / navigation + cours). Puis travailler
  sur branche, `main` protégée, un commit par unité vérifiable.

- [x] **3 — Corriger le bug de l'encart** · *code* · **0,25 j** · résout V2
  **Symptôme :** « Plus tard » absent pour tout utilisateur dont le poids date de plus de 7 jours.
  **Cause :** la nature de l'encart est recalculée depuis un signal différent de celui utilisé par
  `encartDeLEcran`.
  **Correction :** faire renvoyer `{ notion, contexte, source: 'drapeau' | 'progression' }` par
  `cours.ts:encartDeLEcran` ; lire `source` dans `EncartCours.tsx`. Ajouter le test qui casse
  aujourd'hui.

- [x] **4 — Une seule source pour les jetons, et la vérifier** · *code + processus* · **0,5 j** · résout S2/Sg1
  **Symptôme :** l'échelle typographique existe deux fois à la main ; `FONT_SIZES` est mort.
  **Cause :** la génération ne couvre que les couleurs.
  **Correction :** étendre `tools/build-tokens.ts` pour engendrer `tailwind.generated.js`
  (`fontSize` + `borderRadius`), l'étendre depuis `tailwind.config.js`. **Étendre la vérification CI
  « fichiers engendrés » à tous les `*.generated.*`**, aujourd'hui limitée à `recettes.generated.ts`.

- [x] **5 — Rendre exécutables deux règles déjà énoncées** · *processus* · **0,5 j** · résout S1, C2, note Axe 5
  **Symptôme :** la règle `Platform.OS` est violée 6 fois ; `tools/` n'est typechecké par rien.
  **Cause :** deux règles énoncées sans vérification exécutable.
  **Correction :** en CI, (a) un `grep -rn "Platform.OS" apps/app/app apps/app/src/components` qui
  échoue au-delà des exceptions listées ; (b) `tools/tsconfig.json` + `tsc --noEmit -p tools`.
  Corriger les 2 violations réelles (`index.tsx:51`, `Seo.tsx:38`) ou les inscrire comme exceptions
  dans `AGENTS.md`.

**Total : 2 jours.** Les cinq portent sur le dispositif autant que sur le code — cohérent avec le
diagnostic.

### 4. Ce qui est bien fait et ne doit pas être cassé

- [ ] **La pureté de `packages/core`.** Aucun import React/RN/`fs`, stockage injecté, temps injecté
      (`now = new Date()` en paramètre partout). C'est ce qui rend 260 tests exécutables en 160 ms
      sans environnement de rendu. **Toute modification qui ferait entrer une dépendance de
      plateforme dans `core` doit être refusée.**
- [ ] **La vérification sur le fichier livré.** Les étapes CI qui font `grep` sur
      `apps/app/dist/*.html` — un `<h1>` et un seul, un `<main>`, un `<a>` sortant, `display:none`
      plutôt qu'un rendu conditionnel — attrapent une classe de bugs invisible aux tests unitaires,
      pour un coût dérisoire. **L'idée la plus rentable du dépôt.**
- [ ] **La lecture tolérante des données persistées.** `parseProfile` rejette en bloc, `lirePesees`
      valide entrée par entrée, et le choix différencié est **justifié dans le code**. Champ `v`
      versionné, migration v1→v2 fonctionnelle et testée.
- [ ] **Le registre des commentaires.** Ils portent des décisions et des pièges, pas des
      paraphrases. À maintenir — **en ajoutant la discipline de les vérifier quand le code change
      dessous** (c'est ce qui a manqué pour S3).
- [ ] **Zéro `any`, zéro suppression de type.** Rare. Ne pas troquer contre de la vitesse.

### 5. Anti-recommandations

| À ne pas faire | Pourquoi |
|---|---|
| Ajouter des tests de composant ou de bout en bout (Playwright, Maestro, Testing Library) **maintenant** | Plusieurs jours, lents, et **écrits par le même agent que le code — donc circulaires eux aussi**. Le problème n'est pas la couverture, c'est l'ancre externe. Corriger la n°1 d'abord |
| Écrire des ADR formels dans `docs/adr/` | La raison des décisions est déjà consignée là où elle sert (en-têtes de module, ROADMAP). Un troisième endroit à tenir à jour, alors que le README dérive déjà plus vite qu'on ne le corrige (S1–S4) |
| Ajouter des règles à `AGENTS.md` | Il fait 47 lignes et il est lu. Les deux règles violées ne le sont pas parce qu'elles manquaient : **rien ne les vérifie**. Transformer celles qui existent en assertions CI, pas en écrire de nouvelles |
| Introduire Zod ou un validateur de schéma | `parseProfile`, `parseSuivi`, `lireSauvegarde` font le travail, sans dépendance et sans surcoût de paquet — ce qui compte pour un export web déjà à 2,8 Mo |
| Ajouter un agent spécialisé « reviewer » | Un second agent du même modèle reproduit les mêmes angles morts. Ce qui manque est un point de vue **extérieur au dispositif**, pas une seconde passe dedans |
| Unifier les six mécanismes de divulgation en une abstraction commune | Ils diffèrent réellement. L'unification produirait un composant à sept props booléennes. Le bon geste est d'en **supprimer deux**, pas d'en abstraire six |

### 6. Ce qui n'a pas pu être évalué

| Sujet | Pourquoi | Ce qu'il faudrait |
|---|---|---|
| Part réelle du code non écrite à la main | Trailer `Claude-Session:` sur 7 commits / 35 ; son absence ne prouve rien | Trailer systématique, ou journaux de session complets |
| Taux de retouche du code généré | 35 commits sur 5 jours : fenêtre trop courte pour distinguer réécriture et itération normale | 3 à 6 mois d'historique |
| Comportement natif (iOS / Android) | Tout vérifié via l'export web et un Chrome sans interface. `expo-notifications`, MMKV, `expo-keep-awake`, le splash et le plafond de 64 notifications ne sont pas exerçables | Un build sur appareil, ou EAS |
| Justesse des contrastes annoncés | `tokens.ts` annonce des ratios WCAG mesurés (5,35:1 min.) ; **aucun calcul n'a été vérifié** | Un test qui calcule le ratio depuis `LIGHT`/`DARK` et échoue sous 4,5 — **2 h**, et cela transformerait une affirmation en garantie |
| Vulnérabilités des dépendances | Aucun outil configuré | `bun audit` ou Dependabot |
| Justesse **métier** des tables | MET du catalogue NEAT, apports du facteur d'activité, seuils d'entraînement : vérifiable que le code applique les tables, **pas que les tables sont justes** | Une source médicale citée par valeur, comme le README le fait déjà pour Mifflin-St Jeor |

---

## Annexe — Mesures brutes

| Mesure | Valeur | Commande |
|---|---|---|
| Commits | 35, contributeur unique, 2026-08-10 → 08-15 | `git shortlog -sne --all` |
| Merges / PR | 0 | `git log --merges` |
| Commits > 400 lignes changées | **25 / 35** | distribution `--shortstat` |
| Commits > 1 000 lignes changées | **15 / 35** | idem |
| Commits avec trailer d'agent | 7 / 35 | `grep -c "Claude-Session:"` |
| LOC code (hors tests, généré, `dist`) | 17 427 (17 494 après la 2ᵉ passe : la 3ᵉ en retire 67 nettes, malgré les commentaires ajoutés) | `find … \| xargs wc -l` |
| LOC tests | 2 633 (12 fichiers) | idem |
| LOC documentation | 1 404 (README 982, ROADMAP 374, AGENTS 47, CLAUDE 1) | `wc -l` |
| Lignes de commentaire dans le code | 2 908 (17 %) | `grep -h "^\s*\*\|^\s*//"` |
| Tests | **275**, 6 945 assertions, **0,15 s** (260 / 6 838 avant) | `bun test packages` |
| Avis de sécurité | **4**, dont **1** atteint le paquet livré (6 avant, 2 résolus) | `bun run audit` |
| Mécanismes de divulgation | **3** (4 avant ; « six » était un décompte fautif) | `Repliable`, `Fiche`, panneaux à déclencheur externe |
| Cycle `check + typecheck + test` | **6,8 s** (3,5 s avant — le typecheck couvre désormais quatre périmètres au lieu d'un) | `time (…)` |
| `any` explicite / `@ts-ignore` / `!` | 0 / 0 / 0 | `grep -rn` |
| `any` **implicite** | 0 depuis `V7` ; il y en avait 1, invisible parce que `tools/` n'était typechecké par rien | `tsc --noEmit -p tools` |
| `biome-ignore` | 5, tous justifiés, tous `noArrayIndexKey` | `grep -rn` |
| Exports orphelins | 41 | balayage `export` vs usages |
| Arbre de travail non commité | **0** au terme des travaux (76 fichiers, +3 594 / −1 526 avant) | `git status` |
| Périmètres typechecké | **4** : `packages/core`, `packages/content`, `apps/app`, `tools` (1 avant) | `package.json:typecheck` |
| Entrées d'allowlist | **12** (53 avant) | `.claude/settings.local.json` |
| Crochets git actifs | **1**, avec **deux** garde-fous : `.github/workflows/` et les versions de format persisté (0 avant) | `.githooks/pre-commit` |
| Ternaires dont les deux branches sont identiques | **0** (1 avant) | balayage `apps/app/src` et `apps/app/app` |
| Paires de glyphes indiscernables | **0** (1 avant) | balayage des 35 tracés de `Icon.tsx` ; les trois flèches sont un même tracé pivoté, à dessein |
| Écrans regardés après les corrections | **19** (0 avant la cinquième passe) | captures + `--dump-dom` sur l'export |
| Exports orphelins (valeurs) | **0** (14 avant) | balayage `export` vs usages |
| Dépendances déclarées sans import | **0** (1 avant) | `expo-linear-gradient` retiré |
| Règles du dépôt vérifiées en CI | **2** : pas de test de plateforme web/natif, `packages/core` sans import de plateforme (0 avant) | `.github/workflows/ci.yml` |
| Fichiers engendrés surveillés en CI | **4** (1 avant : les recettes seules) | idem |

---

## Journal des travaux

### 6 septembre 2026 — les cinq corrections prioritaires

Trois commits, dans cet ordre : `7dd32c8` (refonte visuelle), `da38631` (navigation et cours),
puis le lot de corrections d'audit.

| Correction | Ce qui a été fait | Résout |
|---|---|---|
| **1** Réancrer les tests de calcul | `packages/core/src/calc.reference.ts` : trois profils de référence — cas nominal, les trois garde-fous simultanés, IMC ≥ 30 — **redérivés à la main depuis les formules du README**, avec l'arithmétique écrite à côté de chaque valeur. Module non importé par le code de production. `calc.test.ts` lit depuis là | S4, V1, V4 |
| **2** Créer des points d'arrêt | Trois commits couvrant les 76 fichiers qui vivaient dans l'arbre de travail | Gv1 |
| **3** Corriger le bug de l'encart | `encartDeLEcran` rend `source: 'drapeau' \| 'progression'` ; l'écran le lit au lieu de le redéduire. Test de non-régression ajouté | V2 |
| **4** Une seule source pour les jetons | `tools/build-tokens.ts` engendre `apps/app/tailwind.generated.js` (échelle typographique et rayons). Vérification CI des fichiers engendrés étendue de 1 à 4 | S2, Sg1 |
| **5** Rendre exécutables deux règles | `tools/tsconfig.json`, `typecheck` racine étendu aux quatre périmètres, deux assertions CI (plateforme, pureté de `core`). Trois paires `.web` créées pour supprimer les tests de plateforme restants | S1, C2, V7 |

### Ce que les travaux ont appris

- **La dérivation manuelle a servi dès sa première exécution.** Elle a fait échouer un test sur une
  valeur du curseur IMC que j'avais arrondie de travers — `81,633` au lieu de `81,6325`. L'erreur
  était dans ma table, pas dans le code, et c'est la démonstration écrite à côté de la valeur qui a
  permis de trancher. C'est exactement l'usage prévu : sans elle, le réflexe aurait été d'ajuster le
  nombre attendu.
- **Une règle non exécutée est du texte, et le typage ne fait pas exception.** Brancher `tools/` au
  typecheck a immédiatement révélé deux erreurs qui y dormaient, dont un `any` implicite que
  l'audit lui-même avait manqué en relevant les `any` par `grep`.
- **Corriger un constat en révèle d'autres.** `V7` n'existait pas avant la correction n°5 ; il n'a
  pas été trouvé par l'audit mais par le garde-fou que l'audit demandait de poser.

### 6 septembre 2026 — seconde passe, les constats abordables

| Constat | Ce qui a été fait |
|---|---|
| **S3** | `expo-linear-gradient` retiré du manifeste ; le commentaire qui affirmait le contraire dit maintenant ce qui s'est passé |
| **C1** | `AGENTS.md` complété : encart unique, navigation à quatre sections, activation du crochet, et ce que l'allowlist ne protège pas |
| **V3** | Les trois tests tautologiques remplacés par des invariants qui peuvent casser |
| **V5** | Mesuré (123 erreurs, 38 hors tests, aucune n'est un bug) puis écarté, décision consignée dans `tsconfig.base.json` |
| **V6** | `CleCible` : la clé de poids cible devient un ensemble fermé de six, propagé jusqu'au fournisseur |
| **Sg4** | 13 `export` retirés, `FROM_NAV` supprimé. Le constat lui-même corrigé : « 41 orphelins » confondait deux choses |
| **G1–G4** | Allowlist de 53 à 12 entrées et explicitement ignorée ; crochet de pré-commit avec chemin protégé sur `.github/workflows/` |
| **X1** | Les quatre fonctions d'écriture rendent un booléen ; `SuiviCard` l'affiche ; `storage.test.ts` simule un support en lecture seule |
| **X2** | Résolu par démonstration : le repli existant tient lieu de compensation, et c'est désormais écrit là où le doute se posait |

### Ce que la seconde passe a appris

- **Deux constats de l'audit étaient faux, et pour la même raison : la méthode.** Le « 0 `any` »
  venait d'un `grep` qui ne voit pas un `any` implicite. Le « fichier suivi par git » venait d'une
  chaîne `&&`/`||` mal lue. Un audit qui mesure au `grep` hérite des angles morts du `grep` — et
  c'est le typecheck, puis `git ls-files` seul, qui ont tranché.
- **Un chiffre spectaculaire peut cacher un constat mou.** « 41 exports orphelins » comptait surtout
  des types nommés uniquement dans des signatures, ce qui est normal et correct. Les vrais
  orphelins étaient 14. Le constat n'était pas faux, il était mal mesuré — et une correction
  appliquée sans le vérifier aurait rendu des types innommables par leurs consommateurs.
- **Le contrat éditorial du résumé a mordu à sa première exécution.** Il a trouvé une notion — la
  douzième, « Refaites le calcul tous les 4 à 5 kg » — dont le texte long ne faisait que reformuler
  le résumé. Acceptable quand c'était une explication repliée ; creux depuis que c'est une page
  indexée qui se suffit à elle-même. Le contenu a été corrigé, pas le seuil.
- **Toutes les corrections ne se paient pas en code.** `V5` s'est réglé par une mesure et une
  décision écrite, `X2` par la démonstration qu'il n'y avait rien à perdre. Un constat fermé sans
  ligne de code n'est pas un constat esquivé, à condition que la raison soit dans le dépôt.

### 6 septembre 2026 — troisième passe

| Constat | Ce qui a été fait |
|---|---|
| **Sc2** | `bun run audit` ajouté ; deux avis résolus par `bun audit fix` ; les quatre restants analysés un par un contre l'export, et l'analyse écrite dans `README.md` |
| **Sg5** | Le décompte corrigé (quatre mécanismes, pas six), puis le redondant supprimé : la feuille modale de `Fiche`. Trois fichiers fondus en un, `scrim` retiré de la palette |

### Ce que la troisième passe a appris

- **Un commentaire peut justifier un mécanisme par un besoin qui n'existe pas.** `Fiche.web.tsx`
  expliquait la paire de plateforme par le référencement : « les explications sont ce qu'un moteur
  de recherche trouve à lire ». Vérifié sur l'export : **le détail des fiches n'a jamais été dans le
  HTML livré**, parce que son unique appelant — la carte des gestes du quotidien — est derrière un
  profil, et que `bouger.html` sort donc sur l'état vide. La paire protégeait un contenu absent.
  C'est le même défaut que `S3` sous une autre forme, et il n'a été vu qu'en écrivant une assertion
  qui a échoué.
- **Le nombre d'un constat mérite le même soin que le constat.** Quatre chiffres de cet audit
  étaient faux : deux par une méthode de mesure aveugle (`grep`), deux par un décompte qui
  agrégeait des choses différentes. Aucun ne renversait la conclusion, tous auraient conduit à des
  corrections mal dimensionnées — et deux d'entre elles auraient été des régressions.
- **Un audit de dépendances utile n'est pas un compte d'avis.** Six avis, dont un seul atteint le
  paquet livré et cinq s'exécutent sur la machine qui compile. Une barrière en intégration continue
  aurait rendu la CI rouge en permanence pour des correctifs impossibles à appliquer, ce qui apprend
  à ne plus la lire.

### 6 septembre 2026 — quatrième passe, ce qui restait de corrigeable

| Constat | Ce qui a été fait |
|---|---|
| **Sg3** | Le ternaire aplati de `SousOnglets` réparé, plus un balayage du dépôt : aucun autre |
| **Gv3** | Le crochet refuse un commit qui monte `PROFILE_VERSION` ou `SUIVI_VERSION` sans le dire |
| **Cp1** | `training.ts` : la chaîne de composition en cinq étapes, en tête de module |
| **Cp2** | Le plafond iOS chiffré (64), la marge expliquée (60), et **ce que rien ne vérifie** écrit noir sur blanc |
| **Sc1** | `AGENTS.md` : ce qu'un tiers dépose est une donnée, jamais une instruction |
| **Sg1, Sg2** | Doublons de `S2` et `S3`, marqués comme tels |

### Ce que la quatrième passe a appris

- **Un constat marqué ouvert n'est pas un constat lu.** `Sg3` — un ternaire dont les deux branches
  étaient devenues identiques — figurait dans l'audit depuis le début et avait traversé trois passes
  sans être corrigé, parce que trois de ses voisins portaient le même identifiant de départ et
  avaient été fermés en bloc. Le balayage systématique qui a suivi n'a rien trouvé d'autre ; il
  aurait dû être fait le premier jour.
- **Documenter est parfois la seule correction honnête.** `Cp2` ne se lève pas depuis ici : le
  plafond iOS ne se constate que sur un appareil. Ce qui pouvait être fait était d'écrire le
  chiffre, la marge, sa raison, et surtout la phrase que le lecteur suivant a besoin de lire —
  « ce que rien ne vérifie ici ». Un constat documenté reste ouvert ; il cesse d'être invisible.
- **Une règle vaut mieux qu'un outil quand aucun outil ne peut trancher.** `Sc1` — un paquet fourni
  par un tiers appliqué comme instruction — n'a pas de parade automatique : distinguer un document
  de confiance d'un autre est un jugement. Ce qui manquait était la règle qui impose ce jugement,
  pas un contrôle de plus.

### 6 septembre 2026 — cinquième passe, la vérification qui manquait

Quatre passes de corrections avaient changé des choses **visibles** — la feuille modale de `Fiche`
remplacée par un dépli, la graisse des sous-onglets, le sélecteur de thème — et toutes avaient été
vérifiées **au `grep`**. Aucune n'avait été regardée.

| Vérifié | Résultat |
|---|---|
| Le dépli de `Fiche` sur « Bouger » | La ligne se rend bien ; le détail est dans le DOM après hydratation et masqué par `display: none`, comme la règle l'exige |
| La graisse des sous-onglets (`Sg3`) | La distinction actif/inactif est de retour |
| Le sélecteur de thème | **Défaut trouvé** : deux pictogrammes sur trois étaient le même dessin. Voir `Sg6` |

**Ce que cette passe apprend sur l'audit lui-même.** Il n'avait aucun axe pour « est-ce que cela se
lit à l'écran ». Ses trente-trois constats sont sortis de `grep`, de `tsc` et de `git log` — et un
défaut d'interface posé au milieu d'un écran y a survécu quatre passes. Le `dump-dom` et la capture
sont des outils d'audit au même titre que le compilateur ; ils n'avaient simplement pas été
employés.

### 6 septembre 2026 — sixième passe, le balayage visuel

La cinquième passe avait payé en changeant de méthode : regarder au lieu de `grep`. Elle n'avait
regardé que trois écrans, et l'annexe le disait. Cette passe termine le balayage — et quatre
défauts sont sortis, dont un que quatre passes de `grep` et cinq de relecture n'avaient pas vu.

| Vérifié | Résultat |
|---|---|
| `/confidentialite` | **Défaut** : la politique disait que les rappels se désactivent « sur l'écran Bouger ». Ils ont déménagé dans `/reglages` pendant la refonte. Une erreur de fait dans un document exigé par les deux magasins. Corrigé dans `legal.ts:50`, puis balayage de toute la copie de `packages/core` — aucune autre |
| `/comprendre/[slug]` | Conforme |
| `/recettes` | **Défaut** : le compte de résultats était écrit deux fois dans `FiltresRecettes.tsx`, une par largeur, et les deux avaient divergé — « 8 sur 62 » d'un côté, « 8 recettes sur 62 » de l'autre. La copie vivait de surcroît dans le composant, ce que `AGENTS.md` interdit. `compteurRecettes()` posé dans `recipes.ts`, avec quatre tests dont le pluriel de zéro et de un |
| `/+not-found` | **Défaut** : le « cercle creux » du dessin était un disque **plein**, rempli de blanc sur un fond lavande. Il se lisait comme une tache. Rendu creux, et son pointillé recalculé pour boucler sur la circonférence (2π × 18 = 113,097, dix périodes de 11,3097 ; « 5 7 » tombait à 9,42 période et coupait le dernier tiret) |
| `/recettes/[slug]` | **Même défaut, généralisé** : `Illustration.tsx` prescrivait `divider` pour « ce qui est inerte », dans les sept illustrations. Mesuré : `divider` contraste à **1,07:1** avec le fond en clair. Le bol de l'en-tête et le chemin du 404 étaient des fantômes. Convention changée pour `borderStrong` — 1,90:1 en clair, 2,03:1 en sombre, le seul jeton symétrique entre les deux thèmes |
| **Thème sombre, `/`** | **Défaut majeur : `Hy1`**. Voir ci-dessous |
| Grand écran (1280 px) | Conforme |

#### `Hy1` 🔴 — le thème sombre à moitié appliqué sur téléphone

Capture en sombre : le disque du cadran d'accueil ressort **clair** sur une page sombre, et les
pictogrammes des quatre repères sont indigo foncé sur une carte foncée. Mesure au DOM :
`--t-bg` vaut `#0d0c13` — le CSS est bien en sombre — pendant que le `fill` du disque vaut
`#e7e6f0`, la valeur **claire**. Toutes les couleurs venues de JavaScript étaient dans ce cas.

La cause tient en une variable, isolée en ne faisant varier que la largeur :

| Largeur | `fill` du disque | |
|---|---|---|
| 390 px | `#e7e6f0` | palette claire, faux |
| 430 px | `#e7e6f0` | palette claire, faux |
| 700 px | `#1c1b2a` | palette sombre, juste |
| 1280 px | `#1c1b2a` | palette sombre, juste |

Le seuil est exactement `NAV_BREAKPOINT`. Au-dessus, le navigateur rend un `<nav>` que le pré-rendu
n'a pas : l'hydratation échoue franchement, React jette l'arbre servi, refait tout, et repeint les
couleurs au passage. **En dessous — sur téléphone, la cible principale — l'arbre servi correspond,
l'hydratation réussit, et React 18 ne répare pas les attributs divergents.** Les couleurs cuites au
pré-rendu restaient en place.

**Ce constat corrige la roadmap.** `ROADMAP.md` décrivait la conséquence de l'échec d'hydratation
comme « React jette l'arbre servi et refait tout côté client […] la peinture pré-rendue est
perdue » — un désagrément cosmétique. C'est vrai sur grand écran **seulement**. L'entrée disait donc
l'inverse de la vérité sur le cas qui compte le plus, ce qui la faisait sous-prioriser. Corrigée.

Corrigé par la moitié thème du remède que la roadmap avait déjà écrit : `useHydrate()`, en paire
`.ts` / `.web.ts`. Elle ne coûte rien — la classe CSS était **déjà** posée dans un effet, donc après
le premier rendu ; aligner `usePalette` dessus ne fait que remettre les deux moitiés d'accord.
Vérifié après correction : `#1c1b2a` à 390, 430, 700 et 1280 px, par les deux chemins (préférence
enregistrée, et préférence « système » sur un système sombre), et le clair inchangé.

**La moitié largeur reste ouverte, et c'est un arbitrage, pas un oubli** : la brancher coûte une
peinture en mise en page mobile avant bascule sur grand écran. Le prix est écrit dans la roadmap.

#### Un défaut dans l'audit, encore

L'assertion CI `verifie reglages.html 'Le thème sombre reprend'`, écrite à la cinquième passe,
visait la mauvaise page : l'apparence est sur `/profil`, et ce placement est argumenté dans les
commentaires des **deux** écrans. Une assertion fausse portant sur une règle vraie — elle aurait
fait rougir la CI en accusant le code. C'est la troisième fois de la journée qu'une vérification
que j'ai écrite se révèle fausse avant le code qu'elle vérifie.

### Ce que la sixième passe a appris

Les cinq passes précédentes cherchaient des défauts **là où le code est écrit**. Celle-ci les a
cherchés **là où le produit est vu**, et le rendement a été le plus élevé de toutes : quatre
défauts, dont un majeur et deux invisibles à la lecture du source — parce qu'ils naissent de la
rencontre entre le code et un contexte que le code ne contient pas. Le contraste d'une couleur ne
se lit pas dans `tokens.ts` ; il se calcule contre le fond où elle est posée. L'hydratation ne se
lit nulle part ; elle dépend de la largeur de la fenêtre.

Deux outils ont fait tout le travail et ne coûtent rien : la capture d'écran, et `--dump-dom` avec
une seule variable qu'on fait bouger. Le tableau des quatre largeurs ci-dessus a pris trois
minutes ; c'est lui qui a transformé « les couleurs sont fausses » en une cause exacte, et qui a
montré que l'entrée de roadmap disait l'inverse de la vérité.

### 6 septembre 2026 — septième passe, les quatre écrans de résultats

La sixième passe avait regardé dix écrans. Elle n'avait pas regardé **les quatre écrans de
résultats**, qui sont le produit : `ResultTabs` est leur second niveau, et tout le reste de
l'application y mène. Cinq défauts, dont un de calcul.

| Écran | Résultat |
|---|---|
| `/metabolisme` | **Deux défauts.** Voir `Nb1` et `Ar1` |
| `/alimentation` | **Deux défauts.** Voir `Tr1` et `Gm1` |
| `/poids` | **Un défaut.** Voir `Pr1` |
| `/bouger` | Conforme. Les parts y font bien 100 %, et les 133 / 247 kcal se rapportent tous deux à l'écart de 380 kcal |
| États vides (sans profil) | Conformes : cadran vide, « rien à afficher », et une seule action |

#### `Nb1` 🔴 — la virgule décimale était tronquée en silence

`parseFloat('78,4')` vaut **78**. Pas `NaN`, pas une erreur : soixante-dix-huit — une valeur assez
plausible pour traverser toutes les validations de bornes. `computeMetrics` et `validate` lisaient
le poids, la taille et l'âge avec `parseFloat` brut.

Ce n'est pas une saisie exotique : `NumberField` déclare `keyboardType="decimal-pad"` **et son
commentaire dit pourquoi** — « un poids se saisit avec une virgule, et le pavé `numeric` d'iOS ne
la propose pas ». L'application choisissait donc le clavier qui offre la virgule, puis tronquait le
caractère qu'elle venait d'inviter à taper.

Mesuré sur le profil de démonstration : métabolisme 1 557 au lieu de 1 561, dépense 2 101 au lieu
de 2 107, IMC 24,62 au lieu de 24,74. L'écart est petit ; **le fait que l'écran affiche un poids et
que le calcul en utilise un autre ne l'est pas** — le bandeau de profil rend la chaîne telle que
saisie, « Calculé pour 78,4 kg », pendant que le calcul travaillait sur 78.

Et la règle n'était pas la même partout : `SuiviCard` faisait déjà `.replace(',', '.')` de son
côté. Le même poids valait donc 78,4 dans l'historique des pesées et 78 dans le plan, et
`ProfileProvider` comparait les deux pour dire si le plan était encore d'actualité.

Corrigé par une seule règle, dans `format.ts` — le module qui fait déjà la frontière entre les
nombres et le français, dans l'autre sens. `nombreSaisi()` est employée aux cinq endroits qui
lisaient un décimal écrit par un humain, `quantites.ts` compris. Sept tests, dont la parité entre
le suivi et le calcul.

#### `Ar1` 🟠 — trois parts qui font 110 %

« Fonctionnement du corps 74 % », « Mouvement 26 % », « Digestion 10 % », dans la même colonne,
sous le même titre. Les deux premières partagent le total par construction ; la troisième le
traverse — `calc.ts` le savait et le disait en commentaire, l'écran non.

Pire, le « 10 % » était **écrit en dur dans le JSX** et ne se rapportait pas au même dénominateur
que les deux autres : 10 % de ce qu'on **mange**, contre un pourcentage de ce qu'on **dépense**. Sur
un profil en déficit — le cas nominal de cette application — les deux diffèrent : 173 kcal valent
10 % de l'apport mais 8 % de la dépense.

`digestionPct` calculé sur le même dénominateur, et une phrase qui dit que la digestion est déjà
comprise dans les deux autres postes. Trois tests d'invariant, dont un qui échouerait si la valeur
redevenait 10.

#### `Pr1` 🟠 — la légende du graphique annonçait des poids inventés

« Poids projeté, de 79,9 kg à 73,0 kg », pour quelqu'un qui pèse 78,4 et vise 74,5 — avec
« Cible 74,5 kg » sur la même ligne, qui la contredisait. `loLabel` et `hiLabel` étaient les bornes
de l'**axe vertical**, soit les poids réels élargis de 1,5 kg de chaque côté pour que la courbe ne
colle pas au cadre. Une marge de dessin lue comme une prédiction — et qui annonçait 1,5 kg **sous**
l'objectif choisi. Renommés `departLabel` / `arriveeLabel` et calculés sur les vrais bouts.

#### `Tr1` 🟠 — trois explications coupées en plein mot

« pour garder vos mus… », « pour les hormones et les… », « le carburant de la jour… ». Un
`numberOfLines={1}` sur une ligne qui porte déjà un pictogramme, un libellé et « 153 g · 612 kcal » :
il ne prévient pas le débordement, **il le garantit**. La plus courte des trois phrases fait
vingt-trois caractères ; les trois étaient toujours tronquées, donc n'apprenaient jamais rien.
Passées sur leur propre ligne.

#### `Gm1` 🟡 — le surtitre du cadran touchait l'arc

Le centre du cadran était borné au **diamètre** intérieur moins une marge — 170 px sur 186. C'est
juste pour le grand chiffre, qui est sur l'axe. Ça ne l'est pas pour ce qui est plus haut :
l'intérieur est un disque, et à 55 px du centre il ne reste que 150 px de corde. « Votre repère
quotidien » tenait sur une ligne dans les 170 autorisés, donc ne passait pas à la ligne, donc
touchait l'arc des deux côtés. Le défaut ne se voyait pas sur `/metabolisme` **par chance** :
« Dépense sur une journée » est assez long pour se replier tout seul.

Borné au plus grand carré inscrit — `diamètre / √2`, soit 131 px — ce qui règle le cas quelle que
soit la longueur du libellé.

#### `Ty1` 🟡 — une flèche qui était un guillemet

`Lire (1 min) ›` employait U+203A, le **guillemet simple français**, comme chevron. Seul caractère-
flèche de l'application : partout ailleurs la flèche est un `Icon`, qui suit la couleur et la
taille du thème. Et le caractère entrait en collision avec les « » que toute la copie emploie comme
vrais guillemets. Remplacé par `flecheDroite`.

### Ce que la septième passe a appris

**Les quatre écrans de résultats sont le produit, et ils étaient les derniers regardés.** Le
balayage avait commencé par les pages de contenu — plus faciles à atteindre sans état — et les
écrans qui demandent un profil amorcé sont restés pour la fin. C'est l'ordre inverse de l'enjeu.

Trois des cinq défauts sont **des nombres justes présentés faux** : 110 % de parts, une marge de
dessin annoncée comme prédiction, un pourcentage sur un autre dénominateur que ses voisins. Aucun
n'est un bug de calcul — `calc.ts` avait raison à chaque fois, et le commentaire de
`energyBreakdown` disait même explicitement ce que l'écran contredisait. **La frontière entre le
métier juste et l'écran faux n'est vérifiée par rien**, et c'est là que cette passe a tout trouvé.

Le quatrième, `Nb1`, est le seul vrai défaut de calcul de tout l'audit — et il vient du même
endroit : une convention d'interface (le clavier à virgule) que le métier ignorait. Le
commentaire qui justifie le clavier et le code qui tronque la virgule sont à deux modules l'un de
l'autre, tous deux écrits ici, et aucun test ne les faisait se rencontrer.

### 6 septembre 2026 — huitième passe, vérifier les affirmations du dépôt

Les sept passes précédentes cherchaient des défauts. Celle-ci part de l'autre bout : **le dépôt
affirme des choses**, dans ses commentaires et jusque dans sa copie visible, et une affirmation
qu'on ne vérifie pas finit par devenir fausse. C'est écrit dans `AGENTS.md` — « un commentaire qui
affirme n'est vérifié par personne, et il survit à ce qu'il décrit ».

| Affirmation | Où | Vérifiée ? |
|---|---|---|
| « les contrastes ont été repris un par un » | `ApparenceCard`, **affiché à l'utilisateur** | ✅ Le plus faible rapport texte/fond est 4,91:1, au-dessus du seuil AA. Dix rôles de texte × six fonds, dans les deux thèmes |
| « `primary` / `gaugeTrack` est calculé pour cela, dans les deux thèmes » | `tokens.ts:17` | ✅ 5,99:1 en clair, 6,45:1 en sombre — et symétrique, ce que « dans les deux thèmes » promettait |
| `primaryTint` reste lisible | implicite | ✅ Composité sur les trois fonds : 5,60 à 8,42 selon le thème |
| « un contenu replié se cache avec `display: 'none'`, jamais par un rendu conditionnel » | `AGENTS.md` | ✅ Les six mécanismes de repli du dépôt le font — `Repliable`, `Fiche`, `SousOnglets`, `SuiviCard` (deux panneaux), `DonneesCard`, `RappelsCard` |
| « Lire (1 min) » | `EncartCours` | ✅ Honnête : les seize notions font de 25 à 101 mots, soit 8 à 30 secondes. La promesse majore |
| Aucun autre nombre affiché n'est écrit en dur | — | ✅ Balayage des pourcentages puis des unités dans le JSX : le « 10 % » de la septième passe était le seul |
| « Recommencer » | `state.ts`, `store.ts` | ❌ **Le bouton s'appelle « Tout effacer » depuis longtemps.** Voir ci-dessous |

Six affirmations sur sept tiennent. C'est un résultat, et il valait d'être établi plutôt que
supposé — d'autant que la première est **montrée à l'utilisateur** : une application qui se vante
de ses contrastes doit pouvoir le prouver.

#### `Lb1` 🟡 — deux commentaires nommaient un bouton qui a changé de nom

`state.ts` et `store.ts` renvoyaient à un « Recommencer » qui s'appelle « Tout effacer » partout
ailleurs, y compris dans la politique de confidentialité. Corrigés.

Le balayage qui a suivi est le vrai résultat : **180 libellés cités entre guillemets dans des
commentaires**, confrontés un par un au code. Trois faux positifs — « J'ai compris » est une
hypothèse que le commentaire rejette, « Rechercher » est le libellé de la touche entrée d'iOS,
« Réduire les animations » est un réglage système. Aucun autre libellé périmé. La classe est close,
et on sait maintenant qu'elle l'est.

#### `Vr1` ⚖️ — la date de naissance est verrouillée, sans raison écrite, et la sortie coûte cher

Une fois enregistrée, la date de naissance se grise. Le seul moyen de la corriger est
« Tout effacer » — qui efface aussi **toutes les pesées**, délibérément et à juste titre : le bouton
promet d'effacer ce qui vous concerne, et une donnée de santé oubliée dans un coin serait pire.

Donc : **une faute de frappe dans l'année coûte tout l'historique de poids.**

La raison du verrou n'est écrite nulle part. Il est antérieur au monorepo, son commit d'origine ne
le mentionne pas, et le commentaire qui le décrivait nommait un bouton disparu — signe qu'il n'a
pas été relu depuis. Deux atténuations existent, et elles comptent : l'âge calculé s'affiche sous le
champ pendant la saisie, donc une erreur se voit immédiatement ; et la sauvegarde JSON permet de
reprendre ses pesées après l'effacement.

**Non corrigé, et volontairement.** Lever le verrou est une ligne, mais c'est un arbitrage de
produit : le verrou a peut-être une raison que le dépôt a perdue, et la remplacer par ma
supposition serait pire que la consigner. Ce qui est fait : le commentaire dit désormais ce qu'on
sait, ce qu'on ne sait pas, et ce que ça coûte.

### Ce que la huitième passe a appris

**Vérifier une affirmation vraie a autant de valeur que trouver un défaut**, et coûte moins cher.
Sept affirmations, six confirmées chiffres à l'appui, une fausse : le dépôt sait à présent lesquelles
il peut citer. Avant cette passe, les sept avaient exactement le même statut — écrites, jamais
exécutées.

Le seul défaut trouvé est un **nom périmé**, la classe même qu'`AGENTS.md` désigne comme le risque
propre à ce dépôt. Il n'était pas trouvable par la lecture : il fallait extraire les 180 libellés
cités et les confronter au code. Trente lignes de script, une fois — et le résultat n'est pas
seulement « un défaut corrigé », c'est **« il n'y en a pas d'autre »**, ce qu'aucune relecture ne
peut affirmer.

### 6 septembre 2026 — neuvième passe, le contenu

Huit passes sur le code et les écrans. Aucune sur **les soixante-deux recettes**, qui sont pourtant
du contenu de santé et la moitié de ce que le site publie.

Premier constat, et c'est une limite plutôt qu'un défaut : **les calories et les protéines sont
écrites à la main**, recette par recette, sans source dans le dépôt. Rien ici ne peut les
recalculer — il faudrait une base nutritionnelle. C'est consigné comme tel plutôt que passé sous
silence.

Mais chaque recette porte la même information **deux fois** : en données (`preparation`, `cuisson`)
et en toutes lettres dans sa description. Et la carte de l'index affiche les deux côte à côte. Cette
frontière-là se vérifie.

#### `Ct1` 🟠 — huit recettes sur soixante-deux se contredisaient elles-mêmes

| Recette | La description disait | Les données disent |
|---|---|---|
| `boeuf-saute-aux-brocolis` | « Quinze minutes **en tout** » | 15 + 8 = **23** |
| `haricots-blancs-a-la-tomate-et-au-thon` | « **prêt en** vingt minutes » | 8 + 15 = **23** |
| `pates-completes-au-thon-et-au-citron` | « **en** quinze **minutes** » | 5 + 12 = **17** |
| `salade-de-thon-et-haricots-verts` | « à monter **en** quinze **minutes** » | 15 + 10 = **25** |
| `saute-de-porc-aux-champignons` | « **en** vingt **minutes** » | 12 + 15 = **27** |
| `soupe-thai-au-poulet-et-aux-nouilles` | « **prêt en** vingt-cinq minutes » | 15 + 15 = **30** |
| `tartines-au-fromage-blanc-et-saumon-fume` | « en cinq minutes **sans cuisson** » | 5 + **2** = 7 |
| `tofu-saute-aux-legumes-et-au-sesame` | « Vingt minutes **en tout** » | 15 + 10 = **25** |

Les tartines sont le cas le plus net : elles annoncent « sans cuisson » alors que leur **première
étape** est « Faites griller le pain ». Les données ont donc raison, et c'est la prose qui a été
corrigée — d'autant que `preparation` et `cuisson` pilotent le filtre « moins de 30 minutes » et le
JSON-LD livré aux moteurs.

Aucune relecture n'attrape ça : la description et l'en-tête YAML sont à vingt lignes l'une de
l'autre, et il faut poser une addition pour voir la faute.

**Le remède est le test, pas les huit corrections.** `descriptions.test.ts` extrait les annonces de
durée totale — « en tout », « au total », « prêt en N » — et les confronte à `preparation + cuisson`.
Vérifié par injection : une faute délibérée le fait échouer, en nommant la recette et l'écart.

Deux précautions qui font la différence entre un garde-fou et un test vert qui ne garde rien :

— **Il ne teste que les annonces de total.** « saisi une minute par face », « les lentilles corail
  cuisent en quinze minutes » parlent d'un geste ou d'un ingrédient. Sans cette distinction, le test
  crierait sur la moitié du catalogue et finirait désactivé.
— **Il vérifie qu'il trouve encore quelque chose.** Une expression rationnelle qui ne correspond
  plus à rien rend un test vert — le pire des deux mondes. Un second test exige au moins huit
  annonces détectées.

L'unique exception — le dahl, dont la phrase porte sur les lentilles et non sur le plat — est
déclarée avec sa raison, et **la liste d'exceptions est elle-même sous test** : au-delà de trois
entrées, l'échec dit que l'heuristique ne tient plus. Une liste qu'on rallonge sans la lire est un
test désactivé qui n'ose pas dire son nom.

### Ce que la neuvième passe a appris

**Le contenu est du code qui n'a pas de compilateur.** Soixante-deux fichiers Markdown, relus par
la même personne qui les a écrits, dont personne ne vérifiait la cohérence interne — et 13 % se
contredisaient. Le dépôt a un `typecheck` sur quatre périmètres, une CI qui compte les `<h1>` du
HTML livré, un crochet de pré-commit ; il n'avait rien du tout sur ce que l'application **dit**.

Et la faute était structurellement invisible : elle n'apparaît qu'en additionnant deux champs
YAML pour les comparer à un nombre écrit en toutes lettres vingt lignes plus haut. C'est
exactement le genre de vérification qu'une machine fait bien et qu'un lecteur ne fait jamais.

### 6 septembre 2026 — dixième passe, le cours et ce que l'export livre vraiment

La neuvième passe avait confronté les recettes à leurs propres données. Restaient **les seize
notions du cours**, qui expliquent les chiffres des écrans sans que rien ne les relie aux formules
— et l'encart pédagogique s'affiche **sur l'écran même** qui montre le chiffre personnel du lecteur.

#### `Cr1` 🟠 — le cours enseignait un chiffre que le modèle ne produit jamais

La notion « Le métabolisme de base, c'est quoi ? » annonçait « 60 à 70 % de la dépense totale d'une
personne **peu sportive** ». Elle s'affiche dans l'encart de `/metabolisme`, sous un écran qui
indiquait 74 % pour le profil de démonstration.

Le modèle, tous profils confondus :

| Profil | Part du métabolisme de base |
|---|---|
| Travail physique + 7 séances ou plus | **54 %** |
| Assis toute la journée, jamais de sport | **83 %** |

Donc non seulement le chiffre est faux, mais **le sens est inversé** : moins on bouge, plus la part
du métabolisme de base est grande. La notion attribuait la part la plus basse au profil le moins
actif. Le 60-70 % vient de la littérature générale, où il désigne une personne *moyenne* ; le
qualificatif a été attaché au mauvais bout.

Réécrite pour dire l'intervalle réel et le bon sens de variation, et pour renvoyer au chiffre
personnel plutôt que d'en réciter un.

Les quatre autres notions chiffrées **tiennent exactement**, et c'est vérifié désormais :

| Notion | Annonce | Le code |
|---|---|---|
| `les-proteines-d-abord` | 1,8 à 2 g/kg en perte, 1,4 en maintien | `seche` 2 · `recomp` 1,8 · `maintien` 1,4 |
| `lipides-et-glucides` | jamais sous 0,6 g/kg | `calc.ts:164` — `0.6 * refWeight` |
| `refaire-le-calcul` | ~10 kcal par kilo perdu | premier terme de Mifflin : `10 × poids` |
| `pourquoi-une-fourchette` | 10 % de marge | la mention légale de l'écran dit la même chose |

`explainers.test.ts` les épingle au modèle, et vérifie **le sens** en plus des nombres. Testé par
injection : réintroduire « 60 à 70 % » le fait échouer.

Les repères extérieurs — 13 kcal par kilo de muscle, les 150 à 300 minutes de l'OMS, 25 à 30 g de
fibres — ne se dérivent d'aucune formule d'ici. Ils sont justes ; aucun test ne peut le refaire, et
le fichier le dit plutôt que de le laisser croire.

#### `Ex1` 🟠 — la page introuvable était livrée sans titre, et indexable

Découvert en listant ce que l'export contient vraiment, plutôt que ce qu'on croit qu'il contient.
Sur 97 fichiers HTML livrés, **quatre** ne tenaient pas la règle structurelle du dépôt :

| Fichier | |
|---|---|
| `+not-found.html` | `<title>` **vide**, pas de `<h1>`, pas de `<main>`, pas de canonique, **pas de `noindex`** |
| `comprendre/[slug].html` | gabarit non résolu, 23 Ko, vide |
| `recettes/[slug].html` | idem |
| `_sitemap.html` | l'index de développement d'Expo Router |

La page introuvable était **la seule route à n'employer ni `Seo`, ni `Titre`, ni `role="main"`**. Son
titre passait par `Stack.Screen options={{ title }}`, qui nomme un écran de navigation et n'écrit
rien dans le document — la confusion est facile et muette, les deux s'appellent « title ». Résultat :
une page indexable au titre vide, sur la seule adresse qu'un robot finit toujours par visiter.

Corrigée avec `Seo` (titre, description, canonique, `noindex, follow` — la page ne doit pas être
listée, mais son lien vers l'accueil reste un chemin utile), `Titre niveau={1}` et `role="main"`.
`noindex` a été ajouté au contrat partagé `SeoProps`, donc les deux versions plateforme restent
d'accord par le compilateur.

Les trois gabarits ne sont plus livrés : `tools/build-sw.ts` les retire, et la CI vérifie qu'ils ne
reviennent pas.

**Mais le vrai défaut était dans la vérification.** La CI contrôlait la structure sur une liste de
douze pages **écrite à la main**, où la page introuvable ne figurait pas. Elle porte désormais sur
les 94 pages livrées, et exige en plus un `<title>` **non vide** — le cas exact qui passait. Vérifié
par injection.

### Ce que la dixième passe a appris

**Une vérification qui énumère ne protège que ce qu'on a pensé à y mettre.** La liste de douze pages
avait été écrite quand le site en comptait douze ; il en compte 94, et les 82 ajoutées n'ont jamais
été contrôlées. Le défaut n'est pas d'avoir oublié une page, c'est d'avoir écrit une liste là où une
règle était possible — et la règle tenait en un `find`.

C'est la troisième fois que l'audit trouve un défaut **dans son propre dispositif de vérification** :
une assertion visant la mauvaise page (sixième passe), une entrée de roadmap disant l'inverse de la
vérité (sixième passe), et maintenant une liste qui ne couvrait que 13 % de son objet.

### 6 septembre 2026 — onzième passe, les autres listes écrites à la main

La dixième passe s'était terminée sur une phrase : « une vérification qui énumère ne protège que ce
qu'on a pensé à y mettre ». Cette passe l'applique aux **autres** énumérations du dépôt.

#### Trois propriétés vérifiées, aucune ne protégeait rien

La CI vérifiait la **présence** de `rel="canonical"` sur douze pages. Personne ne vérifiait qu'elle
pointe la bonne adresse — or deux pages qui revendiquent la même en font disparaître une des
résultats, **sans erreur et sans alerte**. Mesuré sur les 94 pages livrées :

| Propriété | Résultat |
|---|---|
| Chaque page se canonise elle-même | ✅ 94 / 94, **zéro** fautive |
| Le sitemap correspond aux pages indexables | ✅ 88 = 88, aucune manquante, aucun fantôme |
| Les cinq doublons `(tabs)/` pointent la page propre | ✅ c'est **leur canonique** qui les rend inoffensifs, pas le `Disallow` de `robots.txt` — une page interdite au robot est une page dont il ne peut pas lire la canonique |

Rien à corriger, donc — et c'est justement le moment de le figer. `tools/verifie-export.ts` porte
les trois règles, parce qu'elles comparent des **ensembles**, ce qu'un `grep` ne sait pas faire sans
devenir illisible. Chacune vérifiée par injection : canonique détournée, page retirée du sitemap,
entrée de précache sans page.

#### `Sw1` 🟠 — une section entière manquait au cache hors ligne

`tools/build-sw.ts` énumérait huit pages à précacher, à la main. **`/comprendre` n'y était pas** —
l'une des quatre sections de la barre du bas, et le seul chemin de l'accueil qui n'exige rien du
visiteur. `/confidentialite`, page légale ouverte trois fois par an, y était.

La cause est la même que celle du 404 : la refonte a créé le cours, personne n'est revenu mettre à
jour la liste, et rien ne pouvait le signaler. Le précache est **tolérant à dessein** — une adresse
en échec ne fait pas échouer l'installation — donc l'absence ne coûte que cette page hors ligne, et
ne se voit qu'en coupant le réseau.

La liste se déduit désormais de `SECTIONS.prefixes` : les quatre écrans de résultats, les recettes,
le cours, le profil et ses deux sous-pages. Dix-neuf entrées au lieu de dix-sept ; une section
ajoutée demain entre toute seule. C'est exactement le mécanisme qui fait déjà venir les polices
depuis `build-fonts.ts`, deux lignes plus bas — il existait dans le même fichier, et n'avait pas été
appliqué aux pages.

### Ce que la onzième passe a appris

**Une propriété vraie et non protégée est une régression en attente.** Les trois règles de
référencement tenaient toutes les trois quand je les ai mesurées ; aucune n'aurait résisté à un
changement, et aucune n'aurait fait de bruit en cédant. Le référencement est le seul domaine de ce
projet où une faute ne produit ni exception, ni page cassée, ni test rouge — seulement une courbe
qui baisse trois mois plus tard.

Et la leçon de la dixième passe s'est vérifiée une seconde fois : **la liste écrite à la main dans
`build-sw.ts` avait exactement le même défaut que celle de la CI**, dans le même dépôt, pour la même
raison. Chercher « où d'autre a-t-on énuméré ? » a coûté dix minutes et trouvé une section entière
absente du cache.

### 6 septembre 2026 — douzième passe, l'accessibilité au-delà du contraste

La huitième passe avait mesuré les contrastes et rien d'autre. L'accessibilité est plus large que
ça, et la roadmap désigne elle-même le risque propre à ce dépôt : « `react-native-web` sait rendre
un balisage sémantique, mais seulement là où un rôle le demande — et il **échoue en silence** ».

#### Six catégories mesurées sur les 94 pages livrées

| Contrôle | Matière rencontrée | Résultat |
|---|---|---|
| `<html lang>` | 94 pages | ✅ |
| `<img>` sans `alt` | **0 image** — le site n'en livre aucune | ✅ sans objet |
| `<a>` sans texte discernable | 757 liens | ✅ aucun |
| Champ sans nom accessible | 2 champs | ✅ tous deux nommés |
| Saut de niveau de titre | 94 `<h1>`, 185 `<h2>`, 0 `<h3>` | ✅ aucun saut |
| `<svg>` ni masqué ni nommé | 510 SVG | ⚠️ 8 signalés, **tous faux positifs** |

Les huit signalements sont le SVG intérieur du cadran, dont le parent porte `role="img"` et un
libellé — ce qui rend déjà ses descendants présentationnels. Le contrôle avait tort, pas le code.

**Le décompte de matière est ce qui rend ce tableau lisible.** Un contrôle qui ne rencontre rien
rend « aucun problème » et ne prouve rien : c'est le piège relevé à la neuvième passe, et il vaut
autant pour un audit que pour un test.

#### `Fc1` 🟠 — deux champs sur quatre retiraient l'indication de focus sans la remplacer

`outline: 'none'` supprime la seule chose qui, au clavier, dit où l'on est. Le dépôt le fait à
quatre endroits, et il avait raison de le faire : `NumberField` épaissit sa bordure à la
focalisation, et son commentaire l'explique — « retire le contour par défaut du navigateur, dont la
bordure ci-dessus prend le relais ».

Le motif a été copié deux fois **sans sa contrepartie** :

| Composant | Contour retiré | Remplacement |
|---|---|---|
| `NumberField` | oui | ✅ bordure épaissie |
| `DateField.web` | oui | ✅ bordure épaissie |
| `FiltresRecettes` — recherche | oui | ❌ **aucun** |
| `DonneesCard` — restauration | oui | ❌ **aucun** |

Au clavier, sur `/recettes` et sur `/reglages`, rien n'indiquait que le champ était actif. Les deux
portent désormais le même relais que `NumberField`, avec les mêmes classes.

**Et la règle est devenue exécutable** : tout fichier qui écrit `outline: 'none'` doit aussi porter
un `onFocus` — sans lui, aucune bordure ne peut changer à la focalisation. Vérifié par injection.

#### Une vérification qui n'a rien trouvé, et c'est un résultat

Le formulaire de `/profil` n'est pré-rendu qu'à sa première étape. C'est ce qu'il doit livrer : un
assistant commence au pas 0, et les pas suivants ne sont pas du contenu à indexer mais des états
d'interaction. La règle du dépôt sur le rendu conditionnel vise le contenu replié, pas les étapes
d'un formulaire — la distinction est réelle et le code est du bon côté.

### Ce que la douzième passe a appris

**Un motif juste se copie mal.** Les quatre champs viennent du même geste — retirer un contour laid
et le remplacer par une bordure au ton du thème — et la moitié n'a gardé que la première moitié du
geste. Ce n'est ni une inattention isolée ni un défaut de conception : c'est ce que produit un motif
qui tient en deux morceaux dont **un seul est visible à l'écran**. Le contour retiré se voit tout de
suite ; le relais absent ne se voit qu'à la touche Tab, que personne n'appuie en relisant.

D'où la règle plutôt que les deux corrections. Elle tient en trois lignes de shell et elle dit
exactement ce que le commentaire de `NumberField` disait déjà en français depuis le début — la
différence étant qu'elle, on l'exécute.

### 6 septembre 2026 — treizième passe, le natif

Douze passes, toutes sur le web. L'application iOS et Android est l'autre moitié du produit et
n'avait jamais été regardée — ni construite.

#### Deux vérifications qui ne trouvent rien, et une qui trouve

**Les fichiers `.web` sont-ils typés ?** `tools/` ne l'était par personne — défaut trouvé à la
cinquième passe — et la question se reposait pour les treize variantes web, que `tsc` pourrait
ignorer puisqu'il résout toujours la variante sans suffixe. Testé par injection d'une erreur
délibérée dans `hydrate.web.ts` : **elle est attrapée**. Les deux moitiés sont compilées.

**Le paquet natif se construit-il ?** Oui : 4,8 Mo de bytecode Hermes, en dix-sept secondes, sans
aucun SDK Android.

#### `Pp1` 🟠 — une moitié de paire ne portait pas le contrat qu'on lui prêtait

`ProfileProvider` importe `LECTURE_IMMEDIATE` de `@/lib/store`, et son commentaire d'en-tête
affirme que « la différence est **décidée par le fichier que Metro choisit** selon la plateforme —
pas par un test à l'exécution ».

`store.web.ts` ne l'exportait pas. Sur le web elle valait donc `undefined`.

Le comportement était juste — `undefined` est faux, et faux est ce que le web veut. **Mais par
coïncidence, pas par contrat.** Ce que ça coûtait : renommer le drapeau en `LECTURE_DIFFEREE` pour
en inverser la polarité aurait donné au site la mauvaise branche en silence, sans que TypeScript
bronche, celui-ci résolvant toujours `store.ts`. Et le commentaire affirmait quelque chose de faux —
la classe de défaut qu'`AGENTS.md` désigne comme propre à ce dépôt.

`tools/verifie-paires.ts` compare désormais les noms exportés des treize paires. Vérifié par
injection. Les types, lui, ne les compare pas : quand une paire a un contrat partagé — `SeoProps` —
c'est le compilateur qui tient les deux fichiers ensemble, et ce script ne fait que confirmer.

#### `Nt1` 🟠 — rien ne vérifiait que l'application native compile

La CI construisait le site et rien d'autre. Un import qui n'existe que sur le web, une moitié de
paire absente, une dépendance incompatible : tout cela passait jusqu'à la publication.

`expo export --platform android` produit le paquet JavaScript sans SDK. **Dix-sept secondes pour la
moitié du produit qui n'était pas contrôlée** — c'est ajouté à la CI. Android suffit : le graphe de
modules est le même qu'iOS, et `DateField.tsx` est la seule distinction entre les deux.

### Ce que la treizième passe a appris

**Deux contrôles sur trois n'ont rien trouvé, et c'est ce qui rend le troisième crédible.** L'idée
que `tsc` ignore les fichiers `.web` était plausible — le précédent de `tools/` la rendait même
probable — et elle était fausse. La vérifier a coûté deux minutes ; la supposer aurait produit une
correction inutile dans un audit qui se veut factuel.

Le défaut trouvé, lui, tient en une observation : **`undefined` est faux, et c'est ce qui rendait le
bug invisible**. Le code marchait, les tests passaient, le site se comportait correctement. Seul
l'écart entre ce que le commentaire affirmait et ce que le fichier exportait le trahissait — et cet
écart n'était lisible qu'en comparant deux fichiers que personne n'ouvre ensemble.

### Ce qui reste ouvert, par ordre de coût

**Cette phrase a été écrite deux fois — « la liste des constats corrigeables est épuisée » — et
démentie trois fois**, par la cinquième passe, puis la sixième, puis la septième. Elle ne l'est pas ; elle l'est
*pour la méthode employée jusque-là*. Chaque fois qu'on a changé d'angle — regarder les écrans, puis
faire varier la largeur, puis regarder les écrans qui demandent un profil — de nouveaux défauts
sont sortis, et de plus en plus graves : la septième passe a trouvé le seul vrai défaut de calcul
de tout l'audit. Ce qui suit
est donc la liste de ce qui reste **connu** et non fermé, pas de ce qui reste.

Les quatre entrées ci-dessous ne se ferment pas par du code écrit ici.

| # | Constat | Pourquoi il reste |
|---|---|---|
| B1 🟡 | Aucun test de composant ni de bout en bout | **À ne pas faire**, et c'est dans les anti-recommandations : écrits par le même agent que le code, ils seraient circulaires eux aussi. Le manque se compense par les assertions sur le HTML livré, qui vérifient un artefact et non une intention |
| V5 ⚖️ | `noUncheckedIndexedAccess` | Évalué, mesuré, écarté, décision dans `tsconfig.base.json`. À rouvrir si le dépôt se met à indexer des tableaux dont la taille dépend de données persistées |
| Cp2 ⚖️ | Le plafond iOS de `rappels.ts` | Documenté chiffres à l'appui, non vérifié : cela demande un appareil. `bun test` contrôle que la génération s'arrête à 60, rien de plus |
| Ct2 🟡 | Les calories et protéines des recettes | **Non vérifiable depuis ce dépôt.** Elles sont écrites à la main, recette par recette, sans source : il faudrait une base nutritionnelle pour les recalculer. Les invariants internes sont désormais tenus (`descriptions.test.ts`), les valeurs absolues ne le sont pas |
| Vr1 ⚖️ | Le verrou sur la date de naissance | La raison n'est écrite nulle part et le coût de la sortie est tout l'historique de pesées. Lever le verrou est une ligne ; décider s'il doit l'être est un arbitrage de produit, pas une correction. Ce qui est su, ce qui ne l'est pas et ce que ça coûte sont désormais dans `state.ts` |
| Hy2 ⚖️ | La moitié **largeur** de l'échec d'hydratation | `useWindowDimensions()` vaut 0 sous Node : `useLarge`, `useColumns` et le `<nav>` divergent encore entre le HTML livré et le premier rendu du navigateur. La brancher sur `useHydrate()` coûte une peinture en mise en page mobile avant bascule sur grand écran. **C'est un arbitrage de produit, pas une dette technique** — et le prix est écrit dans `ROADMAP.md` |
| **Gv2 🔴** | **Aucune revue** | **Non corrigeable par du code, et non entamé par six passes.** Toutes les corrections ont été produites par l'agent qui a écrit le code qu'elles corrigent — y compris les quatre qui corrigent l'audit lui-même. C'est la définition du constat |

**`Gv2` est le seul constat critique restant, et c'est le plus important.** Les travaux du jour ont
créé des points de retour ; ils n'ont créé aucune revue. Tout ce qui précède — y compris cet audit,
y compris ses corrections — a été produit par l'agent qui a écrit le code. Faire relire
`packages/core/src/calc.ts`, `suivi.ts` et `training.ts` par un tiers reste la mesure au meilleur
rapport coût/bénéfice, et aucune correction technique ne s'y substitue.
