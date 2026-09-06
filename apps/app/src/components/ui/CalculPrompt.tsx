import { ETAT_VIDE } from '@vitae/core/constants';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import Cadran, { LARGEUR_HORS_AXE } from './Cadran';
import Overline from './Overline';
import { Button } from './primitives';

/**
 * Ce qu'on affiche à la place des chiffres quand aucun profil n'est enregistré.
 *
 * C'est le **seul** état vide de l'application, et depuis la refonte il montre la forme de ce qui
 * manque : le même cadran qu'un écran rempli, l'anneau entier en `gaugeTrack`, un tiret au centre.
 * L'ancienne version était une carte de texte avec une illustration — elle expliquait ce qu'on
 * obtiendrait, sans jamais le montrer, et un écran de résultats vide ne ressemblait alors à aucun
 * écran de résultats plein.
 *
 * Un tiret plutôt qu'un zéro : zéro est une valeur, et celle-là serait fausse.
 *
 * `part` vaut 0, ce qui n'enfreint pas la règle du cadran — l'arc dit bien une part d'un tout, et
 * cette part est vide. C'est le seul cas où la légende est tue : il n'y a pas de pourcentage à
 * annoncer, donc pas de `Hero`, qui l'exigerait.
 */
export default function CalculPrompt({ quoi }: { quoi: string }) {
  const router = useRouter();

  return (
    <View className="items-center px-2 pt-2 pb-2">
      <Cadran part={0} accessibilityLabel={`${ETAT_VIDE.surtitre}. ${quoi} ${ETAT_VIDE.suite}`}>
        {/* Même borne que `Hero` : hors de l’axe horizontal, la corde est plus courte que le
            diamètre. Voir `LARGEUR_HORS_AXE`. */}
        <View style={{ width: LARGEUR_HORS_AXE }}>
          <Overline className="text-center">{ETAT_VIDE.surtitre}</Overline>
        </View>
        {/* Le tiret prend la taille et l'interligne du grand chiffre, mais pas sa couleur : en
            `ink` il se lirait comme une valeur affichée, en `faint` comme une valeur absente. */}
        <Text
          className="font-display text-hero text-faint"
          style={{ lineHeight: 56, letterSpacing: -1 }}
        >
          {ETAT_VIDE.valeur}
        </Text>
      </Cadran>

      <Text className="font-sans mt-5 text-center text-body leading-[23px] text-muted">
        {quoi} {ETAT_VIDE.suite}
      </Text>

      <Button
        variant="contained"
        size="large"
        className="mt-5 w-full"
        onPress={() => router.navigate('/profil')}
      >
        {ETAT_VIDE.action}
      </Button>

      <Text className="font-sans mt-[14px] text-small text-muted2">{ETAT_VIDE.duree}</Text>
    </View>
  );
}
