import { describe, expect, test } from 'bun:test';
import { construireSauvegarde, lireSauvegarde, nomDeFichier } from './sauvegarde';
import type { StoredProfile } from './storage';
import type { Pesee } from './suivi';

const PROFIL: StoredProfile = {
  v: 3,
  sexe: 'femme',
  naissance: '1992-03-15',
  taille: '168',
  poids: '64',
  daily: 1,
  sessions: 2,
  goal: 'seche',
  excluded: [],
  updatedAt: '2026-08-01T09:00:00.000Z',
};

const PESEES: Pesee[] = [
  { date: '2026-07-01', poids: 66 },
  { date: '2026-07-08', poids: 65.4 },
  { date: '2026-07-15', poids: 64.8 },
];

/** Un aller-retour complet, qui est le seul usage réel du format. */
function allerRetour(profil: StoredProfile | null, pesees: Pesee[]) {
  return lireSauvegarde(construireSauvegarde(profil, pesees, '2026-08-15'));
}

describe('construireSauvegarde', () => {
  test('produit du JSON lisible par un humain', () => {
    const texte = construireSauvegarde(PROFIL, PESEES, '2026-08-15');
    expect(texte).toContain('\n  "v": 1');
    expect(texte.endsWith('\n')).toBe(true);
    expect(JSON.parse(texte).exporteLe).toBe('2026-08-15');
  });

  test('ne contient rien qui désigne un appareil ou une personne', () => {
    const objet = JSON.parse(construireSauvegarde(PROFIL, PESEES, '2026-08-15'));
    expect(Object.keys(objet).sort()).toEqual([
      'application',
      'exporteLe',
      'pesees',
      'profil',
      'v',
    ]);
  });
});

describe('lireSauvegarde', () => {
  test('rend le profil et les pesées après un aller-retour', () => {
    const lu = allerRetour(PROFIL, PESEES);
    expect(lu.ok).toBe(true);
    if (!lu.ok) return;
    expect(lu.sauvegarde.profil?.naissance).toBe('1992-03-15');
    expect(lu.sauvegarde.pesees).toHaveLength(3);
    expect(lu.message).toContain('3 pesées');
  });

  test('accepte une sauvegarde sans profil', () => {
    const lu = allerRetour(null, PESEES);
    expect(lu.ok).toBe(true);
    if (!lu.ok) return;
    expect(lu.sauvegarde.profil).toBeNull();
  });

  test('accepte une sauvegarde sans pesée', () => {
    const lu = allerRetour(PROFIL, []);
    expect(lu.ok).toBe(true);
    if (!lu.ok) return;
    expect(lu.message).toContain('votre profil');
  });

  test('accorde le singulier', () => {
    const lu = allerRetour(null, [{ date: '2026-07-01', poids: 66 }]);
    expect(lu.ok && lu.message).toContain('1 pesée.');
  });

  test('écarte les pesées illisibles sans perdre les bonnes', () => {
    const texte = JSON.stringify({
      v: 1,
      profil: null,
      pesees: [
        { date: '2026-07-01', poids: 66 },
        { date: '2026-02-31', poids: 65 },
        { date: '2026-07-08', poids: 900 },
        'pas un objet',
        { date: '2026-07-15', poids: 64.8 },
      ],
    });
    const lu = lireSauvegarde(texte);
    expect(lu.ok).toBe(true);
    if (!lu.ok) return;
    expect(lu.sauvegarde.pesees.map((p) => p.date)).toEqual(['2026-07-01', '2026-07-15']);
  });

  test('refuse un profil corrompu plutôt que d’en inventer un', () => {
    const texte = JSON.stringify({
      v: 1,
      profil: { ...PROFIL, sexe: 'autre chose' },
      pesees: PESEES,
    });
    const lu = lireSauvegarde(texte);
    // Les pesées, elles, restent restaurables : c'est tout l'intérêt de les juger séparément.
    expect(lu.ok).toBe(true);
    if (!lu.ok) return;
    expect(lu.sauvegarde.profil).toBeNull();
    expect(lu.sauvegarde.pesees).toHaveLength(3);
  });

  test('dit ce qui ne va pas, plutôt que « fichier invalide »', () => {
    expect(lireSauvegarde('').message).toContain('vide');
    expect(lireSauvegarde('bonjour').message).toContain('JSON');
    expect(lireSauvegarde('[1,2,3]').message).toContain('sauvegarde');
    expect(lireSauvegarde('{"pesees":[]}').message).toContain('version');
  });

  test('refuse un fichier venu d’une version future', () => {
    const lu = lireSauvegarde(JSON.stringify({ v: 99, profil: PROFIL, pesees: [] }));
    expect(lu.ok).toBe(false);
    expect(lu.message).toContain('plus récente');
  });

  test('refuse un fichier qui ne restaurerait rien', () => {
    const lu = lireSauvegarde(JSON.stringify({ v: 1, profil: null, pesees: [] }));
    expect(lu.ok).toBe(false);
    expect(lu.message).toContain('ni profil ni pesée');
  });
});

describe('nomDeFichier', () => {
  test('porte la date, pour qu’un dossier de téléchargements reste lisible', () => {
    expect(nomDeFichier('2026-08-15')).toBe('metabolisme-de-base-2026-08-15.json');
  });
});
