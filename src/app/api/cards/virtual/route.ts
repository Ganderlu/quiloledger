import { NextRequest, NextResponse } from "next/server";
import type { DocumentData, Timestamp } from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";
import {
  FirebaseAdminConfigurationError,
  getFirebaseAdminServices,
} from "@/lib/firebase-admin";

export const runtime = "nodejs";

const collection = "virtualCards";
const currencies = ["USD", "EUR", "GBP", "NGN"] as const;
const preferenceKeys = [
  "onlinePayments",
  "contactless",
  "internationalPayments",
  "atmWithdrawals",
] as const;

type Currency = (typeof currencies)[number];
type PreferenceKey = (typeof preferenceKeys)[number];

interface VirtualCard {
  cardholderName: string;
  cardNumber: string;
  last4: string;
  expiry: string;
  cvv: string;
  brand: string;
  currency: Currency;
  status: "active";
  frozen: boolean;
  preferences: Record<PreferenceKey, boolean>;
  createdAt: string | null;
  updatedAt: string | null;
}

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
        { error: "Please sign in to continue." },
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
          { error: "Card services are not configured on this server." },
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

function toIso(value: unknown) {
  if (value && typeof (value as Timestamp).toDate === "function") {
    return (value as Timestamp).toDate().toISOString();
  }
  return null;
}

function serializeCard(data: DocumentData | undefined): VirtualCard | null {
  if (!data || typeof data.cardNumber !== "string") return null;
  const preferences = (data.preferences ?? {}) as Record<string, unknown>;
  return {
    cardholderName:
      typeof data.cardholderName === "string"
        ? data.cardholderName
        : "Quilox member",
    cardNumber: data.cardNumber,
    last4:
      typeof data.last4 === "string" ? data.last4 : data.cardNumber.slice(-4),
    expiry: typeof data.expiry === "string" ? data.expiry : "",
    cvv: typeof data.cvv === "string" ? data.cvv : "",
    brand: "Quilox",
    currency: currencies.includes(data.currency) ? data.currency : "USD",
    status: "active",
    frozen: data.frozen === true,
    preferences: {
      onlinePayments: preferences.onlinePayments !== false,
      contactless: preferences.contactless !== false,
      internationalPayments: preferences.internationalPayments === true,
      atmWithdrawals: preferences.atmWithdrawals !== false,
    },
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  } satisfies VirtualCard;
}

function generateCardNumber() {
  let digits = "4821";
  for (let index = 0; index < 12; index += 1) {
    digits += Math.floor(Math.random() * 10);
  }
  return digits;
}

function generateExpiry() {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const year = `${(now.getFullYear() + 3) % 100}`.padStart(2, "0");
  return `${month}/${year}`;
}

function generateCvv() {
  return `${Math.floor(100 + Math.random() * 900)}`;
}

export async function GET(request: NextRequest) {
  const session = await resolveSession(request);
  if (!session.ok) return session.response;

  try {
    const { db } = getFirebaseAdminServices();
    const snapshot = await db.collection(collection).doc(session.uid).get();
    const card = snapshot.exists ? serializeCard(snapshot.data()) : null;
    return NextResponse.json(
      { card },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "We couldn’t load your card right now. Please try again." },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await resolveSession(request);
  if (!session.ok) return session.response;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "We couldn’t read that request. Please try again." },
      { status: 400 },
    );
  }

  const cardholderName =
    typeof body.cardholderName === "string"
      ? body.cardholderName.trim().replace(/\s+/g, " ")
      : "";
  if (cardholderName.length < 3 || cardholderName.length > 60) {
    return NextResponse.json(
      { error: "Enter the cardholder name exactly as it should appear." },
      { status: 400 },
    );
  }

  const currency: Currency = currencies.includes(body.currency as Currency)
    ? (body.currency as Currency)
    : "USD";

  try {
    const { db } = getFirebaseAdminServices();
    const cardRef = db.collection(collection).doc(session.uid);
    const existing = await cardRef.get();
    if (existing.exists) {
      return NextResponse.json(
        { error: "You already have a virtual card on this account." },
        { status: 409 },
      );
    }

    const cardNumber = generateCardNumber();
    await cardRef.set({
      uid: session.uid,
      cardholderName,
      cardNumber,
      last4: cardNumber.slice(-4),
      expiry: generateExpiry(),
      cvv: generateCvv(),
      brand: "Quilox",
      currency,
      status: "active",
      frozen: false,
      preferences: {
        onlinePayments: true,
        contactless: true,
        internationalPayments: false,
        atmWithdrawals: true,
      },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const created = await cardRef.get();
    return NextResponse.json(
      { card: serializeCard(created.data()) },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "We couldn’t create your card right now. Please try again." },
      { status: 503 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await resolveSession(request);
  if (!session.ok) return session.response;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "We couldn’t read that request. Please try again." },
      { status: 400 },
    );
  }

  try {
    const { db } = getFirebaseAdminServices();
    const cardRef = db.collection(collection).doc(session.uid);
    const existing = await cardRef.get();
    if (!existing.exists) {
      return NextResponse.json(
        { error: "You do not have a virtual card yet." },
        { status: 404 },
      );
    }

    const update: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (typeof body.frozen === "boolean") {
      update.frozen = body.frozen;
    }

    if (body.preferences && typeof body.preferences === "object") {
      const preferences = body.preferences as Record<string, unknown>;
      for (const key of preferenceKeys) {
        if (typeof preferences[key] === "boolean") {
          update[`preferences.${key}`] = preferences[key];
        }
      }
    }

    if (body.regenerate === true) {
      const cardNumber = generateCardNumber();
      update.cardNumber = cardNumber;
      update.last4 = cardNumber.slice(-4);
      update.expiry = generateExpiry();
      update.cvv = generateCvv();
      update.frozen = false;
    }

    if (Object.keys(update).length === 1) {
      return NextResponse.json(
        { error: "There was nothing to update on your card." },
        { status: 400 },
      );
    }

    await cardRef.set(update, { merge: true });
    const updated = await cardRef.get();
    return NextResponse.json(
      { card: serializeCard(updated.data()) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "We couldn’t update your card right now. Please try again." },
      { status: 503 },
    );
  }
}
