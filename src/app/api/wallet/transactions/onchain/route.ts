import { NextRequest, NextResponse } from "next/server";
import { DocumentData, FieldValue, Timestamp } from "firebase-admin/firestore";
import {
  FirebaseAdminConfigurationError,
  getFirebaseAdminServices,
} from "@/lib/firebase-admin";
import {
  findTradeToken,
  formatTokenAmount,
  NATIVE_TOKEN_ADDRESS,
  tradeChains,
  type TradeChainId,
} from "@/lib/trade-tokens";

export const runtime = "nodejs";

const transferTopic =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

type OnchainType = "send" | "receive";
type OnchainStatus = "pending" | "confirmed";

type RpcTransaction = {
  from?: string;
  to?: string | null;
  input?: string;
  value?: string;
};

type RpcLog = {
  address?: string;
  topics?: string[];
  data?: string;
  logIndex?: string;
};

type RpcReceipt = {
  status?: string;
  logs?: RpcLog[];
};

type WalletTransaction = {
  id: string;
  type: OnchainType;
  status: OnchainStatus;
  chainId: TradeChainId;
  hash: string;
  assetCode: string;
  amount: string;
  walletAddress: string;
  counterpartyAddress: string;
  createdAt: number;
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
        { error: "Please sign in to save wallet activity." },
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
          { error: "Wallet activity is not configured on this server." },
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

async function rpc<T>(
  chainId: TradeChainId,
  method: string,
  params: unknown[],
) {
  const response = await fetch(tradeChains[chainId].rpcUrls[0], {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Blockchain network is unavailable.");
  const payload = (await response.json()) as {
    result?: T;
    error?: { message?: string };
  };
  if (payload.error || payload.result === undefined) {
    throw new Error(
      payload.error?.message ?? "Blockchain data is unavailable.",
    );
  }
  return payload.result;
}

function serializeTransaction(
  id: string,
  data: DocumentData,
): WalletTransaction | null {
  if (
    (data.type !== "send" && data.type !== "receive") ||
    (data.status !== "pending" && data.status !== "confirmed") ||
    (data.chainId !== 1 && data.chainId !== 8453) ||
    typeof data.hash !== "string" ||
    typeof data.assetCode !== "string" ||
    typeof data.amount !== "string" ||
    typeof data.walletAddress !== "string" ||
    typeof data.counterpartyAddress !== "string"
  ) {
    return null;
  }

  return {
    id,
    type: data.type,
    status: data.status,
    chainId: data.chainId,
    hash: data.hash,
    assetCode: data.assetCode,
    amount: data.amount,
    walletAddress: data.walletAddress,
    counterpartyAddress: data.counterpartyAddress,
    createdAt:
      data.createdAt && typeof data.createdAt.toMillis === "function"
        ? (data.createdAt as Timestamp).toMillis()
        : 0,
  };
}

export async function GET(request: NextRequest) {
  const session = await resolveSession(request);
  if (!session.ok) return session.response;

  try {
    const { db } = getFirebaseAdminServices();
    const snapshot = await db
      .collection("users")
      .doc(session.uid)
      .collection("walletTransactions")
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();
    const transactions = snapshot.docs
      .map((document) => serializeTransaction(document.id, document.data()))
      .filter((item): item is WalletTransaction => item !== null);

    return NextResponse.json(
      { transactions },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof FirebaseAdminConfigurationError) {
      return NextResponse.json(
        { error: "Wallet activity is not configured on this server." },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Could not load your wallet activity." },
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
      throw new Error("Invalid request");
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "The transaction details are invalid." },
      { status: 400 },
    );
  }

  const type = body.type;
  const chainValue = Number(body.chainId);
  const chainId = chainValue as TradeChainId;
  const hash = typeof body.hash === "string" ? body.hash.toLowerCase() : "";
  const walletAddress =
    typeof body.walletAddress === "string"
      ? body.walletAddress.toLowerCase()
      : "";
  const recipient =
    typeof body.recipientAddress === "string"
      ? body.recipientAddress.toLowerCase()
      : "";
  const tokenAddress =
    typeof body.tokenAddress === "string"
      ? body.tokenAddress.toLowerCase()
      : NATIVE_TOKEN_ADDRESS;
  const requestedStatus = body.status;
  const requestedLogIndex =
    typeof body.logIndex === "string" ? body.logIndex.toLowerCase() : null;

  if (
    (type !== "send" && type !== "receive") ||
    (chainId !== 1 && chainId !== 8453) ||
    !/^0x[a-f0-9]{64}$/.test(hash) ||
    !/^0x[a-f0-9]{40}$/.test(walletAddress) ||
    (type === "send" && !/^0x[a-f0-9]{40}$/.test(recipient)) ||
    (type === "send" &&
      requestedStatus !== "pending" &&
      requestedStatus !== "confirmed") ||
    (type === "receive" && requestedStatus !== "confirmed") ||
    (requestedLogIndex !== null && !/^0x[0-9a-f]+$/.test(requestedLogIndex))
  ) {
    return NextResponse.json(
      { error: "The transaction details are invalid." },
      { status: 400 },
    );
  }

  const chain = chainId as TradeChainId;
  const token =
    tokenAddress === NATIVE_TOKEN_ADDRESS
      ? null
      : findTradeToken(chain, tokenAddress);
  if (tokenAddress !== NATIVE_TOKEN_ADDRESS && !token) {
    return NextResponse.json(
      { error: "This asset is not supported on the selected network." },
      { status: 400 },
    );
  }

  try {
    const [transaction, receipt] = await Promise.all([
      rpc<RpcTransaction | null>(chain, "eth_getTransactionByHash", [hash]),
      rpc<RpcReceipt | null>(chain, "eth_getTransactionReceipt", [hash]),
    ]);

    if (
      !transaction ||
      !/^0x[a-f0-9]{40}$/i.test(transaction.from ?? "") ||
      (type === "send" &&
        (transaction.from ?? "").toLowerCase() !== walletAddress)
    ) {
      return NextResponse.json(
        { error: "The transaction could not be verified on this network." },
        { status: 422 },
      );
    }

    if (receipt?.status && BigInt(receipt.status) === BigInt(0)) {
      return NextResponse.json(
        { error: "This transaction failed on the blockchain." },
        { status: 422 },
      );
    }

    let rawAmount = BigInt(0);
    let counterpartyAddress = "";
    let logIndex: string | null = null;

    if (!token) {
      const txRecipient = transaction.to?.toLowerCase() ?? "";
      const txValue = transaction.value ?? "0x0";
      if (type === "send") {
        if (txRecipient !== recipient) {
          return NextResponse.json(
            { error: "The on-chain recipient does not match this transfer." },
            { status: 422 },
          );
        }
        rawAmount = BigInt(txValue);
        counterpartyAddress = txRecipient;
      } else {
        if (txRecipient !== walletAddress) {
          return NextResponse.json(
            { error: "This transaction did not send funds to your wallet." },
            { status: 422 },
          );
        }
        rawAmount = BigInt(txValue);
        counterpartyAddress = transaction.from!.toLowerCase();
      }
    } else if (type === "send") {
      const input = transaction.input ?? "";
      if (
        transaction.to?.toLowerCase() !== token.address.toLowerCase() ||
        !/^0xa9059cbb[0-9a-f]{128}$/i.test(input) ||
        `0x${input.slice(34, 74)}`.toLowerCase() !== recipient
      ) {
        return NextResponse.json(
          { error: "The on-chain token transfer does not match this request." },
          { status: 422 },
        );
      }
      rawAmount = BigInt(`0x${input.slice(74, 138)}`);
      counterpartyAddress = recipient;
    } else {
      const walletTopic = `0x${walletAddress.slice(2).padStart(64, "0")}`;
      const matchingLog = (receipt?.logs ?? []).find((log) => {
        if (
          log.address?.toLowerCase() !== token.address.toLowerCase() ||
          log.topics?.[0]?.toLowerCase() !== transferTopic ||
          log.topics?.[2]?.toLowerCase() !== walletTopic
        ) {
          return false;
        }
        return (
          requestedLogIndex === null ||
          log.logIndex?.toLowerCase() === requestedLogIndex
        );
      });
      if (
        !matchingLog ||
        !matchingLog.topics?.[1] ||
        !/^0x[0-9a-f]{64}$/i.test(matchingLog.data ?? "")
      ) {
        return NextResponse.json(
          { error: "No matching incoming token transfer was found." },
          { status: 422 },
        );
      }
      rawAmount = BigInt(matchingLog.data!);
      counterpartyAddress =
        `0x${matchingLog.topics[1].slice(-40)}`.toLowerCase();
      logIndex = matchingLog.logIndex?.toLowerCase() ?? null;
    }

    if (rawAmount <= BigInt(0)) {
      return NextResponse.json(
        { error: "The verified transfer amount must be greater than zero." },
        { status: 422 },
      );
    }

    const status: OnchainStatus =
      type === "receive" || requestedStatus === "confirmed"
        ? "confirmed"
        : "pending";
    if (
      status === "confirmed" &&
      (!receipt || BigInt(receipt.status ?? "0x0") !== BigInt(1))
    ) {
      return NextResponse.json(
        { error: "The transaction is not yet confirmed on the blockchain." },
        { status: 409 },
      );
    }

    const assetCode = token?.symbol ?? tradeChains[chain].nativeSymbol;
    const decimals = token?.decimals ?? 18;
    const docId = `${chain}-${hash.slice(2)}-${type}-${logIndex?.slice(2) ?? "native"}`;
    const { db } = getFirebaseAdminServices();
    const transactionRef = db
      .collection("users")
      .doc(session.uid)
      .collection("walletTransactions")
      .doc(docId);

    await db.runTransaction(async (firestoreTransaction) => {
      const existing = await firestoreTransaction.get(transactionRef);
      const savedStatus =
        existing.get("status") === "confirmed" ? "confirmed" : status;
      firestoreTransaction.set(
        transactionRef,
        {
          type,
          status: savedStatus,
          chainId: chain,
          hash,
          assetCode,
          tokenAddress,
          rawAmount: rawAmount.toString(),
          amount: formatTokenAmount(rawAmount.toString(), decimals),
          walletAddress,
          counterpartyAddress,
          logIndex,
          createdAt: existing.exists
            ? (existing.get("createdAt") ?? FieldValue.serverTimestamp())
            : FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    });

    const saved = serializeTransaction(
      docId,
      (await transactionRef.get()).data() ?? {},
    );
    return NextResponse.json(
      { transaction: saved },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof FirebaseAdminConfigurationError) {
      return NextResponse.json(
        { error: "Wallet activity is not configured on this server." },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Could not verify or save this transaction." },
      { status: 503 },
    );
  }
}
