export interface CountryConfig {
  name: string;
  currency: string;
}

export const COUNTRIES: Record<string, CountryConfig> = {
  US: { name: "United States", currency: "USD" },
  UK: { name: "United Kingdom", currency: "GBP" },
  IN: { name: "India", currency: "INR" },
  DE: { name: "Germany", currency: "EUR" },
  CA: { name: "Canada", currency: "CAD" },
  AU: { name: "Australia", currency: "AUD" },
  JP: { name: "Japan", currency: "JPY" },
  BR: { name: "Brazil", currency: "BRL" },
  SG: { name: "Singapore", currency: "SGD" },
  AE: { name: "United Arab Emirates", currency: "AED" },
} as const;

export const COUNTRY_CODES = Object.keys(COUNTRIES);

// Hardcoded exchange rates relative to USD (1 Unit of Currency = X USD)
export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,
  GBP: 1.25,
  EUR: 1.10,
  INR: 0.012,
  CAD: 0.73,
  AUD: 0.66,
  JPY: 0.0063,
  BRL: 0.18,
  SGD: 0.74,
  AED: 0.27,
};

export function convertToUSD(amount: number, currency: string): number {
  const rate = EXCHANGE_RATES[currency] || 1.0;
  return amount * rate;
}

export function convertFromUSD(amountInUSD: number, targetCurrency: string): number {
  const rate = EXCHANGE_RATES[targetCurrency] || 1.0;
  return amountInUSD / rate;
}

export function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) return amount;
  const amountInUSD = convertToUSD(amount, fromCurrency);
  return convertFromUSD(amountInUSD, toCurrency);
}
