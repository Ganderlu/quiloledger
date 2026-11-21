import { NextRequest, NextResponse } from "next/server";
import { DocumentData, FieldValue, Timestamp } from "firebase-admin/firestore";
import {
  FirebaseAdminConfigurationError,
  getFirebaseAdminServices,
} from "@/lib/firebase-admin";
import {
  getTradeTokens,
  tradeChains,
  type TradeChainId,
} from "@/lib/trade-tokens";

export const runtime = "nodejs";

type TradeStatus = "pending" | "confirmed" | "failed";

type TradeRecord = {
  hash: string;
  chainId: TradeChainId;
  action: "swap" | "sell";
  fromSymbol: string;
  toSymbol: string;
  amountIn: string;
  amountOut: string;
  createdAt: number;
  status: TradeStatus;
};

type Session =
  | { ok: true; uid: string }
  | { ok: false; response: NextResponse };

async function resolveSession(request: NextRequest): Promise<Session> {
  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token || token.length > 8192) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Please sign in to view your trade history." },
        { status: 401 },
      ),
    };
  }

  try {
    const { auth } = getFirebaseAdminServices();
    const decoded = await auth.verifyIdToken(token);
    return { ok: true, uid: decoded.uid };
  } catch (error) {
    if (error instanceof FirebaseAdminConfigurationError) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: "Trade history is not configured on this server." },
          { status: 503 },
        ),
      };
    }
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Your session could not be verified. Please sign in again." },
        { status: 401 },
      ),
    };
  }
}

function serializeTrade(data: DocumentData | undefined): TradeRecord | null {
  if (
    !data ||
    typeof data.hash !== "string" ||
    (data.chainId !== 1 && data.chainId !== 8453) ||
    typeof data.fromSymbol !== "string" ||
    typeof data.toSymbol !== "string" ||
    typeof data.amountIn !== "string" ||
    typeof data.amountOut !== "string" ||
    !["pending", "confirmed", "failed"].includes(data.status)
  ) {
    return null;
  }

  const createdAt =
    data.createdAt && typeof data.createdAt.toMillis === "function"
      ? (data.createdAt as Timestamp).toMillis()
      : 0;

  return {
    hash: data.hash,
    chainId: data.chainId,
    action: data.action === "sell" ? "sell" : "swap",
    fromSymbol: data.fromSymbol,
    toSymbol: data.toSymbol,
    amountIn: data.amountIn,
    amountOut: data.amountOut,
    createdAt,
    status: data.status,
  };
}

function isPositiveAmount(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 80 &&
    /^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value) &&
    /[1-9]/.test(value)
  );
}

function historyCollection(uid: string) {
  const { db } = getFirebaseAdminServices();
  return db.collection("users").doc(uid).collection("tradeHistory");
}

