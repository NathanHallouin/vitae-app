import {
  DUREE_MINIMALE,
  formatHeure,
  INTERVALLES,
  JOUR,
  loadRappels,
  MAX_PLAGES,
  nomDePlage,
  normaliser,
  PAS_MINUTES,
  PLAGES_PRETES,
  type Plage,
  plageSuivante,
  type RappelsConfig,
  resumeRappels,
  saveRappels,
} from '@vitae/core/rappels';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import Icon from '@/components/ui/Icon';
import Overline from '@/components/ui/Overline';
import { Card, cx } from '@/components/ui/primitives';
import { appliquerRappels, RAPPELS_DISPONIBLES } from '@/lib/rappels';
import { usePalette } from '@/theme/palette';

/**
 * Le réglage des rappels anti-sédentarité.
 *
 * Il vivait sur l'écran « Bouger », sous le mouvement du quotidien, et c'était défendable : la
 * carte du dessus explique que se lever quelques minutes par heure est le geste qui casse le mieux
 * la sédentarité, et le réglage en était la suite immédiate. Ce qui a fini par ne plus tenir, c'est
 * le retour : décaler une plage d'une heure obligeait à retrouver un écran de conseils, à le
 * parcourir, et à repérer une carte au milieu. Un réglage se cherche là où l'on cherche les
 * réglages. Il reste un chemin dans l'autre sens — voir `RappelsLien`.
 *
 * **Des plages, et non une plage.** Une seule bande de 9 h à 19 h sonne pendant le déjeuner, la
 * sieste et le trajet ; or un rappel qui tombe au mauvais moment ne coûte pas zéro, c'est celui qui
 * fait couper les notifications, et avec elles les douze autres qui étaient utiles. Le réglage
 * suit donc la forme réelle des journées : une matinée, un après-midi, et ce qu'on veut y ajouter.
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
   * Modifie la liste des plages à partir de la **dernière demandée**, et non de celle affichée.
   *
   * L'état de React peut avoir un rendu de retard sur `demande.current` quand deux réglages se
   * suivent de près — c'est tout l'intérêt de la référence. Repartir de `config` ferait alors
   * disparaître le changement précédent.
   */
  const changerPlages = useCallback(
    (transformer: (plages: Plage[]) => Plage[]) => {
      changer({ plages: transformer(demande.current.plages) });
    },
    [changer],
  );

  /**
   * Remise en phase, au montage et une seule fois.
   *
   * Le système peut avoir perdu les rappels — autorisation retirée dans les réglages, restauration
   * depuis une sauvegarde, mise à jour majeure. Reprogrammer une fois à l'ouverture coûte quelques
   * millisecondes et évite un réglage qui s'affiche allumé sans que rien ne sonne.
   *
   * C'est aussi ce qui rattrape la conversion de l'ancien réglage — une plage unique en heures
   * pleines — vers les plages : la lecture la convertit, ce passage la reprogramme.
   *
   * Les changements, eux, passent par `changer` : les inclure ici reprogrammerait deux fois.
   */
  const remisEnPhase = useRef(false);
  useEffect(() => {
    if (remisEnPhase.current) return;
    remisEnPhase.current = true;
    if (demande.current.actif) void appliquer();
  }, [appliquer]);

  // Sur le site, le réglage n'existe pas — mais l'écran de réglages, lui, existe. Une carte qui
  // explique l'absence vaut mieux qu'un trou : quelqu'un venu régler ses rappels depuis un
  // navigateur doit repartir en sachant où les trouver, pas en croyant que la fonction a disparu.
  if (!RAPPELS_DISPONIBLES) return <RappelsAilleurs />;

  const suivante = plageSuivante(config.plages);

  return (
    <Card taille className="px-[18px] py-4">
      <View className="flex-row items-start justify-between gap-4">
        <View className="min-w-0 flex-1">
          <Overline niveau={2} className="mb-1">
            Me rappeler de bouger
          </Overline>
          <Text className="font-sans text-base leading-[22px] text-muted">
            Une invitation discrète à vous lever, à intervalle régulier, sur les plages horaires que
            vous choisissez. Silencieuse, sans vibration, et calculée sur votre téléphone : rien
            n’est envoyé nulle part.
          </Text>
        </View>
        <Switch
          value={config.actif}
          onValueChange={(actif) => changer({ actif })}
          accessibilityLabel="Activer les rappels de mouvement"
          // Piste pleine une fois actif, et non teintée : sur le gris-violet de la refonte, un
          // `primaryTint` à 10 % ne se distinguait plus de la piste éteinte, et l'interrupteur ne
          // disait plus son état. La piste éteinte passe à `gaugeTrack` pour la même raison qu'une
          // jauge — elle porte une valeur, elle ne sépare rien.
          trackColor={{ false: palette.gaugeTrack, true: palette.primary }}
          thumbColor={config.actif ? palette.surface : palette.borderStrong}
        />
      </View>

      {/* Masqué plutôt que retiré : la carte anime alors sa hauteur, et le réglage ne saute pas à
          l'écran au moment où l'on bascule l'interrupteur. */}
      <View style={{ display: config.actif ? 'flex' : 'none' }}>
        <View className="mt-5 gap-5 border-t border-divider pt-5">
          <View>
            <Text className="mb-3 text-small font-sans-medium text-muted">Quand vous rappeler</Text>

            <Journee plages={config.plages} />

            <View className="gap-3">
              {config.plages.map((plage, index) => (
                <LignePlage
                  // L'index, et non les bornes : une clé qui change à chaque appui sur « + »
                  // remonterait la ligne, ce qui reprend le focus au bouton qu'on est en train
                  // d'utiliser. Les plages sont toujours triées, donc le rang est stable.
                  // biome-ignore lint/suspicious/noArrayIndexKey: liste ordonnée, rang stable
                  key={index}
                  plage={plage}
                  // Une seule plage restante : la supprimer laisserait l'interrupteur allumé sans
                  // rien à faire sonner. Pour tout éteindre, il y a l'interrupteur.
                  supprimable={config.plages.length > 1}
                  onChange={(modifiee) =>
                    changerPlages((plages) => plages.map((p, i) => (i === index ? modifiee : p)))
                  }
                  onSupprimer={() =>
                    changerPlages((plages) => plages.filter((_, i) => i !== index))
                  }
                />
              ))}
            </View>

            <View className="mt-3 flex-row flex-wrap items-center gap-2">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ajouter une plage horaire"
                accessibilityState={{ disabled: !suivante }}
                disabled={!suivante}
                onPress={() => suivante && changerPlages((plages) => [...plages, suivante])}
                className={cx(
                  'flex-row items-center gap-2 rounded-full border border-line px-[14px] py-[6px] active:bg-primary-tint',
                  !suivante && 'opacity-40',
                )}
              >
                <Icon name="plus" size={14} color={palette.primaryInk} />
                <Text className="text-small font-sans-medium text-primary-ink">
                  Ajouter une plage
                </Text>
              </Pressable>

              {/* Les plages toutes faites évitent le réglage au pas de trente minutes dans le cas
                  courant : une matinée se pose d'un appui, et se déplace ensuite si besoin. */}
              {PLAGES_PRETES.map(({ nom, plage }) => {
                const deja = config.plages.some(
                  (p) => p.debut <= plage.debut && p.fin >= plage.fin,
                );
                const pleine = config.plages.length >= MAX_PLAGES;
                return (
                  <Pressable
                    key={nom}
                    accessibilityRole="button"
                    accessibilityLabel={`Ajouter ${nom}, de ${formatHeure(plage.debut)} à ${formatHeure(plage.fin)}`}
                    accessibilityState={{ disabled: deja || pleine }}
                    disabled={deja || pleine}
                    onPress={() => changerPlages((plages) => [...plages, plage])}
                    className={cx(
                      'rounded-full border border-line px-[14px] py-[6px] active:bg-primary-tint',
                      (deja || pleine) && 'opacity-40',
                    )}
                  >
                    <Text className="text-small font-sans-medium text-muted">+ {nom}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View>
            <Text className="mb-[10px] text-small font-sans-medium text-muted">
              À quelle fréquence
            </Text>
            <View accessibilityRole="radiogroup" className="flex-row flex-wrap gap-2">
              {INTERVALLES.map((minutes) => (
                <Pressable
                  key={minutes}
                  accessibilityRole="radio"
                  accessibilityState={{
                    selected: config.intervalleMinutes === minutes,
                    checked: config.intervalleMinutes === minutes,
                  }}
                  aria-checked={config.intervalleMinutes === minutes}
                  accessibilityLabel={`Toutes les ${minutes} minutes`}
                  onPress={() => changer({ intervalleMinutes: minutes })}
                  className={cx(
                    'rounded-full border px-[14px] py-[6px]',
                    config.intervalleMinutes === minutes
                      ? 'border-primary-ink bg-primary-tint'
                      : 'border-line',
                  )}
                >
                  <Text
                    className={cx(
                      'text-small font-sans-medium',
                      config.intervalleMinutes === minutes ? 'text-primary-ink' : 'text-muted',
                    )}
                  >
                    {minutes >= 60 && minutes % 60 === 0 ? `${minutes / 60} h` : `${minutes} min`}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </View>

      <Text accessibilityLiveRegion="polite" className="font-sans mt-4 text-caption text-muted2">
        {refuse
          ? 'Les notifications sont refusées pour cette application. Autorisez-les dans les réglages de votre téléphone, puis revenez ici.'
          : resumeRappels(config)}
      </Text>
    </Card>
  );
}

/**
 * Ce que le site dit à la place du réglage.
 *
 * Les notifications d'un navigateur ne survivent pas à la fermeture de l'onglet sans service
 * worker, et un rappel qui ne sonne que si la page est restée ouverte ne rappelle rien. Plutôt
 * qu'un interrupteur sans effet, l'écran explique où la fonction se trouve — et pourquoi elle
 * n'est pas ici.
 */
function RappelsAilleurs() {
  const palette = usePalette();

  return (
    <Card className="flex-row items-start gap-4 px-[18px] py-4">
      <View className="size-10 flex-none items-center justify-center rounded-full bg-primary-tint">
        <Icon name="cloche" size={20} color={palette.primaryInk} />
      </View>
      <View className="min-w-0 flex-1">
        <Overline niveau={2} className="mb-1">
          Me rappeler de bouger
        </Overline>
        <Text className="font-sans text-base leading-[22px] text-muted">
          Une invitation discrète à vous lever, sur les plages horaires de votre choix. Ce réglage
          n’existe que dans l’application iOS et Android : un rappel envoyé par un navigateur ne
          sonne que si l’onglet est resté ouvert, ce qui ne rappelle rien.
        </Text>
      </View>
    </Card>
  );
}

/**
 * La journée d'un coup d'œil : une barre de minuit à minuit, les plages en plein.
 *
 * Purement décorative — chaque plage est écrite en toutes lettres juste en dessous, et modifiable
 * là. Elle sert à voir ce qu'une liste de bornes ne montre pas : les trous, et la part de la
 * journée réellement couverte.
 */
function Journee({ plages }: { plages: Plage[] }) {
  return (
    <View aria-hidden className="mb-4">
      <View className="h-[10px] w-full overflow-hidden rounded-[5px] bg-divider">
        {plages.map((plage) => (
          <View
            key={`${plage.debut}-${plage.fin}`}
            className="absolute h-full bg-primary-ink"
            style={{
              left: `${(plage.debut / JOUR) * 100}%`,
              width: `${((plage.fin - plage.debut) / JOUR) * 100}%`,
            }}
          />
        ))}
      </View>
      <View className="mt-1 flex-row justify-between">
        <Text className="font-sans text-micro text-faint">minuit</Text>
        <Text className="font-sans text-micro text-faint">midi</Text>
        <Text className="font-sans text-micro text-faint">minuit</Text>
      </View>
    </View>
  );
}

/** Une plage : son nom, ses deux bornes réglables, et de quoi la retirer. */
function LignePlage({
  plage,
  supprimable,
  onChange,
  onSupprimer,
}: {
  plage: Plage;
  supprimable: boolean;
  onChange: (plage: Plage) => void;
  onSupprimer: () => void;
}) {
  const palette = usePalette();
  const nom = nomDePlage(plage);

  return (
    <View className="rounded-control bg-surface2 p-[14px]">
      <View className="mb-3 flex-row items-center justify-between gap-3">
        <Text className="text-option font-sans-medium text-ink">{nom}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Supprimer la plage ${nom}, de ${formatHeure(plage.debut)} à ${formatHeure(plage.fin)}`}
          accessibilityState={{ disabled: !supprimable }}
          disabled={!supprimable}
          onPress={onSupprimer}
          hitSlop={8}
          className={cx('rounded-full p-1 active:bg-divider', !supprimable && 'opacity-30')}
        >
          <Icon name="croix" size={16} color={palette.muted2} />
        </Pressable>
      </View>

      <View className="flex-row gap-3">
        <Borne
          titre="Début"
          valeur={plage.debut}
          min={0}
          max={plage.fin - DUREE_MINIMALE}
          onChange={(debut) => onChange({ ...plage, debut })}
        />
        <Borne
          titre="Fin"
          valeur={plage.fin}
          min={plage.debut + DUREE_MINIMALE}
          max={JOUR}
          onChange={(fin) => onChange({ ...plage, fin })}
        />
      </View>
    </View>
  );
}

/**
 * Une borne, réglée à la demi-heure.
 *
 * Deux boutons plutôt qu'une horloge système : le réglage ne porte que sur des demi-heures, et
 * ouvrir un sélecteur pour choisir « 9 h 30 » demanderait trois gestes au lieu d'un. Le pas vient
 * du métier (`PAS_MINUTES`), pour que l'interface ne puisse pas produire une heure que la
 * normalisation arrondirait ensuite sous les doigts.
 */
function Borne({
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
      <Text className="mb-[6px] text-caption font-sans-medium text-muted2">{titre}</Text>
      {/* Borné à 200 points : sans plafond, les deux boutons s'écartent jusqu'aux bords sur une
          tablette, et l'heure se retrouve seule au milieu de vingt centimètres de vide. Sous cette
          largeur — le cas d'un téléphone — le groupe reste élastique et occupe ce qu'il peut. */}
      <View className="max-w-[200px] flex-row items-center justify-between gap-1">
        <Pas
          signe="−"
          label={`${titre} : une demi-heure plus tôt`}
          disabled={valeur <= min}
          onPress={() => onChange(valeur - PAS_MINUTES)}
        />
        <Text
          accessibilityLiveRegion="polite"
          accessibilityLabel={`${titre} ${formatHeure(valeur)}`}
          style={{ fontVariant: ['tabular-nums'] }}
          className="min-w-0 flex-1 text-center text-option font-sans-medium text-ink"
        >
          {formatHeure(valeur)}
        </Text>
        <Pas
          signe="+"
          label={`${titre} : une demi-heure plus tard`}
          disabled={valeur >= max}
          onPress={() => onChange(valeur + PAS_MINUTES)}
        />
      </View>
    </View>
  );
}

/**
 * 40 px de côté, plus 4 px de marge de touche.
 *
 * Deux bornes réglables côte à côte tiennent quatre boutons sur la largeur d'un téléphone : à
 * 44 px pleins, les libellés d'heure n'avaient plus la place de s'écrire. La zone réellement
 * touchable reste au-dessus du seuil grâce à `hitSlop`, qui l'étend sans agrandir le dessin.
 */
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
      hitSlop={4}
      className={cx(
        'size-10 flex-none items-center justify-center rounded-full border border-line bg-surface active:bg-primary-tint',
        disabled && 'opacity-40',
      )}
    >
      <Text className="font-sans text-h3 leading-[22px] text-primary-ink">{signe}</Text>
    </Pressable>
  );
}
