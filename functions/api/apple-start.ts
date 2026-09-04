import {
  createAppleOAuthCookie,
  randomOAuthValue,
  type AppleOAuthEnv,
} from "../_lib/apple-oauth";
import { json, methodNotAllowed } from "../_lib/http";

export const onRequest: PagesFunction<AppleOAuthEnv> = async (context) => {
  const { request, env } = context;
  if (request.method !== "GET") return methodNotAllowed(["GET"]);

  if (!env.APPLE_CLIENT_ID || !env.APPLE_REDIRECT_URI) {
    return json({ error: "apple_sign_in_not_configured" }, { status: 503 });
  }

  let redirectUri: URL;
  try {
    redirectUri = new URL(env.APPLE_REDIRECT_URI);
    if (redirectUri.protocol !== "https:") throw new Error("https_required");
  } catch {
    return json({ error: "apple_sign_in_misconfigured" }, { status: 500 });
  }

  const state = randomOAuthValue();
  const nonce = randomOAuthValue();
  const authorizationUrl = new URL("https://appleid.apple.com/auth/authorize");
  authorizationUrl.search = new URLSearchParams({
    client_id: env.APPLE_CLIENT_ID,
    redirect_uri: redirectUri.toString(),
    response_type: "code id_token",
    response_mode: "form_post",
    scope: "name email",
    state,
    nonce,
  }).toString();

  return new Response(null, {
    status: 302,
    headers: {
      "Cache-Control": "no-store",
      Location: authorizationUrl.toString(),
      "Set-Cookie": createAppleOAuthCookie(state, nonce),
    },
  });
};
