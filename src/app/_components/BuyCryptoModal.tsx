"use client";

import Image from "next/image";
import Script from "next/script";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { WalletConnection } from "./WalletConnectModal";
import type { MarketCoin } from "@/lib/market";
import type { WalletCurrency } from "@/lib/wallet-preferences";

type ProviderCurrency = {
  type: string;
  code: string;
  name: string;
  networkCode: string;
  minBuyAmount: number | null;
  maxBuyAmount: number | null;
};

type MoonPayQuote = {
  baseCurrencyCode: string;
  baseCurrencyAmount: number;
  quoteCurrencyCode: string;
  quoteCurrencyAmount: number;
  quoteCurrencyPrice: number | null;
  paymentMethod: string | null;
  feeAmount: number | null;
  networkFeeAmount: number | null;
  totalAmount: number | null;
  expiresAt: string | null;
};

type MoonPayWidget = {
  show: () => void;
  generateUrlForSigning: () => string;
  updateSignature: (signature: string) => void;
};

type MoonPayOptions = {
  flow: "buy";
  environment: "sandbox" | "production";
  variant: "overlay";
  params: Record<string, string>;
  handlers: {
    onTransactionCompleted: (details: unknown) => void;
    onCloseOverlay: () => void;
  };
};

declare global {
  interface Window {
    MoonPayWebSdk?: {
      init: (options: MoonPayOptions) => MoonPayWidget | null;
    };
  }
}

const moonPayScript =
  "https://static.moonpay.com/web-sdk/v1/moonpay-web-sdk.min.js";

const eip155ChainByMoonPayNetwork: Record<string, string> = {
  ethereum: "0x1",
  eth: "0x1",
  base: "0x2105",
  polygon: "0x89",
  pol_polygon: "0x89",
  bsc: "0x38",
  bnb_bsc: "0x38",
  arbitrum: "0xa4b1",
};

