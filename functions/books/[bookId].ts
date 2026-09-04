import { json } from "../_lib/http";

// Legacy public book URLs are intentionally retired. Books are available only
// through /api/books/:bookId, which validates the signed session.
export const onRequest: PagesFunction = async () =>
  json({ error: "not_found" }, { status: 404 });
