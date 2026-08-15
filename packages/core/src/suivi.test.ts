import { describe, expect, test } from 'bun:test';
import { fmtKgParSemaine } from './format';
import {
  ajouterPesee,
  comparerAuPlan,
  construireCourbe,
  construireSuivi,
  dernierePesee,
  ECART_REEVALUATION,
  joursEntre,
  type Pesee,
  retirerPesee,
  tendance,
} from './suivi';

/** Une suite de pesées hebdomadaires, du plus ancien au plus récent. */
function serie(depart: string, poids: number[], pasJours = 7): Pesee[] {
  const [a, m, j] = depart.split('-').map(Number);
  return poids.map((p, i) => {
    const d = new Date(a, m - 1, j + i * pasJours);
    const mois = `${d.getMonth() + 1}`.padStart(2, '0');
    const jour = `${d.getDate()}`.padStart(2, '0');
    return { date: `${d.getFullYear()}-${mois}-${jour}`, poids: p };
  });
}

describe('ajouterPesee', () => {
  test('garde une seule pesée par jour, la dernière saisie', () => {
    let h: Pesee[] = [];
    h = ajouterPesee(h, { date: '2026-03-01', poids: 80 });
    h = ajouterPesee(h, { date: '2026-03-01', poids: 79.4 });
    expect(h).toHaveLength(1);
    expect(h[0].poids).toBe(79.4);
  });

  test('trie même quand une pesée passée est saisie après coup', () => {
    let h: Pesee[] = [];
    h = ajouterPesee(h, { date: '2026-03-15', poids: 78 });
    h = ajouterPesee(h, { date: '2026-03-01', poids: 80 });
    h = ajouterPesee(h, { date: '2026-03-08', poids: 79 });
    expect(h.map((p) => p.date)).toEqual(['2026-03-01', '2026-03-08', '2026-03-15']);
  });

  test('arrondit au dixième : une balance ne mesure pas le centigramme', () => {
    const h = ajouterPesee([], { date: '2026-03-01', poids: 80.4567 });
    expect(h[0].poids).toBe(80.5);
  });

  test('refuse ce qui ne peut pas être un poids humain', () => {
    expect(ajouterPesee([], { date: '2026-03-01', poids: 12 })).toHaveLength(0);
    expect(ajouterPesee([], { date: '2026-03-01', poids: 450 })).toHaveLength(0);
    expect(ajouterPesee([], { date: '2026-03-01', poids: Number.NaN })).toHaveLength(0);
  });

  test('refuse une date qui n’existe pas plutôt que de la corriger en silence', () => {
    expect(ajouterPesee([], { date: '2026-02-31', poids: 80 })).toHaveLength(0);
    expect(ajouterPesee([], { date: 'hier', poids: 80 })).toHaveLength(0);
  });
});

describe('retirerPesee', () => {
  test('retire le jour visé et laisse les autres', () => {
    const h = serie('2026-03-01', [80, 79, 78]);
    const apres = retirerPesee(h, h[1].date);
    expect(apres.map((p) => p.poids)).toEqual([80, 78]);
  });
});

describe('dernierePesee', () => {
  test('rend la plus récente, et null sur un historique vide', () => {
    expect(dernierePesee([])).toBeNull();
    expect(dernierePesee(serie('2026-03-01', [80, 79, 78]))?.poids).toBe(78);
  });
});

describe('joursEntre', () => {
  test('compte les jours, y compris à cheval sur un changement de mois', () => {
    expect(joursEntre('2026-02-25', '2026-03-04')).toBe(7);
  });

  test('n’est pas piégé par le changement d’heure', () => {
    // Le passage à l'heure d'été 2026 en France a lieu le 29 mars.
    expect(joursEntre('2026-03-28', '2026-03-30')).toBe(2);
  });

  test('rend null sur une date illisible', () => {
    expect(joursEntre('2026-03-01', 'demain')).toBeNull();
  });
});

