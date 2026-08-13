import { activityFactor, DAILY, GOALS, SESSIONS, STEP_TITLES } from '@vitae/core/constants';
import { ageFrom, formatBirthDate, formatLongDate } from '@vitae/core/date';
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
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useReducer, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { usePalette } from '@/theme/palette';
import LivePreview from '../LivePreview';
import Icon, { type IconName } from '../ui/Icon';
import OptionButton from '../ui/OptionButton';
import Overline from '../ui/Overline';
import { Button, Card, cx, NumberField, ProgressBar } from '../ui/primitives';

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
  const [pickerOuvert, setPickerOuvert] = useState(false);
  const palette = usePalette();

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

  /**
   * Le sélecteur natif rend une `Date` ; le métier attend `yyyy-mm-dd`.
   *
   * La conversion passe par les composantes locales et non par `toISOString`, qui repasse en UTC :
   * pour une naissance saisie à Paris en été, un jour entier se perdrait au passage.
   */
  const choisirDate = (event: DateTimePickerEvent, date?: Date) => {
    // Android referme le sélecteur lui-même ; iOS le laisse ouvert, en molette.
    if (Platform.OS === 'android') setPickerOuvert(false);
    if (event.type === 'dismissed' || !date) return;
    const iso = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');
    dispatch({ type: 'setField', field: 'naissance', value: iso });
  };

  return (
    <View>
      <View className="mb-5 flex-row items-end justify-between gap-4">
        <View className="min-w-0 flex-1">
          <Overline className="mb-1">{kicker}</Overline>
          <Text className="font-display text-h2 leading-[34px] text-ink">{title}</Text>
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
          <View accessibilityLiveRegion="polite" className="mb-5 rounded-xl bg-warn-bg px-[14px] py-3">
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
              {form.naissanceLocked ? (
                // Date issue du profil enregistré : affichée en clair et non dans un contrôle,
                // pour qu'aucune apparence de champ ne laisse croire qu'elle est modifiable.
                <View className="rounded-control border border-line bg-surface2 px-[14px] py-[14px]">
                  <Text
                    accessibilityLabel={`Date de naissance enregistrée : ${formatBirthDate(form.naissance)}`}
                    className="text-input text-muted"
                  >
                    {formatBirthDate(form.naissance)}
                  </Text>
                </View>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Date de naissance"
                  accessibilityHint="Ouvre le sélecteur de date"
                  onPress={() => setPickerOuvert(true)}
                  className="rounded-control border border-line bg-surface2 px-[14px] py-[14px] active:border-line-strong"
                >
                  <Text
                    className={cx('text-input', form.naissance ? 'text-ink' : 'text-faint')}
                  >
                    {form.naissance ? formatBirthDate(form.naissance) : 'Choisir une date'}
                  </Text>
                </Pressable>
              )}
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
          <View accessibilityLiveRegion="assertive" className="mb-5 rounded-xl bg-error-bg px-4 py-3">
            <Text className="text-base text-error-ink">{form.error}</Text>
          </View>
        ) : null}

        <View className="flex-row items-center justify-between gap-3 border-t border-divider pt-5">
          <Button
            onPress={() => (isWizard && form.step > 0 ? dispatch({ type: 'previous' }) : onCancel())}
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

      {pickerOuvert && !form.naissanceLocked ? (
        <DateTimePicker
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          // Une naissance est forcément passée, et la validation borne déjà l'âge à 15–100 ans :
          // autant que le sélecteur refuse d'emblée ce que le formulaire rejetterait ensuite.
          value={form.naissance ? new Date(`${form.naissance}T12:00:00`) : new Date(1990, 0, 1)}
          maximumDate={new Date()}
          onChange={choisirDate}
          locale="fr-FR"
        />
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
  icon,
  label,
  desc,
  value,
}: {
  selected: boolean;
  onPress: () => void;
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
