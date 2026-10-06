// 서재의 책 목록·만들기·이름 변경·복제·휴지통, 서재 전용 정보(book.json), 표지 이미지.

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { decodeEntities, escapeHtml, safeName, stripTags } from "./util.mjs";
import { importManuscript, renderUnits } from "../manuscript-import.mjs";
import { THEMES, applyThemeCss } from "./theme.mjs";

export const STATE_FILE = ".image-slots.state.json";
export const BOOK_JSON = "book.json";
export const STATUSES = { draft: "초안", review: "검토 중", done: "완료" };
export const COVER_COLORS = ["#1C1B19", "#1F2A44", "#2D3B2F", "#5A2E2A", "#3B2F4A", "#F1EEE7"];
const SKIP_COPY = new Set([".history"]);

export function readMeta(html) {
  const head = html.slice(0, html.indexOf("</head>") + 1 || 20000);
  const meta = (name) => {
    const m = head.match(new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]*)"`, "i"));
    return m ? decodeEntities(m[1]).trim() : "";
  };
  const t = head.match(/<title>([\s\S]*?)<\/title>/i);
  return {
    title: t ? decodeEntities(t[1]).trim() : "",
    author: meta("author"),
    subject: meta("description"),
    keywords: meta("keywords").split(",").map((k) => k.trim()).filter(Boolean),
  };
}

