/**
 * Ce que ce fichier protège : la frontière entre le mouvement du quotidien et les séances, et le
 * fait que les séances dépendent réellement du profil : âge, sexe, poids, métabolisme, objectif.
 * `bun test`
 */

import { describe, expect, test } from 'bun:test';
import { computeMetrics, type Metrics } from './calc';
import type { GoalKey } from './constants';
import { buildNeat, movementSplit, neatKcal } from './neat';
import { buildWeek } from './training';

function metrics(input: {
  sexe?: 'femme' | 'homme';
  age?: string;
  taille?: string;
  poids?: string;
  daily?: number;
  sessions?: number;
  goal?: GoalKey;
}): Metrics {
  const m = computeMetrics({
    sexe: input.sexe ?? 'homme',
    age: input.age ?? '30',
    taille: input.taille ?? '178',
    poids: input.poids ?? '80',
    daily: input.daily ?? 1,
    sessions: input.sessions ?? 2,
    goal: input.goal ?? 'seche',
  });
  if (!m) throw new Error('métriques attendues');
  return m;
}

/** Raccourci : la semaine d'entraînement d'un profil décrit en une ligne. */
function week(input: Parameters<typeof metrics>[0]) {
  const m = metrics(input);
  return buildWeek(m, input.daily ?? 1, input.sessions ?? 2, input.goal ?? 'seche');
}

function allExercises(input: Parameters<typeof metrics>[0]) {
  return week(input).sessions.flatMap((s) => s.exercises);
}

describe('frontière entre le quotidien et les séances', () => {
  test('les deux dépenses de mouvement se partagent exactement l’écart au métabolisme de base', () => {
    for (const daily of [0, 1, 2, 3]) {
      for (const sessions of [0, 1, 2, 3, 4]) {
        const m = metrics({ daily, sessions });
        const split = movementSplit(m, daily, sessions);
        // Les deux termes viennent d'arrondis distincts : quelques kcal d'écart sont normales.
        expect(Math.abs(split.neat + split.sessions - (m.tdee - m.bmr))).toBeLessThanOrEqual(3);
        expect(split.neatPct + split.sessionsPct).toBe(100);
      }
    }
  });

  test('le quotidien domine les séances dès qu’on marche un peu', () => {
    for (const daily of [1, 2, 3]) {
      for (const sessions of [0, 1, 2, 3, 4]) {
        const split = movementSplit(metrics({ daily, sessions }), daily, sessions);
        expect(split.neat).toBeGreaterThan(split.sessions);
      }
    }
    // L'exception, et elle est instructive : entièrement sédentaire mais à l'entraînement tous
    // les jours, les séances finissent par dépasser un quotidien réduit à presque rien.
    const extreme = movementSplit(metrics({ daily: 0, sessions: 4 }), 0, 4);
    expect(extreme.sessions).toBeGreaterThan(extreme.neat);
  });

  test('le NEAT ne contient aucun exercice de renforcement', () => {
    const interdits = ['série', 'squat', 'pompe', 'gainage', 'fente', 'répétition'];
    for (const daily of [0, 1, 2, 3]) {
      const neat = buildNeat(metrics({ daily }), daily, 'seche');
      expect(neat.actions.length).toBeGreaterThan(0);
      for (const action of neat.actions) {
        const texte = `${action.label} ${action.detail}`.toLowerCase();
        for (const mot of interdits) expect(texte).not.toContain(mot);
      }
    }
  });

  test('les séances sont toutes chiffrées en séries, jamais en gestes du quotidien', () => {
    for (const ex of allExercises({ daily: 0, sessions: 0 })) {
      expect(ex.volume).toContain('séries');
    }
  });

  test('le NEAT ne dépend que de l’axe quotidien, pas du nombre de séances', () => {
    const sansSport = buildNeat(metrics({ daily: 1, sessions: 0 }), 1, 'seche');
    const tresSportif = buildNeat(metrics({ daily: 1, sessions: 4 }), 1, 'seche');
    expect(tresSportif.actions).toEqual(sansSport.actions);
    expect(tresSportif.tips).toEqual(sansSport.tips);
    expect(tresSportif.steps).toBe(sansSport.steps);
    expect(tresSportif.currentKcal).toBe(sansSport.currentKcal);
  });

  test('la marge de NEAT s’épuise au dernier cran de mouvement quotidien', () => {
    expect(buildNeat(metrics({ daily: 0 }), 0, 'seche').headroom).toBeGreaterThan(0);
    expect(buildNeat(metrics({ daily: 3 }), 3, 'seche').headroom).toBe(0);
  });

  test('en prise de masse, le NEAT n’est pas présenté comme une marge à exploiter', () => {
    const neat = buildNeat(metrics({ daily: 0, goal: 'masse' }), 0, 'masse');
    expect(neat.hasHeadroom).toBe(false);
    expect(neat.lead).toContain('surplus');
  });

  test('la dépense du quotidien monte avec le poids porté', () => {
    const leger = buildNeat(metrics({ poids: '55' }), 1, 'seche');
    const lourd = buildNeat(metrics({ poids: '110' }), 1, 'seche');
    expect(lourd.actions[0].kcal).toBeGreaterThan(leger.actions[0].kcal);
    expect(neatKcal(metrics({ poids: '110' }), 1)).toBeGreaterThan(
      neatKcal(metrics({ poids: '55' }), 1),
    );
  });
});

