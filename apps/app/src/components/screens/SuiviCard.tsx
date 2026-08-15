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
import Overline from '@/components/ui/Overline';
import { Button, Card, NumberField } from '@/components/ui/primitives';
import { useProfile } from '@/state/ProfileProvider';

/**
 * Le suivi de poids : une pesée par semaine, et ce qu'elles disent ensemble.
 *
 * L'application recommandait déjà de refaire le calcul tous les 4 à 5 kg sans donner de quoi le
 * constater. C'est ce que cette carte apporte, et c'est aussi la seule raison qu'a l'application
 * d'être rouverte : les chiffres du métabolisme, eux, ne se demandent qu'une fois.
 *
 * Deux partis pris d'interface :
 *
 * — **La saisie est en tête, pas en bas.** C'est le geste qu'on vient faire ; la courbe est ce
 *   qu'on regarde ensuite. L'inverse obligerait à défiler pour agir.
 * — **La date est celle du jour, et ne se choisit pas.** Le métier accepte une pesée passée — on
 *   se rattrape le dimanche soir — mais un sélecteur de date pour un geste hebdomadaire ajoute
 *   une décision là où il n'y en a pas. Une pesée saisie deux fois le même jour remplace la
 *   précédente, ce qui suffit à corriger une faute de frappe.
 */
export default function SuiviCard({ cible }: { cible?: number }) {
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

  return (
    <Card className="p-6">
      <Overline niveau={2} className="mb-1">
        Où j’en suis
      </Overline>
      {suivi.aReevaluer ? null : (
        <Text className="font-sans mb-4 text-base leading-[22px] text-muted">{suivi.message}</Text>
      )}

      <View className="mb-5 flex-row items-end gap-3">
        <View className="min-w-0 flex-1">
          <Text className="font-sans mb-[6px] text-small text-muted2">Mon poids aujourd’hui</Text>
          <NumberField
            value={saisie}
            onChangeText={setSaisie}
            unit="kg"
            label="Mon poids aujourd’hui, en kilogrammes"
            placeholder={suivi.dernier ? dec(suivi.dernier.poids) : '70'}
          />
        </View>
        <Button variant="contained" onPress={enregistrer} disabled={!valide} className="mb-[1px]">
          Enregistrer
        </Button>
      </View>

      {/* L'avertissement remplace la phrase d'introduction plutôt que de s'y ajouter : deux fois
          le même texte sur une carte, c'est une fois de trop. */}
      {suivi.aReevaluer ? (
        <View className="mb-5 rounded-xl bg-warn-bg p-[14px]">
          <Text className="font-sans text-small leading-[20px] text-warn-ink">{suivi.message}</Text>
        </View>
      ) : null}

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
      ) : null}

      {suivi.dernier ? (
        <View className="mt-5 flex-row flex-wrap gap-5">
          <Chiffre label="Dernière pesée" valeur={`${dec(suivi.dernier.poids)} kg`} />
          {suivi.depuisLeDebut !== null ? (
            <Chiffre label="Depuis la première" valeur={fmtKg(suivi.depuisLeDebut)} />
          ) : null}
          {suivi.tendance !== null ? (
            <Chiffre
              label="Tendance"
              valeur={fmtKgParSemaine(suivi.tendance)}
              note="sur les 4 dernières semaines"
            />
          ) : null}
        </View>
      ) : null}

      {comparaison ? (
        <View className="mt-[14px] rounded-xl bg-surface2 p-[14px]">
          <Text className="font-sans text-small leading-[20px] text-ink">{comparaison}</Text>
        </View>
      ) : null}

      {recentes.length ? (
        <View className="mt-5 border-t border-divider">
          {recentes.map((p) => (
            <View
              key={p.date}
              className="flex-row items-center justify-between gap-3 border-b border-divider py-[10px]"
            >
              <Text className="font-sans min-w-0 flex-1 text-small text-muted">
                {dateCourte(p.date)}
              </Text>
              <Text
                style={{ fontVariant: ['tabular-nums'] }}
                className="flex-none text-base font-sans-medium text-ink"
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
        </View>
      ) : null}
    </Card>
  );
}

function Chiffre({ label, valeur, note }: { label: string; valeur: string; note?: string }) {
  return (
    <View className="min-w-[140px] flex-1">
      <Text className="font-sans text-caption text-muted2">{label}</Text>
      <Text
        style={{ fontVariant: ['tabular-nums'] }}
        className="text-stat3 font-sans-medium text-ink"
      >
        {valeur}
      </Text>
      {note ? <Text className="font-sans text-caption text-muted">{note}</Text> : null}
    </View>
  );
}
