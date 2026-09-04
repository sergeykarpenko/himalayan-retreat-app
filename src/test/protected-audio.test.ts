import { onRequest } from "../../functions/api/audio/[trackId]";
import {
  createSessionCookie,
  type SessionUser,
} from "../../functions/_lib/session";

const secret = "test-session-secret-that-is-longer-than-32-characters";
const baseUser: SessionUser = {
  id: 123456,
  first_name: "Test",
  auth_date: Math.floor(Date.now() / 1000),
  paid: false,
  provider: "telegram",
  provider_user_id: "123456",
};

async function requestTrack(trackId: string, user?: SessionUser) {
  const headers = new Headers();
  if (user) {
    const cookie = await createSessionCookie(user, secret);
    headers.set("Cookie", cookie.split(";")[0]);
  }

  return onRequest({
    request: new Request(`https://app.example/api/audio/${trackId}`, {
      headers,
    }),
    env: {
      SESSION_SECRET: secret,
      AUDIO_ORIGIN_URL: "https://private-audio.example",
      AUDIO_ORIGIN_TOKEN: "origin-token",
    },
    params: { trackId },
  } as never);
}

describe("protected audio endpoint", () => {
  test("rejects anonymous requests before contacting the origin", async () => {
    const originFetch = vi.mocked(fetch);
    const response = await requestTrack("calm-confidence");

    expect(response.status).toBe(401);
    expect(originFetch).not.toHaveBeenCalled();
  });

  test("rejects an unpaid user before contacting the origin", async () => {
    const originFetch = vi.mocked(fetch);
    const response = await requestTrack("full-relaxation", baseUser);

    expect(response.status).toBe(403);
    expect(originFetch).not.toHaveBeenCalled();
  });

  test("allows a paid user and authenticates to the private origin", async () => {
    const originFetch = vi.mocked(fetch);
    originFetch.mockResolvedValueOnce(
      new Response("audio", {
        status: 200,
        headers: { "Content-Type": "audio/mpeg" },
      }),
    );

    const response = await requestTrack(
      "full-relaxation",
      { ...baseUser, paid: true },
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(originFetch).toHaveBeenCalledWith(
      "https://private-audio.example/full-relaxation.mp3",
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );
    const [, init] = originFetch.mock.calls[0];
    expect(new Headers(init?.headers).get("Authorization")).toBe(
      "Bearer origin-token",
    );
  });
});
