import axios, { AxiosInstance } from "axios";
import { Platform } from "react-native";
import { useAuthStore } from "../../store/useAuthStore";
import { baseURL } from "../../constants/config";

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

BaseRequest.interceptors.response.use(
  (response) => response?.data,
  async (error) => {
    const originalRequest = error.config;
    if (error?.response?.status === 401) {
      if (!isRefreshing) {
        originalRequest._retry = true;
        isRefreshing = true;
        try {
          // Refresh token logic can be added here
          const logout = useAuthStore.getState().logout;
          logout();
        } catch (error) {
          return Promise.reject(error);
        } finally {
          isRefreshing = false;
        }
      }
    }
    if (error?.message === "Network Error")
      return Promise.reject("Server network down time");
    return Promise.reject(error?.response?.data || error?.message);
  },
);

export default BaseRequest;

export const parseNetworkError = (error: any, processLogout = false) => {
  let message = error;
  let _logOutUser = false;
  const { status, message: msg } = error || {};

  if (status === 500)
    message = "Server could not process your request, please try again";
  if (
    status === 401 ||
    (msg && typeof msg === "string" && msg.includes("Unauthenticated"))
  ) {
    _logOutUser = true;
  }

  if (msg) message = msg;
  if (Array.isArray(msg)) message = msg.join(", ");

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
