import "server-only";

import { createVerify } from "node:crypto";
import type { NextRequest } from "next/server";

const signingKeysUrl =
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

let signingKeys: Record<string, string> | null = null;
let signingKeysExpireAt = 0;
let signingKeysRequest: Promise<Record<string, string> | null> | null = null;

async function getSigningKeys() {
  if (signingKeys && Date.now() < signingKeysExpireAt) return signingKeys;
  if (signingKeysRequest) return signingKeysRequest;

  signingKeysRequest = (async () => {
    try {
      const response = await fetch(signingKeysUrl, { cache: "no-store" });
      if (!response.ok) return null;
      const keys = (await response.json()) as Record<string, string>;
      const maxAge = Number(
        response.headers
          .get("cache-control")
          ?.match(/max-age=(\d+)/i)?.[1] ?? "3600",
      );
      signingKeys = keys;
      signingKeysExpireAt =
        Date.now() + Math.max(60, Math.min(maxAge, 3600)) * 1000;
      return keys;
    } catch {
      return null;
    } finally {
      signingKeysRequest = null;
    }
  })();

  return signingKeysRequest;
}

export async function verifyFirebaseRequest(request: NextRequest) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!projectId || !token || token.length > 8192) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  try {
    const header = JSON.parse(
      Buffer.from(parts[0], "base64url").toString("utf8"),
    ) as { alg?: string; kid?: string };
    const claims = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8"),
    ) as {
      aud?: string;
      iss?: string;
      sub?: string;
      exp?: number;
      iat?: number;
    };
    const now = Math.floor(Date.now() / 1000);

    if (
      header.alg !== "RS256" ||
      !header.kid ||
      claims.aud !== projectId ||
      claims.iss !== `https://securetoken.google.com/${projectId}` ||
      !claims.sub ||
      claims.sub.length > 128 ||
      typeof claims.exp !== "number" ||
      claims.exp <= now ||
      typeof claims.iat !== "number" ||
      claims.iat > now + 60
    ) {
      return false;
    }

    const keys = await getSigningKeys();
    const certificate = keys?.[header.kid];
    if (!certificate) return false;

    const verifier = createVerify("RSA-SHA256");
    verifier.update(`${parts[0]}.${parts[1]}`);
    verifier.end();
    return verifier.verify(certificate, Buffer.from(parts[2], "base64url"));
  } catch {
    return false;
  }
}
