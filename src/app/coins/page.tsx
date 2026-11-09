"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  MobileWalletNav,
  WalletPageHeader,
} from "../_components/WalletNavigation";
import {
  getStoredCurrency,
  walletPreferencesChangedEvent,
  type WalletCurrency,
} from "@/lib/wallet-preferences";

type CoinCategory =
  | "Layer 1"
  | "Stablecoin"
  | "DeFi"
  | "Meme"
  | "Infrastructure"
  | "Gaming";

type Coin = {
  name: string;
  symbol: string;
  priceNgn: number;
  change: number;
  category: CoinCategory;
  mark: string;
};

const coins: Coin[] = [
  {
    name: "Bitcoin",
    symbol: "BTC",
    priceNgn: 91305895.85,
    change: 1.82,
    category: "Layer 1",
    mark: "₿",
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    priceNgn: 3246820,
    change: 2.46,
    category: "Layer 1",
    mark: "◆",
  },
  {
    name: "Tether",
    symbol: "USDT",
    priceNgn: 1498,
    change: 0.04,
    category: "Stablecoin",
    mark: "₮",
  },
  {
    name: "BNB",
    symbol: "BNB",
    priceNgn: 1007901.6,
    change: -0.32,
    category: "Layer 1",
    mark: "◆",
  },
  {
    name: "XRP",
    symbol: "XRP",
    priceNgn: 3420.5,
    change: 1.14,
    category: "Layer 1",
    mark: "✕",
  },
  {
    name: "USD Coin",
    symbol: "USDC",
    priceNgn: 1496,
    change: -0.02,
    category: "Stablecoin",
    mark: "$",
  },
  {
    name: "Solana",
    symbol: "SOL",
    priceNgn: 218460.5,
    change: 3.28,
    category: "Layer 1",
    mark: "≋",
  },
  {
    name: "TRON",
    symbol: "TRX",
    priceNgn: 465.2,
    change: 0.64,
    category: "Layer 1",
    mark: "△",
  },
  {
    name: "Dogecoin",
    symbol: "DOGE",
    priceNgn: 235.6,
    change: -1.25,
    category: "Meme",
    mark: "Ð",
  },
  {
    name: "Cardano",
    symbol: "ADA",
    priceNgn: 1042.48,
    change: 0.88,
    category: "Layer 1",
    mark: "₳",
  },
  {
    name: "Toncoin",
    symbol: "TON",
    priceNgn: 8200,
    change: 2.02,
    category: "Layer 1",
    mark: "◇",
  },
  {
    name: "Chainlink",
    symbol: "LINK",
    priceNgn: 18450,
    change: 1.76,
    category: "Infrastructure",
    mark: "⬡",
  },
  {
    name: "Avalanche",
    symbol: "AVAX",
    priceNgn: 52300,
    change: -0.72,
    category: "Layer 1",
    mark: "▲",
  },
  {
    name: "Shiba Inu",
    symbol: "SHIB",
    priceNgn: 0.038,
    change: 2.91,
    category: "Meme",
    mark: "S",
  },
  {
    name: "Bitcoin Cash",
    symbol: "BCH",
    priceNgn: 43374.2,
    change: -0.2,
    category: "Layer 1",
    mark: "Ƀ",
  },
  {
    name: "Polkadot",
    symbol: "DOT",
    priceNgn: 10800,
    change: 0.52,
    category: "Layer 1",
    mark: "●",
  },
  {
    name: "Litecoin",
    symbol: "LTC",
    priceNgn: 148000,
    change: 0.37,
    category: "Layer 1",
    mark: "Ł",
  },
  {
    name: "Dai",
    symbol: "DAI",
    priceNgn: 1497,
    change: 0.01,
    category: "Stablecoin",
    mark: "◈",
  },
  {
    name: "NEAR Protocol",
    symbol: "NEAR",
    priceNgn: 5120,
    change: 3.14,
    category: "Layer 1",
    mark: "Ⓝ",
  },
  {
    name: "Uniswap",
    symbol: "UNI",
    priceNgn: 15400,
    change: 1.58,
    category: "DeFi",
    mark: "U",
  },
  {
    name: "Stellar",
    symbol: "XLM",
    priceNgn: 520,
    change: 0.48,
    category: "Layer 1",
    mark: "*",
  },
  {
    name: "Cosmos",
    symbol: "ATOM",
    priceNgn: 7240,
    change: -0.45,
    category: "Layer 1",
    mark: "✳",
  },
  {
    name: "Ethereum Classic",
    symbol: "ETC",
    priceNgn: 23800,
    change: 0.63,
    category: "Layer 1",
    mark: "Ξ",
  },
  {
    name: "Internet Computer",
    symbol: "ICP",
    priceNgn: 12150,
    change: 2.25,
    category: "Infrastructure",
    mark: "∞",
  },
  {
    name: "Filecoin",
    symbol: "FIL",
    priceNgn: 6490,
    change: -1.02,
    category: "Infrastructure",
    mark: "F",
  },
  {
    name: "Aptos",
    symbol: "APT",
    priceNgn: 13600,
    change: 1.32,
    category: "Layer 1",
    mark: "A",
  },
  {
    name: "Hedera",
    symbol: "HBAR",
    priceNgn: 178,
    change: 0.91,
    category: "Layer 1",
    mark: "ℏ",
  },
  {
    name: "Arbitrum",
    symbol: "ARB",
    priceNgn: 1060,
    change: 1.03,
    category: "Layer 1",
    mark: "A",
  },
  {
    name: "Optimism",
    symbol: "OP",
    priceNgn: 2250,
    change: 0.74,
    category: "Layer 1",
    mark: "O",
  },
  {
    name: "Cronos",
    symbol: "CRO",
    priceNgn: 194,
    change: -0.28,
    category: "Layer 1",
    mark: "◇",
  },
  {
    name: "VeChain",
    symbol: "VET",
    priceNgn: 48,
    change: 1.12,
    category: "Infrastructure",
    mark: "V",
  },
  {
    name: "Injective",
    symbol: "INJ",
    priceNgn: 38900,
    change: 2.62,
    category: "DeFi",
    mark: "✦",
  },
  {
    name: "Maker",
    symbol: "MKR",
    priceNgn: 3245000,
    change: 0.44,
    category: "DeFi",
    mark: "M",
  },
  {
    name: "Aave",
    symbol: "AAVE",
    priceNgn: 187000,
    change: 1.35,
    category: "DeFi",
    mark: "A",
  },
  {
    name: "Algorand",
    symbol: "ALGO",
    priceNgn: 292,
    change: 0.58,
    category: "Layer 1",
    mark: "A",
  },
  {
    name: "Sui",
    symbol: "SUI",
    priceNgn: 4130,
    change: 4.12,
    category: "Layer 1",
    mark: "S",
  },
  {
    name: "Sei",
    symbol: "SEI",
    priceNgn: 390,
    change: 2.77,
    category: "Layer 1",
    mark: "S",
  },
  {
    name: "Fantom",
    symbol: "FTM",
    priceNgn: 1080,
    change: -0.66,
    category: "Layer 1",
    mark: "F",
  },
  {
    name: "THORChain",
    symbol: "RUNE",
    priceNgn: 6120,
    change: 1.89,
    category: "DeFi",
    mark: "ᚱ",
  },
  {
    name: "Tezos",
    symbol: "XTZ",
    priceNgn: 1420,
    change: -0.13,
    category: "Layer 1",
    mark: "ꜩ",
  },
  {
    name: "Flow",
    symbol: "FLOW",
    priceNgn: 842,
    change: 0.82,
    category: "Layer 1",
    mark: "F",
  },
  {
    name: "Decentraland",
    symbol: "MANA",
    priceNgn: 710,
    change: 1.04,
    category: "Gaming",
    mark: "M",
  },
  {
    name: "The Sandbox",
    symbol: "SAND",
    priceNgn: 675,
    change: -0.87,
    category: "Gaming",
    mark: "S",
  },
  {
    name: "Axie Infinity",
    symbol: "AXS",
    priceNgn: 7240,
    change: 2.18,
    category: "Gaming",
    mark: "A",
  },
  {
    name: "The Graph",
    symbol: "GRT",
    priceNgn: 235,
    change: 0.96,
    category: "Infrastructure",
    mark: "G",
  },
  {
    name: "Lido DAO",
    symbol: "LDO",
    priceNgn: 2580,
    change: 1.23,
    category: "DeFi",
    mark: "L",
  },
  {
    name: "Pepe",
    symbol: "PEPE",
    priceNgn: 0.021,
    change: 3.74,
    category: "Meme",
    mark: "P",
  },
  {
    name: "dogwifhat",
    symbol: "WIF",
    priceNgn: 2870,
    change: 2.95,
    category: "Meme",
    mark: "W",
  },
  {
    name: "Bonk",
    symbol: "BONK",
    priceNgn: 0.043,
    change: 1.68,
    category: "Meme",
    mark: "B",
  },
  {
    name: "Celestia",
    symbol: "TIA",
    priceNgn: 7680,
    change: 1.46,
    category: "Infrastructure",
    mark: "✦",
  },
];

