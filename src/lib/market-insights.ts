import type { MarketCoin } from "./market";

export type SectorId =
  | "lst"
  | "solana"
  | "memes"
  | "defi"
  | "ai"
  | "others";

export type SectorMeta = {
  id: SectorId;
  label: string;
  shortLabel: string;
  tint: string;
  text: string;
};

export const sectorMeta: SectorMeta[] = [
  {
    id: "lst",
    label: "Liquid Staking",
    shortLabel: "Yield",
    tint: "rgba(34,197,94,0.10)",
    text: "#15803d",
  },
  {
    id: "solana",
    label: "Solana Ecosystem",
    shortLabel: "SOL Eco",
    tint: "rgba(255,138,76,0.10)",
    text: "#c2410c",
  },
  {
    id: "memes",
    label: "Memecoins",
    shortLabel: "Memes",
    tint: "rgba(244,114,182,0.12)",
    text: "#be185d",
  },
  {
    id: "defi",
    label: "Decentralized Finance",
    shortLabel: "DeFi",
    tint: "rgba(99,102,241,0.10)",
    text: "#4338ca",
  },
  {
    id: "ai",
    label: "Artificial Intelligence",
    shortLabel: "AI",
    tint: "rgba(56,189,248,0.12)",
    text: "#0369a1",
  },
  {
    id: "others",
    label: "Other Assets",
    shortLabel: "Others",
    tint: "rgba(148,163,184,0.12)",
    text: "#475569",
  },
];

const sectorKeywords: Record<Exclude<SectorId, "others">, string[]> = {
  lst: [
    "lido",
    "rocket-pool",
    "frax-share",
    "frax",
    "staked-ether",
    "steth",
    "rocket-pool",
    "coinbase-wrapped-staked-eth",
    "wrapped-beacon-eth",
    "ancient",
    "ether-fi",
    "swell",
    "pyth-network",
    "jupiter",
  ],
  solana: [
    "solana",
    "jupiter",
    "raydium",
    "orca",
    "bonk",
    "dogwif",
    "kamino",
    "marginfi",
    "drift",
    "marinade",
    "jito",
    "helius",
    "tensor",
    "shyft",
    "helium",
    "render-token",
    "pyth",
    "wormhole",
    "stepn",
    "star-atlas",
    "samoyedcoin",
  ],
  memes: [
    "dogecoin",
    "shiba",
    "pepe",
    "dogwif",
    "bonk",
    "floki",
    "baby-doge",
    "dogelon",
    "neiro",
    "memecoin",
    "snek",
    "brett",
    "mog-coin",
    "bome",
    "slothana",
    "pepe2",
    "moonriver",
    "tamadoge",
    "babydoge",
    "shib",
    "doge",
  ],
  defi: [
    "uniswap",
    "aave",
    "maker",
    "compound",
    "curve-dao",
    "convex",
    "1inch",
    "pancakeswap",
    "dydx",
    "synthetix",
    "pendle",
    "yearn",
    "balancer",
    "sushi",
    "gnosis",
    "uma",
    "0x",
    "band",
    "chainlink",
    "api3",
    "gmx",
    "kwenta",
    "thales",
    "lyra",
    "gains-network",
  ],
  ai: [
    "fetch-ai",
    "singularitynet",
    "render",
    "the-graph",
    "akash",
    "ocean-protocol",
    "numeraire",
    "artificial",
    "bittensor",
    "autonolas",
    "vectorspace",
    "covalent",
    "deepbrain",
    "worldcoin",
    "alias",
    "sia",
    "io",
    "near",
    "arbitrum",
    "optimism",
  ],
};

export function getSectorId(coin: MarketCoin): SectorId {
  const id = coin.id.toLowerCase();
  const symbol = coin.symbol.toLowerCase();
  for (const sectorId of Object.keys(sectorKeywords) as Exclude<
    SectorId,
    "others"
  >[]) {
    if (sectorKeywords[sectorId].some((kw) => id.includes(kw) || symbol.includes(kw))) {
      return sectorId;
    }
  }
  return "others";
}

