'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { Recipe } from '@/lib/content';
import { scaleIngredient } from '@/lib/quantites';
import Icon from '../ui/Icon';
import { cx } from '../ui/primitives';

/**
 * Le plan de travail d'une recette : portions, ingrédients à cocher, étapes à suivre.
 *
 * Pensé pour un téléphone posé sur un plan de travail, à bout de bras, les mains occupées :
 * cibles larges, texte en pleine opacité plutôt qu'en gris, et rien qui demande de viser.
 *
 * Composant client, mais rendu sur le serveur comme les autres : la liste des ingrédients et les
 * étapes sont bien dans le HTML initial, l'interactivité ne fait que s'y greffer.
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

      <Ingredients
        lignes={recette.ingredients}
        facteur={facteur}
        faits={ingredientsFaits}
        onBascule={bascule(setIngredientsFaits)}
        onReset={() => setIngredientsFaits(new Set())}
      />

      <Etapes
        etapes={recette.etapes}
        faites={etapesFaites}
        onBascule={bascule(setEtapesFaites)}
        onReset={() => setEtapesFaites(new Set())}
      />
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
  const id = useId();
  const bouton =
    'flex size-11 flex-none cursor-pointer items-center justify-center rounded-full border ' +
    'border-line text-h3 leading-none text-primary-ink transition-colors hover:bg-primary-tint ' +
    'disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <section className="card mb-4 p-4 sm:p-5" aria-labelledby={id}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 id={id} className="text-option font-medium">
            Pour combien de personnes&nbsp;?
          </h2>
          <p className="mt-[2px] text-small text-muted tabular-nums">
            Au total&nbsp;: {Math.round(kcal * valeur)} kcal · {Math.round(proteines * valeur)} g de
            protéines
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className={bouton}
            onClick={() => onChange(Math.max(1, valeur - 1))}
            disabled={valeur <= 1}
            aria-label="Une portion de moins"
          >
            −
          </button>
          <output
            className="w-10 text-center font-display text-stat font-semibold tabular-nums"
            aria-live="polite"
            aria-label={`${valeur} portion${valeur > 1 ? 's' : ''}`}
          >
            {valeur}
          </output>
          <button
            type="button"
            className={bouton}
            onClick={() => onChange(Math.min(24, valeur + 1))}
            disabled={valeur >= 24}
            aria-label="Une portion de plus"
          >
            +
          </button>
        </div>
      </div>

      {valeur !== base ? (
        <p className="mt-3 text-caption text-muted2">
          Quantités ajustées depuis la recette d’origine, prévue pour {base} portions.
        </p>
      ) : null}
    </section>
  );
}

/** Ligne cochable : toute la ligne est la cible, on ne vise pas une case de 16 px. */
function Cochable({
  fait,
  onClick,
  children,
  puce,
}: {
  fait: boolean;
  onClick: () => void;
  children: React.ReactNode;
  /** contenu de la case tant qu'elle est vide : un numéro pour les étapes, rien pour le reste */
  puce?: React.ReactNode;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={fait}
        className="flex w-full items-start gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-surface2"
      >
        <span
          aria-hidden
          className={cx(
            'mt-[1px] flex size-6 flex-none items-center justify-center rounded-md border-2 transition-colors',
            fait ? 'border-primary-ink bg-primary-ink text-hero-text' : 'border-line-strong',
          )}
        >
          {fait ? <Icon name="coche" size={15} /> : puce}
        </span>
        <span
          className={cx(
            'text-body leading-[1.5] transition-colors',
            fait ? 'text-faint line-through' : 'text-ink',
          )}
        >
          {children}
        </span>
      </button>
    </li>
  );
}

function EnTete({
  titre,
  faits,
  total,
  onReset,
}: {
  titre: string;
  faits: number;
  total: number;
  onReset: () => void;
}) {
  return (
    <div className="mb-1 flex items-baseline justify-between gap-3">
      <h2 className="font-display text-h3 font-semibold">{titre}</h2>
      {faits > 0 ? (
        <button
          type="button"
          onClick={onReset}
          className="cursor-pointer rounded-full px-2 py-1 text-caption font-medium text-muted2 hover:text-primary-ink"
        >
          {faits}/{total} · tout décocher
        </button>
      ) : (
        <span className="text-caption text-muted2 tabular-nums">{total}</span>
      )}
    </div>
  );
}

