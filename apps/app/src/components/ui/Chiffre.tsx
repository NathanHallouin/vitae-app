import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { MOTION, useMotionReduite } from '@/theme/motion';
import { cx } from './primitives';

/**
 * Le grand chiffre, élément signature de l'application.
 *
 * C'est une application de chiffres : le nombre est ce qu'on vient chercher, et il doit se lire à
 * bout de bras. Le traitement était pourtant réécrit dans huit fichiers, avec des tailles et des
 * interlignes qui divergeaient d'un écran à l'autre — la dépense en 46 px ici, les séances en 40,
 * l'IMC en 32, chacun avec son propre `leading`. Un seul composant remet tout d'aplomb.
 *
 * Trois règles, et elles ne se négocient pas :
 *
 * — la Fraunces, jamais l'Inter. C'est la serif qui fait qu'un écran de cette application se
 *   reconnaît sur une capture ;
 * — des chiffres à chasse fixe, toujours. Sans cela, un nombre qui se met à jour fait sautiller la
 *   ligne entière, et l'effet est celui d'un défaut ;
 * — l'unité en Inter, plus petite, alignée sur la base. C'est le contraste entre les deux qui fait
 *   lire le nombre en premier.
 */

const TAILLES = {
  /** la réponse principale d'un écran : une seule par écran */
  hero: { texte: 'text-[46px]', ligne: 48, unite: 'text-stat3' },
  /** un chiffre important, dans une carte */
  grand: { texte: 'text-display', ligne: 42, unite: 'text-option' },
  /** un chiffre dans une tuile ou une liste */
  moyen: { texte: 'text-stat', ligne: 34, unite: 'text-base' },
  petit: { texte: 'text-stat2', ligne: 26, unite: 'text-small' },
} as const;

export type TailleChiffre = keyof typeof TAILLES;

export default function Chiffre({
  valeur,
  unite,
  taille = 'moyen',
  ton = 'ink',
  anime = false,
  className,
}: {
  /** un nombre pour l'animer, une chaîne quand la valeur est déjà mise en forme */
  valeur: number | string;
  unite?: string;
  taille?: TailleChiffre;
  ton?: 'ink' | 'primary' | 'hero';
  /** fait monter le nombre depuis sa valeur précédente ; sans effet sur une chaîne */
  anime?: boolean;
  className?: string;
}) {
  const t = TAILLES[taille];
  const affiche = useCompteur(valeur, anime);

  const couleur =
    ton === 'primary' ? 'text-primary-ink' : ton === 'hero' ? 'text-hero-text' : 'text-ink';

  return (
    <View className={cx('flex-row items-baseline gap-2', className)}>
      <Text
        // La chasse fixe est portée par le style et non par une classe : `tabular-nums` n'a pas
        // d'équivalent NativeWind qui tienne sur les trois plateformes.
        style={{ fontVariant: ['tabular-nums'], lineHeight: t.ligne }}
        className={cx('font-display', t.texte, couleur)}
      >
        {affiche}
      </Text>
      {unite ? (
        <Text className={cx(t.unite, ton === 'hero' ? 'text-hero-text opacity-85' : 'text-muted')}>
          {unite}
        </Text>
      ) : null}
    </View>
  );
}

/**
 * Fait monter un nombre jusqu'à sa nouvelle valeur.
 *
 * C'est la seule animation de l'application qui porte du sens plutôt que de l'agrément : quand on
 * corrige son poids et que la dépense passe de 2 400 à 2 350, voir le chiffre descendre dit que le
 * calcul vient d'être refait. Affiché sec, le même nombre passe inaperçu.
 *
 * Écrit à la main plutôt qu'avec Reanimated : animer du texte y demande de détourner un champ de
 * saisie, avec un comportement différent sur chaque plateforme, pour une boucle qui tient en dix
 * lignes et fonctionne partout de la même façon.
 *
 * Trois cas court-circuitent l'animation, et le rendu est alors immédiat : le premier affichage —
 * un compteur qui part de zéro au montage donnerait un écran de machine à sous —, une valeur déjà
 * mise en forme, et le réglage « moins de mouvement ».
 */
function useCompteur(valeur: number | string, anime: boolean): string {
  const reduite = useMotionReduite();
  const nombre = typeof valeur === 'number' ? valeur : null;
  const actif = anime && nombre !== null && !reduite;

  const [courant, setCourant] = useState(nombre ?? 0);
  const precedent = useRef(nombre ?? 0);
  const premier = useRef(true);

  useEffect(() => {
    if (nombre === null) return;

    if (!actif || premier.current) {
      premier.current = false;
      precedent.current = nombre;
      setCourant(nombre);
      return;
    }

    const depart = precedent.current;
    const ecart = nombre - depart;
    if (ecart === 0) return;

    const debut = performance.now();
    let image = 0;

    const avancer = (maintenant: number) => {
      const t = Math.min(1, (maintenant - debut) / MOTION.compteur);
      // Décélération : le nombre part vite et se pose, plutôt que de s'arrêter net.
      const adouci = 1 - (1 - t) ** 3;
      setCourant(Math.round(depart + ecart * adouci));
      if (t < 1) image = requestAnimationFrame(avancer);
      else precedent.current = nombre;
    };

    image = requestAnimationFrame(avancer);
    return () => cancelAnimationFrame(image);
  }, [nombre, actif]);

  if (typeof valeur === 'string') return valeur;
  // Les milliers sont séparés d'une espace insécable, comme partout ailleurs dans l'application.
  return courant.toLocaleString('fr-FR').replace(/ |\s/g, ' ');
}
