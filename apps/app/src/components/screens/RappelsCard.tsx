import {
  INTERVALLES,
  loadRappels,
  normaliser,
  type RappelsConfig,
  resumeRappels,
  saveRappels,
} from '@vitae/core/rappels';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import Overline from '@/components/ui/Overline';
import { Card, cx } from '@/components/ui/primitives';
import { appliquerRappels, RAPPELS_DISPONIBLES } from '@/lib/rappels';
import { usePalette } from '@/theme/palette';

/**
 * Le réglage des rappels anti-sédentarité.
 *
 * Sa place est ici, sous le mouvement du quotidien, et pas dans un écran de réglages : la carte
 * juste au-dessus explique que se lever quelques minutes par heure est le geste qui casse le mieux
 * la sédentarité. Le réglage est la suite immédiate de cette phrase — pas une préférence à aller
 * chercher trois écrans plus loin.
 *
 * Absent du site : voir `src/lib/rappels.web.ts`. Un rappel qui ne sonne que si l'onglet est resté
 * ouvert ne rappelle rien, et un interrupteur sans effet est pire que pas d'interrupteur.
 */
export default function RappelsCard() {
  const palette = usePalette();
  const [config, setConfig] = useState<RappelsConfig>(() => loadRappels());
  const [refuse, setRefuse] = useState(false);

  /**
   * La dernière configuration demandée.
   *
   * Reprogrammer une quinzaine de notifications prend quelques dizaines de millisecondes, et rien
   * n'empêche de toucher trois réglages pendant ce temps. La référence garantit que c'est bien le
   * dernier état voulu qui finit dans le système, quel que soit l'ordre d'arrivée des réponses.
   */
  const demande = useRef(config);
  const enCours = useRef(false);

  const appliquer = useCallback(async () => {
    if (enCours.current) return;
    enCours.current = true;
    try {
      while (true) {
        const voulu = demande.current;
        const accorde = await appliquerRappels(voulu);
        if (demande.current === voulu) {
          // Autorisation refusée : l'interrupteur ne peut pas rester allumé sur une promesse que
          // le système ne tiendra pas.
          if (!accorde && voulu.actif) {
            const eteint = { ...voulu, actif: false };
            demande.current = eteint;
            setConfig(eteint);
            saveRappels(eteint);
            setRefuse(true);
            continue;
          }
          setRefuse(false);
          break;
        }
      }
    } finally {
      enCours.current = false;
    }
  }, []);

  const changer = useCallback(
    (partiel: Partial<RappelsConfig>) => {
      const suivant = normaliser({ ...demande.current, ...partiel });
      demande.current = suivant;
      setConfig(suivant);
      saveRappels(suivant);
      void appliquer();
    },
    [appliquer],
  );

  /**
   * Remise en phase, au montage et une seule fois.
   *
   * Le système peut avoir perdu les rappels — autorisation retirée dans les réglages, restauration
   * depuis une sauvegarde, mise à jour majeure. Reprogrammer une fois à l'ouverture coûte quelques
   * millisecondes et évite un réglage qui s'affiche allumé sans que rien ne sonne.
   *
   * Les changements, eux, passent par `changer` : les inclure ici reprogrammerait deux fois.
   */
  const remisEnPhase = useRef(false);
  useEffect(() => {
    if (remisEnPhase.current) return;
    remisEnPhase.current = true;
    if (demande.current.actif) void appliquer();
  }, [appliquer]);

  if (!RAPPELS_DISPONIBLES) return null;

  return (
    <Card className="p-6">
      <View className="flex-row items-start justify-between gap-4">
        <View className="min-w-0 flex-1">
          <Overline className="mb-1">Me rappeler de bouger</Overline>
          <Text className="text-base leading-[22px] text-muted">
            Une invitation discrète à vous lever, à intervalle régulier. C’est le geste le plus
            rentable de cette page : il ne demande aucune récupération et se cumule tous les jours.
          </Text>
        </View>
        <Switch
          value={config.actif}
          onValueChange={(actif) => changer({ actif })}
          accessibilityLabel="Activer les rappels de mouvement"
          trackColor={{ false: palette.divider, true: palette.primaryTint }}
          thumbColor={config.actif ? palette.primary : palette.borderStrong}
        />
      </View>

      {config.actif ? (
        <View className="mt-5 gap-5 border-t border-divider pt-5">
          <Reglage titre="Toutes les">
            {INTERVALLES.map((minutes) => (
              <Choix
                key={minutes}
                actif={config.intervalleMinutes === minutes}
                label={minutes >= 60 && minutes % 60 === 0 ? `${minutes / 60} h` : `${minutes} min`}
                accessibilityLabel={`Toutes les ${minutes} minutes`}
                onPress={() => changer({ intervalleMinutes: minutes })}
              />
            ))}
          </Reglage>

          <View className="flex-row gap-8">
            <Heure
              titre="À partir de"
              valeur={config.debutHeure}
              min={0}
              max={config.finHeure - 1}
              onChange={(debutHeure) => changer({ debutHeure })}
            />
            <Heure
              titre="Jusqu’à"
              valeur={config.finHeure}
              min={config.debutHeure + 1}
              max={24}
              onChange={(finHeure) => changer({ finHeure })}
            />
          </View>
        </View>
      ) : null}

      <Text accessibilityLiveRegion="polite" className="mt-4 text-caption text-muted2">
        {refuse
          ? 'Les notifications sont refusées pour cette application. Autorisez-les dans les réglages de votre téléphone, puis revenez ici.'
          : `${resumeRappels(config)} Tout se passe sur votre téléphone : rien n’est envoyé nulle part.`}
      </Text>
    </Card>
  );
}