export async function GET(request: NextRequest) {
  const session = await resolveSession(request);
  if (!session.ok) return session.response;

  try {
    const snapshot = await historyCollection(session.uid)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();
    const trades = snapshot.docs
      .map((document) => serializeTrade(document.data()))
      .filter((trade): trade is TradeRecord => trade !== null);

    return NextResponse.json(
      { trades },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (error) {
    if (error instanceof FirebaseAdminConfigurationError) {
      return NextResponse.json(
        { error: "Trade history is not configured on this server." },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Could not load your saved trade history." },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await resolveSession(request);
  if (!session.ok) return session.response;

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return NextResponse.json(
        { error: "The trade history entry is invalid." },
        { status: 400 },
      );
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "The trade history entry is invalid." },
      { status: 400 },
    );
  }

  const chainId = Number(body.chainId);
  const hash = typeof body.hash === "string" ? body.hash.toLowerCase() : "";
  const action = body.action === "sell" ? "sell" : "swap";
  const walletAddress =
    typeof body.walletAddress === "string" ? body.walletAddress : "";
  const fromSymbol = typeof body.fromSymbol === "string" ? body.fromSymbol : "";
  const toSymbol = typeof body.toSymbol === "string" ? body.toSymbol : "";
  const amountIn = body.amountIn;
  const amountOut = body.amountOut;
  const status = body.status;

  if (
    (body.action !== undefined &&
      body.action !== "swap" &&
      body.action !== "sell") ||
    (chainId !== 1 && chainId !== 8453) ||
    !/^0x[a-f0-9]{64}$/.test(hash) ||
    !/^0x[a-fA-F0-9]{40}$/.test(walletAddress) ||
    typeof status !== "string" ||
    !["pending", "confirmed", "failed"].includes(status) ||
    !isPositiveAmount(amountIn) ||
    !isPositiveAmount(amountOut)
  ) {
    return NextResponse.json(
      { error: "The trade history entry is invalid." },
      { status: 400 },
    );
  }

  const chain = chainId as TradeChainId;
  const normalizedWalletAddress = walletAddress.toLowerCase();
  const supportedSymbols = new Set(
    getTradeTokens(chain).map((token) => token.symbol),
  );
  if (
    !supportedSymbols.has(fromSymbol) ||
    !supportedSymbols.has(toSymbol) ||
    fromSymbol === toSymbol
  ) {
    return NextResponse.json(
      { error: "The selected trade pair is not supported." },
      { status: 400 },
    );
  }

  try {
    const rpcUrl = tradeChains[chain].rpcUrls[0];
    const [chainTransaction, receiptResponse] = await Promise.all([
      fetch(rpcUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getTransactionByHash",
          params: [hash],
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }),
      fetch(rpcUrl, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 2,
          method: "eth_getTransactionReceipt",
          params: [hash],
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      }),
    ]);
    if (!chainTransaction.ok || !receiptResponse.ok) {
      throw new Error("Blockchain network is unavailable.");
    }
    const [transactionPayload, receiptPayload] = await Promise.all([
      chainTransaction.json() as Promise<{
        result?: { from?: string } | null;
      }>,
      receiptResponse.json() as Promise<{
        result?: { status?: string } | null;
      }>,
    ]);
    const actualTransaction = transactionPayload.result;
    const actualReceipt = receiptPayload.result;
    if (
      !actualTransaction?.from ||
      actualTransaction.from.toLowerCase() !== normalizedWalletAddress
    ) {
      return NextResponse.json(
        { error: "This swap could not be verified for the connected wallet." },
        { status: 422 },
      );
    }
    if (actualReceipt?.status && BigInt(actualReceipt.status) === BigInt(0)) {
      return NextResponse.json(
        { error: "This swap failed on the blockchain." },
        { status: 422 },
      );
    }
    if (
      status === "confirmed" &&
      (!actualReceipt || BigInt(actualReceipt.status ?? "0x0") !== BigInt(1))
    ) {
      return NextResponse.json(
        { error: "This swap is not yet confirmed on the blockchain." },
        { status: 409 },
      );
    }

    const collection = historyCollection(session.uid);
    const tradeRef = collection.doc(`${chain}-${hash.slice(2)}`);
    await getFirebaseAdminServices().db.runTransaction(async (transaction) => {
      const existing = await transaction.get(tradeRef);
      const savedStatus =
        existing.get("status") === "confirmed" ? "confirmed" : status;
      transaction.set(
        tradeRef,
        {
          hash,
          chainId: chain,
          action,
          walletAddress: normalizedWalletAddress,
          fromSymbol,
          toSymbol,
          amountIn,
          amountOut,
          status: savedStatus,
          createdAt: existing.exists
            ? (existing.get("createdAt") ?? FieldValue.serverTimestamp())
            : FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    });

    const savedTrade = serializeTrade((await tradeRef.get()).data());
    if (!savedTrade) {
      throw new Error("Saved trade record could not be read.");
    }
    return NextResponse.json(
      { trade: savedTrade },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof FirebaseAdminConfigurationError) {
      return NextResponse.json(
        { error: "Trade history is not configured on this server." },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Could not save this trade to your account." },
      { status: 503 },
    );
  }
}
