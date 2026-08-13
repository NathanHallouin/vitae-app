'use client';

import { useReducer } from 'react';
import { activityFactor, DAILY, GOALS, SESSIONS, STEP_TITLES } from '@vitae/core/constants';
import { ageFrom, formatBirthDate, formatLongDate, todayISO } from '@vitae/core/date';
import { fmtFactor } from '@vitae/core/format';
import {
  type FormState,
  isLastStep,
  profileFromForm,
  reducer,
  stepFields,
  validate,
} from '@vitae/core/state';
import type { ProfileInput } from '@vitae/core/storage';
import LivePreview from '../LivePreview';
import Icon, { type IconName } from '../ui/Icon';
import OptionButton from '../ui/OptionButton';
import Overline from '../ui/Overline';
import { Button, cx, NumberField, ProgressBar } from '../ui/primitives';

const MEASURES = [
  { field: 'taille', label: 'Taille', unit: 'cm', placeholder: '175' },
  { field: 'poids', label: 'Poids', unit: 'kg', placeholder: '70' },
] as const;

const INPUT_CLASS =
  'w-full rounded-[var(--radius-control)] border border-line bg-surface2 px-[14px] py-[14px] ' +
  'text-input text-ink outline-none hover:border-line-strong focus:border-primary';

export default function ProfilForm({
  initial,
  onSubmit,
  onCancel,
  onReset,
  hasProfile,
}: {
  initial: FormState;
  onSubmit: (profile: ProfileInput) => void;
  onCancel: () => void;
  onReset: () => void;
  hasProfile: boolean;
}) {
  const [form, dispatch] = useReducer(reducer, initial);
  const fields = stepFields(form);
  const isWizard = form.mode === 'wizard';
  const age = ageFrom(form.naissance);

  const kicker = isWizard ? `Question ${form.step + 1} sur 4` : 'Toutes vos informations';
  const title = isWizard
    ? STEP_TITLES[form.step]
    : hasProfile
      ? 'Mes informations'
      : 'Vos informations';
  const nextLabel = isLastStep(form) ? 'Voir mes résultats' : 'Continuer';
  const backLabel = isWizard && form.step > 0 ? 'Retour' : 'Annuler';

  const submit = () => {
    const error = validate(form);
    if (error) return dispatch({ type: 'error', message: error });
    if (!isLastStep(form)) return dispatch({ type: 'next' });
    const profile = profileFromForm(form);
    if (profile) onSubmit(profile);
  };

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Overline className="mb-1">{kicker}</Overline>
          <h1 className="font-display text-h2 font-semibold leading-[1.2] tracking-[-.01em]">
            {title}
          </h1>
        </div>
        <Button onClick={() => dispatch({ type: 'toggleMode' })} className="p-2 text-small">
          {isWizard ? 'Tout saisir d’un coup' : 'Une question à la fois'}
        </Button>
      </div>

      {isWizard ? (
        <div className="mb-6">
          <ProgressBar
            value={((form.step + 1) / 4) * 100}
            label={`Progression : question ${form.step + 1} sur 4`}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-start gap-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="card min-w-0 flex-[1_1_460px] p-6"
        >
          {fields.sex ? (
            <fieldset className="mb-6">
              <legend className="mb-[10px] block text-small font-medium text-muted">
                Vous êtes
              </legend>
              <div className="flex flex-wrap gap-3">
                {(['femme', 'homme'] as const).map((sexe) => (
                  <OptionButton
                    key={sexe}
                    selected={form.sexe === sexe}
                    onClick={() => dispatch({ type: 'setSexe', value: sexe })}
                    className="min-w-[130px] flex-1 p-4 text-option font-medium"
                  >
                    {sexe === 'femme' ? 'Une femme' : 'Un homme'}
                  </OptionButton>
                ))}
              </div>
              <p className="mt-2 text-caption text-muted2">
                Le calcul diffère : à poids et taille égaux, un corps féminin et un corps masculin
                ne consomment pas la même énergie au repos.
              </p>
            </fieldset>
          ) : null}

          {fields.body && form.staleWeight ? (
            <p
              role="status"
              className="mb-5 rounded-xl bg-warn-bg p-[12px_14px] text-small leading-[1.55] text-warn-ink text-pretty"
            >
              Votre dernier poids date du {formatLongDate(form.staleWeight.updatedAt)} (
              {form.staleWeight.previous} kg). Repesez-vous et indiquez votre poids d’aujourd’hui :
              tout le reste en dépend.
            </p>
          ) : null}

          {fields.body ? (
            <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-5">
              <div>
                <FieldLabel htmlFor="field-naissance">Date de naissance</FieldLabel>
                {form.naissanceLocked ? (
                  // Date issue du profil enregistré : lecture seule, et affichée en clair plutôt
                  // qu'en sélecteur de date, pour qu'aucun contrôle natif ne laisse croire
                  // qu'elle est modifiable.
                  <input
                    id="field-naissance"
                    type="text"
                    readOnly
                    aria-label="Date de naissance enregistrée"
                    value={formatBirthDate(form.naissance)}
                    className={cx(INPUT_CLASS, 'cursor-default text-muted')}
                  />
                ) : (
                  <input
                    id="field-naissance"
                    type="date"
                    max={todayISO()}
                    aria-label="Date de naissance"
                    value={form.naissance}
                    onChange={(e) =>
                      dispatch({ type: 'setField', field: 'naissance', value: e.target.value })
                    }
                    className={INPUT_CLASS}
                  />
                )}
                <p className="mt-[6px] text-caption text-muted2">
                  {age === null
                    ? 'Votre âge est calculé tout seul.'
                    : form.naissanceLocked
                      ? `${age} ans · enregistré, « Tout effacer » pour le changer`
                      : `${age} ans aujourd’hui`}
                </p>
              </div>

              {MEASURES.map((m) => (
                <div key={m.field}>
                  <FieldLabel htmlFor={`field-${m.field}`}>{m.label}</FieldLabel>
                  <NumberField
                    id={`field-${m.field}`}
                    unit={m.unit}
                    value={form[m.field]}
                    placeholder={m.placeholder}
                    aria-label={`${m.label} en ${m.unit}`}
                    onChange={(e) =>
                      dispatch({ type: 'setField', field: m.field, value: e.target.value })
                    }
                  />
                </div>
              ))}
            </div>
          ) : null}

          {fields.activity ? (
            <div className="mb-6">
              <div className="mb-6" role="radiogroup" aria-labelledby="label-daily">
                <FieldLabel id="label-daily">Votre quotidien, en dehors du sport&nbsp;?</FieldLabel>
                <div className="flex flex-col gap-2">
                  {DAILY.map((d, i) => (
                    <ChoiceRow
                      key={d.label}
                      selected={form.daily === i}
                      onClick={() => dispatch({ type: 'setDaily', value: i })}
                      icon={d.icon}
                      label={d.label}
                      desc={d.desc}
                      value={`×${fmtFactor(d.base)}`}
                    />
                  ))}
                </div>
              </div>

              <div role="radiogroup" aria-labelledby="label-sessions">
                <FieldLabel id="label-sessions">
                  Du sport, combien de fois par semaine&nbsp;?
                </FieldLabel>
                <div className="flex flex-col gap-2">
                  {SESSIONS.map((sess, i) => (
                    <ChoiceRow
                      key={sess.label}
                      selected={form.sessions === i}
                      onClick={() => dispatch({ type: 'setSessions', value: i })}
                      icon={sess.icon}
                      label={sess.label}
                      desc={sess.desc}
                      value={`+${fmtFactor(sess.add)}`}
                    />
                  ))}
                </div>
              </div>

              <p aria-live="polite" className="mt-3 text-small text-muted tabular-nums">
                Facteur d’activité retenu&nbsp;: ×
                {fmtFactor(activityFactor(form.daily, form.sessions))}
              </p>
            </div>
          ) : null}

          {fields.goal ? (
            <div className="mb-6" role="radiogroup" aria-labelledby="label-goal">
              <FieldLabel id="label-goal">Vous voulez</FieldLabel>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[10px]">
                {GOALS.map((g) => (
                  <OptionButton
                    key={g.key}
                    selected={form.goal === g.key}
                    onClick={() => dispatch({ type: 'setGoal', value: g.key })}
                    className="p-[14px_16px]"
                  >
                    <span
                      className={cx(
                        'mb-[6px] block',
                        form.goal === g.key ? 'text-primary-ink' : 'text-muted2',
                      )}
                    >
                      <Icon name={g.icon} size={22} />
                    </span>
                    <p className="text-option font-medium">{g.label}</p>
                    <p className="mt-[2px] text-small text-muted">{g.desc}</p>
                    <p className="text-caption text-muted">{g.detail}</p>
                  </OptionButton>
                ))}
              </div>
            </div>
          ) : null}

          {form.error ? (
            <p
              role="alert"
              className="mb-5 rounded-xl bg-error-bg p-[12px_16px] text-base text-error-ink"
            >
              {form.error}
            </p>
          ) : null}

          <div className="flex items-center justify-between gap-3 border-t border-divider pt-5">
            <Button
              onClick={() =>
                isWizard && form.step > 0 ? dispatch({ type: 'previous' }) : onCancel()
              }
              className="text-muted hover:bg-surface2"
            >
              {backLabel}
            </Button>
            <button
              type="submit"
              className="inline-flex cursor-pointer items-center justify-center rounded-[var(--radius-control)] border border-transparent bg-primary px-[26px] py-[13px] text-option font-semibold text-hero-text transition-colors hover:bg-primary-dark"
            >
              {nextLabel}
            </button>
          </div>
        </form>

        <LivePreview form={form} age={age} />
      </div>

      {hasProfile ? (
        <div className="mt-6 flex justify-end">
          <Button onClick={onReset} className="text-small text-muted hover:bg-surface2">
            Tout effacer
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function FieldLabel({
  children,
  htmlFor,
  id,
}: {
  children: React.ReactNode;
  htmlFor?: string;
  id?: string;
}) {
  const className = cx(
    'block text-small font-medium text-muted',
    htmlFor ? 'mb-[6px]' : 'mb-[10px]',
  );
  // Un `<label>` sans `for` ne désigne rien : les groupes de boutons passent par un `div` que
  // `aria-labelledby` référence.
  return htmlFor ? (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  ) : (
    <div id={id} className={className}>
      {children}
    </div>
  );
}

/** Ligne d'un choix unique : puce ronde, icône, libellé, précision, et valeur alignée à droite. */
function ChoiceRow({
  selected,
  onClick,
  icon,
  label,
  desc,
  value,
}: {
  selected: boolean;
  onClick: () => void;
  icon: IconName;
  label: string;
  desc: string;
  value: string;
}) {
  return (
    <OptionButton
      selected={selected}
      onClick={onClick}
      className="flex items-center gap-[14px] p-[14px_16px]"
    >
      <span
        aria-hidden
        className={cx(
          'flex size-[18px] flex-none items-center justify-center rounded-full border-2',
          selected ? 'border-primary-ink' : 'border-line-strong',
        )}
      >
        <span
          className={cx('size-[9px] rounded-full', selected ? 'bg-primary-ink' : 'bg-transparent')}
        />
      </span>
      <span className={cx('flex', selected ? 'text-primary-ink' : 'text-muted2')}>
        <Icon name={icon} size={22} />
      </span>
      <span className="flex-1">
        <span className="block text-option font-medium">{label}</span>
        <span className="mt-[2px] block text-small text-muted">{desc}</span>
      </span>
      <span className="text-small text-muted2 tabular-nums">{value}</span>
    </OptionButton>
  );
}
