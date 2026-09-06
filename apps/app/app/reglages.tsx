import { SITE_URL } from '@vitae/core/site';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import Seo from '@/components/layout/Seo';
import DonneesCard from '@/components/screens/DonneesCard';
import RappelsCard from '@/components/screens/RappelsCard';
import Apparition from '@/components/ui/Apparition';
import Icon from '@/components/ui/Icon';
import Overline from '@/components/ui/Overline';
import Page from '@/components/ui/Page';
import PageIntro from '@/components/ui/PageIntro';
import { Card } from '@/components/ui/primitives';
import { usePalette } from '@/theme/palette';

/**
 * Les réglages : ce qui se règle une fois, et qu'on vient rechercher ensuite.
 *
 * L'application n'en avait pas, et ses trois réglages étaient donc posés là où ils avaient été
 * écrits : les rappels au milieu de l'écran « Bouger », la sauvegarde au bas du profil, le thème
 * dans un coin de l'en-tête. Chacun se défendait à l'endroit où il était — et aucun ne se
 * retrouvait. Un réglage a ceci de particulier qu'on y revient : la première fois on tombe dessus,
 * les suivantes on le cherche, et on le cherche dans les réglages.
 *
 * Ce que cet écran **ne prend pas** : le profil. Poids, taille, âge et objectif ne sont pas des
 * préférences, ce sont les données du calcul ; ils restent sur leur écran, avec le formulaire qui
 * les édite.
 *
 * L'écran vit hors de la barre des sections, atteint depuis le profil — dont il est la suite : on
 * y va chercher ce qui se règle une fois. Une cinquième section pour une page qu'on ouvre trois
 * fois par an aurait rétréci les quatre autres.
 *
 * **L'apparence n'est plus ici.** Elle est passée sur le profil, où elle est le seul réglage qu'on
 * change souvent, et où elle remplace la bascule que l'en-tête a perdue. La laisser aux deux
 * endroits aurait fait deux vérités pour un seul réglage.
 */
export default function ReglagesScreen() {
  return (
    <>
      <Seo
        title="Réglages : rappels de mouvement et données"
        description="Régler les rappels anti-sédentarité par plages horaires, sortir une copie de ses données ou tout effacer. Tout reste sur l’appareil, rien n’est envoyé nulle part."
        canonical={`${SITE_URL}/reglages`}
      />
      <Page keyboardShouldPersistTaps="handled">
        <PageIntro
          title="Réglages"
          lead="Les rappels de mouvement, et ce que deviennent vos données. Rien de tout cela ne quitte votre appareil."
        />

        <Apparition>
          <View className="gap-6">
            <RappelsCard />
            <DonneesCard />

            {/* Les deux magasins exigent que la politique soit atteignable depuis l'application,
                pas seulement depuis leur fiche. Elle reste liée depuis le profil, où l'on saisit,
                et depuis ici, où l'on efface. */}
            <Link href="/confidentialite" asChild>
              <Pressable accessibilityRole="link" className="active:opacity-70">
                <Card className="flex-row items-center gap-4 px-[18px] py-4">
                  <Confidentialite />
                </Card>
              </Pressable>
            </Link>
          </View>
        </Apparition>
      </Page>
    </>
  );
}

/** Le contenu de la carte de confidentialité, extrait pour garder le `Pressable` lisible. */
function Confidentialite() {
  const palette = usePalette();

  return (
    <>
      <View className="size-10 flex-none items-center justify-center rounded-full bg-primary-tint">
        <Icon name="bouclier" size={20} color={palette.primaryInk} />
      </View>
      <View className="min-w-0 flex-1">
        <Overline niveau={2} className="mb-1">
          Confidentialité
        </Overline>
        <Text className="font-sans text-base leading-[22px] text-muted">
          Ce que deviennent vos informations : aucune donnée collectée, aucun compte, aucun serveur.
        </Text>
      </View>
      <Icon name="flecheDroite" size={16} color={palette.muted2} />
    </>
  );
}
