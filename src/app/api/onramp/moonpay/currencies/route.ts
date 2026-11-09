import { NextResponse } from "next/server";

const moonPayApi = "https://api.moonpay.com/v3";

type MoonPayCurrency = {
  type?: string;
  code?: string;
  name?: string;
  networkCode?: string;
  minBuyAmount?: number;
  maxBuyAmount?: number;
  isSuspended?: boolean;
};

export async function GET() {
  const apiKey = process.env.NEXT_PUBLIC_MOONPAY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "MoonPay checkout is not configured yet. Add your publishable API key to the server environment.",
      },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(
      `${moonPayApi}/currencies?apiKey=${encodeURIComponent(apiKey)}`,
      {
        headers: { accept: "application/json" },
        next: { revalidate: 900 },
      },
    );
    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            "MoonPay currencies are temporarily unavailable. Please try again shortly.",
        },
        { status: 503 },
      );
    }

    const currencies = (await response.json()) as MoonPayCurrency[];
    const supported = currencies
      .filter(
        (currency) =>
          currency.code &&
          currency.name &&
          currency.type &&
          !currency.isSuspended,
      )
      .map((currency) => ({
        type: currency.type,
        code: currency.code,
        name: currency.name,
        networkCode: currency.networkCode ?? "",
        minBuyAmount: currency.minBuyAmount ?? null,
        maxBuyAmount: currency.maxBuyAmount ?? null,
      }));

    return NextResponse.json({ currencies: supported });
  } catch {
    return NextResponse.json(
      {
        error:
          "Could not reach MoonPay right now. Check your connection and try again.",
      },
      { status: 503 },
    );
  }
}
