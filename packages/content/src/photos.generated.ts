/* Engendré par tools/build-photos.ts — ne pas modifier à la main. */

import type { PhotoRecette } from './photos';

/** Les largeurs disponibles, dans l'ordre où le `srcset` les propose. */
export const LARGEURS_PHOTO = [400,800,1600] as const;

/** Le rapport de cadrage imposé à toutes les photos. */
export const RAPPORT_PHOTO = 1.500000;

export const PHOTOS: Record<string, PhotoRecette> = {
  "bircher-au-skyr-et-a-la-pomme": {
    "slug": "bircher-au-skyr-et-a-la-pomme",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAADQAQCdASoQAAsAAwBSJbACdADV9AOkgAD8YM4sOLaNcQq24E8TkKA3iGPC25/T/1DodHX2u7d77yP0LahfAAAA"
  },
  "blanc-de-poulet-grille-et-quinoa": {
    "slug": "blanc-de-poulet-grille-et-quinoa",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAADwAQCdASoQAAsAAwBSJQBOgB6RIn0MnCAA/vLaL3Tshm8v8a57ivd1Et1nssRT4jXJpRvePlAAAA=="
  },
  "boeuf-bourguignon-allege": {
    "slug": "boeuf-bourguignon-allege",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAABQAgCdASoQAAsAAwBSJYwCdH8AGZJTqqA09gAA/vTEJri/qw7mHcU/Y49mgs+qDrTLpplV/Ws626R6f+5vuom9wTUyzKUIUbAfpNAA"
  },
  "boeuf-saute-aux-brocolis": {
    "slug": "boeuf-saute-aux-brocolis",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAADwAQCdASoQAAsAAwBSJQBOgBnwNlLu+wAA/veRNkf0/AkXMyVOYTdm9EJMY/SMb3Nl5EXNrKAAAA=="
  },
  "boulettes-de-boeuf-a-la-tomate": {
    "slug": "boulettes-de-boeuf-a-la-tomate",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAADQAQCdASoQAAsAAwBSJbACdACu/AwQwAD+bC+l2MPFLoYyClOpIE/L/o5zFn5DhUxpv9RQ8U+S54/O2UnjdIjEXDyYRvToAAA="
  },
  "boulgour-aux-legumes-et-a-la-feta": {
    "slug": "boulgour-aux-legumes-et-a-la-feta",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAAAQAgCdASoQAAsAAwBSJYwCdAEOet2mL6oAAP7xGY7EVQPuLvCFw49c7lIFvqe1ajno9DpfTEAAAA=="
  },
  "brochettes-de-poulet-marine-au-yaourt": {
    "slug": "brochettes-de-poulet-marine-au-yaourt",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAADQAQCdASoQAAsAAwBSJQBOgCIi3wNpwAD+uEKg5Oixt+8BkByWwEHNgRzg3oEQzT2n0NA1L+gAAA=="
  },
  "cabillaud-au-four-et-tomates-cerises": {
    "slug": "cabillaud-au-four-et-tomates-cerises",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkYAAABXRUJQVlA4IDoAAADwAQCdASoQAAsAAwBSJYwCdADdHO6I2AAA/vUYedN3ryxTH+t2ca3Ul9u5h1a+WLKqKBk3ISuuRAAA"
  },
  "chili-con-carne": {
    "slug": "chili-con-carne",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAACwAQCdASoQAAsAAwBSJYgCdACQQSAAAP7vjVjixN6d8zDXQ45MoNpXBW9G7SLwZtPUKXaZfdGsGWptAAA="
  },
  "chili-vegetarien-aux-haricots-rouges": {
    "slug": "chili-vegetarien-aux-haricots-rouges",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkIAAABXRUJQVlA4IDYAAADwAQCdASoQAAsAAwBSJQBOgCE6P/dXhBAA/jP6YJYpyCOy8rdDTuGox9DJLtYUieSXr1QAAAA="
  },
  "cote-de-porc-et-haricots-verts": {
    "slug": "cote-de-porc-et-haricots-verts",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAADwAQCdASoQAAsAAwBSJYgCdAEfi7XHVgAA/k03webNmcdVba3/Z2wPJZc4+4E0n/YiWwwiBugZbdnUwAA="
  },
  "crevettes-sautees-a-l-ail-et-riz": {
    "slug": "crevettes-sautees-a-l-ail-et-riz",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAAAQAgCdASoQAAsAAwBSJbACdAC4aD6y8SQAAP7qISPgBuEy29x+d5PWBwwufyJq4Z8Fw9A83QAAAA=="
  },
  "curry-de-pois-chiches-et-epinards": {
    "slug": "curry-de-pois-chiches-et-epinards",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRlgAAABXRUJQVlA4IEwAAAAQAgCdASoQAAsAAwBSJbACdAEMxFT9EjGQAP7z70GSz8hKlv23FbwiZYo38MmcR8B3ugRxy2Hrs1vk+N9Zk+mW46gghFF/GqgjwtAA"
  },
  "curry-de-poulet-aux-legumes": {
    "slug": "curry-de-poulet-aux-legumes",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAAAwAgCdASoQAAsAAwBSJaACdH8AFcqux2t/sAD++V2j/ZjjZqPeVmKS3fh7YCZutOBWJi+n5KJ3EwsEwAA="
  },
  "dahl-de-lentilles-corail": {
    "slug": "dahl-de-lentilles-corail",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAADQAQCdASoQAAsAAwBSJagCdADIttyCAAD+x3UhbdrTiaGCFm/VUpMkX0iw2ik/G7BesSTKXSgNlOsxPgAAAA=="
  },
  "emince-de-dinde-aux-poivrons": {
    "slug": "emince-de-dinde-aux-poivrons",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAAAwAgCdASoQAAsAAwBSJbACdLoAAr94KAlbIAD+wgARj4h6g1KSbaJGJwnAYWnv/kTMB5sxSbv5WVA7HRCUAAAA"
  },
  "escalopes-de-dinde-a-la-moutarde": {
    "slug": "escalopes-de-dinde-a-la-moutarde",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAADQAQCdASoQAAsAAwBSJQBOgBkiKTacgAD45J9dUvOMeM9p3HVX3JKxqe4Gw/hKC2hxFOFiA4O3090mPxi49QAA"
  },
  "filet-mignon-de-porc-aux-lentilles": {
    "slug": "filet-mignon-de-porc-aux-lentilles",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAADwAQCdASoQAAsAAwBSJYgCdADCtZyVJAAA/vidTe3fj+JJGWe2isZvv23khbqInID6nHuPoCG0flRrYEuFjd4AAAA="
  },
  "frittata-aux-legumes-et-au-parmesan": {
    "slug": "frittata-aux-legumes-et-au-parmesan",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAADQAQCdASoQAAsAAwBSJbACdADpGxoJ8AD+QLZunXEPkYnp5a5TsXDPcTAN7Cmy0nybEHh3sA5asntGqYAAAA=="
  },
  "fromage-blanc-aux-noix-et-au-miel": {
    "slug": "fromage-blanc-aux-noix-et-au-miel",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkYAAABXRUJQVlA4IDoAAACwAQCdASoQAAsAAwBSJZgCdAEFoQAAAPRy87WNI2bOA3C/T11aWq6mUwIgTtD7C7X2kyflPVotLtAA"
  },
  "galette-de-sarrasin-jambon-et-oeuf": {
    "slug": "galette-de-sarrasin-jambon-et-oeuf",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAADQAQCdASoQAAsAAwBSJQBOgB5QH89NwAD+8sqm35IV//VRQniCXEcHY37NKj4W9yxIeJmaOqAAAA=="
  },
  "gratin-de-brocolis-a-la-ricotta": {
    "slug": "gratin-de-brocolis-a-la-ricotta",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAACwAQCdASoQAAsAAwBSJQBOgBY3uK5gAP3DfiKnoTxI9YKb5HadfE79Xf2GICj9sAaPtYk4JueKGpPLAAA="
  },
  "gratin-de-courgettes-au-fromage-blanc": {
    "slug": "gratin-de-courgettes-au-fromage-blanc",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAAAQAgCdASoQAAsAAwBSJYgCdAEN5FPoMxAAAP7xul7Nshy0HL7jw/48Nk849M4L6vsC5ia1MFmgomvGBXqU9CCVtAAAAA=="
  },
  "haricots-blancs-a-la-tomate-et-au-thon": {
    "slug": "haricots-blancs-a-la-tomate-et-au-thon",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAADQAQCdASoQAAsAAwBSJagCdADu1L8kGAD5SiQXalC4Ew+Ecc1hTJSgA7rSFdAwv19yNfsY2BhnbduquhAAAA=="
  },
  "jambon-braise-et-lentilles-vertes": {
    "slug": "jambon-braise-et-lentilles-vertes",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAADwAQCdASoQAAsAAwBSJYgCdAENhlatMAAA/vERH/WuyOkTxLFYPum/rI/c3oyXd3qiW+QrcTR4gpagg8/0gAAA"
  },
  "maquereau-au-four-et-legumes-racines": {
    "slug": "maquereau-au-four-et-legumes-racines",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAAAwAgCdASoQAAsAAwBSJQBOgCPzT9YVtYJ1AAD+9LZHi0qBkbJW1tjK6qdC1QmGk+hoaNARVRW5g/qegAA="
  },
  "nouilles-sautees-au-tempeh": {
    "slug": "nouilles-sautees-au-tempeh",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRj4AAABXRUJQVlA4IDIAAADwAQCdASoQAAsAAwBSJYwCdAEKQfx2A0AA/odWxmczThDtaSi4Injggfwd0VGDOgAAAA=="
  },
  "oeufs-brouilles-au-fromage-frais": {
    "slug": "oeufs-brouilles-au-fromage-frais",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAADwAQCdASoQAAsAAwBSJZACdH8AC1WPUQAA/uRZFGL2oZNoAtIHmguWL6mTIqWVZ9WKRmlavQiB0NaAAAA="
  },
  "oeufs-cocotte-aux-epinards": {
    "slug": "oeufs-cocotte-aux-epinards",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAADQAQCdASoQAAsAAwBSJQBOgBt9eiPTQADLQHLA5vXkrjmm2aWv0LJxB58LQsSouyopoV+bGwXXiq17AAA="
  },
  "omelette-au-jambon-et-aux-herbes": {
    "slug": "omelette-au-jambon-et-aux-herbes",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkYAAABXRUJQVlA4IDoAAADwAQCdASoQAAsAAwBSJZACdADwxaLUo4AA/vi6dBRLb+Fgi0ifsJgKnNyoVec4cyNV36yYH7wkAAAA"
  },
  "omelette-aux-champignons": {
    "slug": "omelette-aux-champignons",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkIAAABXRUJQVlA4IDYAAADQAQCdASoQAAsAAwBSJYwCdADF62KmAAD+9uL6F0GonSeh9V1qkRgqMjBYb0NxQ1+3RZbxEAA="
  },
  "pain-complet-avocat-et-oeufs-poches": {
    "slug": "pain-complet-avocat-et-oeufs-poches",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAADQAQCdASoQAAsAAwBSJQBOgCGx0CpvgAD+zPIi3TobVgWBI/xrpqjncIC/B/OGZxSZSNdNe7IgAA=="
  },
  "pancakes-a-l-avoine-et-au-fromage-blanc": {
    "slug": "pancakes-a-l-avoine-et-au-fromage-blanc",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAADwAQCdASoQAAsAAwBSJZAC7AB8ctM+OwAA/GQFSu9trN13Ko2zaWoy1XTzcPEd8nvwn1FnhAAAAA=="
  },
  "papillote-de-lieu-noir-aux-poireaux": {
    "slug": "papillote-de-lieu-noir-aux-poireaux",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAACwAQCdASoQAAsAAwBSJagCw7Dcx5hQAP72RWpp9NKSKzr0v8No7R/Ptbv/oTkOD8W5AAAA"
  },
  "pates-completes-au-thon-et-au-citron": {
    "slug": "pates-completes-au-thon-et-au-citron",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAAAQAgCdASoQAAsAAwBSJYwCdADwof8z7Bq8AP75yNZqwC75l4xTTWjzVghlsZVxVl2+WnMH3frTVkTvgaw7/qYSvAAAAA=="
  },
  "pave-de-colin-et-puree-de-pois-casses": {
    "slug": "pave-de-colin-et-puree-de-pois-casses",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAADwAQCdASoQAAsAAwBSJYgCsAC3n2UGu7YA/VPzS6qI84+r/D1/bhZZ9Vvag4+weUQGHIRB3eNM/s0GAAA="
  },
  "poelee-de-chou-et-de-lardons": {
    "slug": "poelee-de-chou-et-de-lardons",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAAAQAgCdASoQAAsAAwBSJZwC7AD0Oqz0++oAAP70vrdguAlQeBkgsEqdo5jYUiSqMZEP4nJqi0AAAA=="
  },
  "poelee-de-halloumi-et-legumes-grilles": {
    "slug": "poelee-de-halloumi-et-legumes-grilles",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAAAQAgCdASoQAAsAAwBSJQBOgB6MGYaVA/lgAP75x194MzLntvXtxp+lw7hA8i848kYKn7oRxMShA3QnAtT0hEJxLiu8AA=="
  },
  "porridge-a-l-avoine-et-au-skyr": {
    "slug": "porridge-a-l-avoine-et-au-skyr",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAAAQAgCdASoQAAsAAwBSJZACdAEe17vC2uIAAP70mAmGNKeY/Qf24GiVvuMLjNybLQWD9sUQ3U34w13O4AA="
  },
  "porridge-au-cacao-et-aux-amandes": {
    "slug": "porridge-au-cacao-et-aux-amandes",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAAAQAgCdASoQAAsAAwBSJYwCdADwhHLCq9AAAP7v8zv0HZpbO+4unEyhgK4cq6Pfl0UtRYAA"
  },
  "poulet-basquaise": {
    "slug": "poulet-basquaise",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAADwAQCdASoQAAsAAwBSJYwCdADw1WKzjAAA/vnIr+JilXgDYgEcdqz7l7a3FNNoCw89u/4Y1tAAAA=="
  },
  "salade-cesar-au-poulet": {
    "slug": "salade-cesar-au-poulet",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAACwAQCdASoQAAsAAwBSJQBOgBh2H5zYAP7ijRbZj7H74jydeB+xLiJR2LOmImktf03jfkAA"
  },
  "salade-de-lentilles-au-chevre-frais": {
    "slug": "salade-de-lentilles-au-chevre-frais",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkYAAABXRUJQVlA4IDoAAADQAQCdASoQAAsAAwBSJYgCdADHEMQqSAD+3ZtaLtIyQJgXT3Udq0joqsc23sCRTBY1bji7/EKoAAAA"
  },
  "salade-de-thon-et-haricots-verts": {
    "slug": "salade-de-thon-et-haricots-verts",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRlIAAABXRUJQVlA4IEYAAADwAQCdASoQAAsAAwBSJQBOgBjPxHTRHYAA/thmbyGI+i+Jl0Hk/C/b/QXvlCROLOYHartqQyrlKs6CgNcZEqXk+jltAAAA"
  },
  "salade-nicoise": {
    "slug": "salade-nicoise",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkIAAABXRUJQVlA4IDYAAAAQAgCdASoQAAsAAwBSJQBOkCYjA1pXWAFwAP71G51UX/d3ygBtC0AF1gbugsdfGwdfZiJ9AAA="
  },
  "saumon-roti-et-legumes-verts": {
    "slug": "saumon-roti-et-legumes-verts",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAACwAQCdASoQAAsAAwBSJbACdADvGAAAAPjFFRdfagRt0ENdITep83AqrH+Z5Jx/8TjzfeA1pAwGPxkbhy6z0NnAAAA="
  },
  "saute-de-porc-aux-champignons": {
    "slug": "saute-de-porc-aux-champignons",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAADQAQCdASoQAAsAAwBSJbACdADz6Z+3+AD+8YYf+4YP80iE3LMYaOYye0e6y/XQF7RiteuqkcHkOvngeO583SQwAAA="
  },
  "shakshuka-du-matin": {
    "slug": "shakshuka-du-matin",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAAAwAgCdASoQAAsAAwBSJYwCdADdHt1QdhDSwAD+ZNWhWD9i7XsqRWgCgA4foWwmiIOSbMAA"
  },
  "skyr-aux-fruits-rouges-et-muesli": {
    "slug": "skyr-aux-fruits-rouges-et-muesli",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAADwAQCdASoQAAsAAwBSJQBOgBuM8FtAaEAA8n9ApLeKB7mQ4KTz8Ydvwq1iHPEw0cUDGZvAbcAAAA=="
  },
  "smoothie-banane-et-beurre-de-cacahuete": {
    "slug": "smoothie-banane-et-beurre-de-cacahuete",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRjYAAABXRUJQVlA4ICoAAABwAQCdASoQAAsAAwBSJZQCdABSgAD9mAICl9afF8OoYyr494AN+BuwAAA="
  },
  "soupe-de-haricots-rouges-et-quinoa": {
    "slug": "soupe-de-haricots-rouges-et-quinoa",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAADwAQCdASoQAAsAAwBSJZACdAD1+1UH+oAA4cIgC589TgPtA5tDihMHU9fMbh0iaczYYndTBYts8gWQAAA="
  },
  "soupe-de-pois-casses-au-jambon": {
    "slug": "soupe-de-pois-casses-au-jambon",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkgAAABXRUJQVlA4IDwAAADQAQCdASoQAAsAAwBSJbACdAEO+trQ9AD+8GnZZ4LzXWlZVpXNh5yz20IDB/82cffZKFtt+Xk5Q/swAAA="
  },
  "soupe-thai-au-poulet-et-aux-nouilles": {
    "slug": "soupe-thai-au-poulet-et-aux-nouilles",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAADwAQCdASoQAAsAAwBSJbACdAEOo3IwZAAA/u7ynlJIKJy5EEM49OMy1O28qBS6EGbZ/aA24/fcd0SiTa6fAAAA"
  },
  "steak-hache-et-puree-de-brocolis": {
    "slug": "steak-hache-et-puree-de-brocolis",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoQAAsAAwBSJZwAAueH8LXNpAAA/vnE7TJhUcpKYP/PBw0hK2JJUpSxhN7vsQAA"
  },
  "tartare-de-boeuf-et-salade-verte": {
    "slug": "tartare-de-boeuf-et-salade-verte",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkYAAABXRUJQVlA4IDoAAADwAQCdASoQAAsAAwBSJQBOgCHw1hItztAA/vPr0CXW+/hfKvajI1vQqGLLKFxoOiSfVAHQEebwQAAA"
  },
  "tartines-au-fromage-blanc-et-saumon-fume": {
    "slug": "tartines-au-fromage-blanc-et-saumon-fume",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkYAAABXRUJQVlA4IDoAAAAQAgCdASoQAAsAAwBSJZgCdAEO1LcVaFwAAP7qdymW6p+xUjW0qH67gLjuOQUX5tlG9Sc3S5apg7AA"
  },
  "thon-mi-cuit-et-haricots-blancs": {
    "slug": "thon-mi-cuit-et-haricots-blancs",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAADwAQCdASoQAAsAAwBSJYgCdACyuQntRTAA/vXxhDk7cCYL/Xi/RLu9TrLwWCOrdgXCZsbErNVlAtvCLSpgAA=="
  },
  "tofu-brouille-aux-legumes": {
    "slug": "tofu-brouille-aux-legumes",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADQAQCdASoQAAsAAwBSJaACdACmvAuEAAD+vfBuwYIaCVNuOESfE79wXIxjXwLRIyDTkgAA"
  },
  "tofu-marine-au-four-et-patate-douce": {
    "slug": "tofu-marine-au-four-et-patate-douce",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRk4AAABXRUJQVlA4IEIAAAAwAgCdASoQAAsAAwBSJbACdLoAAhssXlGUgAD+akbKVChnzqviKFzQZaHUQqBA5A5/xZ0O0kOPA5kuXwl0YjuoAAA="
  },
  "tofu-saute-aux-legumes-et-au-sesame": {
    "slug": "tofu-saute-aux-legumes-et-au-sesame",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkoAAABXRUJQVlA4ID4AAADwAQCdASoQAAsAAwBSJaACdAD0iZj5iFgA/tIl6LV+HWlBwafX9FkZmUdOINlbcpmh7br+QuLMy3fxZScAAA=="
  },
  "tortilla-de-pommes-de-terre": {
    "slug": "tortilla-de-pommes-de-terre",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkQAAABXRUJQVlA4IDgAAADwAQCdASoQAAsAAwBSJbACdLoAAkLEJAAA/kM4RFwwDwJ2Xek4oz2vhjfX9as9Q6oMfamCSMdAAA=="
  },
  "yaourt-grec-et-granola-maison": {
    "slug": "yaourt-grec-et-granola-maison",
    "largeur": 1600,
    "hauteur": 1067,
    "apercu": "data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAADwAQCdASoQAAsAAwBSJQBOgBtt5iZlMQAA+/GioJebEgB6JrxwXQk6FL/ov25GorWJETrhS9j1f2xYfWczYQAA"
  }
};
