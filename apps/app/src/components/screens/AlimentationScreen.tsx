import {
  buildMacros,
  proteinBasisNote,
  rangeBar,
  rangeCaption,
  warningText,
} from '@vitae/core/calc';
import { GOALS } from '@vitae/core/constants';
import { fmtGap, fmtWeekly, kcal } from '@vitae/core/format';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import Apparition from '@/components/ui/Apparition';
import CalculPrompt from '@/components/ui/CalculPrompt';
import Chiffre from '@/components/ui/Chiffre';
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

  if (!metrics || !profile)
    return (
      <CalculPrompt quoi="Combien manger chaque jour selon votre objectif, et comment répartir ces calories." />
    );

  const bar = rangeBar(metrics);
  const warning = warningText(metrics);
  const macros = buildMacros(metrics, macroColors);
  const gapAtMin = metrics.min - metrics.tdee;
  const gapAtMax = metrics.max - metrics.tdee;

  return (
    <View className="gap-6">
      <Apparition depuis={1}>
        <Repliable
          titre="Mon objectif"
          resume={`${metrics.goal.label} · changez-le quand vous voulez`}
        >
          <Text className="mb-[14px] text-small text-muted">
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
                <Text className="mt-[2px] text-small text-muted">{g.desc}</Text>
                <Text className="text-caption text-muted">{g.detail}</Text>
              </OptionButton>
            ))}
          </View>
        </Repliable>

        <Card className="p-6">
          <Overline niveau={2}>Votre repère quotidien</Overline>
          <View className="mt-[10px] mb-2">
            <Chiffre
              valeur={metrics.target}
              unite="kcal par jour"
              taille="grand"
              ton="primary"
              anime
            />
          </View>
          <Text className="text-base leading-[22px] text-muted">{metrics.goal.note}</Text>

          <View className="mt-5 border-t border-divider pt-[18px]">
            <Overline niveau={3} className="mb-1">
              {rangeCaption(metrics.goal.key)}
            </Overline>
            <Text className="mb-4 text-small text-muted">
              Inutile de viser juste : tant que vous restez dans cette fourchette, ça marche.
            </Text>

            <View className="relative mb-[10px] h-[10px] rounded-[5px] bg-divider">
              <View
                className="absolute top-0 h-[10px] rounded-[5px] bg-primary-ink opacity-50"
                style={{ left: `${bar.low}%`, width: `${bar.width}%` }}
              />
              {/* Repère de la dépense totale : un trait fin, pour situer la fourchette par rapport
                à l'équilibre sans laisser croire à une cible précise. */}
              <View
                className="absolute -top-[3px] h-4 w-[2px] bg-marker"
                style={{ left: `${bar.tdee}%` }}
              />
            </View>
            <View className="mb-[18px] flex-row justify-between">
              <Text className="text-micro text-muted2">Ce que vous brûlez au repos</Text>
              <Text className="text-micro text-muted2">Ce que vous brûlez en tout</Text>
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

            {warning ? (
              <View className="mt-3 rounded-xl bg-warn-bg px-[14px] py-3">
                <Text className="text-small leading-[20px] text-warn-ink">{warning}</Text>
              </View>
            ) : null}
          </View>
        </Card>

        <Repliable
          titre="Comment répartir ces calories"
          resume={macros.map((m) => `${m.grams} g de ${m.label.toLowerCase()}`).join(' · ')}
        >
          <Text className="mb-[18px] text-small text-muted">
            Des repères, pas des règles. Le plus important reste le total de la journée.{' '}
            {proteinBasisNote(metrics)}
          </Text>
          <View className="gap-4">
            {macros.map((m) => (
              <View key={m.label}>
                <View className="mb-[6px] flex-row items-center justify-between gap-4">
                  <View className="min-w-0 flex-1 flex-row items-center gap-2">
                    <Icon name={m.icon} size={19} color={m.color} />
                    <Text className="text-base font-sans-medium text-ink">{m.label}</Text>
                    <Text numberOfLines={1} className="min-w-0 flex-1 text-small text-muted">
                      {m.hint}
                    </Text>
                  </View>
                  <Text
                    style={{ fontVariant: ['tabular-nums'] }}
                    className="flex-none text-base text-muted"
                  >
                    {m.grams} g · {m.kcal} kcal
                  </Text>
                </View>
                <View className="h-[6px] overflow-hidden rounded-[3px] bg-divider">
                  <View
                    className="h-full rounded-[3px]"
                    style={{ width: `${m.pct}%`, backgroundColor: m.color }}
                  />
                </View>
              </View>
            ))}
          </View>
        </Repliable>

        <RecipesCard metrics={metrics} goal={profile.goal} />
      </Apparition>
    </View>
  );
}
