const BOT_AUTH_URL = "https://bot-api.himalayanholytemple.net/pwa-auth";

export async function onRequest(context: { request: Request }) {
  const url = new URL(context.request.url);
  const token = url.searchParams.get("token");

  if (!token || token.length < 8) {
    return new Response(JSON.stringify({ error: "Missing token" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const res = await fetch(`${BOT_AUTH_URL}?token=${encodeURIComponent(token)}`);
    const body = await res.text();

    return new Response(body, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return new Response(JSON.stringify({ error: "upstream_error", detail: msg }), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    });
  }
}
