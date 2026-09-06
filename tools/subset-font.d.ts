/**
 * Les types de `subset-font`, que le paquet ne fournit pas.
 *
 * Sans cette déclaration, l'import est implicitement `any` : `subsetFont(…)` accepterait n'importe
 * quels arguments et rendrait n'importe quoi, sans que rien ne le signale. C'était le cas jusqu'ici
 * — non parce que quelqu'un l'avait décidé, mais parce que `tools/` n'était typechecké par aucun
 * script. Le seul `any` du dépôt était donc celui que personne ne pouvait voir.
 *
 * La signature est réduite à ce que `build-fonts.ts` emploie. L'élargir le jour où un autre appel
 * en aura besoin, plutôt que de deviner l'API entière.
 */
declare module 'subset-font' {
  export default function subsetFont(
    /** la police d'origine, TTF ou OTF */
    font: Buffer,
    /** les caractères à conserver, concaténés */
    text: string,
    options?: { targetFormat?: 'woff' | 'woff2' | 'sfnt' },
  ): Promise<Buffer>;
}
