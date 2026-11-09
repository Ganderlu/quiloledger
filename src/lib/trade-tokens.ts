export type TradeChainId = 1 | 8453;

export type TradeToken = {
  chainId: TradeChainId;
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  color: string;
};

export const NATIVE_TOKEN_ADDRESS =
  "0x0000000000000000000000000000000000000000";

export const tradeChains: Record<
  TradeChainId,
  {
    name: string;
    nativeSymbol: string;
    hexId: string;
    explorer: string;
    rpcUrls: string[];
  }
> = {
  1: {
    name: "Ethereum",
    nativeSymbol: "ETH",
    hexId: "0x1",
    explorer: "https://etherscan.io",
    rpcUrls: ["https://cloudflare-eth.com"],
  },
  8453: {
    name: "Base",
    nativeSymbol: "ETH",
    hexId: "0x2105",
    explorer: "https://basescan.org",
    rpcUrls: ["https://mainnet.base.org"],
  },
};

const tokens: TradeToken[] = [
  {
    chainId: 1,
    symbol: "ETH",
    name: "Ether",
    address: NATIVE_TOKEN_ADDRESS,
    decimals: 18,
    color: "#627eea",
  },
  {
    chainId: 1,
    symbol: "WETH",
    name: "Wrapped Ether",
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    decimals: 18,
    color: "#7487d8",
  },
  {
    chainId: 1,
    symbol: "USDC",
    name: "USD Coin",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
    color: "#2775ca",
  },
  {
    chainId: 1,
    symbol: "USDT",
    name: "Tether",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    decimals: 6,
    color: "#26a17b",
  },
  {
    chainId: 1,
    symbol: "DAI",
    name: "Dai",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    decimals: 18,
    color: "#f5ac37",
  },
  {
    chainId: 1,
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    decimals: 8,
    color: "#f7931a",
  },
  {
    chainId: 8453,
    symbol: "ETH",
    name: "Ether",
    address: NATIVE_TOKEN_ADDRESS,
    decimals: 18,
    color: "#627eea",
  },
  {
    chainId: 8453,
    symbol: "WETH",
    name: "Wrapped Ether",
    address: "0x4200000000000000000000000000000000000006",
    decimals: 18,
    color: "#7487d8",
  },
  {
    chainId: 8453,
    symbol: "USDC",
    name: "USD Coin",
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    decimals: 6,
    color: "#2775ca",
  },
  {
    chainId: 8453,
    symbol: "DAI",
    name: "Dai",
    address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    decimals: 18,
    color: "#f5ac37",
  },
  {
    chainId: 8453,
    symbol: "cbBTC",
    name: "Coinbase Wrapped BTC",
    address: "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf",
    decimals: 8,
    color: "#f7931a",
  },
];

export function getTradeTokens(chainId: TradeChainId) {
  return tokens.filter((token) => token.chainId === chainId);
}

export function findTradeToken(chainId: number, address: string) {
  return tokens.find(
    (token) =>
      token.chainId === chainId &&
      token.address.toLowerCase() === address.toLowerCase(),
  );
}

export function parseTokenAmount(value: string, decimals: number) {
  const normalized = value.trim();
  if (!/^(?:\d+\.?\d*|\.\d+)$/.test(normalized)) {
    throw new Error("Enter a valid token amount.");
  }
  const [whole = "0", fraction = ""] = normalized.split(".");
  if (fraction.length > decimals) {
    throw new Error(`This token supports up to ${decimals} decimal places.`);
  }
  return (
    BigInt(whole || "0") * BigInt(10) ** BigInt(decimals) +
    BigInt((fraction + "0".repeat(decimals)).slice(0, decimals) || "0")
  ).toString();
}

export function formatTokenAmount(value: string, decimals: number) {
  try {
    const raw = BigInt(value);
    const scale = BigInt(10) ** BigInt(decimals);
    const whole = raw / scale;
    const fraction = (raw % scale)
      .toString()
      .padStart(decimals, "0")
      .replace(/0+$/, "");
    return fraction ? `${whole}.${fraction}` : whole.toString();
  } catch {
    return "0";
  }
}
