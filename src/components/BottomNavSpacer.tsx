'use client';

import Box from '@mui/material/Box';
import { FROM_NAV } from '@/lib/nav';
import { BOTTOM_NAV_HEIGHT } from './BottomNav';
import { useProfile } from './ProfileProvider';

/**
 * Réserve en bas de page la place prise par `BottomNav`, qui est en `position: fixed`.
 *
 * Placé une fois dans le layout racine plutôt que dans chaque page : la barre est globale, son
 * dégagement doit l'être aussi, sinon la prochaine page ajoutée oubliera de le prévoir.
 */
export default function BottomNavSpacer() {
  const { status } = useProfile();
  if (status !== 'ready') return null;

  return (
    <Box
      aria-hidden
      sx={{
        display: 'block',
        [FROM_NAV]: { display: 'none' },
        height: `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom))`,
      }}
    />
  );
}
