import {
  NOTIONS,
  notionParSlug,
  notionSuivante,
  ROUTE_COURS,
  routeNotion,
  TOTAL_NOTIONS,
} from '@vitae/core/cours';
import { SITE_NAME, SITE_URL } from '@vitae/core/site';
import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import Seo from '@/components/layout/Seo';
import Icon from '@/components/ui/Icon';
import Overline from '@/components/ui/Overline';
import Page from '@/components/ui/Page';
import { Button, Card } from '@/components/ui/primitives';
import Titre from '@/components/ui/Titre';
import { versRoute } from '@/lib/route';
import { useProfile } from '@/state/ProfileProvider';
import { usePalette } from '@/theme/palette';

/**
 * Les seize notions sont connues à la compilation : l'export web produit un fichier HTML par
 * notion, et l'application native ouvre l'écran sans le moindre accès disque.
 */
export function generateStaticParams(): Array<{ slug: string }> {
  return NOTIONS.map((n) => ({ slug: n.slug }));
}

/**
 * Une notion du cours.
 *
 * C'est la seule famille de pages du site dont le contenu est **entier sans profil** : le texte ne
 * cite aucun chiffre personnel, il n'y a donc rien à attendre, rien à masquer, et le HTML livré
 * dit exactement ce que le visiteur lira. Les écrans de résultats, eux, ne peuvent en dire autant
 * de leurs nombres.
 *
 * **La notion se marque lue d'un bouton, pas à l'ouverture.** Le geste d'ouvrir n'est pas une
 * lecture : on ouvre pour voir la longueur, on referme, on y revient. Marquer à l'affichage aurait
 * fait avancer le compteur sans que rien ne soit lu, ce qui vide de sens le « 5 sur 16 » et le
 * bouton « Reprendre ». Le bouton est aussi ce qui rend l'état réversible : un appui de plus le
 * retire.
 */
export default function NotionPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const notion = notionParSlug(slug ?? '');
  const { lu, marquerNotionLue, oublierNotionLue } = useProfile();
  const palette = usePalette();

  const lue = notion !== null && lu.includes(notion.slug);

  if (!notion) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-bg px-6">
        <Text className="font-display text-h3 text-ink">Cette notion n’existe pas</Text>
        <Link href={versRoute(ROUTE_COURS)} className="text-base font-sans-medium text-primary-ink">
          Voir les seize notions
        </Link>
      </View>
    );
  }

  const suivante = notionSuivante(notion.slug);

  return (
    <>
      <Seo
        title={`${notion.titre} · ${SITE_NAME}`}
        description={notion.resume}
        canonical={`${SITE_URL}${routeNotion(notion.slug)}`}
      />

      <Page>
        {/* Le fil d'Ariane nomme le chapitre plutôt que le cours : c'est lui qui donne son sens à
            la notion, et c'est là qu'on retrouve les trois autres du même sujet. Un vrai lien, pas
            un `Pressable` : sur le web, c'est le seul chemin de retour qu'un moteur puisse suivre
            depuis une notion arrivée par la recherche. */}
        <View className="mb-5 flex-row">
          <Link
            href={versRoute(ROUTE_COURS)}
            className="text-small font-sans-medium text-primary-ink"
          >
            Comprendre
          </Link>
          <Text className="font-sans text-small text-muted2"> · {notion.chapitre.titre}</Text>
        </View>

        <Overline className="mb-2">
          Notion {notion.rang} sur {TOTAL_NOTIONS}
        </Overline>
        <Titre niveau={1} className="mb-3 font-display text-h1 leading-[44px] text-ink">
          {notion.titre}
        </Titre>
        <Text className="font-sans text-body leading-[26px] text-ink" style={{ maxWidth: 680 }}>
          {notion.texte}
        </Text>

        {/* Le bouton porte l'état plutôt qu'une case à cocher posée à côté : c'est le seul geste
            de la page, et un contrôle qui dit « Marquer comme lu » puis « Lu ✓ » se comprend sans
            légende. */}
        <View className="mt-6 items-start">
          <Button
            variant={lue ? 'outlined' : 'contained'}
            size="large"
            onPress={() => (lue ? oublierNotionLue(notion.slug) : marquerNotionLue(notion.slug))}
          >
            {lue ? 'Lu ✓' : 'Marquer comme lu'}
          </Button>
        </View>

        <Card className="mt-4 border-transparent bg-surface2 px-4 py-4">
          <Overline niveau={2} className="mb-1">
            Où cela s’applique
          </Overline>
          <Link href={versRoute(notion.ecran.href)} asChild>
            <Pressable
              accessibilityRole="link"
              className="flex-row items-center gap-2 self-start py-1 active:opacity-70"
            >
              <Text className="text-base font-sans-medium text-primary-ink">
                Voir sur l’écran {notion.ecran.label}
              </Text>
              <Icon name="flecheDroite" size={15} color={palette.primaryInk} />
            </Pressable>
          </Link>
        </Card>

        {suivante ? (
          <View className="mt-6">
            <Overline className="mb-1">Notion suivante</Overline>
            <Link href={versRoute(routeNotion(suivante.slug))} asChild>
              <Pressable
                accessibilityRole="link"
                className="flex-row items-center gap-2 self-start py-1 active:opacity-70"
              >
                <Text className="text-base font-sans-medium text-primary-ink">
                  {suivante.titre}
                </Text>
                <Icon name="flecheDroite" size={15} color={palette.primaryInk} />
              </Pressable>
            </Link>
          </View>
        ) : (
          <Text className="font-sans mt-6 text-small text-muted">
            C’était la dernière des {TOTAL_NOTIONS}.
          </Text>
        )}
      </Page>
    </>
  );
}
