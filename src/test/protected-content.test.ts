import { onRequest as guideRequest } from "../../functions/api/guide";
import { onRequest as scheduleRequest } from "../../functions/api/schedule";
import { createSessionCookie, type SessionUser } from "../../functions/_lib/session";
import { guideSections } from "@/data/guide";
import { schedule } from "@/data/schedule";

const secret = "test-session-secret-that-is-longer-than-32-characters";
const user: SessionUser = {
  id: 42,
  first_name: "Test",
  auth_date: Math.floor(Date.now() / 1000),
  paid: false,
  provider: "telegram",
  provider_user_id: "42",
};

async function cookieFor(sessionUser: SessionUser): Promise<string> {
  return (await createSessionCookie(sessionUser, secret)).split(";")[0];
}

describe("protected structured content", () => {
  test("guide returns only public content to guests", async () => {
    const response = await guideRequest({
      request: new Request("https://app.example/api/guide"),
      env: { SESSION_SECRET: secret },
    } as never);
    const payload = await response.json() as { sections: typeof guideSections };
    expect(payload.sections.map((section) => section.id)).toEqual(["packing"]);
  });

  test("guide applies free and paid access tiers", async () => {
    const freeResponse = await guideRequest({
      request: new Request("https://app.example/api/guide", {
        headers: { Cookie: await cookieFor(user) },
      }),
      env: { SESSION_SECRET: secret },
    } as never);
    const paidResponse = await guideRequest({
      request: new Request("https://app.example/api/guide", {
        headers: { Cookie: await cookieFor({ ...user, paid: true }) },
      }),
      env: { SESSION_SECRET: secret },
    } as never);
    expect((await freeResponse.json() as { sections: unknown[] }).sections).toHaveLength(3);
    expect((await paidResponse.json() as { sections: unknown[] }).sections).toHaveLength(guideSections.length);
  });

  test("schedule does not disclose protected days to guests", async () => {
    const response = await scheduleRequest({
      request: new Request("https://app.example/api/schedule"),
      env: { SESSION_SECRET: secret },
    } as never);
    expect((await response.json() as { days: unknown[] }).days).toHaveLength(1);

    const authenticated = await scheduleRequest({
      request: new Request("https://app.example/api/schedule", {
        headers: { Cookie: await cookieFor(user) },
      }),
      env: { SESSION_SECRET: secret },
    } as never);
    expect((await authenticated.json() as { days: unknown[] }).days).toHaveLength(schedule.length);
  });
});
