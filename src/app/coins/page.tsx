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

type CoinCategory =
  | "All"
  | "Layer 1"
  | "Stablecoin"
  | "DeFi"
  | "Meme"
  | "Infrastructure"
  | "Gaming";

type SortOption =
  | "rank"
  | "name"
  | "price-desc"
  | "price-asc"
  | "change-desc"
  | "change-asc"
  | "volume-desc";

const watchlistKey = "qlx-coins-watchlist";

const categoryMap: Record<string, Exclude<CoinCategory, "All">> = {
  // Layer 1
  bitcoin: "Layer 1",
  ethereum: "Layer 1",
  binancecoin: "Layer 1",
  solana: "Layer 1",
  cardano: "Layer 1",
  "avalanche-2": "Layer 1",
  polkadot: "Layer 1",
  litecoin: "Layer 1",
  "bitcoin-cash": "Layer 1",
  stellar: "Layer 1",
  cosmos: "Layer 1",
  aptos: "Layer 1",
  sui: "Layer 1",
  sei: "Layer 1",
  near: "Layer 1",
  "internet-computer": "Layer 1",
  fantom: "Layer 1",
  algorand: "Layer 1",
  flow: "Layer 1",
  tezos: "Layer 1",
  tron: "Layer 1",
  kava: "Layer 1",
  cronos: "Layer 1",
  vechain: "Layer 1",
  hedera: "Layer 1",
  "the-open-network": "Layer 1",
  arbitrum: "Layer 1",
  optimism: "Layer 1",
  "ethereum-classic": "Layer 1",
  monero: "Layer 1",
  zcash: "Layer 1",
  dash: "Layer 1",
  nem: "Layer 1",
  eos: "Layer 1",
  neo: "Layer 1",
  waves: "Layer 1",
  nano: "Layer 1",
  iota: "Layer 1",
  qtum: "Layer 1",
  "icon-icx": "Layer 1",
  zilliqa: "Layer 1",
  "kucoin-shares": "Layer 1",
  okb: "Layer 1",
  mxc: "Layer 1",
  gmx: "Layer 1",

  // Stablecoins
  tether: "Stablecoin",
  "usd-coin": "Stablecoin",
  dai: "Stablecoin",
  "binance-usd": "Stablecoin",
  "true-usd": "Stablecoin",
  usdd: "Stablecoin",
  frax: "Stablecoin",
  "paxos-standard": "Stablecoin",
  fdusd: "Stablecoin",
  "first-digital-usd": "Stablecoin",
  liquityusd: "Stablecoin",
  "gemini-dollar": "Stablecoin",
  usdk: "Stablecoin",
  "stasis-eurs": "Stablecoin",
  "tether-gold": "Stablecoin",
  "paypal-usd": "Stablecoin",

  // DeFi
  uniswap: "DeFi",
  chainlink: "DeFi",
  aave: "DeFi",
  "lido-dao": "DeFi",
  "the-graph": "DeFi",
  "curve-dao-token": "DeFi",
  "compound-governance-token": "DeFi",
  pancakeswap: "DeFi",
  dydx: "DeFi",
  "1inch": "DeFi",
  "convex-finance": "DeFi",
  pendle: "DeFi",
  "rocket-pool": "DeFi",
  balancer: "DeFi",
  "synthetix-network-token": "DeFi",
  bancor: "DeFi",
  sushiswap: "DeFi",
  "yearn-finance": "DeFi",
  "spell-token": "DeFi",
  looksrare: "DeFi",
  x2y2: "DeFi",
  "badger-dao": "DeFi",
  keep3rv1: "DeFi",
  ren: "DeFi",
  "origin-protocol": "DeFi",
  ankr: "DeFi",
  "ethereum-name-service": "DeFi",

  // Meme
  dogecoin: "Meme",
  "shiba-inu": "Meme",
  pepe: "Meme",
  bonk: "Meme",
  dogwifhat: "Meme",
  floki: "Meme",
  "baby-doge-coin": "Meme",
  memecoin: "Meme",
  akita: "Meme",
  "kishu-inu": "Meme",
  samoyedcoin: "Meme",
  bittorrent: "Meme",
  "dogelon-mars": "Meme",
  "shib-2": "Meme",
  catecoin: "Meme",

  // Infrastructure
  filecoin: "Infrastructure",
  arweave: "Infrastructure",
  helium: "Infrastructure",
  "render-token": "Infrastructure",
  "fetch-ai": "Infrastructure",
  singularitynet: "Infrastructure",
  "ocean-protocol": "Infrastructure",
  "akash-network": "Infrastructure",
  livepeer: "Infrastructure",
  "theta-token": "Infrastructure",
  "theta-fuel": "Infrastructure",
  celestia: "Infrastructure",
  bundlr: "Infrastructure",
  bittensor: "Infrastructure",
  render: "Infrastructure",
  hive: "Infrastructure",
  kaspa: "Infrastructure",

  // Gaming
  "the-sandbox": "Gaming",
  decentraland: "Gaming",
  "axie-infinity": "Gaming",
  gala: "Gaming",
  illuvium: "Gaming",
  "enjin-coin": "Gaming",
  magic: "Gaming",
  apecoin: "Gaming",
  stepn: "Gaming",
  ronin: "Gaming",
  beam: "Gaming",
  "gods-unchained": "Gaming",
  "merit-circle": "Gaming",
  "yield-guild-games": "Gaming",
  ultra: "Gaming",
};

