import { apiClient } from "@/api/client";
import type {
  AccountDetailResponse,
  AccountListResponse,
  AccountLookupResponse,
  Currency,
} from "@/types";

export const accountApi = {
  list() {
    return apiClient.get<AccountListResponse>("/api/account");
  },

  get(accountId: string) {
    return apiClient.get<AccountDetailResponse>(`/api/account/${accountId}`);
  },

  lookup(accountId: string) {
    return apiClient.get<AccountLookupResponse>(`/api/account/lookup/${accountId}`);
  },

  create(currency: Currency) {
    return apiClient.post<AccountDetailResponse>("/api/account", { currency });
  },
};
