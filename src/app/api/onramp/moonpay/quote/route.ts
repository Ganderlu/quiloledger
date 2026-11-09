import { NextRequest, NextResponse } from "next/server";

const moonPayApi = "https://api.moonpay.com/v3";

type MoonPayQuote = {
  baseCurrencyCode?: string;
  baseCurrencyAmount?: number;
  quoteCurrencyCode?: string;
  quoteCurrencyAmount?: number;
  quoteCurrencyPrice?: number;
  paymentMethod?: string;
  feeAmount?: number;
  networkFeeAmount?: number;
  totalAmount?: number;
  expiresAt?: string | null;
};

export async function POST(request: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_MOONPAY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "MoonPay checkout is not configured yet." },
      { status: 503 },
    );
  }

  let input: {
    currencyCode?: unknown;
    baseCurrencyCode?: unknown;
    baseCurrencyAmount?: unknown;
  };
  try {
    input = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Enter a valid purchase amount and currency." },
      { status: 400 },
    );
  }

  const currencyCode =
    typeof input.currencyCode === "string"
      ? input.currencyCode.toLowerCase()
      : "";
  const baseCurrencyCode =
    typeof input.baseCurrencyCode === "string"
      ? input.baseCurrencyCode.toLowerCase()
      : "";
  const baseCurrencyAmount = Number(input.baseCurrencyAmount);

  if (!/^[a-z0-9_-]{2,40}$/.test(currencyCode)) {
    return NextResponse.json(
      { error: "Choose a cryptocurrency supported by MoonPay." },
      { status: 400 },
    );
  }
  if (!/^[a-z]{3}$/.test(baseCurrencyCode)) {
    return NextResponse.json(
      { error: "Choose a valid payment currency." },
      { status: 400 },
    );
  }
  if (
    !Number.isFinite(baseCurrencyAmount) ||
    baseCurrencyAmount < 20 ||
    baseCurrencyAmount > 10000
  ) {
    return NextResponse.json(
      { error: "Enter an amount between 20 and 10,000." },
      { status: 400 },
    );
  }

  const params = new URLSearchParams({
    apiKey,
    baseCurrencyAmount: String(baseCurrencyAmount),
    baseCurrencyCode,
  });

  try {
    const response = await fetch(
      `${moonPayApi}/currencies/${encodeURIComponent(currencyCode)}/buy_quote?${params.toString()}`,
      {
        headers: { accept: "application/json" },
        cache: "no-store",
      },
    );
    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            response.status === 429
              ? "MoonPay is receiving too many quote requests. Please try again shortly."
              : "MoonPay could not quote this amount and asset. Try a supported currency or a different amount.",
        },
        { status: response.status === 429 ? 503 : 422 },
      );
    }

    const quote = (await response.json()) as MoonPayQuote;
    if (
      typeof quote.quoteCurrencyAmount !== "number" ||
      typeof quote.quoteCurrencyCode !== "string"
    ) {
      return NextResponse.json(
        { error: "MoonPay returned an incomplete quote. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      quote: {
        baseCurrencyCode: quote.baseCurrencyCode ?? baseCurrencyCode,
        baseCurrencyAmount: quote.baseCurrencyAmount ?? baseCurrencyAmount,
        quoteCurrencyCode: quote.quoteCurrencyCode,
        quoteCurrencyAmount: quote.quoteCurrencyAmount,
        quoteCurrencyPrice: quote.quoteCurrencyPrice ?? null,
        paymentMethod: quote.paymentMethod ?? null,
        feeAmount: quote.feeAmount ?? null,
        networkFeeAmount: quote.networkFeeAmount ?? null,
        totalAmount: quote.totalAmount ?? null,
        expiresAt: quote.expiresAt ?? null,
      },
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not reach MoonPay for a quote. Please try again." },
      { status: 503 },
    );
  }
}
