"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { CoinLogo } from "@/app/_components/CoinLogo";
import {
  MobileWalletNav,
  WalletPageHeader,
} from "@/app/_components/WalletNavigation";
import {
  formatMarketPrice,
  type CoinDetailResponse,
  type MarketCurrency,
} from "@/lib/market";
import {
  getStoredBoolean,
  getStoredCurrency,
  walletPreferenceKeys,
  walletPreferencesChangedEvent,
  type WalletCurrency,
} from "@/lib/wallet-preferences";

type ChartRange = "1" | "7" | "30";

function MarketIcon({
  name,
  className = "h-4 w-4",
}: {
  name: "send" | "receive" | "swap" | "buy" | "sell" | "star" | "share";
  className?: string;
}) {
  const props = {
    "aria-hidden": true as const,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  switch (name) {
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
    case "swap":
      return (
        <svg {...props}>
          <path d="M4 7h14m0 0-3-3m3 3-3 3M20 17H6m0 0 3-3m-3 3 3 3" />
        </svg>
      );
    case "buy":
      return (
        <svg {...props}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18m-13 5h3" />
        </svg>
      );
    case "sell":
      return (
        <svg {...props}>
          <path d="M12 3v13m0 0 5-5m-5 5-5-5" />
          <path d="M4 19h16" />
        </svg>
      );
    case "star":
      return (
        <svg {...props}>
          <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
        </svg>
      );
    case "share":
      return (
        <svg {...props}>
          <path d="M12 15V3m0 0L8 7m4-4 4 4" />
          <path d="M5 12v7h14v-7" />
        </svg>
      );
  }
}

function priceChartPath(points: [number, number][]) {
  if (points.length < 2) return "";
  const values = points.map((point) => point[1]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || Math.abs(max) * 0.000001 || 1;

  return points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * 100;
      const y = 90 - ((point[1] - min) / spread) * 78;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function formatBalance(currency: WalletCurrency) {
  return new Intl.NumberFormat(
    currency === "NGN" ? "en-NG" : currency === "EUR" ? "en-IE" : "en-US",
    {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    },
  ).format(0);
}

export default function CoinDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [coinData, setCoinData] = useState<CoinDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [range, setRange] = useState<ChartRange>("1");
  const [currency, setCurrency] = useState<WalletCurrency>("NGN");
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [watching, setWatching] = useState(false);
  const [notice, setNotice] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const coin = coinData?.coin;
  const marketCurrency = currency.toLowerCase() as MarketCurrency;
  const chartPath = useMemo(
    () => priceChartPath(coinData?.chart ?? []),
    [coinData?.chart],
  );
  const chartRising = (coin?.price_change_percentage_24h ?? 0) >= 0;

  const showNotice = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace("/login");
        return;
      }
      setUser(currentUser);
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const syncPreferences = () => {
      setCurrency(getStoredCurrency());
      setBalanceVisible(!getStoredBoolean(walletPreferenceKeys.hideBalance));
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
    const stored: unknown = (() => {
      try {
        return JSON.parse(localStorage.getItem("qlx-coins-watchlist") ?? "[]");
      } catch {
        return [];
      }
    })();
    if (Array.isArray(stored)) {
      setWatching(
        stored.some(
          (item) =>
            typeof item === "string" &&
            item.toLowerCase() === coin?.symbol.toLowerCase(),
        ),
      );
    }
  }, [coin?.symbol]);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    const params = new URLSearchParams({
      currency: currency.toLowerCase(),
      days: range,
    });

    async function loadCoin() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(
          `/api/market/coin/${encodeURIComponent(id)}?${params.toString()}`,
          { signal: controller.signal },
        );
        const payload = (await response.json()) as
          | CoinDetailResponse
          | { error?: string };
        if (!response.ok || !("coin" in payload)) {
          throw new Error(
            "error" in payload
              ? payload.error
              : "Live coin information is temporarily unavailable.",
          );
        }
        setCoinData(payload);
      } catch (loadError) {
        if (
          loadError instanceof DOMException &&
          loadError.name === "AbortError"
        ) {
          return;
        }
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Live coin information is temporarily unavailable.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadCoin();
    return () => controller.abort();
  }, [currency, id, range, refreshKey]);

  function toggleWatchlist() {
    if (!coin) return;
    let current: string[] = [];
    try {
      const parsed: unknown = JSON.parse(
        localStorage.getItem("qlx-coins-watchlist") ?? "[]",
      );
      if (Array.isArray(parsed)) {
        current = parsed.filter(
          (item): item is string => typeof item === "string",
        );
      }
    } catch {}

    const next = watching
      ? current.filter(
          (symbol) => symbol.toLowerCase() !== coin.symbol.toLowerCase(),
        )
      : [
          ...current.filter(
            (symbol) => symbol.toLowerCase() !== coin.symbol.toLowerCase(),
          ),
          coin.symbol,
        ];
    localStorage.setItem("qlx-coins-watchlist", JSON.stringify(next));
    setWatching(!watching);
    showNotice(
      watching ? "Removed from your watchlist." : "Added to your watchlist.",
    );
  }

  async function shareCoin() {
    if (!coin) return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      showNotice("Coin link copied.");
    } catch {
      showNotice("Use your browser menu to share this coin page.");
    }
  }

  if (checkingAuth || !user) {
    return (
      <div className="grid min-h-[70vh] flex-1 place-items-center bg-[#f7f8fa] px-4">
        <p className="text-sm text-[#7b858d]">Loading your coin details…</p>
      </div>
    );
  }

  return (
    <div className="qlx-wallet-app min-h-screen flex-1 bg-[#f7f8fa] text-[#25282d] dark:bg-[#101619] dark:text-[#e9eef0]">
      <div className="h-1 w-full bg-[#27c84a]" />
      <WalletPageHeader active="Home" />

      <main className="mx-auto w-full max-w-[1000px] px-3 pb-28 pt-4 sm:px-6 sm:pb-12 sm:pt-7">
        <Link
          href="/dashboard"
          className="mb-3 inline-flex items-center gap-2 rounded-lg py-1 text-xs font-semibold text-[#68737b] transition hover:text-[#075b9d] active:scale-[.98] sm:mb-5"
        >
          <span aria-hidden="true">←</span>
          Back to market
        </Link>

        {error && !coin ? (
          <section
            role="alert"
            className="rounded-2xl border border-[#f0d8cf] bg-white p-6 text-center shadow-sm sm:p-10"
          >
            <p className="text-base font-semibold text-[#30383f]">
              Coin details are unavailable
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7d878f]">
              {error}
            </p>
            <button
              type="button"
              onClick={() => setRefreshKey((value) => value + 1)}
              className="mt-5 rounded-xl bg-[#075b9d] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#064c82] active:scale-[.98]"
            >
              Try again
            </button>
          </section>
        ) : null}

        {coin ? (
          <>
            <section className="overflow-hidden rounded-2xl border border-[#e8ecef] bg-white shadow-[0_8px_28px_rgba(25,36,50,0.04)] dark:border-[#293238] dark:bg-[#171e23]">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-[#eff1f3] px-3 py-3.5 sm:px-6 dark:border-[#293238]">
                <span />
                <div className="text-center">
                  <h1 className="text-[15px] font-bold text-[#343a40] sm:text-lg dark:text-[#edf1f3]">
                    {coin.name}
                  </h1>
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-[#9299a0]">
                    {coin.symbol}
                    {coin.market_cap_rank
                      ? ` · Rank #${coin.market_cap_rank}`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-pressed={watching}
                    aria-label={
                      watching ? "Remove from watchlist" : "Add to watchlist"
                    }
                    onClick={toggleWatchlist}
                    className={`grid h-9 w-9 place-items-center rounded-full transition active:scale-90 ${
                      watching
                        ? "text-amber-500"
                        : "text-[#89939b] hover:bg-[#f4f6f7] hover:text-amber-500"
                    }`}
                  >
                    <MarketIcon name="star" className="h-[17px] w-[17px]" />
                  </button>
                  <button
                    type="button"
                    aria-label="Copy coin page link"
                    onClick={shareCoin}
                    className="grid h-9 w-9 place-items-center rounded-full text-[#89939b] transition hover:bg-[#f4f6f7] hover:text-[#075b9d] active:scale-90"
                  >
                    <MarketIcon name="share" className="h-[17px] w-[17px]" />
                  </button>
                  <a
                    href={`https://www.coingecko.com/en/coins/${encodeURIComponent(coin.id)}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="View verified market source"
                    title="Market source: CoinGecko"
                    className="grid h-9 w-9 place-items-center rounded-full text-[#89939b] transition hover:bg-[#f4f6f7] hover:text-[#075b9d]"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-[17px] w-[17px]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M9.6 9a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2-2.4 4m0 3h.01" />
                    </svg>
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-4 sm:px-6">
                <CoinLogo
                  src={coin.image}
                  name={coin.name}
                  symbol={coin.symbol}
                  size={46}
                />
                <div className="grid min-w-0 flex-1 grid-cols-[minmax(72px,.65fr)_minmax(0,1.35fr)] gap-x-3 gap-y-2 text-[11px] sm:text-xs">
                  <span className="font-semibold text-[#59636b] dark:text-[#cbd4d9]">
                    Coin
                  </span>
                  <span className="truncate text-right text-[#68737b] dark:text-[#c0c9ce]">
                    {coin.name}
                  </span>
                  <span className="font-semibold text-[#59636b] dark:text-[#cbd4d9]">
                    Price
                  </span>
                  <span className="text-right font-medium tabular-nums text-[#424a50] dark:text-[#e0e6e9]">
                    1 {coin.symbol.toUpperCase()} ={" "}
                    {formatMarketPrice(coin.current_price, marketCurrency)}
                  </span>
                  <span className="font-semibold text-[#59636b] dark:text-[#cbd4d9]">
                    24 hours change
                  </span>
                  <span
                    className={`text-right font-semibold tabular-nums ${
                      chartRising ? "text-[#16875a]" : "text-[#ca545b]"
                    }`}
                  >
                    {coin.price_change_percentage_24h == null
                      ? "Unavailable"
                      : `${coin.price_change_percentage_24h >= 0 ? "+" : ""}${coin.price_change_percentage_24h.toFixed(2)}%`}
                  </span>
                </div>
              </div>
            </section>

            <section className="mt-3 overflow-hidden rounded-2xl border border-[#e8ecef] bg-white shadow-[0_5px_20px_rgba(25,36,50,0.025)] dark:border-[#293238] dark:bg-[#171e23]">
              <div className="flex items-center justify-between px-4 pb-3 pt-4 sm:px-5">
                <div>
                  <h2 className="text-sm font-bold text-[#3d454c] dark:text-[#edf1f3]">
                    Your Balance
                  </h2>
                  <p className="mt-1 text-[10px] text-[#929aa1]">
                    Wallet holdings for {coin.symbol.toUpperCase()}
                  </p>
                </div>
                <span
                  title="Balances show confirmed QuiloxLedger holdings. Market prices are informational."
                  className="grid h-6 w-6 place-items-center rounded-full bg-[#f2f4f5] text-[11px] font-bold text-[#77828a] dark:bg-[#263138]"
                >
                  i
                </span>
              </div>
              <div className="grid grid-cols-2 border-t border-[#eff1f3] dark:border-[#293238]">
                <div className="px-4 py-3.5 text-center sm:py-4">
                  <p className="text-[11px] text-[#8d969d]">Available</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-[#444b51] dark:text-[#e3e9ec]">
                    {balanceVisible ? formatBalance(currency) : "••••"}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#8d969d]">
                    {balanceVisible
                      ? `0 ${coin.symbol.toUpperCase()}`
                      : "Balance hidden"}
                  </p>
                </div>
                <div className="border-l border-[#eff1f3] px-4 py-3.5 text-center sm:py-4 dark:border-[#293238]">
                  <p className="text-[11px] text-[#8d969d]">Frozen</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums text-[#444b51] dark:text-[#e3e9ec]">
                    {balanceVisible ? formatBalance(currency) : "••••"}
                  </p>
                  <p className="mt-0.5 text-[10px] text-[#8d969d]">
                    {balanceVisible
                      ? `0 ${coin.symbol.toUpperCase()}`
                      : "Balance hidden"}
                  </p>
                </div>
              </div>
            </section>

            <section
              aria-label={`${coin.name} actions`}
              className="mt-3 grid grid-cols-5 gap-1.5 rounded-2xl border border-[#e8ecef] bg-white px-2 py-3 shadow-[0_5px_20px_rgba(25,36,50,0.025)] sm:gap-3 sm:px-5 sm:py-4 dark:border-[#293238] dark:bg-[#171e23]"
            >
              {[
                {
                  label: "Send",
                  icon: "send" as const,
                  href: `/send?coin=${coin.symbol}`,
                },
                {
                  label: "Receive",
                  icon: "receive" as const,
                  href: `/receive?coin=${coin.symbol}`,
                },
                {
                  label: "Swap",
                  icon: "swap" as const,
                  href: `/swap?from=${coin.symbol}`,
                },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group flex flex-col items-center gap-1.5 text-[10px] font-medium text-[#58636b] transition active:scale-95 sm:text-xs dark:text-[#c4cdd2]"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#2d8bc8] to-[#075b9d] text-white shadow-sm transition group-hover:-translate-y-0.5 sm:h-11 sm:w-11">
                    <MarketIcon
                      name={action.icon}
                      className="h-[17px] w-[17px]"
                    />
                  </span>
                  {action.label}
                </Link>
              ))}
              {[
                { label: "Buy", icon: "buy" as const },
                { label: "Sell", icon: "sell" as const },
              ].map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() =>
                    showNotice(
                      `${action.label} is not enabled yet. No transaction has been made.`,
                    )
                  }
                  className="group flex flex-col items-center gap-1.5 text-[10px] font-medium text-[#58636b] transition active:scale-95 sm:text-xs dark:text-[#c4cdd2]"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#2d8bc8] to-[#075b9d] text-white shadow-sm transition group-hover:-translate-y-0.5 sm:h-11 sm:w-11">
                    <MarketIcon
                      name={action.icon}
                      className="h-[17px] w-[17px]"
                    />
                  </span>
                  {action.label}
                </button>
              ))}
            </section>

            <section className="mt-3 rounded-2xl border border-[#e8ecef] bg-white p-4 shadow-[0_5px_20px_rgba(25,36,50,0.025)] sm:p-5 dark:border-[#293238] dark:bg-[#171e23]">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#3d454c] dark:text-[#edf1f3]">
                  History
                </h2>
                {loading ? (
                  <span className="text-[10px] text-[#929aa1]">
                    Updating market data…
                  </span>
                ) : null}
              </div>
              <div className="mt-3 rounded-xl border border-[#e9ecee] bg-[#fafbfb] px-4 py-5 dark:border-[#293238] dark:bg-[#202930]">
                <p className="text-xs font-medium text-[#69737b] dark:text-[#c4cdd2]">
                  You have not made any transactions with this coin yet.
                </p>
                <p className="mt-1 text-[10px] leading-4 text-[#949ca3]">
                  Completed transactions for this asset will appear here.
                </p>
              </div>
            </section>

            <section className="mt-3 rounded-2xl border border-[#e8ecef] bg-white p-4 shadow-[0_5px_20px_rgba(25,36,50,0.025)] sm:p-5 dark:border-[#293238] dark:bg-[#171e23]">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-[#3d454c] dark:text-[#edf1f3]">
                    Price history
                  </h2>
                  <p className="mt-0.5 text-[10px] text-[#929aa1]">
                    {formatMarketPrice(coin.current_price, marketCurrency)}
                  </p>
                </div>
                <div
                  aria-label="Chart range"
                  className="flex items-center gap-1 rounded-lg bg-[#f3f5f6] p-1 dark:bg-[#202930]"
                >
                  {(
                    [
                      ["1", "1D"],
                      ["7", "7D"],
                      ["30", "30D"],
                    ] as const
                  ).map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={range === value}
                      onClick={() => setRange(value)}
                      className={`rounded-md px-2.5 py-1.5 text-[10px] font-semibold transition active:scale-95 ${
                        range === value
                          ? "bg-white text-[#075b9d] shadow-sm dark:bg-[#303c44]"
                          : "text-[#828d95] hover:text-[#47535b]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative h-[155px] overflow-hidden rounded-xl bg-[#f8fafb] px-1 py-2 dark:bg-[#202930] sm:h-[205px]">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 flex flex-col justify-between px-3 py-5"
                >
                  <span className="border-t border-dashed border-[#e8edef] dark:border-[#334047]" />
                  <span className="border-t border-dashed border-[#e8edef] dark:border-[#334047]" />
                  <span className="border-t border-dashed border-[#e8edef] dark:border-[#334047]" />
                </div>
                {chartPath ? (
                  <svg
                    role="img"
                    aria-label={`${coin.name} ${range}-day price chart`}
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="relative h-full w-full overflow-visible"
                  >
                    <path
                      d={`${chartPath} L 100 100 L 0 100 Z`}
                      fill={
                        chartRising
                          ? "rgba(32,169,90,.10)"
                          : "rgba(227,90,96,.10)"
                      }
                      stroke="none"
                    />
                    <path
                      d={chartPath}
                      fill="none"
                      stroke={chartRising ? "#20a95a" : "#e35a60"}
                      strokeWidth="1.6"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                ) : (
                  <div className="relative grid h-full place-items-center px-4 text-center text-xs text-[#929ba2]">
                    {loading
                      ? "Updating chart…"
                      : "Chart history is temporarily unavailable."}
                  </div>
                )}
              </div>
            </section>

            <section className="mt-3 rounded-2xl border border-[#e8ecef] bg-white p-4 sm:p-5 dark:border-[#293238] dark:bg-[#171e23]">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#3d454c] dark:text-[#edf1f3]">
                  Market statistics
                </h2>
                <button
                  type="button"
                  aria-label="Refresh coin market data"
                  onClick={() => setRefreshKey((value) => value + 1)}
                  className="rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-[#075b9d] hover:bg-[#edf6fc] active:scale-95"
                >
                  Refresh
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {[
                  ["24h high", coin.high_24h],
                  ["24h low", coin.low_24h],
                  ["Market cap", coin.market_cap],
                  ["24h volume", coin.total_volume],
                ].map(([label, value]) => (
                  <div
                    key={label as string}
                    className="rounded-xl bg-[#f7f9fa] p-3 dark:bg-[#202930]"
                  >
                    <p className="text-[10px] text-[#929aa1]">{label}</p>
                    <p className="mt-1 truncate text-xs font-semibold tabular-nums text-[#475159] dark:text-[#d9e0e4]">
                      {formatMarketPrice(
                        typeof value === "number" ? value : null,
                        marketCurrency,
                      )}
                    </p>
                  </div>
                ))}
              </div>
              {coin.homepage ? (
                <a
                  href={coin.homepage}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#075b9d] hover:underline"
                >
                  Visit {coin.name} website
                  <span aria-hidden="true">↗</span>
                </a>
              ) : null}
            </section>
            <p className="mt-3 text-center text-[10px] leading-5 text-[#9aa1a8]">
              Market information provided by CoinGecko
              {coinData.updatedAt
                ? ` · Updated ${new Date(coinData.updatedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
                : ""}
              . Prices can change quickly and are not a guarantee of execution
              price.
            </p>
          </>
        ) : null}
      </main>

      {notice ? (
        <div
          role="status"
          className="fixed left-1/2 top-[72px] z-50 -translate-x-1/2 rounded-full bg-[#20252b] px-4 py-2.5 text-xs font-medium text-white shadow-lg"
        >
          {notice}
        </div>
      ) : null}
      <MobileWalletNav active="Home" />
    </div>
  );
}