function formatFiatAmount(value: number, currency: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency.toUpperCase()}`;
  }
}

function formatCryptoAmount(value: number) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 8,
  }).format(value);
}

function formatNetworkName(networkCode: string) {
  if (!networkCode) return "Network selected by MoonPay";
  return networkCode
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function BuyCryptoModal({
  open,
  onClose,
  currency,
  coins,
  walletConnection,
  onPurchaseCompleted,
}: {
  open: boolean;
  onClose: () => void;
  currency: WalletCurrency;
  coins: MarketCoin[];
  walletConnection: WalletConnection | null;
  onPurchaseCompleted: () => void;
}) {
  const [currencies, setCurrencies] = useState<ProviderCurrency[]>([]);
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState("");
  const [selectedFiatCode, setSelectedFiatCode] = useState(
    currency.toLowerCase(),
  );
  const [amount, setAmount] = useState("100");
  const [quote, setQuote] = useState<MoonPayQuote | null>(null);
  const [loadingCurrencies, setLoadingCurrencies] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState("");
  const [sdkLoadError, setSdkLoadError] = useState("");
  const [useConnectedWallet, setUseConnectedWallet] = useState(true);
  const [walletPrefillUnavailable, setWalletPrefillUnavailable] =
    useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  const cryptoCurrencies = useMemo(
    () => currencies.filter((item) => item.type === "crypto"),
    [currencies],
  );
  const fiatCurrencies = useMemo(
    () => currencies.filter((item) => item.type === "fiat"),
    [currencies],
  );
  const selectedCrypto = cryptoCurrencies.find(
    (item) => item.code === selectedCurrencyCode,
  );
  const compatibleChainId = selectedCrypto
    ? eip155ChainByMoonPayNetwork[selectedCrypto.networkCode.toLowerCase()]
    : undefined;
  const compatibleWallet =
    Boolean(walletConnection) &&
    Boolean(compatibleChainId) &&
    walletConnection?.chainId.toLowerCase() === compatibleChainId &&
    /^0x[a-f0-9]{40}$/i.test(walletConnection?.address ?? "");
  const selectedMarketCoin = useMemo(() => {
    if (!selectedCrypto) return undefined;
    const currencySymbol = selectedCrypto.code.split("_")[0].toLowerCase();
    return coins.find(
      (coin) =>
        coin.symbol.toLowerCase() === currencySymbol ||
        coin.name.toLowerCase() === selectedCrypto.name.toLowerCase(),
    );
  }, [coins, selectedCrypto]);
  const apiKey = process.env.NEXT_PUBLIC_MOONPAY_API_KEY ?? "";
  const environment =
    process.env.NEXT_PUBLIC_MOONPAY_ENVIRONMENT === "production"
      ? "production"
      : "sandbox";

  const closeModal = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeModal, open]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoadingCurrencies(true);
    setError("");
    fetch("/api/onramp/moonpay/currencies", { signal: controller.signal })
      .then(async (response) => {
        const payload = (await response.json()) as
          | { currencies: ProviderCurrency[] }
          | { error?: string };
        if (!response.ok || !("currencies" in payload)) {
          throw new Error(
            "error" in payload
              ? payload.error
              : "MoonPay currencies are temporarily unavailable.",
          );
        }
        setCurrencies(payload.currencies);
      })
      .catch((loadError: unknown) => {
        if (
          loadError instanceof DOMException &&
          loadError.name === "AbortError"
        ) {
          return;
        }
        setError(
          loadError instanceof Error
            ? loadError.message
            : "MoonPay currencies are temporarily unavailable.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingCurrencies(false);
      });
    return () => controller.abort();
  }, [open]);

  useEffect(() => {
    if (!cryptoCurrencies.length) return;
    if (
      selectedCurrencyCode &&
      cryptoCurrencies.some((item) => item.code === selectedCurrencyCode)
    ) {
      return;
    }
    const preferred =
      cryptoCurrencies.find((item) => item.code === "btc") ??
      cryptoCurrencies.find((item) => item.code === "eth") ??
      cryptoCurrencies[0];
    setSelectedCurrencyCode(preferred.code);
  }, [cryptoCurrencies, selectedCurrencyCode]);

  useEffect(() => {
    if (!fiatCurrencies.length) return;
    if (fiatCurrencies.some((item) => item.code === currency.toLowerCase())) {
      setSelectedFiatCode(currency.toLowerCase());
      return;
    }
    if (!fiatCurrencies.some((item) => item.code === selectedFiatCode)) {
      const preferred =
        fiatCurrencies.find((item) => item.code === "usd") ?? fiatCurrencies[0];
      setSelectedFiatCode(preferred.code);
    }
  }, [currency, fiatCurrencies, selectedFiatCode]);

  useEffect(() => {
    if (!open || !selectedCrypto || !selectedFiatCode) return;
    const numericAmount = Number(amount);
    if (
      !Number.isFinite(numericAmount) ||
      numericAmount < 20 ||
      numericAmount > 10000
    ) {
      setQuote(null);
      setLoadingQuote(false);
      setError(
        "MoonPay quotes are available for amounts between 20 and 10,000.",
      );
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoadingQuote(true);
      setQuote(null);
      setError("");
      try {
        const response = await fetch("/api/onramp/moonpay/quote", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            currencyCode: selectedCrypto.code,
            baseCurrencyCode: selectedFiatCode,
            baseCurrencyAmount: numericAmount,
          }),
          signal: controller.signal,
        });
        const payload = (await response.json()) as
          | { quote: MoonPayQuote }
          | { error?: string };
        if (!response.ok || !("quote" in payload)) {
          throw new Error(
            "error" in payload
              ? payload.error
              : "MoonPay could not provide a quote.",
          );
        }
        setQuote(payload.quote);
      } catch (quoteError) {
        if (
          quoteError instanceof DOMException &&
          quoteError.name === "AbortError"
        ) {
          return;
        }
        setError(
          quoteError instanceof Error
            ? quoteError.message
            : "MoonPay could not provide a quote.",
        );
      } finally {
        if (!controller.signal.aborted) setLoadingQuote(false);
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [amount, open, selectedCrypto, selectedFiatCode]);

  async function launchCheckout(withWalletAddress: boolean) {
    if (!selectedCrypto || !apiKey || !quote) return;
    const moonPay = window.MoonPayWebSdk;
    if (!sdkReady || !moonPay) {
      setError(
        "Secure checkout is still loading. Please try again in a moment.",
      );
      return;
    }

    setCheckingOut(true);
    setError("");
    setWalletPrefillUnavailable(false);
    try {
      const params: Record<string, string> = {
        apiKey,
        baseCurrencyCode: selectedFiatCode,
        baseCurrencyAmount: String(quote.baseCurrencyAmount),
        currencyCode: selectedCrypto.code,
      };
      if (withWalletAddress && compatibleWallet && walletConnection?.address) {
        params.walletAddress = walletConnection.address;
      }

      const widget = moonPay.init({
        flow: "buy",
        environment,
        variant: "overlay",
        params,
        handlers: {
          onTransactionCompleted: () => {
            onPurchaseCompleted();
            closeModal();
          },
          onCloseOverlay: () => {},
        },
      });
      if (!widget) throw new Error("MoonPay could not start checkout.");

      if (params.walletAddress) {
        const signedUrl = widget.generateUrlForSigning();
        const response = await fetch("/api/onramp/moonpay/sign", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ urlForSignature: signedUrl }),
        });
        const payload = (await response.json()) as
          | { signature: string }
          | { error?: string };
        if (!response.ok || !("signature" in payload)) {
          setWalletPrefillUnavailable(true);
          throw new Error(
            "Wallet address signing is not configured. You can continue and enter your receiving address securely in MoonPay.",
          );
        }
        widget.updateSignature(payload.signature);
      }

      widget.show();
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "MoonPay could not open checkout. Please try again.",
      );
    } finally {
      setCheckingOut(false);
    }
  }

  if (!open) {
    return (
      <Script
        src={moonPayScript}
        strategy="afterInteractive"
        onLoad={() => setSdkReady(true)}
        onError={() =>
          setSdkLoadError(
            "MoonPay secure checkout could not load. Check your connection and try again.",
          )
        }
      />
    );
  }

  const fiatName =
    fiatCurrencies.find((item) => item.code === selectedFiatCode)?.name ??
    selectedFiatCode.toUpperCase();

  return (
    <>
      <Script
        src={moonPayScript}
        strategy="afterInteractive"
        onLoad={() => {
          setSdkReady(true);
          setSdkLoadError("");
        }}
        onError={() =>
          setSdkLoadError(
            "MoonPay secure checkout could not load. Check your connection and try again.",
          )
        }
      />
      <div
        className="fixed inset-0 z-[80] flex items-end justify-center bg-[#07131a]/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeModal();
        }}
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="buy-crypto-title"
          className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[26px] border border-white/60 bg-white p-5 shadow-2xl sm:rounded-[26px] sm:p-7 dark:border-[#344149] dark:bg-[#171e23]"
        >
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#dfe4e7] sm:hidden" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#16875a]">
                Secure checkout · MoonPay
              </p>
              <h2
                id="buy-crypto-title"
                className="mt-1 text-xl font-bold tracking-tight text-[#273139] dark:text-white"
              >
                Buy crypto
              </h2>
              <p className="mt-1.5 text-xs leading-5 text-[#77828a] dark:text-[#aebac0]">
                Review a live provider quote, then complete payment in MoonPay’s
                secure checkout.
              </p>
            </div>
            <button
              type="button"
              aria-label="Close buy crypto"
              onClick={closeModal}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f1f4f5] text-lg text-[#68737b] transition hover:bg-[#e7ecee] active:scale-95 dark:bg-[#29343a] dark:text-[#d0d8dc]"
            >
              ×
            </button>
          </div>

          {loadingCurrencies ? (
            <div className="mt-5 rounded-2xl bg-[#f6f8f9] px-4 py-8 text-center text-xs text-[#7f8a91] dark:bg-[#202930]">
              Loading MoonPay-supported currencies…
            </div>
          ) : currencies.length ? (
            <>
              <div className="mt-5 grid grid-cols-[minmax(0,1fr)_125px] gap-2.5">
                <label className="text-[10px] font-semibold text-[#758189]">
                  You pay
                  <span className="mt-1.5 flex h-12 overflow-hidden rounded-xl border border-[#e1e7e9] bg-white focus-within:border-[#7fb3ce] dark:border-[#3a474f] dark:bg-[#182126]">
                    <input
                      aria-label="Purchase amount"
                      type="number"
                      min="20"
                      max="10000"
                      step="1"
                      inputMode="decimal"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      className="min-w-0 flex-1 bg-transparent px-3 text-base font-semibold tabular-nums text-[#303a41] outline-none dark:text-[#edf1f3]"
                    />
                  </span>
                </label>
                <label className="text-[10px] font-semibold text-[#758189]">
                  Currency
                  <select
                    aria-label="Payment currency"
                    value={selectedFiatCode}
                    onChange={(event) =>
                      setSelectedFiatCode(event.target.value)
                    }
                    className="mt-1.5 h-12 w-full rounded-xl border border-[#e1e7e9] bg-white px-2 text-xs font-semibold uppercase text-[#3e4a51] outline-none focus:border-[#7fb3ce] dark:border-[#3a474f] dark:bg-[#182126] dark:text-[#e0e6e9]"
                  >
                    {fiatCurrencies.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.code.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="mt-3 block text-[10px] font-semibold text-[#758189]">
                You receive
                <select
                  aria-label="Cryptocurrency to buy"
                  value={selectedCurrencyCode}
                  onChange={(event) =>
                    setSelectedCurrencyCode(event.target.value)
                  }
                  className="mt-1.5 h-12 w-full rounded-xl border border-[#e1e7e9] bg-white px-3 text-sm font-semibold text-[#3e4a51] outline-none focus:border-[#7fb3ce] dark:border-[#3a474f] dark:bg-[#182126] dark:text-[#e0e6e9]"
                >
                  {cryptoCurrencies.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.name}
                      {item.networkCode
                        ? ` · ${formatNetworkName(item.networkCode)}`
                        : ""}
                    </option>
                  ))}
                </select>
              </label>

              {selectedCrypto ? (
                <div className="mt-3 flex items-center gap-3 rounded-xl bg-[#f6f8f9] p-3 dark:bg-[#202930]">
                  {selectedMarketCoin?.image ? (
                    <Image
                      src={selectedMarketCoin.image}
                      alt=""
                      width={34}
                      height={34}
                      unoptimized
                      className="h-[34px] w-[34px] rounded-full"
                    />
                  ) : (
                    <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-[#e7eff4] text-[10px] font-bold uppercase text-[#466274] dark:bg-[#2b3c45] dark:text-[#d5e0e5]">
                      {selectedCrypto.code.slice(0, 3)}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-[#3e4a51] dark:text-[#e0e6e9]">
                      {selectedCrypto.name}
                    </p>
                    <p className="mt-0.5 text-[10px] text-[#87929a]">
                      {formatNetworkName(selectedCrypto.networkCode)}
                    </p>
                  </div>
                </div>
              ) : null}

              {compatibleWallet && walletConnection ? (
                <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-xl border border-[#dcebe2] bg-[#f4faf6] p-3 dark:border-[#30483a] dark:bg-[#1d2a23]">
                  <input
                    type="checkbox"
                    checked={useConnectedWallet}
                    onChange={(event) =>
                      setUseConnectedWallet(event.target.checked)
                    }
                    className="mt-0.5 accent-[#16875a]"
                  />
                  <span className="min-w-0">
                    <span className="block text-[11px] font-semibold text-[#3d5b49] dark:text-[#c5e0cf]">
                      Send to my connected {walletConnection.chainName} wallet
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-[10px] text-[#778c7e]">
                      {walletConnection.address}
                    </span>
                  </span>
                </label>
              ) : walletConnection ? (
                <p className="mt-3 rounded-xl border border-[#e9e6da] bg-[#fbfaf4] px-3 py-2.5 text-[10px] leading-5 text-[#82794f] dark:border-[#49432e] dark:bg-[#28261e]">
                  Your connected wallet is on {walletConnection.chainName}, but
                  this asset uses{" "}
                  {formatNetworkName(selectedCrypto?.networkCode ?? "")}.
                  MoonPay will ask you to confirm a compatible receiving
                  address.
                </p>
              ) : (
                <p className="mt-3 rounded-xl bg-[#f6f8f9] px-3 py-2.5 text-[10px] leading-5 text-[#7f8a91] dark:bg-[#202930]">
                  MoonPay will ask you to enter and confirm a receiving wallet
                  address in its secure checkout.
                </p>
              )}

              <div className="mt-3 rounded-2xl border border-[#e5ebed] bg-white p-3.5 dark:border-[#344149] dark:bg-[#1b2429]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-[#7f8a91]">
                    Estimated crypto
                  </span>
                  <span className="text-xs font-semibold tabular-nums text-[#3d4850] dark:text-[#e0e6e9]">
                    {loadingQuote
                      ? "Updating quote…"
                      : quote
                        ? `${formatCryptoAmount(quote.quoteCurrencyAmount)} ${quote.quoteCurrencyCode.toUpperCase()}`
                        : "—"}
                  </span>
                </div>
                {quote ? (
                  <>
                    <div className="mt-2.5 flex items-center justify-between gap-3">
                      <span className="text-[11px] text-[#7f8a91]">
                        MoonPay fee
                      </span>
                      <span className="text-[11px] font-medium tabular-nums text-[#5c6870] dark:text-[#ccd5d9]">
                        {quote.feeAmount == null
                          ? "Shown at checkout"
                          : formatFiatAmount(quote.feeAmount, selectedFiatCode)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-[11px] text-[#7f8a91]">
                        Network fee
                      </span>
                      <span className="text-[11px] font-medium tabular-nums text-[#5c6870] dark:text-[#ccd5d9]">
                        {quote.networkFeeAmount == null
                          ? "Shown at checkout"
                          : formatFiatAmount(
                              quote.networkFeeAmount,
                              selectedFiatCode,
                            )}
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-center justify-between border-t border-[#edf0f1] pt-2.5 dark:border-[#344149]">
                      <span className="text-[11px] font-semibold text-[#59656d] dark:text-[#d3dbe0]">
                        Estimated total
                      </span>
                      <span className="text-xs font-bold tabular-nums text-[#303a41] dark:text-[#f0f3f4]">
                        {quote.totalAmount == null
                          ? formatFiatAmount(
                              quote.baseCurrencyAmount,
                              selectedFiatCode,
                            )
                          : formatFiatAmount(
                              quote.totalAmount,
                              selectedFiatCode,
                            )}
                      </span>
                    </div>
                    <p className="mt-2 text-[9px] text-[#9aa3a8]">
                      Provider quote · {fiatName}
                      {quote.expiresAt
                        ? ` · Expires ${new Date(quote.expiresAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
                        : ""}
                    </p>
                  </>
                ) : null}
              </div>

              {error || sdkLoadError ? (
                <div
                  role="alert"
                  className="mt-3 rounded-xl border border-[#f0d8cf] bg-[#fff8f5] px-3 py-2.5 text-[11px] leading-5 text-[#955340]"
                >
                  {error || sdkLoadError}
                </div>
              ) : null}

              {walletPrefillUnavailable ? (
                <button
                  type="button"
                  onClick={() => void launchCheckout(false)}
                  disabled={checkingOut}
                  className="mt-3 w-full rounded-xl border border-[#dce4e7] py-2.5 text-xs font-semibold text-[#52616a] transition hover:bg-[#f5f7f8] disabled:opacity-60 dark:border-[#3a474f] dark:text-[#d4dde1]"
                >
                  Continue without wallet prefill
                </button>
              ) : null}

              <button
                type="button"
                disabled={
                  !quote ||
                  loadingQuote ||
                  checkingOut ||
                  !apiKey ||
                  !sdkReady ||
                  Boolean(sdkLoadError)
                }
                onClick={() =>
                  void launchCheckout(
                    Boolean(compatibleWallet && useConnectedWallet),
                  )
                }
                className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#075b9d] px-4 text-sm font-semibold text-white shadow-[0_5px_14px_rgba(7,91,157,.2)] transition hover:bg-[#064c82] active:scale-[.99] disabled:cursor-not-allowed disabled:bg-[#a8b9c4] disabled:shadow-none"
              >
                {checkingOut
                  ? "Opening secure checkout…"
                  : loadingQuote
                    ? "Getting live quote…"
                    : sdkLoadError
                      ? "Checkout unavailable"
                      : !sdkReady
                        ? "Loading MoonPay…"
                        : "Continue to MoonPay"}
              </button>
              {environment === "sandbox" ? (
                <p className="mt-2 text-center text-[10px] font-semibold text-[#98712d]">
                  Sandbox checkout · test mode only
                </p>
              ) : null}
            </>
          ) : !loadingCurrencies && !error ? (
            <div className="mt-5 rounded-2xl bg-[#f6f8f9] px-4 py-8 text-center text-xs text-[#7f8a91] dark:bg-[#202930]">
              MoonPay has no supported currencies available for this account.
            </div>
          ) : error ? (
            <div
              role="alert"
              className="mt-5 rounded-2xl border border-[#f0d8cf] bg-[#fff8f5] px-4 py-4 text-xs leading-5 text-[#955340]"
            >
              <p className="font-semibold">Checkout setup needed</p>
              <p className="mt-1">{error}</p>
              {!apiKey ? (
                <a
                  href="https://dashboard.moonpay.com/developers/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex font-semibold underline underline-offset-2"
                >
                  Open MoonPay API keys
                </a>
              ) : null}
            </div>
          ) : null}

          <p className="mt-4 text-center text-[10px] leading-5 text-[#98a1a7]">
            MoonPay handles payment, identity checks, and final pricing. Check
            the selected asset and network before confirming. Purchases may be
            unavailable in some regions.
          </p>
        </section>
      </div>
    </>
  );
}
