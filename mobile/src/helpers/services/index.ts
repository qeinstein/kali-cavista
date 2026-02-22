import axios, { AxiosInstance } from "axios";
import { Platform } from "react-native";
import { useAuthStore } from "../../store/useAuthStore";
import { baseURL, config as appConfig } from "../../constants/config";

export { baseURL };

interface BaseRequestInterface extends AxiosInstance {
  setToken: (token: string) => void;
}

const getDeviceDetails = () => {
  return {
    platform: Platform.OS === "ios" ? "iOS" : "Android",
    browser: "N/A",
    environment: __DEV__ ? "Development" : "Production",
  };
};

// @ts-ignore
const BaseRequest: BaseRequestInterface = axios.create({
  baseURL,
  timeout: 60000, // 60 seconds — gives Render free tier time to wake up
  headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
});

let isRefreshing = false;
BaseRequest.setToken = (token: string) => {
  if (token) {
    BaseRequest.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete BaseRequest.defaults.headers.common["Authorization"];
  }
};

BaseRequest.interceptors.request.use(
  async function (config) {
    try {
      const { platform, browser, environment } = getDeviceDetails();
      config.headers["X-Platform"] = platform;
      config.headers["X-Browser"] = browser;
      config.headers["X-Environment"] = environment;

      const token = useAuthStore.getState().token;
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error),
);

let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token!);
  });
  failedQueue = [];
};

BaseRequest.interceptors.response.use(
  (response) => response?.data,
  async (error) => {
    const originalRequest = error.config;

    // ── 401: attempt refresh before logging out ──
    if (error?.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Another refresh is in flight — queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (newToken: string) => {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(BaseRequest(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const currentToken = useAuthStore.getState().token;
        const res: any = await axios.post(
          `${baseURL}/api/v1/auth/refresh`,
          { token: currentToken },
          { headers: { "Content-Type": "application/json" } },
        );
        const newToken = res?.data?.token;
        if (newToken) {
          BaseRequest.setToken(newToken);
          useAuthStore.setState({ token: newToken });
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return BaseRequest(originalRequest);
        }
        throw new Error("No token in refresh response");
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        BaseRequest.setToken("");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.code === "ECONNABORTED" || error?.message?.includes("timeout"))
      return Promise.reject(
        "Server is waking up, please try again in a moment...",
      );
    if (error?.message === "Network Error")
      return Promise.reject(
        "Server network down time. Please check your internet connection/BASE_URL.",
      );
    return Promise.reject(error?.response?.data || error?.message);
  },
);

export default BaseRequest;

export const parseNetworkError = (error: any, processLogout = false) => {
  // Handle timeout / cold-start errors first
  if (
    error?.code === "ECONNABORTED" ||
    (typeof error === "string" && error.includes("waking up")) ||
    (typeof error === "string" && error.includes("timeout"))
  ) {
    return ["Server is waking up, please try again in a moment...", {}, false];
  }

  let message: string = "Something went wrong";
  let _logOutUser = false;

  if (typeof error === "string") {
    message = error;
  } else if (error && typeof error === "object") {
    // FastAPI: { detail: "..." } or { detail: [{msg: "..."}] }
    if (typeof error.detail === "string") {
      message = error.detail;
    } else if (Array.isArray(error.detail)) {
      message = error.detail.map((d: any) => d?.msg || String(d)).join(", ");
    } else if (typeof error.message === "string") {
      message = error.message;
    } else if (Array.isArray(error.message)) {
      message = error.message.join(", ");
    } else {
      try {
        message = JSON.stringify(error);
      } catch {
        /* keep default */
      }
    }

    if (error.status === 500)
      message = "Server could not process your request, please try again";
    if (
      error.status === 401 ||
      (typeof error.message === "string" &&
        error.message.includes("Unauthenticated"))
    ) {
      _logOutUser = true;
    }
  }

  if (processLogout && _logOutUser) {
    const logout = useAuthStore.getState().logout;
    logout();
  }
  return [message, {}, _logOutUser];
};

export const catchError = (error: any, processLogout = true) => {
  const [message] = parseNetworkError(error, processLogout);
  console.error("[API Error]", message);
};
