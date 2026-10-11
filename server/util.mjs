import path from "node:path";
import { fileURLToPath } from "node:url";

export const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const decodeEntities = (s) =>
  s.replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
export const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const toPosix = (p) => p.split(path.sep).join("/");
export const urlFor = (rel) => "/" + rel.split("/").map(encodeURIComponent).join("/");
export const safeName = (s, fallback = "새 책") =>
  String(s || "").replace(/[\\/:*?"<>|]/g, " ").replace(/\s+/g, " ").trim().replace(/[. ]+$/, "") || fallback;
export const stripTags = (html) => decodeEntities(String(html).replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
export const pad2 = (n) => String(n).padStart(2, "0");

const configuredMaxJsonBodyBytes = Number(process.env.MAX_JSON_BODY_BYTES);
export const MAX_JSON_BODY_BYTES =
  Number.isFinite(configuredMaxJsonBodyBytes) && configuredMaxJsonBodyBytes > 0
    ? Math.floor(configuredMaxJsonBodyBytes)
    : 32 * 1024 * 1024;

const payloadTooLarge = (maxBytes) =>
  Object.assign(new Error(`요청이 너무 큽니다. 최대 ${Math.floor(maxBytes / 1048576)}MB까지 처리할 수 있습니다.`), { status: 413 });

export async function readJson(req, { maxBytes = MAX_JSON_BODY_BYTES } = {}) {
  const declared = Number(req.headers && req.headers["content-length"]);
  if (Number.isFinite(declared) && declared > maxBytes) throw payloadTooLarge(maxBytes);

  const chunks = [];
  let total = 0;
  for await (const c of req) {
    const chunk = Buffer.isBuffer(c) ? c : Buffer.from(c);
    total += chunk.length;
    if (total > maxBytes) throw payloadTooLarge(maxBytes);
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks, total).toString("utf8") || "{}");
}

export function sendJson(res, status, obj) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(obj));
}

export const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".epub": "application/epub+zip",
};

export function attachmentHeaders(name, type, length) {
  return {
    "Content-Type": type,
    "Content-Length": length,
    "Content-Disposition": `attachment; filename="download${path.extname(name)}"; filename*=UTF-8''${encodeURIComponent(name)}`,
    "Cache-Control": "no-store",
  };
}
