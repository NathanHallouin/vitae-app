import {
  activityFactor,
  DAILY,
  GOALS,
  SESSIONS,
  type Sexe,
  STEP_TITLES,
} from '@vitae/core/constants';
import { ageFrom, formatLongDate } from '@vitae/core/date';
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
import { useReducer } from 'react';
import { Text, View } from 'react-native';
import LivePreview from '@/components/screens/LivePreview';
import DateField from '@/components/ui/DateField';
import Icon, { type IconName } from '@/components/ui/Icon';
import OptionButton from '@/components/ui/OptionButton';
import Overline from '@/components/ui/Overline';
import { Button, Card, cx, NumberField, ProgressBar } from '@/components/ui/primitives';
import Titre from '@/components/ui/Titre';
import { useGroupeRadio } from '@/components/ui/useGroupeRadio';
import { usePalette } from '@/theme/palette';

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
  const palette = usePalette();

  const fields = stepFields(form);

  // Les flèches déplacent la sélection dans chaque groupe ; sans effet sur mobile.
  // `form.sexe` vaut la chaîne vide tant que rien n'est choisi : le groupe entre alors par son
  // premier membre, ce que `useGroupeRadio` fait déjà pour une valeur hors liste.
  const naviguerSexe = useGroupeRadio<Exclude<Sexe, ''>>(
    ['femme', 'homme'],
    form.sexe as Exclude<Sexe, ''>,
    (value) => dispatch({ type: 'setSexe', value }),
  );
  const naviguerDaily = useGroupeRadio(
    DAILY.map((_, i) => i),
    form.daily,
    (value) => dispatch({ type: 'setDaily', value }),
  );
  const naviguerSessions = useGroupeRadio(
    SESSIONS.map((_, i) => i),
    form.sessions,
    (value) => dispatch({ type: 'setSessions', value }),
  );
  const naviguerGoal = useGroupeRadio(
    GOALS.map((g) => g.key),
    form.goal,
    (value) => dispatch({ type: 'setGoal', value }),
  );
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
    <View>
      <View className="mb-5 flex-row items-end justify-between gap-4">
        <View className="min-w-0 flex-1">
          <Overline className="mb-1">{kicker}</Overline>
          {/* Le seul niveau 1 de l'écran du profil, qui n'a pas de `PageIntro` : sans lui, la
              page sortait sans aucun titre de document. */}
          <Titre niveau={1} className="font-display text-h2 leading-[34px] text-ink">
            {title}
          </Titre>
        </View>
        <Button size="small" onPress={() => dispatch({ type: 'toggleMode' })}>
          {isWizard ? 'Tout d’un coup' : 'Une à la fois'}
        </Button>
      </View>

      {isWizard ? (
        <View className="mb-6">
          <ProgressBar
            value={((form.step + 1) / 4) * 100}
            label={`Progression : question ${form.step + 1} sur 4`}
          />
        </View>
      ) : null}

      <Card className="p-6">
        {fields.sex ? (
          <View className="mb-6">
            <FieldLabel>Vous êtes</FieldLabel>
            <View accessibilityRole="radiogroup" className="flex-row gap-3">
              {(['femme', 'homme'] as const).map((sexe) => (
                <OptionButton
                  key={sexe}
                  selected={form.sexe === sexe}
                  onPress={() => dispatch({ type: 'setSexe', value: sexe })}
                  onNavigate={naviguerSexe}
                  className="min-w-0 flex-1 p-4"
                >
                  <Text
                    className={cx(
                      'text-option font-sans-medium',
                      form.sexe === sexe ? 'text-primary-ink' : 'text-ink',
                    )}
                  >
                    {sexe === 'femme' ? 'Une femme' : 'Un homme'}
                  </Text>
                </OptionButton>
              ))}
            </View>
            <Text className="mt-2 text-caption text-muted2">
              Le calcul diffère : à poids et taille égaux, un corps féminin et un corps masculin ne
              consomment pas la même énergie au repos.
            </Text>
          </View>
        ) : null}

        {fields.body && form.staleWeight ? (
          <View
            accessibilityLiveRegion="polite"
            className="mb-5 rounded-xl bg-warn-bg px-[14px] py-3"
          >
            <Text className="text-small leading-[20px] text-warn-ink">
              Votre dernier poids date du {formatLongDate(form.staleWeight.updatedAt)} (
              {form.staleWeight.previous} kg). Repesez-vous et indiquez votre poids d’aujourd’hui :
              tout le reste en dépend.
            </Text>
          </View>
        ) : null}

        {fields.body ? (
          <View className="mb-6 gap-5">
            <View>
              <FieldLabel compact>Date de naissance</FieldLabel>
              <DateField
                value={form.naissance}
                locked={form.naissanceLocked}
                label="Date de naissance"
                onChange={(value) => dispatch({ type: 'setField', field: 'naissance', value })}
              />
              <Text className="mt-[6px] text-caption text-muted2">
                {age === null
                  ? 'Votre âge est calculé tout seul.'
                  : form.naissanceLocked
                    ? `${age} ans · enregistré, « Tout effacer » pour le changer`
                    : `${age} ans aujourd’hui`}
              </Text>
            </View>

            {MEASURES.map((m) => (
              <View key={m.field}>
                <FieldLabel compact>{m.label}</FieldLabel>
                <NumberField
                  unit={m.unit}
                  value={form[m.field]}
                  placeholder={m.placeholder}
                  label={`${m.label} en ${m.unit}`}
                  onChangeText={(value) => dispatch({ type: 'setField', field: m.field, value })}
                />
              </View>
            ))}
          </View>
        ) : null}

        {fields.activity ? (
          <View className="mb-6">
            <View className="mb-6">
              <FieldLabel>Votre quotidien, en dehors du sport ?</FieldLabel>
              <View accessibilityRole="radiogroup" className="gap-2">
                {DAILY.map((d, i) => (
                  <ChoiceRow
                    key={d.label}
                    selected={form.daily === i}
                    onPress={() => dispatch({ type: 'setDaily', value: i })}
                    onNavigate={naviguerDaily}
                    icon={d.icon}
                    label={d.label}
                    desc={d.desc}
                    value={`×${fmtFactor(d.base)}`}
                  />
                ))}
              </View>
            </View>

            <View>
              <FieldLabel>Du sport, combien de fois par semaine ?</FieldLabel>
              <View accessibilityRole="radiogroup" className="gap-2">
                {SESSIONS.map((sess, i) => (
                  <ChoiceRow
                    key={sess.label}
                    selected={form.sessions === i}
                    onPress={() => dispatch({ type: 'setSessions', value: i })}
                    onNavigate={naviguerSessions}
                    icon={sess.icon}
                    label={sess.label}
                    desc={sess.desc}
                    value={`+${fmtFactor(sess.add)}`}
                  />
                ))}
              </View>
            </View>

            <Text
              accessibilityLiveRegion="polite"
              style={{ fontVariant: ['tabular-nums'] }}
              className="mt-3 text-small text-muted"
            >
              Facteur d’activité retenu : ×{fmtFactor(activityFactor(form.daily, form.sessions))}
            </Text>
          </View>
        ) : null}

        {fields.goal ? (
          <View className="mb-6">
            <FieldLabel>Vous voulez</FieldLabel>
            <View accessibilityRole="radiogroup" className="gap-[10px]">
              {GOALS.map((g) => {
                const choisi = form.goal === g.key;
                return (
                  <OptionButton
                    key={g.key}
                    selected={choisi}
                    onPress={() => dispatch({ type: 'setGoal', value: g.key })}
                    onNavigate={naviguerGoal}
                    className="px-4 py-[14px]"
                  >
                    <View className="mb-[6px]">
                      <Icon
                        name={g.icon}
                        size={22}
                        color={choisi ? palette.primaryInk : palette.muted2}
                      />
                    </View>
                    <Text
                      className={cx(
                        'text-option font-sans-medium',
                        choisi ? 'text-primary-ink' : 'text-ink',
                      )}
                    >
                      {g.label}
                    </Text>
                    <Text className="mt-[2px] text-small text-muted">{g.desc}</Text>
                    <Text className="text-caption text-muted">{g.detail}</Text>
                  </OptionButton>
                );
              })}
            </View>
          </View>
        ) : null}

        {form.error ? (
          <View
            accessibilityLiveRegion="assertive"
            className="mb-5 rounded-xl bg-error-bg px-4 py-3"
          >
            <Text className="text-base text-error-ink">{form.error}</Text>
          </View>
        ) : null}

        <View className="flex-row items-center justify-between gap-3 border-t border-divider pt-5">
          <Button
            onPress={() =>
              isWizard && form.step > 0 ? dispatch({ type: 'previous' }) : onCancel()
            }
          >
            {backLabel}
          </Button>
          <Button variant="contained" size="large" onPress={submit}>
            {nextLabel}
          </Button>
        </View>
      </Card>

      <LivePreview form={form} age={age} />

      {hasProfile ? (
        <View className="mt-6 items-end">
          <Button size="small" onPress={onReset}>
            Tout effacer
          </Button>
        </View>
      ) : null}
    </View>
  );
}

