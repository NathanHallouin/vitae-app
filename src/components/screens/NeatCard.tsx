import { kcal } from '@/lib/format';
import type { NeatPlan } from '@/lib/neat';
import Overline from '../ui/Overline';
import { Bullet } from '../ui/primitives';
import StatTile from '../ui/StatTile';

/**
 * Le mouvement du quotidien, présenté séparément des séances.
 * Volontairement sans séries ni répétitions : ce qui compte ici est la répétition quotidienne,
 * pas la performance. Les kcal affichées sont calculées pour le poids de la personne.
 */
export default function NeatCard({ neat }: { neat: NeatPlan }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="card p-6">
        <Overline className="mb-[10px]">Ce que votre quotidien dépense déjà</Overline>
        <p className="mb-5 max-w-[68ch] text-base leading-[1.6] text-muted text-pretty">
          {neat.lead}
        </p>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
          <StatTile
            label="Mouvement du quotidien"
            value={`${kcal(neat.currentKcal)} kcal`}
            note="par jour, hors séances"
            accent
          />
          {neat.hasHeadroom ? (
            <StatTile
              label="Marge disponible"
              value={`+ ${kcal(neat.headroom)} kcal`}
              note="en passant au cran de mouvement au-dessus"
            />
          ) : null}
        </div>

        <p className="mt-[14px] max-w-[68ch] text-small leading-[1.6] text-muted">{neat.note}</p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-6">
        <div className="card p-6">
          <Overline className="mb-1">Où aller la chercher</Overline>
          <p className="mb-[6px] text-small text-muted">
            Des gestes à répéter tous les jours, y compris les jours de séance. Les calories sont
            estimées pour votre poids actuel.
          </p>
          <ul className="flex flex-col">
            {neat.actions.map((action) => (
              <li
                key={action.label}
                className="flex items-start gap-4 border-t border-divider py-3"
              >
                <div className="flex-1">
                  <p className="mb-[2px] text-option font-medium">{action.label}</p>
                  <p className="text-small leading-[1.5] text-muted">{action.detail}</p>
                </div>
                <span className="flex-none pt-[1px] text-small font-medium whitespace-nowrap text-primary-ink tabular-nums">
                  ≈ {action.kcal} kcal
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-caption leading-[1.6] text-muted2">
            Ces gestes ne demandent aucune récupération : contrairement à une séance, vous pouvez
            les cumuler tous les jours sans jamais avoir à lever le pied.
          </p>
        </div>

        <div className="card p-6">
          <Overline className="mb-1">Vos repères</Overline>
          <p className="mb-[14px] text-small text-muted">
            Adaptés à votre façon de passer vos journées.
          </p>
          <ul className="flex flex-col gap-3">
            {[neat.steps, ...neat.tips].map((tip) => (
              <Bullet key={tip}>{tip}</Bullet>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
