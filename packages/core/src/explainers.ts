/**
 * Les textes d'explication des quatre écrans de résultats.
 *
 * Ils étaient écrits en JSX, une fois par écran. Les recopier dans l'application native aurait
 * fait huit versions du même propos, à corriger deux par deux : le jour où l'on affine la phrase
 * sur l'IMC, on la corrige d'un côté et on l'oublie de l'autre. Ce sont des données, pas des
 * composants — ils vivent donc ici, et chaque interface se contente de les mettre en page.
 *
 * Aucun de ces textes ne dépend d'un chiffre personnel : c'est ce qui permet aux écrans de rester
 * entiers sans profil enregistré, et au site d'avoir quelque chose à donner à lire à un moteur de
 * recherche.
 */

export interface ExplainerItem {
  titre: string;
  texte: string;
}

export interface Explainer {
  /** titre de la section, en tête de carte */
  title: string;
  items: ExplainerItem[];
}

export const METABOLISME_EXPLAINER: Explainer = {
  title: 'Comprendre ces chiffres',
  items: [
    {
      titre: 'Le métabolisme de base, c’est quoi ?',
      texte:
        'C’est l’énergie que votre corps consomme sans rien faire : faire battre le cœur, respirer, maintenir la température, renouveler les cellules. Même immobile une journée entière, vous en dépensez l’essentiel. Il représente en général 60 à 70 % de la dépense totale d’une personne peu sportive.',
    },
    {
      titre: 'Comment il est calculé ici',
      texte:
        'Par l’équation de Mifflin-St Jeor, la plus fiable des formules courantes sur une population générale : 10 × poids(kg) + 6,25 × taille(cm) − 5 × âge, plus 5 chez l’homme et moins 161 chez la femme. La dépense totale s’obtient en multipliant ce résultat par un facteur d’activité, qui tient compte à la fois du mouvement du quotidien et des séances de sport.',
    },
    {
      titre: 'Ce qui le fait varier',
      texte:
        'Par ordre d’importance : la quantité de muscle — chaque kilo consomme environ 13 kcal par jour au repos, contre 4,5 pour un kilo de graisse —, puis l’âge, le sommeil et le stress. Les « aliments brûle-graisses », eux, ne pèsent rien dans ce calcul. Deux personnes de même poids et de même taille peuvent différer de 200 kcal par jour : c’est pourquoi ces chiffres restent une estimation, à ajuster sur ce que fait réellement votre poids au bout de trois semaines.',
    },
    {
      titre: 'Ce que l’IMC dit, et ne dit pas',
      texte:
        'L’IMC compare simplement votre poids à votre taille. C’est un repère de population, pas un diagnostic : il ne fait pas la différence entre muscle et graisse, et il classe donc en « surpoids » des personnes très musclées qui vont très bien. Il ne dit rien non plus de la répartition des graisses, qui compte davantage pour la santé que le chiffre lui-même.',
    },
  ],
};

export const ALIMENTATION_EXPLAINER: Explainer = {
  title: 'Comprendre ces repères',
  items: [
    {
      titre: 'Pourquoi une fourchette, et pas un chiffre',
      texte:
        'Votre dépense réelle varie d’un jour à l’autre, et l’estimation elle-même a une marge d’environ 10 %. Viser un nombre précis au gramme donne une fausse impression de contrôle et rend le suivi intenable. Tant que la moyenne de la semaine reste dans la fourchette, l’objectif est tenu.',
    },
    {
      titre: 'Les protéines d’abord',
      texte:
        'C’est le macronutriment à ne pas négliger en déficit : sans elles, une partie du poids perdu est du muscle, et le métabolisme baisse d’autant. Comptez 1,8 à 2 g par kilo de poids de corps en perte de gras, 1,4 g en maintien. Au-delà d’un IMC de 30, le calcul se fait sur un poids de référence ajusté plutôt que sur le poids total, sinon la quantité devient inutilement élevée.',
    },
    {
      titre: 'Lipides et glucides',
      texte:
        'Les lipides ne descendent jamais sous 0,6 g par kilo : en dessous, la production hormonale et l’absorption des vitamines A, D, E et K finissent par en pâtir. Le reste de l’énergie va aux glucides, qui alimentent l’effort et le cerveau. Aucun des deux n’est à supprimer.',
    },
    {
      titre: 'Le volume compte autant',
      texte:
        'À calories égales, un plat riche en légumes et en protéines remplit l’estomac bien plus qu’un plat gras ou sucré. C’est ce qui rend un déficit tenable sur plusieurs semaines, davantage que la volonté. Visez aussi 25 à 30 g de fibres par jour : ce sont elles qui calent le plus longtemps.',
    },
  ],
};

export const POIDS_EXPLAINER: Explainer = {
  title: 'À quoi vous attendre en chemin',
  items: [
    {
      titre: 'La balance monte et descend de 1 à 2 kg sans raison',
      texte:
        'Ce sont surtout de l’eau et le contenu du tube digestif : un repas salé, des glucides, les règles, une séance intense. Pesez-vous une fois par semaine dans les mêmes conditions, ou faites la moyenne de plusieurs pesées.',
    },
    {
      titre: 'Les premiers kilos partent vite, puis ça ralentit',
      texte:
        'La première semaine fait souvent perdre plus : c’est l’eau liée aux réserves de glucides. Le rythme réel apparaît à partir de la troisième semaine.',
    },
    {
      titre: 'Un palier de 2 à 3 semaines est normal',
      texte:
        'Le corps s’adapte : vous bougez un peu moins sans vous en rendre compte et vous dépensez un peu moins. Vérifiez d’abord vos portions et vos pas avant de baisser encore les calories.',
    },
    {
      titre: 'Refaites le calcul tous les 4 à 5 kg',
      texte:
        'Vos besoins baissent avec votre poids. Mettre à jour votre poids suffit à recalculer l’ensemble.',
    },
  ],
};

export const BOUGER_EXPLAINER: Explainer = {
  title: 'Deux leviers, qu’on confond souvent',
  items: [
    {
      titre: 'Le mouvement du quotidien, ou NEAT',
      texte:
        'Marcher, monter un escalier, porter des courses, rester debout, s’agiter en parlant : tout ce que le corps dépense en dehors des séances. C’est la source de variation la plus large entre deux personnes du même gabarit — plusieurs centaines de kilocalories par jour. Ce mouvement ne demande aucune récupération : il se cumule tous les jours, sans jamais avoir à lever le pied.',
    },
    {
      titre: 'Les séances',
      texte:
        'Elles ne servent pas d’abord à brûler des calories : une séance de renforcement en dépense 150 à 250, soit l’équivalent d’une viennoiserie. Leur rôle est de garder le muscle pendant que le poids baisse, ou d’en construire en surplus. Sans elles, une partie de ce que vous perdez serait du muscle, et votre métabolisme baisserait d’autant.',
    },
    {
      titre: 'Pourquoi ne pas tout additionner',
      texte:
        'Les deux ne se règlent pas de la même façon. Ajouter des séances quand on est déjà très actif se paie en fatigue et en baisse de performance, sans creuser l’écart. Augmenter le mouvement du quotidien, à l’inverse, se fait sans coût de récupération. Quand le quotidien est déjà chargé — un métier physique — l’écart doit venir de l’assiette.',
    },
    {
      titre: 'Les repères usuels',
      texte:
        'L’OMS recommande 150 à 300 minutes d’activité modérée par semaine et au moins deux séances de renforcement musculaire. Côté marche, 7 000 à 8 000 pas par jour suffisent pour commencer, 10 000 étant un objectif de confort plutôt qu’un seuil de santé.',
    },
  ],
};
