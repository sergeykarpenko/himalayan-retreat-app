import {
  appleNumericUserId,
  clearAppleOAuthCookie,
  readAppleOAuthCookie,
  verifyAppleIdentityToken,
  type AppleOAuthEnv,
} from "../_lib/apple-oauth";
import { json, methodNotAllowed } from "../_lib/http";
import {
  createSessionCookie,
  type SessionUser,
} from "../_lib/session";

interface AppleName {
  name?: {
    firstName?: string;
    lastName?: string;
  };
}

interface EntitlementResponse {
  paid?: boolean;
  first_name?: string;
  last_name?: string;
}

export const onRequest: PagesFunction<AppleOAuthEnv> = async (context) => {
  const { request, env } = context;
  if (request.method !== "POST") return methodNotAllowed(["POST"]);
  if (!env.APPLE_CLIENT_ID) {
    return json({ error: "apple_sign_in_not_configured" }, { status: 503 });
  }

  const contentLength = Number(request.headers.get("Content-Length") || 0);
  if (contentLength > 16_384) {
    return json({ error: "request_too_large" }, { status: 413 });
  }

  const oauthCookie = readAppleOAuthCookie(request);
  if (!oauthCookie) {
    return json({ error: "oauth_session_missing" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "invalid_callback" }, { status: 400 });
  }

  const state = form.get("state");
  const identityToken = form.get("id_token");
  if (
    typeof state !== "string" ||
    state !== oauthCookie.state ||
    typeof identityToken !== "string"
  ) {
    return json({ error: "invalid_oauth_state" }, { status: 401 });
  }

  const claims = await verifyAppleIdentityToken(
    identityToken,
    env.APPLE_CLIENT_ID,
    oauthCookie.nonce,
  );
  if (!claims) {
    return json({ error: "invalid_apple_identity" }, { status: 401 });
  }

  let appleName: AppleName = {};
  const rawUser = form.get("user");
  if (typeof rawUser === "string" && rawUser.length <= 4096) {
    try {
      appleName = JSON.parse(rawUser) as AppleName;
    } catch {
      appleName = {};
    }
  }

  let entitlement: EntitlementResponse = {};
  if (env.APPLE_ENTITLEMENT_URL && env.BOT_API_TOKEN) {
    try {
      const response = await fetch(env.APPLE_ENTITLEMENT_URL, {
        method: "POST",
        redirect: "error",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${env.BOT_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: "apple",
          provider_user_id: claims.sub,
          email: claims.email,
          first_name: appleName.name?.firstName,
          last_name: appleName.name?.lastName,
        }),
      });
      if (response.ok) {
        entitlement = (await response.json()) as EntitlementResponse;
      }
    } catch {
      // Fail closed for paid access while still allowing a verified Apple login.
    }
  }

  const firstName =
    entitlement.first_name ||
    appleName.name?.firstName ||
    claims.email?.split("@")[0] ||
    "Apple User";
  const user: SessionUser = {
    id: await appleNumericUserId(claims.sub),
    first_name: firstName.slice(0, 128),
    last_name: (entitlement.last_name || appleName.name?.lastName)?.slice(0, 128),
    auth_date: Math.floor(Date.now() / 1000),
    paid: entitlement.paid === true,
    provider: "apple",
    provider_user_id: claims.sub,
  };

  let sessionCookie: string;
  try {
    sessionCookie = await createSessionCookie(user, env.SESSION_SECRET);
  } catch {
    return json({ error: "server_misconfigured" }, { status: 500 });
  }

  const headers = new Headers({
    "Cache-Control": "no-store",
    Location: "/auth/apple-complete",
  });
  headers.append("Set-Cookie", sessionCookie);
  headers.append("Set-Cookie", clearAppleOAuthCookie());
  return new Response(null, { status: 303, headers });
};
