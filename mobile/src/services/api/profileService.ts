import BaseRequest from "../../helpers/services";
import { useRequest } from "../../helpers/services/useRequest";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  water_goal_ml: number;
  meal_frequency: number;
  activity_level: string;
  created_at: string;
}

export const useProfile = () => {
  return useRequest("/api/v1/profile");
};

export const updateProfile = async (
  payload: Partial<Omit<UserProfile, "id" | "email" | "created_at">>,
  onRefresh?: () => void,
) => {
  try {
    const response: any = await BaseRequest.put("/api/v1/profile", payload);
    if (onRefresh) onRefresh();
    return response;
  } catch (error) {
    throw error;
  }
};

export const registerPushToken = async (
  token: string,
  platform: "ios" | "android",
) => {
  try {
    return await BaseRequest.post("/api/v1/profile/push-token", {
      token,
      platform,
    });
  } catch (error) {
    throw error;
  }
};

export const updateLocation = async (
  lat: number,
  lng: number,
  city: string,
) => {
  try {
    return await BaseRequest.put("/api/v1/profile/location", {
      lat,
      lng,
      city,
    });
  } catch (error) {
    throw error;
  }
};
