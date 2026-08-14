import type { Recipe } from '@vitae/content';
import { scaleIngredient } from '@vitae/core/quantites';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { type ReactNode, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { usePalette } from '@/theme/palette';
import Chiffre from '../ui/Chiffre';
import Icon from '../ui/Icon';
import { Card, cx } from '../ui/primitives';

/**
 * Le plan de travail d'une recette : portions, ingrédients à cocher, étapes à suivre.
 *
 * Pensé pour un téléphone posé sur un plan de travail, à bout de bras, les mains occupées :
 * cibles larges, texte en pleine opacité plutôt qu'en gris, et rien qui demande de viser.
 */
export default function RecetteAtelier({ recette }: { recette: Recipe }) {
  const [portions, setPortions] = useState(recette.portions);
  const [ingredientsFaits, setIngredientsFaits] = useState<Set<number>>(new Set());
  const [etapesFaites, setEtapesFaites] = useState<Set<number>>(new Set());

  const facteur = portions / recette.portions;

  const bascule = (setter: typeof setIngredientsFaits) => (i: number) =>
    setter((prev) => {
      const suivant = new Set(prev);
      if (suivant.has(i)) suivant.delete(i);
      else suivant.add(i);
      return suivant;
    });

  return (
    <>
      <Portions
        valeur={portions}
        base={recette.portions}
        onChange={setPortions}
        kcal={recette.kcal}
        proteines={recette.proteines}
      />

      <Section
        titre="Ingrédients"
        faits={ingredientsFaits.size}
        total={recette.ingredients.length}
        onReset={() => setIngredientsFaits(new Set())}
        consigne="Touchez une ligne pour la barrer."
      >
        {recette.ingredients.map((ligne, i) => (
          <Cochable
            key={ligne}
            fait={ingredientsFaits.has(i)}
            onPress={() => bascule(setIngredientsFaits)(i)}
          >
            {scaleIngredient(ligne, facteur)}
          </Cochable>
        ))}
      </Section>

      <Section
        titre="Étapes"
        faits={etapesFaites.size}
        total={recette.etapes.length}
        onReset={() => setEtapesFaites(new Set())}
        consigne="Cochez au fur et à mesure pour ne pas perdre votre place."
      >
        {recette.etapes.map((etape, i) => (
          <Cochable
            key={etape}
            fait={etapesFaites.has(i)}
            onPress={() => bascule(setEtapesFaites)(i)}
            puce={i + 1}
          >
            {etape}
          </Cochable>
        ))}
      </Section>
    </>
  );
}

/**
 * Sélecteur de portions.
 *
 * Les valeurs par portion ne bougent évidemment pas avec le nombre de portions : ce qu'on affiche
 * en regard, c'est le total du plat, qui est l'information utile quand on cuisine pour plusieurs.
 */
function Portions({
  valeur,
  base,
  onChange,
  kcal,
  proteines,
}: {
  valeur: number;
  base: number;
  onChange: (n: number) => void;
  kcal: number;
  proteines: number;
}) {
  return (
    <Card className="mb-4 p-4">
      <View className="flex-row items-center justify-between gap-4">
        <View className="min-w-0 flex-1">
          <Text className="text-option font-sans-medium text-ink">Pour combien de personnes ?</Text>
          <Text
            style={{ fontVariant: ['tabular-nums'] }}
            className="mt-[2px] text-small text-muted"
          >
            Au total : {Math.round(kcal * valeur)} kcal · {Math.round(proteines * valeur)} g de
            protéines
          </Text>
        </View>

        <View className="flex-row items-center gap-3">
          <BoutonPortion
            signe="−"
            label="Une portion de moins"
            disabled={valeur <= 1}
            onPress={() => onChange(Math.max(1, valeur - 1))}
          />
          <View
            accessibilityLiveRegion="polite"
            accessibilityLabel={`${valeur} portion${valeur > 1 ? 's' : ''}`}
            className="w-10 items-center"
          >
            <Chiffre valeur={valeur} taille="moyen" />
          </View>
          <BoutonPortion
            signe="+"
            label="Une portion de plus"
            disabled={valeur >= 24}
            onPress={() => onChange(Math.min(24, valeur + 1))}
          />
        </View>
      </View>

      {valeur !== base ? (
        <Text className="mt-3 text-caption text-muted2">
          Quantités ajustées depuis la recette d’origine, prévue pour {base} portions.
        </Text>
      ) : null}
    </Card>
  );
}

/** 44 px de côté : la cible minimale recommandée par Apple, et la bonne taille pour un pouce. */
function BoutonPortion({
  signe,
  label,
  disabled,
  onPress,
}: {
  signe: string;
  label: string;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      className={cx(
        'size-11 flex-none items-center justify-center rounded-full border border-line active:bg-primary-tint',
        disabled && 'opacity-40',
      )}
    >
      <Text className="text-h3 text-primary-ink">{signe}</Text>
    </Pressable>
  );
}

function Section({
  titre,
  faits,
  total,
  onReset,
  consigne,
  children,
}: {
  titre: string;
  faits: number;
  total: number;
  onReset: () => void;
  consigne: string;
  children: ReactNode;
}) {
  return (
    <Card className="mb-4 p-4">
      <View className="mb-1 flex-row items-baseline justify-between gap-3">
        <Text className="font-display text-h3 text-ink">{titre}</Text>
        {faits > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tout décocher"
            onPress={onReset}
            className="rounded-full px-2 py-1"
          >
            <Text className="text-caption font-sans-medium text-muted2">
              {faits}/{total} · tout décocher
            </Text>
          </Pressable>
        ) : (
          <Text style={{ fontVariant: ['tabular-nums'] }} className="text-caption text-muted2">
            {total}
          </Text>
        )}
      </View>
      <Text className="mb-2 text-small text-muted">{consigne}</Text>
      <View>{children}</View>
    </Card>
  );
}