function Ingredients({
  lignes,
  facteur,
  faits,
  onBascule,
  onReset,
}: {
  lignes: string[];
  facteur: number;
  faits: Set<number>;
  onBascule: (i: number) => void;
  onReset: () => void;
}) {
  return (
    <section className="card mb-4 p-4 sm:p-5">
      <EnTete titre="Ingrédients" faits={faits.size} total={lignes.length} onReset={onReset} />
      <p className="mb-2 text-small text-muted">Touchez une ligne pour la barrer.</p>
      <ul className="flex flex-col">
        {lignes.map((ligne, i) => (
          <Cochable key={ligne} fait={faits.has(i)} onClick={() => onBascule(i)} puce={null}>
            {scaleIngredient(ligne, facteur)}
          </Cochable>
        ))}
      </ul>
    </section>
  );
}

function Etapes({
  etapes,
  faites,
  onBascule,
  onReset,
}: {
  etapes: string[];
  faites: Set<number>;
  onBascule: (i: number) => void;
  onReset: () => void;
}) {
  return (
    <section className="card mb-4 p-4 sm:p-5">
      <EnTete titre="Étapes" faits={faites.size} total={etapes.length} onReset={onReset} />
      <p className="mb-2 text-small text-muted">
        Cochez au fur et à mesure pour ne pas perdre votre place.
      </p>
      <ol className="flex flex-col">
        {etapes.map((etape, i) => (
          <Cochable
            key={etape}
            fait={faites.has(i)}
            onClick={() => onBascule(i)}
            puce={<span className="text-caption font-bold text-muted2 tabular-nums">{i + 1}</span>}
          >
            {etape}
          </Cochable>
        ))}
      </ol>
    </section>
  );
}

/**
 * Empêche l'écran de s'éteindre pendant la cuisson.
 *
 * `wakeLock` n'existe pas partout et le verrou saute dès que l'onglet passe en arrière-plan : on
 * n'affiche donc le bouton que si l'API est là, et on redemande le verrou au retour sur l'onglet.
 */
export function GarderEcranAllume() {
  const [actif, setActif] = useState(false);
  const [dispo, setDispo] = useState(false);
  const verrou = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    setDispo('wakeLock' in navigator);
  }, []);

  const demander = useCallback(async () => {
    try {
      verrou.current = await navigator.wakeLock.request('screen');
      verrou.current.addEventListener('release', () => setActif(false));
      setActif(true);
    } catch {
      // Refus du navigateur ou batterie faible : on laisse simplement le bouton inactif.
      setActif(false);
    }
  }, []);

  useEffect(() => {
    if (!actif) return;
    const reprendre = () => {
      if (document.visibilityState === 'visible' && !verrou.current?.released) return;
      if (document.visibilityState === 'visible') void demander();
    };
    document.addEventListener('visibilitychange', reprendre);
    return () => document.removeEventListener('visibilitychange', reprendre);
  }, [actif, demander]);

  useEffect(() => {
    return () => {
      void verrou.current?.release();
      verrou.current = null;
    };
  }, []);

  if (!dispo) return null;

  return (
    <button
      type="button"
      aria-pressed={actif}
      onClick={() => {
        if (actif) {
          void verrou.current?.release();
          verrou.current = null;
          setActif(false);
        } else {
          void demander();
        }
      }}
      className={cx(
        'flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-small font-medium transition-colors',
        actif
          ? 'border-primary-ink bg-primary-tint text-primary-ink'
          : 'border-line text-muted hover:text-primary-ink',
      )}
    >
      <Icon name={actif ? 'soleil' : 'lune'} size={16} />
      {actif ? 'Écran maintenu allumé' : 'Garder l’écran allumé'}
    </button>
  );
}