describe('séances adaptées à l’âge', () => {
  test('la récupération entre séries s’allonge avec l’âge', () => {
    const repos = (age: string) => week({ age }).sessions[0].exercises[0].rest;
    expect(repos('30')).toBe('1 min 15');
    expect(repos('45')).toBe('1 min 30');
    expect(repos('58')).toBe('1 min 45');
    expect(repos('68')).toBe('2 min');
  });

  test('un bloc équilibre est ajouté à chaque séance à partir de 60 ans', () => {
    const senior = week({ age: '68' });
    for (const session of senior.sessions) {
      expect(session.exercises.some((e) => e.name.includes('Équilibre'))).toBe(true);
    }
    const jeune = week({ age: '30' });
    expect(
      jeune.sessions.flatMap((s) => s.exercises).some((e) => e.name.includes('Équilibre')),
    ).toBe(false);
  });

  test('au-delà de 65 ans, la semaine est plafonnée à trois séances', () => {
    expect(week({ age: '68', goal: 'masse', sessions: 4 }).strengthPerWeek).toBe(3);
    expect(week({ age: '30', goal: 'masse', sessions: 4 }).strengthPerWeek).toBe(4);
  });

  test('l’échauffement s’allonge avec l’âge', () => {
    expect(week({ age: '30' }).warmup).toContain('5 min');
    expect(week({ age: '45' }).warmup).toContain('6 à 8 min');
    expect(week({ age: '68' }).warmup).toContain('8 à 10 min');
  });

  test('après 55 ans, une semaine allégée est prévue dans la progression', () => {
    expect(week({ age: '60' }).progression.join(' ')).toContain('semaine allégée');
    expect(week({ age: '30' }).progression.join(' ')).not.toContain('semaine allégée');
  });
});

