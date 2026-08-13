# Fiche App Store

Textes à recopier dans App Store Connect. Les longueurs maximales d'Apple sont indiquées ; celles
proposées ici les respectent.

## Identité

| Champ | Valeur |
|---|---|
| Nom (30 car. max) | `Métabolisme de base` |
| Sous-titre (30 car. max) | `Vos calories, sans compte` |
| Bundle ID | `fr.metabolismedebase.app` |
| Catégorie principale | Forme et santé |
| Catégorie secondaire | Alimentation et gastronomie |
| Langue principale | Français (France) |
| Prix | Gratuit, aucun achat intégré |

## Texte promotionnel (170 car. max, modifiable sans nouvelle version)

```
Quatre questions, une minute, et vous savez ce que votre corps dépense et combien manger. Rien à
créer, rien à envoyer : tout reste sur votre téléphone.
```

## Description (4000 car. max)

```
Savoir ce que votre corps dépense, c'est le point de départ de tout le reste : perdre du gras,
prendre du muscle, ou simplement rester stable.

Métabolisme de base répond à quatre questions — votre sexe, votre date de naissance, vos mesures,
votre objectif — et calcule le reste. En une minute, sans compte à créer.


CE QUE VOUS OBTENEZ

• Votre métabolisme de base et votre dépense sur une journée complète, avec le détail de ce qui la
  compose : le simple fait d'être en vie, le mouvement, la digestion.
• Votre IMC, situé sur une échelle lisible, avec ce qu'il dit — et ce qu'il ne dit pas.
• Combien manger chaque jour selon votre objectif, sous forme de fourchette plutôt que de chiffre
  précis, parce qu'une dépense réelle varie d'un jour à l'autre.
• La répartition en protéines, lipides et glucides, avec la raison de chaque repère.
• Le poids que vous pourriez viser, en combien de temps, et ce que la courbe ne montre pas :
  paliers, variations d'eau, ralentissements.
• Un programme d'entraînement sans matériel, calculé pour votre âge, votre poids et votre objectif.
• Des recettes avec leurs calories et leurs protéines, et un mode cuisine : quantités ajustées au
  nombre de convives, ingrédients et étapes à cocher, écran qui reste allumé.


CE QUI LA DISTINGUE

Elle explique. Chaque chiffre est accompagné de ce qu'il signifie et de la formule qui le produit —
Mifflin-St Jeor pour le métabolisme, un facteur d'activité qui distingue le mouvement du quotidien
des séances de sport. Vous ne repartez pas seulement avec un nombre.

Elle ne confond pas bouger et faire du sport. Marcher, monter un escalier, rester debout : c'est ce
qui creuse le plus grand écart entre deux personnes du même gabarit, et ça ne demande aucune
récupération. L'application le calcule séparément.

Elle est franche sur ses limites. Ces chiffres sont des estimations : la dépense réelle varie
d'environ 10 % d'une personne à l'autre. L'application le dit là où c'est utile.


VOS DONNÉES NE SORTENT PAS DE VOTRE TÉLÉPHONE

Il n'y a ni compte, ni serveur, ni base de données. Vos réponses sont enregistrées sur votre
appareil et nulle part ailleurs. Aucun traceur, aucune publicité, aucune mesure d'audience. Le
bouton « Tout effacer » supprime tout, immédiatement.

L'application fonctionne entièrement hors connexion. Elle n'ouvre le réseau que si vous touchez une
suggestion de recette, qui renvoie vers un site de cuisine.


Ces chiffres sont une estimation, pas un avis médical. En cas de doute — grossesse, allaitement,
maladie chronique, traitement en cours — parlez-en à un médecin ou à un diététicien. L'application
est prévue pour les 15 à 100 ans.
```

## Mots-clés (100 car. max, séparés par des virgules, sans espaces)

```
métabolisme,calories,imc,tdee,bmr,déficit,protéines,macros,poids,minceur,nutrition,musculation
```

98 caractères. Ne pas répéter les mots du titre : Apple les indexe déjà.

## URL

| Champ | Valeur |
|---|---|
| Assistance | `https://metabolisme-de-base.fr` |
| Marketing | `https://metabolisme-de-base.fr` |
| Confidentialité | `https://metabolisme-de-base.fr/confidentialite` |

## Classification par âge

Répondre **Aucun / Non** à tout, avec une exception :

- « Thèmes médicaux ou de traitement » → **Peu fréquent / modéré**. L'application donne des repères
  caloriques et un programme d'entraînement ; le nier serait faux, et Apple recalibre lui-même
  après examen.

Classement attendu : **4+**. Ne pas cocher « contenu sur la perte de poids » sous une forme qui
suggérerait un régime prescrit : l'application donne des repères, pas des prescriptions.

## Confidentialité (Privacy Nutrition Labels)

Dans App Store Connect, section « Confidentialité de l'app » :

> **Non, nous ne collectons pas de données de cette app.**

C'est la seule réponse exacte, et elle est défendable : aucun SDK tiers, aucun réseau sortant, une
seule permission Android (`INTERNET`), rien côté iOS. Un examinateur qui inspecte le trafic ne
verra rien partir.

Attention : cette réponse devient fausse le jour où un outil de mesure d'audience est ajouté. Ne
pas l'ajouter sans revenir ici et sur `packages/core/src/legal.ts`.

## Chiffrement

`ITSAppUsesNonExemptEncryption` est à `false` dans `app.config.ts`. Le questionnaire de conformité
à l'exportation ne sera donc pas reposé à chaque envoi.

## Notes pour l'examinateur

```
L'application ne demande aucun compte et ne se connecte à aucun serveur. Tout est calculé sur
l'appareil.

Pour la tester : à l'ouverture, répondez aux quatre questions (sexe, date de naissance, taille et
poids, objectif). Les quatre onglets de résultats se remplissent aussitôt. Les explications de
chaque onglet sont lisibles même sans avoir rien saisi.

L'onglet Recettes fonctionne sans profil.

Aucun identifiant de test n'est nécessaire.
```

## Ce qui fait rejeter, et qui est déjà traité

- **2.1 — application incomplète** : aucun écran vide, aucune fonction annoncée mais absente.
- **4.2 — fonctionnalité minimale** : c'est une application native, pas un site encapsulé. Les
  calculs, la persistance et la navigation sont natifs.
- **5.1.1 — collecte de données** : rien n'est demandé qui ne serve directement au calcul affiché,
  et aucune permission système n'est réclamée.
- **1.4.1 — applications de santé** : l'avertissement « estimation, pas un avis médical » est
  présent sur chaque écran de résultats, pas seulement dans la fiche.
