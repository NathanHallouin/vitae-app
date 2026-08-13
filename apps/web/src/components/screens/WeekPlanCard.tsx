import type { WeekPlan } from '@vitae/core/training';
import Overline from '../ui/Overline';
import { Bullet } from '../ui/primitives';

/** Programme hebdomadaire : quoi faire, dans quel ordre, et comment progresser. */
export default function WeekPlanCard({ week }: { week: WeekPlan }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="card p-6">
        <Overline className="mb-1">Votre semaine type</Overline>
        <div className="my-2 flex items-baseline gap-2">
          <span className="font-display text-display leading-none font-semibold text-primary-ink tabular-nums">
            {week.strengthPerWeek}
          </span>
          <span className="text-option text-muted">séances de renforcement par semaine</span>
        </div>
        <p className="max-w-[68ch] text-base leading-[1.6] text-muted text-pretty">{week.note}</p>
        <p className="mt-[10px] text-small text-muted2">Répartition conseillée : {week.schedule}</p>
        <p className="mt-[6px] text-small text-muted2">Échauffement : {week.warmup}</p>
      </div>

      <div className="card p-6">
        <Overline className="mb-1">Pourquoi ce programme-là</Overline>
        <p className="mb-[14px] text-small text-muted">
          Ce que votre profil a changé par rapport au programme de base, et pour quelle raison.
        </p>
        <ul className="flex flex-col">
          {week.adaptations.map((a) => (
            <li key={a.label} className="border-t border-divider py-3">
              <p className="mb-[2px] text-option font-medium text-primary-ink">{a.label}</p>
              <p className="max-w-[72ch] text-small leading-[1.55] text-muted">{a.reason}</p>
            </li>
          ))}
        </ul>
      </div>

      {week.sessions.map((session) => (
        <section key={session.title} className="card p-6">
          <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-stat3 font-semibold leading-[1.3]">{session.title}</h2>
            <span className="text-small text-muted2">
              {session.focus} · {session.duration} · ≈ {session.kcal} kcal
            </span>
          </div>

          {session.exercises.map((ex) => (
            <div key={ex.name} className="border-t border-divider py-[14px]">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <p className="text-option font-medium">{ex.name}</p>
                <span className="text-small font-medium text-primary-ink tabular-nums">
                  {ex.volume} · repos {ex.rest}
                </span>
              </div>
              <p className="mt-1 max-w-[72ch] text-small leading-[1.55] text-muted">{ex.cue}</p>
              <div className="mt-2 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-2">
                <p className="text-caption text-muted2">
                  <span className="font-medium">Trop dur :</span> {ex.easier}
                </p>
                <p className="text-caption text-muted2">
                  <span className="font-medium">Trop facile :</span> {ex.harder}
                </p>
              </div>
            </div>
          ))}
        </section>
      ))}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] items-start gap-6">
        <div className="card p-6">
          <Overline className="mb-3">Progresser sans matériel</Overline>
          <ol className="flex flex-col gap-[10px]">
            {week.progression.map((step, i) => (
              <li key={step} className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="flex size-[22px] flex-none items-center justify-center rounded-full bg-primary-tint text-caption font-bold text-primary-ink"
                >
                  {i + 1}
                </span>
                <span className="text-base leading-[1.55]">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="card p-6">
          <Overline className="mb-3">Le cardio, en complément</Overline>
          <ul className="flex flex-col gap-3">
            {week.cardio.map((line) => (
              <Bullet key={line}>{line}</Bullet>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
