// Metro dans un monorepo, plus la compilation des classes NativeWind.
//
// Sans `watchFolders`, une modification de `packages/core` ne déclenche aucun rechargement à chaud :
// Metro ne surveille que le dossier du projet. Sans `nodeModulesPaths`, il ne trouve pas les
// dépendances remontées à la racine par l'installation à plat.

const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
// La remontée de dossier en dossier trouverait des copies de React hors du monorepo. Deux React
// dans un même paquet, c'est l'écran blanc au démarrage, sans message utile.
config.resolver.disableHierarchicalLookup = true;

module.exports = withNativeWind(config, { input: './global.css' });
