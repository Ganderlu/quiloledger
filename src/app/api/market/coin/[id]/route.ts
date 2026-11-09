import { NextRequest, NextResponse } from "next/server";
import {
  normalizeMarketCurrency,
  type CoinDetail,
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
      : "Live coin information is temporarily unavailable. Please try again.";
  return NextResponse.json({ error: message }, { status: 503 });
}

function safeHomepage(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!/^[a-z0-9-]{1,100}$/i.test(id)) {
    return NextResponse.json({ error: "Invalid coin identifier." }, { status: 400 });
  }

  const currency = normalizeMarketCurrency(
    request.nextUrl.searchParams.get("currency"),
  );
  const requestedDays = request.nextUrl.searchParams.get("days");
  const days = ["1", "7", "30"].includes(requestedDays ?? "")
    ? requestedDays
    : "1";

  try {
    const [details, chart] = await Promise.all([
      getCoinGecko<{
        id: string;
        name: string;
        symbol: string;
        image: { large?: string; small?: string };
        market_cap_rank: number | null;
        links: { homepage?: string[] };
        market_data: {
          current_price: Record<string, number>;
          price_change_24h_in_currency?: Record<string, number>;
          price_change_percentage_24h_in_currency?: Record<string, number>;
          market_cap: Record<string, number>;
          total_volume: Record<string, number>;
          high_24h: Record<string, number>;
          low_24h: Record<string, number>;
          circulating_supply: number | null;
          total_supply: number | null;
          max_supply: number | null;
        };
      }>(
        `/coins/${encodeURIComponent(id)}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
      ),
      getCoinGecko<{ prices?: [number, number][] }>(
        `/coins/${encodeURIComponent(id)}/market_chart?vs_currency=${currency}&days=${days}`,
      ).catch(() => null),
    ]);

    const data = details.market_data;
    const coin: CoinDetail = {
      id: details.id,
      name: details.name,
      symbol: details.symbol,
      image: details.image.large ?? details.image.small ?? "",
      current_price: data.current_price[currency] ?? null,
      price_change_24h: data.price_change_24h_in_currency?.[currency] ?? null,
      price_change_percentage_24h:
        data.price_change_percentage_24h_in_currency?.[currency] ?? null,
      market_cap_rank: details.market_cap_rank,
      market_cap: data.market_cap[currency] ?? null,
      total_volume: data.total_volume[currency] ?? null,
      high_24h: data.high_24h[currency] ?? null,
      low_24h: data.low_24h[currency] ?? null,
      circulating_supply: data.circulating_supply,
      total_supply: data.total_supply,
      max_supply: data.max_supply,
      homepage: safeHomepage(details.links.homepage?.[0]),
    };

    return NextResponse.json({
      coin,
      chart: chart?.prices ?? [],
      currency,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Coin detail request failed:", error);
    return failureResponse(error);
  }
}
