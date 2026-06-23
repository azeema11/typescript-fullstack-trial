export interface CountryConfig {
  name: string;
  currency: string;
  minSalary: number;
  maxSalary: number;
}

export const COUNTRIES: Record<string, CountryConfig> = {
  US: { name: "United States", currency: "USD", minSalary: 45000, maxSalary: 250000 },
  UK: { name: "United Kingdom", currency: "GBP", minSalary: 35000, maxSalary: 180000 },
  IN: { name: "India", currency: "INR", minSalary: 300000, maxSalary: 4500000 },
  DE: { name: "Germany", currency: "EUR", minSalary: 40000, maxSalary: 150000 },
  CA: { name: "Canada", currency: "CAD", minSalary: 45000, maxSalary: 180000 },
  AU: { name: "Australia", currency: "AUD", minSalary: 50000, maxSalary: 190000 },
  JP: { name: "Japan", currency: "JPY", minSalary: 3500000, maxSalary: 15000000 },
  BR: { name: "Brazil", currency: "BRL", minSalary: 30000, maxSalary: 200000 },
  SG: { name: "Singapore", currency: "SGD", minSalary: 40000, maxSalary: 180000 },
  AE: { name: "United Arab Emirates", currency: "AED", minSalary: 60000, maxSalary: 300000 },
} as const;

export const COUNTRY_CODES = Object.keys(COUNTRIES) as [string, ...string[]];
export const CURRENCIES = Object.values(COUNTRIES).map((c) => c.currency);
