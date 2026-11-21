"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  type BrowserWalletProvider,
  type WalletConnection,
  WalletConnectModal,
} from "../_components/WalletConnectModal";
import {
  MobileWalletNav,
  WalletPageHeader,
} from "../_components/WalletNavigation";
import {
  formatTokenAmount,
  getTradeTokens,
  NATIVE_TOKEN_ADDRESS,
  parseTokenAmount,
  tradeChains,
  type TradeChainId,
} from "@/lib/trade-tokens";

export default function SendPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [walletOpen, setWalletOpen] = useState(false);
  const [walletConnection, setWalletConnection] =
    useState<WalletConnection | null>(null);
  const [walletProvider, setWalletProvider] =
    useState<BrowserWalletProvider | null>(null);
  const [chainId, setChainId] = useState<TradeChainId>(1);
  const [assetSymbol, setAssetSymbol] = useState("ETH");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const tokens = useMemo(() => getTradeTokens(chainId), [chainId]);
  const token = tokens.find((item) => item.symbol === assetSymbol) ?? tokens[0];
  const errors = useMemo(() => {
    const next: string[] = [];
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipient.trim())) {
      next.push("Enter a valid Ethereum-compatible wallet address.");
    }
    if (!amount.trim()) {
      next.push("Enter an amount greater than zero.");
    } else {
      try {
        if (BigInt(parseTokenAmount(amount, token.decimals)) <= BigInt(0)) {
          next.push("Enter an amount greater than zero.");
        }
      } catch (amountError) {
        next.push(
          amountError instanceof Error
            ? amountError.message
            : "Enter a valid amount.",
        );
      }
    }
    return next;
  }, [amount, recipient, token.decimals]);

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
    const requested = new URLSearchParams(window.location.search)
      .get("coin")
      ?.toUpperCase();
    if (!requested) return;
    const mapped = requested === "BTC" ? "WBTC" : requested;
    const supported = getTradeTokens(chainId).find(
      (item) => item.symbol === mapped,
    );
    if (supported) setAssetSymbol(supported.symbol);
  }, [chainId]);

  async function saveTransaction(
    status: "pending" | "confirmed",
    hash: string,
  ) {
    if (!user || !walletConnection) {
      throw new Error("Sign in and connect your wallet to save this transfer.");
    }
    const idToken = await user.getIdToken();
    const response = await fetch("/api/wallet/transactions/onchain", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "send",
        status,
        chainId,
        hash,
        walletAddress: walletConnection.address,
        recipientAddress: recipient.trim(),
        tokenAddress: token.address,
      }),
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      throw new Error(payload.error || "Transfer history could not be saved.");
    }
  }

  async function sendTransfer() {
    if (!walletProvider || !walletConnection || !user || errors.length) return;
    setSending(true);
    setError("");
    setNotice("");

    try {
      const currentChain = await walletProvider.request<string>({
        method: "eth_chainId",
      });
      if (currentChain.toLowerCase() !== tradeChains[chainId].hexId) {
        throw new Error(`Switch your wallet to ${tradeChains[chainId].name}.`);
      }

      const rawAmount = parseTokenAmount(amount, token.decimals);
      const isNative = token.address === NATIVE_TOKEN_ADDRESS;
      const tx: Record<string, string> = {
        from: walletConnection.address,
        to: isNative ? recipient.trim() : token.address,
      };
      if (isNative) {
        tx.value = `0x${BigInt(rawAmount).toString(16)}`;
      } else {
        tx.data = `0xa9059cbb${recipient.trim().slice(2).toLowerCase().padStart(64, "0")}${BigInt(rawAmount).toString(16).padStart(64, "0")}`;
      }

      const hash = await walletProvider.request<string>({
        method: "eth_sendTransaction",
        params: [tx],
      });
      setNotice("Transfer submitted. Waiting for network confirmation…");
      try {
        await saveTransaction("pending", hash);
      } catch {
        // Confirmation below retries the account-history write.
      }

      let receipt: { status?: string } | null = null;
      for (let attempt = 0; attempt < 60; attempt += 1) {
        receipt = await walletProvider.request<{ status?: string } | null>({
          method: "eth_getTransactionReceipt",
          params: [hash],
        });
        if (receipt) break;
        await new Promise((resolve) => window.setTimeout(resolve, 2000));
      }
      if (!receipt) {
        throw new Error(
          "Your transfer is still pending. You can check its status using the transaction hash.",
        );
      }
      if (receipt.status && BigInt(receipt.status) === BigInt(0)) {
        throw new Error("The transfer failed on-chain. No funds were sent.");
      }

      await saveTransaction("confirmed", hash);
      setNotice(
        `${formatTokenAmount(rawAmount, token.decimals)} ${token.symbol} sent and saved to your account.`,
      );
      setAmount("");
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "The transfer could not be completed.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <WalletPageHeader active="Send" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-7 pb-28 sm:px-6 sm:py-10 sm:pb-10">
        <div className="mx-auto max-w-xl">
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#16875a]">
            On-chain transfer
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Send crypto
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#77828a] dark:text-[#aebac0]">
            Transfers are sent from your connected wallet on Ethereum or Base.
            Confirm the recipient and network in your wallet.
          </p>

          <section className="mt-6 rounded-2xl border border-[#293238] bg-[#171e23] p-4 text-[#e9eef0] sm:p-6">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-[11px] font-semibold text-[#aebac0]">
                Network
                <select
                  value={chainId}
                  onChange={(event) => {
                    const nextChain = Number(
                      event.target.value,
                    ) as TradeChainId;
                    setChainId(nextChain);
                    setAssetSymbol("ETH");
                  }}
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#3a474f] bg-[#202930] px-3 text-sm text-white outline-none"
                >
                  <option value={1}>Ethereum</option>
                  <option value={8453}>Base</option>
                </select>
              </label>
              <label className="text-[11px] font-semibold text-[#aebac0]">
                Asset
                <select
                  value={token.symbol}
                  onChange={(event) => setAssetSymbol(event.target.value)}
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#3a474f] bg-[#202930] px-3 text-sm text-white outline-none"
                >
                  {tokens.map((item) => (
                    <option key={item.address} value={item.symbol}>
                      {item.symbol}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label
              className="mt-4 block text-[11px] font-semibold text-[#aebac0]"
              htmlFor="recipient"
            >
              Recipient address
              <input
                id="recipient"
                autoComplete="off"
                value={recipient}
                onChange={(event) => setRecipient(event.target.value)}
                placeholder="0x..."
                className="mt-1.5 h-12 w-full rounded-xl border border-[#3a474f] bg-[#202930] px-3 font-mono text-sm text-white outline-none focus:border-[#71b8ea]"
              />
            </label>

            <label
              className="mt-4 block text-[11px] font-semibold text-[#aebac0]"
              htmlFor="amount"
            >
              Amount
              <div className="mt-1.5 flex h-12 items-center rounded-xl border border-[#3a474f] bg-[#202930] pr-3 focus-within:border-[#71b8ea]">
                <input
                  id="amount"
                  inputMode="decimal"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="0.00"
                  className="min-w-0 flex-1 bg-transparent px-3 text-base font-semibold text-white outline-none"
                />
                <span className="text-xs font-bold text-[#aebac0]">
                  {token.symbol}
                </span>
              </div>
            </label>

            {errors.length ? (
              <p className="mt-3 text-xs leading-5 text-[#f0a5a5]">
                {errors[0]}
              </p>
            ) : null}
            {error ? (
              <p role="alert" className="mt-3 text-xs leading-5 text-[#f0a5a5]">
                {error}
              </p>
            ) : null}
            {notice ? (
              <p
                role="status"
                className="mt-3 text-xs leading-5 text-[#a9dfbf]"
              >
                {notice}
              </p>
            ) : null}

            <button
              type="button"
              disabled={
                sending ||
                checkingAuth ||
                (Boolean(walletConnection) && errors.length > 0)
              }
              onClick={() => {
                if (!walletProvider || !walletConnection) {
                  setWalletOpen(true);
                  return;
                }
                void sendTransfer();
              }}
              className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#075b9d] px-6 text-sm font-bold text-white transition hover:bg-[#064c82] active:scale-[.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {sending
                ? "Waiting for confirmation…"
                : walletConnection
                  ? `Send ${token.symbol}`
                  : "Connect wallet to send"}
            </button>
            {walletConnection ? (
              <div className="mt-3 flex flex-col items-center gap-2">
                <p className="w-full truncate text-center font-mono text-[10px] text-[#8998a1]">
                  {walletConnection.address} · {walletConnection.chainName}
                </p>
                <button
                  type="button"
                  onClick={() => setWalletOpen(true)}
                  className="text-[10px] font-semibold text-[#71b8ea] hover:underline"
                >
                  Change wallet or network
                </button>
              </div>
            ) : null}
          </section>
        </div>
      </main>
      <WalletConnectModal
        open={walletOpen}
        onClose={() => setWalletOpen(false)}
        connection={walletConnection}
        onConnectionChange={(connection) => {
          setWalletConnection(connection);
          if (connection?.chainId.toLowerCase() === "0x2105") {
            setChainId(8453);
          } else if (connection?.chainId.toLowerCase() === "0x1") {
            setChainId(1);
          }
        }}
        onProviderChange={setWalletProvider}
      />
      <MobileWalletNav active="Send" />
    </>
  );
}
