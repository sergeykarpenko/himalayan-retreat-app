export interface SessionEnv {
  SESSION_SECRET: string;
}

export interface SessionUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  paid: boolean;
  provider: "telegram" | "apple";
  provider_user_id: string;
}

interface SessionPayload extends SessionUser {
  exp: number;
}

const SESSION_COOKIE = "__Host-hdt_session";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;
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

function base64UrlToBytes(value: string): Uint8Array | null {
  try {
    const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const binary = atob(padded);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

async function hmac(secret: string, value: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return new Uint8Array(signature);
}

function constantTimeEqual(left: Uint8Array, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left[index] ^ right[index];
  }
  return mismatch === 0;
}

function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const [cookieName, ...cookieValue] = part.trim().split("=");
    if (cookieName === name) return cookieValue.join("=");
  }
  return null;
}

function assertSecret(secret: string | undefined): asserts secret is string {
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters");
  }
}

export function sanitizeUser(value: unknown): SessionUser | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Record<string, unknown>;

  if (
    !Number.isSafeInteger(candidate.id) ||
    Number(candidate.id) <= 0 ||
    typeof candidate.first_name !== "string" ||
    candidate.first_name.trim().length === 0 ||
    !Number.isSafeInteger(candidate.auth_date)
  ) {
    return null;
  }

  const optionalString = (field: string): string | undefined => {
    const item = candidate[field];
    return typeof item === "string" && item.length <= 512 ? item : undefined;
  };

  return {
    id: Number(candidate.id),
    first_name: candidate.first_name.slice(0, 128),
    last_name: optionalString("last_name"),
    username: optionalString("username"),
    photo_url: optionalString("photo_url"),
    auth_date: Number(candidate.auth_date),
    paid: candidate.paid === true,
    provider: candidate.provider === "apple" ? "apple" : "telegram",
    provider_user_id:
      typeof candidate.provider_user_id === "string" &&
      candidate.provider_user_id.length <= 512
        ? candidate.provider_user_id
        : String(candidate.id),
  };
}

export async function createSessionCookie(
  user: SessionUser,
  secret: string | undefined,
): Promise<string> {
  assertSecret(secret);
  const payload: SessionPayload = {
    ...user,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encodedPayload = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = bytesToBase64Url(await hmac(secret, encodedPayload));
  return [
    `${SESSION_COOKIE}=${encodedPayload}.${signature}`,
    "Path=/",
    `Max-Age=${SESSION_TTL_SECONDS}`,
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ].join("; ");
}

export function clearSessionCookie(): string {
  return [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ].join("; ");
}

export async function readSession(
  request: Request,
  secret: string | undefined,
): Promise<SessionUser | null> {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return null;
  assertSecret(secret);

  const [encodedPayload, encodedSignature, extra] = token.split(".");
  if (!encodedPayload || !encodedSignature || extra) return null;

  const suppliedSignature = base64UrlToBytes(encodedSignature);
  if (!suppliedSignature) return null;
  const expectedSignature = await hmac(secret, encodedPayload);
  if (!constantTimeEqual(suppliedSignature, expectedSignature)) return null;

  const payloadBytes = base64UrlToBytes(encodedPayload);
  if (!payloadBytes) return null;

  try {
    const parsed = JSON.parse(decoder.decode(payloadBytes)) as SessionPayload;
    const user = sanitizeUser(parsed);
    if (
      !user ||
      !Number.isSafeInteger(parsed.exp) ||
      parsed.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}
