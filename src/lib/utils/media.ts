/**
 * Resolve backend-relative file paths (e.g. "/uploads/ads/12/creative.jpg")
 * against the API origin. The API base URL points at ".../api/v1" while
 * uploads are served from the backend root via StaticFiles.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
const BACKEND_ORIGIN = API_BASE.replace(/\/api\/v1\/?$/, "");

export function backendFileUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${BACKEND_ORIGIN}${path.startsWith("/") ? "" : "/"}${path}`;
}
