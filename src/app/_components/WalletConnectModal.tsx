"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

export type WalletConnection = {
  address: string;
  chainId: string;
  chainName: string;
  nativeSymbol: string;
  nativeBalance: string;
  walletName: string;
};

type WalletProviderInfo = {
  uuid: string;
  name: string;
  icon: string;
  rdns?: string;
};

export type BrowserWalletProvider = {
  request<T = unknown>(args: {
    method: string;
    params?: unknown[];
  }): Promise<T>;
  on?: (event: string, listener: (value: unknown) => void) => void;
  removeListener?: (event: string, listener: (value: unknown) => void) => void;
  isMetaMask?: boolean;
  isTrust?: boolean;
  isCoinbaseWallet?: boolean;
  providers?: BrowserWalletProvider[];
};

type DiscoveredWallet = {
  provider: BrowserWalletProvider;
  info: WalletProviderInfo;
};

declare global {
  interface Window {
    ethereum?: BrowserWalletProvider;
  }
}

const chainDetails: Record<
  string,
  {
    name: string;
    symbol: string;
    chainName: string;
    rpcUrls: string[];
    blockExplorerUrls: string[];
  }
> = {
  "0x1": {
    name: "Ethereum",
    symbol: "ETH",
    chainName: "Ethereum Mainnet",
    rpcUrls: ["https://cloudflare-eth.com"],
    blockExplorerUrls: ["https://etherscan.io"],
  },
  "0x89": {
    name: "Polygon",
    symbol: "POL",
    chainName: "Polygon",
    rpcUrls: ["https://polygon-rpc.com"],
    blockExplorerUrls: ["https://polygonscan.com"],
  },
  "0x2105": {
    name: "Base",
    symbol: "ETH",
    chainName: "Base",
    rpcUrls: ["https://mainnet.base.org"],
    blockExplorerUrls: ["https://basescan.org"],
  },
  "0x38": {
    name: "BNB Smart Chain",
    symbol: "BNB",
    chainName: "BNB Smart Chain",
    rpcUrls: ["https://bsc-dataseed.binance.org"],
    blockExplorerUrls: ["https://bscscan.com"],
  },
  "0xa4b1": {
    name: "Arbitrum One",
    symbol: "ETH",
    chainName: "Arbitrum One",
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://arbiscan.io"],
  },
};

const walletInstallLinks = [
  { name: "MetaMask", href: "https://metamask.io/download/" },
  { name: "Trust Wallet", href: "https://trustwallet.com/download" },
  {
    name: "Coinbase Wallet",
    href: "https://www.coinbase.com/wallet/downloads",
  },
];

const storageKey = "qlx-wallet-connection";

function identifyWallet(provider: BrowserWalletProvider) {
  if (provider.isTrust) return "Trust Wallet";
  if (provider.isCoinbaseWallet) return "Coinbase Wallet";
  if (provider.isMetaMask) return "MetaMask";
  return "Browser wallet";
}

function friendlyWalletError(error: unknown) {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? error.code
      : undefined;
  if (code === 4001) return "Connection request was declined in your wallet.";
  if (code === -32002) {
    return "There is already a wallet request waiting for your approval.";
  }
  if (error instanceof Error && error.message) return error.message;
  return "We could not connect to that wallet. Please try again.";
}

function saveConnection(connection: WalletConnection | null) {
  try {
    if (connection) {
      localStorage.setItem(storageKey, JSON.stringify(connection));
    } else {
      localStorage.removeItem(storageKey);
    }
  } catch {}
}

