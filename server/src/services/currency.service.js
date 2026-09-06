// Standard exchange rates relative to USD (1 USD = X):
const RATES_TO_USD = {
  USD: 1.0,
  INR: 86.5,
  EUR: 0.92,
};

/**
 * Calculates exchange rate from one currency to another.
 * 1 fromCurrency = (rate) toCurrency
 */
function getExchangeRate(fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return 1.0;
  const fromRate = RATES_TO_USD[fromCurrency];
  const toRate = RATES_TO_USD[toCurrency];
  if (!fromRate || !toRate) return 1.0;

  // 1 unit of fromCurrency in USD is (1 / fromRate)
  // In toCurrency: (1 / fromRate) * toRate = toRate / fromRate
  const rate = toRate / fromRate;
  return Number(rate.toFixed(4));
}

/**
 * Converts an amount from one currency to another.
 * Returns { rate, convertedAmount }
 */
function convertAmount(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) {
    return {
      rate: 1.0,
      convertedAmount: Number(amount),
    };
  }

  const rate = getExchangeRate(fromCurrency, toCurrency);
  const convertedAmount = Number((amount * rate).toFixed(2));

  return {
    rate,
    convertedAmount,
  };
}

module.exports = {
  RATES_TO_USD,
  getExchangeRate,
  convertAmount,
};
