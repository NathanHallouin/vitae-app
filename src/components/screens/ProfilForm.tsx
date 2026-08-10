'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useReducer } from 'react';
import { ACTIVITIES, GOALS, STEP_TITLES } from '@/lib/constants';
import { ageFrom, formatBirthDate, formatLongDate, todayISO } from '@/lib/date';
import { fmtFactor } from '@/lib/format';
import {
  type FormState,
  isLastStep,
  profileFromForm,
  reducer,
  stepFields,
  validate,
} from '@/lib/state';
import type { ProfileInput } from '@/lib/storage';
import { FS } from '@/theme/theme';
import LivePreview from '../LivePreview';
import OptionButton from '../ui/OptionButton';
import Overline from '../ui/Overline';

const MEASURES = [
  { field: 'taille', label: 'Taille', unit: 'cm', placeholder: '175' },
  { field: 'poids', label: 'Poids', unit: 'kg', placeholder: '70' },
] as const;

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
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: 2,
          mb: '20px',
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Overline sx={{ mb: '4px' }}>{kicker}</Overline>
          <Typography variant="h2" component="h1">
            {title}
          </Typography>
        </Box>
        <Button onClick={() => dispatch({ type: 'toggleMode' })} sx={{ fontSize: FS.small, p: 1 }}>
          {isWizard ? 'Tout saisir d’un coup' : 'Une question à la fois'}
        </Button>
      </Box>

      {isWizard ? (
        <LinearProgress
          variant="determinate"
          value={((form.step + 1) / 4) * 100}
          aria-label={`Progression : question ${form.step + 1} sur 4`}
          sx={{ mb: 3 }}
        />
      ) : null}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'flex-start' }}>
        <Paper
          component="form"
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            submit();
          }}
          sx={{ flex: '1 1 460px', minWidth: 0, p: 3 }}
        >
          {fields.sex ? (
            <Box sx={{ mb: 3 }} role="group" aria-labelledby="label-sexe">
              <FieldLabel id="label-sexe">Vous êtes</FieldLabel>
              <Box sx={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {(['femme', 'homme'] as const).map((sexe) => (
                  <OptionButton
                    key={sexe}
                    selected={form.sexe === sexe}
                    onClick={() => dispatch({ type: 'setSexe', value: sexe })}
                    sx={{ flex: 1, minWidth: 130, p: 2, fontSize: FS.option, fontWeight: 500 }}
                  >
                    {sexe === 'femme' ? 'Une femme' : 'Un homme'}
                  </OptionButton>
                ))}
              </Box>
              <Typography sx={(t) => ({ fontSize: FS.caption, color: t.tokens.muted2, mt: 1 })}>
                Le calcul diffère : à poids et taille égaux, un corps féminin et un corps masculin
                ne consomment pas la même énergie au repos.
              </Typography>
            </Box>
          ) : null}

          {fields.body && form.staleWeight ? (
            <Box
              role="status"
              sx={(t) => ({
                backgroundColor: t.tokens.warnBg,
                color: t.tokens.warnInk,
                borderRadius: 1,
                p: '12px 14px',
                fontSize: FS.small,
                lineHeight: 1.55,
                mb: '20px',
                textWrap: 'pretty',
              })}
            >
              Votre dernier poids date du {formatLongDate(form.staleWeight.updatedAt)} (
              {form.staleWeight.previous} kg). Repesez-vous et indiquez votre poids d’aujourd’hui :
              tout le reste en dépend.
            </Box>
          ) : null}

          {fields.body ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '20px',
                mb: 3,
              }}
            >
              <Box>
                <FieldLabel htmlFor="field-naissance">Date de naissance</FieldLabel>
                {form.naissanceLocked ? (
                  // Date issue du profil enregistré : lecture seule, et affichée en clair plutôt
                  // qu'en sélecteur de date, pour qu'aucun contrôle natif ne laisse croire
                  // qu'elle est modifiable.
                  <TextField
                    id="field-naissance"
                    type="text"
                    fullWidth
                    value={formatBirthDate(form.naissance)}
                    slotProps={{
                      htmlInput: { readOnly: true, 'aria-label': 'Date de naissance enregistrée' },
                    }}
                    sx={(t) => ({
                      '& .MuiOutlinedInput-root': { backgroundColor: t.tokens.surface2 },
                      '& .MuiOutlinedInput-input': { color: t.tokens.muted, cursor: 'default' },
                    })}
                  />
                ) : (
                  <TextField
                    id="field-naissance"
                    type="date"
                    fullWidth
                    value={form.naissance}
                    onChange={(e) =>
                      dispatch({ type: 'setField', field: 'naissance', value: e.target.value })
                    }
                    slotProps={{
                      htmlInput: { max: todayISO(), 'aria-label': 'Date de naissance' },
                    }}
                  />
                )}
                <Typography
                  sx={(t) => ({ fontSize: FS.caption, color: t.tokens.muted2, mt: '6px' })}
                >
                  {age === null
                    ? 'Votre âge est calculé tout seul.'
                    : form.naissanceLocked
                      ? `${age} ans · enregistré, « Tout effacer » pour le changer`
                      : `${age} ans aujourd’hui`}
                </Typography>
              </Box>

              {MEASURES.map((m) => (
                <Box key={m.field}>
                  <FieldLabel htmlFor={`field-${m.field}`}>{m.label}</FieldLabel>
                  <TextField
                    id={`field-${m.field}`}
                    type="number"
                    fullWidth
                    value={form[m.field]}
                    placeholder={m.placeholder}
                    onChange={(e) =>
                      dispatch({ type: 'setField', field: m.field, value: e.target.value })
                    }
                    slotProps={{
                      htmlInput: { inputMode: 'numeric', 'aria-label': `${m.label} en ${m.unit}` },
                      input: {
                        endAdornment: <InputAdornment position="end">{m.unit}</InputAdornment>,
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          ) : null}

          {fields.activity ? (
            <Box sx={{ mb: 3 }} role="radiogroup" aria-labelledby="label-activity">
              <FieldLabel id="label-activity">Vous bougez combien&nbsp;?</FieldLabel>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {ACTIVITIES.map((a, i) => {
                  const selected = form.activity === i;
                  return (
                    <OptionButton
                      key={a.label}
                      selected={selected}
                      onClick={() => dispatch({ type: 'setActivity', value: i })}
                      sx={{ display: 'flex', alignItems: 'center', gap: '14px', p: '14px 16px' }}
                    >
                      <Box
                        aria-hidden
                        sx={(t) => ({
                          width: 18,
                          height: 18,
                          flex: 'none',
                          borderRadius: '50%',
                          border: `2px solid ${selected ? t.tokens.primaryInk : t.tokens.borderStrong}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        })}
                      >
                        <Box
                          sx={(t) => ({
                            width: 9,
                            height: 9,
                            borderRadius: '50%',
                            backgroundColor: selected ? t.tokens.primaryInk : 'transparent',
                          })}
                        />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: FS.option, fontWeight: 500, color: 'inherit' }}>
                          {a.label}
                        </Typography>
                        <Typography
                          sx={(t) => ({ fontSize: FS.small, color: t.tokens.muted, mt: '2px' })}
                        >
                          {a.desc}
                        </Typography>
                      </Box>
                      <Typography
                        sx={(t) => ({
                          fontSize: FS.small,
                          color: t.tokens.muted2,
                          fontVariantNumeric: 'tabular-nums',
                        })}
                      >
                        ×{fmtFactor(a.factor)}
                      </Typography>
                    </OptionButton>
                  );
                })}
              </Box>
            </Box>
          ) : null}

          {fields.goal ? (
            <Box sx={{ mb: 3 }} role="radiogroup" aria-labelledby="label-goal">
              <FieldLabel id="label-goal">Vous voulez</FieldLabel>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '10px',
                }}
              >
                {GOALS.map((g) => (
                  <OptionButton
                    key={g.key}
                    selected={form.goal === g.key}
                    onClick={() => dispatch({ type: 'setGoal', value: g.key })}
                    sx={{ p: '14px 16px' }}
                  >
                    <Typography sx={{ fontSize: FS.option, fontWeight: 500, color: 'inherit' }}>
                      {g.label}
                    </Typography>
                    <Typography
                      sx={(t) => ({ fontSize: FS.small, color: t.tokens.muted, mt: '2px' })}
                    >
                      {g.desc}
                    </Typography>
                    <Typography sx={(t) => ({ fontSize: FS.caption, color: t.tokens.muted })}>
                      {g.detail}
                    </Typography>
                  </OptionButton>
                ))}
              </Box>
            </Box>
          ) : null}

          {form.error ? (
            <Box
              role="alert"
              sx={(t) => ({
                backgroundColor: t.tokens.errorBg,
                color: t.tokens.errorInk,
                borderRadius: 1,
                p: '12px 16px',
                fontSize: FS.base,
                mb: '20px',
              })}
            >
              {form.error}
            </Box>
          ) : null}

          <Box
            sx={(t) => ({
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              borderTop: `1px solid ${t.tokens.divider}`,
              pt: '20px',
            })}
          >
            <Button
              type="button"
              onClick={() =>
                isWizard && form.step > 0 ? dispatch({ type: 'previous' }) : onCancel()
              }
              sx={(t) => ({
                color: t.tokens.muted,
                '&:hover': { backgroundColor: 'rgba(0,0,0,.04)' },
              })}
            >
              {backLabel}
            </Button>
            <Button type="submit" variant="contained" size="large">
              {nextLabel}
            </Button>
          </Box>
        </Paper>

        <LivePreview form={form} age={age} />
      </Box>

      {hasProfile ? (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={onReset} sx={(t) => ({ color: t.tokens.muted, fontSize: FS.small })}>
            Tout effacer
          </Button>
        </Box>
      ) : null}
    </Box>
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
  return (
    <Typography
      component={htmlFor ? 'label' : 'div'}
      htmlFor={htmlFor}
      id={id}
      sx={(t) => ({
        display: 'block',
        fontSize: FS.small,
        fontWeight: 500,
        color: t.tokens.muted,
        mb: htmlFor ? '6px' : '10px',
      })}
    >
      {children}
    </Typography>
  );
}
