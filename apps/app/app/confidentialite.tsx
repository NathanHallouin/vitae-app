import { formatLongDate } from '@vitae/core/date';
import { CONFIDENTIALITE, CONFIDENTIALITE_MAJ, CONFIDENTIALITE_RESUME } from '@vitae/core/legal';
import { SITE_URL } from '@vitae/core/site';

import { Text, View } from 'react-native';
import Seo from '@/components/layout/Seo';
import Page from '@/components/ui/Page';

/**
 * La politique de confidentialité.
 *
 * Elle existe d'abord parce que les deux magasins exigent une URL publique, mais elle est ici et
 * non sur une page à part : la fiche de l'App Store et celle du Play Store pointent vers cette
 * adresse, et l'écran est atteignable depuis l'application elle-même. Un seul texte, une seule
 * vérité, quelle que soit la porte d'entrée.
 */
export default function ConfidentialitePage() {
  return (
    <>
      <Seo
        title="Confidentialité : aucune donnée collectée"
        description={CONFIDENTIALITE_RESUME}
        canonical={`${SITE_URL}/confidentialite`}
      />

      <Page>
        <Text
          accessibilityRole="header"
          className="mb-3 font-display text-h1 leading-[44px] text-ink"
        >
          Confidentialité
        </Text>
        <Text className="mb-8 text-body leading-[26px] text-muted">{CONFIDENTIALITE_RESUME}</Text>

        <View className="gap-6">
          {CONFIDENTIALITE.map((section) => (
            <View key={section.titre}>
              <Text
                accessibilityRole="header"
                className="mb-2 font-display text-h3 leading-[26px] text-ink"
              >
                {section.titre}
              </Text>
              <View className="gap-3">
                {section.paragraphes.map((p) => (
                  <Text key={p} className="text-base leading-[22px] text-muted">
                    {p}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>

        <Text className="mt-8 text-caption text-faint">
          Dernière révision : {formatLongDate(CONFIDENTIALITE_MAJ)}
        </Text>
      </Page>
    </>
  );
}
