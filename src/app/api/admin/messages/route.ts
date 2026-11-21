import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { authorizeAdmin } from "@/lib/admin-auth";
import { getFirebaseAdminServices } from "@/lib/firebase-admin";

export const runtime = "nodejs";
const pageSize = 50;

export async function GET(request: Request) {
  const authorization = await authorizeAdmin(request);
  if (!authorization.ok) {
    return NextResponse.json(
      { error: authorization.error },
      { status: authorization.status },
    );
  }

  const cursor = new URL(request.url).searchParams.get("cursor");
  if (cursor && (cursor.length > 128 || cursor.includes("/"))) {
    return NextResponse.json({ error: "Invalid page cursor." }, { status: 400 });
  }

  try {
    const { db } = getFirebaseAdminServices();
    const messagesCollection = db.collection("contactMessages");
    let query = messagesCollection.orderBy("createdAt", "desc").limit(pageSize + 1);

    if (cursor) {
      const cursorDocument = await messagesCollection.doc(cursor).get();
      if (!cursorDocument.exists) {
        return NextResponse.json(
          { error: "This page is no longer available. Refresh the inbox." },
          { status: 400 },
        );
      }
      query = query.startAfter(cursorDocument);
    }

    const snapshot = await query.get();
    const hasMore = snapshot.docs.length > pageSize;
    const documents = snapshot.docs.slice(0, pageSize);
    const messages = documents.map((document) => {
      const data = document.data();
      const createdAt = data.createdAt?.toDate?.();
      return {
        id: document.id,
        name: data.name ?? "Unknown sender",
        email: data.email ?? "",
        topic: data.topic ?? "General",
        message: data.message ?? "",
        status: data.status === "resolved" ? "resolved" : "open",
        createdAt: createdAt instanceof Date ? createdAt.toISOString() : null,
      };
    });

    return NextResponse.json(
      {
        messages,
        nextCursor: hasMore ? documents[documents.length - 1]?.id ?? null : null,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Could not load contact messages from Firestore." },
      { status: 503 },
    );
  }
}

export async function PATCH(request: Request) {
  const authorization = await authorizeAdmin(request);
  if (!authorization.ok) {
    return NextResponse.json(
      { error: authorization.error },
      { status: authorization.status },
    );
  }

  let body: { id?: unknown; status?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (
    typeof body.id !== "string" ||
    !body.id ||
    body.id.length > 128 ||
    body.id.includes("/") ||
    (body.status !== "open" && body.status !== "resolved")
  ) {
    return NextResponse.json(
      { error: "Choose a valid message update." },
      { status: 400 },
    );
  }

  try {
    const { db } = getFirebaseAdminServices();
    const messageRef = db.collection("contactMessages").doc(body.id);
    const message = await messageRef.get();
    if (!message.exists) {
      return NextResponse.json(
        { error: "This contact message no longer exists." },
        { status: 404 },
      );
    }

    await messageRef.update({
      status: body.status,
      updatedAt: FieldValue.serverTimestamp(),
      resolvedAt:
        body.status === "resolved" ? FieldValue.serverTimestamp() : null,
    });

    return NextResponse.json({ id: body.id, status: body.status });
  } catch {
    return NextResponse.json(
      { error: "Could not update this message. Please try again." },
      { status: 503 },
    );
  }
}
