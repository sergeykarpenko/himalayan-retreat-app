import type { SessionEnv } from "./session";

export interface AppleOAuthEnv extends SessionEnv {
  APPLE_CLIENT_ID?: string;
  APPLE_REDIRECT_URI?: string;
  APPLE_ENTITLEMENT_URL?: string;
  BOT_API_TOKEN?: string;
}

interface AppleTokenHeader {
  alg?: string;
  kid?: string;
}

export interface AppleTokenClaims {
  iss: string;
  aud: string | string[];
  exp: number;
  iat: number;
  sub: string;
  nonce?: string;
  email?: string;
  email_verified?: string | boolean;
}

const APPLE_OAUTH_COOKIE = "__Host-hdt_apple_oauth";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function decodeJson<T>(value: string): T {
  return JSON.parse(decoder.decode(base64UrlToBytes(value))) as T;
}

export function randomOAuthValue(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToBase64Url(bytes);
}

export function createAppleOAuthCookie(state: string, nonce: string): string {
  return [
    `${APPLE_OAUTH_COOKIE}=${state}.${nonce}`,
    "Path=/",
    "Max-Age=600",
    "HttpOnly",
    "Secure",
    "SameSite=None",
  ].join("; ");
}

export function clearAppleOAuthCookie(): string {
  return [
    `${APPLE_OAUTH_COOKIE}=`,
    "Path=/",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "HttpOnly",
    "Secure",
    "SameSite=None",
  ].join("; ");
}

export function readAppleOAuthCookie(
  request: Request,
): { state: string; nonce: string } | null {
  const cookies = request.headers.get("Cookie");
  if (!cookies) return null;
  for (const part of cookies.split(";")) {
    const [name, ...value] = part.trim().split("=");
    if (name !== APPLE_OAUTH_COOKIE) continue;
    const [state, nonce, extra] = value.join("=").split(".");
    if (!state || !nonce || extra) return null;
    return { state, nonce };
  }
  return null;
}

export async function verifyAppleIdentityToken(
  identityToken: string,
  clientId: string,
  expectedNonce: string,
): Promise<AppleTokenClaims | null> {
  try {
    const [encodedHeader, encodedClaims, encodedSignature, extra] =
      identityToken.split(".");
    if (!encodedHeader || !encodedClaims || !encodedSignature || extra) {
      return null;
    }

    const header = decodeJson<AppleTokenHeader>(encodedHeader);
    const claims = decodeJson<AppleTokenClaims>(encodedClaims);
    if (header.alg !== "RS256" || !header.kid) return null;

    const now = Math.floor(Date.now() / 1000);
    const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (
      claims.iss !== "https://appleid.apple.com" ||
      !audiences.includes(clientId) ||
      !Number.isSafeInteger(claims.exp) ||
      claims.exp <= now ||
      !Number.isSafeInteger(claims.iat) ||
      claims.iat > now + 300 ||
      typeof claims.sub !== "string" ||
      claims.sub.length < 8 ||
      claims.nonce !== expectedNonce
    ) {
      return null;
    }

    const keysResponse = await fetch("https://appleid.apple.com/auth/keys", {
      headers: { Accept: "application/json" },
    });
    if (!keysResponse.ok) return null;
    const keySet = (await keysResponse.json()) as {
      keys?: Array<JsonWebKey & { kid?: string }>;
    };
    const jwk = keySet.keys?.find((key) => key.kid === header.kid);
    if (!jwk) return null;

    const key = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const signedValue = encoder.encode(`${encodedHeader}.${encodedClaims}`);
    const signature = base64UrlToBytes(encodedSignature);
    const valid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      signature,
      signedValue,
    );
    return valid ? claims : null;
  } catch {
    return null;
  }
}

export async function appleNumericUserId(subject: string): Promise<number> {
  const digest = new Uint8Array(
    await crypto.subtle.digest("SHA-256", encoder.encode(`apple:${subject}`)),
  );
  let value = 0;
  for (let index = 0; index < 6; index += 1) {
    value = value * 256 + digest[index];
  }
  return value || 1;
}
