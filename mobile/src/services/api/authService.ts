import { useState, useEffect } from "react";
import BaseRequest, { parseNetworkError } from "../../helpers/services";
import { registerPushToken } from "../notifications";
import { useAuthStore, AuthUser } from "../../store/useAuthStore";
import { useRouter } from "expo-router";
import { useRequest } from "../../helpers/services/useRequest";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { GOOGLE_CLIENT_ID } from "../../constants/config";

WebBrowser.maybeCompleteAuthSession();

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const register = async (payload: RegisterPayload) => {
  try {
    const response: any = await BaseRequest.post(
      "/api/v1/auth/register",
      payload,
    );
    const { token, user } = response;
    if (token) {
      useAuthStore.setState({ token, user });
      BaseRequest.setToken(token);
      registerPushToken().catch(() => {}); // fire-and-forget
    }
    return response;
  } catch (error) {
    throw error;
  }
};

export const login = async (payload: LoginPayload) => {
  try {
    const response: any = await BaseRequest.post("/api/v1/auth/login", payload);
    const { token, user } = response;
    if (token) {
      BaseRequest.setToken(token);
      useAuthStore.setState({ token, user });
      registerPushToken().catch(() => {}); // fire-and-forget
    }
    return response;
  } catch (error) {
    throw error;
  }
};

export const googleLogin = async (idToken: string) => {
  try {
    const response: any = await BaseRequest.post("/api/v1/auth/google", {
      token: idToken,
    });
    const { token, user } = response;
    if (token) {
      BaseRequest.setToken(token);
      useAuthStore.setState({ token, user });
    }
    return response;
  } catch (error) {
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const response: any = await BaseRequest.post("/api/v1/auth/refresh");
    const { token } = response;
    if (token) {
      BaseRequest.setToken(token);
      useAuthStore.setState({ token });
    }
    return response;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    await BaseRequest.post("/api/v1/auth/logout");
  } finally {
    useAuthStore.getState().logout();
    BaseRequest.setToken("");
  }
};

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

  return {
    isLoading,
    error,
    register: (payload: RegisterPayload) =>
      handleAction(() => register(payload)),
    login: (payload: LoginPayload) => handleAction(() => login(payload)),
    logout: () => handleAction(() => logout()),
    refreshToken: () => handleAction(() => refreshToken()),
    googleLogin: (idToken: string) => handleAction(() => googleLogin(idToken)),
  };
};

export const useGoogleAuth = () => {
  const { googleLogin, isLoading: isAuthLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_CLIENT_ID,
    androidClientId: GOOGLE_CLIENT_ID,
    webClientId: GOOGLE_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      if (authentication?.idToken) {
        googleLogin(authentication.idToken)
          .then(() => {
            router.replace("/(tabs)");
          })
          .catch((err) => {
            const [message] = parseNetworkError(err);
            setError(message as string);
          });
      }
    }
  }, [response]);

  return {
    promptAsync: () => promptAsync(),
    isLoading: isAuthLoading || !request,
    error,
  };
};
