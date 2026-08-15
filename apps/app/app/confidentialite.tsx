import { formatLongDate } from '@vitae/core/date';
import { CONFIDENTIALITE, CONFIDENTIALITE_MAJ, CONFIDENTIALITE_RESUME } from '@vitae/core/legal';
import { SITE_URL } from '@vitae/core/site';

import { Text, View } from 'react-native';
import Seo from '@/components/layout/Seo';
import IllustrationConfidentialite from '@/components/ui/illustrations/IllustrationConfidentialite';
import Page, { useLarge } from '@/components/ui/Page';
import Titre from '@/components/ui/Titre';

/**
 * La politique de confidentialité.
 *
 * Elle existe d'abord parce que les deux magasins exigent une URL publique, mais elle est ici et
 * non sur une page à part : la fiche de l'App Store et celle du Play Store pointent vers cette
 * adresse, et l'écran est atteignable depuis l'application elle-même. Un seul texte, une seule
 * vérité, quelle que soit la porte d'entrée.
 */
export default function ConfidentialitePage() {
  const large = useLarge();

  return (
    <>
      <Seo
        title="Confidentialité : aucune donnée collectée"
        description={CONFIDENTIALITE_RESUME}
        canonical={`${SITE_URL}/confidentialite`}
      />

      <Page>
        {/* L'image ne montre ni cadenas ni bouclier : rien ne part, il n'y a donc rien à
            défendre. La raison est écrite dans le composant. */}
        <View className={large ? 'mb-8 flex-row items-center gap-12' : 'mb-8'}>
          <View className="min-w-0 flex-1">
            <Titre niveau={1} className="mb-3 font-display text-h1 leading-[44px] text-ink">
              Confidentialité
            </Titre>
            <Text className="font-sans text-body leading-[26px] text-muted">
              {CONFIDENTIALITE_RESUME}
            </Text>
          </View>
          {large ? (
            <View className="w-[260px] flex-none">
              <IllustrationConfidentialite />
            </View>
          ) : null}
        </View>

        <View className="gap-6">
          {CONFIDENTIALITE.map((section) => (
            <View key={section.titre}>
              <Titre niveau={2} className="mb-2 font-display text-h3 leading-[26px] text-ink">
                {section.titre}
              </Titre>
              <View className="gap-3">
                {section.paragraphes.map((p) => (
                  <Text key={p} className="font-sans text-base leading-[22px] text-muted">
                    {p}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>

        <Text className="font-sans mt-8 text-caption text-faint">
          Dernière révision : {formatLongDate(CONFIDENTIALITE_MAJ)}
        </Text>
      </Page>
    </>
  );
}
