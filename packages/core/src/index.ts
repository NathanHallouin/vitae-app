/**
 * Point d'entrée du métier partagé.
 *
 * Les deux applications importent plutôt le module précis (`@vitae/core/calc`) : c'est plus court
 * à lire dans un fichier d'écran, et cela évite au bundler mobile de traverser tout le paquet pour
 * une constante. Ce baril existe pour les outils qui ont besoin d'une surface unique — scripts,
 * tests d'intégration, exploration.
 */

export * from './calc';
export * from './constants';
export * from './date';
export * from './explainers';
export * from './format';
export * from './icons';
export * from './nav';
export * from './neat';
export * from './nutrition';
export * from './quantites';
export * from './recipes';
export * from './state';
export * from './storage';
export * from './training';
