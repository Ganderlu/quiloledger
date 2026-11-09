"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  WalletConnectModal,
  type BrowserWalletProvider,
  type WalletConnection,
} from "../_components/WalletConnectModal";
import {
  MobileWalletNav,
  WalletPageHeader,
} from "../_components/WalletNavigation";
import {
  formatTokenAmount,
  getTradeTokens,
  parseTokenAmount,
  tradeChains,
  type TradeChainId,
  type TradeToken,
} from "@/lib/trade-tokens";

type PermitData = {
  domain: Record<string, unknown>;
  types: Record<string, unknown>;
  values: Record<string, unknown>;
};

type UniswapQuote = {
  input: { amount: string; token: string };
  output: { amount: string; minimumAmount?: string; token: string };
  classicGasUseEstimateUSD?: string;
};

type QuotePayload = {
  quote: UniswapQuote;
  routing: string;
  permitData: PermitData | null;
  expiresAt: number;
};

type TransactionRequest = {
  to?: string;
  from?: string;
  data?: string;
  value?: string;
  chainId?: number;
  gasLimit?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  gasPrice?: string;
};

type ApprovalPayload = {
  approval?: TransactionRequest | null;
  cancel?: TransactionRequest | null;
};

type TradeRecord = {
  hash: string;
  chainId: TradeChainId;
  fromSymbol: string;
  toSymbol: string;
  amountIn: string;
  amountOut: string;
  createdAt: number;
  status: "pending" | "confirmed";
};

const connectionKey = "qlx-wallet-connection";
const historyKey = "qlx-trade-history";

function readableTokenAmount(raw: string | null, decimals: number) {
  if (raw == null) return "Connect wallet to view";
  const [whole, fraction = ""] = formatTokenAmount(raw, decimals).split(".");
  const groupedWhole = new Intl.NumberFormat("en-US").format(
    BigInt(whole || "0"),
  );
  const trimmedFraction = fraction.slice(0, 6).replace(/0+$/, "");
  return trimmedFraction ? `${groupedWhole}.${trimmedFraction}` : groupedWhole;
}

function amountForInput(raw: bigint, decimals: number) {
  const value = formatTokenAmount(raw.toString(), decimals);
  const [whole, fraction = ""] = value.split(".");
  return fraction
    ? `${whole}.${fraction.slice(0, 8).replace(/0+$/, "")}`
    : whole;
}

function rpcQuantity(value: string | undefined) {
  if (!value) return "0x0";
  const parsed = BigInt(value);
  if (parsed < BigInt(0)) {
    throw new Error("A transaction returned an invalid value.");
  }
  return `0x${parsed.toString(16)}`;
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function waitForReceipt(
  provider: BrowserWalletProvider,
  hash: string,
  onWaiting: () => void,
) {
  onWaiting();
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const receipt = await provider.request<{
      status?: string;
    } | null>({
      method: "eth_getTransactionReceipt",
      params: [hash],
    });
    if (receipt) {
      if (receipt.status && BigInt(receipt.status) === BigInt(0)) {
        throw new Error(
          "The transaction reverted on-chain. Check the transaction link for details.",
        );
      }
      return receipt;
    }
    await delay(1500);
  }
  throw new Error(
    "The transaction is still pending. Check your wallet or block explorer for its status.",
  );
}

function transactionParams(
  transaction: TransactionRequest,
  walletAddress: string,
  chainId: TradeChainId,
  expectedTo?: string,
) {
  if (
    !transaction.to ||
    !/^0x[a-fA-F0-9]{40}$/.test(transaction.to) ||
    transaction.from?.toLowerCase() !== walletAddress.toLowerCase() ||
    transaction.chainId !== chainId ||
    !transaction.data ||
    !/^0x[0-9a-fA-F]+$/.test(transaction.data) ||
    (expectedTo && transaction.to.toLowerCase() !== expectedTo.toLowerCase())
  ) {
    throw new Error(
      "The transaction details failed validation. Nothing was sent.",
    );
  }

  const params: Record<string, string> = {
    from: walletAddress,
    to: transaction.to,
    data: transaction.data,
    value: rpcQuantity(transaction.value),
  };
  if (transaction.gasLimit) params.gas = rpcQuantity(transaction.gasLimit);
  if (transaction.maxFeePerGas) {
    params.maxFeePerGas = rpcQuantity(transaction.maxFeePerGas);
  }
  if (transaction.maxPriorityFeePerGas) {
    params.maxPriorityFeePerGas = rpcQuantity(transaction.maxPriorityFeePerGas);
  }
  if (transaction.gasPrice) {
    params.gasPrice = rpcQuantity(transaction.gasPrice);
  }
  return params;
}

