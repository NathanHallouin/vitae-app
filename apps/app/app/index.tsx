import { BENEFITS } from '@vitae/core/constants';
import { ROUTE_COURS, TOTAL_NOTIONS } from '@vitae/core/cours';
import { STALE_WEIGHT_DAYS, todayISO } from '@vitae/core/date';
import { kcal } from '@vitae/core/format';
import { destinationAuDemarrage } from '@vitae/core/nav';
import { SITE_URL } from '@vitae/core/site';
import { lireDerniereOuverture, marquerOuverture } from '@vitae/core/storage';
import { joursEntre } from '@vitae/core/suivi';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Seo from '@/components/layout/Seo';
import HomeIllustration from '@/components/ui/HomeIllustration';
import Icon from '@/components/ui/Icon';
import Overline from '@/components/ui/Overline';
import Page, { useColumns, useLarge } from '@/components/ui/Page';
import { Button, Card } from '@/components/ui/primitives';
import Titre from '@/components/ui/Titre';
import { REDIRIGE_AU_DEMARRAGE } from '@/lib/demarrage';
import { versRoute } from '@/lib/route';
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
  const { status, metrics, profile, suivi } = useProfile();
  const router = useRouter();
  const palette = usePalette();
  const large = useLarge();
  const colonnes = useColumns(2);
  const known = status === 'ready' && metrics !== null;

  useEffect(() => {
    if (!REDIRIGE_AU_DEMARRAGE || redirectionFaite || status !== 'ready') return;
    redirectionFaite = true;

    // Les deux drapeaux que la règle d'arrivée compare, lus au dernier moment : `suivi` et
    // `profile` sont déjà en mémoire, il n'y a rien à charger.
    const derniere = suivi.dernier;
    const depuis = derniere ? joursEntre(derniere.date, todayISO()) : null;
    const ouverture = lireDerniereOuverture();

    const destination = destinationAuDemarrage({
      peseePerimee: depuis === null || depuis >= STALE_WEIGHT_DAYS,
      profilModifie: ouverture === null || (profile?.updatedAt ?? '') > ouverture,
    });

    // L'horodatage est posé après la lecture, jamais avant : l'écrire d'abord ferait de chaque
    // lancement sa propre référence, et « modifié depuis la dernière ouverture » serait toujours
    // faux.
    marquerOuverture();

    // `replace` et non `navigate` : l'accueil ne doit pas rester dans l'historique de retour.
    router.replace(versRoute(destination));
  }, [status, router, suivi.dernier, profile]);

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
            <Text className="font-sans mb-2 text-body leading-[26px] text-muted">
              Même au repos, votre corps consomme de l’énergie pour respirer, faire battre votre
              cœur et vous garder au chaud. Savoir combien, c’est le point de départ pour perdre du
              gras, prendre du muscle ou simplement rester stable.
            </Text>
            <Text className="font-sans mb-8 text-base leading-[22px] text-muted2">
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
                <Text className="font-sans text-small text-muted2">
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

        <Card className="mt-8 px-[18px] py-5">
          <Overline niveau={2} className="mb-[14px]">
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
                  <Text className="font-sans text-small leading-[19px] text-muted">{b.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Le troisième chemin sortant de l'accueil, après le profil et les recettes — et le seul
            qui ne demande rien : les seize notions se lisent sans chiffres. C'est aussi, pour un
            moteur de recherche, le lien vers les pages du site dont le contenu est entier. */}
        <View className="mt-6 items-start">
          <Button variant="text" href={ROUTE_COURS}>
            Comprendre : {TOTAL_NOTIONS} notions, sans vos chiffres
          </Button>
        </View>
      </Page>
    </>
  );
}
