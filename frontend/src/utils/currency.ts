import type { Currency } from "@/types";

export const RATES_TO_USD: Record<Currency, number> = {
  USD: 1.0,
  INR: 86.5,
  EUR: 0.92,
};

/**
 * Calculates exchange rate from one currency to another.
 * 1 fromCurrency = (rate) toCurrency
 */
export function getExchangeRate(fromCurrency: Currency, toCurrency: Currency): number {
  if (fromCurrency === toCurrency) return 1.0;
  const fromRate = RATES_TO_USD[fromCurrency];
  const toRate = RATES_TO_USD[toCurrency];
  if (!fromRate || !toRate) return 1.0;

  const rate = toRate / fromRate;
  return Number(rate.toFixed(4));
}

/**
 * Converts an amount from one currency to another.
 */
export function convertAmount(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
): { rate: number; convertedAmount: number } {
  if (fromCurrency === toCurrency) {
    return {
      rate: 1.0,
      convertedAmount: amount,
    };
  }

  const rate = getExchangeRate(fromCurrency, toCurrency);
  const convertedAmount = Number((amount * rate).toFixed(2));

  return {
    rate,
    convertedAmount,
  };
}

/**
 * Formats exchange rate display string (e.g. "1 USD = 86.50 INR")
 */
export function formatExchangeRate(from: Currency, to: Currency): string {
  const rate = getExchangeRate(from, to);
  return `1 ${from} = ${rate.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${to}`;
}
