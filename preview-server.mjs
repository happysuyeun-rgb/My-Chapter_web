// Live preview + editing + PDF export server for the books in books/.
//
//   node preview-server.mjs        (또는 npm run preview / 미리보기 시작.bat)
//
// 실제 기능은 server/ 아래 모듈에 있고, 이 파일은 경로(route)만 연결합니다.

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { APP_ROOT, MIME, urlFor, readJson, sendJson, attachmentHeaders, safeName } from "./server/util.mjs";
import { createWorkspace } from "./server/storage.mjs";
import { versionOf, withEditIds, applyTextEdits } from "./server/editable.mjs";
import { createHistory } from "./server/history.mjs";
import { createBooks, readMeta, STATE_FILE } from "./server/books.mjs";
import { renderPdf } from "./server/pdf.mjs";
import { applyBlockOp } from "./server/blocks.mjs";
import { syncTocTitles, structureOp, outlineOf } from "./server/toc.mjs";
import { lintBook, summaryOf } from "./server/lint.mjs";
import { injectPdfOptions, buildWebZip, buildEpub, pdfQuery, expandIds } from "./server/export.mjs";
import { parseManuscript } from "./manuscript-import.mjs";
import { applyThemeCss, readTheme } from "./server/theme.mjs";

const PORT = Number(process.env.PORT) || 5500;
const ws = createWorkspace(process.env.EBOOK_WORKSPACE || APP_ROOT);
const history = createHistory(ws);

// 점검 결과는 원고와 그림 상태 파일이 바뀔 때만 다시 계산합니다.
const lintCache = new Map();
function lintFor(htmlPath, src = ws.read(htmlPath)) {
  const statePath = path.join(path.dirname(htmlPath), STATE_FILE);
  const key = `${versionOf(src)}|${ws.exists(statePath) ? ws.stat(statePath).mtimeMs : 0}`;
  const hit = lintCache.get(htmlPath);
  if (hit && hit.key === key) return hit.result;
  const result = lintBook(src, ws.readJsonFile(statePath, {}) || {});
  lintCache.set(htmlPath, { key, result });
  return result;
}
const books = createBooks(ws, {
  history,
  lintSummary: (htmlPath, src) => {
    try { return summaryOf(lintFor(htmlPath, src)); } catch { return null; }
  },
});

const fail = (status, message) => Object.assign(new Error(message), { status });

// ───────── 원본 저장 ─────────
// 원본을 바꾸는 모든 경로는 여기를 거칩니다. 바꾸기 직전 상태를 .history에 남기고,
// 편집 중인 미리보기가 자기 저장 때문에 새로고침되지 않도록 잠깐 알림을 막습니다.
let suppressReloadUntil = 0;
function commit(htmlPath, next, reason) {
  history.snapshot(htmlPath, reason);
  suppressReloadUntil = Date.now() + 1500;
  ws.write(htmlPath, next);
  return versionOf(next);
}

function checkVersion(src, version) {
  if (version !== versionOf(src)) throw fail(409, "원본 파일이 다른 곳에서 바뀌었습니다. 새로고침한 뒤 다시 편집해 주세요.");
}

// ───────── 서재 ─────────
function libraryPage() {
  const data = JSON.stringify({ books: books.list(), trash: books.listTrash() }).replace(/</g, "\\u003c");
  return fs.readFileSync(path.join(APP_ROOT, "_shared", "library.html"), "utf8").replace("__LIBRARY__", () => data);
}

// ───────── 미리보기에 붙이는 스크립트 ─────────
const CLIENT_SNIPPET = `
<script>
window.omelette = window.omelette || {
  writeFile: (name, data) => fetch('/__state?file=' + encodeURIComponent(window.__bookEdit.file), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: data })
};
(function () {
  const es = new EventSource('/__live');
  es.addEventListener('reload', () => {
    if (window.__pbvBlockReload && window.__pbvBlockReload()) return;
    location.reload();
  });
})();
</script>
<script src="/_shared/book_editor.js"></script>
<script src="/_shared/book_tools.js"></script>`;

// ───────── 실시간 새로고침 ─────────
const liveClients = new Set();
let reloadTimer = null;
const IGNORE_RE = /(^|[\\/])(\.git|node_modules|\.history|_trash)([\\/]|$)|\.pdf$|\.zip$|\.epub$|\.image-slots\.state\.json$|book\.json$|~$|\.tmp$/i;

