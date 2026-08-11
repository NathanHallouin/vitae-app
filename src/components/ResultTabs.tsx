'use client';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FS } from '@/theme/theme';
import Icon, { type IconName } from './ui/Icon';

/** Une page par question que l'utilisateur se pose. */
export const RESULT_PAGES: { href: string; label: string; icon: IconName }[] = [
  { href: '/metabolisme', label: 'Mon métabolisme', icon: 'flamme' },
  { href: '/alimentation', label: 'Ce que je mange', icon: 'assiette' },
  { href: '/poids', label: 'Mon poids', icon: 'balance' },
  { href: '/bouger', label: 'Bouger', icon: 'course' },
];

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
