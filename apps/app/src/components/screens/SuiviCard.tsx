import { todayISO } from '@vitae/core/date';
import { dec, fmtKg, fmtKgParSemaine } from '@vitae/core/format';
import {
  comparerAuPlan,
  construireCourbe,
  dateCourte,
  POIDS_MAX,
  POIDS_MIN,
} from '@vitae/core/suivi';
import { useState } from 'react';
import { Text, View } from 'react-native';
import CourbePoids from '@/components/screens/CourbePoids';
import IllustrationPesee from '@/components/ui/illustrations/IllustrationPesee';
import { Ligne, Lignes } from '@/components/ui/Ligne';
import Overline from '@/components/ui/Overline';
import { Button, Card, NumberField } from '@/components/ui/primitives';
import { useProfile } from '@/state/ProfileProvider';

/** Ce que les deux boutons de l'écran ouvrent ; `null` = ni l'un ni l'autre. */
export type VueSuivi = 'peser' | 'historique' | null;

/**
 * Le suivi de poids : une pesée par semaine, et ce qu'elles disent ensemble.
 *
 * L'application recommandait déjà de refaire le calcul tous les 4 à 5 kg sans donner de quoi le
 * constater. C'est ce que cette carte apporte, et c'est aussi la seule raison qu'a l'application
 * d'être rouverte : les chiffres du métabolisme, eux, ne se demandent qu'une fois.
 *
 * Depuis la refonte, elle est en trois morceaux plutôt qu'en un, et c'est ce que le cadran a
 * imposé. La réponse de l'écran est en haut, dans l'arc ; une carte de saisie posée juste en
 * dessous entrait en concurrence avec elle, et la liste des pesées repoussait la projection
 * — pourtant la raison d'être de l'écran — sous la ligne de flottaison.
 *
 * — **La saisie et l'historique sont fermés par défaut**, ouverts par les deux boutons sous le
 *   cadran. Ce sont deux gestes ponctuels : on se pèse une fois par semaine, on relit sa liste
 *   encore moins souvent.
 * — **La tendance, elle, reste toujours visible.** C'est une lecture, pas un geste, et c'est ce
 *   que l'arc au-dessus donne envie de vérifier.
 *
 * Les deux panneaux fermés restent dans le document (`display: 'none'`, jamais un rendu
 * conditionnel), comme partout ailleurs : c'est ce qui les laisse dans le HTML livré.
 *
 * **La date est celle du jour, et ne se choisit pas.** Le métier accepte une pesée passée — on se
 * rattrape le dimanche soir — mais un sélecteur de date pour un geste hebdomadaire ajoute une
 * décision là où il n'y en a pas. Une pesée saisie deux fois le même jour remplace la précédente,
 * ce qui suffit à corriger une faute de frappe.
 */
