import { NextRequest, NextResponse } from "next/server";
import {
  normalizeMarketCurrency,
  type MarketCoin,
} from "@/lib/market";

const apiBase = "https://api.coingecko.com/api/v3";

async function getCoinGecko<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, {
    headers: { accept: "application/json" },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const error = new Error("Market data provider request failed.");
    Object.assign(error, { status: response.status });
    throw error;
  }

  return response.json() as Promise<T>;
}

function failureResponse(error: unknown) {
  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
      ? error.status
      : 503;
  const message =
    status === 429
      ? "Market data is temporarily busy. Please try again in a moment."
      : "Live market data is temporarily unavailable. Please try again.";
  return NextResponse.json({ error: message }, { status: 503 });
}

function parsePerPage(value: string | null, fallback: number) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(250, parsed));
}

export async function GET(request: NextRequest) {
  const currency = normalizeMarketCurrency(
    request.nextUrl.searchParams.get("currency"),
  );
  const query = request.nextUrl.searchParams.get("query")?.trim().slice(0, 80);
  const perPage = parsePerPage(request.nextUrl.searchParams.get("per_page"), 50);

  try {
    if (query) {
      const search = await getCoinGecko<{
        coins: { id: string; market_cap_rank: number | null }[];
      }>(`/search?query=${encodeURIComponent(query)}`);
      const candidates = search.coins
        .filter((coin) => coin.id)
        .sort(
          (left, right) =>
            (left.market_cap_rank ?? Number.MAX_SAFE_INTEGER) -
            (right.market_cap_rank ?? Number.MAX_SAFE_INTEGER),
        )
        .slice(0, 20);

      if (candidates.length === 0) {
        return NextResponse.json({
          coins: [],
          currency,
          updatedAt: new Date().toISOString(),
        });
      }

      const ids = candidates.map((coin) => coin.id).join(",");
      const coins = await getCoinGecko<MarketCoin[]>(
        `/coins/markets?vs_currency=${currency}&ids=${encodeURIComponent(ids)}&order=market_cap_desc&per_page=20&page=1&sparkline=false`,
      );

      return NextResponse.json({
        coins,
        currency,
        updatedAt: new Date().toISOString(),
      });
    }

    const coins = await getCoinGecko<MarketCoin[]>(
      `/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${perPage}&page=1&sparkline=false`,
    );

    return NextResponse.json({
      coins,
      currency,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Market list request failed:", error);
    return failureResponse(error);
  }
}
