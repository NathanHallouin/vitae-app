/**
 * Jeu d'icônes maison, dessiné sur une grille de 24 px.
 *
 * Pas de dépendance : le tracé est au trait, en `currentColor`, pour hériter de la couleur du
 * texte et fonctionner en thème clair comme en sombre sans variante à maintenir. Les icônes sont
 * décoratives et toujours doublées d'un libellé lisible : elles sont donc masquées aux lecteurs
 * d'écran, sauf si un `title` est fourni explicitement.
 */

const PATHS = {
  // Navigation et résultats
  flamme: (
    <path d="M12 3c2.8 3.2 4.8 5.6 4.8 8.6a4.8 4.8 0 0 1-9.6 0c0-1.7.8-3 1.8-4 .2 1.3.9 2 1.7 2 1.1 0 1.6-.9 1.6-2.2 0-1.5-.5-2.9-.3-4.4Z" />
  ),
  assiette: (
    <>
      <path d="M3.5 12.5h17" />
      <path d="M5 12.5a7 7 0 0 0 14 0" />
      <path d="M9.5 4.5c-.9 1.1-.9 2 0 3.1M14.5 4.5c-.9 1.1-.9 2 0 3.1" />
    </>
  ),
  balance: (
    <>
      <path d="M12 5v15" />
      <path d="M7 20h10" />
      <path d="M4.5 8.5h15" />
      <path d="M4.5 8.5 2 13.5h5Z" />
      <path d="M19.5 8.5 17 13.5h5Z" />
    </>
  ),
  course: (
    <>
      <circle cx="14" cy="4.5" r="2" />
      <path d="M9 21l3.5-5.5-2.5-3 1-4.5" />
      <path d="M11 8l4 2 1.5 3" />
      <path d="M12.5 15.5l4 1.5" />
      <path d="M4 9h3.5M3 13h3.5M5 17h2.5" />
    </>
  ),

  // Bascule de thème
  soleil: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5M12 19.5V22M22 12h-2.5M4.5 12H2M19.1 4.9l-1.8 1.8M6.7 17.3l-1.8 1.8M19.1 19.1l-1.8-1.8M6.7 6.7 4.9 4.9" />
    </>
  ),
  lune: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />,

  // Mouvement du quotidien
  bureau: (
    <>
      <rect x="4" y="4" width="14" height="9" rx="1.5" />
      <path d="M11 13v3" />
      <path d="M7.5 16h7" />
      <path d="M2 19.5h20" />
    </>
  ),
  marche: (
    <>
      <circle cx="12.5" cy="4" r="2" />
      <path d="M12.5 8v5" />
      <path d="M12.5 13l-2.5 7" />
      <path d="M12.5 13l3 3 .5 4" />
      <path d="M12.5 9l-3 2" />
      <path d="M12.5 9l3.5 1.5" />
    </>
  ),
  debout: (
    <>
      <circle cx="12" cy="4.5" r="2" />
      <path d="M12 8.5v6" />
      <path d="M12 14.5l-2.5 6M12 14.5l2.5 6" />
      <path d="M7.5 11h9" />
    </>
  ),
  caisse: (
    <>
      <rect x="4" y="7" width="16" height="12" rx="1.5" />
      <path d="M4 11h16" />
      <path d="M10 7V4h4v3" />
    </>
  ),

  // Entraînement
  haltere: (
    <>
      <path d="M9 12h6" />
      <rect x="4.5" y="7.5" width="4.5" height="9" rx="1.5" />
      <rect x="15" y="7.5" width="4.5" height="9" rx="1.5" />
    </>
  ),
  aucun: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M8.5 12h7" />
    </>
  ),

  // Objectifs
  flecheBas: (
    <>
      <path d="M12 4.5v13" />
      <path d="M6.5 12 12 17.5 17.5 12" />
    </>
  ),
  flecheHaut: (
    <>
      <path d="M12 19.5v-13" />
      <path d="M6.5 12 12 6.5 17.5 12" />
    </>
  ),
  flechesOpposees: (
    <>
      <path d="M7.5 20V5M7.5 5 4 8.5M7.5 5 11 8.5" />
      <path d="M16.5 4v15M16.5 19 20 15.5M16.5 19 13 15.5" />
    </>
  ),
  egal: <path d="M5 9.5h14M5 14.5h14" />,

  // Macronutriments
  oeuf: <path d="M12 3.5c3.3 0 6 4.2 6 8.2a6 6 0 0 1-12 0c0-4 2.7-8.2 6-8.2Z" />,
  goutte: <path d="M12 3.5c3.5 4.2 5.5 7 5.5 9.5a5.5 5.5 0 0 1-11 0c0-2.5 2-5.3 5.5-9.5Z" />,
  ble: (
    <>
      <path d="M12 21V8.5" />
      <path d="M12 8.5c-3 0-4.5-1.9-4.5-4.5C10.5 4 12 6 12 8.5Z" />
      <path d="M12 8.5c3 0 4.5-1.9 4.5-4.5C13.5 4 12 6 12 8.5Z" />
      <path d="M12 15.5c-2.6 0-4-1.6-4-3.6 2.6 0 4 1.6 4 3.6Z" />
      <path d="M12 15.5c2.6 0 4-1.6 4-3.6-2.6 0-4 1.6-4 3.6Z" />
    </>
  ),

  // Lien sortant : flèche hors du cadre, convention établie pour « ouvre un autre site »
  lienExterne: (
    <>
      <path d="M14 4.5h5.5V10" />
      <path d="M19.5 4.5 11 13" />
      <path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" />
    </>
  ),

  // Page d'accueil
  eclair: <path d="M13 2.5 5 13.5h6l-1 8 8-11h-6l1-8Z" />,
  silhouette: (
    <>
      <circle cx="12" cy="6" r="3.2" />
      <path d="M5 20.5a7 7 0 0 1 14 0" />
    </>
  ),
} as const;

export type IconName = keyof typeof PATHS;

export default function Icon({
  name,
  size = 20,
  title,
  className,
}: {
  name: IconName;
  size?: number;
  /** Renseigné uniquement quand l'icône porte seule le sens : elle devient alors annoncée. */
  title?: string;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
      style={{ flex: 'none', display: 'block' }}
    >
      {PATHS[name]}
    </svg>
  );
}
