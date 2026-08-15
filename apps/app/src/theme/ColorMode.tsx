/**
 * Bascule clair / sombre.
 *
 * Même mécanique que sur le web : ce n'est pas un objet de thème passé en contexte, mais une
 * classe posée à la racine. NativeWind redéfinit alors les variables de `global.css`, et tout
 * l'arbre se repeint sans qu'un seul composant ne se re-rende à cause du changement.
 *
 * Contrairement au web, le choix est retenu d'un lancement à l'autre — MMKV lit de façon
 * synchrone, il n'y a donc pas de premier rendu en clair à rattraper.
 */

import { colorScheme, useColorScheme } from 'nativewind';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo } from 'react';
import { loadTheme, type StoredTheme, saveTheme } from '@/lib/store';
import { appliquerClasseTheme } from './classeTheme';

// Appliqué au chargement du module, avant le premier rendu : aucun éclair de thème clair.
//
// Le garde-fou vise l'export statique du web, qui exécute ce module dans Node : il n'y a alors ni
// document où poser la classe, ni préférence enregistrée à lire.
if (typeof window !== 'undefined') colorScheme.set(loadTheme());

interface ColorModeValue {
  /** ce qui est réellement à l'écran, une fois la préférence système résolue */
  mode: 'light' | 'dark';
  toggle: () => void;
}

const ColorModeContext = createContext<ColorModeValue>({ mode: 'light', toggle: () => {} });

export function useColorMode(): ColorModeValue {
  return useContext(ColorModeContext);
}

export default function ColorModeProvider({ children }: { children: ReactNode }) {
  const { colorScheme: current } = useColorScheme();
  const mode = current === 'dark' ? 'dark' : 'light';

  // Le mode **effectif**, et pas seulement celui que l'utilisateur a choisi : tant que la
  // préférence vaut « système », NativeWind ne pose aucune classe sur le web, et les variables CSS
  // restent claires pendant que `usePalette` sert déjà la palette sombre. Voir `classeTheme.web.ts`.
  useEffect(() => {
    appliquerClasseTheme(mode);
  }, [mode]);

  const toggle = useCallback(() => {
    const next: StoredTheme = mode === 'dark' ? 'light' : 'dark';
    colorScheme.set(next);
    saveTheme(next);
  }, [mode]);

  const value = useMemo<ColorModeValue>(() => ({ mode, toggle }), [mode, toggle]);

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
}