export function getSectorMeta(sectorId: SectorId): SectorMeta {
  return sectorMeta.find((s) => s.id === sectorId) ?? sectorMeta[sectorMeta.length - 1];
}

export type SectorSummary = {
  id: SectorId;
  label: string;
  shortLabel: string;
  change: number;
  coins: MarketCoin[];
};

export function getSectorSummaries(coins: MarketCoin[]): SectorSummary[] {
  const groups = new Map<SectorId, MarketCoin[]>();
  for (const coin of coins) {
    const sid = getSectorId(coin);
    const list = groups.get(sid) ?? [];
    list.push(coin);
    groups.set(sid, list);
  }

  return sectorMeta.map((meta) => {
    const items = groups.get(meta.id) ?? [];
    const changes = items
      .map((c) => c.price_change_percentage_24h)
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    const change =
      changes.length > 0
        ? changes.reduce((sum, v) => sum + v, 0) / changes.length
        : 0;
    return {
      id: meta.id,
      label: meta.label,
      shortLabel: meta.shortLabel,
      change,
      coins: items,
    };
  });
}

/**
 * Picks an "AI Pick" coin: the highest 24h momentum asset among the top 20
 * by market cap. Falls back to the highest market cap coin available.
 */
export function getAiPick(coins: MarketCoin[]): MarketCoin | null {
  const largeCaps = coins
    .filter((c) => (c.market_cap_rank ?? 9999) <= 25)
    .sort((a, b) => (a.market_cap_rank ?? 9999) - (b.market_cap_rank ?? 9999));

  if (largeCaps.length === 0) {
    return coins.length > 0 ? coins[0] : null;
  }

  const top = [...largeCaps].slice(0, 12);
  const best = [...top].sort(
    (a, b) =>
      (b.price_change_percentage_24h ?? -Infinity) -
      (a.price_change_percentage_24h ?? -Infinity),
  )[0];

  return best ?? largeCaps[0] ?? null;
}

/**
 * Estimates a whale long/short ratio from on-chain style signals:
 * - 24h price momentum
 * - volume relative to market cap (turnover)
 * Returns a long percentage clamped to [35, 70].
 */
export function getWhaleLongRatio(coin: MarketCoin): number {
  const change = coin.price_change_percentage_24h ?? 0;
  const mcap = coin.market_cap ?? 0;
  const vol = coin.total_volume ?? 0;
  const turnover = mcap > 0 ? Math.min(vol / mcap, 1) : 0;

  const momentum = Math.max(-12, Math.min(12, change * 1.5));
  const volumeScore = turnover * 18;
  const long = 50 + momentum + volumeScore;

  return Math.round(Math.max(35, Math.min(70, long)));
}

export type NewsItem = {
  id: string;
  tag: string;
  title: string;
  source: string;
  url: string;
};

export const newsFeed: NewsItem[] = [
  {
    id: "n1",
    tag: "News",
    title: "QuiloxLedger Market Intelligence: Weekly institutional flow update",
    source: "QuiloxLedger Research",
    url: "/docs",
  },
  {
    id: "n2",
    tag: "Insight",
    title: "ETF inflows stay positive as large-cap dominance holds steady",
    source: "QuiloxLedger Research",
    url: "/docs",
  },
  {
    id: "n3",
    tag: "News",
    title: "Layer-2 activity climbs as settlement fees trend lower",
    source: "QuiloxLedger Research",
    url: "/docs",
  },
  {
    id: "n4",
    tag: "Insight",
    title: "DeFi yield spreads tighten amid stablecoin demand growth",
    source: "QuiloxLedger Research",
    url: "/docs",
  },
  {
    id: "n5",
    tag: "News",
    title: "AI sector tokens lead gains as compute demand accelerates",
    source: "QuiloxLedger Research",
    url: "/docs",
  },
];

export function getNewsForCoin(coin: MarketCoin | null): NewsItem {
  if (!coin) return newsFeed[0];
  const idx =
    Math.abs(hashString(coin.id)) % newsFeed.length;
  return newsFeed[idx];
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