fs.watch(ws.root, { recursive: true }, (_event, filename) => {
  if (!filename || IGNORE_RE.test(filename)) return;
  if (Date.now() < suppressReloadUntil) return;
  clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => {
    console.log(`[reload] ${filename}`);
    broadcast();
  }, 250);
});
const broadcast = () => { for (const res of liveClients) res.write("event: reload\ndata: 1\n\n"); };

// ───────── 경로 ─────────
const bookFrom = (file) => {
  const htmlPath = ws.bookHtml(file);
  if (!htmlPath) throw fail(404, "책 파일을 찾지 못했습니다.");
  return htmlPath;
};

const routes = {
  "GET /": (req, res) => {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    res.end(libraryPage());
  },

  "GET /__wizard": (req, res) => {
    const html = fs.readFileSync(path.join(APP_ROOT, "_shared", "wizard.html"), "utf8");
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    res.end(html);
  },

  "GET /__workspace": (req, res, url) => {
    const file = url.searchParams.get("file") || "";
    bookFrom(file);
    const data = JSON.stringify({ file }).replace(/</g, "\\u003c");
    const html = fs.readFileSync(path.join(APP_ROOT, "_shared", "workspace.html"), "utf8").replace("__WORKSPACE__", () => data);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    res.end(html);
  },

  "POST /__parse": async (req, res) => {
    const body = await readJson(req);
    let file;

    if (body.text !== undefined) {
      const text = String(body.text || "");
      if (!text.trim()) throw fail(400, "파일에서 본문 글을 찾지 못했습니다.");
      file = { name: "원고.md", data: Buffer.from(text, "utf8") };
    } else {
      const name = String(body.name || "");
      const data = String(body.data || "");
      if (!name || !data) throw fail(400, "원고 파일을 선택해 주세요.");
      file = { name, data: Buffer.from(data, "base64") };
    }

    try {
      const parsed = await parseManuscript(file, String(body.title || "").trim());
      const units = parsed.units.map((u) => ({
        kind: u.kind,
        num: u.num,
        no: u.no,
        title: u.title,
        body: u.body || [],
      }));
      sendJson(res, 200, { units, stats: parsed.stats });
    } catch (err) {
      if (!err.status) err.status = 400;
      throw err;
    }
  },

  "GET /__cover": (req, res, url) => {
    const img = books.coverImage(path.dirname(bookFrom(url.searchParams.get("file"))));
    if (!img) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "Content-Type": img.type, "Cache-Control": "no-store" });
    res.end(img.data);
  },

  "GET /__theme": (req, res, url) => {
    const htmlPath = bookFrom(url.searchParams.get("file"));
    const cssPath = path.join(path.dirname(htmlPath), "book.css");
    if (!ws.exists(cssPath)) throw fail(404, "책 CSS를 찾지 못했습니다.");
    sendJson(res, 200, { theme: readTheme(ws.read(cssPath)) });
  },

  "POST /__theme": async (req, res) => {
    const body = await readJson(req);
    const htmlPath = bookFrom(body.file);
    const dir = path.dirname(htmlPath);
    if (path.basename(dir) === "내 포트폴리오, AI로 직접 만들기") {
      throw fail(400, "기준 책에는 디자인을 적용하지 않습니다.");
    }
    const cssPath = path.join(dir, "book.css");
    if (!ws.exists(cssPath)) throw fail(404, "책 CSS를 찾지 못했습니다.");
    const prev = ws.read(cssPath);
    const next = applyThemeCss(prev, String(body.theme || ""));
    const tmp = cssPath + ".theme-tmp";
    try {
      ws.write(tmp, next);
      fs.renameSync(tmp, cssPath);
    } catch (err) {
      if (ws.exists(tmp)) { try { ws.remove(tmp); } catch { /* 임시 파일만 지웁니다. */ } }
      throw err;
    }
    sendJson(res, 200, { theme: readTheme(ws.read(cssPath)) });
  },

  "POST /__new-book": async (req, res) => {
    const { file, stats } = await books.create(await readJson(req));
    console.log(`[new] ${file}${stats ? " " + JSON.stringify(stats) : ""}`);
    sendJson(res, 200, { url: urlFor(file), file, stats });
  },

  "POST /__book/info": async (req, res) => {
    const body = await readJson(req);
    const out = books.updateInfo(bookFrom(body.file), body);
    console.log(`[book] 정보 변경: ${out.file}`);
    sendJson(res, 200, out);
  },

  "POST /__book/meta": async (req, res) => {
    const body = await readJson(req);
    const htmlPath = bookFrom(body.file);
    suppressReloadUntil = Date.now() + 1500;
    sendJson(res, 200, books.setInfo(htmlPath, body));
  },

  "POST /__book/cover": async (req, res) => {
    const body = await readJson(req);
    sendJson(res, 200, books.setCover(bookFrom(body.file), body.data || null));
  },

  "POST /__book/duplicate": async (req, res) => {
    const { file } = await readJson(req);
    const out = books.duplicate(bookFrom(file));
    console.log(`[book] 사본: ${out.file}`);
    sendJson(res, 200, out);
  },

  "POST /__book/trash": async (req, res) => {
    const { file } = await readJson(req);
    const out = books.trash(bookFrom(file));
    console.log(`[book] 휴지통: ${out.trashed}`);
    sendJson(res, 200, out);
  },

  "POST /__trash/restore": async (req, res) => {
    const { id } = await readJson(req);
    sendJson(res, 200, books.restore(id));
  },

  "POST /__trash/purge": async (req, res) => {
    const { id } = await readJson(req);
    console.log(`[book] 영구 삭제: ${id}`);
    sendJson(res, 200, books.purge(id));
  },

  "GET /__live": (req, res) => {
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-store", Connection: "keep-alive" });
    res.write(": connected\n\n");
    liveClients.add(res);
    req.on("close", () => liveClients.delete(res));
  },

  "GET /__pdf": async (req, res, url) => {
    const htmlPath = bookFrom(url.searchParams.get("file"));
    const rel = ws.rel(htmlPath);
    const src = ws.read(htmlPath);
    const meta = readMeta(src);
    const ids = expandIds(src, (url.searchParams.get("ids") || "").split(",").map((s) => s.trim()).filter(Boolean));
    const print = url.searchParams.get("print") === "1";
    const watermark = url.searchParams.get("wm") === "1";
    const qs = pdfQuery({ ids, print, watermark });
    console.log(`[pdf] 생성 시작: ${rel}${ids.length ? " 발췌" : ""}${print ? " 인쇄" : ""}${watermark ? " 초안" : ""}`);
    const t0 = Date.now();
    const pdf = await renderPdf(`http://127.0.0.1:${PORT}${urlFor(rel)}?${qs}`, meta);
    const tag = [ids.length && "발췌", print && "인쇄", watermark && "초안"].filter(Boolean).join("-");
    const pdfName = safeName(meta.title || path.basename(path.dirname(htmlPath))) + (tag ? "-" + tag : "") + ".pdf";
    if (!ids.length && !print && !watermark) ws.write(path.join(path.dirname(htmlPath), safeName(meta.title || path.basename(path.dirname(htmlPath))) + ".pdf"), pdf);
    console.log(`[pdf] 완료: ${(pdf.length / 1048576).toFixed(1)}MB, ${((Date.now() - t0) / 1000).toFixed(0)}초`);
    res.writeHead(200, attachmentHeaders(pdfName, "application/pdf", pdf.length));
    res.end(pdf);
  },

  "GET /__outline": (req, res, url) => {
    sendJson(res, 200, { items: outlineOf(ws.read(bookFrom(url.searchParams.get("file")))) });
  },

  "GET /__web": (req, res, url) => {
    const htmlPath = bookFrom(url.searchParams.get("file"));
    const meta = readMeta(ws.read(htmlPath));
    const zip = buildWebZip(ws, htmlPath);
    const name = safeName(meta.title || path.basename(path.dirname(htmlPath))) + "-웹.zip";
    console.log(`[web] ${name} ${(zip.length / 1048576).toFixed(1)}MB`);
    res.writeHead(200, attachmentHeaders(name, "application/zip", zip.length));
    res.end(zip);
  },

  "GET /__epub": (req, res, url) => {
    const htmlPath = bookFrom(url.searchParams.get("file"));
    const meta = readMeta(ws.read(htmlPath));
    const epub = buildEpub(ws, htmlPath);
    const name = safeName(meta.title || path.basename(path.dirname(htmlPath))) + ".epub";
    console.log(`[epub] ${name} ${(epub.length / 1048576).toFixed(1)}MB`);
    res.writeHead(200, attachmentHeaders(name, "application/epub+zip", epub.length));
    res.end(epub);
  },

  "POST /__edit": async (req, res) => {
    const payload = await readJson(req);
    const htmlPath = bookFrom(payload.file);
    const src = ws.read(htmlPath);
    checkVersion(src, payload.version);
    const edited = applyTextEdits(src, Array.isArray(payload.changes) ? payload.changes : []);
    const { changed } = edited;
    if (payload.dryRun || !changed.length) return sendJson(res, 200, { version: payload.version, changed });
    const html = syncTocTitles(src, edited.html);
    const tocSynced = html !== edited.html;
    const version = commit(htmlPath, html, "edit");
    console.log(`[edit] ${path.basename(htmlPath)}: ${changed.length}곳 저장${tocSynced ? " (차례 동기화)" : ""}`);
    sendJson(res, 200, { version, changed, tocSynced });
  },

  "POST /__structure": async (req, res) => {
    const payload = await readJson(req);
    const htmlPath = bookFrom(payload.file);
    const src = ws.read(htmlPath);
    checkVersion(src, payload.version);
    const { html, anchor, select } = structureOp(src, payload);
    const version = commit(htmlPath, html, "structure");
    console.log(`[structure] ${path.basename(path.dirname(htmlPath))}: ${payload.op} @${payload.eid}`);
    sendJson(res, 200, { version, anchor, select: !!select });
  },

  "POST /__blocks": async (req, res) => {
    const payload = await readJson(req);
    const htmlPath = bookFrom(payload.file);
    const src = ws.read(htmlPath);
    checkVersion(src, payload.version);
    const { html, anchor, select } = applyBlockOp(src, payload);
    const version = html === src ? payload.version : commit(htmlPath, html, "blocks");
    console.log(`[blocks] ${path.basename(path.dirname(htmlPath))}: ${payload.op} ${payload.type || ""} @${payload.eid}`);
    sendJson(res, 200, { version, anchor, select: !!select });
  },

  "GET /__lint": (req, res, url) => {
    sendJson(res, 200, lintFor(bookFrom(url.searchParams.get("file"))));
  },

  "GET /__history": (req, res, url) => {
    sendJson(res, 200, { items: history.list(bookFrom(url.searchParams.get("file"))) });
  },

  "GET /__history/view": (req, res, url) => {
    const htmlPath = bookFrom(url.searchParams.get("file"));
    const diff = history.diff(history.read(htmlPath, url.searchParams.get("id")), ws.read(htmlPath));
    sendJson(res, 200, { total: diff.length, diff: diff.slice(0, 300) });
  },

  "POST /__restore": async (req, res) => {
    const { file, id } = await readJson(req);
    const htmlPath = bookFrom(file);
    const old = history.read(htmlPath, id);
    const version = commit(htmlPath, old, "restore");
    console.log(`[restore] ${path.basename(path.dirname(htmlPath))} ← ${id}`);
    sendJson(res, 200, { version });
  },

  "POST /__state": async (req, res, url) => {
    const htmlPath = bookFrom(url.searchParams.get("file"));
    const data = await readJson(req);
    ws.write(path.join(path.dirname(htmlPath), STATE_FILE), JSON.stringify(data));
    res.writeHead(204);
    res.end();
  },
};

