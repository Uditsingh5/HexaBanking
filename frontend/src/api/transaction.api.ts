import { apiClient, transferClient } from "@/api/client";
import type { TransferResponse } from "@/types";

export interface CreateTransferPayload {
  fromAccount: string;
  toAccount: string;
  amount: number;
  idempotencyKey: string;
}

export interface TransactionListResponse {
  count: number;
  transactions: import("@/types").Transaction[];
}

export interface AdminFundPayload {
  toAccount: string;
  amount: number;
  note?: string;
}

export interface AdminFundResponse {
  message: string;
  newBalance: number;
  transaction: import("@/types").Transaction;
}

export const transactionApi = {
  list() {
    return apiClient.get<TransactionListResponse>("/api/transactions");
  },

  create(payload: CreateTransferPayload) {
    return transferClient.post<TransferResponse>("/api/transactions/", payload);
  },

  adminFund(payload: AdminFundPayload) {
    return apiClient.post<AdminFundResponse>("/api/transactions/admin/fund", payload);
  },
};

