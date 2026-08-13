'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MOBILE_PAGES } from '@vitae/core/nav';
import { useProfile } from './ProfileProvider';
import Icon from './ui/Icon';
import { cx } from './ui/primitives';

/** Hauteur de la barre, hors encoche : reprise par le calage du bas de page. */
export const BOTTOM_NAV_HEIGHT = 60;

/**
 * Navigation principale sur mobile, fixée en bas de l'écran.
 *
 * Elle remplace les onglets du haut sous `NAV_BREAKPOINT`, où quatre onglets larges ne tiennent
 * pas dans la largeur : ils passaient alors en défilement horizontal sans repère, si bien que
 * « Mon poids » et « Bouger » n'existaient tout simplement pas pour qui ne pensait pas à faire
 * glisser la barre. Ici les cinq destinations sont visibles d'un coup, et à portée du pouce.
 *
 * Elle n'apparaît qu'une fois le profil enregistré : avant, il n'y a rien à consulter.
 */
export default function BottomNav() {
  const pathname = usePathname();
  const { status } = useProfile();
  if (status !== 'ready') return null;

  return (
    <nav
      aria-label="Navigation principale"
      // `pb` sur l'encoche : laisse passer la barre d'accueil des iPhone sous les libellés.
      className="fixed inset-x-0 bottom-0 z-20 block border-t border-divider bg-surface pb-[env(safe-area-inset-bottom)] nav:hidden"
    >
      <ul className="flex" style={{ height: BOTTOM_NAV_HEIGHT }}>
        {MOBILE_PAGES.map((page) => {
          const active = pathname === page.href;
          return (
            <li key={page.href} className="min-w-0 flex-1">
              <Link
                href={page.href}
                aria-current={active ? 'page' : undefined}
                className={cx(
                  'flex h-full flex-col items-center justify-center gap-[2px] px-[2px] transition-colors',
                  active ? 'text-primary-ink' : 'text-muted2',
                )}
              >
                {/* Pastille arrondie derrière l'icône, comme les onglets du haut : la couleur
                    seule ne suffirait pas à marquer la page courante en cas de daltonisme. */}
                <span
                  className={cx(
                    'flex h-[26px] w-11 items-center justify-center rounded-full transition-colors',
                    active && 'bg-primary-tint',
                  )}
                >
                  <Icon name={page.icon} size={20} />
                </span>
                {/* Sur les écrans de 320 px, « Métabolisme » ne tient pas dans un cinquième de la
                    largeur : mieux vaut un libellé plus petit qu'un libellé coupé. */}
                <span
                  className={cx(
                    'max-w-full truncate text-micro leading-[1.2] tracking-[-.015em]',
                    'max-[359px]:text-[10px] max-[359px]:tracking-[-.03em]',
                    active ? 'font-semibold' : 'font-medium',
                  )}
                >
                  {page.short}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
