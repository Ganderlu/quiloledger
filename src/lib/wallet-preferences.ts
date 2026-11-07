export type WalletCurrency = "NGN" | "USD" | "EUR";

export const walletPreferenceKeys = {
  hideBalance: "qlx-hide-balance",
  currency: "qlx-currency",
  theme: "qlx-theme",
} as const;

export const walletPreferencesChangedEvent = "qlx-wallet-preferences-changed";

export function setDarkMode(enabled: boolean) {
  const root = document.documentElement;
  root.classList.toggle("dark", enabled);
  root.style.colorScheme = enabled ? "dark" : "light";
  document.cookie = `${walletPreferenceKeys.theme}=${enabled ? "dark" : "light"}; Path=/; Max-Age=31536000; SameSite=Lax`;

  try {
    localStorage.setItem(walletPreferenceKeys.theme, enabled ? "dark" : "light");
  } catch {}

  window.dispatchEvent(new Event(walletPreferencesChangedEvent));
}

export function getStoredBoolean(key: string, fallback = false) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value === "true";
  } catch {
    return fallback;
  }
}

export function getStoredCurrency(): WalletCurrency {
  try {
    const value = localStorage.getItem(walletPreferenceKeys.currency);
    if (value === "USD" || value === "EUR") return value;
  } catch {}
  return "NGN";
}

export function setWalletPreference(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
  window.dispatchEvent(new Event(walletPreferencesChangedEvent));
}
