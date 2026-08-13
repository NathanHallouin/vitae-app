'use client';

import { buildMacros, proteinBasisNote, rangeBar, rangeCaption, warningText } from '@vitae/core/calc';
import { GOALS } from '@vitae/core/constants';
import { fmtGap, fmtWeekly, kcal } from '@vitae/core/format';
import { useProfile } from '../ProfileProvider';
import CalculPrompt from '../ui/CalculPrompt';
import Icon from '../ui/Icon';
import OptionButton from '../ui/OptionButton';
import Overline from '../ui/Overline';
import StatTile from '../ui/StatTile';
import RecipesCard from './RecipesCard';

/**
 * Les couleurs des macros passent par les variables CSS plutôt que par des valeurs figées : elles
 * servent en style en ligne (largeur de barre calculée), donc une classe Tailwind ne suffirait
 * pas, et elles doivent suivre la bascule de thème.
 */
const MACRO_COLORS = {
  prot: 'var(--t-macro-prot)',
  fat: 'var(--t-macro-fat)',
  carb: 'var(--t-macro-carb)',
};

export default function AlimentationScreen() {
  const { metrics, profile, setGoal } = useProfile();
  if (!metrics || !profile)
    return (
      <CalculPrompt quoi="Combien manger chaque jour selon votre objectif, et comment répartir ces calories." />
    );

  const bar = rangeBar(metrics);
  const warning = warningText(metrics);
  const macros = buildMacros(metrics, MACRO_COLORS);
  const gapAtMin = metrics.min - metrics.tdee;
  const gapAtMax = metrics.max - metrics.tdee;

  return (
    <div>
      <div className="flex flex-col gap-6">
        <div className="card p-6">
          <Overline className="mb-1">Mon objectif</Overline>
          <p className="mb-[14px] text-small text-muted">
            Changez-le quand vous voulez : tous les chiffres du site se recalculent.
          </p>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[10px]">
            {GOALS.map((g) => (
              <OptionButton
                key={g.key}
                selected={profile.goal === g.key}
                onClick={() => setGoal(g.key)}
                className="p-[14px_16px]"
              >
                <p className="text-option font-medium">{g.label}</p>
                <p className="mt-[2px] text-small text-muted">{g.desc}</p>
                <p className="text-caption text-muted">{g.detail}</p>
              </OptionButton>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <Overline>Votre repère quotidien</Overline>
          <div className="mt-[10px] mb-2 flex items-baseline gap-2">
            <span className="font-display text-display leading-none font-semibold tracking-[-.02em] text-primary-ink tabular-nums">
              {kcal(metrics.target)}
            </span>
            <span className="text-option text-muted">kcal par jour</span>
          </div>
          <p className="max-w-[62ch] text-base leading-[1.6] text-muted text-pretty">
            {metrics.goal.note}
          </p>

          <div className="mt-5 border-t border-divider pt-[18px]">
            <Overline className="mb-1">{rangeCaption(metrics.goal.key)}</Overline>
            <p className="mb-4 text-small text-muted">
              Inutile de viser juste : tant que vous restez dans cette fourchette, ça marche.
            </p>

            <div className="relative mb-[10px] h-[10px] rounded-[5px] bg-divider">
              <div
                className="absolute top-0 h-[10px] rounded-[5px] bg-primary-ink opacity-50"
                style={{ left: `${bar.low}%`, width: `${bar.width}%` }}
              />
              {/* Repère de la dépense totale : un trait fin, pour situer la fourchette par rapport
                  à l'équilibre sans laisser croire à une cible précise. */}
              <div
                aria-hidden
                className="absolute -top-[3px] h-4 w-[2px] bg-marker"
                style={{ left: `${bar.tdee}%` }}
              />
            </div>
            <div className="mb-[18px] flex justify-between text-micro text-muted2">
              <span>Ce que vous brûlez au repos</span>
              <span>Ce que vous brûlez en tout</span>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
              <StatTile
                label="Au minimum"
                value={`${kcal(metrics.min)} kcal`}
                note={`${fmtGap(gapAtMin)} par rapport à votre dépense · ${fmtWeekly(gapAtMin)}`}
              />
              <StatTile
                label="Au maximum"
                value={`${kcal(metrics.max)} kcal`}
                note={`${fmtGap(gapAtMax)} par rapport à votre dépense · ${fmtWeekly(gapAtMax)}`}
              />
            </div>

            {warning ? (
              <p className="mt-3 rounded-xl bg-warn-bg p-[12px_14px] text-small leading-[1.55] text-warn-ink text-pretty">
                {warning}
              </p>
            ) : null}
          </div>
        </div>

        <div className="card p-6">
          <Overline className="mb-1">Comment répartir ces calories</Overline>
          <p className="mb-[18px] max-w-[68ch] text-small text-muted">
            Des repères, pas des règles. Le plus important reste le total de la journée.{' '}
            {proteinBasisNote(metrics)}
          </p>
          <div className="flex flex-col gap-4">
            {macros.map((m) => (
              <div key={m.label}>
                <div className="mb-[6px] flex flex-wrap items-baseline justify-between gap-4">
                  <span className="flex items-center gap-2">
                    <span className="flex" style={{ color: m.color }}>
                      <Icon name={m.icon} size={19} />
                    </span>
                    <span className="text-base font-medium">{m.label}</span>
                    <span className="ml-2 text-small text-muted">{m.hint}</span>
                  </span>
                  <span className="text-base text-muted tabular-nums">
                    {m.grams} g · {m.kcal} kcal
                  </span>
                </div>
                <div className="h-[6px] overflow-hidden rounded-[3px] bg-divider">
                  <div
                    className="h-full rounded-[3px]"
                    style={{ width: `${m.pct}%`, backgroundColor: m.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <RecipesCard metrics={metrics} goal={profile.goal} />
      </div>
    </div>
  );
}
