import { json, methodNotAllowed } from "../../_lib/http";
import { readSession, type SessionEnv } from "../../_lib/session";

interface Env extends SessionEnv {
  AUDIO_ORIGIN_URL?: string;
  AUDIO_ORIGIN_TOKEN?: string;
}

interface AudioDefinition {
  fileName: string;
  paid: boolean;
}

const AUDIO: Record<string, AudioDefinition> = {
  "calm-confidence": {
    fileName: "calm-and-confidence.mp3",
    paid: false,
  },
  "deep-immersion": {
    fileName: "deep-immersion.mp3",
    paid: false,
  },
  "full-relaxation": {
    fileName: "full-relaxation.mp3",
    paid: true,
  },
  abundance: {
    fileName: "abundance-flow.mp3",
    paid: true,
  },
  soul: {
    fileName: "soul-attunement.mp3",
    paid: true,
  },
  "negativity-release": {
    fileName: "negativity-release.mp3",
    paid: true,
  },
};

const FORWARDED_HEADERS = [
  "Accept-Ranges",
  "Content-Disposition",
  "Content-Length",
  "Content-Range",
  "Content-Type",
  "ETag",
  "Last-Modified",
] as const;

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  if (request.method !== "GET" && request.method !== "HEAD") {
    return methodNotAllowed(["GET", "HEAD"]);
  }

  let user;
  try {
    user = await readSession(request, env.SESSION_SECRET);
  } catch {
    return json({ error: "server_misconfigured" }, { status: 500 });
  }
  if (!user) return json({ error: "authentication_required" }, { status: 401 });

  const trackId = Array.isArray(params.trackId)
    ? params.trackId[0]
    : params.trackId;
  const audio = trackId ? AUDIO[trackId] : undefined;
  if (!audio) return json({ error: "not_found" }, { status: 404 });
  if (audio.paid && !user.paid) {
    return json({ error: "paid_access_required" }, { status: 403 });
  }

  const originUrl = env.AUDIO_ORIGIN_URL?.replace(/\/+$/u, "");
  if (!originUrl || !env.AUDIO_ORIGIN_TOKEN) {
    return json({ error: "audio_origin_not_configured" }, { status: 503 });
  }

  const originHeaders = new Headers({
    Authorization: `Bearer ${env.AUDIO_ORIGIN_TOKEN}`,
  });
  const range = request.headers.get("Range");
  if (range) originHeaders.set("Range", range);

  let originResponse: Response;
  try {
    originResponse = await fetch(
      `${originUrl}/${encodeURIComponent(audio.fileName)}`,
      {
        method: request.method,
        headers: originHeaders,
        redirect: "error",
      },
    );
  } catch {
    return json({ error: "audio_origin_unavailable" }, { status: 502 });
  }

  if (!originResponse.ok && originResponse.status !== 206) {
    return json(
      { error: "audio_unavailable" },
      { status: originResponse.status === 404 ? 404 : 502 },
    );
  }

  const responseHeaders = new Headers({
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  });
  for (const name of FORWARDED_HEADERS) {
    const value = originResponse.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }

  return new Response(
    request.method === "HEAD" ? null : originResponse.body,
    {
      status: originResponse.status,
      headers: responseHeaders,
    },
  );
};
