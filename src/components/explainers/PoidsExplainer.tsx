/**
 * Ce que la courbe de projection ne montre pas, et qui fait abandonner quand on ne s'y attend pas.
 *
 * Rendu côté serveur : ces quatre points ne dépendent d'aucun chiffre personnel et valent d'être
 * lus avant même d'avoir calculé quoi que ce soit.
 */
export default function PoidsExplainer() {
  return (
    <section className="card mt-6 p-6">
      <h2 className="mb-4 font-display text-h3 font-semibold">À quoi vous attendre en chemin</h2>
      <div className="flex flex-col gap-4">
        {ATTENTES.map((item) => (
          <div key={item.titre}>
            <h3 className="mb-[2px] text-option font-medium">{item.titre}</h3>
            <p className="max-w-[72ch] text-base leading-[1.55] text-muted text-pretty">
              {item.texte}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Ce que la courbe ne montre pas, et qui fait abandonner quand on ne s'y attend pas. */
const ATTENTES = [
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
      'Vos besoins baissent avec votre poids. Mettre à jour votre poids sur cette page suffit à recalculer l’ensemble.',
  },
];
