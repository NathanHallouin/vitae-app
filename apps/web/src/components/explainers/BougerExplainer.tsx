/**
 * Les explications de la page « Bouger », rendues côté serveur.
 *
 * Le point de la page — ne pas confondre le mouvement du quotidien et les séances — est justement
 * ce qui se lit sans avoir rien calculé.
 */
export default function BougerExplainer() {
  return (
    <section className="card mt-6 p-6">
      <h2 className="mb-4 font-display text-h3 font-semibold">
        Deux leviers, qu’on confond souvent
      </h2>

      <div className="flex max-w-[72ch] flex-col gap-5 text-base leading-[1.6] text-muted text-pretty">
        <div>
          <h3 className="mb-1 text-option font-medium text-ink">
            Le mouvement du quotidien, ou NEAT
          </h3>
          <p>
            Marcher, monter un escalier, porter des courses, rester debout, s’agiter en parlant :
            tout ce que le corps dépense en dehors des séances. C’est la source de variation la plus
            large entre deux personnes du même gabarit — plusieurs centaines de kilocalories par
            jour. Ce mouvement ne demande aucune récupération : il se cumule tous les jours, sans
            jamais avoir à lever le pied.
          </p>
        </div>

        <div>
          <h3 className="mb-1 text-option font-medium text-ink">Les séances</h3>
          <p>
            Elles ne servent pas d’abord à brûler des calories : une séance de renforcement en
            dépense 150 à 250, soit l’équivalent d’une viennoiserie. Leur rôle est de garder le
            muscle pendant que le poids baisse, ou d’en construire en surplus. Sans elles, une
            partie de ce que vous perdez serait du muscle, et votre métabolisme baisserait d’autant.
          </p>
        </div>

        <div>
          <h3 className="mb-1 text-option font-medium text-ink">
            Pourquoi ne pas tout additionner
          </h3>
          <p>
            Les deux ne se règlent pas de la même façon. Ajouter des séances quand on est déjà très
            actif se paie en fatigue et en baisse de performance, sans creuser l’écart. Augmenter le
            mouvement du quotidien, à l’inverse, se fait sans coût de récupération. Quand le
            quotidien est déjà chargé — un métier physique — l’écart doit venir de l’assiette.
          </p>
        </div>

        <div>
          <h3 className="mb-1 text-option font-medium text-ink">Les repères usuels</h3>
          <p>
            L’OMS recommande 150 à 300 minutes d’activité modérée par semaine et au moins deux
            séances de renforcement musculaire. Côté marche, 7 000 à 8 000 pas par jour suffisent
            pour commencer, 10 000 étant un objectif de confort plutôt qu’un seuil de santé.
          </p>
        </div>
      </div>
    </section>
  );
}