function getCategory(coin: MarketCoin): Exclude<CoinCategory, "All"> {
  const mapped = categoryMap[coin.id];
  if (mapped) return mapped;
  const symbol = coin.symbol.toUpperCase();
  if (
    symbol.endsWith("USD") ||
    symbol.endsWith("USDT") ||
    symbol.endsWith("USDC") ||
    symbol.endsWith("DAI") ||
    symbol === "BUSD" ||
    symbol === "TUSD" ||
    symbol === "FRAX" ||
    symbol === "USDP" ||
    symbol === "FDUSD"
  ) {
    return "Stablecoin";
  }
  return "Layer 1";
}

const categories: CoinCategory[] = [
  "All",
  "Layer 1",
  "Stablecoin",
  "DeFi",
  "Meme",
  "Infrastructure",
  "Gaming",
];

function formatCompact(
  value: number | null | undefined,
  currency: MarketCurrency,
) {
  if (value == null || !Number.isFinite(value)) return "—";
  const locale =
    currency === "ngn" ? "en-NG" : currency === "eur" ? "en-IE" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
    notation: "compact",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatChange(value: number | null | undefined) {
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
      className="h-[16px] w-[16px]"
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

function GridIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`h-[17px] w-[17px] ${active ? "text-white" : "text-[#6b747d]"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function ListIcon({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`h-[17px] w-[17px] ${active ? "text-white" : "text-[#6b747d]"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
    </svg>
  );
}

export default function CoinsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [coins, setCoins] = useState<MarketCoin[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CoinCategory>("All");
  const [sort, setSort] = useState<SortOption>("rank");
  const [view, setView] = useState<"grid" | "list">("list");
  const [watchlistOnly, setWatchlistOnly] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [currency, setCurrency] = useState<WalletCurrency>("NGN");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatedAt, setUpdatedAt] = useState("");

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
            per_page: "120",
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
                : "Coin directory is temporarily unavailable.",
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
              : "Coin directory is temporarily unavailable.",
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

  const filteredCoins = useMemo(() => {
    const filtered = coins.filter((coin) => {
      const matchesCategory =
        category === "All" || getCategory(coin) === category;
      const matchesWatchlist =
        !watchlistOnly || watchlist.includes(coin.symbol.toUpperCase());
      return matchesCategory && matchesWatchlist;
    });

    if (sort === "name") {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "price-desc") {
      filtered.sort(
        (a, b) =>
          (b.current_price ?? -Infinity) - (a.current_price ?? -Infinity),
      );
    } else if (sort === "price-asc") {
      filtered.sort(
        (a, b) => (a.current_price ?? Infinity) - (b.current_price ?? Infinity),
      );
    } else if (sort === "change-desc") {
      filtered.sort(
        (a, b) =>
          (b.price_change_percentage_24h ?? -Infinity) -
          (a.price_change_percentage_24h ?? -Infinity),
      );
    } else if (sort === "change-asc") {
      filtered.sort(
        (a, b) =>
          (a.price_change_percentage_24h ?? Infinity) -
          (b.price_change_percentage_24h ?? Infinity),
      );
    } else if (sort === "volume-desc") {
      filtered.sort(
        (a, b) => (b.total_volume ?? -Infinity) - (a.total_volume ?? -Infinity),
      );
    } else {
      filtered.sort(
        (a, b) =>
          (a.market_cap_rank ?? Infinity) - (b.market_cap_rank ?? Infinity),
      );
    }
    return filtered;
  }, [coins, category, sort, watchlist, watchlistOnly]);

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
        <p className="text-sm text-[#7b858d]">Loading your coin directory…</p>
      </div>
    );
  }

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

      <main className="mx-auto w-full max-w-[1240px] px-4 pb-28 pt-5 sm:px-6 sm:pb-12 sm:pt-7 lg:px-10">
        <section className="overflow-hidden rounded-2xl border border-[#e9ecef] bg-white shadow-[0_8px_24px_rgba(25,36,50,0.035)] dark:border-[#293238] dark:bg-[#171e23]">
          <div className="border-b border-[#edf0f2] p-4 sm:p-5 dark:border-[#293238]">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex h-11 min-w-[220px] flex-1 items-center gap-2.5 rounded-xl border border-[#e6eaed] bg-[#fafbfc] px-3.5 transition focus-within:border-[#9dbed3] sm:max-w-[440px] dark:border-[#364149] dark:bg-[#202930]">
                <span className="text-[#7c858d]">
                  <SearchIcon />
                </span>
                <input
                  type="search"
                  aria-label="Search all coins"
                  placeholder="Search by name or ticker"
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
                  aria-label="Sort coins"
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as SortOption)
                  }
                  className="h-full max-w-[170px] bg-transparent text-xs font-semibold text-[#424b53] outline-none dark:text-[#e2e8eb]"
                >
                  <option value="rank">Market rank</option>
                  <option value="name">Name A–Z</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="change-desc">24h change: high to low</option>
                  <option value="change-asc">24h change: low to high</option>
                  <option value="volume-desc">Volume: high to low</option>
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

              <div className="flex items-center gap-1 rounded-xl bg-[#eef1f3] p-1 dark:bg-[#1b2227]">
                <button
                  type="button"
                  aria-label="Grid view"
                  aria-pressed={view === "grid"}
                  onClick={() => setView("grid")}
                  className={`grid h-9 w-9 place-items-center rounded-lg transition ${
                    view === "grid" ? "bg-[#111820] dark:bg-white" : ""
                  }`}
                >
                  <GridIcon active={view === "grid"} />
                </button>
                <button
                  type="button"
                  aria-label="List view"
                  aria-pressed={view === "list"}
                  onClick={() => setView("list")}
                  className={`grid h-9 w-9 place-items-center rounded-lg transition ${
                    view === "list" ? "bg-[#111820] dark:bg-white" : ""
                  }`}
                >
                  <ListIcon active={view === "list"} />
                </button>
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((item) => {
                const selected = category === item;
                return (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setCategory(item)}
                    className={`shrink-0 rounded-full px-3.5 py-2 text-[11px] font-semibold transition active:scale-[.97] sm:text-xs ${
                      selected
                        ? "bg-[#0b5f9e] text-white shadow-sm"
                        : "bg-[#f2f4f5] text-[#69737c] hover:bg-[#e9eef1] dark:bg-[#232d33] dark:text-[#c7d0d5] dark:hover:bg-[#2b373e]"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
            <p className="text-xs font-semibold text-[#4a535b] dark:text-[#d9e0e4]">
              {query.trim()
                ? `Results for “${query.trim()}”`
                : watchlistOnly
                  ? "Your watchlist"
                  : category === "All"
                    ? "Full directory"
                    : `${category} assets`}
            </p>
            <p
              className="text-right text-[10px] text-[#9098a0]"
              aria-live="polite"
            >
              {loading ? "Updating…" : `${filteredCoins.length} assets`}
              {updatedLabel ? ` · ${updatedLabel}` : ""}
            </p>
          </div>

          {view === "list" ? (
            <>
              <div className="hidden grid-cols-[56px_minmax(220px,1fr)_minmax(120px,.7fr)_110px_minmax(120px,.7fr)_44px] items-center gap-3 border-y border-[#eff1f3] bg-[#fafbfc] px-5 py-3 text-[10px] font-semibold uppercase tracking-[.1em] text-[#969da4] md:grid dark:border-[#293238] dark:bg-[#202930]">
                <span>Rank</span>
                <span>Asset</span>
                <span className="text-right">Price</span>
                <span className="text-right">24h</span>
                <span className="text-right">Volume</span>
                <span className="sr-only">Watchlist</span>
              </div>

              <div className="divide-y divide-[#f0f2f3] dark:divide-[#293238]">
                {filteredCoins.map((coin, index) => {
                  const change = coin.price_change_percentage_24h;
                  const positive = (change ?? 0) >= 0;
                  const watching = watchlist.includes(
                    coin.symbol.toUpperCase(),
                  );
                  const coinCategory = getCategory(coin);
                  return (
                    <div
                      key={coin.id}
                      className="grid min-h-[76px] grid-cols-[minmax(0,1fr)_auto_38px] items-center gap-2 px-3 py-3 transition-colors hover:bg-[#fafcfd] sm:gap-3 sm:px-5 md:grid-cols-[56px_minmax(220px,1fr)_minmax(120px,.7fr)_110px_minmax(120px,.7fr)_44px] dark:hover:bg-[#1c252a]"
                    >
                      <span className="hidden text-xs font-medium text-[#a0a6ac] md:block">
                        {coin.market_cap_rank
                          ? `#${coin.market_cap_rank}`
                          : String(index + 1)}
                      </span>
                      <Link
                        href={`/coin/${encodeURIComponent(coin.id)}`}
                        aria-label={`Open ${coin.name} details`}
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
                          <span className="mt-0.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-[#929aa1]">
                            {coin.symbol}
                            <span className="rounded-md bg-[#f1f3f5] px-1.5 py-0.5 text-[9px] font-semibold capitalize text-[#7c858d] dark:bg-[#29343a] dark:text-[#bac4ca]">
                              {coinCategory}
                            </span>
                          </span>
                        </span>
                      </Link>

                      <Link
                        href={`/coin/${encodeURIComponent(coin.id)}`}
                        aria-label={`${coin.name} price and change`}
                        className="text-right md:text-left"
                      >
                        <span className="block text-[12px] font-semibold tabular-nums text-[#3d454c] sm:text-sm dark:text-[#e4e9ec]">
                          {formatMarketPrice(
                            coin.current_price,
                            marketCurrency,
                          )}
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
                        aria-label={`${coin.name} 24-hour change`}
                        className={`hidden text-right text-xs font-semibold tabular-nums md:block ${
                          positive ? "text-[#16875a]" : "text-[#ce5c60]"
                        }`}
                      >
                        {formatChange(change)}
                      </Link>

                      <Link
                        href={`/coin/${encodeURIComponent(coin.id)}`}
                        aria-label={`${coin.name} 24-hour volume`}
                        className="hidden text-right text-xs font-medium tabular-nums text-[#59636b] md:block dark:text-[#d5dde1]"
                      >
                        {formatCompact(coin.total_volume, marketCurrency)}
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
                    Loading the coin directory…
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
                {!loading && !error && filteredCoins.length === 0 ? (
                  <div className="px-4 py-14 text-center">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#f1f4f6] text-[#79858d] dark:bg-[#222c32]">
                      <SearchIcon />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-[#4d565e] dark:text-[#e2e7ea]">
                      {query.trim()
                        ? "No matching coins found"
                        : watchlistOnly
                          ? "Your watchlist is empty"
                          : "No assets in this category"}
                    </p>
                    <p className="mt-1 text-xs text-[#929aa1]">
                      {query.trim()
                        ? "Try a different name or ticker."
                        : watchlistOnly
                          ? "Star any asset to add it here."
                          : "Pick another category from the filters above."}
                    </p>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCoins.map((coin) => {
                const change = coin.price_change_percentage_24h;
                const positive = (change ?? 0) >= 0;
                const watching = watchlist.includes(coin.symbol.toUpperCase());
                const coinCategory = getCategory(coin);
                return (
                  <Link
                    key={coin.id}
                    href={`/coin/${encodeURIComponent(coin.id)}`}
                    aria-label={`Open ${coin.name} details`}
                    className="group relative flex flex-col rounded-2xl border border-[#e9ecef] bg-white p-4 transition hover:-translate-y-0.5 hover:border-[#cfd8de] hover:shadow-[0_10px_24px_rgba(25,36,50,0.06)] dark:border-[#293238] dark:bg-[#171e23] dark:hover:border-[#3a4750]"
                  >
                    <button
                      type="button"
                      aria-label={`${watching ? "Remove" : "Add"} ${coin.name} ${watching ? "from" : "to"} watchlist`}
                      aria-pressed={watching}
                      onClick={(event) => {
                        event.preventDefault();
                        toggleWatchlist(coin.symbol);
                      }}
                      className={`absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full transition hover:bg-amber-50 active:scale-90 dark:hover:bg-amber-950/30 ${
                        watching
                          ? "text-amber-500"
                          : "text-[#b5bbc0] hover:text-amber-500"
                      }`}
                    >
                      <StarIcon filled={watching} />
                    </button>

                    <div className="flex items-center gap-3">
                      <CoinLogo
                        src={coin.image}
                        name={coin.name}
                        symbol={coin.symbol}
                        size={42}
                      />
                      <div className="min-w-0 pr-8">
                        <p className="truncate text-sm font-semibold text-[#252c32] dark:text-[#edf1f3]">
                          {coin.name}
                        </p>
                        <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-[#929aa1]">
                          {coin.symbol}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-[11px] text-[#89919a]">Price</p>
                      <p className="mt-0.5 text-lg font-bold tabular-nums text-[#252c32] dark:text-[#eef2f4]">
                        {formatMarketPrice(coin.current_price, marketCurrency)}
                      </p>
                    </div>

                    <div className="mt-3 flex items-end justify-between">
                      <div>
                        <p className="text-[10px] text-[#89919a]">24h change</p>
                        <p
                          className={`mt-0.5 text-sm font-bold tabular-nums ${
                            positive ? "text-[#16875a]" : "text-[#ce5c60]"
                          }`}
                        >
                          {formatChange(change)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-[#89919a]">Volume</p>
                        <p className="mt-0.5 text-xs font-semibold tabular-nums text-[#59636b] dark:text-[#cdd6dc]">
                          {formatCompact(coin.total_volume, marketCurrency)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[#eef1f3] pt-3 dark:border-[#293238]">
                      <span className="rounded-md bg-[#f1f3f5] px-2 py-0.5 text-[9px] font-semibold capitalize text-[#7c858d] dark:bg-[#29343a] dark:text-[#bac4ca]">
                        {coinCategory}
                      </span>
                      <span className="text-[10px] font-medium text-[#929aa1]">
                        {coin.market_cap_rank
                          ? `Rank #${coin.market_cap_rank}`
                          : `#${filteredCoins.indexOf(coin) + 1}`}
                      </span>
                    </div>
                  </Link>
                );
              })}

              {loading && coins.length === 0 ? (
                <div className="col-span-full py-12 text-center text-sm text-[#7c838b]">
                  Loading the coin directory…
                </div>
              ) : null}
              {error ? (
                <div
                  role="alert"
                  className="col-span-full rounded-xl border border-[#f0d8cf] bg-[#fff8f5] px-4 py-3 text-xs leading-5 text-[#955340]"
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
              {!loading && !error && filteredCoins.length === 0 ? (
                <div className="col-span-full py-14 text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#f1f4f6] text-[#79858d] dark:bg-[#222c32]">
                    <SearchIcon />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-[#4d565e] dark:text-[#e2e7ea]">
                    {query.trim()
                      ? "No matching coins found"
                      : watchlistOnly
                        ? "Your watchlist is empty"
                        : "No assets in this category"}
                  </p>
                  <p className="mt-1 text-xs text-[#929aa1]">
                    {query.trim()
                      ? "Try a different name or ticker."
                      : watchlistOnly
                        ? "Star any asset to add it here."
                        : "Pick another category from the filters above."}
                  </p>
                </div>
              ) : null}
            </div>
          )}

          <div className="border-t border-[#eff1f3] bg-[#fafbfc] px-4 py-3 text-[10px] leading-5 text-[#89929a] sm:px-5 dark:border-[#293238] dark:bg-[#202930] dark:text-[#b6c0c6]">
            Prices, rankings, and 24-hour changes are provided by CoinGecko and
            may be delayed. Asset categories are grouped for convenience and are
            not financial advice.
          </div>
        </section>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1 text-[11px] text-[#8a929a]">
          <span>
            Prices shown in {currency} based on your wallet preference.
          </span>
          <Link
            href="/help"
            className="font-semibold text-[#0b5f9e] hover:underline dark:text-[#71b8ea]"
          >
            Coin directory help
          </Link>
        </div>
      </main>

      <MobileWalletNav active="All Coins" />
    </div>
  );
}