describe('tendance', () => {
  test('rend null tant qu’il n’y a pas deux pesées', () => {
    expect(tendance([])).toBeNull();
    expect(tendance(serie('2026-03-01', [80]))).toBeNull();
  });

  test('trouve la pente d’une perte régulière d’un demi-kilo par semaine', () => {
    const t = tendance(serie('2026-03-01', [80, 79.5, 79, 78.5, 78]));
    expect(t).toBeCloseTo(-0.5, 2);
  });

  test('rend une pente positive quand le poids monte', () => {
    const t = tendance(serie('2026-03-01', [70, 70.4, 70.8]));
    expect(t).toBeGreaterThan(0);
  });

  test('résiste à une pesée aberrante, ce qu’un écart premier-dernier ne ferait pas', () => {
    // Quatre semaines de perte régulière, puis un kilo et demi d'eau le dernier jour.
    const avec = tendance(serie('2026-03-01', [80, 79.5, 79, 78.5, 79.8]));
    // Ce que dirait la méthode naïve : une perte dix fois plus faible, à cause du seul dernier point.
    const naif = (79.8 - 80) / 4;

    expect(avec).toBeLessThan(0);
    expect(avec).toBeLessThan(naif);
    expect(avec).toBeCloseTo(-0.14, 2);
  });

  test('ignore ce qui sort de la fenêtre', () => {
    // Dix semaines de perte, puis quatre semaines de stabilité : seule la stabilité compte.
    const h = [
      ...serie('2026-01-01', [90, 89, 88, 87, 86, 85]),
      ...serie('2026-03-01', [85, 85, 85, 85]),
    ];
    const t = tendance(h, 28);
    expect(Math.abs(t ?? 1)).toBeLessThan(0.05);
  });

  test('rend null si toutes les pesées tombent le même jour', () => {
    expect(tendance([{ date: '2026-03-01', poids: 80 }])).toBeNull();
  });
});

describe('construireSuivi', () => {
  test('sans pesée, invite à commencer sans rien prétendre calculer', () => {
    const s = construireSuivi([], 80);
    expect(s.dernier).toBeNull();
    expect(s.tendance).toBeNull();
    expect(s.depuisLeDebut).toBeNull();
    expect(s.aReevaluer).toBe(false);
    expect(s.message).toContain('une fois par semaine');
  });

  test('mesure l’écart depuis la première pesée', () => {
    const s = construireSuivi(serie('2026-03-01', [82, 81, 80]), 82);
    expect(s.depuisLeDebut).toBeCloseTo(-2, 5);
  });

  test('réclame un recalcul dès que le poids s’écarte du profil de 4 kg', () => {
    const juste = construireSuivi(serie('2026-03-01', [80, 76.1]), 80);
    expect(juste.aReevaluer).toBe(false);

    const atteint = construireSuivi(serie('2026-03-01', [80, 76]), 80);
    expect(atteint.aReevaluer).toBe(true);
    expect(atteint.message).toContain('4 kg');
  });

  test('vaut aussi pour une prise de poids : l’écart est absolu', () => {
    const s = construireSuivi(serie('2026-03-01', [70, 74.5]), 70);
    expect(s.aReevaluer).toBe(true);
  });

  test('ne réclame rien sans profil auquel se comparer', () => {
    expect(construireSuivi(serie('2026-03-01', [80, 70]), null).aReevaluer).toBe(false);
  });

  test('le seuil affiché est bien celui qui est appliqué', () => {
    const s = construireSuivi(serie('2026-03-01', [80, 80 - ECART_REEVALUATION]), 80);
    expect(s.aReevaluer).toBe(true);
  });
});

