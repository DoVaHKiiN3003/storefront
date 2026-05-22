"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

// ── Types ─────────────────────────────────────────────────

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  rateToUsd: number;
}

interface CurrencyContextValue {
  currencies: CurrencyInfo[];
  selectedCurrency: CurrencyInfo;
  setCurrency: (code: string) => void;
  convertPrice: (usdPrice: number) => number;
  formatPrice: (usdPrice: number, options?: { noSymbol?: boolean; decimals?: number }) => string;
  isLoading: boolean;
}

// ── Constants ─────────────────────────────────────────────

const STORAGE_KEY = "storefront-currency";

const USD: CurrencyInfo = {
  code: "USD",
  symbol: "$",
  name: "US Dollar",
  rateToUsd: 1,
};

const DEFAULT_CURRENCIES: CurrencyInfo[] = [USD];

// ── Context ───────────────────────────────────────────────

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencies, setCurrencies] = useState<CurrencyInfo[]>(DEFAULT_CURRENCIES);
  const [selectedCode, setSelectedCode] = useState<string>("USD");
  const [isLoading, setIsLoading] = useState(true);

  // Load saved preference
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed === "string") {
          setSelectedCode(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch rates from API
  useEffect(() => {
    async function fetchCurrencies() {
      try {
        const res = await fetch("/api/currencies");
        if (res.ok) {
          const data = await res.json();
          const fetched: CurrencyInfo[] = [
            USD,
            ...(data.currencies ?? []).map(
              (c: { code: string; symbol: string; name: string; rateToUsd: number }) => ({
                code: c.code,
                symbol: c.symbol,
                name: c.name,
                rateToUsd: c.rateToUsd,
              })
            ),
          ];
          setCurrencies(fetched);

          // If user had a saved currency that's now available, keep it; otherwise fall back
          const stillExists = fetched.some((c) => c.code === selectedCode);
          if (!stillExists) {
            setSelectedCode("USD");
          }
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    }
    fetchCurrencies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedCurrency = useMemo(
    () => currencies.find((c) => c.code === selectedCode) ?? USD,
    [currencies, selectedCode]
  );

  const setCurrency = useCallback((code: string) => {
    setSelectedCode(code);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(code));
    } catch {
      // ignore
    }
  }, []);

  const convertPrice = useCallback(
    (usdPrice: number): number => {
      return usdPrice * selectedCurrency.rateToUsd;
    },
    [selectedCurrency.rateToUsd]
  );

  const formatPrice = useCallback(
    (usdPrice: number, options?: { noSymbol?: boolean; decimals?: number }): string => {
      const converted = convertPrice(usdPrice);
      const dec = options?.decimals ?? 2;
      const formatted = converted.toFixed(dec);

      if (options?.noSymbol) return formatted;

      if (selectedCurrency.code === "USD") {
        return `$${formatted}`;
      }

      // Most currencies use symbol prefix; EUR/GBP use prefix, JPY uses prefix with 0 decimals, etc.
      return `${selectedCurrency.symbol}${formatted}`;
    },
    [convertPrice, selectedCurrency]
  );

  return (
    <CurrencyContext.Provider
      value={{
        currencies,
        selectedCurrency,
        setCurrency,
        convertPrice,
        formatPrice,
        isLoading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }
  return ctx;
}
