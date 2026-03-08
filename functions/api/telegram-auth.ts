interface Env {
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
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let data: TelegramAuthData;
  try {
    data = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!data.id || !data.first_name || !data.auth_date || !data.hash) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Check auth_date is not older than 24 hours
  const now = Math.floor(Date.now() / 1000);
  if (now - data.auth_date > 86400) {
    return new Response(JSON.stringify({ error: "Auth data expired" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
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
  const computedHash = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  if (computedHash !== hash) {
    return new Response(JSON.stringify({ error: "Invalid hash" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Verified — return user without hash
  const user = {
    id: data.id,
    first_name: data.first_name,
    last_name: data.last_name,
    username: data.username,
    photo_url: data.photo_url,
    auth_date: data.auth_date,
  };

  return new Response(JSON.stringify({ user }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
