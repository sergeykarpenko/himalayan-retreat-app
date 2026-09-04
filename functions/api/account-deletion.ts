import { json, methodNotAllowed } from "../_lib/http";
import {
  clearSessionCookie,
  readSession,
  type SessionEnv,
} from "../_lib/session";

interface Env extends SessionEnv {
  ACCOUNT_DELETION_URL?: string;
  BOT_API_TOKEN?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  if (request.method !== "POST") return methodNotAllowed(["POST"]);

  const requestUrl = new URL(request.url);
  const origin = request.headers.get("Origin");
  if (origin !== requestUrl.origin) {
    return json({ error: "cross_origin_request_denied" }, { status: 403 });
  }

  let user;
  try {
    user = await readSession(request, env.SESSION_SECRET);
  } catch {
    return json({ error: "server_misconfigured" }, { status: 500 });
  }
  if (!user) return json({ error: "authentication_required" }, { status: 401 });

  if (!env.ACCOUNT_DELETION_URL || !env.BOT_API_TOKEN) {
    return json({ error: "deletion_service_not_configured" }, { status: 503 });
  }

  try {
    const response = await fetch(env.ACCOUNT_DELETION_URL, {
      method: "POST",
      redirect: "error",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${env.BOT_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provider: user.provider,
        provider_user_id: user.provider_user_id,
      }),
    });
    if (!response.ok) {
      return json(
        { error: "deletion_request_failed" },
        { status: response.status === 429 ? 429 : 502 },
      );
    }

    return json(
      { status: "accepted" },
      {
        status: 202,
        headers: { "Set-Cookie": clearSessionCookie() },
      },
    );
  } catch {
    return json({ error: "deletion_service_unavailable" }, { status: 502 });
  }
};