/**
 * Libellé de champ.
 *
 * Le site distinguait `<label for>` et `<div aria-labelledby>`, faute de pouvoir associer un
 * libellé à un groupe de boutons autrement. React Native n'a pas cette contrainte : le libellé
 * accessible se pose directement sur le contrôle, et ce composant n'a plus qu'à afficher du texte.
 */
function FieldLabel({ children, compact = false }: { children: string; compact?: boolean }) {
  return (
    <Text
      className={cx('text-small font-sans-medium text-muted', compact ? 'mb-[6px]' : 'mb-[10px]')}
    >
      {children}
    </Text>
  );
}

/** Ligne d'un choix unique : puce ronde, icône, libellé, précision, et valeur alignée à droite. */
function ChoiceRow({
  selected,
  onPress,
  onNavigate,
  icon,
  label,
  desc,
  value,
}: {
  selected: boolean;
  onPress: () => void;
  /** relayé au bouton : c'est lui qui écoute le clavier, sur le web seulement */
  onNavigate?: (direction: -1 | 1 | 'premier' | 'dernier') => void;
  icon: IconName;
  label: string;
  desc: string;
  value: string;
}) {
  const palette = usePalette();
  return (
    <OptionButton
      selected={selected}
      onPress={onPress}
      onNavigate={onNavigate}
      accessibilityLabel={`${label}. ${desc}`}
      className="flex-row items-center gap-[14px] px-4 py-[14px]"
    >
      <View
        className={cx(
          'size-[18px] flex-none items-center justify-center rounded-full border-2',
          selected ? 'border-primary-ink' : 'border-line-strong',
        )}
      >
        <View className={cx('size-[9px] rounded-full', selected && 'bg-primary-ink')} />
      </View>
      <Icon name={icon} size={22} color={selected ? palette.primaryInk : palette.muted2} />
      <View className="min-w-0 flex-1">
        <Text className="text-option font-sans-medium text-ink">{label}</Text>
        <Text className="mt-[2px] text-small text-muted">{desc}</Text>
      </View>
      <Text style={{ fontVariant: ['tabular-nums'] }} className="flex-none text-small text-muted2">
        {value}
      </Text>
    </OptionButton>
  );
}
