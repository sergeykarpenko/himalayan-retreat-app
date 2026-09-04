import { json, methodNotAllowed } from "../_lib/http";
import {
  clearSessionCookie,
  readSession,
  type SessionEnv,
} from "../_lib/session";

export const onRequest: PagesFunction<SessionEnv> = async (context) => {
  const { request, env } = context;

  if (request.method === "GET") {
    try {
      const user = await readSession(request, env.SESSION_SECRET);
      if (!user) {
        return json({ user: null }, { status: 401 });
      }
      return json({ user });
    } catch {
      return json({ error: "server_misconfigured" }, { status: 500 });
    }
  }

  if (request.method === "DELETE") {
    return json(
      { ok: true },
      {
        headers: { "Set-Cookie": clearSessionCookie() },
      },
    );
  }

  return methodNotAllowed(["GET", "DELETE"]);
};