export function WalletConnectModal({
  open,
  onClose,
  connection,
  onConnectionChange,
  onProviderChange,
}: {
  open: boolean;
  onClose: () => void;
  connection: WalletConnection | null;
  onConnectionChange: (connection: WalletConnection | null) => void;
  onProviderChange?: (provider: BrowserWalletProvider | null) => void;
}) {
  const [wallets, setWallets] = useState<DiscoveredWallet[]>([]);
  const [connecting, setConnecting] = useState("");
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [error, setError] = useState("");
  const activeProvider = useRef<BrowserWalletProvider | null>(null);
  const activeWalletName = useRef("");
  const connectedAddress = useRef("");
  const refreshConnectionRef = useRef<() => Promise<void>>(async () => {});
  const eventListeners = useRef<
    { event: string; listener: (value: unknown) => void }[]
  >([]);

  const publishConnection = useCallback(
    (next: WalletConnection | null) => {
      saveConnection(next);
      onConnectionChange(next);
    },
    [onConnectionChange],
  );

  const refreshConnection = useCallback(async () => {
    const provider = activeProvider.current;
    const address = connectedAddress.current;
    if (!provider || !address) return;

    setLoadingBalance(true);
    try {
      const chainId = await provider.request<string>({ method: "eth_chainId" });
      const chain = chainDetails[chainId.toLowerCase()];
      let nativeBalance = "Unavailable";
      if (chain) {
        try {
          const balanceHex = await provider.request<string>({
            method: "eth_getBalance",
            params: [address, "latest"],
          });
          const amount = Number(BigInt(balanceHex)) / 1e18;
          nativeBalance = Number.isFinite(amount)
            ? amount.toFixed(6)
            : "Unavailable";
        } catch {}
      }

      publishConnection({
        address,
        chainId,
        chainName: chain?.name ?? `Unsupported network (${chainId})`,
        nativeSymbol: chain?.symbol ?? "Native token",
        nativeBalance,
        walletName: activeWalletName.current || "Browser wallet",
      });
    } catch (refreshError) {
      setError(friendlyWalletError(refreshError));
    } finally {
      setLoadingBalance(false);
    }
  }, [publishConnection]);

  useEffect(() => {
    refreshConnectionRef.current = refreshConnection;
  }, [refreshConnection]);

  useEffect(() => {
    if (!open) return;
    const discovered = new Map<string, DiscoveredWallet>();
    const addWallet = (
      provider: BrowserWalletProvider,
      info?: Partial<WalletProviderInfo>,
    ) => {
      const name = info?.name || identifyWallet(provider);
      const key = info?.uuid || info?.rdns || name;
      discovered.set(key, {
        provider,
        info: {
          uuid: key,
          name,
          icon: info?.icon || "",
          rdns: info?.rdns,
        },
      });
      setWallets(Array.from(discovered.values()));
    };

    const onAnnounce = (event: Event) => {
      const detail = (
        event as CustomEvent<{
          info?: Partial<WalletProviderInfo>;
          provider?: BrowserWalletProvider;
        }>
      ).detail;
      if (detail?.provider) addWallet(detail.provider, detail.info);
    };

    window.addEventListener(
      "eip6963:announceProvider",
      onAnnounce as EventListener,
    );
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    const injected = window.ethereum;
    const legacyProviders = injected?.providers?.length
      ? injected.providers
      : injected
        ? [injected]
        : [];
    legacyProviders.forEach((provider) => addWallet(provider));

    const discoveryTimer = window.setTimeout(
      () => setWallets(Array.from(discovered.values())),
      500,
    );
    return () => {
      window.clearTimeout(discoveryTimer);
      window.removeEventListener(
        "eip6963:announceProvider",
        onAnnounce as EventListener,
      );
    };
  }, [open]);

  useEffect(() => {
    if (!open || !wallets.length || activeProvider.current) return;
    let saved: WalletConnection | null = connection;
    if (!saved) {
      try {
        saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
      } catch {}
    }
    if (!saved) return;

    const wallet = wallets.find((item) => item.info.name === saved?.walletName);
    if (!wallet) {
      publishConnection(null);
      return;
    }

    void wallet.provider
      .request<string[]>({ method: "eth_accounts" })
      .then((accounts) => {
        if (accounts[0]?.toLowerCase() !== saved?.address.toLowerCase()) {
          publishConnection(null);
          return;
        }
        activeProvider.current = wallet.provider;
        activeWalletName.current = wallet.info.name;
        connectedAddress.current = accounts[0];
        onProviderChange?.(wallet.provider);
        void refreshConnectionRef.current();
      })
      .catch(() => publishConnection(null));
  }, [connection, onProviderChange, open, publishConnection, wallets]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  useEffect(() => {
    const provider = activeProvider.current;
    if (!provider?.on) return;

    const handleAccounts = (value: unknown) => {
      const accounts = Array.isArray(value) ? value : [];
      if (typeof accounts[0] !== "string") {
        connectedAddress.current = "";
        onProviderChange?.(null);
        publishConnection(null);
        return;
      }
      connectedAddress.current = accounts[0];
      void refreshConnectionRef.current();
    };
    const handleChain = () => void refreshConnectionRef.current();
    const handleDisconnect = () => {
      connectedAddress.current = "";
      activeProvider.current = null;
      onProviderChange?.(null);
      publishConnection(null);
    };
    const listeners = [
      { event: "accountsChanged", listener: handleAccounts },
      { event: "chainChanged", listener: handleChain },
      { event: "disconnect", listener: handleDisconnect },
    ];
    listeners.forEach(({ event, listener }) => provider.on?.(event, listener));
    eventListeners.current = listeners;

    return () => {
      listeners.forEach(({ event, listener }) =>
        provider.removeListener?.(event, listener),
      );
    };
  }, [
    connection?.address,
    connection?.chainId,
    onProviderChange,
    publishConnection,
  ]);

  async function connectWallet(wallet: DiscoveredWallet) {
    setError("");
    setConnecting(wallet.info.uuid);
    try {
      const accounts = await wallet.provider.request<string[]>({
        method: "eth_requestAccounts",
      });
      const address = accounts[0];
      if (!address) throw new Error("Your wallet did not return an account.");

      activeProvider.current = wallet.provider;
      activeWalletName.current = wallet.info.name;
      connectedAddress.current = address;
      onProviderChange?.(wallet.provider);
      await refreshConnectionRef.current();
      setError("");
    } catch (connectError) {
      setError(friendlyWalletError(connectError));
    } finally {
      setConnecting("");
    }
  }

  async function switchNetwork(chainId: string) {
    const provider = activeProvider.current;
    const chain = chainDetails[chainId];
    if (!provider || !chain) return;
    setError("");

    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }],
      });
      await refreshConnectionRef.current();
    } catch (switchError) {
      const code =
        typeof switchError === "object" &&
        switchError !== null &&
        "code" in switchError
          ? switchError.code
          : undefined;
      if (code === 4902) {
        try {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId,
                chainName: chain.chainName,
                nativeCurrency: {
                  name: chain.symbol,
                  symbol: chain.symbol,
                  decimals: 18,
                },
                rpcUrls: chain.rpcUrls,
                blockExplorerUrls: chain.blockExplorerUrls,
              },
            ],
          });
          await refreshConnectionRef.current();
          return;
        } catch (addError) {
          setError(friendlyWalletError(addError));
          return;
        }
      }
      setError(friendlyWalletError(switchError));
    }
  }

  async function copyAddress() {
    if (!connection) return;
    try {
      await navigator.clipboard.writeText(connection.address);
      setError("");
    } catch {
      setError(
        "Could not copy the address. You can select it to copy manually.",
      );
    }
  }

  function disconnectWallet() {
    const provider = activeProvider.current;
    eventListeners.current.forEach(({ event, listener }) =>
      provider?.removeListener?.(event, listener),
    );
    eventListeners.current = [];
    activeProvider.current = null;
    activeWalletName.current = "";
    connectedAddress.current = "";
    onProviderChange?.(null);
    setError("");
    publishConnection(null);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-[#07131a]/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-modal-title"
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[26px] border border-white/60 bg-white p-5 shadow-2xl sm:rounded-[26px] sm:p-7 dark:border-[#344149] dark:bg-[#171e23]"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#dfe4e7] sm:hidden" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#16875a]">
              Secure connection
            </p>
            <h2
              id="wallet-modal-title"
              className="mt-1 text-xl font-bold tracking-tight text-[#273139] dark:text-white"
            >
              {connection ? "Your connected wallet" : "Connect a wallet"}
            </h2>
            <p className="mt-1.5 text-xs leading-5 text-[#77828a] dark:text-[#aebac0]">
              Connect an installed wallet to view its public address and
              on-chain native balance.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close wallet connection"
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f1f4f5] text-lg text-[#68737b] transition hover:bg-[#e7ecee] active:scale-95 dark:bg-[#29343a] dark:text-[#d0d8dc]"
          >
            ×
          </button>
        </div>

        {connection ? (
          <div className="mt-5 rounded-2xl border border-[#e5ebed] bg-[#f8fafb] p-4 dark:border-[#334047] dark:bg-[#202930]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#e5f4ec] text-sm font-bold text-[#16875a]">
                  {connection.walletName.slice(0, 1)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#303a41] dark:text-[#e9eef0]">
                    {connection.walletName}
                  </p>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-[#7f8a91]">
                    {connection.address}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={copyAddress}
                className="shrink-0 rounded-lg border border-[#dfe6e9] bg-white px-3 py-2 text-[10px] font-semibold text-[#52616a] transition hover:bg-[#f3f6f7] active:scale-95 dark:border-[#3a474f] dark:bg-[#182126] dark:text-[#d4dde1]"
              >
                Copy
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <div className="rounded-xl bg-white p-3 dark:bg-[#182126]">
                <p className="text-[10px] text-[#8b969d]">Network</p>
                <p className="mt-1 truncate text-xs font-semibold text-[#39454c] dark:text-[#e0e6e9]">
                  {connection.chainName}
                </p>
              </div>
              <div className="rounded-xl bg-white p-3 dark:bg-[#182126]">
                <p className="text-[10px] text-[#8b969d]">Native balance</p>
                <p className="mt-1 truncate text-xs font-semibold tabular-nums text-[#39454c] dark:text-[#e0e6e9]">
                  {loadingBalance
                    ? "Refreshing…"
                    : `${connection.nativeBalance} ${connection.nativeSymbol}`}
                </p>
              </div>
            </div>

            <label className="mt-3 block text-[10px] font-semibold text-[#758189]">
              Switch network
              <select
                value={
                  chainDetails[connection.chainId.toLowerCase()]
                    ? connection.chainId.toLowerCase()
                    : ""
                }
                onChange={(event) => void switchNetwork(event.target.value)}
                className="mt-1.5 h-10 w-full rounded-xl border border-[#e1e7e9] bg-white px-3 text-xs font-semibold text-[#3e4a51] outline-none transition focus:border-[#7fb3ce] dark:border-[#3a474f] dark:bg-[#182126] dark:text-[#e0e6e9]"
              >
                {!chainDetails[connection.chainId.toLowerCase()] ? (
                  <option value="">Unsupported network</option>
                ) : null}
                {Object.entries(chainDetails).map(([chainId, chain]) => (
                  <option key={chainId} value={chainId}>
                    {chain.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => void refreshConnection()}
                className="text-[11px] font-semibold text-[#075b9d] hover:underline"
              >
                Refresh balance
              </button>
              <button
                type="button"
                onClick={disconnectWallet}
                className="rounded-lg px-3 py-2 text-[11px] font-semibold text-[#b4494f] transition hover:bg-[#fff0f0] active:scale-95 dark:hover:bg-[#3a2528]"
              >
                Disconnect this app
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-5 space-y-2">
              {wallets.map((wallet) => (
                <button
                  key={wallet.info.uuid}
                  type="button"
                  disabled={Boolean(connecting)}
                  onClick={() => void connectWallet(wallet)}
                  className="flex min-h-[64px] w-full items-center gap-3 rounded-2xl border border-[#e7ecee] bg-white px-3.5 text-left transition hover:border-[#b8d1df] hover:bg-[#f8fbfc] active:scale-[.99] disabled:cursor-wait disabled:opacity-60 dark:border-[#344149] dark:bg-[#1b2429] dark:hover:bg-[#222e34]"
                >
                  {wallet.info.icon ? (
                    <Image
                      src={wallet.info.icon}
                      alt=""
                      width={38}
                      height={38}
                      unoptimized
                      className="h-[38px] w-[38px] rounded-xl object-cover"
                    />
                  ) : (
                    <span className="grid h-[38px] w-[38px] place-items-center rounded-xl bg-[#e9f3f9] text-sm font-bold text-[#075b9d] dark:bg-[#203746]">
                      {wallet.info.name.slice(0, 1)}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[#344149] dark:text-[#edf1f3]">
                      {wallet.info.name}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-[#929da4]">
                      Connect with your wallet app
                    </span>
                  </span>
                  <span className="text-sm text-[#8b969d]">
                    {connecting === wallet.info.uuid ? "Connecting…" : "→"}
                  </span>
                </button>
              ))}
            </div>

            {wallets.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-[#dce4e7] bg-[#f8fafb] px-4 py-5 text-center dark:border-[#344149] dark:bg-[#202930]">
                <p className="text-sm font-semibold text-[#48555d] dark:text-[#e0e6e9]">
                  No browser wallet detected
                </p>
                <p className="mt-1.5 text-xs leading-5 text-[#829098]">
                  Install a wallet extension, or open this page in your wallet
                  app’s built-in browser.
                </p>
              </div>
            ) : null}

            <div className="mt-4 grid grid-cols-3 gap-2">
              {walletInstallLinks.map((wallet) => (
                <a
                  key={wallet.name}
                  href={wallet.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-[#f2f5f6] px-2 py-2.5 text-center text-[10px] font-semibold text-[#627078] transition hover:bg-[#e9eef0] active:scale-[.98] dark:bg-[#263138] dark:text-[#c8d1d6]"
                >
                  Get {wallet.name}
                </a>
              ))}
            </div>
          </>
        )}

        {error ? (
          <p
            role="alert"
            className="mt-3 rounded-xl border border-[#f0d8cf] bg-[#fff8f5] px-3 py-2.5 text-xs leading-5 text-[#955340]"
          >
            {error}
          </p>
        ) : null}

        <p className="mt-4 text-center text-[10px] leading-5 text-[#98a1a7]">
          QuiloxLedger never asks for your recovery phrase or private key.
          Disconnecting here does not revoke access in your wallet settings.
        </p>
      </section>
    </div>
  );
}
