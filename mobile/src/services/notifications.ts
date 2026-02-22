import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { registerDeviceToken } from "./api/profileService";
import { logNotificationInteraction } from "./api/notificationService";
import { useSettingsStore } from "../store/useSettingsStore";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#00D4AA",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
};

/**
 * Get the Expo push token and register it with the backend.
 * Call this after the user logs in or when permissions are granted.
 */
export const registerPushToken = async (): Promise<void> => {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) {
      console.warn("[Notifications] Permission not granted");
      return;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ||
      Constants.easConfig?.projectId;

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const fcmToken = tokenData.data;
    const platform = Platform.OS as "ios" | "android";

    await registerDeviceToken(fcmToken, platform);
    console.log("[Notifications] Device token registered:", fcmToken);
  } catch (error) {
    console.warn("[Notifications] Failed to register push token:", error);
  }
};

// ─── Prediction-based notifications ─────────────────────────────────────────

/**
 * Schedule a hunger prediction notification.
 * Uses the user's hungerAlertOffset setting (default 30 min before).
 */
export const schedulePredictionNotification = async (
  nextHungerAt: Date,
  confidence: number,
): Promise<string | null> => {
  const settings = useSettingsStore.getState();
  if (!settings.notifications.hungerAlerts) return null;

  const offsetMs = settings.notifications.hungerAlertOffset * 60 * 1000;
  const notifyAt = new Date(nextHungerAt.getTime() - offsetMs);
  if (notifyAt <= new Date()) return null;

  // Check quiet hours
  if (
    isInQuietHours(notifyAt, settings.quietHours.start, settings.quietHours.end)
  ) {
    return null;
  }

  const confidenceText =
    confidence >= 0.85
      ? "high confidence"
      : confidence >= 0.6
        ? "moderate confidence"
        : "low confidence";

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "🍽️ Hunger Prediction",
      body: `Based on your patterns (${confidenceText}), you'll likely get hungry in about ${settings.notifications.hungerAlertOffset} minutes. Time to plan a meal!`,
      data: {
        type: "prediction",
        nextHungerAt: nextHungerAt.toISOString(),
        confidence,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: notifyAt,
    },
  });

  return id;
};

/**
 * Original hunger alert (kept for backward compat).
 */
export const scheduleHungerAlert = async (
  nextHungerAt: Date,
  message: string,
): Promise<string | null> => {
  const settings = useSettingsStore.getState();
  if (!settings.notifications.hungerAlerts) return null;

  const offsetMs = settings.notifications.hungerAlertOffset * 60 * 1000;
  const notifyAt = new Date(nextHungerAt.getTime() - offsetMs);
  if (notifyAt <= new Date()) return null;

  if (
    isInQuietHours(notifyAt, settings.quietHours.start, settings.quietHours.end)
  ) {
    return null;
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "🍽️ Hunger Incoming",
      body: message,
      data: { type: "hunger" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: notifyAt,
    },
  });

  return id;
};

/**
 * Schedule a hydration reminder only if hydration alerts are enabled.
 */
export const scheduleHydrationAlert = async (): Promise<string | null> => {
  const settings = useSettingsStore.getState();
  if (!settings.notifications.hydrationAlerts) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "💧 Hydration Check",
      body: `You haven't logged water recently. Your hydration threshold is set to ${settings.notifications.hydrationThreshold}%. Drink up!`,
      data: { type: "hydration" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2 * 60 * 60,
      repeats: true,
    },
  });

  return id;
};

/**
 * Send a pattern nudge notification (used by insights engine).
 */
export const sendPatternNudge = async (
  title: string,
  body: string,
): Promise<string | null> => {
  const settings = useSettingsStore.getState();
  if (!settings.notifications.patternNudges) return null;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: `📊 ${title}`,
      body,
      data: { type: "pattern" },
    },
    trigger: null,
  });

  return id;
};

export const cancelAllNotifications = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const sendTestNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🔔 Test Notification",
      body: "Real-time alerts are now active! This is a test from your settings.",
      data: { type: "test" },
    },
    trigger: null,
  });
};

// ─── Notification interaction tracking ──────────────────────────────────────

/**
 * Set up a listener that logs notification interactions to the API.
 * Call this once at app startup.
 */
export const setupNotificationInteractionListener = () => {
  const subscription = Notifications.addNotificationResponseReceivedListener(
    async (response) => {
      const notificationId = response.notification.request.identifier;
      const actionId = response.actionIdentifier;
      const action =
        actionId === Notifications.DEFAULT_ACTION_IDENTIFIER
          ? "opened"
          : "acted";
      const receivedAt = response.notification.date
        ? new Date(response.notification.date).toISOString()
        : new Date().toISOString();

      try {
        await logNotificationInteraction({
          notificationId,
          action,
          receivedAt,
          actedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("[Notifications] Failed to log interaction:", err);
      }
    },
  );

  return subscription;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function isInQuietHours(date: Date, start: string, end: string): boolean {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const mins = date.getHours() * 60 + date.getMinutes();
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;

  if (startMins <= endMins) {
    return mins >= startMins && mins < endMins;
  }
  // Wraps midnight (e.g. 22:00–07:00)
  return mins >= startMins || mins < endMins;
}
