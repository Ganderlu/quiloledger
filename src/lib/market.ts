export type MarketCurrency = "ngn" | "usd" | "eur";

export type MarketCoin = {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number | null;
  price_change_percentage_24h: number | null;
  market_cap_rank: number | null;
  market_cap: number | null;
  total_volume: number | null;
  high_24h: number | null;
  low_24h: number | null;
};

export type MarketResponse = {
  coins: MarketCoin[];
  currency: MarketCurrency;
  updatedAt: string;
};

export type CoinDetail = MarketCoin & {
  price_change_24h: number | null;
  circulating_supply: number | null;
  total_supply: number | null;
  max_supply: number | null;
  homepage: string | null;
};

export type CoinDetailResponse = {
  coin: CoinDetail;
  chart: [number, number][];
  currency: MarketCurrency;
  updatedAt: string;
};

export function normalizeMarketCurrency(value: string | null): MarketCurrency {
  if (value?.toLowerCase() === "usd" || value?.toLowerCase() === "eur") {
    return value.toLowerCase() as MarketCurrency;
  }
  return "ngn";
}

export function formatMarketPrice(
  value: number | null | undefined,
  currency: MarketCurrency,
) {
  if (value == null || !Number.isFinite(value)) return "Price unavailable";

  const fractionDigits = value < 0.01 ? 8 : value < 1 ? 6 : value < 100 ? 4 : 2;
  return new Intl.NumberFormat(
    currency === "ngn" ? "en-NG" : currency === "eur" ? "en-IE" : "en-US",
    {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: value < 1 ? Math.min(4, fractionDigits) : 2,
      maximumFractionDigits: fractionDigits,
    },
  ).format(value);
}