function TokenMark({
  token,
  size = "h-9 w-9",
}: {
  token: TradeToken;
  size?: string;
}) {
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full text-[10px] font-bold text-white ${size}`}
      style={{ backgroundColor: token.color }}
      aria-hidden="true"
    >
      {token.symbol.slice(0, 4)}
    </span>
  );
}

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function TradePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [walletOpen, setWalletOpen] = useState(false);
  const [walletConnection, setWalletConnection] =
    useState<WalletConnection | null>(null);
  const [walletProvider, setWalletProvider] =
    useState<BrowserWalletProvider | null>(null);
  const [chainId, setChainId] = useState<TradeChainId>(1);
  const [fromSymbol, setFromSymbol] = useState("ETH");
  const [toSymbol, setToSymbol] = useState("USDC");
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState("0.5");
  const [quote, setQuote] = useState<QuotePayload | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [quoteSeconds, setQuoteSeconds] = useState(0);
  const [balance, setBalance] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [stage, setStage] = useState("");
  const [tradeError, setTradeError] = useState("");
  const [tradeNotice, setTradeNotice] = useState("");
  const [history, setHistory] = useState<TradeRecord[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const tokens = useMemo(() => getTradeTokens(chainId), [chainId]);
  const fromToken =
    tokens.find((token) => token.symbol === fromSymbol) ?? tokens[0];
  const toToken =
    tokens.find(
      (token) => token.symbol === toSymbol && token.symbol !== fromToken.symbol,
    ) ?? tokens.find((token) => token.symbol !== fromToken.symbol)!;
  const connected = Boolean(walletConnection && walletProvider);
  const selectedChain = tradeChains[chainId];
  const needsNetworkSwitch =
    Boolean(walletConnection) &&
    walletConnection?.chainId.toLowerCase() !== selectedChain.hexId;

  const handleWalletConnectionChange = useCallback(
    (connection: WalletConnection | null) => {
      setWalletConnection(connection);
      if (!connection) setBalance(null);
    },
    [],
  );
  const handleWalletProviderChange = useCallback(
    (provider: BrowserWalletProvider | null) => setWalletProvider(provider),
    [],
  );

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
    try {
      const savedConnection: unknown = JSON.parse(
        localStorage.getItem(connectionKey) ?? "null",
      );
      if (
        typeof savedConnection === "object" &&
        savedConnection !== null &&
        "address" in savedConnection &&
        typeof savedConnection.address === "string" &&
        "chainId" in savedConnection &&
        typeof savedConnection.chainId === "string" &&
        "chainName" in savedConnection &&
        typeof savedConnection.chainName === "string" &&
        "nativeSymbol" in savedConnection &&
        typeof savedConnection.nativeSymbol === "string" &&
        "nativeBalance" in savedConnection &&
        typeof savedConnection.nativeBalance === "string" &&
        "walletName" in savedConnection &&
        typeof savedConnection.walletName === "string"
      ) {
        setWalletConnection(savedConnection as WalletConnection);
      }
      const savedHistory: unknown = JSON.parse(
        localStorage.getItem(historyKey) ?? "[]",
      );
      if (Array.isArray(savedHistory)) {
        setHistory(
          savedHistory.filter(
            (item): item is TradeRecord =>
              typeof item === "object" &&
              item !== null &&
              "hash" in item &&
              typeof item.hash === "string" &&
              "chainId" in item &&
              (item.chainId === 1 || item.chainId === 8453),
          ),
        );
      }
    } catch {}
  }, []);

  useEffect(() => {
    const availableTokens = getTradeTokens(chainId);
    if (!availableTokens.some((token) => token.symbol === fromSymbol)) {
      setFromSymbol("ETH");
    }
    if (
      !availableTokens.some(
        (token) => token.symbol === toSymbol && token.symbol !== fromSymbol,
      )
    ) {
      setToSymbol("USDC");
    }
  }, [chainId, fromSymbol, toSymbol]);

  useEffect(() => {
    if (!walletProvider || !walletConnection) {
      setBalance(null);
      return;
    }
    let cancelled = false;

    async function loadBalance() {
      try {
        let rawBalance: string;
        if (
          fromToken.address.toLowerCase() ===
          "0x0000000000000000000000000000000000000000"
        ) {
          rawBalance = await walletProvider!.request<string>({
            method: "eth_getBalance",
            params: [walletConnection!.address, "latest"],
          });
        } else {
          const address = walletConnection!.address
            .slice(2)
            .toLowerCase()
            .padStart(64, "0");
          rawBalance = await walletProvider!.request<string>({
            method: "eth_call",
            params: [
              {
                to: fromToken.address,
                data: `0x70a08231${address}`,
              },
              "latest",
            ],
          });
        }
        if (!cancelled) setBalance(BigInt(rawBalance).toString());
      } catch {
        if (!cancelled) setBalance(null);
      }
    }

    void loadBalance();
    return () => {
      cancelled = true;
    };
  }, [fromToken, walletConnection, walletProvider]);

  const requestQuote = useCallback(
    async (signal?: AbortSignal) => {
      if (!walletConnection)
        throw new Error("Connect a wallet to get a quote.");
      const amountBaseUnits = parseTokenAmount(amount, fromToken.decimals);
      const response = await fetch("/api/trade/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal,
        body: JSON.stringify({
          chainId,
          walletAddress: walletConnection.address,
          tokenIn: fromToken.address,
          tokenOut: toToken.address,
          amount: amountBaseUnits,
          slippageTolerance: Number(slippage),
        }),
      });
      const payload = (await response.json()) as
        | QuotePayload
        | { error?: string };
      if (!response.ok || !("quote" in payload)) {
        throw new Error(
          "error" in payload && payload.error
            ? payload.error
            : "Uniswap could not quote this trade.",
        );
      }
      return payload;
    },
    [amount, chainId, fromToken, slippage, toToken, walletConnection],
  );

  const parsedAmount = useMemo(() => {
    try {
      return amount.trim() ? parseTokenAmount(amount, fromToken.decimals) : "";
    } catch {
      return "";
    }
  }, [amount, fromToken.decimals]);

  const amountError = useMemo(() => {
    if (!amount.trim()) return "";
    try {
      parseTokenAmount(amount, fromToken.decimals);
      return "";
    } catch (error) {
      return error instanceof Error ? error.message : "Enter a valid amount.";
    }
  }, [amount, fromToken.decimals]);

  const canRequestQuote = Boolean(
    user &&
    connected &&
    walletConnection &&
    !needsNetworkSwitch &&
    parsedAmount &&
    BigInt(parsedAmount) > BigInt(0) &&
    fromToken.symbol !== toToken.symbol,
  );

  useEffect(() => {
    const controller = new AbortController();
    setQuote(null);
    setQuoteError("");
    setQuoteSeconds(0);
    if (!canRequestQuote) {
      setQuoteLoading(false);
      return () => controller.abort();
    }

    const timeout = window.setTimeout(async () => {
      setQuoteLoading(true);
      try {
        const payload = await requestQuote(controller.signal);
        if (!controller.signal.aborted) setQuote(payload);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        if (!controller.signal.aborted) {
          setQuoteError(
            error instanceof Error
              ? error.message
              : "Uniswap could not quote this trade.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setQuoteLoading(false);
      }
    }, 450);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [canRequestQuote, refreshKey, requestQuote]);

  useEffect(() => {
    if (!quote) return;
    const updateCountdown = () => {
      setQuoteSeconds(
        Math.max(0, Math.ceil((quote.expiresAt - Date.now()) / 1000)),
      );
    };
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [quote]);

  const switchNetwork = useCallback(async () => {
    if (!walletProvider) {
      setWalletOpen(true);
      return;
    }
    const network = tradeChains[chainId];
    try {
      await walletProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: network.hexId }],
      });
    } catch (error) {
      const code =
        typeof error === "object" && error !== null && "code" in error
          ? error.code
          : undefined;
      if (code !== 4902) {
        setTradeError(
          code === 4001
            ? "Network switch was declined in your wallet."
            : "Could not switch networks. Try changing networks in your wallet.",
        );
        return;
      }
      try {
        await walletProvider.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: network.hexId,
              chainName: network.name,
              nativeCurrency: {
                name: "Ether",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: network.rpcUrls,
              blockExplorerUrls: [network.explorer],
            },
          ],
        });
      } catch (addError) {
        const addCode =
          typeof addError === "object" &&
          addError !== null &&
          "code" in addError
            ? addError.code
            : undefined;
        setTradeError(
          addCode === 4001
            ? "Network addition was declined in your wallet."
            : "This network could not be added to your wallet.",
        );
      }
    }
  }, [chainId, walletProvider]);

  const sendWalletTransaction = useCallback(
    async (transaction: TransactionRequest, expectedTo?: string) => {
      if (!walletProvider || !walletConnection) {
        throw new Error("Reconnect your wallet before trading.");
      }
      const currentChain = await walletProvider.request<string>({
        method: "eth_chainId",
      });
      if (currentChain.toLowerCase() !== tradeChains[chainId].hexId) {
        throw new Error("Your wallet network changed. Switch back and retry.");
      }
      const params = transactionParams(
        transaction,
        walletConnection.address,
        chainId,
        expectedTo,
      );
      return walletProvider.request<string>({
        method: "eth_sendTransaction",
        params: [params],
      });
    },
    [chainId, walletConnection, walletProvider],
  );

  async function readApiError(response: Response) {
    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    return (
      payload.error || "The trade provider could not complete the request."
    );
  }

  async function getApprovalState(amountBaseUnits: string) {
    const response = await fetch("/api/trade/approval", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chainId,
        walletAddress: walletConnection?.address,
        tokenAddress: fromToken.address,
        amount: amountBaseUnits,
      }),
    });
    if (!response.ok) throw new Error(await readApiError(response));
    return (await response.json()) as ApprovalPayload;
  }

  async function executeTrade() {
    if (!walletProvider || !walletConnection || !quote) return;
    setTradeError("");
    setTradeNotice("");
    setStage("Preparing a fresh quote…");
    try {
      const amountBaseUnits = parseTokenAmount(amount, fromToken.decimals);
      let freshQuote = quote;

      if (
        fromToken.address.toLowerCase() !==
        "0x0000000000000000000000000000000000000000"
      ) {
        setStage("Checking token approval…");
        let approvalState = await getApprovalState(amountBaseUnits);
        if (approvalState.cancel) {
          setStage("Confirm the token approval reset in your wallet…");
          const cancelHash = await sendWalletTransaction(
            approvalState.cancel,
            fromToken.address,
          );
          await waitForReceipt(walletProvider, cancelHash, () =>
            setStage("Waiting for approval reset confirmation…"),
          );
          approvalState = await getApprovalState(amountBaseUnits);
        }
        if (approvalState.approval) {
          setStage("Confirm token approval in your wallet…");
          const approvalHash = await sendWalletTransaction(
            approvalState.approval,
            fromToken.address,
          );
          await waitForReceipt(walletProvider, approvalHash, () =>
            setStage("Waiting for token approval confirmation…"),
          );
        }
      }

      setStage("Refreshing the live Uniswap quote…");
      freshQuote = await requestQuote();
      setQuote(freshQuote);

      let signature: string | undefined;
      if (freshQuote.permitData) {
        setStage("Confirm token permission in your wallet…");
        const { domain, types, values } = freshQuote.permitData;
        const primaryType =
          Object.keys(types).find((key) => key !== "EIP712Domain") ??
          "PermitSingle";
        signature = await walletProvider.request<string>({
          method: "eth_signTypedData_v4",
          params: [
            walletConnection.address,
            JSON.stringify({
              domain,
              types,
              primaryType,
              message: values,
            }),
          ],
        });
      }

      setStage("Preparing the swap transaction…");
      const swapResponse = await fetch("/api/trade/swap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chainId,
          walletAddress: walletConnection.address,
          tokenIn: fromToken.address,
          tokenOut: toToken.address,
          quote: freshQuote.quote,
          routing: freshQuote.routing,
          permitData: freshQuote.permitData,
          signature,
        }),
      });
      if (!swapResponse.ok) {
        throw new Error(await readApiError(swapResponse));
      }
      const swapPayload = (await swapResponse.json()) as {
        swap?: TransactionRequest;
      };
      if (!swapPayload.swap) {
        throw new Error(
          "Uniswap did not return a valid transaction. Nothing was sent.",
        );
      }

      setStage("Confirm the swap in your wallet…");
      const hash = await sendWalletTransaction(swapPayload.swap);
      const record: TradeRecord = {
        hash,
        chainId,
        fromSymbol: fromToken.symbol,
        toSymbol: toToken.symbol,
        amountIn: amount,
        amountOut: formatTokenAmount(
          freshQuote.quote.output.amount,
          toToken.decimals,
        ),
        createdAt: Date.now(),
        status: "pending",
      };
      setHistory((current) => {
        const next = [record, ...current].slice(0, 8);
        try {
          localStorage.setItem(historyKey, JSON.stringify(next));
        } catch {}
        return next;
      });

      await waitForReceipt(walletProvider, hash, () =>
        setStage("Swap submitted. Waiting for on-chain confirmation…"),
      );
      const confirmed = { ...record, status: "confirmed" as const };
      setHistory((current) => {
        const next = current.map((item) =>
          item.hash === hash ? confirmed : item,
        );
        try {
          localStorage.setItem(historyKey, JSON.stringify(next));
        } catch {}
        return next;
      });
      setTradeNotice("Trade confirmed on-chain.");
      setAmount("");
      setQuote(null);
      setReviewOpen(false);
      setStage("");
    } catch (error) {
      setStage("");
      setTradeError(
        error instanceof Error
          ? error.message
          : "The trade could not be completed.",
      );
    }
  }

  function selectFrom(symbol: string) {
    if (symbol === toToken.symbol) setToSymbol(fromToken.symbol);
    setFromSymbol(symbol);
  }

  function selectTo(symbol: string) {
    if (symbol === fromToken.symbol) setFromSymbol(toToken.symbol);
    setToSymbol(symbol);
  }

  function setMaxAmount() {
    if (!balance) return;
    let max = BigInt(balance);
    if (
      fromToken.address.toLowerCase() ===
      "0x0000000000000000000000000000000000000000"
    ) {
      const reserve =
        chainId === 1 ? BigInt("2000000000000000") : BigInt("200000000000000");
      max = max > reserve ? max - reserve : BigInt(0);
    }
    setAmount(amountForInput(max, fromToken.decimals));
  }

  if (checkingAuth || !user) {
    return (
      <div className="grid min-h-[70vh] flex-1 place-items-center bg-[#f7f8fa] px-4 dark:bg-[#101619]">
        <p className="text-sm text-[#7b858d]">Loading your trading desk…</p>
      </div>
    );
  }

  const quoteOutput = quote
    ? formatTokenAmount(quote.quote.output.amount, toToken.decimals)
    : "";
  const minimumOutput =
    quote?.quote.output.minimumAmount &&
    formatTokenAmount(quote.quote.output.minimumAmount, toToken.decimals);
  const fromBalanceLabel = readableTokenAmount(balance, fromToken.decimals);
  const canReview = Boolean(
    canRequestQuote &&
    quote &&
    !quoteLoading &&
    quoteSeconds > 0 &&
    !stage &&
    !amountError,
  );

  return (
    <div className="qlx-wallet-app min-h-screen flex-1 bg-[#f7f8fa] text-[#25282d] dark:bg-[#101619] dark:text-[#e9eef0]">
      <div className="h-1 w-full bg-[#27c84a]" />
      <WalletPageHeader active="Trade" />

      <main className="mx-auto w-full max-w-[1180px] px-4 pb-28 pt-6 sm:px-6 sm:pb-12 sm:pt-9 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.16em] text-[#16875a]">
              On-chain trading
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#20252b] sm:text-[30px] dark:text-[#f1f4f5]">
              Trade tokens
            </h1>
            <p className="mt-1.5 max-w-xl text-sm leading-6 text-[#77808a]">
              Get a live Uniswap quote and swap directly from your connected
              wallet on Ethereum or Base.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex h-10 items-center gap-2 rounded-xl border border-[#e4e9ed] bg-white px-3 text-xs font-semibold text-[#53606a] dark:border-[#293238] dark:bg-[#171e23] dark:text-[#d4dde1]">
              Network
              <select
                aria-label="Trade network"
                value={chainId}
                onChange={(event) =>
                  setChainId(Number(event.target.value) as TradeChainId)
                }
                className="bg-transparent text-xs font-bold outline-none"
              >
                <option value={1}>Ethereum</option>
                <option value={8453}>Base</option>
              </select>
            </label>
            <button
              type="button"
              onClick={() => setWalletOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#101b22] px-3.5 text-xs font-semibold text-white transition hover:bg-[#263740] active:scale-[.98] dark:bg-white dark:text-[#111820] dark:hover:bg-[#e2e9ed]"
            >
              <span className="h-2 w-2 rounded-full bg-[#31c77a]" />
              <span className="max-w-[150px] truncate">
                {connected && walletConnection
                  ? `${walletConnection.walletName} · ${walletConnection.address.slice(0, 6)}…${walletConnection.address.slice(-4)}`
                  : "Connect wallet"}
              </span>
            </button>
          </div>
        </div>

        <div className="mt-6 grid items-start gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(310px,.9fr)]">
          <section className="overflow-hidden rounded-2xl border border-[#e9ecef] bg-white shadow-[0_8px_24px_rgba(25,36,50,0.04)] dark:border-[#293238] dark:bg-[#171e23]">
            <div className="flex items-center justify-between gap-3 border-b border-[#edf0f2] px-4 py-4 sm:px-6 dark:border-[#293238]">
              <div>
                <h2 className="text-sm font-bold text-[#30363d] sm:text-base dark:text-[#edf1f3]">
                  Swap
                </h2>
                <p className="mt-1 text-[10px] text-[#9298a0] sm:text-[11px]">
                  Single-network Uniswap route
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e4e9e7] bg-[#fbfdfc] px-3 py-2 text-[10px] font-semibold text-[#68736d] dark:border-[#293238] dark:bg-[#202930] dark:text-[#c7d0d5]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#20a95a]" />
                {selectedChain.name}
              </span>
            </div>

            <div className="p-4 sm:p-6">
              <div className="rounded-2xl border border-[#e7ecef] bg-[#f8fafb] p-4 sm:p-5 dark:border-[#364149] dark:bg-[#202930]">
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor="trade-amount"
                    className="text-xs font-medium text-[#7c858e] dark:text-[#aebac0]"
                  >
                    You pay
                  </label>
                  <span className="flex max-w-[65%] items-center gap-1.5 truncate text-right text-[10px] text-[#89939a]">
                    Balance: {fromBalanceLabel} {fromToken.symbol}
                    {connected ? (
                      <button
                        type="button"
                        onClick={setMaxAmount}
                        className="font-bold text-[#075b9d] hover:underline dark:text-[#71b8ea]"
                      >
                        Max
                      </button>
                    ) : null}
                  </span>
                </div>
                <div className="mt-3 flex min-w-0 items-center gap-3">
                  <input
                    id="trade-amount"
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="any"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    aria-invalid={Boolean(amountError)}
                    placeholder="0.00"
                    className="min-w-0 flex-1 bg-transparent text-2xl font-semibold tracking-tight text-[#252b31] outline-none placeholder:text-[#c1c6ca] sm:text-[34px] dark:text-[#eef2f4]"
                  />
                  <div className="flex shrink-0 items-center gap-2 rounded-full border border-[#e1e6e9] bg-white py-1 pl-1.5 pr-3 shadow-sm dark:border-[#3a474f] dark:bg-[#182126]">
                    <TokenMark token={fromToken} />
                    <select
                      aria-label="Token to trade from"
                      value={fromToken.symbol}
                      onChange={(event) => selectFrom(event.target.value)}
                      className="max-w-[100px] bg-transparent text-xs font-bold text-[#303a41] outline-none dark:text-[#edf1f3]"
                    >
                      {tokens.map((token) => (
                        <option key={token.address} value={token.symbol}>
                          {token.symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-2 min-h-4 text-[10px] text-[#ba5156]">
                  {amountError}
                </div>
              </div>

              <div className="relative z-10 -my-3 flex justify-center">
                <button
                  type="button"
                  aria-label="Reverse trade tokens"
                  onClick={() => {
                    setFromSymbol(toToken.symbol);
                    setToSymbol(fromToken.symbol);
                  }}
                  className="grid h-9 w-9 place-items-center rounded-xl border border-[#e5eaed] bg-white text-[#52616a] shadow-sm transition hover:border-[#b8d1df] hover:text-[#075b9d] active:scale-95 dark:border-[#3a474f] dark:bg-[#182126] dark:text-[#d4dde1]"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 7h13m0 0-3-3m3 3-3 3M17 17H4m0 0 3-3m-3 3 3 3" />
                  </svg>
                </button>
              </div>

              <div className="rounded-2xl border border-[#e7ecef] bg-[#f8fafb] p-4 sm:p-5 dark:border-[#364149] dark:bg-[#202930]">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-[#7c858e] dark:text-[#aebac0]">
                    You receive
                  </span>
                  <span className="truncate text-right text-[10px] text-[#89939a]">
                    Estimated output
                  </span>
                </div>
                <div className="mt-3 flex min-w-0 items-center gap-3">
                  <p
                    className="min-w-0 flex-1 truncate text-2xl font-semibold tracking-tight text-[#252b31] sm:text-[34px] dark:text-[#eef2f4]"
                    aria-live="polite"
                  >
                    {quoteOutput || "0.00"}
                  </p>
                  <div className="flex shrink-0 items-center gap-2 rounded-full border border-[#e1e6e9] bg-white py-1 pl-1.5 pr-3 shadow-sm dark:border-[#3a474f] dark:bg-[#182126]">
                    <TokenMark token={toToken} />
                    <select
                      aria-label="Token to trade to"
                      value={toToken.symbol}
                      onChange={(event) => selectTo(event.target.value)}
                      className="max-w-[100px] bg-transparent text-xs font-bold text-[#303a41] outline-none dark:text-[#edf1f3]"
                    >
                      {tokens.map((token) => (
                        <option key={token.address} value={token.symbol}>
                          {token.symbol}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="mt-2 min-h-4 text-[10px] text-[#89939a]">
                  {quote?.quote.output.minimumAmount
                    ? `Minimum received: ${formatTokenAmount(minimumOutput!, toToken.decimals)} ${toToken.symbol}`
                    : quoteLoading
                      ? "Fetching a live quote…"
                      : "The amount received can change with market conditions."}
                </p>
              </div>

              <div className="mt-4 rounded-xl border border-[#edf0f2] bg-white px-3.5 py-3 dark:border-[#344149] dark:bg-[#182126]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-[#7c858e] dark:text-[#aebac0]">
                    Slippage tolerance
                  </span>
                  <div className="flex items-center gap-1">
                    {["0.1", "0.5", "1.0"].map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={slippage === value}
                        onClick={() => setSlippage(value)}
                        className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition ${
                          slippage === value
                            ? "bg-[#e8f3fa] text-[#075b9d] dark:bg-[#203746] dark:text-[#8ac8ed]"
                            : "text-[#7b858d] hover:bg-[#f3f5f6] dark:text-[#c1cbd0] dark:hover:bg-[#263138]"
                        }`}
                      >
                        {value}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {needsNetworkSwitch ? (
                <button
                  type="button"
                  onClick={() => void switchNetwork()}
                  className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-xl bg-amber-500 px-5 text-sm font-bold text-white transition hover:bg-amber-600 active:scale-[.99]"
                >
                  Switch wallet to {selectedChain.name}
                </button>
              ) : !connected ? (
                <button
                  type="button"
                  onClick={() => setWalletOpen(true)}
                  className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#075b9d] px-5 text-sm font-bold text-white transition hover:bg-[#064c82] active:scale-[.99]"
                >
                  Connect wallet to trade
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!canReview}
                  onClick={() => {
                    setTradeError("");
                    setReviewOpen(true);
                  }}
                  className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#075b9d] px-5 text-sm font-bold text-white transition hover:bg-[#064c82] disabled:cursor-not-allowed disabled:bg-[#a9bdca] active:scale-[.99]"
                >
                  {quoteLoading
                    ? "Getting live quote…"
                    : quoteSeconds === 0 && quote
                      ? "Refresh quote to continue"
                      : quote
                        ? "Review trade"
                        : "Enter an amount for a quote"}
                </button>
              )}

              {quoteError ? (
                <div
                  role="alert"
                  className="mt-3 rounded-xl border border-[#f0d8cf] bg-[#fff8f5] px-3.5 py-3 text-xs leading-5 text-[#955340]"
                >
                  <p>{quoteError}</p>
                  {quoteError.includes("UNISWAP_API_KEY") ? (
                    <p className="mt-1 font-medium">
                      Set UNISWAP_API_KEY in .env.local, then restart Next.js.
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setRefreshKey((key) => key + 1)}
                    className="mt-1 font-semibold underline underline-offset-2"
                  >
                    Try quote again
                  </button>
                </div>
              ) : null}
              {tradeError ? (
                <p
                  role="alert"
                  className="mt-3 rounded-xl border border-[#f0d8cf] bg-[#fff8f5] px-3.5 py-3 text-xs leading-5 text-[#955340]"
                >
                  {tradeError}
                </p>
              ) : null}
              {tradeNotice ? (
                <p
                  role="status"
                  className="mt-3 rounded-xl border border-[#d5eee1] bg-[#f1fbf5] px-3.5 py-3 text-xs font-semibold text-[#16875a]"
                >
                  {tradeNotice}
                </p>
              ) : null}
              {stage ? (
                <p
                  role="status"
                  aria-live="polite"
                  className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#075b9d] dark:text-[#71b8ea]"
                >
                  <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
                  {stage}
                </p>
              ) : null}
            </div>
          </section>

          <div className="space-y-5">
            <section className="rounded-2xl border border-[#e9ecef] bg-white p-4 shadow-[0_8px_24px_rgba(25,36,50,0.035)] sm:p-5 dark:border-[#293238] dark:bg-[#171e23]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-[#30363d] dark:text-[#edf1f3]">
                    Trade details
                  </h2>
                  <p className="mt-1 text-[10px] text-[#9298a0]">
                    Provider quote updates as you edit
                  </p>
                </div>
                <span className="rounded-lg bg-[#f1f7fa] px-2.5 py-1.5 text-[10px] font-bold text-[#075b9d] dark:bg-[#203746] dark:text-[#8ac8ed]">
                  {quote?.routing ?? "Uniswap"}
                </span>
              </div>
              <dl className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-4 text-xs">
                  <dt className="text-[#7c858e] dark:text-[#aebac0]">
                    Exchange rate
                  </dt>
                  <dd className="text-right font-semibold text-[#3c454c] dark:text-[#e0e6e9]">
                    {quote && amount
                      ? `1 ${fromToken.symbol} ≈ ${(
                          Number(quoteOutput) / Number(amount)
                        ).toLocaleString(undefined, {
                          maximumSignificantDigits: 7,
                        })} ${toToken.symbol}`
                      : "Waiting for quote"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 text-xs">
                  <dt className="text-[#7c858e] dark:text-[#aebac0]">
                    Network fee
                  </dt>
                  <dd className="text-right font-semibold text-[#3c454c] dark:text-[#e0e6e9]">
                    {quote?.quote.classicGasUseEstimateUSD
                      ? `~$${Number(
                          quote.quote.classicGasUseEstimateUSD,
                        ).toFixed(2)}`
                      : quote
                        ? "Shown in wallet"
                        : "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 text-xs">
                  <dt className="text-[#7c858e] dark:text-[#aebac0]">
                    Slippage limit
                  </dt>
                  <dd className="font-semibold text-[#3c454c] dark:text-[#e0e6e9]">
                    {slippage}%
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 text-xs">
                  <dt className="text-[#7c858e] dark:text-[#aebac0]">
                    Quote expires
                  </dt>
                  <dd
                    className={`font-semibold ${
                      quoteSeconds > 0
                        ? "text-[#3c454c] dark:text-[#e0e6e9]"
                        : "text-amber-600"
                    }`}
                  >
                    {quote
                      ? quoteSeconds > 0
                        ? `${quoteSeconds}s`
                        : "Refresh"
                      : "—"}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 rounded-xl bg-[#f6f8f9] px-3 py-2.5 text-[10px] leading-5 text-[#89929a] dark:bg-[#202930] dark:text-[#b6c0c6]">
                Token approval and swap transactions are submitted only after
                you review them in your wallet.
              </p>
            </section>

            <section className="rounded-2xl border border-[#e9ecef] bg-white p-4 shadow-[0_8px_24px_rgba(25,36,50,0.035)] sm:p-5 dark:border-[#293238] dark:bg-[#171e23]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-[#30363d] dark:text-[#edf1f3]">
                    Recent activity
                  </h2>
                  <p className="mt-1 text-[10px] text-[#9298a0]">
                    Trades from this browser
                  </p>
                </div>
                <span className="rounded-full bg-[#f1f4f5] px-2 py-1 text-[10px] font-semibold text-[#737e85] dark:bg-[#263138] dark:text-[#c8d1d6]">
                  {history.length}
                </span>
              </div>
              {history.length ? (
                <div className="mt-3 divide-y divide-[#eff1f3] dark:divide-[#293238]">
                  {history.slice(0, 4).map((item) => (
                    <div
                      key={item.hash}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-[#3b454c] dark:text-[#e0e6e9]">
                          {item.amountIn} {item.fromSymbol} → {item.amountOut}{" "}
                          {item.toSymbol}
                        </p>
                        <p className="mt-1 text-[10px] text-[#929aa1]">
                          {formatDate(item.createdAt)} ·{" "}
                          {tradeChains[item.chainId].name} · {item.status}
                        </p>
                      </div>
                      <a
                        href={`${tradeChains[item.chainId].explorer}/tx/${item.hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 text-[10px] font-semibold text-[#075b9d] hover:underline dark:text-[#71b8ea]"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 rounded-xl bg-[#f8fafb] px-3 py-4 text-xs leading-5 text-[#89929a] dark:bg-[#202930] dark:text-[#b6c0c6]">
                  Completed wallet-confirmed trades will appear here.
                </p>
              )}
            </section>
          </div>
        </div>

        <p className="mt-5 px-1 text-[10px] leading-5 text-[#89929a] dark:text-[#b6c0c6]">
          QuiloxLedger does not custody funds or guarantee execution. Token
          approvals grant spending permission, and on-chain transactions may be
          irreversible. Always verify the token, network, amount, and wallet
          prompt before signing.
        </p>
      </main>

      {reviewOpen && quote ? (
        <div
          className="fixed inset-0 z-[70] grid place-items-end bg-[#07131a]/55 p-0 backdrop-blur-sm sm:place-items-center sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !stage) {
              setReviewOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="trade-review-title"
            className="w-full max-w-md rounded-t-[26px] border border-white/60 bg-white p-5 shadow-2xl sm:rounded-[26px] sm:p-7 dark:border-[#344149] dark:bg-[#171e23]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#16875a]">
                  Final review
                </p>
                <h2
                  id="trade-review-title"
                  className="mt-1 text-xl font-bold tracking-tight text-[#273139] dark:text-white"
                >
                  Review your trade
                </h2>
              </div>
              <button
                type="button"
                aria-label="Close trade review"
                disabled={Boolean(stage)}
                onClick={() => setReviewOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-[#f1f4f5] text-lg text-[#68737b] transition hover:bg-[#e7ecee] disabled:opacity-40 dark:bg-[#29343a] dark:text-[#d0d8dc]"
              >
                ×
              </button>
            </div>

            <div className="mt-5 rounded-2xl bg-[#f6f8f9] p-4 dark:bg-[#202930]">
              <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-[#8b949c]">
                You pay
              </p>
              <p className="mt-1 text-lg font-bold text-[#252c32] dark:text-[#eef2f4]">
                {amount} {fromToken.symbol}
              </p>
              <p className="mt-4 text-[10px] font-semibold uppercase tracking-[.12em] text-[#8b949c]">
                Estimated receive
              </p>
              <p className="mt-1 text-lg font-bold text-[#252c32] dark:text-[#eef2f4]">
                {quoteOutput} {toToken.symbol}
              </p>
              {minimumOutput ? (
                <p className="mt-1 text-[11px] text-[#7c858e] dark:text-[#aebac0]">
                  Minimum after slippage: {minimumOutput} {toToken.symbol}
                </p>
              ) : null}
            </div>

            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-[11px] leading-5 text-amber-900 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-200">
              <span className="mt-0.5 font-bold">!</span>
              <p>
                The wallet may request a token approval before the swap. Each
                approval and the final trade is a separate transaction you must
                confirm.
              </p>
            </div>

            {stage ? (
              <p
                role="status"
                aria-live="polite"
                className="mt-4 text-xs font-semibold text-[#075b9d] dark:text-[#71b8ea]"
              >
                {stage}
              </p>
            ) : null}
            {tradeError ? (
              <p role="alert" className="mt-3 text-xs leading-5 text-[#b4494f]">
                {tradeError}
              </p>
            ) : null}
            <button
              type="button"
              disabled={Boolean(stage) || !connected}
              onClick={() => void executeTrade()}
              className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#075b9d] px-5 text-sm font-bold text-white transition hover:bg-[#064c82] disabled:cursor-wait disabled:opacity-60 active:scale-[.99]"
            >
              {stage ? "Waiting for your wallet…" : "Continue to wallet"}
            </button>
            <p className="mt-3 text-center text-[10px] leading-5 text-[#98a1a7]">
              QuiloxLedger never receives your private key or recovery phrase.
            </p>
          </section>
        </div>
      ) : null}

      <WalletConnectModal
        open={walletOpen}
        onClose={() => setWalletOpen(false)}
        connection={walletConnection}
        onConnectionChange={handleWalletConnectionChange}
        onProviderChange={handleWalletProviderChange}
      />
      <MobileWalletNav active="Trade" />
    </div>
  );
}
