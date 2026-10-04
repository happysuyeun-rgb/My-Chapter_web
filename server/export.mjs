// PDF 인쇄 옵션을 미리보기 HTML에 심고, 웹 공개용 zip과 EPUB 3를 만듭니다.

import path from "node:path";
import { APP_ROOT, escapeHtml, safeName } from "./util.mjs";
import { readMeta, STATE_FILE } from "./books.mjs";
import { readStructure } from "./toc.mjs";
import { makeZip } from "./zip.mjs";

const SHARED = [
  "paged.polyfill.js",
  "paged_book_viewer.js",
  "paged_book_viewer.css",
  "image_slot.js",
  "fonts/PretendardVariable.woff2",
  "fonts/JetBrainsMono-500.woff2",
  "fonts/JetBrainsMono-700.woff2",
];

function extOf(mime) {
  if (mime === "jpeg") return "jpg";
  if (mime === "svg+xml") return "svg";
  return mime.replace(/[^a-z0-9]+/g, "") || "bin";
}

export function extractImages(state) {
  const files = [];
  const map = {};
  for (const [id, v] of Object.entries(state || {})) {
    const u = typeof v === "string" ? v : v && v.u;
    const m = u && String(u).match(/^data:image\/([\w+.-]+);base64,(.+)$/);
    if (!m) continue;
    const name = `${id.replace(/[^\w.-]+/g, "_")}.${extOf(m[1])}`;
    files.push({ name, data: Buffer.from(m[2], "base64") });
    map[id] = name;
  }
  return { files, map };
}

function braceBlock(src, startKw) {
  const i = src.search(startKw);
  if (i < 0) return { start: -1, end: -1 };
  const open = src.indexOf("{", i);
  let depth = 0;
  for (let j = open; j < src.length; j++) {
    if (src[j] === "{") depth++;
    else if (src[j] === "}") {
      depth--;
      if (!depth) return { start: i, end: j + 1 };
    }
  }
  return { start: i, end: src.length };
}

function stripAtPage(css) {
  let out = css;
  while (true) {
    const b = braceBlock(out, /@page\b/);
    if (b.start < 0) break;
    out = out.slice(0, b.start) + out.slice(b.end);
  }
  return out;
}

export function injectPdfOptions(html, params) {
  const ids = String(params.get("ids") || "").split(",").map((s) => s.trim()).filter(Boolean);
  const print = params.get("print") === "1";
  const wm = params.get("wm") === "1";
  if (!ids.length && !print && !wm) return html;

  const css = [];
  if (print) {
    css.push(`@page{size:176mm 246mm;marks:crop;bleed:3mm}`);
    css.push(`@page :first{size:176mm 246mm;marks:crop;bleed:3mm}`);
    css.push(`@page front{size:176mm 246mm;marks:crop;bleed:3mm}`);
    css.push(`@page part{size:176mm 246mm;marks:crop;bleed:3mm}`);
    css.push(`@page chapter:first{size:176mm 246mm;marks:crop;bleed:3mm}`);
  }
  if (wm) {
    css.push(`.pagedjs_pagebox::after{content:"초안";position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
      font:800 72pt Pretendard,sans-serif;color:rgba(28,27,25,.07);transform:rotate(-28deg);pointer-events:none;z-index:20;letter-spacing:.12em;}`);
  }
  const style = css.length ? `<style id="pdf-export-opts">${css.join("")}</style>\n` : "";
  const script = `<script id="pdf-export-opts-js">
(function () {
  var ids = ${JSON.stringify(ids)};
  function hide() {
    if (!ids.length) return;
    var keep = new Set(ids);
    document.querySelectorAll("section.chapter[id], section.part[id]").forEach(function (s) {
      if (!keep.has(s.id)) s.remove();
    });
    document.querySelectorAll(".toc a[href^=\\"#\\"]").forEach(function (a) {
      var id = a.getAttribute("href").slice(1);
      if (!keep.has(id)) { var li = a.closest("li"); if (li) li.remove(); }
    });
    document.querySelectorAll("section.part").forEach(function (p) {
      var list = p.querySelector(".part-list");
      if (!list) return;
      list.querySelectorAll("li").forEach(function (li) {
        var t = (li.textContent || "").replace(/^\\s*\\d+\\s*/, "").trim();
        var hit = Array.from(document.querySelectorAll("section.chapter")).some(function (c) {
          var h = c.querySelector(".opener h1, header h1");
          return h && h.textContent.trim() === t;
        });
        if (!hit) li.remove();
      });
    });
  }
  var prev = window.PagedConfig || {};
  window.PagedConfig = Object.assign({}, prev, {
    before: function () {
      hide();
      return prev.before ? prev.before() : undefined;
    }
  });
})();
</script>\n`;

  let out = html;
  if (style) {
    const head = out.lastIndexOf("</head>");
    out = head >= 0 ? out.slice(0, head) + style + out.slice(head) : style + out;
  }
  const poly = out.search(/<script[^>]+paged\.polyfill\.js/i);
  if (poly >= 0) out = out.slice(0, poly) + script + out.slice(poly);
  else {
    const head = out.lastIndexOf("</head>");
    out = head >= 0 ? out.slice(0, head) + script + out.slice(head) : script + out;
  }
  return out;
}

