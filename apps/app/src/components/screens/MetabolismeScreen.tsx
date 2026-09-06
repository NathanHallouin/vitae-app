import { bmiGaugePosition, energyBreakdown } from '@vitae/core/calc';
import { activityFactor, activityLabel, BMI_GAUGE_LABELS, ETAT_VIDE } from '@vitae/core/constants';
import { dec, fmtFactor, kcal } from '@vitae/core/format';
import { Text, View } from 'react-native';
import ColonnesResultat from '@/components/layout/ColonnesResultat';
import CalculPrompt from '@/components/ui/CalculPrompt';
import Chiffre from '@/components/ui/Chiffre';
import Hero from '@/components/ui/Hero';
import { Ligne, Lignes } from '@/components/ui/Ligne';
import Overline from '@/components/ui/Overline';
import { Card } from '@/components/ui/primitives';
import { useProfile } from '@/state/ProfileProvider';
import { usePalette } from '@/theme/palette';

export default function MetabolismeScreen() {
  const { metrics, profile } = useProfile();
  const palette = usePalette();

  if (!metrics || !profile) return <CalculPrompt quoi={ETAT_VIDE.quoi.metabolisme} />;

  const factor = activityFactor(profile.daily, profile.sessions);
  const gauge = bmiGaugePosition(metrics.bmi);
  const energie = energyBreakdown(metrics);

  return (
    <ColonnesResultat
      reponse={
        <Hero
          surtitre="Dépense sur une journée"
          valeur={metrics.tdee}
          unite="kcal par jour"
          // L'arc dit la part du corps au repos dans la dépense totale : la carte qui suit ne fait
          // que la détailler poste par poste.
          part={energie.bmr / metrics.tdee}
          legende="Part du corps au repos"
        >
          Tout compris : le fonctionnement du corps et tout ce que vous faites bouger. Le calcul
          tient compte de « {activityLabel(profile.daily, profile.sessions)} » (×{' '}
          {fmtFactor(factor)}). Si vous mangez à peu près cette quantité, votre poids ne bouge pas.
        </Hero>
      }
    >
      <Card className="px-[18px] py-4">
        <Overline niveau={2} className="mb-2">
          D’où vient cette dépense
        </Overline>
        <Text className="font-sans mb-[14px] text-base leading-[21px] text-muted">
          Contrairement à ce qu’on imagine, le sport n’est pas le principal poste : le simple fait
          d’être en vie représente {energie.bmrPct} % de votre total.
        </Text>

        <Lignes>
          <Ligne
            label="Fonctionnement du corps"
            valeur={kcal(energie.bmr)}
            suffixe={`kcal · ${energie.bmrPct} %`}
          />
          <Ligne
            label="Mouvement"
            valeur={kcal(energie.movement)}
            suffixe={`kcal · ${energie.movementPct} %`}
          />
          <Ligne label="Digestion" valeur={`≈ ${kcal(energie.digestion)}`} suffixe="kcal · 10 %" />
        </Lignes>

        {/* La barre reprend la part que l'arc du cadran affiche déjà, ce qui n'est pas une
              redite : là-haut elle porte la réponse, ici elle sert de légende aux trois lignes
              qui la décomposent, à l'endroit où l'œil les compare. */}
        <View
          aria-hidden
          className="mt-3 h-[6px] flex-row overflow-hidden rounded-[3px] bg-gauge-track"
        >
          <View className="h-full bg-primary" style={{ width: `${energie.bmrPct}%` }} />
        </View>
        <Text className="font-sans mt-[6px] text-caption text-muted2">
          Cœur, cerveau, respiration, température · marche, ménage, escaliers, séances.
        </Text>
      </Card>

      <Card className="px-[18px] py-4">
        <Overline niveau={2} className="mb-[10px]">
          Votre corpulence (IMC)
        </Overline>
        <Chiffre valeur={dec(metrics.bmi)} unite={metrics.band.label} taille="moyen" />
        <Text className="font-sans mt-[6px] mb-[18px] text-small text-muted">
          Poids santé pour votre taille : {metrics.healthyMin} – {metrics.healthyMax} kg
        </Text>

        {/* Un axe unique et non six bandes colorées. Les couleurs de `BMI_BANDS` disaient toutes
              la même chose que la position du curseur, en ajoutant un feu tricolore là où l'IMC
              n'est qu'un repère de taille et de poids. Seule la bande saine est marquée — c'est la
              seule information que l'axe ajoute au nombre. */}
        <View
          accessibilityRole="image"
          accessibilityLabel={`IMC ${dec(metrics.bmi)} : ${metrics.band.label}`}
          className="h-[6px] rounded-[3px] bg-surface2"
        >
          {/* Le deuxième quart de l'axe : `bmiGaugePosition` découpe 15 – 40 en quatre segments
                égaux, dont 18,5 – 25 est le second. */}
          <View className="absolute top-0 bottom-0 left-1/4 w-1/4 rounded-[3px] bg-primary" />
          <View
            className="absolute -top-[5px] size-4 rounded-full"
            style={{
              left: `${gauge}%`,
              transform: [{ translateX: -8 }],
              backgroundColor: palette.accent,
              // Le liseré à la couleur de la carte détache le curseur de l'axe, quelle que soit
              // la portion qu'il touche. `shadow` n'a pas d'équivalent fiable en React Native.
              borderWidth: 3,
              borderColor: palette.surface,
            }}
          />
        </View>
        <View className="mt-2 flex-row justify-between">
          {BMI_GAUGE_LABELS.map((label) => (
            <Text key={label} className="font-sans text-micro text-muted2">
              {label}
            </Text>
          ))}
        </View>
      </Card>
    </ColonnesResultat>
  );
}
