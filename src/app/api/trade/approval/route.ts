import { NextRequest, NextResponse } from "next/server";
import {
  findTradeToken,
  NATIVE_TOKEN_ADDRESS,
  type TradeChainId,
} from "@/lib/trade-tokens";
import { uniswapFailure, uniswapPost } from "@/lib/uniswap-server";

type ApprovalResponse = {
  requestId?: string;
  approval?: Record<string, unknown> | null;
  cancel?: Record<string, unknown> | null;
  gasFee?: string;
  cancelGasFee?: string;
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const chainId = Number(body.chainId);
    const walletAddress =
      typeof body.walletAddress === "string" ? body.walletAddress : "";
    const tokenAddress =
      typeof body.tokenAddress === "string" ? body.tokenAddress : "";
    const amount = typeof body.amount === "string" ? body.amount : "";

    if (
      (chainId !== 1 && chainId !== 8453) ||
      !/^0x[a-fA-F0-9]{40}$/.test(walletAddress) ||
      !/^\d{1,78}$/.test(amount) ||
      BigInt(amount) <= BigInt(0)
    ) {
      return NextResponse.json(
        { error: "The token approval request is invalid." },
        { status: 400 },
      );
    }

    const token = findTradeToken(chainId, tokenAddress);
    if (
      !token ||
      token.address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase()
    ) {
      return NextResponse.json(
        { error: "This token does not need an ERC-20 approval." },
        { status: 400 },
      );
    }

    const result = await uniswapPost<ApprovalResponse>("check_approval", {
      walletAddress,
      token: token.address,
      amount,
      chainId: chainId as TradeChainId,
      includeGasInfo: true,
    });

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
