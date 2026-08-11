'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useColorMode } from '@/theme/ThemeRegistry';
import { useProfile } from './ProfileProvider';
import Icon from './ui/Icon';

export default function AppHeader() {
  const { mode, toggle } = useColorMode();
  const { status } = useProfile();
  const pathname = usePathname();
  const label = mode === 'dark' ? 'Sombre' : 'Clair';
  const showProfileLink = status === 'ready' && pathname !== '/profil';

  return (
    <header className="sticky top-0 z-10 border-b border-divider bg-surface text-ink">
      {/* Un peu plus bas sur mobile : la navigation est passée en bas de l'écran, l'en-tête n'a
          plus à porter que la marque et la bascule de thème. */}
      <div className="mx-auto flex h-14 w-full max-w-[1200px] items-center gap-3 px-4 nav:h-16 nav:gap-4 nav:px-6">
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-3 text-inherit nav:gap-4">
          <span
            aria-hidden
            className="hero-gradient flex size-[30px] flex-none items-center justify-center rounded-[30%] text-caption font-bold tracking-[.02em] nav:size-[34px]"
          >
            MB
          </span>
          <span className="min-w-0 truncate font-display text-option font-semibold tracking-[-.01em] nav:text-h3">
            Métabolisme de base
          </span>
        </Link>

        {/* Masqué sur mobile : la barre du bas porte déjà « Profil », et deux entrées pour la
            même page à deux endroits de l'écran brouillent plus qu'elles n'aident. */}
        {showProfileLink ? (
          <Link
            href="/profil"
            className="hidden flex-none rounded-[var(--radius-control)] px-[14px] py-2 text-base font-semibold text-muted hover:bg-surface2 hover:text-ink nav:inline-flex"
          >
            Mon profil
          </Link>
        ) : null}

        <button
          type="button"
          onClick={toggle}
          title={label}
          aria-label={`Basculer en mode ${mode === 'dark' ? 'clair' : 'sombre'}`}
          className="flex flex-none cursor-pointer items-center gap-2 rounded-full border border-line px-[10px] py-[6px] text-small font-semibold text-muted hover:bg-surface2 hover:text-ink nav:px-[14px]"
        >
          <Icon name={mode === 'dark' ? 'soleil' : 'lune'} size={16} />
          <span className="hidden nav:inline">{label}</span>
        </button>
      </div>
    </header>
  );
}