function serveStatic(req, res, url) {
  const file = ws.resolve(url.pathname.slice(1)) || (url.pathname.startsWith("/_shared/") && path.join(APP_ROOT, url.pathname));
  if (!file) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end("not found"); return; }
    const ext = path.extname(file).toLowerCase();
    let body = data;
    if (ext === ".html") {
      const raw = data.toString("utf8");
      if (url.searchParams.has("pdf")) {
        body = injectPdfOptions(raw, url.searchParams);
      } else {
        const editInfo = `<script>window.__bookEdit = ${JSON.stringify({ file: ws.rel(file), version: versionOf(raw) })};</script>`;
        const html = withEditIds(raw);
        const i = html.lastIndexOf("</body>");
        const snippet = editInfo + CLIENT_SNIPPET;
        body = i >= 0 ? html.slice(0, i) + snippet + html.slice(i) : html + snippet;
      }
    }
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(body);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const key = `${req.method} ${url.pathname === "/index.html" ? "/" : url.pathname}`;
  const route = routes[key];
  if (!route) return serveStatic(req, res, url);
  try {
    await route(req, res, url);
  } catch (err) {
    const status = err.status || (err instanceof SyntaxError ? 400 : 500);
    if (status >= 500) console.error(`[error] ${key}:`, err);
    if (res.headersSent) { res.end(); return; }
    if (req.headers.accept?.includes("application/json") || req.method === "POST") sendJson(res, status, { error: String(err.message || err) });
    else { res.writeHead(status, { "Content-Type": "text/plain; charset=utf-8" }); res.end(String(err.message || err)); }
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`미리보기: http://127.0.0.1:${PORT}/`);
});
