// `jsxImportSource` branche NativeWind sur la fabrique JSX : c'est ce qui donne un sens à
// `className` sur une `<View>`. Le préréglage Expo ajoute seul le greffon de `react-native-worklets`
// dès que Reanimated est installé — l'ajouter ici une seconde fois ferait échouer la compilation.
module.exports = (api) => {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
  };
};
