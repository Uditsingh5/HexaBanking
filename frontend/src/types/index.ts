export type Currency = "INR" | "USD" | "EUR";
export type AccountStatus = "active" | "frozen" | "closed";
export type TransactionStatus = "pending" | "completed" | "failed" | "reversed";
export type LedgerEntryType = "credit" | "debit";

export interface User {
  _id: string;
  name: string;
  email: string;
  role?: "user" | "admin";
  createdAt?: string;
  updatedAt?: string;
}


export interface Account {
  _id: string;
  user: string;
  status: AccountStatus;
  currency: Currency;
  systemUser: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccountWithBalance {
  accountId: string;
  account: Account;
  balance: number;
}

export interface LedgerEntry {
  _id: string;
  account: string;
  amount: number;
  transaction: string;
  type: LedgerEntryType;
}

export interface Transaction {
  _id: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  fromCurrency?: Currency;
  toCurrency?: Currency;
  targetAmount?: number;
  exchangeRate?: number;
  type?: "transfer" | "admin_fund";
  status: TransactionStatus;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountLookupResponse {
  accountId: string;
  currency: Currency;
  status: AccountStatus;
  holderName: string;
}

export interface AuthResponse {
  token?: string;
  user: User;
}

export interface LogoutResponse {
  message: string;
}

export interface AccountListResponse {
  count: number;
  accounts: AccountWithBalance[];
}

export interface AccountDetailResponse {
  accountId: string;
  account: Account;
  balance: number;
  message?: string;
}

export interface TransferDetails {
  amount: number;
  debitedFrom: string;
  creditedTo: string;
  transactionId: string;
}

export interface TransferResponse {
  message: string;
  transactionType?: "debit" | "credit";
  transactionStatus?: TransactionStatus;
  details?: TransferDetails;
  transaction?: Transaction;
}

export interface ApiErrorBody {
  message?: string;
  status?: string;
  error?: string;
}

export type TransferUiStatus =
  | "idle"
  | "reviewing"
  | "submitting"
  | "processing"
  | "completed"
  | "pending"
  | "failed"
  | "reversed";
