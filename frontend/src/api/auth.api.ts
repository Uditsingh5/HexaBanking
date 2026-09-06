import { apiClient } from "@/api/client";
import type { AuthResponse, LogoutResponse } from "@/types";

export const authApi = {
  me() {
    return apiClient.get<AuthResponse>("/api/auth/me");
  },

  register(payload: { name: string; email: string; password: string }) {
    return apiClient.post<AuthResponse>("/api/auth/register", payload);
  },

  login(payload: { email: string; password: string }) {
    return apiClient.post<AuthResponse>("/api/auth/login", payload);
  },

  logout() {
    return apiClient.post<LogoutResponse>("/api/auth/logout");
  },
};
