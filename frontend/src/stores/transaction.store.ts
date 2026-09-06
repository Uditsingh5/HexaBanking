import { create } from "zustand";
import { transactionApi } from "@/api/transaction.api";
import { createIdempotencyKey } from "@/utils/format";
import { getErrorMessage } from "@/lib/errors";
import type {
  Currency,
  Transaction,
  TransferResponse,
  TransferUiStatus,
} from "@/types";

export interface TransferDraft {
  fromAccount: string;
  toAccount: string;
  amount: string;
  fromCurrency: Currency | null;
  toCurrency: Currency | null;
}

interface TransactionState {
  draft: TransferDraft;
  idempotencyKey: string;
  currentTransfer: TransferResponse | null;
  lastTransaction: Transaction | null;
  transactions: Transaction[];
  transferStatus: TransferUiStatus;
  isSubmitting: boolean;
  isLoadingHistory: boolean;
  historyError: string | null;
  error: string | null;
  setDraft: (patch: Partial<TransferDraft>) => void;
  startNewAttempt: () => void;
  submitTransfer: () => Promise<TransferResponse>;
  fetchTransactions: () => Promise<void>;
  resetTransfer: () => void;
}

const emptyDraft: TransferDraft = {
  fromAccount: "",
  toAccount: "",
  amount: "",
  fromCurrency: null,
  toCurrency: null,
};

export const useTransactionStore = create<TransactionState>((set, get) => ({
  draft: emptyDraft,
  idempotencyKey: createIdempotencyKey(),
  currentTransfer: null,
  lastTransaction: null,
  transactions: [],
  transferStatus: "idle",
  isSubmitting: false,
  isLoadingHistory: false,
  historyError: null,
  error: null,

  setDraft(patch) {
    set((state) => ({
      draft: { ...state.draft, ...patch },
    }));
  },

  startNewAttempt() {
    set({
      draft: emptyDraft,
      idempotencyKey: createIdempotencyKey(),
      currentTransfer: null,
      transferStatus: "idle",
      isSubmitting: false,
      error: null,
    });
  },

  async submitTransfer() {
    const { draft, idempotencyKey, isSubmitting } = get();
    if (isSubmitting) {
      throw new Error("A transfer is already in progress.");
    }

    const amount = Number(draft.amount);
    set({
      isSubmitting: true,
      transferStatus: "processing",
      error: null,
      currentTransfer: null,
    });

    try {
      const { data, status } = await transactionApi.create({
        fromAccount: draft.fromAccount,
        toAccount: draft.toAccount,
        amount,
        idempotencyKey,
      });

      const transaction = data.transaction ?? null;
      const serverStatus = data.transactionStatus ?? transaction?.status;

      let transferStatus: TransferUiStatus = "completed";
      if (status === 200 && data.message === "Transaction is still processing") {
        transferStatus = "pending";
      } else if (serverStatus === "pending") {
        transferStatus = "pending";
      } else if (serverStatus === "failed") {
        transferStatus = "failed";
      } else if (serverStatus === "reversed") {
        transferStatus = "reversed";
      } else if (serverStatus === "completed") {
        transferStatus = "completed";
      }

      set({
        currentTransfer: data,
        lastTransaction: transaction,
        transferStatus,
        isSubmitting: false,
        error: null,
      });

      // Auto-refresh transaction history after transfer
      void get().fetchTransactions();

      return data;

    } catch (error) {
      const message = getErrorMessage(
        error,
        "The transfer could not be completed.",
      );
      set({
        isSubmitting: false,
        transferStatus: "failed",
        error: message,
      });
      throw error;
    }
  },

  async fetchTransactions() {
    set({ isLoadingHistory: true, historyError: null });
    try {
      const { data } = await transactionApi.list();
      set({ transactions: data.transactions, isLoadingHistory: false });
    } catch (error) {
      set({
        isLoadingHistory: false,
        historyError: getErrorMessage(error, "Unable to load transaction history."),
      });
    }
  },


  resetTransfer() {
    set({
      transferStatus: "idle",
      isSubmitting: false,
      error: null,
      currentTransfer: null,
    });
  },
}));