describe('séances adaptées au poids et à la corpulence', () => {
  test('à forte corpulence, les séries sont plus courtes : le poids du corps fait la charge', () => {
    const obese = allExercises({ poids: '115', taille: '170' })[0];
    const normal = allExercises({ poids: '75', taille: '178' })[0];
    const premier = (volume: string) => Number(/de (\d+)/.exec(volume)?.[1]);
    expect(premier(obese.volume)).toBeLessThan(premier(normal.volume));
  });

  test('à forte corpulence, aucune progression ne passe par un saut', () => {
    const w = week({ poids: '115', taille: '170' });
    expect(w.adaptations.some((a) => a.label.includes('Aucun saut'))).toBe(true);
    for (const ex of w.sessions.flatMap((s) => s.exercises)) {
      expect(ex.harder.toLowerCase()).not.toContain('saut');
    }
    expect(w.cardio.join(' ')).toContain('sans les impacts');
  });

  test('en insuffisance pondérale, aucun cardio n’est ajouté', () => {
    const w = week({ poids: '45', taille: '170', goal: 'masse' });
    expect(w.cardio.join(' ')).toContain('Pas de cardio ajouté');
  });

  test('la dépense d’une séance suit le poids de la personne', () => {
    const leger = week({ poids: '55' }).sessions[0].kcal;
    const lourd = week({ poids: '110' }).sessions[0].kcal;
    expect(lourd).toBeGreaterThan(leger);
    // Une séance reste une dépense modeste : jamais de quoi remplacer l'assiette.
    expect(lourd).toBeLessThan(400);
  });
});

describe('séances adaptées au sexe', () => {
  test('les poussées démarrent en appui chez les femmes, au sol chez un homme jeune', () => {
    const femme = allExercises({ sexe: 'femme', poids: '62', taille: '165' });
    expect(femme.some((e) => e.name.includes('mains surélevées'))).toBe(true);

    const homme = allExercises({ sexe: 'homme', age: '30', poids: '75' });
    expect(homme.some((e) => e.name.includes('mains surélevées'))).toBe(false);
  });

  test('après 50 ans, la charge osseuse est justifiée aux femmes', () => {
    const w = week({ sexe: 'femme', age: '55', poids: '65', taille: '165' });
    const raison = w.adaptations.find((a) => a.label.includes('hanches'))?.reason ?? '';
    expect(raison).toContain('ménopause');
  });

  test('après 45 ans, le maintien du muscle est justifié aux hommes en perte de poids', () => {
    const w = week({ sexe: 'homme', age: '50', goal: 'seche' });
    expect(w.adaptations.some((a) => a.reason.includes('1 % par an'))).toBe(true);
  });
});

describe('séances adaptées à l’objectif et au métabolisme', () => {
  test('chaque objectif a sa fourchette de répétitions', () => {
    expect(allExercises({ goal: 'masse', sessions: 3 })[0].volume).toContain('4 séries de 8 à 12');
    expect(allExercises({ goal: 'seche' })[0].volume).toContain('3 séries de 12 à 15');
    expect(allExercises({ goal: 'recomp' })[0].volume).toContain('3 séries de 10 à 14');
  });

  test('un déficit marqué allonge les repos plutôt que d’ajouter du volume', () => {
    const seche = week({ goal: 'seche' });
    const maintien = week({ goal: 'maintien' });
    expect(seche.adaptations.some((a) => a.label.includes('Volume contenu'))).toBe(true);
    expect(maintien.adaptations.some((a) => a.label.includes('Volume contenu'))).toBe(false);
  });

  test('la note de la semaine rapporte la dépense d’une séance au métabolisme', () => {
    const m = metrics({ goal: 'seche' });
    const note = buildWeek(m, 1, 2, 'seche').note;
    expect(note).toContain('kcal');
    expect(note).toContain(String(Math.round(m.poids)));
  });

  test('toutes les adaptations sont libellées et justifiées', () => {
    for (const age of ['25', '45', '58', '70']) {
      for (const sexe of ['femme', 'homme'] as const) {
        for (const goal of ['seche', 'recomp', 'masse', 'maintien'] as const) {
          const w = week({ age, sexe, goal, poids: '95', taille: '170' });
          expect(w.adaptations.length).toBeGreaterThan(0);
          for (const a of w.adaptations) {
            expect(a.label.length).toBeGreaterThan(0);
            expect(a.reason.length).toBeGreaterThan(30);
          }
          // Le libellé de tête doit citer les valeurs réellement appliquées.
          expect(w.sessions[0].exercises[0].volume).toContain(
            `${w.adaptations[0].label.split(' ')[0]} séries`,
          );
        }
      }
    }
  });
});