const categories = [
  "All coins",
  "Layer 1",
  "Stablecoin",
  "DeFi",
  "Meme",
  "Infrastructure",
  "Gaming",
] as const;

const iconColors = [
  "from-orange-400 to-amber-600",
  "from-indigo-400 to-violet-700",
  "from-emerald-400 to-teal-700",
  "from-yellow-400 to-amber-600",
  "from-slate-400 to-slate-700",
  "from-blue-400 to-blue-700",
  "from-fuchsia-400 to-violet-700",
  "from-red-400 to-rose-700",
] as const;

const fxFromNgn: Record<WalletCurrency, number> = {
  NGN: 1,
  USD: 0.00067,
  EUR: 0.00062,
};

const currencyLocale: Record<WalletCurrency, string> = {
  NGN: "en-NG",
  USD: "en-US",
  EUR: "en-IE",
};

function formatPrice(priceNgn: number, currency: WalletCurrency) {
  const amount = priceNgn * fxFromNgn[currency];
  const digits = amount < 1 ? 4 : amount < 100 ? 2 : 2;
  return new Intl.NumberFormat(currencyLocale[currency], {
    style: "currency",
    currency,
    minimumFractionDigits: amount < 1 ? 4 : 2,
    maximumFractionDigits: digits,
  }).format(amount);
}

