import { json } from "../_lib/http";
import { readJsonWithLimit, requestBodyError } from "../_lib/request";
import {
  createSessionCookie,
  type SessionEnv,
  type SessionUser,
} from "../_lib/session";

interface Env extends SessionEnv {
  TELEGRAM_BOT_TOKEN: string;
}

interface TelegramAuthData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  if (!env.TELEGRAM_BOT_TOKEN) {
    return json({ error: "server_misconfigured" }, { status: 500 });
  }

  let data: TelegramAuthData;
  try {
    data = await readJsonWithLimit<TelegramAuthData>(request, 4096);
  } catch (error) {
    return requestBodyError(error) ?? json({ error: "invalid_json" }, { status: 400 });
  }

  const allowedFields = new Set([
    "id", "first_name", "last_name", "username", "photo_url", "auth_date", "hash",
  ]);
  if (
    !data || typeof data !== "object" ||
    Object.keys(data).some((field) => !allowedFields.has(field)) ||
    !Number.isSafeInteger(data.id) || data.id <= 0 ||
    typeof data.first_name !== "string" || data.first_name.length < 1 || data.first_name.length > 128 ||
    !Number.isSafeInteger(data.auth_date) ||
    typeof data.hash !== "string" ||
    (data.last_name !== undefined && (typeof data.last_name !== "string" || data.last_name.length > 128)) ||
    (data.username !== undefined && (typeof data.username !== "string" || data.username.length > 64)) ||
    (data.photo_url !== undefined && (typeof data.photo_url !== "string" || data.photo_url.length > 512))
  ) {
    return json({ error: "missing_required_fields" }, { status: 400 });
  }

  // Check auth_date is not older than 24 hours
  const now = Math.floor(Date.now() / 1000);
  if (now - data.auth_date > 86400 || data.auth_date > now + 300) {
    return json({ error: "auth_data_expired" }, { status: 401 });
  }

  // HMAC-SHA256 verification
  // 1. Build check string: sorted key=value pairs (excluding hash)
  const { hash, ...rest } = data;
  const checkString = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k as keyof typeof rest]}`)
    .filter((pair) => !pair.endsWith("=undefined"))
    .join("\n");

  // 2. Secret key = SHA256(bot_token)
  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(env.TELEGRAM_BOT_TOKEN)
  );

  // 3. HMAC-SHA256(secret_key, check_string)
  const key = await crypto.subtle.importKey(
    "raw",
    secretKey,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(checkString)
  );

  // 4. Compare with provided hash
  const computedHash = new Uint8Array(signature);
  const suppliedHash =
    /^[a-f0-9]{64}$/u.test(hash)
      ? Uint8Array.from(
          hash.match(/.{2}/gu) ?? [],
          (byte) => Number.parseInt(byte, 16),
        )
      : new Uint8Array();
  let mismatch = computedHash.length ^ suppliedHash.length;
  for (let index = 0; index < computedHash.length; index += 1) {
    mismatch |= computedHash[index] ^ (suppliedHash[index] ?? 0);
  }
  if (mismatch !== 0) {
    return json({ error: "invalid_hash" }, { status: 401 });
  }

  // Verified — return user without hash
  const user: SessionUser = {
    id: data.id,
    first_name: data.first_name,
    last_name: data.last_name,
    username: data.username,
    photo_url: data.photo_url,
    auth_date: data.auth_date,
    paid: false,
    provider: "telegram",
    provider_user_id: String(data.id),
  };

  try {
    const cookie = await createSessionCookie(user, env.SESSION_SECRET);
    return json({ user }, { headers: { "Set-Cookie": cookie } });
  } catch {
    return json({ error: "server_misconfigured" }, { status: 500 });
  }
};
