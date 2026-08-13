import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { formatBirthDate } from '@vitae/core/date';
import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { cx } from './primitives';

/**
 * Saisie d'une date de naissance, avec le sélecteur du système.
 *
 * Il y a une version web de ce fichier (`DateField.web.tsx`) : le module utilisé ici n'existe pas
 * dans un navigateur, et il n'y a de toute façon aucune raison de réécrire un calendrier quand
 * `<input type="date">` fait mieux, dans la langue du visiteur et avec le clavier.
 *
 * Le composant est la frontière : au-dessus, `ProfilForm` ne connaît qu'une chaîne `yyyy-mm-dd` et
 * ne sait pas sur quelle plateforme il tourne.
 */
export default function DateField({
  value,
  onChange,
  locked,
  label,
}: {
  /** `yyyy-mm-dd`, ou chaîne vide */
  value: string;
  onChange: (value: string) => void;
  /** date issue du profil enregistré : affichée, mais plus modifiable */
  locked: boolean;
  label: string;
}) {
  const [ouvert, setOuvert] = useState(false);

  /**
   * Le sélecteur rend une `Date` ; le métier attend `yyyy-mm-dd`.
   *
   * La conversion passe par les composantes locales et non par `toISOString`, qui repasse en UTC :
   * pour une naissance saisie à Paris en été, un jour entier se perdrait au passage.
   */
  const choisir = (event: DateTimePickerEvent, date?: Date) => {
    // Android referme le sélecteur lui-même ; iOS le laisse ouvert, en molette.
    if (Platform.OS === 'android') setOuvert(false);
    if (event.type === 'dismissed' || !date) return;
    onChange(
      [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
      ].join('-'),
    );
  };

  if (locked) {
    // Affichée et non posée dans un contrôle : aucune apparence de champ ne doit laisser croire
    // qu'elle est modifiable.
    return (
      <View className="rounded-control border border-line bg-surface2 px-[14px] py-[14px]">
        <Text
          accessibilityLabel={`${label} enregistrée : ${formatBirthDate(value)}`}
          className="text-input text-muted"
        >
          {formatBirthDate(value)}
        </Text>
      </View>
    );
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint="Ouvre le sélecteur de date"
        onPress={() => setOuvert(true)}
        className="rounded-control border border-line bg-surface2 px-[14px] py-[14px] active:border-line-strong"
      >
        <Text className={cx('text-input', value ? 'text-ink' : 'text-faint')}>
          {value ? formatBirthDate(value) : 'Choisir une date'}
        </Text>
      </Pressable>

      {ouvert ? (
        <DateTimePicker
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          // Une naissance est forcément passée, et la validation borne déjà l'âge à 15–100 ans :
          // autant que le sélecteur refuse d'emblée ce que le formulaire rejetterait ensuite.
          value={value ? new Date(`${value}T12:00:00`) : new Date(1990, 0, 1)}
          maximumDate={new Date()}
          onChange={choisir}
          locale="fr-FR"
        />
      ) : null}
    </>
  );
}
