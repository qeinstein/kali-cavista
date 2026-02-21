import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

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

export const scheduleHungerAlert = async (
  nextHungerAt: Date,
  message: string,
): Promise<string | null> => {
  const notifyAt = new Date(nextHungerAt.getTime() - 15 * 60 * 1000);
  if (notifyAt <= new Date()) return null;

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

export const scheduleHydrationAlert = async (): Promise<string> => {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "💧 Hydration Check",
      body: "You haven't logged water in 2 hours. Time to drink up!",
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
    trigger: null, // Send immediately
  });
};
