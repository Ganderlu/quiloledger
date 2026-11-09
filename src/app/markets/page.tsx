"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { CoinLogo } from "../_components/CoinLogo";
import {
  MobileWalletNav,
  WalletPageHeader,
} from "../_components/WalletNavigation";
import {
  getStoredCurrency,
  walletPreferencesChangedEvent,
  type WalletCurrency,
} from "@/lib/wallet-preferences";
import {
  formatMarketPrice,
  type MarketCoin,
  type MarketCurrency,
  type MarketResponse,
} from "@/lib/market";

type MarketFilter = "all" | "gainers" | "losers";
type SortOption = "rank" | "change-desc" | "change-asc" | "price-desc" | "price-asc";

const watchlistKey = "qlx-coins-watchlist";

function formatMarketValue(
  value: number | null | undefined,
  currency: MarketCurrency,
) {
  if (value == null || !Number.isFinite(value)) return "—";
  const locale =
    currency === "ngn" ? "en-NG" : currency === "eur" ? "en-IE" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
    notation: value >= 1_000_000 ? "compact" : "standard",
    maximumFractionDigits: value >= 1_000_000 ? 2 : 2,
  }).format(value);
}

function formatChange(value: number | null) {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4.5 4.5" />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-[17px] w-[17px]"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
    </svg>
  );
}

