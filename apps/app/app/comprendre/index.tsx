import {
  NOTIONS,
  nombreDeLues,
  prochaineNotion,
  routeNotion,
  TOTAL_NOTIONS,
} from '@vitae/core/cours';
import { SITE_URL } from '@vitae/core/site';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import Seo from '@/components/layout/Seo';
import Icon from '@/components/ui/Icon';
import Overline from '@/components/ui/Overline';
import Page from '@/components/ui/Page';
import { Button, Card, cx, ProgressBar } from '@/components/ui/primitives';
import Titre from '@/components/ui/Titre';
import { versRoute } from '@/lib/route';
import { useProfile } from '@/state/ProfileProvider';
import { usePalette } from '@/theme/palette';

/**
 * Le sommaire du cours.
 *
 * Les seize notions étaient repliées en pied des quatre écrans de résultats, où elles n'avaient ni
 * adresse, ni ordre global, ni trace de ce qui avait été lu. Elles ont désormais les trois.
 *
 * **Une liste à plat, et non quatre chapitres.** Les chapitres existent — chaque notion en porte
 * un, et la page de la notion le nomme — mais les faire porter la structure d'ici découpait seize
 * lignes en quatre paquets de quatre : quatre listes courtes à parcourir au lieu d'une
 * progression. Or c'en est une, et l'interface le dit partout ailleurs : « Notion 5 sur 16 », pas
 * « deuxième du chapitre 2 ».
 *
 * **Rien ici ne dépend d'un profil.** C'est ce qui distingue cette page des écrans de résultats et
 * ce qui en fait la meilleure porte d'entrée du site : le contenu est entier dans le HTML livré,
 * titre et description compris. Seule la progression dépend de l'appareil.
 */
export default function CoursIndex() {
  const { lu } = useProfile();
  const palette = usePalette();

  const lues = nombreDeLues(lu);
  const prochaine = prochaineNotion(lu);
  const dejaLues = new Set(lu);

  return (
    <>
      <Seo
        title="Comprendre : seize notions sur le métabolisme, l’assiette et le mouvement"
        description="Ce que mesure le métabolisme de base, pourquoi une fourchette plutôt qu’un chiffre, à quoi s’attendre en perdant du poids, et les deux leviers du mouvement. Seize notions courtes, lisibles d’une traite."
        canonical={`${SITE_URL}/comprendre`}
      />

      <Page>
        <Titre niveau={1} className="mb-[6px] font-display text-h1 leading-[44px] text-ink">
          Comprendre
        </Titre>
        <Text className="font-sans text-body leading-[26px] text-muted" style={{ maxWidth: 680 }}>
          Seize notions, dans l’ordre où les questions se posent. Chacune tient en une page et ne
          dépend d’aucun de vos chiffres.
        </Text>

        {/* Ce bloc n'est pas dans le HTML livré : ce qui est lu vit sur l'appareil, et il apparaît
            donc à l'hydratation. Sa hauteur n'est pas réservée pour autant — la réserver laisserait
            une bande vide en haut de page pour tout premier visiteur, c'est-à-dire pour la
            quasi-totalité de ceux qui arrivent d'un moteur de recherche. */}
        <Card className="mt-5 border-transparent bg-surface2 px-[18px] py-4">
          <View className="mb-[10px] flex-row items-baseline justify-between gap-3">
            <Overline niveau={2}>Où vous en êtes</Overline>
            <Text
              style={{ fontVariant: ['tabular-nums'] }}
              className="font-sans flex-none text-small text-muted"
            >
              {lues} sur {TOTAL_NOTIONS}
            </Text>
          </View>

          {/* La même barre que la progression du questionnaire : c'est la même question — combien
              en reste-t-il — et deux dessins pour une seule question se paient en hésitation. */}
          <ProgressBar
            value={(lues / TOTAL_NOTIONS) * 100}
            label={`Progression du cours : ${lues} notions sur ${TOTAL_NOTIONS}`}
          />

          <View className="mt-[14px]">
            {prochaine ? (
              <Button variant="contained" size="large" href={routeNotion(prochaine.slug)}>
                {lues === 0 ? 'Commencer par la première' : 'Reprendre où j’en étais'}
              </Button>
            ) : (
              <Text className="font-sans text-small leading-[20px] text-muted">
                Vous avez tout lu. Les notions restent là : on y revient plus souvent qu’on ne
                croit.
              </Text>
            )}
          </View>
        </Card>

        {/* `list` et `listitem` : seize notions numérotées sont une liste, et le dire donne au
            lecteur d'écran son « 5 sur 16 » et au document un `<ul>` plutôt qu'un tas de `<div>`. */}
        <View role="list" className="mt-5">
          {NOTIONS.map((notion) => {
            const lue = dejaLues.has(notion.slug);
            return (
              <View key={notion.slug} role="listitem">
                <Link href={versRoute(routeNotion(notion.slug))} asChild>
                  <Pressable
                    accessibilityRole="link"
                    accessibilityLabel={`${notion.titre}. ${notion.resume}${lue ? ' Déjà lue.' : ''}`}
                    className="flex-row items-start gap-3 border-b border-divider py-[14px] active:opacity-70"
                  >
                    {/* La pastille porte le rang global, et une coche une fois la notion lue. Le
                        rang plutôt qu'une puce : c'est lui qui dit qu'il y a un ordre. */}
                    <View
                      className={cx(
                        'mt-[2px] size-6 flex-none items-center justify-center rounded-full',
                        lue ? 'bg-primary-ink' : 'bg-primary-tint',
                      )}
                    >
                      {lue ? (
                        <Icon name="coche" size={14} color={palette.heroText} />
                      ) : (
                        <Text
                          style={{ fontVariant: ['tabular-nums'] }}
                          className="text-micro font-sans-bold text-primary-ink"
                        >
                          {notion.rang}
                        </Text>
                      )}
                    </View>

                    <View className="min-w-0 flex-1">
                      {/* Un titre de niveau 2 : seize entrées font un sommaire, et un sommaire se
                          parcourt au lecteur d'écran comme au moteur de recherche. */}
                      <Titre
                        niveau={2}
                        className={cx(
                          'text-option font-sans-medium',
                          lue ? 'text-muted' : 'text-primary-ink',
                        )}
                      >
                        {notion.titre}
                      </Titre>
                      <Text className="font-sans mt-[2px] text-small leading-[19px] text-muted">
                        {notion.resume}
                      </Text>
                    </View>
                  </Pressable>
                </Link>
              </View>
            );
          })}
        </View>
      </Page>
    </>
  );
}
