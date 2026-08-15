import { todayISO } from '@vitae/core/date';
import { construireSauvegarde, lireSauvegarde, nomDeFichier } from '@vitae/core/sauvegarde';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import Overline from '@/components/ui/Overline';
import { Button, Card } from '@/components/ui/primitives';
import { exporter, ouvrirUnFichier, PEUT_OUVRIR_UN_FICHIER } from '@/lib/sauvegarde';
import { useProfile } from '@/state/ProfileProvider';
import { usePalette } from '@/theme/palette';

/**
 * Sortir ses données, et les faire rentrer.
 *
 * Sans compte ni serveur, trois gestes ordinaires détruisent des mois de pesées sans recours :
 * vider les données du navigateur, naviguer en privé, changer d'appareil. Cette carte est le seul
 * filet, et c'est pourquoi elle est livrée en même temps que le suivi de poids — créer des données
 * auxquelles on tient sans porte de sortie serait leur tendre un piège.
 *
 * Sa place est ici, sur l'écran du profil, juste au-dessus de « Tout effacer » : c'est là qu'on
 * vient quand on s'interroge sur ce que devient ce qu'on a saisi.
 *
 * **La restauration remplace, elle ne fusionne pas.** Fusionner deux historiques demanderait de
 * trancher les jours présents des deux côtés, sans que l'utilisateur puisse voir ce qui a été
 * choisi. Remplacer est brutal mais lisible, et le nombre de pesées est annoncé avant.
 */
export default function DonneesCard() {
  const { profile, suivi, restaurer } = useProfile();
  const palette = usePalette();
  const [colle, setColle] = useState('');
  const [collageOuvert, setCollageOuvert] = useState(false);
  const [message, setMessage] = useState<{ texte: string; ok: boolean } | null>(null);

  const rien = !profile && suivi.historique.length === 0;

  const enregistrer = async () => {
    const aujourdhui = todayISO();
    const contenu = construireSauvegarde(profile, suivi.historique, aujourdhui);
    try {
      const fait = await exporter(contenu, nomDeFichier(aujourdhui));
      setMessage(fait ? { texte: 'Vos données sont sorties.', ok: true } : null);
    } catch {
      setMessage({ texte: 'L’enregistrement n’a pas abouti.', ok: false });
    }
  };

  /** Un texte de sauvegarde, d'où qu'il vienne, jusqu'à l'état de l'application. */
  const restaurerDepuis = (texte: string) => {
    const lecture = lireSauvegarde(texte);
    if (!lecture.ok) {
      setMessage({ texte: lecture.message, ok: false });
      return;
    }
    restaurer(lecture.sauvegarde);
    setColle('');
    setMessage({ texte: lecture.message.replace('Prêt à restaurer', 'Restauré'), ok: true });
  };

  const depuisUnFichier = async () => {
    const texte = await ouvrirUnFichier();
    if (texte !== null) restaurerDepuis(texte);
  };

  return (
    <Card taille className="mt-6 p-6">
      <Overline niveau={2} className="mb-1">
        Mes données
      </Overline>
      <Text className="font-sans mb-4 text-base leading-[22px] text-muted">
        Tout ce que vous saisissez reste sur cet appareil. C’est ce qui permet à l’application de ne
        rien collecter — et ce qui fait que vider les données du navigateur, ou changer de
        téléphone, efface tout sans recours. Sortez une copie de temps en temps.
      </Text>

      <View className="flex-row flex-wrap gap-3">
        <Button variant="outlined" onPress={enregistrer} disabled={rien}>
          {PEUT_OUVRIR_UN_FICHIER ? 'Enregistrer une copie' : 'Partager une copie'}
        </Button>
        {PEUT_OUVRIR_UN_FICHIER ? (
          <Button variant="text" onPress={depuisUnFichier}>
            Restaurer depuis un fichier
          </Button>
        ) : null}
      </View>

      {rien ? (
        <Text className="font-sans mt-3 text-caption text-muted2">
          Il n’y a encore rien à enregistrer.
        </Text>
      ) : null}

      {message ? (
        <View
          className={`mt-4 rounded-xl p-[14px] ${message.ok ? 'bg-surface2' : 'bg-warn-bg'}`}
          accessibilityLiveRegion="polite"
        >
          <Text
            className={`font-sans text-small leading-[20px] ${message.ok ? 'text-ink' : 'text-warn-ink'}`}
          >
            {message.texte}
          </Text>
        </View>
      ) : null}

      {/* Le collage est le chemin de secours partout, et le seul en natif : sans module natif, il
          n'y a pas de sélecteur de fichier. Replié, parce que ce n'est pas le geste courant.

          Un repli local plutôt que `Repliable`, qui est lui-même une carte : l'imbriquer ferait
          une carte dans une carte. Le contenu reste dans le document, comme partout ailleurs. */}
      <View className="mt-4 border-t border-divider pt-4">
        <Button
          variant="text"
          className="self-start"
          onPress={() => setCollageOuvert((o) => !o)}
          accessibilityLabel="Restaurer depuis un texte collé"
        >
          {collageOuvert ? 'Masquer le collage' : 'Restaurer depuis un texte'}
        </Button>

        <View className="mt-3" style={{ display: collageOuvert ? 'flex' : 'none' }}>
          <TextInput
            value={colle}
            onChangeText={setColle}
            multiline
            numberOfLines={5}
            placeholder='{ "v": 1, … }'
            placeholderTextColor={palette.faint}
            accessibilityLabel="Contenu de la sauvegarde à restaurer"
            className="font-sans min-h-[110px] rounded-control border border-line bg-surface2 p-3 text-small text-ink"
            style={{ outline: 'none', textAlignVertical: 'top' }}
          />
          <View className="mt-3 items-start">
            <Button
              variant="outlined"
              onPress={() => restaurerDepuis(colle)}
              disabled={colle.trim().length === 0}
            >
              Restaurer
            </Button>
          </View>
        </View>
      </View>
    </Card>
  );
}