export default function MarketsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [coins, setCoins] = useState<MarketCoin[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MarketFilter>("all");
  const [sort, setSort] = useState<SortOption>("rank");
  const [watchlistOnly, setWatchlistOnly] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [currency, setCurrency] = useState<WalletCurrency>("NGN");
  const [updatedAt, setUpdatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const marketCurrency = currency.toLowerCase() as MarketCurrency;

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
    const syncPreferences = () => setCurrency(getStoredCurrency());
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
        localStorage.getItem(watchlistKey) ?? "[]",
      );
      if (
        Array.isArray(stored) &&
        stored.every((item) => typeof item === "string")
      ) {
        setWatchlist(stored);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(
      async () => {
        setLoading(true);
        setError("");
        try {
          const params = new URLSearchParams({
            currency: marketCurrency,
          });
          if (query.trim()) params.set("query", query.trim());
          const response = await fetch(`/api/market?${params.toString()}`, {
            signal: controller.signal,
            cache: "no-store",
          });
          const payload = (await response.json()) as
            | MarketResponse
            | { error?: string };
          if (!response.ok || !("coins" in payload)) {
            throw new Error(
              "error" in payload && payload.error
                ? payload.error
                : "Live market data is temporarily unavailable.",
            );
          }
          setCoins(payload.coins);
          setUpdatedAt(payload.updatedAt);
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
              : "Live market data is temporarily unavailable.",
          );
        } finally {
          if (!controller.signal.aborted) setLoading(false);
        }
      },
      query.trim() ? 350 : 0,
    );

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [marketCurrency, query, refreshKey, user]);

  const visibleCoins = useMemo(() => {
    const filtered = coins.filter((coin) => {
      const change = coin.price_change_percentage_24h ?? 0;
      if (watchlistOnly && !watchlist.includes(coin.symbol.toUpperCase())) {
        return false;
      }
      if (filter === "gainers" && change <= 0) return false;
      if (filter === "losers" && change >= 0) return false;
      return true;
    });

    if (sort === "change-desc") {
      filtered.sort(
        (left, right) =>
          (right.price_change_percentage_24h ?? -Infinity) -
          (left.price_change_percentage_24h ?? -Infinity),
      );
    } else if (sort === "change-asc") {
      filtered.sort(
        (left, right) =>
          (left.price_change_percentage_24h ?? Infinity) -
          (right.price_change_percentage_24h ?? Infinity),
      );
    } else if (sort === "price-desc") {
      filtered.sort(
        (left, right) =>
          (right.current_price ?? -Infinity) -
          (left.current_price ?? -Infinity),
      );
    } else if (sort === "price-asc") {
      filtered.sort(
        (left, right) =>
          (left.current_price ?? Infinity) -
          (right.current_price ?? Infinity),
      );
    } else {
      filtered.sort(
        (left, right) =>
          (left.market_cap_rank ?? Infinity) -
          (right.market_cap_rank ?? Infinity),
      );
    }
    return filtered;
  }, [coins, filter, sort, watchlist, watchlistOnly]);

  const toggleWatchlist = useCallback((symbol: string) => {
    setWatchlist((current) => {
      const normalized = symbol.toUpperCase();
      const next = current.includes(normalized)
        ? current.filter((item) => item !== normalized)
        : [...current, normalized];
      try {
        localStorage.setItem(watchlistKey, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  if (checkingAuth || !user) {
    return (
      <div className="grid min-h-[70vh] place-items-center bg-[#f7f8fa] px-4 dark:bg-[#101619]">
        <p className="text-sm text-[#7b858d]">Loading live markets…</p>
      </div>
    );
  }

  const gainers = coins.filter(
    (coin) => (coin.price_change_percentage_24h ?? 0) > 0,
  ).length;
  const updatedLabel = updatedAt
    ? new Date(updatedAt).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="qlx-wallet-app min-h-screen flex-1 bg-[#f7f8fa] text-[#25282d] dark:bg-[#101619] dark:text-[#e9eef0]">
      <div className="h-1 w-full bg-[#27c84a]" />
      <WalletPageHeader active="All Coins" />

      <main className="mx-auto w-full max-w-[1240px] px-4 pb-28 pt-6 sm:px-6 sm:pb-12 sm:pt-9 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#16875a]">
              Live market
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#20252b] sm:text-[30px] dark:text-[#f1f4f5]">
              Markets
            </h1>
            <p className="mt-1.5 max-w-xl text-sm leading-6 text-[#77808a]">
              Track real-time prices, market rankings, and daily movements
              across the crypto market.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e4e9e7] bg-white px-3 py-2 text-[10px] font-semibold text-[#68736d] dark:border-[#293238] dark:bg-[#171e23] dark:text-[#c7d0d5]">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  error ? "bg-[#d9a642]" : "bg-[#20a95a]"
                }`}
              />
              CoinGecko live data
            </span>
            <button
              type="button"
              onClick={() => setRefreshKey((key) => key + 1)}
              disabled={loading}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#e4e9ed] bg-white px-3 text-xs font-semibold text-[#53606a] transition hover:bg-[#f8fafb] disabled:cursor-wait disabled:opacity-60 active:scale-[.98] dark:border-[#293238] dark:bg-[#171e23] dark:text-[#d4dde1]"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 7v5h-5M4 17v-5h5" />
                <path d="M5.6 9A7 7 0 0 1 18 6l2 2M4 16l2 2a7 7 0 0 0 12.4-3" />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#e9ecef] bg-white p-4 shadow-[0_5px_18px_rgba(25,36,50,0.025)] sm:p-5 dark:border-[#293238] dark:bg-[#171e23]">
            <p className="text-[10px] font-medium text-[#89919a] sm:text-xs">
              Assets in view
            </p>
            <p className="mt-1.5 text-xl font-bold tracking-tight text-[#252c32] sm:text-2xl dark:text-[#edf1f3]">
              {loading && coins.length === 0 ? "…" : coins.length}
            </p>
            <p className="mt-1 text-[10px] text-[#9aa1a8]">
              {query.trim() ? "Live search matches" : "Top 50 by market cap"}
            </p>
          </div>
          <div className="rounded-2xl border border-[#e9ecef] bg-white p-4 shadow-[0_5px_18px_rgba(25,36,50,0.025)] sm:p-5 dark:border-[#293238] dark:bg-[#171e23]">
            <p className="text-[10px] font-medium text-[#89919a] sm:text-xs">
              24h gainers
            </p>
            <p className="mt-1.5 text-xl font-bold tracking-tight text-[#16875a] sm:text-2xl">
              {gainers}
            </p>
            <p className="mt-1 text-[10px] text-[#9aa1a8]">
              Of the assets currently loaded
            </p>
          </div>
          <div className="col-span-2 rounded-2xl border border-[#e9ecef] bg-white p-4 shadow-[0_5px_18px_rgba(25,36,50,0.025)] sm:col-span-1 sm:p-5 dark:border-[#293238] dark:bg-[#171e23]">
            <p className="text-[10px] font-medium text-[#89919a] sm:text-xs">
              Watchlist
            </p>
            <p className="mt-1.5 text-xl font-bold tracking-tight text-[#252c32] sm:text-2xl dark:text-[#edf1f3]">
              {watchlist.length}
            </p>
            <p className="mt-1 text-[10px] text-[#9aa1a8]">
              Saved on this device
            </p>
          </div>
        </div>

        <section className="mt-5 overflow-hidden rounded-2xl border border-[#e9ecef] bg-white shadow-[0_8px_24px_rgba(25,36,50,0.035)] dark:border-[#293238] dark:bg-[#171e23]">
          <div className="border-b border-[#edf0f2] p-4 sm:p-5 dark:border-[#293238]">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex h-11 min-w-[220px] flex-1 items-center gap-2.5 rounded-xl border border-[#e6eaed] bg-[#fafbfc] px-3.5 transition focus-within:border-[#9dbed3] sm:max-w-[440px] dark:border-[#364149] dark:bg-[#202930]">
                <span className="text-[#7c858d]">
                  <SearchIcon />
                </span>
                <input
                  type="search"
                  aria-label="Search all cryptocurrencies"
                  placeholder="Search any coin by name or ticker"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#333b42] outline-none placeholder:text-[#9ca4aa] dark:text-[#e8edef]"
                />
                {query ? (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setQuery("")}
                    className="text-xs text-[#7e8790] hover:text-[#30373e]"
                  >
                    Clear
                  </button>
                ) : null}
              </label>

              <label className="flex h-11 items-center gap-2 rounded-xl border border-[#e6eaed] bg-white px-3 text-xs font-medium text-[#67717a] dark:border-[#364149] dark:bg-[#171e23] dark:text-[#d0d9de]">
                <span className="hidden sm:inline">Sort</span>
                <select
                  aria-label="Sort market assets"
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as SortOption)
                  }
                  className="h-full max-w-[160px] bg-transparent text-xs font-semibold text-[#424b53] outline-none dark:text-[#e2e8eb]"
                >
                  <option value="rank">Market rank</option>
                  <option value="change-desc">24h change: high to low</option>
                  <option value="change-asc">24h change: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="price-asc">Price: low to high</option>
                </select>
              </label>

              <button
                type="button"
                aria-pressed={watchlistOnly}
                onClick={() => setWatchlistOnly((value) => !value)}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition active:scale-[.98] ${
                  watchlistOnly
                    ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                    : "border-[#e6eaed] bg-white text-[#67717a] hover:bg-[#f8f9fa] dark:border-[#364149] dark:bg-[#171e23] dark:text-[#d0d9de]"
                }`}
              >
                <StarIcon filled={watchlistOnly} />
                <span>Watchlist</span>
              </button>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {(
                [
                  ["all", "All assets"],
                  ["gainers", "Top gainers"],
                  ["losers", "Top declines"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                  className={`shrink-0 rounded-full px-3.5 py-2 text-[11px] font-semibold transition active:scale-[.97] sm:text-xs ${
                    filter === value
                      ? "bg-[#0b5f9e] text-white shadow-sm"
                      : "bg-[#f2f4f5] text-[#69737c] hover:bg-[#e9eef1] dark:bg-[#232d33] dark:text-[#c7d0d5] dark:hover:bg-[#2b373e]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
            <p className="text-xs font-semibold text-[#4a535b] dark:text-[#d9e0e4]">
              {query.trim()
                ? `Search results for “${query.trim()}”`
                : watchlistOnly
                  ? "Your watchlist"
                  : "Top cryptocurrencies"}
            </p>
            <p
              className="text-right text-[10px] text-[#9098a0]"
              aria-live="polite"
            >
              {loading ? "Updating…" : `${visibleCoins.length} assets`}
              {updatedLabel ? ` · Updated ${updatedLabel}` : ""}
            </p>
          </div>

          <div className="hidden grid-cols-[56px_minmax(220px,1fr)_minmax(130px,.7fr)_130px_minmax(130px,.7fr)_44px] items-center gap-3 border-y border-[#eff1f3] bg-[#fafbfc] px-5 py-3 text-[10px] font-semibold uppercase tracking-[.1em] text-[#969da4] md:grid dark:border-[#293238] dark:bg-[#202930]">
            <span>Rank</span>
            <span>Asset</span>
            <span className="text-right">Price</span>
            <span className="text-right">24h</span>
            <span className="text-right">Market cap</span>
            <span className="sr-only">Watchlist</span>
          </div>

          <div className="divide-y divide-[#f0f2f3] dark:divide-[#293238]">
            {visibleCoins.map((coin, index) => {
              const change = coin.price_change_percentage_24h;
              const positive = (change ?? 0) >= 0;
              const watching = watchlist.includes(coin.symbol.toUpperCase());
              return (
                <div
                  key={coin.id}
                  className="grid min-h-[76px] grid-cols-[minmax(0,1fr)_auto_38px] items-center gap-2 px-3 py-3 transition-colors hover:bg-[#fafcfd] sm:gap-3 sm:px-5 md:grid-cols-[56px_minmax(220px,1fr)_minmax(130px,.7fr)_130px_minmax(130px,.7fr)_44px] dark:hover:bg-[#1c252a]"
                >
                  <span className="hidden text-xs font-medium text-[#a0a6ac] md:block">
                    {coin.market_cap_rank
                      ? `#${coin.market_cap_rank}`
                      : String(index + 1)}
                  </span>
                  <Link
                    href={`/coin/${encodeURIComponent(coin.id)}`}
                    aria-label={`Open ${coin.name} market details`}
                    className="flex min-w-0 items-center gap-3"
                  >
                    <CoinLogo
                      src={coin.image}
                      name={coin.name}
                      symbol={coin.symbol}
                      size={40}
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-semibold text-[#30383f] sm:text-sm dark:text-[#edf1f3]">
                        {coin.name}
                      </span>
                      <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-wide text-[#929aa1]">
                        {coin.symbol}
                        {coin.market_cap_rank
                          ? ` · Rank #${coin.market_cap_rank}`
                          : ""}
                      </span>
                    </span>
                  </Link>

                  <Link
                    href={`/coin/${encodeURIComponent(coin.id)}`}
                    aria-label={`${coin.name} current price and daily change`}
                    className="text-right md:text-left"
                  >
                    <span className="block text-[12px] font-semibold tabular-nums text-[#3d454c] sm:text-sm dark:text-[#e4e9ec]">
                      {formatMarketPrice(coin.current_price, marketCurrency)}
                    </span>
                    <span
                      className={`mt-1 block text-[10px] font-semibold tabular-nums md:hidden ${
                        positive ? "text-[#16875a]" : "text-[#ce5c60]"
                      }`}
                    >
                      {formatChange(change)}
                    </span>
                  </Link>

                  <Link
                    href={`/coin/${encodeURIComponent(coin.id)}`}
                    aria-label={`${coin.name} 24-hour change ${formatChange(change)}`}
                    className={`hidden text-right text-xs font-semibold tabular-nums md:block ${
                      positive ? "text-[#16875a]" : "text-[#ce5c60]"
                    }`}
                  >
                    {formatChange(change)}
                  </Link>

                  <Link
                    href={`/coin/${encodeURIComponent(coin.id)}`}
                    aria-label={`${coin.name} market capitalization`}
                    className="hidden text-right text-xs font-medium tabular-nums text-[#59636b] md:block dark:text-[#d5dde1]"
                  >
                    {formatMarketValue(coin.market_cap, marketCurrency)}
                  </Link>

                  <button
                    type="button"
                    aria-label={`${watching ? "Remove" : "Add"} ${coin.name} ${watching ? "from" : "to"} watchlist`}
                    aria-pressed={watching}
                    onClick={() => toggleWatchlist(coin.symbol)}
                    className={`grid h-9 w-9 place-items-center rounded-full transition hover:bg-amber-50 active:scale-90 dark:hover:bg-amber-950/30 ${
                      watching
                        ? "text-amber-500"
                        : "text-[#b5bbc0] hover:text-amber-500"
                    }`}
                  >
                    <StarIcon filled={watching} />
                  </button>
                </div>
              );
            })}

            {loading && coins.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-[#7c838b] sm:px-5">
                Loading live cryptocurrency prices…
              </div>
            ) : null}
            {error ? (
              <div
                role="alert"
                className="mx-3 my-3 rounded-xl border border-[#f0d8cf] bg-[#fff8f5] px-4 py-3 text-xs leading-5 text-[#955340] sm:mx-5"
              >
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => setRefreshKey((key) => key + 1)}
                  className="mt-1 font-semibold underline underline-offset-2"
                >
                  Try again
                </button>
              </div>
            ) : null}
            {!loading && !error && visibleCoins.length === 0 ? (
              <div className="px-4 py-14 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#f1f4f6] text-[#79858d] dark:bg-[#222c32]">
                  <SearchIcon />
                </div>
                <p className="mt-3 text-sm font-semibold text-[#4d565e] dark:text-[#e2e7ea]">
                  {query.trim()
                    ? "No matching coins found"
                    : watchlistOnly
                      ? "Your watchlist is empty"
                      : "No assets match this filter"}
                </p>
                <p className="mt-1 text-xs text-[#929aa1]">
                  {query.trim()
                    ? "Try a different coin name or ticker symbol."
                    : "Choose another market view or add an asset to your watchlist."}
                </p>
              </div>
            ) : null}
          </div>

          <div className="border-t border-[#eff1f3] bg-[#fafbfc] px-4 py-3 text-[10px] leading-5 text-[#89929a] sm:px-5 dark:border-[#293238] dark:bg-[#202930] dark:text-[#b6c0c6]">
            Prices, rankings, market caps, and 24-hour changes are provided by
            CoinGecko and may be delayed. Market information is for reference
            only, not financial advice.
          </div>
        </section>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1 text-[11px] text-[#8a929a]">
          <span>Prices shown in {currency} based on your wallet preference.</span>
          <Link
            href="/help"
            className="font-semibold text-[#0b5f9e] hover:underline dark:text-[#71b8ea]"
          >
            Market data help
          </Link>
        </div>
      </main>

      <MobileWalletNav active="All Coins" />
    </div>
  );
}
