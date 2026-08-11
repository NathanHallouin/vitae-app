'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

type Mode = 'light' | 'dark';

interface ColorModeValue {
  mode: Mode;
  toggle: () => void;
}

const ColorModeContext = createContext<ColorModeValue>({ mode: 'light', toggle: () => {} });

export function useColorMode() {
  return useContext(ColorModeContext);
}

/**
 * Bascule clair / sombre.
 *
 * Le thème est une classe sur `<html>`, pas un objet passé en contexte : les couleurs sont des
 * variables CSS (voir `app/globals.css`), donc changer la classe suffit à tout repeindre, sans
 * re-rendu de l'arbre. Seuls les composants qui ont besoin de connaître le mode — le bouton de
 * bascule, qui affiche un soleil ou une lune — s'abonnent au contexte.
 */
export default function ThemeRegistry({
  children,
  defaultMode = 'light',
}: {
  children: ReactNode;
  defaultMode?: Mode;
}) {
  const [mode, setMode] = useState<Mode>(defaultMode);

  const toggle = useCallback(() => {
    setMode((m) => {
      const next = m === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  }, []);

  const value = useMemo<ColorModeValue>(() => ({ mode, toggle }), [mode, toggle]);

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
}
