import Icon, { type IconName } from './Icon';

/**
 * Tête de section à l'intérieur d'une page, avec un filet coloré à gauche.
 * Sert à séparer nettement deux registres qu'on confond facilement (ici le mouvement du
 * quotidien et les séances) sans passer par deux pages distinctes.
 */
export default function SectionHeading({
  kicker,
  title,
  lead,
  icon,
}: {
  kicker: string;
  title: string;
  lead: string;
  icon?: IconName;
}) {
  return (
    <div className="mt-4 border-l-[3px] border-primary-ink pl-[18px]">
      <div className="mb-[2px] flex items-center gap-2 text-primary-ink">
        {icon ? <Icon name={icon} size={16} /> : null}
        <div className="text-micro font-semibold uppercase tracking-[.1em] leading-[1.5]">
          {kicker}
        </div>
      </div>
      <h2 className="mb-[6px] font-display text-h3 font-semibold leading-[1.3]">{title}</h2>
      <p className="max-w-[68ch] text-base leading-[1.6] text-muted text-pretty">{lead}</p>
    </div>
  );
}
