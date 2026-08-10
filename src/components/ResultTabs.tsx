'use client';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FS } from '@/theme/theme';

/** Une page par question que l'utilisateur se pose. */
export const RESULT_PAGES = [
  { href: '/metabolisme', label: 'Mon métabolisme' },
  { href: '/alimentation', label: 'Ce que je mange' },
  { href: '/poids', label: 'Mon poids' },
  { href: '/bouger', label: 'Bouger' },
] as const;

export default function ResultTabs() {
  const pathname = usePathname();
  const current = RESULT_PAGES.find((p) => p.href === pathname)?.href ?? false;

  return (
    <Box
      sx={(t) => ({
        backgroundColor: t.tokens.bg,
        position: 'sticky',
        top: 64,
        zIndex: 4,
        pt: '10px',
        pb: '6px',
      })}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 1, sm: 3 } }}>
        <Tabs
          value={current}
          variant="scrollable"
          scrollButtons={false}
          aria-label="Sections des résultats"
          sx={{ minHeight: 40 }}
        >
          {RESULT_PAGES.map((page) => (
            <Tab
              key={page.href}
              value={page.href}
              label={page.label}
              href={page.href}
              component={Link}
              sx={{ fontSize: FS.base }}
            />
          ))}
        </Tabs>
      </Box>
    </Box>
  );
}
