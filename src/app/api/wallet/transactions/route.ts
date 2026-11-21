import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import {
  FirebaseAdminConfigurationError,
  getFirebaseAdminServices,
} from "@/lib/firebase-admin";

export const runtime = "nodejs";

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
        { error: "Please sign in to save this purchase." },
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
          { error: "Purchase history is not configured on this server." },
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
        { error: "The purchase details are invalid." },
        { status: 400 },
      );
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "The purchase details are invalid." },
      { status: 400 },
    );
  }

  const transactionId =
    typeof body.transactionId === "string" ? body.transactionId.trim() : "";
  const providerTransactionId =
    typeof body.providerTransactionId === "string"
      ? body.providerTransactionId.trim()
      : null;
  const assetCode =
    typeof body.assetCode === "string" ? body.assetCode.toLowerCase() : "";
  const networkCode =
    typeof body.networkCode === "string" ? body.networkCode.toLowerCase() : "";
  const fiatCurrency =
    typeof body.fiatCurrency === "string"
      ? body.fiatCurrency.toLowerCase()
      : "";
  const fiatAmount = Number(body.fiatAmount);
  const cryptoAmount = Number(body.cryptoAmount);
  const walletAddress =
    typeof body.walletAddress === "string" ? body.walletAddress : null;

  if (
    !/^[a-zA-Z0-9_-]{1,120}$/.test(transactionId) ||
    (providerTransactionId !== null &&
      !/^[a-zA-Z0-9_-]{1,120}$/.test(providerTransactionId)) ||
    !/^[a-z0-9_-]{2,40}$/.test(assetCode) ||
    !/^[a-z0-9_-]{2,40}$/.test(networkCode) ||
    !/^[a-z]{3}$/.test(fiatCurrency) ||
    !Number.isFinite(fiatAmount) ||
    fiatAmount < 20 ||
    fiatAmount > 10000 ||
    !Number.isFinite(cryptoAmount) ||
    cryptoAmount <= 0 ||
    cryptoAmount > 1_000_000_000 ||
    (walletAddress !== null && !/^0x[a-fA-F0-9]{40}$/.test(walletAddress))
  ) {
    return NextResponse.json(
      { error: "The purchase details are invalid." },
      { status: 400 },
    );
  }

  try {
    const { db } = getFirebaseAdminServices();
    const transactionRef = db
      .collection("users")
      .doc(session.uid)
      .collection("walletTransactions")
      .doc(`moonpay-${transactionId}`);

    await db.runTransaction(async (transaction) => {
      const existing = await transaction.get(transactionRef);
      transaction.set(
        transactionRef,
        {
          type: "buy",
          provider: "moonpay",
          providerTransactionId,
          status: "reported",
          verification: "moonpay_sdk_callback_unverified",
          assetCode,
          networkCode,
          fiatAmount,
          fiatCurrency,
          cryptoAmount,
          walletAddress: walletAddress?.toLowerCase() ?? null,
          createdAt: existing.exists
            ? (existing.get("createdAt") ?? FieldValue.serverTimestamp())
            : FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    });

    return NextResponse.json(
      { transactionId, status: "completed" },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof FirebaseAdminConfigurationError) {
      return NextResponse.json(
        { error: "Purchase history is not configured on this server." },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "Could not save this purchase to your account." },
      { status: 503 },
    );
  }
}
