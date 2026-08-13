/**
 * Les explications de la page « Ce que je mange », rendues côté serveur.
 * Aucune ne dépend du profil : elles se lisent avant d'avoir calculé quoi que ce soit.
 */
export default function AlimentationExplainer() {
  return (
    <section className="card mt-6 p-6">
      <h2 className="mb-4 font-display text-h3 font-semibold">Comprendre ces repères</h2>

      <div className="flex max-w-[72ch] flex-col gap-5 text-base leading-[1.6] text-muted text-pretty">
        <div>
          <h3 className="mb-1 text-option font-medium text-ink">
            Pourquoi une fourchette, et pas un chiffre
          </h3>
          <p>
            Votre dépense réelle varie d’un jour à l’autre, et l’estimation elle-même a une marge
            d’environ 10 %. Viser un nombre précis au gramme donne une fausse impression de contrôle
            et rend le suivi intenable. Tant que la moyenne de la semaine reste dans la fourchette,
            l’objectif est tenu.
          </p>
        </div>

        <div>
          <h3 className="mb-1 text-option font-medium text-ink">Les protéines d’abord</h3>
          <p>
            C’est le macronutriment à ne pas négliger en déficit : sans elles, une partie du poids
            perdu est du muscle, et le métabolisme baisse d’autant. Comptez 1,8 à 2 g par kilo de
            poids de corps en perte de gras, 1,4 g en maintien. Au-delà d’un IMC de 30, le calcul se
            fait sur un poids de référence ajusté plutôt que sur le poids total, sinon la quantité
            devient inutilement élevée.
          </p>
        </div>

        <div>
          <h3 className="mb-1 text-option font-medium text-ink">Lipides et glucides</h3>
          <p>
            Les lipides ne descendent jamais sous 0,6 g par kilo : en dessous, la production
            hormonale et l’absorption des vitamines A, D, E et K finissent par en pâtir. Le reste de
            l’énergie va aux glucides, qui alimentent l’effort et le cerveau. Aucun des deux n’est à
            supprimer.
          </p>
        </div>

        <div>
          <h3 className="mb-1 text-option font-medium text-ink">Le volume compte autant</h3>
          <p>
            À calories égales, un plat riche en légumes et en protéines remplit l’estomac bien plus
            qu’un plat gras ou sucré. C’est ce qui rend un déficit tenable sur plusieurs semaines,
            davantage que la volonté. Visez aussi 25 à 30 g de fibres par jour : ce sont elles qui
            calent le plus longtemps.
          </p>
        </div>
      </div>
    </section>
  );
}
