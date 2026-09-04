import { json } from "./http";

export class RequestBodyError extends Error {
  constructor(
    public readonly code: "request_too_large" | "invalid_json",
    public readonly status: 400 | 413,
  ) {
    super(code);
  }
}

export async function readJsonWithLimit<T>(
  request: Request,
  maxBytes: number,
): Promise<T> {
  const declaredLength = request.headers.get("Content-Length");
  if (declaredLength && Number(declaredLength) > maxBytes) {
    throw new RequestBodyError("request_too_large", 413);
  }

  if (!request.body) throw new RequestBodyError("invalid_json", 400);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new RequestBodyError("request_too_large", 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder().decode(bytes)) as T;
  } catch {
    throw new RequestBodyError("invalid_json", 400);
  }
}

export function requestBodyError(error: unknown): Response | null {
  return error instanceof RequestBodyError
    ? json({ error: error.code }, { status: error.status })
    : null;
}
