import { createHmac } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json(
      { error: "The checkout request origin is not allowed." },
      { status: 403 },
    );
  }

  const apiKey = process.env.NEXT_PUBLIC_MOONPAY_API_KEY;
  const secretKey = process.env.MOONPAY_SECRET_KEY;
  if (!apiKey || !secretKey) {
    return NextResponse.json(
      {
        error:
          "MoonPay wallet prefill is not configured. Add the publishable key and server-only secret.",
      },
      { status: 503 },
    );
  }

  let input: { urlForSignature?: unknown };
  try {
    input = await request.json();
  } catch {
    return NextResponse.json(
      { error: "A valid MoonPay checkout session is required." },
      { status: 400 },
    );
  }

  if (
    typeof input.urlForSignature !== "string" ||
    input.urlForSignature.length > 5000
  ) {
    return NextResponse.json(
      { error: "The checkout session is invalid." },
      { status: 400 },
    );
  }

  try {
    const url = new URL(input.urlForSignature);
    const environment =
      process.env.NEXT_PUBLIC_MOONPAY_ENVIRONMENT === "production"
        ? "production"
        : "sandbox";
    const allowedHost =
      environment === "production"
        ? "buy.moonpay.com"
        : "buy-sandbox.moonpay.com";
    const walletAddress = url.searchParams.get("walletAddress") ?? "";
    const amount = Number(url.searchParams.get("baseCurrencyAmount"));
    if (
      url.protocol !== "https:" ||
      url.hostname !== allowedHost ||
      url.searchParams.get("apiKey") !== apiKey ||
      !/^0x[a-fA-F0-9]{40}$/.test(walletAddress) ||
      !/^[a-z0-9_-]{2,40}$/i.test(url.searchParams.get("currencyCode") ?? "") ||
      !Number.isFinite(amount) ||
      amount < 20 ||
      amount > 10000
    ) {
      return NextResponse.json(
        { error: "The checkout session could not be validated." },
        { status: 400 },
      );
    }

    const signature = createHmac("sha256", secretKey)
      .update(url.search)
      .digest("base64");
    return NextResponse.json(
      { signature },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "The checkout session could not be signed." },
      { status: 400 },
    );
  }
}
