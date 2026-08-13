import type { Explainer as ExplainerData } from '@vitae/core/explainers';

/**
 * La mise en page des explications, commune aux quatre pages de résultats.
 *
 * Le texte, lui, vient de `@vitae/core/explainers` : c'est le même que celui de l'application
 * native, au caractère près, et il n'y a plus qu'un endroit où le corriger.
 *
 * Rendu côté serveur, sans `use client` : ces textes ne dépendent d'aucun chiffre personnel, et
 * c'est justement ce qui les rend lisibles sans profil enregistré — pour un visiteur qui découvre
 * le site comme pour un moteur de recherche, qui ne recevait jusqu'ici que l'en-tête.
 */
export default function Explainer({ data }: { data: ExplainerData }) {
  return (
    <section className="card mt-6 p-6">
      <h2 className="mb-4 font-display text-h3 font-semibold">{data.title}</h2>

      <div className="flex max-w-[72ch] flex-col gap-5 text-base leading-[1.6] text-muted text-pretty">
        {data.items.map((item) => (
          <div key={item.titre}>
            <h3 className="mb-1 text-option font-medium text-ink">{item.titre}</h3>
            <p>{item.texte}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
