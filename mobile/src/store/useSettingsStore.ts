import { create } from "zustand";
import {
  updateNotificationSettings,
  NotificationSettingsPayload,
} from "../services/api/notificationService";

export interface NotificationSettings {
  hungerAlerts: boolean;
  hungerAlertOffset: number; // minutes before
  hydrationAlerts: boolean;
  hydrationThreshold: number; // percentage
  patternNudges: boolean;
}

export interface QuietHours {
  start: string; // HH:mm
  end: string; // HH:mm
}

interface SettingsState {
  notifications: NotificationSettings;
  quietHours: QuietHours;
  isSaving: boolean;

  setNotificationSetting: (
    key: keyof NotificationSettings,
    value: boolean | number,
  ) => void;
  setQuietHours: (hours: Partial<QuietHours>) => void;
  saveSettings: () => Promise<void>;
  loadFromApi: (data: NotificationSettingsPayload) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  notifications: {
    hungerAlerts: true,
    hungerAlertOffset: 30,
    hydrationAlerts: true,
    hydrationThreshold: 40,
    patternNudges: true,
  },
  quietHours: {
    start: "22:00",
    end: "07:00",
  },
  isSaving: false,

  setNotificationSetting: (key, value) => {
    set((state) => ({
      notifications: {
        ...state.notifications,
        [key]: value,
      },
    }));

    // Auto-save to API on change (debounced fire-and-forget)
    const { notifications, quietHours } = get();
    const payload: Partial<NotificationSettingsPayload> = {
      [key === "hungerAlertOffset" ? "hungerAlertMinutesBefore" : key]: value,
    };
    updateNotificationSettings(payload).catch((err) =>
      console.warn("[Settings] Failed to sync notification setting:", err),
    );
  },

  setQuietHours: (hours) => {
    set((state) => ({
      quietHours: {
        ...state.quietHours,
        ...hours,
      },
    }));

    // Sync to API
    const payload: Partial<NotificationSettingsPayload> = {};
    if (hours.start) payload.quietHoursStart = hours.start;
    if (hours.end) payload.quietHoursEnd = hours.end;
    updateNotificationSettings(payload).catch((err) =>
      console.warn("[Settings] Failed to sync quiet hours:", err),
    );
  },

  saveSettings: async () => {
    const { notifications, quietHours } = get();
    set({ isSaving: true });
    try {
      await updateNotificationSettings({
        hungerAlerts: notifications.hungerAlerts,
        hungerAlertMinutesBefore: notifications.hungerAlertOffset,
        hydrationAlerts: notifications.hydrationAlerts,
        hydrationThreshold: notifications.hydrationThreshold,
        patternNudges: notifications.patternNudges,
        quietHoursStart: quietHours.start,
        quietHoursEnd: quietHours.end,
      });
    } catch (err) {
      console.warn("[Settings] Failed to save settings:", err);
    } finally {
      set({ isSaving: false });
    }
  },

  loadFromApi: (data) => {
    set({
      notifications: {
        hungerAlerts: data.hungerAlerts,
        hungerAlertOffset: data.hungerAlertMinutesBefore,
        hydrationAlerts: data.hydrationAlerts,
        hydrationThreshold: data.hydrationThreshold,
        patternNudges: data.patternNudges,
      },
      quietHours: {
        start: data.quietHoursStart,
        end: data.quietHoursEnd,
      },
    });
  },
}));
