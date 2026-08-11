'use client';

import Box from '@mui/material/Box';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FROM_NAV, MOBILE_PAGES } from '@/lib/nav';
import { FS } from '@/theme/theme';
import { useProfile } from './ProfileProvider';
import Icon from './ui/Icon';

/** Hauteur de la barre, hors encoche : reprise par le calage du bas de page. */
export const BOTTOM_NAV_HEIGHT = 60;

/**
 * Navigation principale sur mobile, fixée en bas de l'écran.
 *
 * Elle remplace les onglets du haut sous `sm`, où quatre onglets larges ne tiennent pas dans la
 * largeur : ils passaient alors en défilement horizontal sans flèches, si bien que « Mon poids »
 * et « Bouger » n'existaient tout simplement pas pour qui ne pensait pas à faire glisser la barre.
 * Ici les cinq destinations sont visibles d'un coup, et à portée du pouce plutôt qu'en haut de
 * l'écran.
 *
 * Elle n'apparaît qu'une fois le profil enregistré : avant, il n'y a rien à consulter.
 */
export default function BottomNav() {
  const pathname = usePathname();
  const { status } = useProfile();
  if (status !== 'ready') return null;

  return (
    <Box
      component="nav"
      aria-label="Navigation principale"
      sx={(t) => ({
        display: 'block',
        [FROM_NAV]: { display: 'none' },
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: t.zIndex.appBar,
        backgroundColor: t.tokens.surface,
        borderTop: `1px solid ${t.tokens.divider}`,
        // Laisse passer la barre d'accueil des iPhone sous les libellés.
        pb: 'env(safe-area-inset-bottom)',
      })}
    >
      <Box sx={{ display: 'flex', height: BOTTOM_NAV_HEIGHT }}>
        {MOBILE_PAGES.map((page) => {
          const active = pathname === page.href;
          return (
            <Box
              key={page.href}
              component={Link}
              href={page.href}
              aria-current={active ? 'page' : undefined}
              sx={(t) => ({
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '2px',
                px: '2px',
                textDecoration: 'none',
                color: active ? t.tokens.primaryInk : t.tokens.muted2,
                transition: 'color .15s ease',
              })}
            >
              {/* Pastille arrondie derrière l'icône, comme les onglets du haut : la couleur seule
                  ne suffirait pas à marquer la page courante en cas de daltonisme. */}
              <Box
                sx={(t) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 44,
                  height: 26,
                  borderRadius: 999,
                  backgroundColor: active ? t.tokens.primaryTint : 'transparent',
                  transition: 'background-color .15s ease',
                })}
              >
                <Icon name={page.icon} size={20} />
              </Box>
              <Box
                component="span"
                sx={{
                  fontSize: FS.micro,
                  fontWeight: active ? 600 : 500,
                  lineHeight: 1.2,
                  letterSpacing: '-.015em',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  // Sur les écrans de 320 px, « Métabolisme » ne tient pas dans un cinquième de
                  // la largeur : mieux vaut un libellé plus petit qu'un libellé coupé.
                  '@media (max-width: 359px)': { fontSize: 10, letterSpacing: '-.03em' },
                }}
              >
                {page.short}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
