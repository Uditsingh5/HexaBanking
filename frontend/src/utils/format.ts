import type { Currency } from "@/types";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function maskAccountId(id: string) {
  const tail = id.slice(-4).toUpperCase();
  return `•••• ${tail}`;
}

export function currencySymbol(currency: Currency) {
  switch (currency) {
    case "INR":
      return "₹";
    case "USD":
      return "$";
    case "EUR":
      return "€";
  }
}

export function formatMoney(amount: number, currency: Currency) {
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);

  return `${currencySymbol(currency)}${formatted}`;
}

/**
 * Formats a transaction amount with appropriate sign:
 * - Admin added money: ⊕ (XOR sign)
 * - Credit: +
 * - Debit: −
 * Always tightly coupled without spaces: ⊕₹5,000.00, +₹5,000.00, −₹5,000.00
 */
export function formatTransactionAmount(
  amount: number,
  currency: Currency,
  direction: "credit" | "debit",
  isAdminFund: boolean = false,
) {
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? Math.abs(amount) : 0);

  const symbol = currencySymbol(currency);
  // XOR sign '⊕' if money added by admin, otherwise '+' for credit and '−' for debit
  const sign = isAdminFund ? "⊕" : direction === "credit" ? "+" : "−";
  return `${sign}${symbol}${formatted}`;
}

export function formatDateTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function createIdempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function parseAmount(value: string) {
  const normalized = value.replace(/,/g, "").trim();
  if (!normalized) return Number.NaN;
  return Number(normalized);
}
