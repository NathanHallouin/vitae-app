import { buildProjection, rateAssessment } from '@vitae/core/calc';
import { ETAT_VIDE } from '@vitae/core/constants';
import { dec, fmtKg, fmtWeekly, kcal, monthIn } from '@vitae/core/format';
import { cheminParcouru, depuisEnClair } from '@vitae/core/suivi';
import { useState } from 'react';
import { Text, View } from 'react-native';
import ColonnesResultat from '@/components/layout/ColonnesResultat';
import ProjectionChart from '@/components/screens/ProjectionChart';
import SuiviCard, { type VueSuivi } from '@/components/screens/SuiviCard';
import CalculPrompt from '@/components/ui/CalculPrompt';
import Hero from '@/components/ui/Hero';
import OptionButton from '@/components/ui/OptionButton';
import Overline from '@/components/ui/Overline';
import { Button, Card, cx } from '@/components/ui/primitives';
import { useProfile } from '@/state/ProfileProvider';

export default function PoidsScreen() {
  const { metrics, profile, suivi, targetKey, setTargetKey } = useProfile();
  const [vue, setVue] = useState<VueSuivi>(null);

  if (!metrics || !profile) return <CalculPrompt quoi={ETAT_VIDE.quoi.poids} />;

  const projection = buildProjection(metrics, profile.goal, targetKey);
  const cible = `${dec(projection.selected.w)} kg`;
  const rythme = projection.coherent ? rateAssessment(metrics, projection.rate) : null;

  /**
   * D'où l'on part, et où l'on en est.
   *
   * Le poids de départ est celui qu'a figé la première pesée. À défaut — profil enregistré avant
   * que ce champ existe, ou aucune pesée — la première pesée de l'historique fait l'affaire, et à
   * défaut encore le poids du profil : l'arc est alors vide, ce qui est exactement ce qu'il y a à
   * dire.
   */
  const depart = profile.poidsDepart ?? suivi.historique[0]?.poids ?? metrics.poids;
  const actuel = suivi.dernier?.poids ?? metrics.poids;
  const part = cheminParcouru(depart, actuel, projection.selected.w) ?? 0;

  const basculer = (demandee: Exclude<VueSuivi, null>) =>
    setVue((courante) => (courante === demandee ? null : demandee));

  return (
    <ColonnesResultat
      reponse={
        // Les deux boutons font partie de la réponse, pas du détail : c'est sur eux qu'on appuie
        // après avoir lu le chiffre, et les séparer de lui les enverrait au milieu des cartes.
        <View className="gap-4">
          <Hero
            surtitre={suivi.dernier ? 'Dernière pesée' : 'Votre poids'}
            valeur={dec(actuel)}
            unite={
              suivi.dernier ? `kg · ${depuisEnClair(suivi.dernier.date)}` : 'kg · jamais pesé ici'
            }
            // La seule des quatre parts qui ne rapporte pas deux dépenses l'une à l'autre : elle
            // dit le chemin fait entre le poids de départ et la cible choisie plus bas.
            part={part}
            legende={`Chemin fait depuis ${dec(depart)} kg`}
          >
            {suivi.dernier
              ? 'Une pesée par semaine suffit : c’est la répétition qui rend la courbe lisible, pas la précision de la balance.'
              : 'Enregistrez une première pesée pour donner un point de départ à cette courbe. Elle reste sur cet appareil.'}
          </Hero>

          {/* Deux gestes ponctuels, deux boutons — et non deux cartes ouvertes en permanence. Le
              plein est celui qu'on vient faire, le bordé celui qu'on vient vérifier. */}
          <View className="flex-row gap-[10px]">
            <Button
              variant="contained"
              size="large"
              className="flex-1"
              onPress={() => basculer('peser')}
            >
              Me peser
            </Button>
            <Button
              variant="outlined"
              size="large"
              className="flex-1"
              onPress={() => basculer('historique')}
            >
              Historique
            </Button>
          </View>
        </View>
      }
    >
      <SuiviCard cible={projection.selected.w} vue={vue} />

      <Card className="px-[18px] py-4">
        <Overline niveau={2} className="mb-[6px]">
          Quel poids viser ?
        </Overline>
        <Text className="font-sans mb-3 text-small leading-[20px] text-muted">
          Trois repères calculés pour votre taille. Choisissez celui qui vous parle, rien n’est
          définitif.
        </Text>
        <View accessibilityRole="radiogroup" className="gap-2">
          {projection.options.map((o) => {
            const choisi = o.key === projection.key;
            return (
              <OptionButton
                key={o.key}
                selected={choisi}
                onPress={() => setTargetKey(o.key)}
                className="px-[14px] py-3"
              >
                <Text
                  style={{ fontVariant: ['tabular-nums'] }}
                  className={cx(
                    'font-sans-bold text-stat3',
                    choisi ? 'text-primary-ink' : 'text-ink',
                  )}
                >
                  {dec(o.w)} kg
                </Text>
                <Text className="font-sans mt-[2px] text-small text-muted">
                  {o.label} · {o.sub}
                </Text>
              </OptionButton>
            );
          })}
        </View>
      </Card>

      <Card className="px-[18px] py-4">
        <Overline niveau={2} className="mb-[10px]">
          Combien de temps ?
        </Overline>

        {projection.coherent ? (
          <>
            <Text className="font-sans mb-[14px] text-body leading-[23px] text-ink">
              En mangeant {kcal(metrics.target)} kcal par jour, vous atteindriez{' '}
              <Text className="font-sans-bold">{cible}</Text> en environ{' '}
              <Text className="font-sans-bold">
                {projection.weeks} {projection.weeks > 1 ? 'semaines' : 'semaine'}
              </Text>
              , soit vers {monthIn(projection.weeks)}.
            </Text>

            <View className="mb-4 flex-row flex-wrap gap-4">
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
              <Stat label="Atteint vers" value={monthIn(projection.weeks)} />
            </View>

            <View className="mb-1 flex-row items-baseline justify-between gap-2">
              <Text className="font-sans min-w-0 flex-1 text-caption text-muted2">
                Poids projeté, de {projection.departLabel} à {projection.arriveeLabel}
              </Text>
              <Text className="font-sans flex-none text-caption text-muted2">Cible {cible}</Text>
            </View>
            <ProjectionChart projection={projection} targetLabel={cible} />
          </>
        ) : null}

        <Text
          className={cx(
            'font-sans text-base leading-[21px] text-muted',
            projection.coherent && 'mt-4',
          )}
        >
          {projection.note}
        </Text>

        {rythme ? (
          <View
            className={cx(
              'mt-[14px] rounded-control p-[14px]',
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
    </ColonnesResultat>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <View className="min-w-[130px] flex-1">
      <Text className="font-sans text-caption text-muted2">{label}</Text>
      <Text
        style={{ fontVariant: ['tabular-nums'] }}
        className="text-stat3 font-sans-medium text-ink"
      >
        {value}
      </Text>
      {note ? <Text className="font-sans text-small text-muted">{note}</Text> : null}
    </View>
  );
}
