import { BENEFITS } from '@vitae/core/constants';
import { kcal } from '@vitae/core/format';
import { SITE_URL } from '@vitae/core/site';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform, Text, View } from 'react-native';
import Seo from '@/components/layout/Seo';
import HomeIllustration from '@/components/ui/HomeIllustration';
import Icon from '@/components/ui/Icon';
import Overline from '@/components/ui/Overline';
import Page, { useColumns, useLarge } from '@/components/ui/Page';
import { Button, Card } from '@/components/ui/primitives';
import Titre from '@/components/ui/Titre';
import { useProfile } from '@/state/ProfileProvider';
import { usePalette } from '@/theme/palette';

/**
 * Ne se déclenche qu'une fois par lancement.
 *
 * Sans ce drapeau, toucher la marque dans l'en-tête ramènerait ici puis renverrait aussitôt vers
 * les résultats : l'accueil deviendrait inatteignable pour qui a déjà un profil.
 */
let redirectionFaite = false;

/**
 * L'accueil, et la racine du site.
 *
 * Deux rôles dans un seul écran, et c'est voulu. Sur le web, `/` est la page la plus importante à
 * référencer : elle doit avoir du contenu, un titre et une description dans le HTML livré. En
 * natif, quelqu'un qui a déjà rempli son profil n'a que faire d'une page de présentation à chaque
 * ouverture — l'application saute directement aux chiffres, une seule fois, au démarrage.
 *
 * L'ancienne solution, une route `/` qui ne faisait que rediriger, produisait un fichier HTML sans
 * titre ni texte à l'adresse la plus visitée du site.
 */
export default function AccueilScreen() {
  const { status, metrics } = useProfile();
  const router = useRouter();
  const palette = usePalette();
  const large = useLarge();
  const colonnes = useColumns(2);
  const known = status === 'ready' && metrics !== null;

  useEffect(() => {
    if (Platform.OS === 'web' || redirectionFaite || status !== 'ready') return;
    redirectionFaite = true;
    // `replace` et non `navigate` : l'accueil ne doit pas rester dans l'historique de retour.
    router.replace('/metabolisme');
  }, [status, router]);

  return (
    <>
      <Seo
        title="Métabolisme de base : combien de calories votre corps dépense"
        description="Calculez ce que votre corps dépense au repos et dans la journée, votre IMC, et combien manger selon votre objectif. Expliqué simplement, sans compte à créer."
        canonical={SITE_URL}
      />
      <Page>
        {/* Sur un écran large, l'accroche et l'illustration se partagent la largeur. Empilées,
            elles laissaient l'illustration seule au milieu d'une bande vide de 400 px de haut,
            et repoussaient « Ce que vous obtenez » sous la ligne de flottaison. */}
        <View className={large ? 'flex-row items-center gap-12' : ''}>
          <View className="min-w-0 flex-1">
            <Titre niveau={1} className="mb-4 font-display text-h1 leading-[44px] text-ink">
              Combien votre corps brûle-t-il de calories ?
            </Titre>
            <Text className="mb-2 text-body leading-[26px] text-muted">
              Même au repos, votre corps consomme de l’énergie pour respirer, faire battre votre
              cœur et vous garder au chaud. Savoir combien, c’est le point de départ pour perdre du
              gras, prendre du muscle ou simplement rester stable.
            </Text>
            <Text className="mb-8 text-base leading-[22px] text-muted2">
              Quatre questions, une minute. Rien n’est envoyé sur internet : vos réponses restent
              sur cet appareil. Vous pouvez aussi parcourir directement les recettes.
            </Text>

            {known && metrics ? (
              <View className="gap-3">
                <View className="flex-row flex-wrap gap-3">
                  <Button variant="contained" size="large" href="/metabolisme">
                    Voir mes résultats
                  </Button>
                  <Button variant="outlined" size="large" href="/profil">
                    Modifier mes infos
                  </Button>
                </View>
                <Text className="text-small text-muted2">
                  Dernier calcul : {kcal(metrics.tdee)} kcal dépensées par jour,{' '}
                  {kcal(metrics.target)} kcal à manger pour votre objectif.
                </Text>
              </View>
            ) : (
              <View className="flex-row flex-wrap gap-3">
                <Button variant="contained" size="large" href="/profil">
                  Commencer
                </Button>
                <Button variant="outlined" size="large" href="/recettes">
                  Voir les recettes
                </Button>
              </View>
            )}
          </View>

          <View className={large ? 'w-[380px] flex-none' : 'mt-8'}>
            <HomeIllustration />
          </View>
        </View>

        <Card className="mt-10 p-6">
          <Overline niveau={2} className="mb-5">
            Ce que vous obtenez
          </Overline>
          {/* Deux colonnes dès qu'il y a la place : quatre lignes pleine largeur pour une phrase
              de six mots laissaient les trois quarts de la carte vides. */}
          <View className="flex-row flex-wrap" style={{ marginHorizontal: -12 }}>
            {BENEFITS.map((b) => (
              <View
                key={b.n}
                style={{ width: `${100 / colonnes}%`, paddingHorizontal: 12 }}
                className="flex-row gap-4 border-t border-divider py-3"
              >
                <View className="size-[30px] flex-none items-center justify-center rounded-full bg-primary-tint">
                  <Icon name={b.icon} size={18} color={palette.primaryInk} />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="mb-[2px] text-option font-sans-medium text-ink">{b.title}</Text>
                  <Text className="text-small leading-[19px] text-muted">{b.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
      </Page>
    </>
  );
}
