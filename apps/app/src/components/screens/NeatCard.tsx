import { kcal } from '@vitae/core/format';
import type { NeatPlan } from '@vitae/core/neat';
import { Text, View } from 'react-native';
import Overline from '../ui/Overline';
import { TileRow } from '../ui/Page';
import { Bullet, Card } from '../ui/primitives';
import StatTile from '../ui/StatTile';

/**
 * Le mouvement du quotidien, présenté séparément des séances.
 * Volontairement sans séries ni répétitions : ce qui compte ici est la répétition quotidienne,
 * pas la performance. Les kcal affichées sont calculées pour le poids de la personne.
 */
export default function NeatCard({ neat }: { neat: NeatPlan }) {
  return (
    <View className="gap-6">
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

      <Card className="p-6">
        <Overline className="mb-1">Où aller la chercher</Overline>
        <Text className="mb-[6px] text-small text-muted">
          Des gestes à répéter tous les jours, y compris les jours de séance. Les calories sont
          estimées pour votre poids actuel.
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
      </Card>

      <Card className="p-6">
        <Overline className="mb-1">Vos repères</Overline>
        <Text className="mb-[14px] text-small text-muted">
          Adaptés à votre façon de passer vos journées.
        </Text>
        <TileRow>
          {[neat.steps, ...neat.tips].map((tip) => (
            <Bullet key={tip}>{tip}</Bullet>
          ))}
        </TileRow>
      </Card>
    </View>
  );
}
