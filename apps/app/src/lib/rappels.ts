/**
 * La planification effective des rappels, côté système.
 *
 * `@vitae/core/rappels` décide *quand* et *quoi* ; ce module se contente de le dire à iOS ou à
 * Android. La séparation n'est pas cosmétique : le calcul des créneaux est testable sans
 * téléphone, et c'est là que sont les cas tordus (bornes, plafond d'iOS, plage inversée).
 *
 * Un mot sur la vie privée, parce que c'est le genre de fonction qui la met en jeu sans qu'on y
 * pense : tout est local. Ce sont des notifications *locales*, programmées sur l'appareil, sans
 * jeton d'envoi, sans serveur et sans réseau. La déclaration « aucune donnée collectée » faite aux
 * deux magasins reste vraie. Elle cesserait de l'être avec des notifications distantes, qui
 * exigeraient un identifiant d'appareil.
 */

import { planifierRappels, type RappelsConfig } from '@vitae/core/rappels';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const CANAL = 'sedentarite';

/**
 * Les rappels s'affichent aussi quand l'application est ouverte.
 *
 * Le comportement par défaut les avale dans ce cas, ce qui serait absurde ici : quelqu'un qui
 * consulte ses chiffres depuis quarante minutes est exactement la personne à qui le rappel
 * s'adresse.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * Demande l'autorisation, si elle n'a pas déjà été accordée ou refusée.
 *
 * Rend `false` sur un refus, y compris définitif : c'est à l'appelant de le dire à l'utilisateur
 * plutôt que de laisser un interrupteur allumé qui ne déclenche rien.
 */
export async function demanderPermission(): Promise<boolean> {
  const actuelle = await Notifications.getPermissionsAsync();
  if (actuelle.granted) return true;
  // `canAskAgain` à faux : l'utilisateur a refusé pour de bon, redemander n'affiche plus rien.
  if (!actuelle.canAskAgain) return false;

  const demande = await Notifications.requestPermissionsAsync();
  return demande.granted;
}

/**
 * Applique une configuration : efface les rappels en attente, puis reprogramme.
 *
 * Effacer d'abord, systématiquement, plutôt que de calculer une différence : les rappels sont peu
 * nombreux et sans état, et une reprogrammation complète est la seule façon de garantir qu'un
 * ancien créneau ne survit pas à un changement de plage horaire.
 *
 * Rend `false` si l'autorisation manque — rien n'a alors été programmé.
 */
export async function appliquerRappels(config: RappelsConfig): Promise<boolean> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!config.actif) return true;

  if (!(await demanderPermission())) return false;

  if (Platform.OS === 'android') {
    // Le canal doit exister avant la première notification, sinon Android la range dans un canal
    // par défaut que l'utilisateur ne peut pas régler séparément.
    await Notifications.setNotificationChannelAsync(CANAL, {
      name: 'Rappels de mouvement',
      importance: Notifications.AndroidImportance.DEFAULT,
      // Sans vibration ni son : c'est une invitation, pas une alarme. Quatorze alarmes par jour se
      // désinstallent le jour même.
      vibrationPattern: [0],
      sound: null,
      showBadge: false,
    });
  }

  for (const rappel of planifierRappels(config)) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: rappel.titre,
        body: rappel.corps,
        // Silencieux : c'est une invitation, pas une alarme.
        sound: false,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: rappel.hour,
        minute: rappel.minute,
        channelId: CANAL,
      },
    });
  }

  return true;
}

/** Combien de rappels le système a réellement en attente. Sert à vérifier, pas à décider. */
export async function rappelsEnAttente(): Promise<number> {
  return (await Notifications.getAllScheduledNotificationsAsync()).length;
}

/** Vrai quand la plateforme sait programmer des rappels. Faux sur le web. */
export const RAPPELS_DISPONIBLES = true;