export default function SuiviCard({ cible, vue }: { cible?: number; vue: VueSuivi }) {
  const { suivi, ajouterPesee, supprimerPesee, metrics } = useProfile();
  const [saisie, setSaisie] = useState('');

  const valeur = Number.parseFloat(saisie.replace(',', '.'));
  const valide = Number.isFinite(valeur) && valeur >= POIDS_MIN && valeur <= POIDS_MAX;

  const enregistrer = () => {
    if (!valide) return;
    ajouterPesee({ date: todayISO(), poids: valeur });
    setSaisie('');
  };

  // La cible sert de ligne de mire sur la courbe ; sans plan choisi, il n'y en a pas.
  const courbe = construireCourbe(suivi.historique, cible ?? null);
  const rythmePrevu = metrics ? ((metrics.target - metrics.tdee) * 7) / 7700 : null;
  const comparaison = rythmePrevu === null ? null : comparerAuPlan(suivi.tendance, rythmePrevu);

  // Les plus récentes d'abord : c'est l'ordre dans lequel on relit un journal.
  const recentes = [...suivi.historique].reverse().slice(0, 6);

  const phrase = suivi.aReevaluer ? comparaison : (comparaison ?? suivi.message);

  return (
    <>
      <View style={{ display: vue === 'peser' ? 'flex' : 'none' }}>
        <Card className="px-[18px] py-4">
          <Overline niveau={2} className="mb-[10px]">
            Ma pesée du jour
          </Overline>
          <View className="flex-row items-end gap-3">
            <View className="min-w-0 flex-1">
              <NumberField
                value={saisie}
                onChangeText={setSaisie}
                unit="kg"
                label="Mon poids aujourd’hui, en kilogrammes"
                placeholder={suivi.dernier ? dec(suivi.dernier.poids) : '70'}
              />
            </View>
            <Button variant="contained" onPress={enregistrer} disabled={!valide}>
              Enregistrer
            </Button>
          </View>
          <Text className="font-sans mt-[10px] text-caption text-muted2">
            Le matin à jeun, toujours dans les mêmes conditions. Une pesée par jour : la seconde
            remplace la première.
          </Text>
        </Card>
      </View>

      <View style={{ display: vue === 'historique' ? 'flex' : 'none' }}>
        <Card className="px-[18px] py-4">
          <Overline niveau={2} className="mb-[10px]">
            Toutes mes pesées
          </Overline>

          {/* Tant qu'une seule pesée ne fait pas une courbe, l'image tient la place et dit ce qui
              manque : la répétition, pas la balance. */}
          {courbe ? (
            <>
              <View className="mb-1 flex-row items-baseline justify-between gap-2">
                <Text className="font-sans min-w-0 flex-1 text-caption text-muted2">
                  De {courbe.hautLabel} à {courbe.basLabel}
                </Text>
                <Text className="font-sans flex-none text-caption text-muted2">
                  {suivi.historique.length} pesées
                </Text>
              </View>
              <CourbePoids courbe={courbe} />
            </>
          ) : (
            <View className="items-center">
              <IllustrationPesee />
            </View>
          )}

          {recentes.length ? (
            <Lignes className="mt-4 border-divider border-t">
              {recentes.map((p) => (
                <View key={p.date} className="flex-row items-center justify-between gap-3 py-[6px]">
                  <Text className="font-sans min-w-0 flex-1 text-base text-muted">
                    {dateCourte(p.date)}
                  </Text>
                  <Text
                    style={{ fontVariant: ['tabular-nums'] }}
                    className="flex-none font-sans-bold text-stat3 text-ink"
                  >
                    {dec(p.poids)} kg
                  </Text>
                  <Button
                    size="small"
                    onPress={() => supprimerPesee(p.date)}
                    accessibilityLabel={`Supprimer la pesée du ${dateCourte(p.date)}`}
                  >
                    Retirer
                  </Button>
                </View>
              ))}
            </Lignes>
          ) : null}
        </Card>
      </View>

      <Card className="px-[18px] py-4">
        <Overline niveau={2} className="mb-[10px]">
          Ce que disent vos pesées
        </Overline>

        <Lignes>
          <Ligne
            label="Tendance constatée"
            valeur={suivi.tendance === null ? '—' : fmtKgParSemaine(suivi.tendance)}
          />
          {rythmePrevu === null ? null : (
            // `mesure` met le rythme du plan en `accent` : c'est la valeur prévue, face à laquelle
            // la tendance du dessus se lit. Deux chiffres de même couleur ne se compareraient pas.
            <Ligne label="Rythme prévu par le plan" valeur={fmtKgParSemaine(rythmePrevu)} mesure />
          )}
          {suivi.depuisLeDebut === null ? null : (
            <Ligne label="Depuis la première pesée" valeur={fmtKg(suivi.depuisLeDebut)} />
          )}
        </Lignes>

        {/* `suivi.message` sert de repli quand il n'y a pas encore de tendance à comparer — sauf
            quand le poids a trop bougé, où il porte déjà l'avertissement du bas : l'écrire deux
            fois sur une même carte, c'est une fois de trop. */}
        {phrase ? (
          <Text className="font-sans mt-[10px] text-small leading-[20px] text-muted">{phrase}</Text>
        ) : null}

        {suivi.aReevaluer ? (
          <View className="mt-3 rounded-control bg-warn-bg px-[14px] py-3">
            <Text className="font-sans text-small leading-[20px] text-warn-ink">
              {suivi.message}
            </Text>
          </View>
        ) : null}
      </Card>
    </>
  );
}