/** Ligne cochable : toute la ligne est la cible, on ne vise pas une case de 16 px. */
function Cochable({
  fait,
  onPress,
  children,
  puce,
}: {
  fait: boolean;
  onPress: () => void;
  children: ReactNode;
  /** numéro affiché tant que la case est vide, pour les étapes */
  puce?: number;
}) {
  const palette = usePalette();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: fait }}
      onPress={onPress}
      className="w-full flex-row items-start gap-3 rounded-xl px-2 py-3 active:bg-surface2"
    >
      <View
        className={cx(
          'mt-[1px] size-6 flex-none items-center justify-center rounded-md border-2',
          fait ? 'border-primary-ink bg-primary-ink' : 'border-line-strong',
        )}
      >
        {fait ? (
          <Icon name="coche" size={15} color={palette.heroText} />
        ) : puce !== undefined ? (
          <Text
            style={{ fontVariant: ['tabular-nums'] }}
            className="text-caption font-sans-bold text-muted2"
          >
            {puce}
          </Text>
        ) : null}
      </View>
      <Text
        className={cx(
          'flex-1 text-body leading-[24px]',
          fait ? 'text-faint line-through' : 'text-ink',
        )}
      >
        {children}
      </Text>
    </Pressable>
  );
}

/**
 * Empêche l'écran de s'éteindre pendant la cuisson.
 *
 * Sur le web, c'était un bouton : l'API `wakeLock` n'existe pas partout et le verrou saute dès que
 * l'onglet passe en arrière-plan, il fallait donc laisser l'utilisateur le reprendre. En natif,
 * `expo-keep-awake` est fiable et se relâche seul quand l'écran est quitté : il n'y a plus rien à
 * décider, donc plus de bouton à afficher — on active pendant qu'on est sur la recette, et c'est
 * tout.
 *
 * `activateKeepAwakeAsync` est sans effet sur le web quand l'API manque : le composant ne rend
 * rien de toute façon.
 */
export function GarderEcranAllume() {
  useEffect(() => {
    let annule = false;
    activateKeepAwakeAsync('recette').catch(() => {
      // Refus du système ou batterie faible : l'écran s'éteindra normalement, rien de plus.
    });
    return () => {
      annule = true;
      if (annule) deactivateKeepAwake('recette');
    };
  }, []);

  return null;
}
