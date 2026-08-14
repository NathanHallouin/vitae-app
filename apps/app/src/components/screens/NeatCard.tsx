import { kcal } from '@vitae/core/format';
import type { NeatPlan } from '@vitae/core/neat';
import { Text, View } from 'react-native';
import Overline from '@/components/ui/Overline';
import { TileRow } from '@/components/ui/Page';
import { Bullet, Card } from '@/components/ui/primitives';
import Repliable from '@/components/ui/Repliable';
import StatTile from '@/components/ui/StatTile';

/**
 * Le mouvement du quotidien, présenté séparément des séances.
 *
 * Volontairement sans séries ni répétitions : ce qui compte ici est la répétition quotidienne, pas
 * la performance. Les kcal affichées sont calculées pour le poids de la personne.
 *
 * Une seule carte reste ouverte, celle qui porte les chiffres — c'est la réponse à la question de
 * l'écran. Les gestes et les repères se replient : ils se lisent quand on a décidé d'agir, pas
 * pendant qu'on cherche à comprendre.
 */
export default function NeatCard({ neat }: { neat: NeatPlan }) {
  const reperes = [neat.steps, ...neat.tips];

  return (
    <View className="gap-4">
      <Card className="p-6">
        <Overline className="mb-[10px]">Ce que votre quotidien dépense déjà</Overline>
        <Text className="mb-5 text-base leading-[22px] text-muted">{neat.lead}</Text>

        <TileRow>
          <StatTile
            label="Mouvement du quotidien"
            value={`${kcal(neat.currentKcal)} kcal`}
            note="par jour, hors séances"
            accent
          />
          {neat.hasHeadroom ? (
            <StatTile
              label="Marge disponible"
              value={`+ ${kcal(neat.headroom)} kcal`}
              note="en passant au cran de mouvement au-dessus"
            />
          ) : null}
        </TileRow>

        <Text className="mt-[14px] text-small leading-[22px] text-muted">{neat.note}</Text>
      </Card>

      <Repliable
        titre="Où aller la chercher"
        resume={`${neat.actions.length} gestes à répéter tous les jours, chiffrés pour votre poids`}
      >
        <Text className="mb-1 text-small text-muted">
          À répéter tous les jours, y compris les jours de séance.
        </Text>
        <View>
          {neat.actions.map((action) => (
            <View
              key={action.label}
              className="flex-row items-start gap-4 border-t border-divider py-3"
            >
              <View className="flex-1">
                <Text className="mb-[2px] text-option font-sans-medium text-ink">
                  {action.label}
                </Text>
                <Text className="text-small leading-[19px] text-muted">{action.detail}</Text>
              </View>
              <Text
                style={{ fontVariant: ['tabular-nums'] }}
                className="flex-none pt-[1px] text-small font-sans-medium text-primary-ink"
              >
                ≈ {action.kcal} kcal
              </Text>
            </View>
          ))}
        </View>
        <Text className="mt-3 text-caption leading-[19px] text-muted2">
          Ces gestes ne demandent aucune récupération : contrairement à une séance, vous pouvez les
          cumuler tous les jours sans jamais avoir à lever le pied.
        </Text>
      </Repliable>

      <Repliable
        titre="Vos repères"
        resume={`${reperes.length} repères, adaptés à votre façon de passer vos journées`}
      >
        <TileRow>
          {reperes.map((tip) => (
            <Bullet key={tip}>{tip}</Bullet>
          ))}
        </TileRow>
      </Repliable>
    </View>
  );
}
