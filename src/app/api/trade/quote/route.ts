import { NextRequest, NextResponse } from "next/server";
import { findTradeToken, type TradeChainId } from "@/lib/trade-tokens";
import { uniswapFailure, uniswapPost } from "@/lib/uniswap-server";

type QuoteResponse = {
  requestId?: string;
  quote?: {
    input?: { amount?: string; token?: string };
    output?: { amount?: string; minimumAmount?: string; token?: string };
    classicGasUseEstimateUSD?: string;
  };
  routing?: string;
  permitData?: Record<string, unknown> | null;
  isTokenApprovalApplicable?: boolean;
};

const addressPattern = /^0x[a-fA-F0-9]{40}$/;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const chainId = Number(body.chainId);
    const walletAddress =
      typeof body.walletAddress === "string" ? body.walletAddress : "";
    const tokenInAddress = typeof body.tokenIn === "string" ? body.tokenIn : "";
    const tokenOutAddress =
      typeof body.tokenOut === "string" ? body.tokenOut : "";
    const amount = typeof body.amount === "string" ? body.amount : "";
    const slippageTolerance = Number(body.slippageTolerance ?? 0.5);

    if (
      (chainId !== 1 && chainId !== 8453) ||
      !addressPattern.test(walletAddress) ||
      !/^\d{1,78}$/.test(amount) ||
      BigInt(amount) <= BigInt(0) ||
      !Number.isFinite(slippageTolerance) ||
      slippageTolerance < 0.1 ||
      slippageTolerance > 5
    ) {
      return NextResponse.json(
        { error: "Enter a valid wallet, network, amount, and slippage limit." },
        { status: 400 },
      );
    }

    const chain = chainId as TradeChainId;
    const tokenIn = findTradeToken(chain, tokenInAddress);
    const tokenOut = findTradeToken(chain, tokenOutAddress);
    if (!tokenIn || !tokenOut || tokenIn.address === tokenOut.address) {
      return NextResponse.json(
        { error: "Choose two different supported tokens on the same network." },
        { status: 400 },
      );
    }

    const result = await uniswapPost<QuoteResponse>("quote", {
      tokenIn: tokenIn.address,
      tokenOut: tokenOut.address,
      tokenInChainId: chain,
      tokenOutChainId: chain,
      amount,
      type: "EXACT_INPUT",
      swapper: walletAddress,
      slippageTolerance,
      routingPreference: "BEST_PRICE",
      protocols: ["V2", "V3", "V4"],
      permitAmount: "EXACT",
    });

    if (
      !result.quote?.input?.amount ||
      !result.quote.output?.amount ||
      !result.quote.input.token ||
      !result.quote.output.token ||
      !["CLASSIC", "WRAP", "UNWRAP"].includes(result.routing ?? "")
    ) {
      return NextResponse.json(
        {
          error:
            "Uniswap did not return a supported single-chain swap route. Try refreshing the quote.",
        },
        { status: 422 },
      );
    }

    return NextResponse.json(
      {
        quote: result.quote,
        routing: result.routing,
        permitData: result.permitData ?? null,
        isTokenApprovalApplicable:
          result.isTokenApprovalApplicable ??
          tokenIn.address.toLowerCase() !==
            "0x0000000000000000000000000000000000000000",
        requestId: result.requestId ?? null,
        expiresAt: Date.now() + 25_000,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const failure = uniswapFailure(error);
    return NextResponse.json(
      { error: failure.message },
      { status: failure.status },
    );
  }
}
