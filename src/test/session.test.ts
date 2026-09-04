import {
  createSessionCookie,
  readSession,
  type SessionUser,
} from "../../functions/_lib/session";

const secret = "test-session-secret-that-is-longer-than-32-characters";
const user: SessionUser = {
  id: 123456,
  first_name: "Test",
  username: "test_user",
  auth_date: Math.floor(Date.now() / 1000),
  paid: true,
  provider: "telegram",
  provider_user_id: "123456",
};

describe("signed server session", () => {
  test("round-trips an authenticated paid user", async () => {
    const setCookie = await createSessionCookie(user, secret);
    const cookie = setCookie.split(";")[0];
    const request = new Request("https://app.example/api/session", {
      headers: { Cookie: cookie },
    });

    await expect(readSession(request, secret)).resolves.toEqual(user);
  });

  test("rejects a tampered paid entitlement", async () => {
    const setCookie = await createSessionCookie(
      { ...user, paid: false },
      secret,
    );
    const cookie = setCookie.split(";")[0];
    const [name, token] = cookie.split("=");
    const [payload, signature] = token.split(".");
    const decoded = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(
          atob(payload.replaceAll("-", "+").replaceAll("_", "/")),
          (character) => character.charCodeAt(0),
        ),
      ),
    ) as Record<string, unknown>;
    decoded.paid = true;
    const tamperedPayload = btoa(JSON.stringify(decoded))
      .replaceAll("+", "-")
      .replaceAll("/", "_")
      .replace(/=+$/u, "");
    const request = new Request("https://app.example/api/session", {
      headers: { Cookie: `${name}=${tamperedPayload}.${signature}` },
    });

    await expect(readSession(request, secret)).resolves.toBeNull();
  });

  test("fails closed when the signing secret is missing", async () => {
    await expect(createSessionCookie(user, undefined)).rejects.toThrow(
      "SESSION_SECRET",
    );
  });
});
