'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RESULT_PAGES } from '@/lib/nav';
import Icon from './ui/Icon';
import { cx } from './ui/primitives';

/**
 * Onglets des résultats, à partir de `NAV_BREAKPOINT` seulement : sous cette largeur, la
 * navigation passe par `BottomNav`. Deux barres collantes en haut d'un téléphone mangeaient un
 * cinquième de la hauteur utile, pour une liste qu'il fallait de toute façon faire défiler.
 */
export default function ResultTabs() {
  const pathname = usePathname();

  return (
    <div className="sticky top-16 z-4 hidden bg-bg pt-[10px] pb-[6px] nav:block">
      <nav aria-label="Sections des résultats" className="mx-auto max-w-[1200px] px-6">
        {/* Défilement horizontal plutôt qu'un retour à la ligne : entre 700 et 780 px les quatre
            onglets débordent tout juste, et une deuxième ligne décalerait toute la page. */}
        <ul className="flex gap-[6px] overflow-x-auto">
          {RESULT_PAGES.map((page) => {
            const actif = page.href === pathname;
            return (
              <li key={page.href} className="flex-none">
                <Link
                  href={page.href}
                  aria-current={actif ? 'page' : undefined}
                  className={cx(
                    'flex items-center gap-[7px] rounded-full px-4 py-2 text-base font-semibold',
                    'whitespace-nowrap transition-colors',
                    actif
                      ? 'bg-primary-tint text-primary-ink'
                      : 'text-muted hover:bg-surface2 hover:text-ink',
                  )}
                >
                  <Icon name={page.icon} size={18} />
                  {page.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
