import type { WeekPlan } from '@vitae/core/training';
import { Text, View } from 'react-native';
import Chiffre from '@/components/ui/Chiffre';
import Overline from '@/components/ui/Overline';
import { Bullet, Card } from '@/components/ui/primitives';
import Repliable from '@/components/ui/Repliable';

/**
 * Programme hebdomadaire : quoi faire, dans quel ordre, et comment progresser.
 *
 * Une seule carte reste ouverte, la semaine type — combien de séances, réparties comment. Tout le
 * reste se replie derrière un résumé qui suffit à décider : « Haut du corps · 40 min · 5 exercices »
 * n'a besoin d'être ouvert que par quelqu'un qui s'entraîne à l'instant même.
 *
 * Rien n'est retiré. Le programme complet est là, exercice par exercice, avec les variantes plus
 * faciles et plus difficiles ; il ne se déverse simplement plus d'un bloc sur quelqu'un qui voulait
 * juste savoir combien de fois par semaine s'entraîner.
 */
export default function WeekPlanCard({ week }: { week: WeekPlan }) {
  return (
    <View className="gap-4">
      <Card className="p-6">
        <Overline niveau={2} className="mb-1">
          Votre semaine type
        </Overline>
        <View className="my-2">
          <Chiffre
            valeur={week.strengthPerWeek}
            unite="séances de renforcement par semaine"
            taille="grand"
            ton="primary"
          />
        </View>
        <Text className="text-base leading-[22px] text-muted">{week.note}</Text>
        <Text className="mt-[10px] text-small text-muted2">
          Répartition conseillée : {week.schedule}
        </Text>
        <Text className="mt-[6px] text-small text-muted2">Échauffement : {week.warmup}</Text>
      </Card>

      <Repliable
        titre="Pourquoi ce programme-là"
        resume={`${week.adaptations.length} ajustements, et la raison de chacun`}
      >
        <Text className="mb-1 text-small text-muted">
          Ce que votre profil a changé par rapport au programme de base.
        </Text>
        <View>
          {week.adaptations.map((a) => (
            <View key={a.label} className="border-t border-divider py-3">
              <Text className="mb-[2px] text-option font-sans-medium text-primary-ink">
                {a.label}
              </Text>
              <Text className="text-small leading-[20px] text-muted">{a.reason}</Text>
            </View>
          ))}
        </View>
      </Repliable>

      {week.sessions.map((session) => (
        <Repliable
          key={session.title}
          titre={session.title}
          resume={`${session.focus} · ${session.duration} · ${session.exercises.length} exercices · ≈ ${session.kcal} kcal`}
        >
          {session.exercises.map((ex, i) => (
            <View
              key={ex.name}
              className={i === 0 ? 'pb-[14px]' : 'border-t border-divider py-[14px]'}
            >
              <View className="flex-row flex-wrap items-baseline justify-between gap-2">
                <Text className="text-option font-sans-medium text-ink">{ex.name}</Text>
                <Text
                  style={{ fontVariant: ['tabular-nums'] }}
                  className="text-small font-sans-medium text-primary-ink"
                >
                  {ex.volume} · repos {ex.rest}
                </Text>
              </View>
              <Text className="mt-1 text-small leading-[20px] text-muted">{ex.cue}</Text>
              <View className="mt-2 gap-1">
                <Text className="text-caption text-muted2">
                  <Text className="font-sans-medium">Trop dur :</Text> {ex.easier}
                </Text>
                <Text className="text-caption text-muted2">
                  <Text className="font-sans-medium">Trop facile :</Text> {ex.harder}
                </Text>
              </View>
            </View>
          ))}
        </Repliable>
      ))}

      <Repliable
        titre="Progresser sans matériel"
        resume={`${week.progression.length} étapes, dans l’ordre où les franchir`}
      >
        <View className="gap-[10px]">
          {week.progression.map((step, i) => (
            <View key={step} className="flex-row items-start gap-3">
              <View className="size-[22px] flex-none items-center justify-center rounded-full bg-primary-tint">
                <Text className="text-caption font-sans-bold text-primary-ink">{i + 1}</Text>
              </View>
              <Text className="flex-1 text-base leading-[22px] text-ink">{step}</Text>
            </View>
          ))}
        </View>
      </Repliable>

      <Repliable
        titre="Le cardio, en complément"
        resume={`${week.cardio.length} repères, si vous voulez en ajouter`}
      >
        <View className="gap-3">
          {week.cardio.map((line) => (
            <Bullet key={line}>{line}</Bullet>
          ))}
        </View>
      </Repliable>
    </View>
  );
}
