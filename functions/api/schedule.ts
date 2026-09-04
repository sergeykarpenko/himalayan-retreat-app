import { schedule } from "../../src/data/schedule";
import { json, methodNotAllowed } from "../_lib/http";
import { readSession, type SessionEnv, type SessionUser } from "../_lib/session";

export const onRequest: PagesFunction<SessionEnv> = async ({ request, env }) => {
  if (request.method !== "GET") return methodNotAllowed(["GET"]);

  let user: SessionUser | null;
  try {
    user = await readSession(request, env.SESSION_SECRET);
  } catch {
    return json({ error: "server_misconfigured" }, { status: 500 });
  }

  return json({
    days: user ? schedule : schedule.slice(0, 1),
    access: user ? "authenticated" : "guest",
  });
};
