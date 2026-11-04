import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";

// O Expo Go não traz o módulo nativo de notificações: nesse caso (ou na web) devolvemos null
// e o app funciona normalmente, só sem lembretes. Em um development build elas funcionam.
let cached: typeof import("expo-notifications") | null | undefined;
export function getNotifications() {
  if (cached !== undefined) return cached;
  cached = null;
  if (Platform.OS === "web" || Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return cached;
  try {
    const N = require("expo-notifications") as typeof import("expo-notifications");
    N.setNotificationHandler({
      handleNotification: async () => ({ shouldPlaySound: true, shouldSetBadge: false, shouldShowBanner: true, shouldShowList: true }),
    });
    cached = N;
  } catch {
    cached = null;
  }
  return cached;
}

// Canal de notificação do Android: som padrão do sistema + vibração.
export const NOTIFICATION_CHANNEL = "rotina-alertas";
export async function setupChannel(n: typeof import("expo-notifications")) {
  if (Platform.OS !== "android") return;
  await n.setNotificationChannelAsync(NOTIFICATION_CHANNEL, {
    name: "Rotina",
    importance: n.AndroidImportance.HIGH,
    sound: "default",
    enableVibrate: true,
    vibrationPattern: [0, 250, 250, 250],
    lockscreenVisibility: n.AndroidNotificationVisibility.PUBLIC,
  });
  // remove canais de versões anteriores (ex.: um por som escolhido)
  const all = await n.getNotificationChannelsAsync();
  for (const ch of all)
    if (ch.id.startsWith("rotina") && ch.id !== NOTIFICATION_CHANNEL)
      await n.deleteNotificationChannelAsync(ch.id);
}
