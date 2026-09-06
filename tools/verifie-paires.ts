/**
 * Les deux moitiés d'une paire de plateforme exportent-elles la même chose ?
 *
 * ## Le trou que ce script bouche
 *
 * `AGENTS.md` interdit les tests `Platform.OS` : une différence web / natif passe par un fichier
 * que Metro choisit — `store.ts` et `store.web.ts`. La règle est bonne et la CI la fait respecter.
 *
 * Mais **rien ne vérifiait que les deux moitiés se correspondent**, et TypeScript ne peut pas le
 * faire : il résout toujours la variante sans suffixe. Un export présent d'un seul côté compile
 * donc sans un mot, et casse à l'exécution sur l'autre plateforme — ou pire, ne casse pas.
 *
 * C'est ce qui est arrivé. `ProfileProvider` importe `LECTURE_IMMEDIATE` de `@/lib/store` ;
 * `store.web.ts` ne l'exportait pas. Sur le web elle valait `undefined`, donc faux, donc la bonne
 * branche — **par coïncidence**. Inverser la polarité du drapeau aurait suffi à retourner le
 * comportement du site en silence.
 *
 * ## Ce que le script compare
 *
 * Les noms exportés, pas les types. Comparer les signatures demanderait le compilateur ; les noms
 * attrapent la faute qui compte — un morceau du contrat présent d'un seul côté. Les types partagés
 * restent le meilleur outil quand la paire en a un, comme `SeoProps` : là, c'est le compilateur qui
 * tient les deux fichiers ensemble, et ce script ne fait que confirmer.
 *
 * `bun run verifie:paires`
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Glob } from 'bun';

const RACINE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = path.join(RACINE, 'apps/app');

/** Les noms exportés d'un module, `default` compris. */
async function exports(fichier: string): Promise<Set<string>> {
  const source = await Bun.file(fichier).text();
  const noms = new Set<string>();
  for (const m of source.matchAll(
    /^export\s+(?:async\s+)?(?:function|const|let|class)\s+(\w+)/gm,
  )) {
    noms.add(m[1] ?? '');
  }
  for (const m of source.matchAll(/^export\s+(?:type|interface)\s+(\w+)/gm)) {
    noms.add(`type ${m[1]}`);
  }
  if (/^export\s+default/m.test(source)) noms.add('default');
  for (const m of source.matchAll(/^export\s+\{([^}]+)\}/gm)) {
    for (const brut of (m[1] ?? '').split(',')) {
      const nom = brut.trim().split(' as ').at(-1)?.trim();
      if (nom) noms.add(nom);
    }
  }
  return noms;
}

const fautes: string[] = [];
let paires = 0;

for (const motif of ['**/*.web.ts', '**/*.web.tsx']) {
  for (const relatif of new Glob(motif).scanSync(APP)) {
    const web = path.join(APP, relatif);
    const base = web.slice(0, -(path.extname(web).length + '.web'.length));
    const natif = [`${base}.ts`, `${base}.tsx`].find((c) => Bun.file(c).size > 0);
    if (!natif) {
      fautes.push(`${relatif} : aucune moitié native en face`);
      continue;
    }
    paires++;
    const [ew, en] = [await exports(web), await exports(natif)];
    for (const nom of [...ew].filter((n) => !en.has(n)).sort()) {
      fautes.push(`${relatif} exporte « ${nom} », pas ${path.basename(natif)}`);
    }
    for (const nom of [...en].filter((n) => !ew.has(n)).sort()) {
      fautes.push(`${path.basename(natif)} exporte « ${nom} », pas ${relatif}`);
    }
  }
}

if (fautes.length > 0) {
  console.error(`Paires de plateforme désaccordées — ${fautes.length} faute(s) :\n`);
  for (const f of fautes) console.error(`  ${f}`);
  process.exit(1);
}

console.log(`paires de plateforme vérifiées · ${paires} paires, exports identiques des deux côtés`);
