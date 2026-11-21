import { NextResponse } from "next/server";
import { authorizeAdmin } from "@/lib/admin-auth";
import {
  FirebaseAdminConfigurationError,
  getFirebaseAdminServices,
} from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authorization = await authorizeAdmin(request);
  if (!authorization.ok) {
    return NextResponse.json(
      { error: authorization.error },
      { status: authorization.status },
    );
  }

  try {
    const { db } = getFirebaseAdminServices();
    const [userCount, messageCount, recentUserDocs, recentMessageDocs] =
      await Promise.all([
        db.collection("users").count().get(),
        db.collection("contactMessages").count().get(),
        db.collection("users").orderBy("createdAt", "desc").limit(6).get(),
        db
          .collection("contactMessages")
          .orderBy("createdAt", "desc")
          .limit(8)
          .get(),
      ]);

    const recentUsers = recentUserDocs.docs.map((document) => {
      const data = document.data();
      const createdAt = data.createdAt?.toDate?.();
      return {
        uid: document.id,
        fullName: data.fullName ?? "Quilox member",
        email: data.email ?? "",
        country: data.country ?? "",
        createdAt: createdAt instanceof Date ? createdAt.toISOString() : null,
      };
    });

    const recentMessages = recentMessageDocs.docs.map((document) => {
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
        metrics: {
          totalUsers: userCount.data().count,
          totalMessages: messageCount.data().count,
        },
        recentUsers,
        recentMessages,
        generatedAt: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    const message =
      error instanceof FirebaseAdminConfigurationError
        ? "Admin database access is not configured on this server."
        : "Could not load admin data. Check the Firebase Admin credentials and Firestore connection.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
