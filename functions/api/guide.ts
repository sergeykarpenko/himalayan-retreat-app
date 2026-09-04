import { guideSections } from "../../src/data/guide";
import { json, methodNotAllowed } from "../_lib/http";
import { readSession, type SessionEnv, type SessionUser } from "../_lib/session";

const GUEST_SECTIONS = new Set(["packing"]);
const FREE_SECTIONS = new Set(["packing", "diet", "health"]);

export const onRequest: PagesFunction<SessionEnv> = async ({ request, env }) => {
  if (request.method !== "GET") return methodNotAllowed(["GET"]);

  let user: SessionUser | null;
  try {
    user = await readSession(request, env.SESSION_SECRET);
  } catch {
    return json({ error: "server_misconfigured" }, { status: 500 });
  }

  const allowed = user?.paid ? null : user ? FREE_SECTIONS : GUEST_SECTIONS;
  const sections = allowed
    ? guideSections.filter((section) => allowed.has(section.id))
    : guideSections;
  return json({
    sections,
    access: user?.paid ? "paid" : user ? "free" : "guest",
    fastingGuideUrl: user?.paid
      ? "https://fasting.himalayanholytemple.net"
      : null,
  });
};