function Reglage({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <View>
      <Text className="mb-[10px] text-small font-sans-medium text-muted">{titre}</Text>
      <View accessibilityRole="radiogroup" className="flex-row flex-wrap gap-2">
        {children}
      </View>
    </View>
  );
}

function Choix({
  actif,
  label,
  accessibilityLabel,
  onPress,
}: {
  actif: boolean;
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: actif, checked: actif }}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className={cx(
        'rounded-full border px-[14px] py-[6px]',
        actif ? 'border-primary-ink bg-primary-tint' : 'border-line',
      )}
    >
      <Text
        className={cx('text-small font-sans-medium', actif ? 'text-primary-ink' : 'text-muted')}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/**
 * Une heure, réglée au pas de une.
 *
 * Deux boutons plutôt qu'un sélecteur d'heure : le réglage ne porte que sur des heures rondes, et
 * ouvrir une horloge système pour choisir « 9 » demanderait trois gestes au lieu d'un.
 */
function Heure({
  titre,
  valeur,
  min,
  max,
  onChange,
}: {
  titre: string;
  valeur: number;
  min: number;
  max: number;
  onChange: (valeur: number) => void;
}) {
  return (
    <View className="min-w-0 flex-1">
      <Text className="mb-[10px] text-small font-sans-medium text-muted">{titre}</Text>
      <View className="flex-row items-center gap-3">
        <Pas
          signe="−"
          label={`${titre} : une heure de moins`}
          disabled={valeur <= min}
          onPress={() => onChange(valeur - 1)}
        />
        <Text
          accessibilityLiveRegion="polite"
          accessibilityLabel={`${titre} ${valeur} heures`}
          style={{ fontVariant: ['tabular-nums'] }}
          className="min-w-[44px] text-center font-display text-stat2 text-ink"
        >
          {valeur} h
        </Text>
        <Pas
          signe="+"
          label={`${titre} : une heure de plus`}
          disabled={valeur >= max}
          onPress={() => onChange(valeur + 1)}
        />
      </View>
    </View>
  );
}

/** 44 px de côté : la cible minimale recommandée par Apple, et la bonne taille pour un pouce. */
function Pas({
  signe,
  label,
  disabled,
  onPress,
}: {
  signe: string;
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={cx(
        'size-11 flex-none items-center justify-center rounded-full border border-line active:bg-primary-tint',
        disabled && 'opacity-40',
      )}
    >
      <Text className="text-h3 text-primary-ink">{signe}</Text>
    </Pressable>
  );
}
