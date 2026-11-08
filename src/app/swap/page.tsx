"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  DesktopWalletNav,
  MobileWalletNav,
} from "../_components/WalletNavigation";

const tokens = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    priceNgn: 91_305_895.85,
    color: "bg-[#f7931a]",
    mark: "₿",
    balance: "0.0000",
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    priceNgn: 3_246_820,
    color: "bg-[#5366bd]",
    mark: "◆",
    balance: "0.0000",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    priceNgn: 1_498,
    color: "bg-[#2775ca]",
    mark: "$",
    balance: "0.00",
  },
  {
    symbol: "SOL",
    name: "Solana",
    priceNgn: 218_460.5,
    color: "bg-[#28233e]",
    mark: "≋",
    balance: "0.0000",
  },
  {
    symbol: "ADA",
    name: "Cardano",
    priceNgn: 1_042.48,
    color: "bg-[#2869db]",
    mark: "⠿",
    balance: "0.00",
  },
] as const;

type TokenSymbol = (typeof tokens)[number]["symbol"];

function SwapIcon({
  name,
  className = "h-5 w-5",
}: {
  name: string;
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
    case "swap":
      return (
        <svg {...props}>
          <path d="M4 7h14m0 0-3-3m3 3-3 3M20 17H6m0 0 3-3m-3 3 3 3" />
        </svg>
      );
    case "settings":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="m19.4 15 .1.1a1.8 1.8 0 0 1-2.5 2.5l-.1-.1a1.8 1.8 0 0 0-3 .9v.2a1.8 1.8 0 0 1-3.6 0v-.2a1.8 1.8 0 0 0-3-.9l-.1.1a1.8 1.8 0 0 1-2.5-2.5l.1-.1a1.8 1.8 0 0 0-.9-3h-.2a1.8 1.8 0 0 1 0-3.6h.2a1.8 1.8 0 0 0 .9-3l-.1-.1a1.8 1.8 0 0 1 2.5-2.5l.1.1a1.8 1.8 0 0 0 3-.9v-.2a1.8 1.8 0 0 1 3.6 0v.2a1.8 1.8 0 0 0 3 .9l.1-.1a1.8 1.8 0 0 1 2.5 2.5l-.1.1a1.8 1.8 0 0 0 .9 3h.2a1.8 1.8 0 0 1 0 3.6h-.2a1.8 1.8 0 0 0-.9 3Z" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...props}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );
    case "clock":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    default:
      return null;
  }
}