describe('comparerAuPlan', () => {
  test('se tait quand il n’y a pas de tendance', () => {
    expect(comparerAuPlan(null, -0.5)).toBeNull();
  });

  test('confirme quand le constaté colle au prévu', () => {
    expect(comparerAuPlan(-0.52, -0.5)).toContain('rythme prévu');
  });

  test('avertit quand la perte va plus vite que prévu', () => {
    expect(comparerAuPlan(-1.2, -0.5)).toContain('muscle');
  });

  test('explique le retard plutôt que de le reprocher', () => {
    const t = comparerAuPlan(-0.1, -0.5);
    expect(t).toContain('portions');
    expect(t).toContain('dépense baisse');
  });

  test('en prise de masse, avertit d’un surplus trop rapide', () => {
    expect(comparerAuPlan(0.9, 0.25)).toContain('gras');
  });

  test('un plan à poids constant ne parle que si le poids bouge', () => {
    expect(comparerAuPlan(0.02, 0)).toContain('rythme prévu');
    expect(comparerAuPlan(0.6, 0)).toContain('portions');
  });
});

describe('construireCourbe', () => {
  test('rend null en dessous de deux pesées : un point n’est pas une courbe', () => {
    expect(construireCourbe([])).toBeNull();
    expect(construireCourbe(serie('2026-03-01', [80]))).toBeNull();
  });

  test('rend null si toutes les pesées tombent le même jour', () => {
    expect(
      construireCourbe([
        { date: '2026-03-01', poids: 80 },
        { date: '2026-03-01', poids: 79 },
      ]),
    ).toBeNull();
  });

  test('place les points selon les jours écoulés, pas selon leur rang', () => {
    // Trois pesées rapprochées, puis une un mois plus tard.
    const h = [
      { date: '2026-03-01', poids: 80 },
      { date: '2026-03-02', poids: 79.8 },
      { date: '2026-03-03', poids: 79.6 },
      { date: '2026-04-02', poids: 78 },
    ];
    const c = construireCourbe(h);
    expect(c).not.toBeNull();
    if (!c) return;
    // Les trois premiers points sont serrés à gauche, le dernier tout à droite.
    expect(c.points[2].x).toBeLessThan(c.points[0].x + (c.points[3].x - c.points[0].x) * 0.2);
    expect(c.points[3].x).toBeCloseTo(594, 0);
  });

  test('un poids qui monte descend à l’écran : l’axe des ordonnées est inversé', () => {
    const c = construireCourbe(serie('2026-03-01', [70, 72]));
    if (!c) return;
    expect(c.points[1].y).toBeLessThan(c.points[0].y);
  });

  test('un poids stable ne devient pas des montagnes russes', () => {
    const c = construireCourbe(serie('2026-03-01', [80, 80.1, 79.9, 80]));
    expect(c).not.toBeNull();
    if (!c) return;
    // Avec une amplitude minimale de 2 kg, 200 g de variation restent au centre du cadre.
    const hauteur = 170 - 10;
    const ecart = Math.max(...c.points.map((p) => p.y)) - Math.min(...c.points.map((p) => p.y));
    expect(ecart).toBeLessThan(hauteur * 0.2);
  });

  test('ne dessine la cible que si elle tombe dans le cadre', () => {
    const dedans = construireCourbe(serie('2026-03-01', [80, 78]), 79);
    expect(dedans?.cibleY).not.toBeNull();

    const loin = construireCourbe(serie('2026-03-01', [80, 78]), 62);
    expect(loin?.cibleY).toBeNull();
  });

  test('les repères d’axe portent les dates extrêmes', () => {
    const c = construireCourbe(serie('2026-03-01', [80, 79, 78]));
    if (!c) return;
    expect(c.ticks).toHaveLength(2);
    expect(c.ticks[0].label).toContain('1');
    expect(c.ticks[1].label).toContain('15');
  });
});

describe('fmtKgParSemaine', () => {
  test('emploie le vrai signe moins, pas un trait d’union', () => {
    expect(fmtKgParSemaine(-0.47)).toBe('−0,47 kg / semaine');
    expect(fmtKgParSemaine(-0.47).charCodeAt(0)).toBe(0x2212);
  });

  test('marque le signe des deux côtés', () => {
    expect(fmtKgParSemaine(0.3)).toBe('+0,30 kg / semaine');
  });

  test('ne fait pas passer un bruit de balance pour un rythme', () => {
    expect(fmtKgParSemaine(0.004)).toBe('poids stable');
  });
});
