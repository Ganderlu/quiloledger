import "server-only";

import {
  FirebaseAdminConfigurationError,
  getFirebaseAdminServices,
} from "@/lib/firebase-admin";

type AdminAuthorization =
  | { ok: true; uid: string; email: string }
  | { ok: false; status: 401 | 403 | 503; error: string };

export async function authorizeAdmin(
  request: Request,
): Promise<AdminAuthorization> {
  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token || token.length > 8192) {
    return {
      ok: false,
      status: 401,
      error: "Please sign in to continue.",
    };
  }

  const allowedEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (!allowedEmails.length) {
    return {
      ok: false,
      status: 503,
      error: "Admin access is not configured on this server.",
    };
  }

  let decoded;
  try {
    const { auth } = getFirebaseAdminServices();
    decoded = await auth.verifyIdToken(token, true);
  } catch (error) {
    if (error instanceof FirebaseAdminConfigurationError) {
      return {
        ok: false,
        status: 503,
        error: "Firebase Admin credentials are not configured on this server.",
      };
    }
    return {
      ok: false,
      status: 401,
      error:
        "Your sign-in session could not be verified. Please sign in again.",
    };
  }

  const email = decoded.email?.toLowerCase();
  if (!decoded.email_verified || !email || !allowedEmails.includes(email)) {
    return {
      ok: false,
      status: 403,
      error: "This account is not authorized to access the admin console.",
    };
  }

  return { ok: true, uid: decoded.uid, email };
}
