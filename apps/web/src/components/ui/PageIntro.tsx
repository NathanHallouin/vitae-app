/**
 * Titre de page et phrase d'accroche : de quoi parle cette page, en une ligne.
 *
 * L'illustration est décorative et n'apporte rien au sens : elle disparaît sous `md` plutôt que
 * de rétrécir, pour laisser la largeur au texte sur mobile.
 */
export default function PageIntro({
  title,
  lead,
  illustration,
}: {
  title: string;
  lead: string;
  illustration?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex items-center gap-8">
      <div className="min-w-0 flex-1">
        <h1 className="mb-[6px] font-display text-h2 font-semibold leading-[1.2] tracking-[-.01em]">
          {title}
        </h1>
        <p className="max-w-[62ch] text-body leading-[1.6] text-muted text-pretty">{lead}</p>
      </div>

      {illustration ? (
        <div className="hidden w-[190px] flex-none md:block">{illustration}</div>
      ) : null}
    </div>
  );
}
