export const APP_NAME = "Hexa Secure Banking";
export const APP_SHORT_NAME = "Hexa";

export const CURRENCIES = ["INR", "USD", "EUR"] as const;

export const SESSION_USER_KEY = "hexa.session.user";
export const THEME_KEY = "hexa.theme";

export const TRANSFER_REQUEST_TIMEOUT_MS = 45_000;
export const DEFAULT_REQUEST_TIMEOUT_MS = 20_000;

export const ACCOUNT_STATUS_COPY = {
  active: {
    label: "Active",
    description: "This account can send and receive transfers.",
  },
  frozen: {
    label: "Frozen",
    description: "Transfers from this account are currently unavailable.",
  },
  closed: {
    label: "Closed",
    description: "This account is closed and cannot be used for transfers.",
  },
} as const;

export const TRANSACTION_STATUS_COPY = {
  pending: {
    label: "Pending",
    description: "The transaction is still being processed.",
  },
  completed: {
    label: "Completed",
    description: "The transfer completed successfully.",
  },
  failed: {
    label: "Failed",
    description: "The transfer did not complete.",
  },
  reversed: {
    label: "Reversed",
    description: "A previously processed transaction was reversed.",
  },
} as const;
