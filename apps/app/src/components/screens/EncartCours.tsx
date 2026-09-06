import { buildProjection, rateAssessment, warningText } from '@vitae/core/calc';
import { type Drapeau, encartDeLEcran, routeNotion, TOTAL_NOTIONS } from '@vitae/core/cours';
import { comparerAuPlan } from '@vitae/core/suivi';
import { Link, usePathname } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import Overline from '@/components/ui/Overline';
import { Card } from '@/components/ui/primitives';
import { versRoute } from '@/lib/route';
import { useProfile } from '@/state/ProfileProvider';
import { usePalette } from '@/theme/palette';

/**
 * L'encart pédagogique : une seule forme, trois déclencheurs.
 *
 * C'est le point de tout le composant. Qu'il apparaisse parce que votre fourchette a été relevée,
 * parce que votre rythme diverge du plan, ou simplement parce qu'il reste des notions à lire, il
 * a **exactement le même aspect** : fond `surface2`, pastille ronde portant un « i », surtitre
 * « Comprendre », numéro de notion, titre, amorce, puis un bouton bordé. On reconnaît au premier
 * coup d'œil un bloc qui explique — et qui ne demande rien.
 *
 * Ce qui change est la ligne de contexte, qui dit *pourquoi il est là*. Elle vit dans le métier
 * (`CONTEXTE_PAR_DRAPEAU`), avec la table qui relie les drapeaux aux notions.
 *
 * **Un seul par écran, jamais deux.** Deux blocs de même forme l'un sous l'autre cessent d'être
 * des exceptions et deviennent un décor : on apprend à les sauter en trois visites. C'est
 * `encartDeLEcran` qui tranche, et il tranche dans le métier plutôt qu'ici — la règle se teste
 * sans écran.
 *
 * **L'avertissement ambre n'est pas un encart.** Le bandeau `warnBg` d'« Ce que je mange » dit ce
 * que le calcul a fait ; celui-ci propose de comprendre pourquoi. Deux registres, deux
 * traitements : l'un alerte, l'autre enseigne. Les confondre reviendrait à mettre sur le même plan
 * une correction subie et une lecture facultative.
 *
 * Rien de tout cela n'est dans le HTML livré — ce qui est lu vit sur l'appareil. L'encart est en
 * pied d'écran, sous le dernier bloc : il n'a donc rien à repousser en apparaissant.
 */
export default function EncartCours() {
  const { lu, coursRepousse, repousserCours } = useProfile();
  const palette = usePalette();
  const pathname = usePathname();
  const drapeaux = useDrapeaux();

  const encart = encartDeLEcran(pathname, drapeaux, lu);
  if (!encart) return null;

  // « Plus tard » ne range que l'encart de progression : un drapeau du métier dit qu'il se passe
  // quelque chose maintenant, et le repousser d'un geste reviendrait à le taire.
  //
  // La réponse vient du métier et n'est pas redéduite ici. Elle l'a été, et c'était faux : la
  // condition regardait si un drapeau quelconque était levé, tous écrans confondus, alors que
  // `encartDeLEcran` ne consulte que ceux de l'écran courant. Un poids vieux de huit jours faisait
  // donc disparaître « Plus tard » du métabolisme, où ce drapeau n'entre pas en jeu.
  const repoussable = encart.source === 'progression';
  if (repoussable && coursRepousse) return null;

  return (
    <Card className="mt-4 border-transparent bg-surface2 px-[18px] py-4">
      <View className="mb-[10px] flex-row items-center gap-2">
        {/* La pastille « i » plutôt qu'une icône du jeu : elle ne désigne aucun sujet, elle
            désigne un registre — « ceci est une explication ». Bordée et non pleine, pour ne pas
            se lire comme un bouton. */}
        <View
          className="size-5 flex-none items-center justify-center rounded-full border"
          style={{ borderColor: palette.muted2 }}
        >
          <Text className="text-micro font-sans-bold text-muted2">i</Text>
        </View>
        <Overline niveau={2}>Comprendre</Overline>
        <View className="flex-1" />
        <Text
          style={{ fontVariant: ['tabular-nums'] }}
          className="font-sans flex-none text-caption text-muted2"
        >
          Notion {encart.notion.rang} sur {TOTAL_NOTIONS}
        </Text>
      </View>

      <Text className="mb-[6px] text-stat3 font-sans-medium leading-[24px] text-ink">
        {encart.notion.titre}
      </Text>
      <Text className="font-sans mb-2 text-base leading-[22px] text-muted">
        {encart.notion.resume}
      </Text>
      <Text className="font-sans mb-3 text-caption text-muted2">{encart.contexte}</Text>

      <View className="flex-row items-center gap-[10px]">
        <Link href={versRoute(routeNotion(encart.notion.slug))} asChild>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={`Lire « ${encart.notion.titre} »`}
            className="rounded-control border border-line px-4 py-[10px] active:bg-primary-tint"
          >
            {/* La durée est dans le bouton, pas au-dessus : c'est ce qui décide d'ouvrir ou non,
                et une minute annoncée vaut mieux qu'un pavé découvert après le clic. */}
            <Text className="text-base font-sans-medium text-primary-ink">Lire (1 min) ›</Text>
          </Pressable>
        </Link>

        {repoussable ? (
          <Pressable
            accessibilityRole="button"
            onPress={repousserCours}
            className="px-2 py-[10px] active:opacity-70"
          >
            <Text className="text-base font-sans-medium text-muted2">Plus tard</Text>
          </Pressable>
        ) : null}
      </View>
    </Card>
  );
}

/**
 * Les drapeaux du métier, tels que l'écran courant peut les lever.
 *
 * Tous sont recalculés ici plutôt que remontés depuis les écrans, et c'est délibéré : ce sont des
 * fonctions pures de quelques opérations, et les faire descendre par des propriétés obligerait
 * quatre écrans à savoir qu'un encart existe. Ils l'ignorent, et c'est ce qui permet de changer la
 * règle à un seul endroit.
 *
 * Aucun n'est inventé : chacun est une situation que le métier calcule déjà pour l'afficher
 * ailleurs — une fourchette relevée, un rythme trop rapide, un poids qui date.
 */
function useDrapeaux(): Partial<Record<Drapeau, boolean>> {
  const { metrics, profile, staleWeight, suivi, targetKey } = useProfile();

  if (!metrics || !profile) return {};

  const projection = buildProjection(metrics, profile.goal, targetKey);
  const rythmePrevu = ((metrics.target - metrics.tdee) * 7) / 7700;
  const comparaison = comparerAuPlan(suivi.tendance, rythmePrevu);

  return {
    // La bande saine se lit sur le nombre et non sur son libellé : comparer une chaîne d'interface
    // ferait dépendre un déclencheur d'une reformulation.
    imcHorsNorme: metrics.bmi < 18.5 || metrics.bmi >= 25,
    fourchetteRelevee: warningText(metrics) !== '',
    proteinesAjustees: metrics.bmi >= 30,
    tendanceEcartee: comparaison !== null && comparaison !== 'Vous suivez le rythme prévu.',
    rythmeInhabituel:
      projection.coherent && rateAssessment(metrics, projection.rate).level !== 'bon',
    poidsPerime: staleWeight !== null,
    quotidienSature: profile.daily >= 3,
  };
}