function TokenBadge({ symbol }: { symbol: TokenSymbol }) {
  const token = tokens.find((item) => item.symbol === symbol)!;
  return (
    <span
      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-[15px] font-bold text-white sm:h-9 sm:w-9 sm:text-[17px] ${token.color}`}
    >
      {token.mark}
    </span>
  );
}

function formatAmount(value: number, maximumFractionDigits = 8) {
  if (!Number.isFinite(value) || value <= 0) return "0";
  return new Intl.NumberFormat("en", {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(value);
}

export default function SwapPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);
  const [fromSymbol, setFromSymbol] = useState<TokenSymbol>("ETH");
  const [toSymbol, setToSymbol] = useState<TokenSymbol>("BTC");
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [customSlippage, setCustomSlippage] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

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

  const fromToken = tokens.find((token) => token.symbol === fromSymbol)!;
  const toToken = tokens.find((token) => token.symbol === toSymbol)!;
  const parsedAmount = Number(amount);
  const receiveAmount =
    Number.isFinite(parsedAmount) && parsedAmount > 0
      ? (parsedAmount * fromToken.priceNgn) / toToken.priceNgn
      : 0;
  const receiveValueNgn = receiveAmount * toToken.priceNgn;
  const exchangeRate = fromToken.priceNgn / toToken.priceNgn;
  const amountError =
    amount.trim() !== "" &&
    (!Number.isFinite(parsedAmount) || parsedAmount < 0);
  const canReview =
    amount.trim() !== "" &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    fromSymbol !== toSymbol;

  const fromFiatValue = useMemo(
    () =>
      Number.isFinite(parsedAmount) && parsedAmount > 0
        ? new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 2,
          }).format(parsedAmount * fromToken.priceNgn)
        : "₦0.00",
    [parsedAmount, fromToken.priceNgn],
  );

  const userName =
    user?.displayName || user?.email?.split("@")[0] || "Quilox member";

  async function handleSignOut() {
    await signOut(auth);
    router.replace("/login");
  }

  function selectFrom(value: string) {
    const next = value as TokenSymbol;
    setFromSymbol(next);
    if (next === toSymbol) setToSymbol(fromSymbol);
  }

  function selectTo(value: string) {
    const next = value as TokenSymbol;
    setToSymbol(next);
    if (next === fromSymbol) setFromSymbol(toSymbol);
  }

  function reversePair() {
    setFromSymbol(toSymbol);
    setToSymbol(fromSymbol);
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
      <header className="sticky top-0 z-30 border-b border-[#eceef1] bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-2 px-3 sm:h-[60px] sm:gap-3 sm:px-6 lg:px-10">
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-2 text-[17px] font-bold tracking-tight text-[#111820] sm:text-xl"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#071720] text-white">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-[18px] w-[18px]"
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
          <DesktopWalletNav active="Swap" />
          <div className="relative shrink-0">
            <button
              type="button"
              aria-label="Open account menu"
              aria-expanded={accountMenuOpen}
              onClick={() => setAccountMenuOpen((open) => !open)}
              className="flex h-9 items-center gap-2 rounded-full border border-[#e6e9ec] px-2.5 text-xs font-semibold text-[#454c53] transition hover:bg-[#f7f8fa] sm:px-3"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#e6f4ec] text-[11px] font-bold text-[#188453]">
                {userName.slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden max-w-32 truncate sm:block">
                {userName}
              </span>
            </button>
            {accountMenuOpen ? (
              <div className="absolute right-0 top-11 z-50 w-64 rounded-2xl border border-[#e8eaee] bg-white p-4 shadow-xl">
                <p className="truncate text-sm font-semibold">{userName}</p>
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
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1180px] px-3 pb-28 pt-5 sm:px-6 sm:pb-12 sm:pt-9 lg:px-10">
        <div className="mb-4 sm:mb-6">
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#16875a]">
            Trade
          </p>
          <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#20252b] sm:text-[30px]">
                Swap assets
              </h1>
              <p className="mt-1.5 text-sm leading-6 text-[#77808a]">
                Preview an asset conversion using illustrative market prices.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#e4e9e7] bg-white px-3 py-2 text-[10px] font-semibold text-[#68736d]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d9a642]" />
              Preview mode
            </span>
          </div>
        </div>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <section className="rounded-2xl border border-[#e9ecef] bg-white p-3 shadow-[0_8px_24px_rgba(25,36,50,0.04)] sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#30363d] sm:text-base">
                  Convert
                </h2>
                <p className="mt-1 text-[10px] text-[#9298a0] sm:text-[11px]">
                  Choose the assets and amount
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-[#e9ecef] bg-[#fafbfc] p-3.5 sm:mt-5 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="swap-amount"
                  className="text-xs font-medium text-[#7c858e]"
                >
                  You pay
                </label>
                <span className="max-w-[55%] truncate text-right text-[9px] text-[#9aa1a8] sm:text-[10px]">
                  Balance: {fromToken.balance} {fromToken.symbol}
                </span>
              </div>
              <div className="mt-2 flex min-w-0 items-center gap-2 sm:gap-3">
                <input
                  id="swap-amount"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  aria-invalid={Boolean(amountError)}
                  className="min-w-0 flex-1 bg-transparent text-2xl font-semibold tracking-tight text-[#252b31] outline-none placeholder:text-[#c1c6ca] sm:text-[34px]"
                  placeholder="0.00"
                />
                <div className="relative flex shrink-0 items-center gap-1.5 rounded-full border border-[#e5e8eb] bg-white py-1 pl-1.5 pr-2.5 shadow-sm sm:gap-2 sm:py-1.5 sm:pl-2 sm:pr-3">
                  <TokenBadge symbol={fromSymbol} />
                  <select
                    aria-label="Asset to pay"
                    value={fromSymbol}
                    onChange={(event) => selectFrom(event.target.value)}
                    className="max-w-[56px] appearance-none bg-transparent pr-3 text-[13px] font-bold text-[#323941] outline-none sm:max-w-[72px] sm:pr-4 sm:text-sm"
                  >
                    {tokens.map((token) => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-2 text-[9px] text-[#7c858d]">
                    ▼
                  </span>
                </div>
              </div>
              <p className="mt-1 text-[11px] text-[#8e969e]">
                ≈ {fromFiatValue} · sample value
              </p>
              {amountError ? (
                <p className="mt-2 text-xs font-medium text-[#c34f53]">
                  Enter a valid amount greater than zero.
                </p>
              ) : null}
            </div>

            <div className="relative z-10 -my-3 flex justify-center">
              <button
                type="button"
                aria-label="Reverse assets"
                onClick={reversePair}
                className="grid h-9 w-9 place-items-center rounded-xl border-[3px] border-white bg-[#eef5f9] text-[#075b9d] shadow-sm transition hover:bg-[#e1eff8] active:scale-95"
              >
                <SwapIcon name="swap" className="h-4 w-4 rotate-90" />
              </button>
            </div>

            <div className="rounded-2xl border border-[#e9ecef] bg-[#fafbfc] p-3.5 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="swap-receive"
                  className="text-xs font-medium text-[#7c858e]"
                >
                  You receive (estimated)
                </label>
                <span className="max-w-[55%] truncate text-right text-[9px] text-[#9aa1a8] sm:text-[10px]">
                  Balance: {toToken.balance} {toToken.symbol}
                </span>
              </div>
              <div className="mt-2 flex min-w-0 items-center gap-2 sm:gap-3">
                <input
                  id="swap-receive"
                  type="text"
                  readOnly
                  value={formatAmount(receiveAmount, 6)}
                  className="min-w-0 flex-1 bg-transparent text-2xl font-semibold tracking-tight text-[#252b31] outline-none sm:text-[34px]"
                />
                <div className="relative flex shrink-0 items-center gap-1.5 rounded-full border border-[#e5e8eb] bg-white py-1 pl-1.5 pr-2.5 shadow-sm sm:gap-2 sm:py-1.5 sm:pl-2 sm:pr-3">
                  <TokenBadge symbol={toSymbol} />
                  <select
                    aria-label="Asset to receive"
                    value={toSymbol}
                    onChange={(event) => selectTo(event.target.value)}
                    className="max-w-[56px] appearance-none bg-transparent pr-3 text-[13px] font-bold text-[#323941] outline-none sm:max-w-[72px] sm:pr-4 sm:text-sm"
                  >
                    {tokens.map((token) => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-2 text-[9px] text-[#7c858d]">
                    ▼
                  </span>
                </div>
              </div>
              <p className="mt-1 text-[11px] text-[#8e969e]">
                ≈{" "}
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                  maximumFractionDigits: 2,
                }).format(receiveValueNgn || 0)}{" "}
                · sample value
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold text-[#48515a]">
                  Slippage tolerance
                </p>
                <p className="mt-1 text-[10px] leading-4 text-[#9299a0]">
                  Maximum price movement for an exchange
                </p>
              </div>
              <div className="grid w-full max-w-[280px] grid-cols-4 gap-1 rounded-xl bg-[#f3f5f6] p-1 sm:flex sm:w-auto">
                {["0.5", "1.0", "2.0"].map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={!customSlippage && slippage === value}
                    onClick={() => {
                      setSlippage(value);
                      setCustomSlippage(false);
                    }}
                    className={`rounded-lg px-1 py-2 text-[10px] font-semibold transition sm:px-2.5 sm:py-1.5 ${
                      !customSlippage && slippage === value
                        ? "bg-white text-[#075b9d] shadow-sm"
                        : "text-[#707981] hover:text-[#30373e]"
                    }`}
                  >
                    {value}%
                  </button>
                ))}
                <button
                  type="button"
                  aria-pressed={customSlippage}
                  onClick={() => {
                    setSlippage("3.0");
                    setCustomSlippage(true);
                  }}
                  className={`rounded-lg px-1 py-2 text-[10px] font-semibold transition sm:px-2.5 sm:py-1.5 ${
                    customSlippage
                      ? "bg-white text-[#075b9d] shadow-sm"
                      : "text-[#707981] hover:text-[#30373e]"
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>
            {customSlippage ? (
              <label className="mt-3 flex items-center gap-2 text-xs text-[#737c84]">
                Custom tolerance
                <input
                  type="number"
                  min="0.1"
                  max="50"
                  step="0.1"
                  value={slippage}
                  onChange={(event) => setSlippage(event.target.value)}
                  className="h-9 w-24 rounded-lg border border-[#e3e7ea] bg-white px-3 text-sm font-semibold text-[#333b42] outline-none focus:border-[#7eabc7]"
                />
                %
              </label>
            ) : null}

            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-[#e8edf0] bg-[#f7fafb] p-3.5">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white text-[11px] font-bold text-[#6d7d87]">
                i
              </span>
              <p className="text-[11px] leading-5 text-[#79838b]">
                Rates are illustrative only. No assets will be exchanged and
                this preview does not connect to a trading provider.
              </p>
            </div>

            <button
              type="button"
              disabled={!canReview}
              onClick={() => setReviewOpen(true)}
              className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-[#075b9d] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#064c82] disabled:cursor-not-allowed disabled:bg-[#aabac5] active:scale-[.99]"
            >
              Review swap
            </button>
          </section>

          <aside className="space-y-4 sm:space-y-5">
            <section className="rounded-2xl border border-[#e9ecef] bg-white p-4 shadow-[0_8px_24px_rgba(25,36,50,0.035)] sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#30363d]">
                  Exchange details
                </h2>
                <span className="rounded-full bg-[#fff5df] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.1em] text-[#a57313]">
                  Estimate
                </span>
              </div>
              <div className="mt-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs text-[#8a929a]">Exchange rate</span>
                  <span className="text-right text-xs font-semibold text-[#414951]">
                    1 {fromSymbol} ≈ {formatAmount(exchangeRate, 6)} {toSymbol}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs text-[#8a929a]">Price source</span>
                  <span className="text-right text-xs font-semibold text-[#414951]">
                    Sample market values
                  </span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs text-[#8a929a]">Slippage</span>
                  <span className="text-right text-xs font-semibold text-[#414951]">
                    {slippage || "0"}%
                  </span>
                </div>
                <div className="border-t border-[#eff1f3] pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-xs text-[#8a929a]">
                      Estimated receive value
                    </span>
                    <span className="text-right text-xs font-bold text-[#30383f]">
                      {new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: "NGN",
                        maximumFractionDigits: 2,
                      }).format(receiveValueNgn || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl bg-[#0b2630] p-4 text-white shadow-[0_10px_26px_rgba(9,39,49,.13)] sm:p-6">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-[#88d8b2]">
                  <SwapIcon name="clock" className="h-[17px] w-[17px]" />
                </span>
                <h2 className="text-sm font-bold">Swap activity</h2>
              </div>
              <div className="mt-5 rounded-xl border border-white/10 bg-white/[.04] px-4 py-5">
                <p className="text-xs font-semibold text-white/85">
                  No swaps yet
                </p>
                <p className="mt-1.5 text-[11px] leading-5 text-white/55">
                  When exchange services are connected, your completed swaps
                  will appear here.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#a6e3c5] transition hover:text-white"
              >
                Return to wallet
                <SwapIcon name="chevron" className="h-3.5 w-3.5" />
              </Link>
            </section>
          </aside>
        </div>
      </main>

      {reviewOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-0 backdrop-blur-[2px] sm:place-items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setReviewOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="swap-review-title"
            className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#d8dde1] sm:hidden" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="swap-review-title"
                  className="text-lg font-bold text-[#252c32]"
                >
                  Review your swap
                </h2>
                <p className="mt-1 text-xs text-[#899199]">
                  This is a non-transactional preview.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close review"
                onClick={() => setReviewOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-[#f2f4f5] text-[#69727a] hover:bg-[#e8ecee]"
              >
                ×
              </button>
            </div>
            <div className="mt-5 rounded-2xl bg-[#f7f9fa] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-[#858d95]">You pay</span>
                <span className="text-sm font-bold text-[#303840]">
                  {formatAmount(parsedAmount)} {fromSymbol}
                </span>
              </div>
              <div className="my-3 border-t border-[#e8ecee]" />
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-[#858d95]">
                  Estimated receive
                </span>
                <span className="text-sm font-bold text-[#16875a]">
                  {formatAmount(receiveAmount)} {toSymbol}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs text-[#858d95]">
                  Slippage tolerance
                </span>
                <span className="text-xs font-semibold text-[#424a52]">
                  {slippage}%
                </span>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-[#f1e5c9] bg-[#fffaf0] p-3 text-[11px] leading-5 text-[#8a6d30]">
              Exchanges are not connected yet. No assets will move if you close
              this preview.
            </div>
            <button
              type="button"
              onClick={() => setReviewOpen(false)}
              className="mt-5 h-11 w-full rounded-full bg-[#075b9d] text-sm font-bold text-white transition hover:bg-[#064c82] active:scale-[.99]"
            >
              Done
            </button>
          </section>
        </div>
      ) : null}

      <MobileWalletNav active="Swap" />
    </div>
  );
}
