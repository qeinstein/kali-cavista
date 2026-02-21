import { create } from "zustand";

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
  },

  setQuietHours: (hours) => {
    set((state) => ({
      quietHours: {
        ...state.quietHours,
        ...hours,
      },
    }));
  },

  saveSettings: async () => {
    set({ isSaving: true });
    // Simulate API call PUT /notifications/settings
    await new Promise((r) => setTimeout(r, 1000));
    set({ isSaving: false });
  },
}));