function CoinGlyph({ coin, index }: { coin: Coin; index: number }) {
  return (
    <span
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br ${iconColors[index % iconColors.length]} text-[17px] font-bold text-white shadow-sm`}
      aria-hidden="true"
    >
      {coin.mark}
    </span>
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

export default function CoinsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] =
    useState<(typeof categories)[number]>("All coins");
  const [sort, setSort] = useState("rank");
  const [watchlistOnly, setWatchlistOnly] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [currency, setCurrency] = useState<WalletCurrency>("NGN");
  const [selectedCoin, setSelectedCoin] = useState<Coin | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setUser(null);
        router.replace("/login");
        return;
      }
      setUser(currentUser);
      router.replace("/markets");
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    let watchlistFrame = 0;
    try {
      const stored = localStorage.getItem("qlx-coins-watchlist");
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (
          Array.isArray(parsed) &&
          parsed.every((item) => typeof item === "string")
        ) {
          watchlistFrame = window.requestAnimationFrame(() =>
            setWatchlist(parsed),
          );
        }
      }
    } catch {}

    const syncCurrency = () => setCurrency(getStoredCurrency());
    syncCurrency();
    window.addEventListener(walletPreferencesChangedEvent, syncCurrency);
    window.addEventListener("storage", syncCurrency);
    return () => {
      if (watchlistFrame) window.cancelAnimationFrame(watchlistFrame);
      window.removeEventListener(walletPreferencesChangedEvent, syncCurrency);
      window.removeEventListener("storage", syncCurrency);
    };
  }, []);

  useEffect(() => {
    if (!selectedCoin) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedCoin(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedCoin]);

  const filteredCoins = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const result = coins
      .map((coin, index) => ({ coin, index }))
      .filter(({ coin }) => {
        const matchesQuery =
          !normalizedQuery ||
          `${coin.name} ${coin.symbol} ${coin.category}`
            .toLowerCase()
            .includes(normalizedQuery);
        const matchesCategory =
          category === "All coins" || coin.category === category;
        const matchesWatchlist =
          !watchlistOnly || watchlist.includes(coin.symbol);
        return matchesQuery && matchesCategory && matchesWatchlist;
      });

    if (sort === "name") {
      result.sort((a, b) => a.coin.name.localeCompare(b.coin.name));
    } else if (sort === "price-high") {
      result.sort((a, b) => b.coin.priceNgn - a.coin.priceNgn);
    } else if (sort === "price-low") {
      result.sort((a, b) => a.coin.priceNgn - b.coin.priceNgn);
    } else if (sort === "gainers") {
      result.sort((a, b) => b.coin.change - a.coin.change);
    }
    return result;
  }, [category, query, sort, watchlist, watchlistOnly]);

  function toggleWatchlist(symbol: string) {
    setWatchlist((current) => {
      const next = current.includes(symbol)
        ? current.filter((item) => item !== symbol)
        : [...current, symbol];
      try {
        localStorage.setItem("qlx-coins-watchlist", JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  if (checking || !user) {
    return (
      <div className="grid min-h-[70vh] flex-1 place-items-center bg-[#f7f8fa] px-4 dark:bg-[#101619]">
        <p className="text-sm text-[#7b858d]">Loading your coin directory…</p>
      </div>
    );
  }

  return (
    <div className="qlx-wallet-app min-h-screen flex-1 bg-[#f7f8fa] text-[#25282d] dark:bg-[#101619] dark:text-[#e9eef0]">
      <div className="h-1 w-full bg-[#27c84a]" />
      <WalletPageHeader active="All Coins" />

      <main className="mx-auto w-full max-w-[1180px] px-4 pb-28 pt-6 sm:px-6 sm:pb-12 sm:pt-9 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#16875a]">
              Discover
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#20252b] sm:text-[30px] dark:text-[#f1f4f5]">
              All Coins
            </h1>
            <p className="mt-1.5 max-w-xl text-sm leading-6 text-[#77808a]">
              Browse and keep track of 50 digital assets in one place.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e4e9e7] bg-white px-3 py-2 text-[10px] font-semibold text-[#68736d] dark:border-[#293238] dark:bg-[#171e23] dark:text-[#c7d0d5]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d9a642]" />
              Illustrative market data
            </span>
            <Link
              href="/send"
              className="hidden h-10 items-center justify-center rounded-full bg-[#075b9d] px-4 text-xs font-semibold text-white transition hover:bg-[#064c82] active:scale-[.98] sm:inline-flex"
            >
              Send funds
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-4">
          {[
            { label: "Listed assets", value: "50", detail: "Browse directory" },
            { label: "Categories", value: "06", detail: "Filter by type" },
            {
              label: "Watchlist",
              value: String(watchlist.length).padStart(2, "0"),
              detail: "Saved on this device",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[#e9ecef] bg-white p-3 shadow-[0_5px_18px_rgba(25,36,50,0.025)] sm:p-5 dark:border-[#293238] dark:bg-[#171e23]"
            >
              <p className="text-[10px] font-medium text-[#89919a] sm:text-xs">
                {item.label}
              </p>
              <p className="mt-1.5 text-xl font-bold tracking-tight text-[#252c32] sm:mt-2 sm:text-2xl dark:text-[#edf1f3]">
                {item.value}
              </p>
              <p className="mt-1 hidden text-[10px] text-[#9aa1a8] sm:block">
                {item.detail}
              </p>
            </div>
          ))}
        </div>

        <section className="mt-5 overflow-hidden rounded-2xl border border-[#e9ecef] bg-white shadow-[0_8px_24px_rgba(25,36,50,0.035)] dark:border-[#293238] dark:bg-[#171e23]">
          <div className="border-b border-[#edf0f2] p-4 sm:p-5 dark:border-[#293238]">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex h-11 min-w-[220px] flex-1 items-center gap-2.5 rounded-xl border border-[#e6eaed] bg-[#fafbfc] px-3.5 transition focus-within:border-[#9dbed3] sm:max-w-[400px] dark:border-[#364149] dark:bg-[#202930]">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-[17px] w-[17px] shrink-0 text-[#7c858d]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <circle cx="10.8" cy="10.8" r="6.8" />
                  <path d="m16 16 4.5 4.5" />
                </svg>
                <input
                  type="search"
                  aria-label="Search coins"
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
                  onChange={(event) => setSort(event.target.value)}
                  className="h-full max-w-[150px] bg-transparent text-xs font-semibold text-[#424b53] outline-none dark:text-[#e2e8eb]"
                >
                  <option value="rank">Market rank</option>
                  <option value="name">Name A–Z</option>
                  <option value="price-high">Price: high to low</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="gainers">Top demo change</option>
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

          <div className="flex items-center justify-between px-4 py-3 sm:px-5">
            <p className="text-xs font-semibold text-[#4a535b] dark:text-[#d9e0e4]">
              {watchlistOnly ? "Your watchlist" : "Coin directory"}
            </p>
            <p className="text-[10px] text-[#9098a0]">
              {filteredCoins.length}{" "}
              {filteredCoins.length === 1 ? "asset" : "assets"}
            </p>
          </div>

          <div className="hidden grid-cols-[52px_minmax(220px,1fr)_minmax(120px,.7fr)_110px_44px] items-center gap-3 border-y border-[#eff1f3] bg-[#fafbfc] px-5 py-3 text-[10px] font-semibold uppercase tracking-[.1em] text-[#969da4] md:grid dark:border-[#293238] dark:bg-[#202930]">
            <span>#</span>
            <span>Asset</span>
            <span>Price</span>
            <span className="text-right">24h change</span>
            <span className="sr-only">Watchlist</span>
          </div>

          <div className="divide-y divide-[#f0f2f3] dark:divide-[#293238]">
            {filteredCoins.map(({ coin, index }, position) => {
              const watching = watchlist.includes(coin.symbol);
              const positive = coin.change >= 0;
              return (
                <div
                  key={coin.symbol}
                  className="group grid min-h-[75px] grid-cols-[minmax(0,1fr)_auto_36px] items-center gap-2 px-3 py-3 transition-colors hover:bg-[#fafcfd] animate-[coin-appear_.36s_cubic-bezier(.2,.8,0,1)_both] sm:gap-3 sm:px-5 md:grid-cols-[52px_minmax(220px,1fr)_minmax(120px,.7fr)_110px_44px] dark:hover:bg-[#1c252a]"
                  style={{ animationDelay: `${Math.min(position, 18) * 22}ms` }}
                >
                  <span className="hidden text-xs font-medium text-[#a0a6ac] md:block">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCoin(coin)}
                    className="flex min-w-0 items-center gap-3 text-left"
                  >
                    <CoinGlyph coin={coin} index={index} />
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[13px] font-semibold text-[#30383f] sm:text-sm dark:text-[#edf1f3]">
                          {coin.name}
                        </span>
                        <span className="hidden rounded-md bg-[#f1f3f5] px-1.5 py-0.5 text-[9px] font-semibold text-[#7c858d] sm:inline dark:bg-[#29343a] dark:text-[#bac4ca]">
                          {coin.category}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-[10px] font-medium tracking-wide text-[#929aa1]">
                        {coin.symbol}
                        <span className="ml-2 sm:hidden">
                          · {coin.category}
                        </span>
                      </span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedCoin(coin)}
                    className="text-right md:text-left"
                  >
                    <span className="block text-[12px] font-semibold tabular-nums text-[#3d454c] sm:text-sm dark:text-[#e4e9ec]">
                      {formatPrice(coin.priceNgn, currency)}
                    </span>
                    <span
                      className={`mt-1 block text-[10px] font-semibold tabular-nums md:hidden ${
                        positive ? "text-[#16875a]" : "text-[#ce5c60]"
                      }`}
                    >
                      {positive ? "+" : ""}
                      {coin.change.toFixed(2)}%
                    </span>
                  </button>

                  <span
                    className={`hidden text-right text-xs font-semibold tabular-nums md:block ${
                      positive ? "text-[#16875a]" : "text-[#ce5c60]"
                    }`}
                  >
                    {positive ? "+" : ""}
                    {coin.change.toFixed(2)}%
                  </span>

                  <button
                    type="button"
                    aria-label={`${watching ? "Remove" : "Add"} ${coin.name} ${watching ? "from" : "to"} watchlist`}
                    aria-pressed={watching}
                    onClick={() => toggleWatchlist(coin.symbol)}
                    className={`grid h-9 w-9 place-items-center rounded-full transition hover:bg-amber-50 active:scale-90 ${
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
            {filteredCoins.length === 0 ? (
              <div className="px-4 py-14 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#f1f4f6] text-[#79858d] dark:bg-[#222c32]">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  >
                    <circle cx="10.8" cy="10.8" r="6.8" />
                    <path d="m16 16 4.5 4.5" />
                  </svg>
                </div>
                <p className="mt-3 text-sm font-semibold text-[#4d565e] dark:text-[#e2e7ea]">
                  No coins found
                </p>
                <p className="mt-1 text-xs text-[#929aa1]">
                  Try another search or category.
                </p>
              </div>
            ) : null}
          </div>

          <div className="border-t border-[#eff1f3] bg-[#fafbfc] px-4 py-3 text-[10px] leading-5 text-[#89929a] sm:px-5 dark:border-[#293238] dark:bg-[#202930] dark:text-[#b6c0c6]">
            Prices and 24-hour changes are illustrative examples, not live
            market data or financial advice. No trading is performed from this
            list.
          </div>
        </section>
      </main>

      {selectedCoin ? (
        <div
          className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-0 backdrop-blur-[2px] sm:place-items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedCoin(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="coin-detail-title"
            className="w-full max-w-md rounded-t-3xl border border-[#e8ecef] bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6 dark:border-[#293238] dark:bg-[#171e23]"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#d8dde1] sm:hidden" />
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <CoinGlyph
                  coin={selectedCoin}
                  index={coins.indexOf(selectedCoin)}
                />
                <div>
                  <h2
                    id="coin-detail-title"
                    className="text-base font-bold text-[#30383f] dark:text-[#edf1f3]"
                  >
                    {selectedCoin.name}
                  </h2>
                  <p className="mt-0.5 text-xs text-[#8d969e]">
                    {selectedCoin.symbol} · {selectedCoin.category}
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close coin details"
                onClick={() => setSelectedCoin(null)}
                className="grid h-9 w-9 place-items-center rounded-full bg-[#f1f3f5] text-[#69737b] hover:bg-[#e8ecee] dark:bg-[#263138] dark:text-[#d2dade]"
              >
                ×
              </button>
            </div>
            <div className="mt-5 rounded-2xl bg-[#f6f8f9] p-4 dark:bg-[#202930]">
              <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#8b949c]">
                Illustrative price
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-[#252c32] dark:text-[#eef2f4]">
                {formatPrice(selectedCoin.priceNgn, currency)}
              </p>
              <p
                className={`mt-1 text-xs font-semibold ${
                  selectedCoin.change >= 0 ? "text-[#16875a]" : "text-[#ce5c60]"
                }`}
              >
                {selectedCoin.change >= 0 ? "+" : ""}
                {selectedCoin.change.toFixed(2)}% sample 24h change
              </p>
            </div>
            <p className="mt-4 text-xs leading-5 text-[#89929a]">
              Market prices are demo values. Trading and live market data are
              not connected yet.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <Link
                href="/send"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[#e1e6e9] text-xs font-semibold text-[#46515a] transition hover:bg-[#f7f8f9] dark:border-[#364149] dark:text-[#d8e0e4] dark:hover:bg-[#202930]"
              >
                Send funds
              </Link>
              <Link
                href="/swap"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-[#075b9d] text-xs font-semibold text-white transition hover:bg-[#064c82]"
              >
                Swap preview
              </Link>
            </div>
          </section>
        </div>
      ) : null}

      <MobileWalletNav active="All Coins" />
      <style jsx>{`
        @keyframes coin-appear {
          from {
            opacity: 0;
            transform: translateY(7px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