export function createBooks(ws, { history, lintSummary } = {}) {
  const findHtml = (dir) => {
    const files = ws.list(dir).filter((d) => d.isFile() && /\.html?$/i.test(d.name)).map((d) => d.name);
    return files.includes("book.html") ? "book.html" : files[0];
  };
  const bookDir = (htmlPath) => path.dirname(htmlPath);
  const infoPath = (dir) => path.join(dir, BOOK_JSON);
  const readInfo = (dir) => ({ status: "draft", tags: [], ...(ws.readJsonFile(infoPath(dir), {}) || {}) });
  const writeInfo = (dir, info) => ws.writeJsonFile(infoPath(dir), info);

  function coverImage(dir) {
    const state = ws.readJsonFile(path.join(dir, STATE_FILE), {}) || {};
    const v = state["cover-image"];
    const u = typeof v === "string" ? v : v && v.u;
    const m = u && u.match(/^data:(image\/[\w+.-]+);base64,(.+)$/);
    return m ? { type: m[1], data: Buffer.from(m[2], "base64") } : null;
  }

  function summarize(dir, folder) {
    const html = findHtml(dir);
    if (!html) return null;
    const full = path.join(dir, html);
    const src = ws.read(full);
    const meta = readMeta(src);
    const sub = src.match(/<p class="tp-sub">([\s\S]*?)<\/p>/);
    const pdfName = safeName(meta.title || folder) + ".pdf";
    const pdfs = ws.list(dir)
      .filter((d) => d.isFile() && /\.pdf$/i.test(d.name))
      .map((d) => ({ name: d.name, mtime: ws.stat(path.join(dir, d.name)).mtimeMs }))
      .sort((a, b) => (b.name === pdfName) - (a.name === pdfName) || b.mtime - a.mtime);
    const info = readInfo(dir);
    const mtime = ws.stat(full).mtimeMs;
    return {
      ...meta,
      subtitle: sub ? stripTags(sub[1]) : "",
      folder,
      file: ws.rel(full),
      mtime,
      pdf: pdfs[0] ? { file: ws.rel(path.join(dir, pdfs[0].name)), mtime: pdfs[0].mtime } : null,
      hasCover: !!coverImage(dir),
      status: STATUSES[info.status] ? info.status : "draft",
      tags: Array.isArray(info.tags) ? info.tags : [],
      coverColor: info.coverColor || "",
      createdAt: info.createdAt || null,
      stats: lintSummary ? lintSummary(full, src, mtime) : null,
    };
  }

  function list() {
    return ws.list(ws.booksDir)
      .filter((d) => d.isDirectory() && !/^[._]/.test(d.name))
      .map((d) => summarize(path.join(ws.booksDir, d.name), d.name))
      .filter(Boolean)
      .sort((a, b) => b.mtime - a.mtime);
  }

  function uniqueFolder(base, parent = ws.booksDir) {
    let folder = base;
    for (let n = 2; ws.exists(path.join(parent, folder)); n++) folder = `${base} (${n})`;
    return folder;
  }

  async function create({ title, subtitle, author, source, units, themeId } = {}) {
    title = String(title || "").trim();
    if (!title) throw Object.assign(new Error("책 제목을 입력해 주세요."), { status: 400 });
    const theme = themeId == null || themeId === "" ? "practical" : String(themeId);
    if (!THEMES.includes(theme)) throw Object.assign(new Error("고를 수 없는 디자인입니다."), { status: 400 });
    let imported = null;
    let sourceFile = null;
    if (source && source.data) {
      const name = safeName(path.basename(String(source.name || "원고.txt")), "원고.txt");
      sourceFile = { name, data: Buffer.from(source.data, "base64") };
    }
    // units가 있으면 S07 수정 구조를 그대로 쓰고, 원본 source는 성공 시에만 보관합니다.
    if (units != null) imported = renderUnits(units);
    else if (sourceFile) imported = await importManuscript(sourceFile, title);

    const dest = path.join(ws.booksDir, uniqueFolder(safeName(title)));
    try {
      ws.copyDir(ws.templateDir, dest);
      const now = new Date();
      const values = {
        TITLE: escapeHtml(title),
        SUBTITLE: escapeHtml(String(subtitle || "").trim()),
        AUTHOR: escapeHtml(String(author || "").trim() || "저자"),
        YEAR: String(now.getFullYear()),
        DATE: `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일`,
        TITLE_CSS: title.replace(/\\/g, "\\\\").replace(/"/g, '\\"'),
      };
      for (const d of ws.list(dest)) {
        if (!/\.(html|css)$/i.test(d.name)) continue;
        const p = path.join(dest, d.name);
        ws.write(p, ws.read(p).replace(/\{\{(\w+)\}\}/g, (m, k) => values[k] ?? m));
      }
      const htmlPath = path.join(dest, findHtml(dest));
      if (imported) {
        const html = ws.read(htmlPath);
        const start = html.indexOf('<section class="toc"');
        const end = html.lastIndexOf("</body>");
        ws.write(htmlPath, html.slice(0, start) + imported.html + "\n" + html.slice(end));
        if (sourceFile) ws.write(path.join(dest, "source", sourceFile.name), sourceFile.data);
      }
      const cssPath = path.join(dest, "book.css");
      if (!ws.exists(cssPath)) throw Object.assign(new Error("책 디자인을 적용할 CSS가 없습니다."), { status: 500 });
      ws.write(cssPath, applyThemeCss(ws.read(cssPath), theme));
      writeInfo(dest, { status: "draft", tags: [], createdAt: now.toISOString(), id: crypto.randomUUID() });
      return { file: ws.rel(htmlPath), stats: imported?.stats };
    } catch (err) {
      if (dest.startsWith(ws.booksDir + path.sep) && dest !== ws.booksDir && ws.exists(dest)) {
        try { ws.remove(dest); } catch { /* 신규 폴더만 되돌립니다. */ }
      }
      throw err;
    }
  }

  // 표지·속표지·판권·head에 흩어진 제목/부제/저자를 함께 바꿉니다. 줄바꿈(<br>)이나 강조가 들어간
  // 표지 제목처럼 글자만 같은 요소는 내용을 새 글자로 바꾸고, 그 밖의 본문은 건드리지 않습니다.
  function rewriteFront(html, before, after) {
    const tocAt = html.search(/<section class="toc"/);
    const cut = tocAt > 0 ? tocAt : html.indexOf("<section class=\"chapter");
    let front = cut > 0 ? html.slice(0, cut) : html;
    const rest = cut > 0 ? html.slice(cut) : "";
    const norm = (s) => s.replace(/\s+/g, "");
    for (const key of ["title", "subtitle", "author"]) {
      const oldV = before[key] || "";
      const newV = after[key];
      if (newV === undefined || newV === oldV) continue;
      if (oldV) {
        front = front.replace(/(<(h1|div|p|span|dd|title)\b[^>]*>)((?:(?!<\/?(?:h1|div|p|span|dd|dt|title|section)\b)[\s\S])*?)(<\/\2>)/g, (m, open, tag, body, close) => {
          const t = stripTags(body);
          if (t && norm(t) === norm(oldV)) return open + escapeHtml(newV) + close;
          if (body.includes(escapeHtml(oldV))) return open + body.split(escapeHtml(oldV)).join(escapeHtml(newV)) + close;
          return m;
        });
        front = front.split(`content="${escapeHtml(oldV)}"`).join(`content="${escapeHtml(newV)}"`);
      }
      if (key === "subtitle") {
        front = front
          .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/i, `$1${escapeHtml(newV)}$2`)
          .replace(/(<(div|p) class="(?:kicker|tp-sub|col-sub)">)\s*(<\/\2>)/g, `$1${escapeHtml(newV)}$3`);
      }
      if (key === "author") front = front.replace(/(<meta\s+name="author"\s+content=")[^"]*(")/i, `$1${escapeHtml(newV)}$2`);
      if (key === "title") front = front.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(newV)}</title>`);
    }
    const t = after.title ?? before.title;
    const s = after.subtitle ?? before.subtitle;
    front = front.replace(/(<template id="__bundler_thumbnail">)[\s\S]*?(<\/template>)/, `$1${escapeHtml(s ? `${t} — ${s}` : t)}$2`);
    return front + rest;
  }

  function updateInfo(htmlPath, { title, subtitle, author, renameFolder }) {
    const src = ws.read(htmlPath);
    const meta = readMeta(src);
    const sub = src.match(/<p class="tp-sub">([\s\S]*?)<\/p>/);
    const before = { title: meta.title, subtitle: sub ? stripTags(sub[1]) : meta.subject, author: meta.author };
    const after = {
      title: title === undefined ? undefined : String(title).trim(),
      subtitle: subtitle === undefined ? undefined : String(subtitle).trim(),
      author: author === undefined ? undefined : String(author).trim(),
    };
    if (after.title === "") throw Object.assign(new Error("책 제목을 입력해 주세요."), { status: 400 });
    const next = rewriteFront(src, before, after);
    if (next !== src) {
      history?.snapshot(htmlPath, "rename");
      ws.write(htmlPath, next);
    }
    const dir = bookDir(htmlPath);
    if (after.title && after.title !== before.title) {
      for (const d of ws.list(dir).filter((d) => /\.css$/i.test(d.name))) {
        const p = path.join(dir, d.name);
        const css = ws.read(p);
        const q = (s) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
        const out = css.split(`content: ${q(before.title)}`).join(`content: ${q(after.title)}`);
        if (out !== css) ws.write(p, out);
      }
    }
    let finalPath = htmlPath;
    if (renameFolder && after.title) {
      const folder = safeName(after.title);
      if (folder !== path.basename(dir)) {
        const dest = path.join(ws.booksDir, uniqueFolder(folder));
        ws.move(dir, dest);
        finalPath = path.join(dest, path.basename(htmlPath));
      }
    }
    return { file: ws.rel(finalPath) };
  }

  function duplicate(htmlPath) {
    const dir = bookDir(htmlPath);
    const dest = path.join(ws.booksDir, uniqueFolder(`${path.basename(dir)} 사본`));
    ws.copyDir(dir, dest, (name) => SKIP_COPY.has(name) || /\.pdf$/i.test(name));
    const copy = path.join(dest, path.basename(htmlPath));
    const meta = readMeta(ws.read(copy));
    const info = readInfo(dest);
    writeInfo(dest, { ...info, status: "draft", createdAt: new Date().toISOString(), id: crypto.randomUUID() });
    return updateInfo(copy, { title: `${meta.title || path.basename(dir)} (사본)` });
  }

  function trash(htmlPath) {
    const dir = bookDir(htmlPath);
    const name = `${Date.now()}__${path.basename(dir)}`;
    ws.move(dir, path.join(ws.trashDir, name));
    return { trashed: name };
  }

  function listTrash() {
    return ws.list(ws.trashDir)
      .filter((d) => d.isDirectory() && /^\d+__/.test(d.name))
      .map((d) => {
        const [time, ...rest] = d.name.split("__");
        const dir = path.join(ws.trashDir, d.name);
        const html = findHtml(dir);
        const meta = html ? readMeta(ws.read(path.join(dir, html))) : {};
        return { id: d.name, folder: rest.join("__"), title: meta.title || rest.join("__"), author: meta.author || "", deletedAt: Number(time) };
      })
      .sort((a, b) => b.deletedAt - a.deletedAt);
  }

  function trashDir(id) {
    if (!/^\d+__[^\\/]+$/.test(String(id))) return null;
    const dir = path.join(ws.trashDir, id);
    return ws.exists(dir) ? dir : null;
  }

  function restore(id) {
    const dir = trashDir(id);
    if (!dir) throw Object.assign(new Error("휴지통에서 찾지 못했습니다."), { status: 404 });
    const dest = path.join(ws.booksDir, uniqueFolder(id.split("__").slice(1).join("__")));
    ws.move(dir, dest);
    return { file: ws.rel(path.join(dest, findHtml(dest))) };
  }

  function purge(id) {
    const dir = trashDir(id);
    if (!dir) throw Object.assign(new Error("휴지통에서 찾지 못했습니다."), { status: 404 });
    ws.remove(dir);
    return { ok: true };
  }

  function setInfo(htmlPath, patch) {
    const dir = bookDir(htmlPath);
    const info = readInfo(dir);
    if (patch.status !== undefined) {
      if (!STATUSES[patch.status]) throw Object.assign(new Error("알 수 없는 상태입니다."), { status: 400 });
      info.status = patch.status;
    }
    if (patch.tags !== undefined) {
      info.tags = [...new Set((Array.isArray(patch.tags) ? patch.tags : String(patch.tags).split(","))
        .map((t) => String(t).trim()).filter(Boolean))].slice(0, 12);
    }
    if (patch.coverColor !== undefined) {
      if (patch.coverColor && !COVER_COLORS.includes(patch.coverColor)) throw Object.assign(new Error("고를 수 없는 색입니다."), { status: 400 });
      info.coverColor = patch.coverColor || "";
      applyCoverColor(htmlPath, info.coverColor);
    }
    writeInfo(dir, info);
    return info;
  }

  // 표지 바탕색은 책 HTML head의 작은 style 블록으로 넣어 PDF에도 그대로 나오게 합니다.
  function applyCoverColor(htmlPath, color) {
    const src = ws.read(htmlPath);
    const re = /\n?<style id="book-cover-color">[\s\S]*?<\/style>/;
    const light = color === "#F1EEE7";
    const block = color
      ? `\n<style id="book-cover-color">.cover{background:${color}${light ? ";color:#1C1B19" : ""}}${light ? ".cover-top,.cover-bottom{color:rgba(28,27,25,.6)}" : ""}</style>`
      : "";
    let next = re.test(src) ? src.replace(re, block) : src.replace("</head>", `${block}\n</head>`);
    if (next === src) return;
    history?.snapshot(htmlPath, "cover");
    ws.write(htmlPath, next);
  }

  function setCover(htmlPath, dataUrl) {
    const statePath = path.join(bookDir(htmlPath), STATE_FILE);
    const state = ws.readJsonFile(statePath, {}) || {};
    if (dataUrl) {
      if (!/^data:image\/(png|jpeg|webp|avif);base64,/.test(dataUrl)) throw Object.assign(new Error("PNG, JPEG, WebP 이미지만 쓸 수 있어요."), { status: 400 });
      state["cover-image"] = { u: dataUrl, s: 1, x: 0, y: 0 };
    } else delete state["cover-image"];
    const next = JSON.stringify(state);
    const tmp = statePath + ".cover-tmp";
    try {
      ws.write(tmp, next);
      fs.copyFileSync(tmp, statePath);
    } catch (err) {
      throw err;
    } finally {
      if (ws.exists(tmp)) { try { ws.remove(tmp); } catch { /* 임시 파일만 지웁니다. */ } }
    }
    return { hasCover: !!dataUrl };
  }

  return { list, create, updateInfo, duplicate, trash, listTrash, restore, purge, setInfo, setCover, coverImage, findHtml, readInfo, bookDir };
}
