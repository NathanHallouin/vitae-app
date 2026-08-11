'use client';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FROM_NAV, RESULT_PAGES } from '@/lib/nav';
import { FS } from '@/theme/theme';
import Icon from './ui/Icon';

/**
 * Onglets des résultats, à partir de `NAV_BREAKPOINT` seulement : sous cette largeur, la
 * navigation passe par `BottomNav`. Deux barres collantes en haut d'un téléphone mangeaient un
 * cinquième de la hauteur utile, pour une liste qu'il fallait de toute façon faire défiler.
 */
export default function ResultTabs() {
  const pathname = usePathname();
  const current = RESULT_PAGES.find((p) => p.href === pathname)?.href ?? false;

  return (
    <Box
      sx={(t) => ({
        display: 'none',
        [FROM_NAV]: { display: 'block' },
        backgroundColor: t.tokens.bg,
        position: 'sticky',
        top: 64,
        zIndex: 4,
        pt: '10px',
        pb: '6px',
      })}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 3 }}>
        <Tabs
          value={current}
          variant="scrollable"
          // Entre 600 et 700 px les quatre onglets débordent tout juste : sans flèches, les
          // derniers disparaîtraient sans que rien ne le signale.
          scrollButtons="auto"
          aria-label="Sections des résultats"
          sx={{ minHeight: 40 }}
        >
          {RESULT_PAGES.map((page) => (
            <Tab
              key={page.href}
              value={page.href}
              label={page.label}
              icon={<Icon name={page.icon} size={18} />}
              iconPosition="start"
              href={page.href}
              component={Link}
              sx={{ fontSize: FS.base, gap: '7px', minHeight: 40 }}
            />
          ))}
        </Tabs>
      </Box>
    </Box>
  );
}
