/**
 * En natif, il n'y a pas de pré-rendu à rattraper : le premier rendu est déjà celui du navigateur.
 *
 * La variante `.web.ts` porte le correctif, et son commentaire explique ce qu'il répare.
 */
export function useHydrate(): boolean {
  return true;
}
