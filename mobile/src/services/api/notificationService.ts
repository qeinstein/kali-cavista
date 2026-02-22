import { useState } from "react";
import BaseRequest, { parseNetworkError } from "../../helpers/services";
import { useRequest } from "../../helpers/services/useRequest";

// ─── Types matching API contracts ────────────────────────────────────────────

/**
 * GET /api/v1/notifications/settings
 * PUT /api/v1/notifications/settings
 * Both use the same shape
 */
export interface NotificationSettingsPayload {
  hungerAlerts: boolean;
  hungerAlertMinutesBefore: number;
  hydrationAlerts: boolean;
  hydrationThreshold: number;
  patternNudges: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
}

export interface UpdateNotificationSettingsResponse {
  success: boolean;
  settings: NotificationSettingsPayload;
}

/**
 * POST /api/v1/notifications/interaction
 * → Log that a user interacted with a notification
 */
export interface NotificationInteractionPayload {
  notificationId: string;
  action: string;
  receivedAt: string;
  actedAt: string;
}

// ─── GET: Current notification settings ─────────────────────────────────────

/**
 * useNotificationSettings()
 * → GET /api/v1/notifications/settings
 * → Returns current notification preferences
 */
export const useNotificationSettings = () => {
  return useRequest("/api/v1/notifications/settings", {
    initialValue: null,
  });
};

// ─── PUT: Update notification settings ──────────────────────────────────────

/**
 * updateNotificationSettings(settings)
 * → PUT /api/v1/notifications/settings
 * → Send only changed fields
 * → Returns { success, settings: { ...all fields } }
 */
export const updateNotificationSettings = async (
  settings: Partial<NotificationSettingsPayload>,
): Promise<UpdateNotificationSettingsResponse> => {
  return await BaseRequest.put("/api/v1/notifications/settings", settings);
};

// ─── POST: Log notification interaction ─────────────────────────────────────

/**
 * logNotificationInteraction(data)
 * → POST /api/v1/notifications/interaction
 * → Returns { success: true }
 */
export const logNotificationInteraction = async (
  data: NotificationInteractionPayload,
): Promise<{ success: boolean }> => {
  return await BaseRequest.post("/api/v1/notifications/interaction", data);
};

// ─── useNotificationService Hook ────────────────────────────────────────────

export const useNotificationService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const settings = useNotificationSettings();

  const handleAction = async <T>(action: () => Promise<T>): Promise<T> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await action();
      return res;
    } catch (err: any) {
      const [message] = parseNetworkError(err);
      setError(message as string);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSettings = async (
    partial: Partial<NotificationSettingsPayload>,
  ) => {
    return handleAction(() => updateNotificationSettings(partial));
  };

  const handleLogInteraction = async (data: NotificationInteractionPayload) => {
    return handleAction(() => logNotificationInteraction(data));
  };

  return {
    isLoading,
    error,
    settings,
    updateSettings: handleUpdateSettings,
    logInteraction: handleLogInteraction,
  };
};
