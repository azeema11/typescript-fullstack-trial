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

export const COUNTRY_CODES = Object.keys(COUNTRIES) as [string, ...string[]];
export const CURRENCIES = Object.values(COUNTRIES).map((c) => c.currency);
