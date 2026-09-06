/**
 * Bascule clair / sombre.
 *
 * Même mécanique que sur le web : ce n'est pas un objet de thème passé en contexte, mais une
 * classe posée à la racine. NativeWind redéfinit alors les variables de `global.css`, et tout
 * l'arbre se repeint sans qu'un seul composant ne se re-rende à cause du changement.
 *
 * Contrairement au web, le choix est retenu d'un lancement à l'autre — MMKV lit de façon
 * synchrone, il n'y a donc pas de premier rendu en clair à rattraper.
 *
 * **Trois choix, et non une bascule.** La bascule vivait dans l'en-tête, d'où toute commande a été
 * retirée : le haut de l'écran porte l'identité, pas les réglages. Elle avait de toute façon un
 * défaut qu'un tour de plus ne réglait pas — deux états ne peuvent pas exprimer « suis le
 * téléphone », qui est pourtant le réglage par défaut et celui que la plupart des gens veulent.
 */

import { colorScheme, useColorScheme } from 'nativewind';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
  /**
   * Ce que l'utilisateur a choisi, `système` compris.
   *
   * Distinct du mode effectif, et c'est indispensable : « Système » est un choix à part entière,
   * et un réglage qui ne saurait afficher que le résultat obligerait à deviner si l'application
   * est en sombre parce qu'on l'a demandé ou parce que le téléphone l'est.
   */
  preference: StoredTheme;
  setPreference: (theme: StoredTheme) => void;
}

const ColorModeContext = createContext<ColorModeValue>({
  mode: 'light',
  preference: 'system',
  setPreference: () => {},
});

export function useColorMode(): ColorModeValue {
  return useContext(ColorModeContext);
}

export default function ColorModeProvider({ children }: { children: ReactNode }) {
  const { colorScheme: current } = useColorScheme();
  const mode = current === 'dark' ? 'dark' : 'light';

  // La préférence est relue du stockage plutôt que déduite du mode : `loadTheme()` rend bien
  // `system` quand rien n'a été choisi, ce que le mode effectif ne peut pas dire.
  const [preference, setPreferenceState] = useState<StoredTheme>(() => loadTheme());

  // Le mode **effectif**, et pas seulement celui que l'utilisateur a choisi : tant que la
  // préférence vaut « système », NativeWind ne pose aucune classe sur le web, et les variables CSS
  // restent claires pendant que `usePalette` sert déjà la palette sombre. Voir `classeTheme.web.ts`.
  useEffect(() => {
    appliquerClasseTheme(mode);
  }, [mode]);

  const setPreference = useCallback((theme: StoredTheme) => {
    colorScheme.set(theme);
    saveTheme(theme);
    setPreferenceState(theme);
  }, []);

  const value = useMemo<ColorModeValue>(
    () => ({ mode, preference, setPreference }),
    [mode, preference, setPreference],
  );

  return <ColorModeContext.Provider value={value}>{children}</ColorModeContext.Provider>;
}
