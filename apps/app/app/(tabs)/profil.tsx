import { SITE_URL } from '@vitae/core/site';
import { formFromProfile } from '@vitae/core/state';
import { Link, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import Seo from '@/components/layout/Seo';
import ApparenceCard from '@/components/screens/ApparenceCard';
import ProfilForm from '@/components/screens/ProfilForm';
import Icon from '@/components/ui/Icon';
import IllustrationProfil from '@/components/ui/illustrations/IllustrationProfil';
import Overline from '@/components/ui/Overline';
import Page, { useLarge } from '@/components/ui/Page';
import { Card } from '@/components/ui/primitives';
import { useProfile } from '@/state/ProfileProvider';
import { usePalette } from '@/theme/palette';

/**
 * Le profil : vos informations, et les réglages.
 *
 * C'est la quatrième section de l'application, et la seule qui parle de vous plutôt que de vos
 * chiffres. Elle a récupéré ce que l'en-tête portait avant qu'il ne soit vidé — l'apparence
 * d'abord, puisque c'est le réglage qu'on change le plus souvent, et le chemin vers les réglages
 * plus rares. Un réglage se cherche là où l'on cherche les réglages ; sur un téléphone, ce n'est
 * pas en haut de l'écran, hors de portée du pouce.
 *
 * Ce que l'écran garde en tête, malgré tout : le formulaire. Poids, taille, âge et objectif ne
 * sont pas des préférences, ce sont les données du calcul — et c'est pour les corriger qu'on vient
 * ici neuf fois sur dix.
 *
 * Le site devait envelopper cet écran dans un `<Suspense>` et gérer un état de chargement, parce
 * que le mode se lisait dans la requête et le profil dans le navigateur, tous deux indisponibles
 * au rendu serveur. Ici tout est en mémoire dès le premier rendu : il n'y a ni attente, ni
 * repli à afficher.
 */
export default function ProfilTab() {
  const { profile, staleWeight, save, reset } = useProfile();
  const router = useRouter();

  // Un profil existant s'édite d'un bloc ; une première visite se fait question par question.
  const mode = profile ? 'form' : 'wizard';
  const initial = formFromProfile(profile, staleWeight, mode);
  const large = useLarge();

  return (
    <>
      {/* Le profil figurait au sitemap sans porter ni titre, ni description, ni canonique : la
          page sortait avec le titre du document par défaut, et un moteur n'avait rien à en dire.
          Elle vaut d'être indexée — c'est la page qui explique quelles informations l'application
          demande, et pourquoi. */}
      <Seo
        title="Mon profil : les informations qui servent au calcul"
        description="Sexe, date de naissance, taille, poids et objectif : les cinq informations dont le calcul a besoin, et rien d’autre. Elles restent sur votre appareil et ne sont envoyées nulle part."
        canonical={`${SITE_URL}/profil`}
      />
      <Page contentClassName="pt-8" keyboardShouldPersistTaps="handled">
        {/* Sur grand écran, l'illustration prend la colonne que le formulaire n'occupe pas — un
          champ de saisie n'a aucune raison de s'étirer sur onze cents points. Elle est alignée en
          haut : suivre le formulaire qui s'allonge la ferait glisser hors de vue. */}
        <View className={large ? 'flex-row items-start gap-12' : ''}>
          <View className="min-w-0 flex-1">
            <ProfilForm
              // Réinitialise le formulaire si le profil enregistré change sous ses pieds.
              key={profile?.updatedAt ?? 'nouveau'}
              initial={initial}
              hasProfile={Boolean(profile)}
              onSubmit={(input) => {
                save(input);
                router.navigate('/metabolisme');
              }}
              onCancel={() => router.navigate(profile ? '/metabolisme' : '/')}
              onReset={() => {
                reset();
                router.navigate('/');
              }}
            />
          </View>
          {large ? (
            <View className="w-[280px] flex-none pt-10">
              <IllustrationProfil />
            </View>
          ) : null}
        </View>

        <View className="mt-6 gap-3">
          <ApparenceCard />

          {/* Les rappels et la sauvegarde restent sur leur écran : on les règle une fois. Ce qui est
            ici est le chemin, pas les réglages — les poser sous un formulaire de saisie ferait de
            cet écran une liste sans tête, et l'export s'y retrouverait juste sous le bouton
            d'envoi du profil. */}
          <LienReglage
            href="/reglages"
            icone="reglage"
            titre="Réglages"
            texte="Les rappels de mouvement, et la copie de vos données à sortir ou à restaurer."
          />

          {/* Les deux magasins exigent que la politique soit atteignable depuis l'application, pas
            seulement depuis leur fiche. Sa place est ici : c'est l'écran où l'on confie ses
            informations. */}
          <LienReglage
            href="/confidentialite"
            icone="bouclier"
            titre="Confidentialité"
            texte="Ce que deviennent vos informations : aucune donnée collectée, aucun compte, aucun serveur."
          />
        </View>
      </Page>
    </>
  );
}

/** Une carte qui mène ailleurs : pastille, titre, une ligne, et le chevron qui dit qu'on sort. */
function LienReglage({
  href,
  icone,
  titre,
  texte,
}: {
  href: '/reglages' | '/confidentialite';
  icone: 'reglage' | 'bouclier';
  titre: string;
  texte: string;
}) {
  const palette = usePalette();

  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="link" className="active:opacity-70">
        <Card className="flex-row items-center gap-4 px-[18px] py-4">
          <View className="size-10 flex-none items-center justify-center rounded-full bg-primary-tint">
            <Icon name={icone} size={20} color={palette.primaryInk} />
          </View>
          <View className="min-w-0 flex-1">
            <Overline niveau={2} className="mb-1">
              {titre}
            </Overline>
            <Text className="font-sans text-base leading-[22px] text-muted">{texte}</Text>
          </View>
          <Icon name="flecheDroite" size={16} color={palette.muted2} />
        </Card>
      </Pressable>
    </Link>
  );
}
