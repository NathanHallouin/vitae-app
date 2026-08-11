'use client';

import { buildProjection, rateAssessment } from '@/lib/calc';
import { dec, fmtKg, fmtWeekly, kcal, monthIn } from '@/lib/format';
import { useProfile } from '../ProfileProvider';
import ProjectionChart from '../result/ProjectionChart';
import CalculPrompt from '../ui/CalculPrompt';
import OptionButton from '../ui/OptionButton';
import Overline from '../ui/Overline';
import { cx } from '../ui/primitives';

export default function PoidsScreen() {
  const { metrics, profile, targetKey, setTargetKey } = useProfile();
  if (!metrics || !profile)
    return <CalculPrompt quoi="Le poids que vous pourriez viser, et en combien de temps." />;

  const projection = buildProjection(metrics, profile.goal, targetKey);
  const cible = `${dec(projection.selected.w)} kg`;
  const rythme = projection.coherent ? rateAssessment(metrics, projection.rate) : null;

  return (
    <div>
      <div className="flex flex-col gap-6">
        <div className="card p-6">
          <Overline className="mb-1">Quel poids viser&nbsp;?</Overline>
          <p className="mb-[14px] text-small text-muted">
            Trois repères calculés pour votre taille. Choisissez celui qui vous parle, rien n’est
            définitif.
          </p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-[10px]">
            {projection.options.map((o) => (
              <OptionButton
                key={o.key}
                selected={o.key === projection.key}
                onClick={() => setTargetKey(o.key)}
                className="p-[14px_16px]"
              >
                <p className="text-stat3 font-medium tabular-nums">{dec(o.w)} kg</p>
                <p className="mt-[2px] text-small text-muted">{o.label}</p>
                <p className="text-caption text-muted">{o.sub}</p>
              </OptionButton>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <Overline className="mb-[14px]">Combien de temps&nbsp;?</Overline>

          {projection.coherent ? (
            <>
              <p className="mb-[18px] max-w-[62ch] text-body leading-[1.6] text-pretty">
                En mangeant {kcal(metrics.target)} kcal par jour, vous atteindriez{' '}
                <strong>{cible}</strong> en environ{' '}
                <strong>
                  {projection.weeks} {projection.weeks > 1 ? 'semaines' : 'semaine'}
                </strong>
                , soit vers {monthIn(projection.weeks)}.
              </p>

              <div className="mb-5 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-5">
                <Stat
                  label="À perdre ou à prendre"
                  value={fmtKg(projection.selected.w - metrics.poids)}
                />
                <Stat label="Rythme" value={fmtWeekly((projection.rate * 7700) / 7)} />
                <Stat
                  label="Durée"
                  value={`${projection.weeks} ${projection.weeks > 1 ? 'semaines' : 'semaine'}`}
                  note={`≈ ${dec(Math.round(projection.months * 10) / 10)} mois`}
                />
                <Stat label="Objectif atteint vers" value={monthIn(projection.weeks)} />
              </div>

              <div className="mb-1 flex items-baseline justify-between text-caption text-muted2">
                <span>
                  Poids projeté, de {projection.hiLabel} à {projection.loLabel}
                </span>
                <span>Cible {cible}</span>
              </div>
              <ProjectionChart projection={projection} targetLabel={cible} />
            </>
          ) : null}

          <p
            className={cx(
              'max-w-[62ch] text-base leading-[1.6] text-muted text-pretty',
              projection.coherent && 'mt-4',
            )}
          >
            {projection.note}
          </p>

          {rythme ? (
            <p
              className={cx(
                'mt-[14px] max-w-[68ch] rounded-xl p-[14px] text-small leading-[1.55] text-pretty',
                rythme.level === 'bon' ? 'bg-surface2 text-ink' : 'bg-warn-bg text-warn-ink',
              )}
            >
              {rythme.text}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div>
      <p className="text-caption text-muted2">{label}</p>
      <p className="text-stat3 font-medium">{value}</p>
      {note ? <p className="text-small text-muted">{note}</p> : null}
    </div>
  );
}
