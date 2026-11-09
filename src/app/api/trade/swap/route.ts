import { NextRequest, NextResponse } from "next/server";
import { findTradeToken, type TradeChainId } from "@/lib/trade-tokens";
import { uniswapFailure, uniswapPost } from "@/lib/uniswap-server";

type SwapTransaction = {
  to?: string;
  from?: string;
  data?: string;
  value?: string;
  chainId?: number;
  gasLimit?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  gasPrice?: string;
};

type SwapResponse = {
  requestId?: string;
  swap?: SwapTransaction;
  gasFee?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const chainId = Number(body.chainId);
    const walletAddress =
      typeof body.walletAddress === "string" ? body.walletAddress : "";
    const tokenInAddress =
      typeof body.tokenIn === "string" ? body.tokenIn : "";
    const tokenOutAddress =
      typeof body.tokenOut === "string" ? body.tokenOut : "";
    const routing = typeof body.routing === "string" ? body.routing : "";
    const quote =
      typeof body.quote === "object" && body.quote !== null
        ? (body.quote as Record<string, unknown>)
        : null;
    const permitData =
      typeof body.permitData === "object" && body.permitData !== null
        ? body.permitData
        : null;
    const signature =
      typeof body.signature === "string" ? body.signature : "";

    if (
      (chainId !== 1 && chainId !== 8453) ||
      !/^0x[a-fA-F0-9]{40}$/.test(walletAddress) ||
      !quote ||
      !["CLASSIC", "WRAP", "UNWRAP"].includes(routing)
    ) {
      return NextResponse.json(
        { error: "The swap request is incomplete or invalid." },
        { status: 400 },
      );
    }

    const chain = chainId as TradeChainId;
    const tokenIn = findTradeToken(chain, tokenInAddress);
    const tokenOut = findTradeToken(chain, tokenOutAddress);
    const quoteInput =
      typeof quote.input === "object" && quote.input !== null
        ? (quote.input as Record<string, unknown>)
        : null;
    const quoteOutput =
      typeof quote.output === "object" && quote.output !== null
        ? (quote.output as Record<string, unknown>)
        : null;

    if (
      !tokenIn ||
      !tokenOut ||
      !quoteInput ||
      !quoteOutput ||
      typeof quoteInput.token !== "string" ||
      typeof quoteOutput.token !== "string" ||
      quoteInput.token.toLowerCase() !== tokenIn.address.toLowerCase() ||
      quoteOutput.token.toLowerCase() !== tokenOut.address.toLowerCase()
    ) {
      return NextResponse.json(
        { error: "The quote does not match the selected token pair." },
        { status: 400 },
      );
    }

    if (
      permitData &&
      !/^0x[a-fA-F0-9]{130,}$/.test(signature)
    ) {
      return NextResponse.json(
        { error: "The required token permission signature is missing." },
        { status: 400 },
      );
    }
    if (!permitData && signature) {
      return NextResponse.json(
        { error: "Unexpected token permission signature." },
        { status: 400 },
      );
    }

    const swapRequest: Record<string, unknown> = {
      quote,
      refreshGasPrice: true,
      simulateTransaction: true,
      safetyMode: "SAFE",
    };
    if (permitData) {
      swapRequest.permitData = permitData;
      swapRequest.signature = signature;
    }

    const result = await uniswapPost<SwapResponse>("swap", swapRequest);
    const transaction = result.swap;
    if (
      !transaction ||
      typeof transaction.to !== "string" ||
      !/^0x[a-fA-F0-9]{40}$/.test(transaction.to) ||
      transaction.from?.toLowerCase() !== walletAddress.toLowerCase() ||
      transaction.chainId !== chain ||
      typeof transaction.data !== "string" ||
      !/^0x[0-9a-fA-F]+$/.test(transaction.data)
    ) {
      return NextResponse.json(
        { error: "Uniswap returned an invalid transaction. Nothing was sent." },
        { status: 502 },
      );
    }

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const failure = uniswapFailure(error);
    return NextResponse.json(
      { error: failure.message },
      { status: failure.status },
    );
  }
}
