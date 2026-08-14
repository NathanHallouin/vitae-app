# Fiche Play Store

Textes à recopier dans la Google Play Console. Les longueurs maximales de Google sont indiquées.

## Identité

| Champ | Valeur |
|---|---|
| Titre (30 car. max) | `Métabolisme de base` |
| Nom du package | `fr.metabolismedebase.app` |
| Catégorie | Santé et remise en forme |
| Balises | Calories, Nutrition, Remise en forme |
| Langue par défaut | Français (France) |
| Type | Application, gratuite, sans achat intégré |
| Adresse e-mail | wilhelm.rosental@gmail.com |
| Site web | `https://metabolisme-de-base.fr` |
| Confidentialité | `https://metabolisme-de-base.fr/confidentialite` |

## Description courte (80 car. max)

```
Vos calories, votre IMC et quoi manger. Sans compte, tout reste sur le téléphone.
```

79 caractères.

## Description complète (4000 car. max)

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
• Des rappels pour casser la sédentarité : une invitation discrète à vous lever, à l'intervalle et
sur la plage horaire de votre choix. Silencieux, et programmés sur votre téléphone.

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

L'application ne demande qu'une seule autorisation, l'accès à internet, et uniquement pour ouvrir
une recette sur un site de cuisine quand vous en touchez une. Tout le reste fonctionne hors
connexion.

Ces chiffres sont une estimation, pas un avis médical. En cas de doute — grossesse, allaitement,
maladie chronique, traitement en cours — parlez-en à un médecin ou à un diététicien. L'application
est prévue pour les 15 à 100 ans.
```

## Sécurité des données (Data safety)

Le formulaire le plus long de la console, et le seul dont une réponse fausse fait retirer
l'application. Les réponses exactes ici :

| Question | Réponse |
|---|---|
| L'application collecte-t-elle ou partage-t-elle des données utilisateur ? | **Non** |
| Les données sont-elles chiffrées en transit ? | Sans objet — aucune donnée n'est transmise |
| L'utilisateur peut-il demander la suppression de ses données ? | Sans objet — rien n'est stocké hors de l'appareil |

La distinction que Google fait, et qui autorise le « non » : des données **traitées uniquement sur
l'appareil et jamais transmises** ne sont pas considérées comme collectées. C'est exactement le cas
ici — profil en MMKV, calculs locaux, aucune requête sortante.

Ce qui rendrait cette réponse fausse : ajouter Firebase, un outil d'analyse, un rapport de plantage
distant, ou n'importe quel SDK publicitaire. Si cela arrive un jour, revenir sur ce fichier, sur la
fiche App Store et sur `packages/core/src/legal.ts` dans le même commit.

## Classification du contenu

Questionnaire IARC, à remplir avec la catégorie **Référence, actualités ou éducation**.

Répondre **non** à tout, sauf :

- « L'application fournit-elle des informations sur la santé, la forme ou la nutrition ? » → **oui**

Classement attendu : **PEGI 3 / Tout public**.

## Public cible et contenu

- Tranches d'âge visées : **18 ans et plus** (l'application refuse le calcul en deçà de 15 ans, et
  cocher une tranche enfant déclencherait les obligations « Familles », inutiles ici).
- L'application ne s'adresse pas aux enfants : répondre **non** à « conçue pour les familles ».
- Publicités : **non**.
- Application COVID-19 ou de suivi de contact : **non**.
- Application financière, de santé ou de rencontres : cocher **santé et remise en forme**, et
  préciser qu'elle **ne fournit ni diagnostic, ni traitement, ni suivi médical**.

## Autorisations déclarées

Trois figurent dans le manifeste assemblé :

| Autorisation | Pourquoi |
|---|---|
| `INTERNET` | ouvrir une recette sur un site de cuisine, quand l'utilisateur en touche une |
| `POST_NOTIFICATIONS` | afficher les rappels de mouvement (exigée par Android 13 et au-delà) |
| `RECEIVE_BOOT_COMPLETED` | reprogrammer ces rappels après un redémarrage du téléphone |

Les deux dernières viennent d'`expo-notifications`. **Aucune des trois n'est classée sensible par
Google** : il n'y a donc aucun formulaire de déclaration d'usage à remplir.

Six autres, ajoutées d'office par les modules embarqués, sont explicitement retirées dans
`app.config.ts` (`blockedPermissions`) : caméra, micro, lecture et écriture du stockage externe,
affichage par-dessus les autres applications, vibreur. Aucune n'aurait été utilisée, et
`SYSTEM_ALERT_WINDOW` en particulier aurait demandé une justification auprès de Google.

Le vibreur est refusé sciemment, alors même que les notifications pourraient s'en servir : le
rappel est une invitation, pas une alarme, et quatorze vibrations par jour font désinstaller
l'application le jour même.

**Les rappels ne changent rien à la déclaration de sécurité des données.** Ce sont des
notifications *locales* : programmées sur l'appareil, sans jeton d'envoi, sans serveur et sans
identifiant. Rien n'est transmis, donc la réponse reste « non ». Elle deviendrait fausse avec des
notifications poussées, qui exigent un jeton d'appareil.

## Test fermé obligatoire, si le compte est personnel

Si le compte développeur est ouvert au nom d'une personne physique, Google exige, avant la première
mise en production :

1. un test fermé avec **au moins 12 testeurs inscrits** ;
2. maintenu **14 jours consécutifs** ;
3. puis une demande d'accès à la production, examinée manuellement.

À lancer dès que le compte existe : c'est le délai le plus long de toute la publication, et il ne
peut pas être mené en parallèle du reste puisqu'il dépend du compte.

Le profil `preview` d'EAS produit un APK installable directement, utile pour recruter et faire
essayer avant même que la piste de test fermé ne soit ouverte :

```sh
cd apps/app
bunx eas-cli@latest build --profile preview --platform android
```
