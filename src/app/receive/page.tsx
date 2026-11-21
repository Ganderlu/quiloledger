"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  getTradeTokens,
  NATIVE_TOKEN_ADDRESS,
  tradeChains,
  type TradeChainId,
} from "@/lib/trade-tokens";

type SavedTransaction = {
  id: string;
  type: "send" | "receive";
  status: "pending" | "confirmed";
  chainId: TradeChainId;
  hash: string;
  assetCode: string;
  amount: string;
  walletAddress: string;
  counterpartyAddress: string;
  createdAt: number;
};

export default function ReceivePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [walletOpen, setWalletOpen] = useState(false);
  const [walletConnection, setWalletConnection] =
    useState<WalletConnection | null>(null);
  const [walletProvider, setWalletProvider] =
    useState<BrowserWalletProvider | null>(null);
  const [chainId, setChainId] = useState<TradeChainId>(1);
  const [transactions, setTransactions] = useState<SavedTransaction[]>([]);
  const [scanStatus, setScanStatus] = useState("");
  const [scanError, setScanError] = useState("");
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const tokens = useMemo(() => getTradeTokens(chainId), [chainId]);
  const supportedConnection = Boolean(
    walletConnection &&
    walletProvider &&
    walletConnection.chainId.toLowerCase() === tradeChains[chainId].hexId,
  );

  const saveIncomingTransfer = useCallback(
    async (details: {
      hash: string;
      tokenAddress: string;
      logIndex?: string;
    }) => {
      if (!user || !walletConnection) return false;
      const token = await user.getIdToken();
      const response = await fetch("/api/wallet/transactions/onchain", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "receive",
          status: "confirmed",
          chainId,
          hash: details.hash,
          walletAddress: walletConnection.address,
          tokenAddress: details.tokenAddress,
          logIndex: details.logIndex,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        transaction?: SavedTransaction;
        error?: string;
      };
      if (!response.ok || !payload.transaction) {
        throw new Error(payload.error || "Incoming funds could not be saved.");
      }
      setTransactions((current) => [
        payload.transaction!,
        ...current.filter((item) => item.id !== payload.transaction!.id),
      ]);
      return true;
    },
    [chainId, user, walletConnection],
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
    if (!user) return;
    let cancelled = false;
    async function loadTransactions(authenticatedUser: User) {
      try {
        const token = await authenticatedUser.getIdToken();
        const response = await fetch("/api/wallet/transactions/onchain", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const payload = (await response.json().catch(() => ({}))) as {
          transactions?: SavedTransaction[];
        };
        if (response.ok && Array.isArray(payload.transactions) && !cancelled) {
          setTransactions(payload.transactions);
        }
      } catch {}
    }
    void loadTransactions(user);
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!supportedConnection || !walletProvider || !walletConnection || !user) {
      setScanStatus("");
      return;
    }
    let cancelled = false;
    let scanning = false;
    let lastScannedBlock: bigint | null = null;
    const address = walletConnection.address.toLowerCase();
    const recipientTopic = `0x${address.slice(2).padStart(64, "0")}`;
    const transferTopic =
      "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
    const tokenContracts = tokens
      .filter((item) => item.address !== NATIVE_TOKEN_ADDRESS)
      .map((item) => item.address);

    async function postForBlock(blockNumber: bigint) {
      if (!walletProvider) return false;
      const tag = `0x${blockNumber.toString(16)}`;
      let successful = true;
      try {
        const block = await walletProvider.request<{
          transactions?: Array<{
            hash?: string;
            from?: string;
            to?: string | null;
            value?: string;
          }>;
        } | null>({
          method: "eth_getBlockByNumber",
          params: [tag, true],
        });
        for (const transaction of block?.transactions ?? []) {
          if (
            transaction.hash &&
            transaction.from &&
            transaction.to?.toLowerCase() === address &&
            transaction.value &&
            BigInt(transaction.value) > BigInt(0)
          ) {
            try {
              await saveIncomingTransfer({
                hash: transaction.hash,
                tokenAddress: NATIVE_TOKEN_ADDRESS,
              });
            } catch (saveError) {
              successful = false;
              setScanError(
                saveError instanceof Error
                  ? saveError.message
                  : "A detected deposit could not be saved.",
              );
            }
          }
        }

        if (tokenContracts.length) {
          const logs = await walletProvider.request<
            Array<{
              address?: string;
              transactionHash?: string;
              logIndex?: string;
            }>
          >({
            method: "eth_getLogs",
            params: [
              {
                fromBlock: tag,
                toBlock: tag,
                address: tokenContracts,
                topics: [transferTopic, null, recipientTopic],
              },
            ],
          });
          for (const log of logs) {
            if (!log.address || !log.transactionHash || !log.logIndex) continue;
            try {
              await saveIncomingTransfer({
                hash: log.transactionHash,
                tokenAddress: log.address,
                logIndex: log.logIndex,
              });
            } catch (saveError) {
              successful = false;
              setScanError(
                saveError instanceof Error
                  ? saveError.message
                  : "A detected deposit could not be saved.",
              );
            }
          }
        }
      } catch {
        successful = false;
        setScanError(
          "The connected wallet could not check this block. Keep this page open and try again.",
        );
      }
      return successful;
    }

    async function scanLatest() {
      if (scanning) return;
      scanning = true;
      try {
        const latest = BigInt(
          await walletProvider!.request<string>({ method: "eth_blockNumber" }),
        );
        if (lastScannedBlock === null) {
          lastScannedBlock =
            latest > BigInt(12) ? latest - BigInt(12) : BigInt(0);
        }

        const scanStart = lastScannedBlock + BigInt(1);
        const scanEnd =
          latest - lastScannedBlock > BigInt(3)
            ? lastScannedBlock + BigInt(3)
            : latest;
        for (let block = scanStart; block <= scanEnd; block += BigInt(1)) {
          if (cancelled) return;
          const saved = await postForBlock(block);
          if (!saved) return;
          lastScannedBlock = block;
        }
        setScanError("");
        setScanStatus("Watching for new deposits. Keep this page open.");
      } catch {
        if (!cancelled) {
          setScanError("Could not connect to the selected blockchain network.");
        }
      } finally {
        scanning = false;
      }
    }

    void scanLatest();
    const timer = window.setInterval(() => void scanLatest(), 12000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [
    saveIncomingTransfer,
    supportedConnection,
    tokens,
    user,
    walletConnection,
    walletProvider,
  ]);

  const copyAddress = useCallback(async () => {
    if (!walletConnection) return;
    try {
      await navigator.clipboard.writeText(walletConnection.address);
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 1500);
    } catch {
      setStatus("failed");
      window.setTimeout(() => setStatus("idle"), 2000);
    }
  }, [walletConnection]);

  return (
    <>
      <WalletPageHeader active="Receive" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-7 pb-28 sm:px-6 sm:py-10 sm:pb-10">
        <div className="mx-auto max-w-xl">
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#16875a]">
            On-chain deposits
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Receive crypto
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#77828a] dark:text-[#aebac0]">
            Receive funds directly to your connected wallet. Deposits are
            verified on-chain and saved to your account activity.
          </p>

          <section className="mt-6 rounded-2xl border border-[#293238] bg-[#171e23] p-4 text-[#e9eef0] sm:p-6">
            <label className="block text-[11px] font-semibold text-[#aebac0]">
              Network to receive on
              <select
                value={chainId}
                onChange={(event) =>
                  setChainId(Number(event.target.value) as TradeChainId)
                }
                className="mt-1.5 h-11 w-full rounded-xl border border-[#3a474f] bg-[#202930] px-3 text-sm text-white outline-none"
              >
                <option value={1}>Ethereum</option>
                <option value={8453}>Base</option>
              </select>
            </label>

            {walletConnection ? (
              <>
                <div className="mt-4 rounded-xl border border-[#3a474f] bg-[#202930] p-3">
                  <p className="text-[10px] font-semibold text-[#8998a1]">
                    Your connected wallet address
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-white">
                    {walletConnection.address}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void copyAddress()}
                    className="h-10 rounded-xl border border-[#3a474f] px-4 text-xs font-semibold text-[#d4dde1] transition hover:bg-[#263138] active:scale-95"
                  >
                    Copy address
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalletOpen(true)}
                    className="h-10 rounded-xl border border-[#3a474f] px-4 text-xs font-semibold text-[#d4dde1] transition hover:bg-[#263138] active:scale-95"
                  >
                    Change wallet
                  </button>
                  <span className="flex items-center text-[10px] text-[#8998a1]">
                    {walletConnection.chainName}
                  </span>
                </div>
                {status === "copied" ? (
                  <p className="mt-2 text-xs text-[#a9dfbf]">Address copied.</p>
                ) : null}
                {status === "failed" ? (
                  <p className="mt-2 text-xs text-[#f0a5a5]">
                    Copy failed. Select the address to copy it manually.
                  </p>
                ) : null}
                {!supportedConnection ? (
                  <p className="mt-3 rounded-xl bg-amber-500/10 px-3 py-2.5 text-[11px] leading-5 text-amber-200">
                    Switch your connected wallet to {tradeChains[chainId].name}
                    before sharing this address for a deposit.
                  </p>
                ) : (
                  <p className="mt-3 rounded-xl bg-[#1d2a23] px-3 py-2.5 text-[11px] leading-5 text-[#bfe0cb]">
                    {scanStatus || "Starting deposit monitor…"}
                  </p>
                )}
                {scanError ? (
                  <p
                    role="status"
                    className="mt-2 text-[11px] leading-5 text-[#f0a5a5]"
                  >
                    {scanError}
                  </p>
                ) : null}
              </>
            ) : (
              <button
                type="button"
                disabled={checkingAuth}
                onClick={() => setWalletOpen(true)}
                className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#075b9d] px-5 text-sm font-bold text-white transition hover:bg-[#064c82] active:scale-[.99]"
              >
                Connect wallet to receive
              </button>
            )}
          </section>

          <section className="mt-5 rounded-2xl border border-[#293238] bg-[#171e23] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold">Recent deposits</h2>
              <span className="text-[10px] text-[#8998a1]">
                Saved to your account
              </span>
            </div>
            {transactions.filter((item) => item.type === "receive").length ? (
              <div className="mt-2 divide-y divide-[#293238]">
                {transactions
                  .filter((item) => item.type === "receive")
                  .slice(0, 5)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 py-3"
                    >
                      <div>
                        <p className="text-xs font-semibold">
                          +{item.amount} {item.assetCode}
                        </p>
                        <p className="mt-1 text-[10px] text-[#8998a1]">
                          {tradeChains[item.chainId].name} · Confirmed
                        </p>
                      </div>
                      <a
                        href={`${tradeChains[item.chainId].explorer}/tx/${item.hash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-semibold text-[#71b8ea]"
                      >
                        View
                      </a>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="mt-3 rounded-xl bg-[#202930] px-3 py-4 text-xs leading-5 text-[#8998a1]">
                Verified deposits will appear here once detected.
              </p>
            )}
          </section>
          <p className="mt-3 text-[10px] leading-5 text-[#8998a1]">
            This page monitors new Ethereum and Base blocks while it remains
            open. Do not send assets over a different network or token standard.
          </p>
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
      <MobileWalletNav active="Receive" />
    </>
  );
}
