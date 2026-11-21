import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export class FirebaseAdminConfigurationError extends Error {
  constructor() {
    super("Firebase Admin credentials are not configured.");
    this.name = "FirebaseAdminConfigurationError";
  }
}

export function getFirebaseAdminServices() {
  const projectId =
    process.env.FIREBASE_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new FirebaseAdminConfigurationError();
  }

  const app =
    getApps().find((currentApp) => currentApp.name === "quilox-admin") ??
    initializeApp(
      {
        credential: cert({ projectId, clientEmail, privateKey }),
        projectId,
      },
      "quilox-admin",
    );

  return {
    auth: getAuth(app),
    db: getFirestore(app),
  };
}
