/**
 * Les explications de la page « Mon métabolisme », rendues côté serveur.
 *
 * Elles ne dépendent d'aucun chiffre personnel : les sortir du composant client, c'est les rendre
 * lisibles sans profil enregistré — pour un visiteur qui découvre le site comme pour un moteur de
 * recherche, qui ne recevait jusqu'ici que l'en-tête.
 */
export default function MetabolismeExplainer() {
  return (
    <section className="card mt-6 p-6">
      <h2 className="mb-4 font-display text-h3 font-semibold">Comprendre ces chiffres</h2>

      <div className="flex max-w-[72ch] flex-col gap-5 text-base leading-[1.6] text-muted text-pretty">
        <div>
          <h3 className="mb-1 text-option font-medium text-ink">
            Le métabolisme de base, c’est quoi&nbsp;?
          </h3>
          <p>
            C’est l’énergie que votre corps consomme sans rien faire : faire battre le cœur,
            respirer, maintenir la température, renouveler les cellules. Même immobile une journée
            entière, vous en dépensez l’essentiel. Il représente en général 60 à 70 % de la dépense
            totale d’une personne peu sportive.
          </p>
        </div>

        <div>
          <h3 className="mb-1 text-option font-medium text-ink">Comment il est calculé ici</h3>
          <p>
            Par l’équation de Mifflin-St Jeor, la plus fiable des formules courantes sur une
            population générale : <em>10 × poids(kg) + 6,25 × taille(cm) − 5 × âge</em>, plus 5 chez
            l’homme et moins 161 chez la femme. La dépense totale s’obtient en multipliant ce
            résultat par un facteur d’activité, qui tient compte à la fois du mouvement du quotidien
            et des séances de sport.
          </p>
        </div>

        <div>
          <h3 className="mb-1 text-option font-medium text-ink">Ce qui le fait varier</h3>
          <p>
            Par ordre d’importance : la quantité de muscle — chaque kilo consomme environ 13 kcal
            par jour au repos, contre 4,5 pour un kilo de graisse —, puis l’âge, le sommeil et le
            stress. Les «&nbsp;aliments brûle-graisses&nbsp;», eux, ne pèsent rien dans ce calcul.
            Deux personnes de même poids et de même taille peuvent différer de 200 kcal par jour :
            c’est pourquoi ces chiffres restent une estimation, à ajuster sur ce que fait réellement
            votre poids au bout de trois semaines.
          </p>
        </div>

        <div>
          <h3 className="mb-1 text-option font-medium text-ink">Ce que l’IMC dit, et ne dit pas</h3>
          <p>
            L’IMC compare simplement votre poids à votre taille. C’est un repère de population, pas
            un diagnostic : il ne fait pas la différence entre muscle et graisse, et il classe donc
            en «&nbsp;surpoids&nbsp;» des personnes très musclées qui vont très bien. Il ne dit rien
            non plus de la répartition des graisses, qui compte davantage pour la santé que le
            chiffre lui-même.
          </p>
        </div>
      </div>
    </section>
  );
}
