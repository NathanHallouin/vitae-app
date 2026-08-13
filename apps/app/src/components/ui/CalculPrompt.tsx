import { useRouter } from 'expo-router';
import { Text } from 'react-native';
import { Button, Card } from './primitives';

/**
 * Ce qu'on affiche à la place des chiffres quand aucun profil n'est enregistré.
 *
 * Comme sur le site, l'écran reste entier : les explications se lisent très bien sans avoir rien
 * calculé, et seuls les chiffres manquent. La phrase sur le navigateur, elle, ne tient plus — les
 * réponses restent ici sur l'appareil.
 */
export default function CalculPrompt({ quoi }: { quoi: string }) {
  const router = useRouter();
  return (
    <Card className="p-6">
      <Text className="mb-2 font-display text-h3 text-ink">Vos chiffres, en une minute</Text>
      <Text className="mb-5 text-base leading-[22px] text-muted">
        {quoi} Quatre questions suffisent : votre sexe, votre date de naissance, vos mesures et
        votre objectif. Rien n’est envoyé sur internet, vos réponses restent sur cet appareil.
      </Text>
      <Button variant="contained" size="large" onPress={() => router.navigate('/profil')}>
        Calculer mes chiffres
      </Button>
    </Card>
  );
}
