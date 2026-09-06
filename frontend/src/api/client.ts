import axios, { AxiosError, type AxiosInstance } from "axios";
import {
  DEFAULT_REQUEST_TIMEOUT_MS,
  TRANSFER_REQUEST_TIMEOUT_MS,
} from "@/constants";
import { ApiError, messageForStatus } from "@/lib/errors";
import type { ApiErrorBody } from "@/types";

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "";

function createClient(timeout: number): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.request.use((config) => {
    try {
      const token =
        localStorage.getItem("hexa_auth_token") ||
        sessionStorage.getItem("hexa_auth_token");
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Storage access disabled / private mode
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiErrorBody>) => {
      throw normalizeError(error);
    },
  );

  return instance;
}

export const apiClient = createClient(DEFAULT_REQUEST_TIMEOUT_MS);
export const transferClient = createClient(TRANSFER_REQUEST_TIMEOUT_MS);

function normalizeError(error: AxiosError<ApiErrorBody>) {
  if (error.code === "ECONNABORTED") {
    return new ApiError(
      "The request timed out. If this was a transfer, check your accounts before sending again.",
      408,
    );
  }

  if (!error.response) {
    return new ApiError(
      "We could not reach the banking service. Check your connection and try again.",
      0,
    );
  }

  const status = error.response.status;
  const data = error.response.data;
  const serverMessage =
    typeof data?.message === "string" ? data.message : undefined;
  const details = typeof data?.error === "string" ? data.error : undefined;

  const requestUrl = String(error.config?.url ?? "");
  if (status === 401 && !requestUrl.includes("/api/auth/")) {
    window.dispatchEvent(new CustomEvent("hexa:unauthorized"));
  }

  return new ApiError(messageForStatus(status, serverMessage), status, details);
}
