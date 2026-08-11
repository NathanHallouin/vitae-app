'use client';

import Box from '@mui/material/Box';
import { useTokens } from '@/theme/ThemeRegistry';

/**
 * Illustration d'accueil : une jauge d'énergie, la flamme du métabolisme au centre, et le rythme
 * de la dépense sur la journée en dessous. Purement graphique — aucun texte, donc rien à traduire
 * ni à faire grossir avec la largeur d'affichage.
 *
 * La jauge est tracée en deux temps : la piste complète, puis la portion remplie par-dessus. Sans
 * la piste entière, la partie non remplie se lit comme un trait resté là par erreur.
 */

/** Rythme de la dépense sur la journée : creux la nuit, pic en milieu de journée. */
const RYTHME = [10, 16, 26, 21, 36, 30, 20, 14, 9].map((hauteur, i) => ({
  hauteur,
  // Les barres tiennent dans l'ouverture de la jauge, entre ses deux extrémités.
  x: 92 + i * 15.9,
}));

const PIC = 36;
const BASELINE = 196;
const BAR_W = 9;

export default function HomeIllustration() {
  const t = useTokens();

  return (
    <Box
      component="svg"
      viewBox="0 0 320 208"
      role="img"
      aria-label="Une jauge d’énergie surmontée d’une flamme, au-dessus du rythme de la dépense sur une journée"
      sx={{ width: '100%', maxWidth: 400, height: 'auto', display: 'block', mx: 'auto' }}
    >
      {/* Disque : pose la flamme sur un fond, sans bord dur. Teinte chaude plutôt que le bleu
          translucide, qui vire au gris sur le fond crème. */}
      <circle cx="160" cy="112" r="44" fill={t.surface2} />

      {/* Jauge : piste complète, puis portion remplie */}
      <path
        d="M86.7 138.7A78 78 0 1 1 233.3 138.7"
        fill="none"
        stroke={t.divider}
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M86.7 138.7A78 78 0 0 1 215.2 56.8"
        fill="none"
        stroke={t.primary}
        strokeWidth="12"
        strokeLinecap="round"
      />
      <circle cx="215.2" cy="56.8" r="7.5" fill={t.surface} stroke={t.primary} strokeWidth="4" />

      {/* Flamme : le tracé du jeu d'icônes, agrandi */}
      <g transform="translate(121.6 80) scale(3.2)">
        <path
          d="M12 3c2.8 3.2 4.8 5.6 4.8 8.6a4.8 4.8 0 0 1-9.6 0c0-1.7.8-3 1.8-4 .2 1.3.9 2 1.7 2 1.1 0 1.6-.9 1.6-2.2 0-1.5-.5-2.9-.3-4.4Z"
          fill="none"
          stroke={t.primaryInk}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </g>

      {/* Rythme de la journée */}
      {RYTHME.map((barre) => (
        <rect
          key={barre.x}
          x={barre.x}
          y={BASELINE - barre.hauteur}
          width={BAR_W}
          height={barre.hauteur}
          rx={BAR_W / 2}
          fill={t.primaryInk}
          opacity={0.22 + (barre.hauteur / PIC) * 0.5}
        />
      ))}
    </Box>
  );
}
