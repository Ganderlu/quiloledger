import { FieldPath } from "firebase-admin/firestore";
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
    return NextResponse.json(
      { error: "Invalid page cursor." },
      { status: 400 },
    );
  }

  try {
    const { auth, db } = getFirebaseAdminServices();
    const usersCollection = db.collection("users");
    let query = usersCollection
      .orderBy(FieldPath.documentId())
      .limit(pageSize + 1);

    if (cursor) {
      const cursorDocument = await usersCollection.doc(cursor).get();
      if (!cursorDocument.exists) {
        return NextResponse.json(
          { error: "This page is no longer available. Refresh the list." },
          { status: 400 },
        );
      }
      query = query.startAfter(cursorDocument);
    }

    const snapshot = await query.get();
    const hasMore = snapshot.docs.length > pageSize;
    const documents = snapshot.docs.slice(0, pageSize);
    const authResult = documents.length
      ? await auth.getUsers(documents.map((document) => ({ uid: document.id })))
      : { users: [], notFound: [] };
    const accountsByUid = new Map(
      authResult.users.map((account) => [account.uid, account]),
    );

    const users = documents.map((document) => {
      const profile = document.data();
      const account = accountsByUid.get(document.id);
      const createdAt = profile.createdAt?.toDate?.();
      return {
        uid: document.id,
        fullName: profile.fullName ?? account?.displayName ?? "Quilox member",
        email: account?.email ?? profile.email ?? "",
        country: profile.country ?? "",
        countryCode: profile.countryCode ?? "",
        currency: profile.currency ?? "",
        emailVerified: account?.emailVerified ?? false,
        disabled: account?.disabled ?? null,
        createdAt: createdAt instanceof Date ? createdAt.toISOString() : null,
      };
    });

    return NextResponse.json(
      {
        users,
        nextCursor: hasMore
          ? (documents[documents.length - 1]?.id ?? null)
          : null,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Could not load users from Firebase." },
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

  let body: { uid?: unknown; disabled?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (
    typeof body.uid !== "string" ||
    !body.uid ||
    body.uid.length > 128 ||
    body.uid.includes("/") ||
    typeof body.disabled !== "boolean"
  ) {
    return NextResponse.json(
      { error: "Choose a valid user account action." },
      { status: 400 },
    );
  }
  if (body.uid === authorization.uid && body.disabled) {
    return NextResponse.json(
      { error: "You can’t disable the admin account you are using." },
      { status: 400 },
    );
  }

  try {
    const { auth } = getFirebaseAdminServices();
    const account = await auth.updateUser(body.uid, {
      disabled: body.disabled,
    });

    return NextResponse.json({
      uid: account.uid,
      disabled: account.disabled,
    });
  } catch (error) {
    const isMissing =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "auth/user-not-found";
    return NextResponse.json(
      {
        error: isMissing
          ? "This user account no longer exists."
          : "Could not update this account. Please try again.",
      },
      { status: isMissing ? 404 : 503 },
    );
  }
}
