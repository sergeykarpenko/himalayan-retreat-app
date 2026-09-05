import { onRequest } from "../../functions/api/auth-poll";

const secret = "test-session-secret-that-is-longer-than-32-characters";
const token = "0123456789abcdef0123456789abcdef";

function pollRequest() {
  return onRequest({
    request: new Request("https://app.example/api/auth-poll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }),
    env: {
      SESSION_SECRET: secret,
      BOT_AUTH_URL: "https://bot.example/pwa-auth",
    },
  } as never);
}

describe("Telegram auth polling", () => {
  test("returns pending without converting it to an error", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ status: "pending" }), { status: 202 }),
    );

    const response = await pollRequest();

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ status: "pending" });
    expect(fetch).toHaveBeenCalledWith(
      `https://bot.example/pwa-auth?token=${token}`,
      expect.objectContaining({ headers: expect.any(Headers) }),
    );
    expect(fetch).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ redirect: "error" }),
    );
  });

  test("creates a signed HttpOnly session after bot confirmation", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      Response.json({
        user: {
          id: 123,
          first_name: "Test",
          auth_date: Math.floor(Date.now() / 1000),
          paid: true,
          provider: "telegram",
          provider_user_id: "123",
        },
      }),
    );

    const response = await pollRequest();

    expect(response.status).toBe(200);
    expect(response.headers.get("Set-Cookie")).toMatch(
      /^__Host-hdt_session=.*; Path=\/; Max-Age=604800; HttpOnly; Secure; SameSite=Lax$/u,
    );
    await expect(response.json()).resolves.toMatchObject({
      user: { id: 123, paid: true },
    });
  });
});