function rewriteShared(s) {
  return s
    .replaceAll("../../_shared/", "_shared/")
    .replaceAll("../_shared/", "_shared/")
    .replaceAll("/_shared/", "_shared/");
}

export function buildWebZip(ws, htmlPath) {
  const dir = path.dirname(htmlPath);
  const html = rewriteShared(ws.read(htmlPath));
  const cssName = ws.list(dir).find((d) => /\.css$/i.test(d.name))?.name;
  const files = [
    { name: "index.html", data: html.replace(/href="book\.css"/, 'href="' + (cssName || "book.css") + '"') },
  ];
  if (cssName) files.push({ name: cssName, data: rewriteShared(ws.read(path.join(dir, cssName))) });
  const statePath = path.join(dir, STATE_FILE);
  if (ws.exists(statePath)) files.push({ name: STATE_FILE, data: ws.read(statePath, null) });
  for (const rel of SHARED) {
    const abs = path.join(APP_ROOT, "_shared", rel);
    if (ws.exists(abs)) files.push({ name: "_shared/" + rel, data: ws.read(abs, null) });
  }
  return makeZip(files);
}

function toXhtmlFragment(html, imgMap, imgPrefix) {
  let s = html
    .replace(/<image-slot\b([^>]*)>(?:\s*<\/image-slot>)?/gi, (m, attrs) => {
      const id = (attrs.match(/\bid="([^"]+)"/i) || [])[1];
      const ph = (attrs.match(/\bplaceholder="([^"]*)"/i) || [])[1] || "";
      if (id && imgMap[id]) return `<img src="${imgPrefix}${imgMap[id]}" alt="${escapeHtml(ph)}"/>`;
      return ph ? `<p class="slot">${escapeHtml(ph)}</p>` : "";
    })
    .replace(/<(meta|link|img|br|hr|source|input)\b([^>]*?)(?<!\/)\s*>/gi, "<$1$2/>")
    .replace(/&(?!#?\w+;)/g, "&amp;");
  return s;
}

function wrapXhtml(title, body, cssHref) {
  return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="ko" xml:lang="ko">
<head>
<meta charset="utf-8"/>
<title>${escapeHtml(title)}</title>
<link rel="stylesheet" type="text/css" href="${cssHref}"/>
</head>
<body>
${body}
</body>
</html>
`;
}

export function buildEpub(ws, htmlPath) {
  const src = ws.read(htmlPath);
  const meta = readMeta(src);
  const st = readStructure(src);
  const dir = path.dirname(htmlPath);
  const state = ws.readJsonFile(path.join(dir, STATE_FILE), {}) || {};
  const { files: images, map } = extractImages(state);
  const cssName = ws.list(dir).find((d) => /\.css$/i.test(d.name))?.name;
  let css = cssName ? stripAtPage(ws.read(path.join(dir, cssName))) : "";
  css = css
    .replace(/url\((['"]?)(?:\.\.\/)+_shared\/fonts\//g, "url($1../fonts/")
    .replace(/url\((['"]?)\/_shared\/fonts\//g, "url($1../fonts/");

  // 표지·속표지·판권은 차례 앞의 section입니다.
  const frontRe = /<section\b[^>]*class="[^"]*(?:cover|titlepage|colophon)[^"]*"[^>]*>[\s\S]*?<\/section>/gi;
  const fronts = [];
  for (const m of src.matchAll(frontRe)) fronts.push(m[0]);

  const items = [];
  const add = (id, title, html, kind) => {
    const file = `text/${id}.xhtml`;
    items.push({ id, title, file, kind, data: wrapXhtml(title || meta.title, toXhtmlFragment(html, map, "../images/"), "../styles/book.css") });
  };
  if (fronts[0]) add("cover", "표지", fronts[0], "cover");
  if (fronts[1]) add("titlepage", "속표지", fronts[1], "text");
  if (fronts[2]) add("colophon", "판권", fronts[2], "text");
  if (st.toc) add("toc", "차례", src.slice(st.toc.start, st.toc.end), "text");
  for (const s of st.sections) {
    add(s.id || `s${items.length}`, s.title || s.kind, src.slice(s.node.start, s.node.end), s.kind === "part" ? "text" : "text");
  }

  const navLis = items.filter((it) => it.id !== "cover").map((it) =>
    `<li><a href="${it.file}">${escapeHtml(it.title || it.id)}</a></li>`).join("\n");
  const nav = wrapXhtml("차례", `<nav epub:type="toc" id="toc"><h1>차례</h1><ol>\n${navLis}\n</ol></nav>`, "../styles/book.css")
    .replace("<body>", '<body epub:type="frontmatter">');

  const manifest = [
    `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
    `<item id="css" href="styles/book.css" media-type="text/css"/>`,
    ...items.map((it) => `<item id="${it.id}" href="${it.file}" media-type="application/xhtml+xml"/>`),
    ...images.map((img, i) => {
      const mime = img.name.endsWith(".png") ? "image/png" : img.name.endsWith(".jpg") || img.name.endsWith(".jpeg") ? "image/jpeg" : img.name.endsWith(".webp") ? "image/webp" : "image/png";
      return `<item id="img${i}" href="images/${img.name}" media-type="${mime}"/>`;
    }),
    `<item id="font-p" href="fonts/PretendardVariable.woff2" media-type="font/woff2"/>`,
  ].join("\n    ");
  const spine = items.map((it) => `<itemref idref="${it.id}"${it.id === "cover" ? ' linear="no"' : ""}/>`).join("\n    ");
  const now = new Date().toISOString().replace(/\.\d+Z$/, "Z");
  const opf = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="3.0" xml:lang="ko">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">urn:uuid:${safeName(meta.title || "book").replace(/\s+/g, "-")}-${Date.now()}</dc:identifier>
    <dc:title>${escapeHtml(meta.title || "제목 없음")}</dc:title>
    <dc:language>ko</dc:language>
    <dc:creator>${escapeHtml(meta.author || "")}</dc:creator>
    ${meta.subject ? `<dc:description>${escapeHtml(meta.subject)}</dc:description>` : ""}
    <meta property="dcterms:modified">${now}</meta>
  </metadata>
  <manifest>
    ${manifest}
  </manifest>
  <spine>
    ${spine}
  </spine>
</package>
`;
  const container = `<?xml version="1.0" encoding="utf-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
`;

  const zipFiles = [
    { name: "mimetype", data: "application/epub+zip", store: true },
    { name: "META-INF/container.xml", data: container },
    { name: "OEBPS/content.opf", data: opf },
    { name: "OEBPS/nav.xhtml", data: nav },
    { name: "OEBPS/styles/book.css", data: css },
    ...items.map((it) => ({ name: "OEBPS/" + it.file, data: it.data })),
    ...images.map((img) => ({ name: "OEBPS/images/" + img.name, data: img.data })),
  ];
  const font = path.join(APP_ROOT, "_shared", "fonts", "PretendardVariable.woff2");
  if (ws.exists(font)) zipFiles.push({ name: "OEBPS/fonts/PretendardVariable.woff2", data: ws.read(font, null) });
  return makeZip(zipFiles);
}

export function pdfQuery({ ids, print, watermark }) {
  const q = new URLSearchParams({ pdf: "1" });
  if (ids && ids.length) q.set("ids", ids.join(","));
  if (print) q.set("print", "1");
  if (watermark) q.set("wm", "1");
  return q.toString();
}

export function expandIds(src, ids) {
  if (!ids?.length) return [];
  const keep = new Set(ids);
  const st = readStructure(src);
  for (const s of st.sections) {
    if (s.kind !== "part") continue;
    const i = st.sections.indexOf(s);
    const kids = [];
    for (const n of st.sections.slice(i + 1)) {
      if (n.kind === "part") break;
      kids.push(n.id);
    }
    if (kids.some((id) => keep.has(id))) keep.add(s.id);
  }
  return [...keep];
}
