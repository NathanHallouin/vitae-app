# Audit technique — vitae-app

**Date :** 6 septembre 2026 · **Périmètre :** le code produit **et** le dispositif qui le produit
· **Révision auditée :** `d1257eb` + arbre de travail non commité (76 fichiers modifiés, 17 non suivis)

> **Mise à jour du 6 septembre.** Deux passes de travaux : les cinq corrections prioritaires, puis
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
| Sg1 | 🟠 | Duplication de **source de vérité** — voir S2 | `tokens.ts` / `tailwind.config.js` |
| Sg2 | 🟠 | Dépendance déclarée sans usage réel — voir S3 | `expo-linear-gradient` |
| Sg3 | 🟠 | **Ternaire aplati par une édition non ciblée.** Un `sed` global `font-sans-semibold → font-sans-medium` a rendu les deux branches identiques : la distinction actif/inactif que le ternaire portait a disparu sans que rien ne le signale | `apps/app/src/components/ui/SousOnglets.tsx:87-90` |
| Sg4 | ✅ | **Résolu, et le constat corrigé.** L'audit annonçait « 41 exports orphelins ». Le chiffre confondait *non nommé ailleurs* et *inatteignable* : la plupart sont des **types** qui n'apparaissent que dans des signatures exportées — `WeightTarget` dans `Projection`, `Session` dans `WeekPlan` — et les retirer les rendrait innommables par un consommateur, ce qui est une régression et non un nettoyage. Les vrais orphelins étaient **14 valeurs** | 13 `export` retirés (fonctions et clés internes à leur module), `FROM_NAV` supprimé — vestige de l'ère Next.js, référencé nulle part, pas même dans son propre fichier |
| Sg5 | 🟡 | **Sur-ingénierie : six mécanismes de divulgation distincts** pour un seul besoin (montrer/cacher). Chacun se défend isolément ; ensemble ils imposent six conventions à apprendre | `Repliable` · `Fiche`/`Fiche.web`/`FicheContenu` · `SousOnglets` · `EncartCours` · `SuiviCard` (prop `vue`) · `FiltresRecettes` |

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
| Gv3 | 🟠 | **Aucun point de validation obligatoire** avant changement de format persisté. `storage.ts` a un champ `v` et une lecture tolérante — bon design — mais rien n'impose une relecture humaine quand `PROFILE_VERSION` change | `packages/core/src/storage.ts:19` |
| — | 💭 | **Taux de retouche : non mesurable.** 35 commits sur 5 jours, fenêtre trop courte pour distinguer réécriture et itération normale. Signal disponible seulement : `4c91800` (−419 l.) et `8dac797` (−4 383 l.) suggèrent des cycles génération → suppression par grandes passes | — |

### Axe 8 — Dette de compréhension · **Écart mineur**

Contre-intuitivement, un point fort : les modules critiques sont documentés au niveau de la
**décision**, et le README rejoue les formules. Un humain reprenant le projet sans l'outil pourrait
le maintenir.

| # | Gr. | Constat | Référence |
|---|---|---|---|
| Cp1 | 🟡 | Zone opaque : la composition du programme d'entraînement. Testée, mais les tests décrivent des invariants, pas la logique. Personne ne peut expliquer *pourquoi cet exercice-là* sans tout relire | `packages/core/src/training.ts` (~700 l.) |
| Cp2 | 🟡 | Zone opaque : le raisonnement sur le plafond iOS de 64 notifications n'est vérifiable que sur appareil | `packages/core/src/rappels.ts` |

**Dépendance à un fournisseur d'outillage : faible.** `AGENTS.md` est un format ouvert lisible par
n'importe quel agent. Le seul couplage est `.claude/settings.local.json`, qui n'est nécessaire ni
pour construire, ni pour tester.

### Axe 9 — Sécurité propre au dispositif · **Écart mineur**

