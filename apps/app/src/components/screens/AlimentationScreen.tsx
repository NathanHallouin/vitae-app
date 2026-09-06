import {
  buildMacros,
  proteinBasisNote,
  rangeBar,
  rangeCaption,
  warningText,
} from '@vitae/core/calc';
import { ETAT_VIDE, GOALS } from '@vitae/core/constants';
import { fmtGap, fmtWeekly, kcal } from '@vitae/core/format';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import ColonnesResultat from '@/components/layout/ColonnesResultat';
import CalculPrompt from '@/components/ui/CalculPrompt';
import Hero from '@/components/ui/Hero';
import Icon from '@/components/ui/Icon';
import OptionButton from '@/components/ui/OptionButton';
import Overline from '@/components/ui/Overline';
import { TileRow } from '@/components/ui/Page';
import { Card } from '@/components/ui/primitives';
import Repliable from '@/components/ui/Repliable';
import StatTile from '@/components/ui/StatTile';
import { useProfile } from '@/state/ProfileProvider';
import { usePalette } from '@/theme/palette';
import RecipesCard from './RecipesCard';

export default function AlimentationScreen() {
  const { metrics, profile, setGoal } = useProfile();
  const palette = usePalette();

  /**
   * Les couleurs des macros sont passées en valeurs, et non en classes.
   *
   * Sur le site elles transitaient par des variables CSS parce qu'elles servent en style calculé
   * (largeur de barre) ; ici c'est la palette du thème courant qui les fournit, ce qui revient au
   * même et suit la bascule clair / sombre de la même façon.
   */
  const macroColors = useMemo(
    () => ({ prot: palette.macroProt, fat: palette.macroFat, carb: palette.macroCarb }),
    [palette],
  );

  if (!metrics || !profile) return <CalculPrompt quoi={ETAT_VIDE.quoi.alimentation} />;

  const bar = rangeBar(metrics);
  const warning = warningText(metrics);
  const macros = buildMacros(metrics, macroColors);
  const gapAtMin = metrics.min - metrics.tdee;
  const gapAtMax = metrics.max - metrics.tdee;

  return (
    <ColonnesResultat
      reponse={
        <Hero
          surtitre="Votre repère quotidien"
          valeur={metrics.target}
          unite="kcal par jour"
          // Ce qu'on mange rapporté à ce qu'on dépense : c'est l'objectif rendu visible. Sur une
          // sèche l'arc est court, sur une prise de masse il dépasse le tour — `Cadran` le borne,
          // et la légende donne alors le pourcentage exact.
          part={metrics.target / metrics.tdee}
          legende="Part de votre dépense"
          anime
        >
          {metrics.goal.note}
        </Hero>
      }
    >
      <Repliable
        titre="Mon objectif"
        resume={`${metrics.goal.label} · changez-le quand vous voulez`}
      >
        <Text className="font-sans mb-[14px] text-small text-muted">
          Tous les chiffres de l’application se recalculent aussitôt.
        </Text>
        <View accessibilityRole="radiogroup" className="gap-[10px]">
          {GOALS.map((g) => (
            <OptionButton
              key={g.key}
              selected={profile.goal === g.key}
              onPress={() => setGoal(g.key)}
              className="px-4 py-[14px]"
            >
              <Text
                className={
                  profile.goal === g.key
                    ? 'text-option font-sans-medium text-primary-ink'
                    : 'text-option font-sans-medium text-ink'
                }
              >
                {g.label}
              </Text>
              <Text className="font-sans mt-[2px] text-small text-muted">{g.desc}</Text>
              <Text className="font-sans text-caption text-muted">{g.detail}</Text>
            </OptionButton>
          ))}
        </View>
      </Repliable>

      <Card className="px-[18px] py-4">
        <Overline niveau={2} className="mb-[6px]">
          {rangeCaption(metrics.goal.key)}
        </Overline>
        <Text className="font-sans mb-[14px] text-base leading-[21px] text-muted">
          Inutile de viser juste : tant que vous restez dans cette fourchette, ça marche.
        </Text>

        <View className="relative mb-2 h-2 rounded-[4px] bg-gauge-track">
          <View
            className="absolute top-0 h-2 rounded-[4px] bg-primary"
            style={{ left: `${bar.low}%`, width: `${bar.width}%` }}
          />
          {/* Repère de la dépense totale : un trait fin en `accent`, la couleur de ce qui est
                mesuré plutôt que choisi. Il situe la fourchette par rapport à l'équilibre sans
                laisser croire à une cible précise. */}
          <View
            className="absolute -top-[5px] -bottom-[5px] w-[2px]"
            style={{ left: `${bar.tdee}%`, backgroundColor: palette.accent }}
          />
        </View>
        <View className="mb-[14px] flex-row justify-between">
          <Text className="font-sans text-micro text-muted2">ce que vous brûlez au repos</Text>
          <Text className="font-sans text-micro text-muted2">en tout</Text>
        </View>

        <TileRow>
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
        </TileRow>

        {/* Le renvoi vers la notion suit l'avertissement plutôt que de vivre à côté : il ne
              s'affiche que quand la fourchette a réellement été relevée, c'est-à-dire à l'instant
              précis où la question « pourquoi une fourchette » se pose. */}
        {warning ? (
          <View className="mt-3 rounded-control bg-warn-bg px-[14px] py-3">
            <Text className="font-sans text-small leading-[20px] text-warn-ink">{warning}</Text>
          </View>
        ) : null}
      </Card>

      {/* Dépliée, contrairement à l'objectif juste au-dessus : la répartition est la moitié de la
            réponse de cet écran, et un total sans sa répartition se lit comme un chiffre à
            respecter plutôt que comme une assiette à composer. */}
      <Card className="px-[18px] py-4">
        <Overline niveau={2} className="mb-[6px]">
          Comment répartir ces calories
        </Overline>
        <Text className="font-sans mb-4 text-base leading-[21px] text-muted">
          Des repères, pas des règles. Le plus important reste le total de la journée.{' '}
          {proteinBasisNote(metrics)}
        </Text>

        <View className="gap-[14px]">
          {macros.map((m) => (
            <View key={m.label}>
              <View className="mb-[5px] flex-row items-center justify-between gap-4">
                <View className="min-w-0 flex-1 flex-row items-center gap-2">
                  <Icon name={m.icon} size={17} color={m.color} />
                  <Text className="text-base font-sans-medium text-ink">{m.label}</Text>
                  <Text
                    numberOfLines={1}
                    className="font-sans min-w-0 flex-1 text-small text-muted"
                  >
                    {m.hint}
                  </Text>
                </View>
                <Text
                  style={{ fontVariant: ['tabular-nums'] }}
                  className="font-sans flex-none text-base text-muted"
                >
                  {m.grams} g · {m.kcal} kcal
                </Text>
              </View>
              <View className="h-[6px] overflow-hidden rounded-[3px] bg-gauge-track">
                <View
                  className="h-full rounded-[3px]"
                  style={{ width: `${m.pct}%`, backgroundColor: m.color }}
                />
              </View>
            </View>
          ))}
        </View>
      </Card>

      <RecipesCard metrics={metrics} goal={profile.goal} />
    </ColonnesResultat>
  );
}
