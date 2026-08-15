import { bmiGaugePosition, energyBreakdown } from '@vitae/core/calc';
import { activityFactor, activityLabel, BMI_BANDS, BMI_GAUGE_LABELS } from '@vitae/core/constants';
import { dec, fmtFactor, kcal } from '@vitae/core/format';
import { Text, View } from 'react-native';
import Apparition from '@/components/ui/Apparition';
import CalculPrompt from '@/components/ui/CalculPrompt';
import Chiffre from '@/components/ui/Chiffre';
import Hero from '@/components/ui/Hero';
import Overline from '@/components/ui/Overline';
import { TileRow } from '@/components/ui/Page';
import { Card } from '@/components/ui/primitives';
import StatTile from '@/components/ui/StatTile';
import { useProfile } from '@/state/ProfileProvider';
import { usePalette } from '@/theme/palette';

export default function MetabolismeScreen() {
  const { metrics, profile } = useProfile();
  const palette = usePalette();

  if (!metrics || !profile)
    return (
      <CalculPrompt quoi="Le calcul de votre métabolisme et de votre dépense sur une journée." />
    );

  const factor = activityFactor(profile.daily, profile.sessions);
  const gauge = bmiGaugePosition(metrics.bmi);
  const energie = energyBreakdown(metrics);

  return (
    <View className="gap-6">
      <Apparition depuis={1}>
        <Hero surtitre="Votre dépense sur une journée" valeur={metrics.tdee} unite="kcal par jour">
          Tout compris : le fonctionnement du corps et tout ce que vous faites bouger. Le calcul
          tient compte de « {activityLabel(profile.daily, profile.sessions)} » (×{' '}
          {fmtFactor(factor)}). Si vous mangez à peu près cette quantité, votre poids ne bouge pas.
        </Hero>

        <Card className="p-6">
          <Overline niveau={2} className="mb-1">
            D’où vient cette dépense
          </Overline>
          <Text className="font-sans mb-4 text-base leading-[22px] text-muted">
            Contrairement à ce qu’on imagine, le sport n’est pas le principal poste de dépense : le
            simple fait d’être en vie représente {energie.bmrPct} % de votre total, soit{' '}
            {kcal(energie.bmr)} kcal par jour.
          </Text>

          <View aria-hidden className="mb-[14px] h-3 flex-row overflow-hidden rounded-[6px]">
            <View className="h-full bg-primary-ink" style={{ width: `${energie.bmrPct}%` }} />
            <View
              className="h-full bg-primary opacity-55"
              style={{ width: `${energie.movementPct}%` }}
            />
          </View>

          <TileRow>
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
          </TileRow>
        </Card>

        <Card className="p-6">
          <Overline niveau={2}>Votre corpulence (IMC)</Overline>
          <View className="mt-[10px] mb-4">
            <Chiffre valeur={dec(metrics.bmi)} unite={metrics.band.label} taille="moyen" />
            <Text className="font-sans mt-1 text-small text-muted">
              Poids santé pour votre taille : {metrics.healthyMin} – {metrics.healthyMax} kg
            </Text>
          </View>

          <View
            accessibilityRole="image"
            accessibilityLabel={`IMC ${dec(metrics.bmi)} : ${metrics.band.label}`}
            className="h-2 flex-row gap-[2px]"
          >
            {BMI_BANDS.slice(0, 4).map((b) => (
              <View
                key={b.label}
                className="h-2 flex-1 rounded-[4px] opacity-90"
                style={{ backgroundColor: b.color }}
              />
            ))}
            {/* Curseur : le liseré de la couleur de carte le détache des bandes, quelle que soit
              celle qu'il touche. `shadow` n'a pas d'équivalent fiable en React Native, on le rend
              donc par une bordure. */}
            <View
              className="absolute -top-1 h-4 w-1 rounded-[2px] bg-ink"
              style={{
                left: `${gauge}%`,
                transform: [{ translateX: -2 }],
                borderWidth: 2,
                borderColor: palette.surface,
              }}
            />
          </View>
          <View className="mt-[6px] flex-row justify-between">
            {BMI_GAUGE_LABELS.map((label) => (
              <Text key={label} className="font-sans text-micro text-muted2">
                {label}
              </Text>
            ))}
          </View>
        </Card>
      </Apparition>
    </View>
  );
}
