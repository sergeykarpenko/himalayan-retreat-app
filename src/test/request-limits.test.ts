import { readJsonWithLimit, RequestBodyError } from "../../functions/_lib/request";

describe("bounded request parsing", () => {
  test("rejects a streamed body without Content-Length when it exceeds the limit", async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('{"token":"'));
        controller.enqueue(new TextEncoder().encode("x".repeat(300)));
        controller.enqueue(new TextEncoder().encode('"}'));
        controller.close();
      },
    });
    const request = new Request("https://app.example/api/auth-poll", {
      method: "POST",
      body: stream,
      // Required by Node's fetch implementation for streaming request bodies.
      duplex: "half",
    } as RequestInit);

    await expect(readJsonWithLimit(request, 256)).rejects.toMatchObject<Partial<RequestBodyError>>({
      code: "request_too_large",
      status: 413,
    });
  });
});
