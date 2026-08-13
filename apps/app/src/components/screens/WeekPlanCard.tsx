import type { WeekPlan } from '@vitae/core/training';
import { Text, View } from 'react-native';
import Overline from '../ui/Overline';
import { Bullet, Card } from '../ui/primitives';

/** Programme hebdomadaire : quoi faire, dans quel ordre, et comment progresser. */
export default function WeekPlanCard({ week }: { week: WeekPlan }) {
  return (
    <View className="gap-6">
      <Card className="p-6">
        <Overline className="mb-1">Votre semaine type</Overline>
        <View className="my-2 flex-row items-baseline gap-2">
          <Text
            style={{ fontVariant: ['tabular-nums'] }}
            className="font-display text-display leading-[42px] text-primary-ink"
          >
            {week.strengthPerWeek}
          </Text>
          <Text className="flex-1 text-option text-muted">séances de renforcement par semaine</Text>
        </View>
        <Text className="text-base leading-[22px] text-muted">{week.note}</Text>
        <Text className="mt-[10px] text-small text-muted2">
          Répartition conseillée : {week.schedule}
        </Text>
        <Text className="mt-[6px] text-small text-muted2">Échauffement : {week.warmup}</Text>
      </Card>

      <Card className="p-6">
        <Overline className="mb-1">Pourquoi ce programme-là</Overline>
        <Text className="mb-[14px] text-small text-muted">
          Ce que votre profil a changé par rapport au programme de base, et pour quelle raison.
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
      </Card>

      {week.sessions.map((session) => (
        <Card key={session.title} className="p-6">
          <View className="mb-1">
            <Text className="font-display text-stat3 leading-[24px] text-ink">{session.title}</Text>
            <Text className="mt-[2px] text-small text-muted2">
              {session.focus} · {session.duration} · ≈ {session.kcal} kcal
            </Text>
          </View>

          {session.exercises.map((ex) => (
            <View key={ex.name} className="border-t border-divider py-[14px]">
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
        </Card>
      ))}

      <Card className="p-6">
        <Overline className="mb-3">Progresser sans matériel</Overline>
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
      </Card>

      <Card className="p-6">
        <Overline className="mb-3">Le cardio, en complément</Overline>
        <View className="gap-3">
          {week.cardio.map((line) => (
            <Bullet key={line}>{line}</Bullet>
          ))}
        </View>
      </Card>
    </View>
  );
}
