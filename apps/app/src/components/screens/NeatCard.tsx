import { kcal } from '@vitae/core/format';
import type { NeatPlan } from '@vitae/core/neat';
import { Text, View } from 'react-native';
import Fiche from '@/components/ui/Fiche';
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
 * **Les gestes ne sont plus repliés derrière un résumé collectif.** Ils l'étaient — « 7 gestes à
 * répéter tous les jours » —, et c'était une erreur de niveau : ce sont eux la réponse concrète à
 * la question de la page, pas une annexe. Ils sont donc à découvert, chacun avec son pictogramme,
 * son ordre de grandeur et une phrase ; c'est le *pourquoi ça marche* et le *comment s'y prendre*
 * qui passent derrière « En savoir plus ». La liste se parcourt du regard en quelques secondes, et
 * on n'ouvre que le geste qu'on envisage vraiment.
 */
export default function NeatCard({ neat }: { neat: NeatPlan }) {
  const reperes = [neat.steps, ...neat.tips];

  return (
    <View className="gap-3">
      <Card className="px-[18px] py-4">
        <Overline niveau={2} className="mb-[6px]">
          Ce que votre quotidien dépense déjà
        </Overline>
        <Text className="font-sans mb-[14px] text-base leading-[21px] text-muted">{neat.lead}</Text>

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

        <Text className="font-sans mt-[14px] text-small leading-[20px] text-muted">
          {neat.note}
        </Text>
      </Card>

      <Card taille className="px-[18px] py-4">
        <Overline niveau={2} className="mb-[6px]">
          Les gestes qui paient, chez vous
        </Overline>
        <Text className="font-sans mb-2 text-base leading-[21px] text-muted">
          Des gestes à répéter tous les jours, y compris les jours de séance, chiffrés pour votre
          poids. Aucun ne demande de récupération : contrairement à une séance, ils se cumulent sans
          jamais avoir à lever le pied.
        </Text>

        <View className="border-t border-divider">
          {neat.actions.map((action, i) => (
            <Fiche
              key={action.label}
              separateur={i > 0}
              icone={action.icon}
              titre={action.label}
              // Le gain seul, sans son unité : elle est écrite une fois sous la liste, où elle
              // porte aussi le poids qui a servi au calcul. Répétée sept fois, elle ferait une
              // colonne de « kcal » que l'œil doit sauter pour comparer les chiffres.
              chiffre={`+ ${action.kcal}`}
              resume={action.detail}
              sections={[
                { titre: 'Pourquoi ça marche', texte: action.pourquoi },
                { titre: 'Comment s’y prendre', texte: action.comment },
              ]}
            />
          ))}
        </View>

        <Text className="font-sans mt-2 text-caption text-muted2">
          kcal par jour, pour {Math.round(neat.poids)} kg
        </Text>
      </Card>

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
