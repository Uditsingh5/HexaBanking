import { create } from "zustand";
import { accountApi } from "@/api/account.api";
import { getErrorMessage } from "@/lib/errors";
import type { AccountWithBalance, Currency } from "@/types";

interface AccountState {
  accounts: AccountWithBalance[];
  selectedAccount: AccountWithBalance | null;
  isLoading: boolean;
  isCreating: boolean;
  hasLoaded: boolean;
  error: string | null;
  fetchAccounts: () => Promise<void>;
  fetchAccount: (accountId: string) => Promise<AccountWithBalance | null>;
  createAccount: (currency: Currency) => Promise<AccountWithBalance>;
  refreshAccounts: () => Promise<void>;
  clearAccounts: () => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  accounts: [],
  selectedAccount: null,
  isLoading: false,
  isCreating: false,
  hasLoaded: false,
  error: null,

  async fetchAccounts() {
    set({ isLoading: true, error: null });
    try {
      const { data } = await accountApi.list();
      set({
        accounts: data.accounts,
        isLoading: false,
        hasLoaded: true,
        error: null,
      });
    } catch (error) {
      set({
        isLoading: false,
        hasLoaded: true,
        error: getErrorMessage(error, "Unable to load accounts."),
      });
    }
  },

  async fetchAccount(accountId) {
    set({ isLoading: true, error: null });
    try {
      const { data } = await accountApi.get(accountId);
      const selected: AccountWithBalance = {
        accountId: data.accountId,
        account: data.account,
        balance: data.balance,
      };
      set((state) => ({
        selectedAccount: selected,
        isLoading: false,
        error: null,
        accounts: state.accounts.map((item) =>
          item.accountId === selected.accountId ? selected : item,
        ),
      }));
      return selected;
    } catch (error) {
      set({
        selectedAccount: null,
        isLoading: false,
        error: getErrorMessage(error, "Unable to load this account."),
      });
      return null;
    }
  },

  async createAccount(currency) {
    set({ isCreating: true, error: null });
    try {
      const { data } = await accountApi.create(currency);
      const created: AccountWithBalance = {
        accountId: data.accountId,
        account: data.account,
        balance: data.balance,
      };
      set((state) => ({
        accounts: [created, ...state.accounts],
        isCreating: false,
        error: null,
      }));
      return created;
    } catch (error) {
      const message = getErrorMessage(error, "Unable to create the account.");
      set({ isCreating: false, error: message });
      throw error;
    }
  },

  async refreshAccounts() {
    try {
      const { data } = await accountApi.list();
      set({ accounts: data.accounts, error: null });
    } catch (error) {
      set({
        error: getErrorMessage(error, "Unable to refresh account balances."),
      });
    }
  },

  clearAccounts() {
    set({
      accounts: [],
      selectedAccount: null,
      isLoading: false,
      isCreating: false,
      hasLoaded: false,
      error: null,
    });
  },
}));
