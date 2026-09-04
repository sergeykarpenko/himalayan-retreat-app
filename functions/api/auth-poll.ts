import { json, methodNotAllowed } from "../_lib/http";
import { readJsonWithLimit, requestBodyError } from "../_lib/request";
import {
  createSessionCookie,
  sanitizeUser,
  type SessionEnv,
} from "../_lib/session";

interface Env extends SessionEnv {
  BOT_AUTH_URL?: string;
  BOT_API_TOKEN?: string;
}

const DEFAULT_BOT_AUTH_URL =
  "https://bot-api.himalayanholytemple.net/pwa-auth";
const TOKEN_PATTERN = /^[a-f0-9]{32}$/u;

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  if (request.method !== "POST") return methodNotAllowed(["POST"]);

  let token: unknown;
  try {
    const body = await readJsonWithLimit<{ token?: unknown }>(request, 256);
    token = body.token;
  } catch (error) {
    return requestBodyError(error) ?? json({ error: "invalid_json" }, { status: 400 });
  }

  if (typeof token !== "string" || !TOKEN_PATTERN.test(token)) {
    return json({ error: "invalid_token" }, { status: 400 });
  }

  const botAuthUrl = env.BOT_AUTH_URL || DEFAULT_BOT_AUTH_URL;
  const upstreamHeaders = new Headers({ Accept: "application/json" });
  if (env.BOT_API_TOKEN) {
    upstreamHeaders.set("Authorization", `Bearer ${env.BOT_API_TOKEN}`);
  }

  try {
    const res = await fetch(
      `${botAuthUrl}?token=${encodeURIComponent(token)}`,
      { headers: upstreamHeaders, redirect: "error" },
    );

    if (res.status === 202) {
      return json({ status: "pending" }, { status: 202 });
    }
    if (!res.ok) {
      return json(
        { error: "authentication_unavailable" },
        { status: res.status === 429 ? 429 : 502 },
      );
    }

    const payload = (await res.json()) as
      | Record<string, unknown>
      | null;
    const user = sanitizeUser(payload?.user ?? payload);
    if (!user) {
      return json({ error: "invalid_auth_response" }, { status: 502 });
    }

    const sessionCookie = await createSessionCookie(user, env.SESSION_SECRET);
    return json(
      { user },
      {
        headers: { "Set-Cookie": sessionCookie },
      },
    );
  } catch {
    return json({ error: "authentication_unavailable" }, { status: 502 });
  }
};
