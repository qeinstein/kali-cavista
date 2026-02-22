import { useState, useEffect } from "react";
import BaseRequest, { parseNetworkError } from "../../helpers/services";
import { useRequest } from "../../helpers/services/useRequest";
import { useAuthStore } from "../../store/useAuthStore";

// ─── Types matching API responses ───────────────────────────────────────────────

export interface Baseline {
  mealsPerDay: number;
  activityLevel: string;
  waterTargetMl: number;
  timezone?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  baseline: Baseline;
}

export interface UpdateProfilePayload {
  name?: string;
  baseline?: Partial<Omit<Baseline, "timezone">>;
}

// ─── Hooks & functions ──────────────────────────────────────────────────────────

/** GET /api/v1/user/profile — fetch current user profile & baseline */
export const useProfile = () => {
  const result = useRequest("/api/v1/user/profile");

  // Keep auth store user in sync with profile data — inside useEffect to avoid
  // "Cannot update a component while rendering a different component" error
  useEffect(() => {
    if (result.data) {
      const { id, name, email } = result.data as any;
      const current = useAuthStore.getState().user;
      if (current?.name !== name || current?.email !== email) {
        useAuthStore.setState({ user: { id, name, email } });
      }
    }
  }, [result.data]);

  return result;
};

/** PUT /api/v1/user/profile — update profile & preferences */
export const updateProfile = async (
  payload: UpdateProfilePayload,
  onRefresh?: () => void,
) => {
  const response: any = await BaseRequest.put("/api/v1/user/profile", payload);

  // Sync updated user data back to auth store
  if (response?.user) {
    const { id, name, email } = response.user;
    useAuthStore.setState({ user: { id, name, email } });
  }

  if (onRefresh) onRefresh();
  return response;
};

/** POST /api/v1/user/device-token — register FCM push token */
export const registerDeviceToken = async (
  fcmToken: string,
  platform: "ios" | "android",
) => {
  return await BaseRequest.post("/api/v1/user/device-token", {
    fcmToken,
    platform,
  });
};

/** PUT /api/v1/user/location — update lat/lon for weather-based hydration scoring */
export const updateLocation = async (lat: number, lon: number) => {
  return await BaseRequest.put("/api/v1/user/location", { lat, lon });
};

/** Convenience hook wrapping profile operations with loading/error state */
export const useProfileService = () => {
  const profile = useProfile();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const save = async (payload: UpdateProfilePayload) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await updateProfile(payload, profile.onRefresh);
      return res;
    } catch (err: any) {
      const [message] = parseNetworkError(err);
      setSaveError(message as string);
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    ...profile,
    isSaving,
    saveError,
    save,
  };
};
