import { buildProjection, rateAssessment } from '@vitae/core/calc';
import { dec, fmtKg, fmtWeekly, kcal, monthIn } from '@vitae/core/format';
import { Text, View } from 'react-native';
import ProjectionChart from '@/components/screens/ProjectionChart';
import Apparition from '@/components/ui/Apparition';
import CalculPrompt from '@/components/ui/CalculPrompt';
import OptionButton from '@/components/ui/OptionButton';
import Overline from '@/components/ui/Overline';
import { Card, cx } from '@/components/ui/primitives';
import { useProfile } from '@/state/ProfileProvider';

export default function PoidsScreen() {
  const { metrics, profile, targetKey, setTargetKey } = useProfile();
  if (!metrics || !profile)
    return <CalculPrompt quoi="Le poids que vous pourriez viser, et en combien de temps." />;

  const projection = buildProjection(metrics, profile.goal, targetKey);
  const cible = `${dec(projection.selected.w)} kg`;
  const rythme = projection.coherent ? rateAssessment(metrics, projection.rate) : null;

  return (
    <View className="gap-6">
      <Apparition depuis={1}>
        <Card className="p-6">
          <Overline niveau={2} className="mb-1">
            Quel poids viser ?
          </Overline>
          <Text className="font-sans mb-[14px] text-small text-muted">
            Trois repères calculés pour votre taille. Choisissez celui qui vous parle, rien n’est
            définitif.
          </Text>
          <View accessibilityRole="radiogroup" className="gap-[10px]">
            {projection.options.map((o) => {
              const choisi = o.key === projection.key;
              return (
                <OptionButton
                  key={o.key}
                  selected={choisi}
                  onPress={() => setTargetKey(o.key)}
                  className="px-4 py-[14px]"
                >
                  <Text
                    style={{ fontVariant: ['tabular-nums'] }}
                    className={cx(
                      'text-stat3 font-sans-medium',
                      choisi ? 'text-primary-ink' : 'text-ink',
                    )}
                  >
                    {dec(o.w)} kg
                  </Text>
                  <Text className="font-sans mt-[2px] text-small text-muted">{o.label}</Text>
                  <Text className="font-sans text-caption text-muted">{o.sub}</Text>
                </OptionButton>
              );
            })}
          </View>
        </Card>

        <Card className="p-6">
          <Overline niveau={2} className="mb-[14px]">
            Combien de temps ?
          </Overline>

          {projection.coherent ? (
            <>
              <Text className="font-sans mb-[18px] text-body leading-[26px] text-ink">
                En mangeant {kcal(metrics.target)} kcal par jour, vous atteindriez{' '}
                <Text className="font-sans-semibold">{cible}</Text> en environ{' '}
                <Text className="font-sans-semibold">
                  {projection.weeks} {projection.weeks > 1 ? 'semaines' : 'semaine'}
                </Text>
                , soit vers {monthIn(projection.weeks)}.
              </Text>

              <View className="mb-5 flex-row flex-wrap gap-5">
                <Stat
                  label="À perdre ou à prendre"
                  value={fmtKg(projection.selected.w - metrics.poids)}
                />
                <Stat label="Rythme" value={fmtWeekly((projection.rate * 7700) / 7)} />
                <Stat
                  label="Durée"
                  value={`${projection.weeks} ${projection.weeks > 1 ? 'semaines' : 'semaine'}`}
                  note={`≈ ${dec(Math.round(projection.months * 10) / 10)} mois`}
                />
                <Stat label="Objectif atteint vers" value={monthIn(projection.weeks)} />
              </View>

              <View className="mb-1 flex-row items-baseline justify-between gap-2">
                <Text className="font-sans min-w-0 flex-1 text-caption text-muted2">
                  Poids projeté, de {projection.hiLabel} à {projection.loLabel}
                </Text>
                <Text className="font-sans flex-none text-caption text-muted2">Cible {cible}</Text>
              </View>
              <ProjectionChart projection={projection} targetLabel={cible} />
            </>
          ) : null}

          <Text
            className={cx(
              'font-sans text-base leading-[22px] text-muted',
              projection.coherent && 'mt-4',
            )}
          >
            {projection.note}
          </Text>

          {rythme ? (
            <View
              className={cx(
                'mt-[14px] rounded-xl p-[14px]',
                rythme.level === 'bon' ? 'bg-surface2' : 'bg-warn-bg',
              )}
            >
              <Text
                className={cx(
                  'font-sans text-small leading-[20px]',
                  rythme.level === 'bon' ? 'text-ink' : 'text-warn-ink',
                )}
              >
                {rythme.text}
              </Text>
            </View>
          ) : null}
        </Card>
      </Apparition>
    </View>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <View className="min-w-[140px] flex-1">
      <Text className="font-sans text-caption text-muted2">{label}</Text>
      <Text className="text-stat3 font-sans-medium text-ink">{value}</Text>
      {note ? <Text className="font-sans text-small text-muted">{note}</Text> : null}
    </View>
  );
}
