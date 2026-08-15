# Les photos des recettes

Une photo par recette, **nommée par le slug** de la recette :

```
photos/blanc-de-poulet-grille-et-quinoa.jpg
photos/bircher-au-skyr-et-a-la-pomme.jpg
```

Le slug est celui du fichier Markdown dans `packages/content/recettes/`, et celui de l'adresse de
la fiche. Aucune recette n'a besoin d'être modifiée : le lien se fait par le nom du fichier.

`bun run photos` — ou `bun run generate`, qui l'enchaîne — produit alors trois largeurs en AVIF et
en WebP dans `apps/app/public/photos/`, plus un aperçu flou embarqué dans le paquet.

## Ce qui est attendu d'une photo

- **1600 px de large au minimum.** En dessous de 400, elle est refusée ; entre les deux, seules les
  largeurs disponibles sont produites.
- **Cadrage 3:2 ou plus large.** Le recadrage est automatique et vise la zone la plus contrastée,
  mais il ne peut pas inventer ce qui manque au-dessus et en dessous.
- **N'importe quel format que sharp sait lire**, y compris le HEIC d'un iPhone.
- **Le plat occupe le cadre.** Une assiette perdue au milieu d'une table donne une vignette
  illisible à 400 px de large, qui est la taille à laquelle elle sera vue le plus souvent.

Une recette sans photo garde son illustration. Il est donc normal d'en ajouter sept aujourd'hui et
le reste plus tard : rien ne casse entre-temps.

## Ce que la licence doit permettre

Ces photos partent dans une application publiée sur deux magasins et sur un site. Une photo « libre
pour un usage personnel » ne convient pas. Les sources habituelles qui conviennent : vos propres
photos, ou une banque en CC0 / licence Unsplash / licence Pexels — les mêmes conditions que les
illustrations Open Doodles déjà employées.

Le fichier `CHOIX.md` de ce dossier dit, recette par recette, quelle photo prendre.
