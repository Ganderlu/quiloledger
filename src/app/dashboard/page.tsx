"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { CoinLogo } from "../_components/CoinLogo";
import {
  DesktopWalletNav,
  MobileWalletNav,
} from "../_components/WalletNavigation";
import { MobileSettingsSheet } from "../_components/SettingsPanel";
import { BuyCryptoModal } from "../_components/BuyCryptoModal";
import {
  WalletConnectModal,
  type WalletConnection,
} from "../_components/WalletConnectModal";
import {
  formatMarketPrice,
  type MarketCoin,
  type MarketCurrency,
  type MarketResponse,
} from "@/lib/market";
import {
  getStoredBoolean,
  getStoredCurrency,
  setWalletPreference,
  walletPreferenceKeys,
  walletPreferencesChangedEvent,
  type WalletCurrency,
} from "@/lib/wallet-preferences";

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: string;
  className?: string;
}) {
  const props = {
    "aria-hidden": true as const,
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "settings":
      return (
        <svg {...props}>
          <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
          <path d="m19.4 15 .1.1a1.8 1.8 0 0 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3 .9v.2a1.8 1.8 0 0 1-3.6 0v-.2a1.8 1.8 0 0 0-3-.9l-.1.1a1.8 1.8 0 0 1-2.5-2.5l.1-.1a1.8 1.8 0 0 0-.9-3h-.2a1.8 1.8 0 0 1 0-3.6h.2a1.8 1.8 0 0 0 .9-3l-.1-.1a1.8 1.8 0 0 1 2.5-2.5l.1.1a1.8 1.8 0 0 0 3-.9v-.2a1.8 1.8 0 0 1 3.6 0v.2a1.8 1.8 0 0 0 3 .9l.1-.1a1.8 1.8 0 0 1 2.5 2.5l-.1.1a1.8 1.8 0 0 0 .9 3h.2a1.8 1.8 0 0 1 0 3.6h-.2a1.8 1.8 0 0 0-.9 3Z" />
        </svg>
      );
    case "bell":
      return (
        <svg {...props}>
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      );
    case "wallet":
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="15" rx="2" />
          <path d="M3 9h18M16 14h.01M6 5V3h12v2" />
        </svg>
      );
    case "search":
      return (
        <svg {...props}>
          <circle cx="10.8" cy="10.8" r="6.8" />
          <path d="m16 16 4.5 4.5" />
        </svg>
      );
    case "eye":
      return (
        <svg {...props}>
          <path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    case "refresh":
      return (
        <svg {...props}>
          <path d="M20 7v5h-5M4.6 9a7.5 7.5 0 0 1 12.7-3L20 9M4 17v-5h5m10.4 3a7.5 7.5 0 0 1-12.7 3L4 15" />
        </svg>
      );
    case "send":
      return (
        <svg {...props}>
          <path d="m21 3-7.2 18-3.4-7.4L3 10.2 21 3Z" />
          <path d="M10.4 13.6 15 9" />
        </svg>
      );
    case "receive":
      return (
        <svg {...props}>
          <path d="M12 3v12m0 0 5-5m-5 5-5-5M4 17v3h16v-3" />
        </svg>
      );
    case "home":
      return (
        <svg {...props}>
          <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V10Z" />
        </svg>
      );
    case "swap":
      return (
        <svg {...props}>
          <path d="M4 7h14m0 0-3-3m3 3-3 3M20 17H6m0 0 3-3m-3 3 3 3" />
        </svg>
      );
    case "card":
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18m-14 5h4" />
        </svg>
      );
    case "chat":
      return (
        <svg {...props}>
          <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.8 8.8 0 0 1-3.5-.7L4 20l1.3-3.6A7.2 7.2 0 0 1 4 12c0-4.2 3.6-7.5 8-7.5s8 3.1 8 7Z" />
          <path d="M8 12h.01M12 12h.01M16 12h.01" />
        </svg>
      );
    default:
      return null;
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [search, setSearch] = useState("");
  const [coins, setCoins] = useState<MarketCoin[]>([]);
  const [marketLoading, setMarketLoading] = useState(true);
  const [marketError, setMarketError] = useState("");
  const [marketUpdatedAt, setMarketUpdatedAt] = useState("");
  const [marketRefresh, setMarketRefresh] = useState(0);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [notice, setNotice] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [walletConnectOpen, setWalletConnectOpen] = useState(false);
  const [buyCryptoOpen, setBuyCryptoOpen] = useState(false);
  const [walletConnection, setWalletConnection] =
    useState<WalletConnection | null>(null);
  const [currency, setCurrency] = useState<WalletCurrency>("NGN");
  const closeSettings = useCallback(() => setSettingsOpen(false), []);
  const closeWalletConnect = useCallback(() => setWalletConnectOpen(false), []);
  const closeBuyCrypto = useCallback(() => setBuyCryptoOpen(false), []);
  const handleWalletConnectionChange = useCallback(
    (connection: WalletConnection | null) => setWalletConnection(connection),
    [],
  );

  function showNotice(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
        return;
      }
      setUser(currentUser);
      setChecking(false);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const syncPreferences = () => {
      setBalanceVisible(!getStoredBoolean(walletPreferenceKeys.hideBalance));
      setCurrency(getStoredCurrency());
    };
    syncPreferences();
    window.addEventListener(walletPreferencesChangedEvent, syncPreferences);
    window.addEventListener("storage", syncPreferences);
    return () => {
      window.removeEventListener(
        walletPreferencesChangedEvent,
        syncPreferences,
      );
      window.removeEventListener("storage", syncPreferences);
    };
  }, []);

  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(
        localStorage.getItem("qlx-wallet-connection") ?? "null",
      );
      if (
        typeof stored === "object" &&
        stored !== null &&
        "address" in stored &&
        typeof stored.address === "string" &&
        "chainId" in stored &&
        typeof stored.chainId === "string" &&
        "chainName" in stored &&
        typeof stored.chainName === "string" &&
        "nativeSymbol" in stored &&
        typeof stored.nativeSymbol === "string" &&
        "nativeBalance" in stored &&
        typeof stored.nativeBalance === "string" &&
        "walletName" in stored &&
        typeof stored.walletName === "string"
      ) {
        setWalletConnection(stored as WalletConnection);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(
      async () => {
        setMarketLoading(true);
        setMarketError("");
        try {
          const params = new URLSearchParams({
            currency: currency.toLowerCase(),
          });
          if (search.trim()) params.set("query", search.trim());

          const response = await fetch(`/api/market?${params.toString()}`, {
            signal: controller.signal,
          });
          const payload = (await response.json()) as
            | MarketResponse
            | { error?: string };
          if (!response.ok || !("coins" in payload)) {
            throw new Error(
              "error" in payload
                ? payload.error
                : "Live market data is temporarily unavailable.",
            );
          }

          setCoins(payload.coins);
          setMarketUpdatedAt(payload.updatedAt);
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
          setMarketError(
            error instanceof Error
              ? error.message
              : "Live market data is temporarily unavailable.",
          );
        } finally {
          if (!controller.signal.aborted) {
            setMarketLoading(false);
            setRefreshing(false);
          }
        }
      },
      search.trim() ? 350 : 0,
    );

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [currency, marketRefresh, search]);

  function openSettings() {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setSettingsOpen(true);
      return;
    }
    router.push("/settings");
  }

  function toggleBalanceVisibility() {
    const shouldHide = balanceVisible;
    setBalanceVisible(!balanceVisible);
    setWalletPreference(walletPreferenceKeys.hideBalance, String(shouldHide));
  }

  async function handleSignOut() {
    await signOut(auth);
    router.replace("/login");
  }

  function refreshMarket() {
    setRefreshing(true);
    setMarketRefresh((value) => value + 1);
  }

  if (checking) {
    return (
      <div className="grid min-h-[70vh] flex-1 place-items-center bg-[#f7f8fa] px-4">
        <p className="text-sm text-zinc-500">Loading your wallet…</p>
      </div>
    );
  }

  return (
    <div className="qlx-wallet-app min-h-screen flex-1 bg-[#f7f8fa] text-[#25282d] dark:bg-[#101619] dark:text-[#e9eef0]">
      <div className="h-1 w-full bg-[#27c84a]" />
      <header className="sticky top-0 z-30 border-b border-[#eceef1] bg-white/95 backdrop-blur dark:border-[#293238] dark:bg-[#171e23]/95">
        <div className="mx-auto flex h-[58px] max-w-[1440px] items-center justify-between px-3 sm:px-6 lg:px-10">
          <div className="flex items-center gap-1.5 sm:gap-4">
            <button
              type="button"
              aria-label="Settings"
              onClick={openSettings}
              className="grid h-8 w-7 place-items-center text-[#555c64] transition active:scale-95 sm:h-9 sm:w-8"
            >
              <Icon name="settings" className="h-[18px] w-[18px]" />
            </button>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-[16px] font-bold tracking-tight text-[#111820] sm:gap-2 sm:text-[20px]"
            >
              <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#071720] text-white sm:h-7 sm:w-7">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4 sm:h-[18px] sm:w-[18px]"
                  fill="none"
                >
                  <path
                    d="M12 2 21 7v10l-9 5-9-5V7l9-5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M8 12h8M12 8v8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              QuiloxLedger
            </Link>
          </div>
          <DesktopWalletNav active="Home" />
          <div className="flex items-center gap-1 sm:gap-3">
            <div className="relative">
              <button
                type="button"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen((open) => !open)}
                className="grid h-8 w-7 place-items-center text-[#555c64] transition active:scale-95 sm:h-9 sm:w-8"
              >
                <Icon name="bell" className="h-[18px] w-[18px]" />
              </button>
              {notificationsOpen ? (
                <div className="absolute right-0 top-11 z-50 w-64 rounded-2xl border border-[#e8eaee] bg-white p-4 shadow-xl">
                  <p className="text-sm font-semibold">You’re all caught up</p>
                  <p className="mt-1 text-xs leading-5 text-[#737a83]">
                    Important wallet updates will appear here.
                  </p>
                </div>
              ) : null}
            </div>
            <div className="relative">
              <button
                type="button"
                aria-label="Wallet account"
                aria-expanded={accountOpen}
                onClick={() => setAccountOpen((open) => !open)}
                className="grid h-8 w-7 place-items-center text-[#555c64] transition active:scale-95 sm:h-9 sm:w-8"
              >
                <Icon name="wallet" className="h-[18px] w-[18px]" />
              </button>
              {accountOpen ? (
                <div className="absolute right-0 top-11 z-50 w-64 rounded-2xl border border-[#e8eaee] bg-white p-4 shadow-xl">
                  <p className="truncate text-sm font-semibold">
                    {user?.displayName || "Your account"}
                  </p>
                  <p className="mt-1 truncate text-xs text-[#737a83]">
                    {user?.email}
                  </p>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="mt-4 h-9 w-full rounded-lg border border-[#e8eaee] text-xs font-semibold text-[#4b5158] hover:bg-[#f7f8fa]"
                  >
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="ml-2 hidden h-9 items-center rounded-full border border-[#e3e6e9] px-4 text-xs font-semibold text-[#434a52] transition hover:bg-[#f4f5f6] sm:inline-flex"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1440px] px-4 pb-28 pt-3 sm:px-6 sm:pb-12 sm:pt-7 lg:px-10">
        <div className="mb-6 hidden items-end justify-between sm:flex">
          <div>
            <p className="text-sm font-medium text-[#777e87]">
              Good to see you,
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#20252b]">
              {user?.displayName || user?.email?.split("@")[0] || "Welcome"}
            </h1>
          </div>
          <p className="text-xs text-[#9298a0]">
            Your personal wallet overview
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
          <section className="min-w-0">
            <div className="relative overflow-hidden rounded-[10px] bg-[#075b9d] px-4 py-3.5 text-white shadow-[0_8px_22px_rgba(5,75,130,0.12)] sm:rounded-2xl sm:px-7 sm:py-6">
              <div className="pointer-events-none absolute -right-8 -top-20 h-52 w-52 rounded-full border border-white/10" />
              <div className="pointer-events-none absolute -right-2 -top-12 h-40 w-40 rounded-full border border-white/10" />
              <div className="relative flex items-start justify-between">
                <div>
                  <div className="text-[12px] font-semibold tracking-wide text-white/80 sm:text-sm">
                    Total Value
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-[26px] font-medium leading-none tracking-tight sm:mt-2 sm:text-4xl">
                    <span className="text-[21px] sm:text-3xl">
                      {currency === "USD"
                        ? "$"
                        : currency === "EUR"
                          ? "€"
                          : "₦"}
                    </span>
                    <span>{balanceVisible ? "0.00" : "••••••"}</span>
                    <button
                      type="button"
                      aria-label={
                        balanceVisible ? "Hide balance" : "Show balance"
                      }
                      onClick={toggleBalanceVisibility}
                      className="grid h-8 w-8 place-items-center rounded-full text-white/90 transition hover:bg-white/10 active:scale-95"
                    >
                      <Icon name="eye" className="h-[17px] w-[17px]" />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Refresh market preview"
                  onClick={refreshMarket}
                  className="grid h-8 w-8 place-items-center rounded-full text-white/90 transition hover:bg-white/10 active:scale-95"
                >
                  <Icon
                    name="refresh"
                    className={`h-[17px] w-[17px] ${refreshing ? "animate-spin" : ""}`}
                  />
                </button>
              </div>
              <div className="relative mt-4 hidden items-center gap-2 text-xs text-white/70 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-[#47df83]" />
                Wallet balance<span className="ml-auto">{currency}</span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:mt-5 sm:gap-4">
              <button
                type="button"
                onClick={() => setWalletConnectOpen(true)}
                className="group min-h-[130px] rounded-[10px] bg-[#f0f0f0] px-3.5 py-3 text-left transition hover:bg-[#e9edf2] active:scale-[0.99] sm:min-h-[170px] sm:rounded-2xl sm:px-6 sm:py-5"
              >
                <span className="mx-auto mb-2 grid h-8 w-10 place-items-center text-[#2895f5] sm:mb-3 sm:h-10 sm:w-12">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 48 40"
                    className="h-full w-full"
                    fill="none"
                  >
                    <path
                      d="M8 16c4-7 10-11 17-11s13 4 17 11l-6 5c-3-5-7-8-11-8s-8 3-11 8l-6-5Z"
                      fill="currentColor"
                    />
                    <path
                      d="M4 24c5 8 12 12 21 12s16-4 21-12l-6-5c-4 5-9 8-15 8s-11-3-15-8l-6 5Z"
                      fill="currentColor"
                      opacity=".68"
                    />
                  </svg>
                </span>
                <span className="block text-[11px] font-medium leading-4 text-[#30353b] sm:text-base sm:leading-5">
                  {walletConnection
                    ? `${walletConnection.walletName} connected`
                    : "Connect Wallet"}
                </span>
                <span className="mt-1 block text-[10px] leading-[1.35] text-[#737980] sm:text-sm sm:leading-5">
                  {walletConnection
                    ? `${walletConnection.address.slice(0, 6)}…${walletConnection.address.slice(-4)} · ${walletConnection.chainName}`
                    : "Connect MetaMask, Trust Wallet, Coinbase Wallet and other installed wallets."}
                </span>
                <span className="mt-1.5 block text-[11px] font-medium text-[#0877d1] sm:mt-2 sm:text-sm">
                  {walletConnection ? "Manage Wallet →" : "Connect Now →"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setBuyCryptoOpen(true)}
                className="group min-h-[130px] rounded-[10px] bg-[#f0f0f0] px-3.5 py-3 text-left transition hover:bg-[#e9edf2] active:scale-[0.99] sm:min-h-[170px] sm:rounded-2xl sm:px-6 sm:py-5"
              >
                <span className="mx-auto mb-2 grid h-8 w-10 place-items-center text-[#075b9d] sm:mb-3 sm:h-10 sm:w-12">
                  <Icon name="card" className="h-7 w-7 sm:h-8 sm:w-8" />
                </span>
                <span className="block text-[11px] font-medium leading-4 text-[#30353b] sm:text-base sm:leading-5">
                  Buy Crypto
                </span>
                <span className="mt-1 block text-[10px] leading-[1.35] text-[#737980] sm:text-sm sm:leading-5">
                  Get a live quote and continue through MoonPay checkout.
                </span>
                <span className="mt-1.5 block text-[11px] font-medium text-[#0877d1] sm:mt-2 sm:text-sm">
                  Buy Now →
                </span>
              </button>
            </div>
          </section>

          <aside className="hidden rounded-2xl border border-[#eceef1] bg-white p-6 lg:block dark:border-[#293238] dark:bg-[#171e23]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-[#343a40]">
                  Your account
                </p>
                <p className="mt-1 text-xs text-[#8a9098]">
                  Signed in securely
                </p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#e8f4ed] text-sm font-bold text-[#239451]">
                {(user?.displayName || user?.email || "Q")
                  .slice(0, 1)
                  .toUpperCase()}
              </span>
            </div>
            <div className="mt-5 border-t border-[#eff0f2] pt-4">
              <p className="text-[11px] uppercase tracking-[.12em] text-[#9298a0]">
                Email address
              </p>
              <p className="mt-1 break-all text-sm font-medium text-[#3a4047]">
                {user?.email}
              </p>
            </div>
            <div className="mt-5 rounded-xl bg-[#f6f8fa] p-4 dark:bg-[#202930]">
              <p className="text-sm font-semibold text-[#333a42]">
                Getting started
              </p>
              <p className="mt-1.5 text-xs leading-5 text-[#79818a]">
                Your account is ready. Wallet and purchase integrations can be
                connected as they become available.
              </p>
            </div>
            <Link
              href="/card"
              className="group mt-4 flex items-center gap-3 rounded-xl bg-[#0c2932] p-3.5 text-white transition hover:bg-[#123a45] active:scale-[.99]"
            >
              <span className="grid h-10 w-14 shrink-0 place-items-center rounded-md border border-white/15 bg-gradient-to-br from-[#1c4c53] to-[#102c34]">
                <Icon name="card" className="h-5 w-5 text-white/85" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold">Quilox card</span>
                <span className="mt-1 block text-[10px] text-white/60">
                  Preview and manage card settings
                </span>
              </span>
              <span className="text-sm text-white/70 transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl border border-[#e4e7eb] text-sm font-semibold text-[#505760] transition hover:bg-[#f6f7f8] active:scale-[.99]"
            >
              Sign out of QuiloxLedger
            </button>
          </aside>
        </div>

        <section className="mt-4 overflow-hidden rounded-t-[18px] bg-white sm:mt-6 sm:rounded-2xl sm:border sm:border-[#eceef1] sm:shadow-[0_8px_26px_rgba(25,36,50,0.035)] dark:bg-[#171e23] dark:sm:border-[#293238]">
          <div className="flex justify-center pt-2 sm:hidden">
            <span className="h-[3px] w-9 rounded-full bg-[#6a6d70]" />
          </div>
          <div className="px-0 pb-1 pt-2 sm:flex sm:items-center sm:justify-between sm:px-5 sm:pb-4 sm:pt-5">
            <div className="hidden sm:block">
              <h2 className="text-base font-bold text-[#30363d]">Market</h2>
              <p className="mt-1 text-xs text-[#9197a0]">
                Top 50 cryptocurrencies by market capitalization
              </p>
            </div>
            <label className="mt-1 flex h-[34px] items-center gap-2.5 rounded-full border border-[#e8e9eb] bg-[#f7f7f7] px-3.5 sm:mt-0 sm:h-10 sm:w-[320px] sm:bg-white">
              <Icon
                name="search"
                className="h-[17px] w-[17px] text-[#7c828a]"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search any cryptocurrency"
                aria-label="Search any cryptocurrency"
                className="h-full min-w-0 flex-1 bg-transparent text-xs text-[#333a41] outline-none placeholder:text-[#7a7e83] sm:text-sm"
              />
            </label>
          </div>
          <div className="flex items-center justify-between border-t border-[#f0f1f3] px-4 py-2.5 text-[10px] text-[#89919a] sm:px-5">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#20a95a]" />
              Live market data · {coins.length}{" "}
              {coins.length === 1 ? "asset" : "assets"}
            </span>
            <span>
              {marketUpdatedAt
                ? `Updated ${new Date(marketUpdatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
                : "Prices may be delayed"}
            </span>
          </div>
          <div className="hidden grid-cols-[minmax(240px,1fr)_160px_130px] border-y border-[#f0f1f3] px-5 py-3 text-[10px] font-semibold uppercase tracking-[.12em] text-[#9aa0a8] md:grid">
            <span>Asset</span>
            <span className="text-right">Price</span>
            <span className="text-right">24h change</span>
          </div>
          <div className="divide-y divide-[#f1f2f3]">
            {coins.map((coin) => {
              const change = coin.price_change_percentage_24h;
              const positive = (change ?? 0) >= 0;
              const coinCurrency = currency.toLowerCase() as MarketCurrency;
              return (
                <Link
                  key={coin.id}
                  href={`/coin/${encodeURIComponent(coin.id)}`}
                  aria-label={`${coin.name} price details`}
                  className="grid min-h-[66px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5 transition-colors hover:bg-[#fafcfd] active:bg-[#f2f6f8] sm:px-5 md:grid-cols-[minmax(240px,1fr)_160px_130px] md:py-3.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <CoinLogo
                      src={coin.image}
                      name={coin.name}
                      symbol={coin.symbol}
                      size={38}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold leading-5 text-[#3d4146] sm:text-sm">
                        {coin.name}
                      </p>
                      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-[#94999f] sm:text-[11px]">
                        {coin.symbol}
                        {coin.market_cap_rank
                          ? ` · Rank #${coin.market_cap_rank}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right md:hidden">
                    <p className="text-[12px] font-semibold leading-5 tabular-nums text-[#40454a]">
                      {formatMarketPrice(coin.current_price, coinCurrency)}
                    </p>
                    <p
                      className={`mt-0.5 text-[10px] font-semibold tabular-nums ${
                        positive ? "text-[#20a95a]" : "text-[#e35a60]"
                      }`}
                    >
                      {change == null
                        ? "Change unavailable"
                        : `${positive ? "+" : ""}${change.toFixed(2)}%`}
                    </p>
                  </div>
                  <p className="hidden text-right text-sm font-medium tabular-nums text-[#454b52] md:block">
                    {formatMarketPrice(coin.current_price, coinCurrency)}
                  </p>
                  <p
                    className={`hidden text-right text-sm font-medium tabular-nums md:block ${positive ? "text-[#20a95a]" : "text-[#e35a60]"}`}
                  >
                    {change == null
                      ? "—"
                      : `${positive ? "+" : ""}${change.toFixed(2)}%`}
                  </p>
                </Link>
              );
            })}
            {marketLoading && coins.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-[#7c838b] sm:px-5">
                Loading live cryptocurrency prices…
              </div>
            ) : null}
            {marketError ? (
              <div
                role="alert"
                className="mx-3 my-3 rounded-xl border border-[#f0d8cf] bg-[#fff8f5] px-4 py-3 text-xs leading-5 text-[#955340] sm:mx-5"
              >
                <p>{marketError}</p>
                <button
                  type="button"
                  onClick={refreshMarket}
                  className="mt-1 font-semibold underline underline-offset-2"
                >
                  Try again
                </button>
              </div>
            ) : null}
            {!marketLoading && !marketError && coins.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-[#7c838b] sm:px-5">
                No listed cryptocurrency matches “{search}”. Try its full name
                or ticker symbol.
              </p>
            ) : null}
          </div>
          <div className="hidden border-t border-[#f0f1f3] px-5 py-3 text-[11px] text-[#979da5] sm:block">
            Market prices are provided by CoinGecko and may be delayed. They are
            informational only; your wallet holdings are shown separately.
          </div>
        </section>
      </main>

      <button
        type="button"
        aria-label="Contact support"
        onClick={() => showNotice("Support chat is coming soon.")}
        className="fixed right-3 z-40 grid h-12 w-12 place-items-center rounded-full bg-[#050607] text-white shadow-lg transition hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
        style={{ bottom: "calc(78px + env(safe-area-inset-bottom))" }}
      >
        <Icon name="chat" className="h-6 w-6" />
      </button>
      {notice ? (
        <div
          role="status"
          className="fixed left-1/2 top-[68px] z-50 -translate-x-1/2 rounded-full bg-[#20252b] px-4 py-2.5 text-xs font-medium text-white shadow-lg sm:top-auto sm:bottom-20"
        >
          {notice}
        </div>
      ) : null}

      {settingsOpen && user ? (
        <MobileSettingsSheet
          user={user}
          mode="sheet"
          onClose={closeSettings}
          onSignOut={handleSignOut}
          onHideBalanceChange={(hide) => setBalanceVisible(!hide)}
        />
      ) : null}

      <WalletConnectModal
        open={walletConnectOpen}
        onClose={closeWalletConnect}
        connection={walletConnection}
        onConnectionChange={handleWalletConnectionChange}
      />
      <BuyCryptoModal
        open={buyCryptoOpen}
        onClose={closeBuyCrypto}
        currency={currency}
        coins={coins}
        walletConnection={walletConnection}
        onPurchaseCompleted={() =>
          showNotice(
            "MoonPay reports the purchase completed. Verify the deposit in your wallet; balance sync is not connected yet.",
          )
        }
      />

      <MobileWalletNav active="Home" />
    </div>
  );
}
