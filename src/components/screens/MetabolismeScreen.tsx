'use client';

import { bmiGaugePosition, energyBreakdown } from '@/lib/calc';
import { activityFactor, activityLabel, BMI_BANDS, BMI_GAUGE_LABELS } from '@/lib/constants';
import { dec, fmtFactor, kcal } from '@/lib/format';
import { useProfile } from '../ProfileProvider';
import CalculPrompt from '../ui/CalculPrompt';
import Overline from '../ui/Overline';
import StatTile from '../ui/StatTile';

export default function MetabolismeScreen() {
  const { metrics, profile } = useProfile();
  if (!metrics || !profile)
    return (
      <CalculPrompt quoi="Le calcul de votre métabolisme et de votre dépense sur une journée." />
    );

  const factor = activityFactor(profile.daily, profile.sessions);
  const gauge = bmiGaugePosition(metrics.bmi);
  const energie = energyBreakdown(metrics);

  return (
    <div>
      <div className="flex flex-col gap-6">
        <div className="hero-gradient rounded-[var(--radius-card)] p-6 sm:p-8">
          <Overline onDark>Votre dépense sur une journée</Overline>
          <div className="mt-3 mb-2 flex items-baseline gap-2">
            <p className="font-display text-[46px] leading-none font-semibold tracking-[-.02em] tabular-nums sm:text-hero">
              {kcal(metrics.tdee)}
            </p>
            <span className="text-stat3 opacity-85">kcal par jour</span>
          </div>
          <p className="max-w-[56ch] text-body leading-[1.6] opacity-90">
            Tout compris : le fonctionnement du corps et tout ce que vous faites bouger. Le calcul
            tient compte de «&nbsp;{activityLabel(profile.daily, profile.sessions)}&nbsp;» (×&nbsp;
            {fmtFactor(factor)}). Si vous mangez à peu près cette quantité, votre poids ne bouge
            pas.
          </p>
        </div>

        <div className="card p-6">
          <Overline className="mb-1">D’où vient cette dépense</Overline>
          <p className="mb-4 max-w-[68ch] text-base leading-[1.6] text-muted text-pretty">
            Contrairement à ce qu’on imagine, le sport n’est pas le principal poste de dépense : le
            simple fait d’être en vie représente {energie.bmrPct} % de votre total, soit{' '}
            {kcal(energie.bmr)} kcal par jour.
          </p>

          <div aria-hidden className="mb-[14px] flex h-3 overflow-hidden rounded-[6px]">
            <div className="h-full bg-primary-ink" style={{ width: `${energie.bmrPct}%` }} />
            <div
              className="h-full bg-primary opacity-55"
              style={{ width: `${energie.movementPct}%` }}
            />
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
            <StatTile
              label={`Fonctionnement du corps · ${energie.bmrPct} %`}
              value={`${kcal(energie.bmr)} kcal`}
              note="Cœur, cerveau, respiration, température, renouvellement des cellules."
              accent
            />
            <StatTile
              label={`Mouvement · ${energie.movementPct} %`}
              value={`${kcal(energie.movement)} kcal`}
              note="Sport, mais surtout marche, ménage, escaliers, agitation quotidienne."
            />
            <StatTile
              label="Digestion"
              value={`≈ ${kcal(energie.digestion)} kcal`}
              note="Environ 10 % de ce que vous mangez, déjà compté dans le total ci-dessus."
            />
          </div>
        </div>

        <div className="card p-6">
          <Overline>Votre corpulence (IMC)</Overline>
          <div className="mt-[10px] mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-[10px]">
              <span className="font-display text-stat leading-none font-semibold tabular-nums">
                {dec(metrics.bmi)}
              </span>
              <span className="text-option font-medium">{metrics.band.label}</span>
            </div>
            <span className="text-small text-muted">
              Poids santé pour votre taille : {metrics.healthyMin} – {metrics.healthyMax} kg
            </span>
          </div>

          <div
            role="img"
            aria-label={`IMC ${dec(metrics.bmi)} : ${metrics.band.label}`}
            className="relative flex h-2 gap-[2px]"
          >
            {BMI_BANDS.slice(0, 4).map((b) => (
              <div
                key={b.label}
                className="h-2 flex-1 rounded-[4px] opacity-90"
                style={{ backgroundColor: b.color }}
              />
            ))}
            {/* Curseur : le liseré clair le détache des bandes, quelle que soit celle qu'il touche. */}
            <div
              className="absolute -top-1 h-4 w-1 -translate-x-[2px] rounded-[2px] bg-ink shadow-[0_0_0_2px_var(--t-surface)]"
              style={{ left: `${gauge}%` }}
            />
          </div>
          <div className="mt-[6px] mb-[14px] flex justify-between text-micro text-muted2">
            {BMI_GAUGE_LABELS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