| # | Gr. | Constat | Référence |
|---|---|---|---|
| Sc1 | 🟡 | **Frontière de confiance franchie.** Un paquet de passation fourni par un tiers (6 fichiers HTML + un dossier `code/` de TypeScript) a été lu **et son contenu appliqué comme instruction** : fichiers copiés tels quels dans le dépôt. Le paquet annonçait lui-même que ce code « n'a pas été exécuté ». Il l'a été. Ici l'auteur est l'utilisateur, donc risque nul — mais **le mécanisme est celui d'une injection par document fourni**, et rien ne l'aurait empêché | `design_handoff_vitae_cadran/code/` → `packages/core/src/tokens.ts`, `tools/polices.ts`, `apps/app/tailwind.config.js`, 4 composants |
| Sc2 | 🟡 | **Aucun audit de vulnérabilités** : pas de `bun audit`, pas de Dependabot | `.github/` ne contient que `workflows/` |

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
| 6. Signatures de génération | Écart majeur (**mineur**) | — | 1 | 1 | 2 |
| 7. Revue et gouvernance | **Critique** (**majeur**) | 1 | 1 | — | 1 |
| 8. Dette de compréhension | Écart mineur | — | — | 2 | — |
| 9. Sécurité du dispositif | Écart mineur | — | — | 2 | — |
| 10. Axes classiques | Écart mineur (**conforme**) | — | — | — | 2 |
| **Total** | | **1** | **2** | **6 + 1 ⚖️** | **21** |

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
| LOC code (hors tests, généré, `dist`) | 17 494 | `find … \| xargs wc -l` |
| LOC tests | 2 633 (12 fichiers) | idem |
| LOC documentation | 1 404 (README 982, ROADMAP 374, AGENTS 47, CLAUDE 1) | `wc -l` |
| Lignes de commentaire dans le code | 2 908 (17 %) | `grep -h "^\s*\*\|^\s*//"` |
| Tests | **275**, 6 945 assertions, **0,15 s** (260 / 6 838 avant) | `bun test packages` |
| Cycle `check + typecheck + test` | **6,8 s** (3,5 s avant — le typecheck couvre désormais quatre périmètres au lieu d'un) | `time (…)` |
| `any` explicite / `@ts-ignore` / `!` | 0 / 0 / 0 | `grep -rn` |
| `any` **implicite** | 0 depuis `V7` ; il y en avait 1, invisible parce que `tools/` n'était typechecké par rien | `tsc --noEmit -p tools` |
| `biome-ignore` | 5, tous justifiés, tous `noArrayIndexKey` | `grep -rn` |
| Exports orphelins | 41 | balayage `export` vs usages |
| Arbre de travail non commité | **0** au terme des travaux (76 fichiers, +3 594 / −1 526 avant) | `git status` |
| Périmètres typechecké | **4** : `packages/core`, `packages/content`, `apps/app`, `tools` (1 avant) | `package.json:typecheck` |
| Entrées d'allowlist | **12** (53 avant) | `.claude/settings.local.json` |
| Crochets git actifs | **1**, avec un chemin protégé (0 avant) | `.githooks/pre-commit` |
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

### Ce qui reste ouvert, par ordre de coût

| # | Constat | Effort estimé | Pourquoi il reste |
|---|---|---|---|
| Sg5 | Six mécanismes de divulgation à ramener à quatre | 1 j | Le seul constat de refonte du lot. Il touche six composants et autant d'écrans ; le faire sans test d'interface — il n'y en a aucun — se vérifierait à l'œil, ce qui est le pire moment pour bouger six choses à la fois |
| B1 | Aucun test de composant ni de bout en bout | 2–3 j | **À ne pas faire maintenant** : voir les anti-recommandations. Ils seraient écrits par le même agent que le code, donc circulaires |
| Cp1, Cp2 | `training.ts` et le plafond iOS de `rappels.ts` restent opaques | — | Ni l'un ni l'autre ne se lève par du code : le premier demande une relecture, le second un appareil |
| Sc2 | Aucun audit de vulnérabilités | 1 h | `bun audit` ou Dependabot. Non fait faute de pouvoir vérifier le résultat depuis cet environnement |
| **Gv2** | **Aucune revue** | — | **Non corrigeable par du code.** Le seul critique restant |

**`Gv2` est le seul constat critique restant, et c'est le plus important.** Les travaux du jour ont
créé des points de retour ; ils n'ont créé aucune revue. Tout ce qui précède — y compris cet audit,
y compris ses corrections — a été produit par l'agent qui a écrit le code. Faire relire
`packages/core/src/calc.ts`, `suivi.ts` et `training.ts` par un tiers reste la mesure au meilleur
rapport coût/bénéfice, et aucune correction technique ne s'y substitue.
