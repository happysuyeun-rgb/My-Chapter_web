// 첨부한 원고 파일(TXT·MD·PDF·DOCX)을 책 템플릿의 차례·파트·장 구조 HTML로 바꿉니다.
// 모든 형식을 먼저 "마크다운 비슷한 텍스트"로 바꾼 뒤 같은 규칙으로 구조를 찾습니다.

import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const PDFJS_DIR = path.join(here, "node_modules", "pdfjs-dist");

export const SUPPORTED_EXT = [".txt", ".md", ".markdown", ".pdf", ".docx"];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/__(.+?)__/g, "<strong>$1</strong>");
const plain = (s) => s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/__(.+?)__/g, "$1");
const pad = (n) => String(n).padStart(2, "0");
const ENDS_SENTENCE = /[.?!。…"”’)\]]$|[다요죠까네음함]\.?$/;

// ───────── 파일 → 텍스트 ─────────
function decodeText(buf) {
  if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) return buf.subarray(3).toString("utf8");
  if (buf[0] === 0xff && buf[1] === 0xfe) return new TextDecoder("utf-16le").decode(buf.subarray(2));
  if (buf[0] === 0xfe && buf[1] === 0xff) return new TextDecoder("utf-16be").decode(buf.subarray(2));
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buf);
  } catch {
    return new TextDecoder("euc-kr").decode(buf);
  }
}

async function docxToText(buf) {
  const mammoth = (await import("mammoth")).default;
  const { value } = await mammoth.convertToHtml({ buffer: buf }, { convertImage: mammoth.images.imgElement(() => ({ src: "" })) });
  const strip = (h) =>
    h.replace(/<(strong|b)>([\s\S]*?)<\/\1>/g, "**$2**").replace(/<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&")
      .replace(/\*\*\s*\*\*/g, "").trim();
  const out = [];
  const re = /<(h[1-6]|p|ul|ol|table)\b[^>]*>([\s\S]*?)<\/\1>/g;
  let m;
  while ((m = re.exec(value))) {
    const [, tag, body] = m;
    if (tag[0] === "h") out.push("#".repeat(+tag[1]) + " " + strip(body));
    else if (tag === "p") out.push(strip(body));
    else if (tag === "table") {
      for (const row of body.match(/<tr\b[\s\S]*?<\/tr>/g) || []) {
        const cells = (row.match(/<t[dh]\b[\s\S]*?<\/t[dh]>/g) || []).map(strip).filter(Boolean);
        if (cells.length) out.push(cells.join(" | "));
      }
    } else {
      let n = 0;
      for (const li of body.match(/<li\b[\s\S]*?<\/li>/g) || []) out.push((tag === "ol" ? `${++n}. ` : "- ") + strip(li));
    }
    out.push("");
  }
  return out.join("\n");
}

async function pdfToText(buf) {
  const pdfjs = await import(pathToFileURL(path.join(PDFJS_DIR, "legacy", "build", "pdf.mjs")).href);
  const task = pdfjs.getDocument({
    data: new Uint8Array(buf),
    cMapUrl: pathToFileURL(path.join(PDFJS_DIR, "cmaps")).href + "/",
    cMapPacked: true,
    standardFontDataUrl: pathToFileURL(path.join(PDFJS_DIR, "standard_fonts")).href + "/",
    disableFontFace: true,
    isEvalSupported: false,
    verbosity: 0,
  });
  const doc = await task.promise;

  const pages = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const { items } = await page.getTextContent();
    const parts = items
      .filter((i) => i.str && i.str.trim())
      .map((i) => ({ s: i.str, x: i.transform[4], y: i.transform[5], w: i.width, h: Math.hypot(i.transform[2], i.transform[3]) || i.height || 10 }))
      .sort((a, b) => b.y - a.y || a.x - b.x);
    const lines = [];
    for (const it of parts) {
      const line = lines[lines.length - 1];
      if (line && Math.abs(line.y - it.y) <= Math.max(line.h, it.h) * 0.5) {
        line.items.push(it);
        line.h = Math.max(line.h, it.h);
      } else lines.push({ y: it.y, h: it.h, items: [it] });
    }
    for (const line of lines) {
      line.items.sort((a, b) => a.x - b.x);
      let text = "";
      let prev = null;
      for (const it of line.items) {
        if (prev && it.x - (prev.x + prev.w) > prev.h * 0.15 && !/\s$/.test(text) && !/^\s/.test(it.s)) text += " ";
        text += it.s;
        prev = it;
      }
      line.text = text.replace(/\s+/g, " ").trim()
        .replace(/(?:^|(?<= ))(?:[A-Za-z0-9] ){2,}[A-Za-z0-9](?= |$)/g, (m) => m.replace(/ /g, ""))
        .replace(/(?:^|(?<= ))(?:[가-힣] ){4,}[가-힣](?= |$)/g, (m) => m.replace(/ /g, ""));
      line.x = line.items[0].x;
      line.right = prev.x + prev.w;
      line.size = Math.round(line.h * 2) / 2;
      delete line.items;
    }
    const kept = lines.filter((l) => l.text);
    // 디자인된 PDF는 "PART"와 큰 숫자 "01"을 따로 찍습니다. 한 줄로 합쳐야 파트로 알아봅니다.
    for (let i = kept.length - 2; i >= 0; i--) {
      if (/^(PART|CHAPTER|APPENDIX|파트)$/i.test(kept[i].text) && /^\d{1,3}$/.test(kept[i + 1].text)) {
        kept[i].text += " " + kept[i + 1].text;
        kept.splice(i + 1, 1);
      }
    }
    pages.push(kept);
    page.cleanup();
  }
  await task.destroy();

  // 쪽 번호, 매 쪽 위아래에 반복되는 머리글·바닥글은 본문이 아니므로 뺍니다.
  const edgeKey = (t) => t.replace(/\d+/g, "#");
  const edgeCount = new Map();
  for (const lines of pages) {
    const keys = new Set([...lines.slice(0, 2), ...lines.slice(-2)].map((l) => edgeKey(l.text)));
    for (const k of keys) edgeCount.set(k, (edgeCount.get(k) || 0) + 1);
  }
  for (const [i, lines] of pages.entries()) {
    pages[i] = lines.filter((l) => !/^[-–—\s]*\d{1,4}[-–—\s]*$|^\d+\s*\/\s*\d+$/.test(l.text));
  }

  // 원고에 들어 있던 차례 쪽은 새 책에서 다시 만들어지므로 통째로 뺍니다.
  const isTocTitle = (l) => /^(차례|목차|contents|table of contents)$/i.test(l.text.replace(/\s+/g, " ").trim());
  const mostlyPageRefs = (lines) => lines.length > 2 && lines.filter((l) => /\s\d{1,4}$/.test(l.text)).length >= lines.length * 0.5;
  for (let i = 0; i < pages.length; i++) {
    if (!pages[i].slice(0, 4).some(isTocTitle)) continue;
    pages[i] = [];
    while (i + 1 < pages.length && mostlyPageRefs(pages[i + 1])) pages[++i] = [];
  }

  const all = pages.flat();
  if (!all.length) throw new Error("PDF에서 글자를 찾지 못했습니다. 스캔한 이미지 PDF는 변환할 수 없어요.");

  const weight = new Map();
  const count = new Map();
  for (const l of all) {
    weight.set(l.size, (weight.get(l.size) || 0) + l.text.length);
    count.set(l.size, (count.get(l.size) || 0) + 1);
  }
  const body = [...weight].sort((a, b) => b[1] - a[1])[0][0];

  // 장 제목 머리글은 본문보다 작고 여러 쪽에서 반복됩니다. 크기가 본문 이하일 때만 지웁니다.
  const runningMin = 3;
  for (const [i, lines] of pages.entries()) {
    const edge = new Set([...lines.slice(0, 2), ...lines.slice(-2)]);
    pages[i] = lines.filter((l) => !(edge.has(l) && l.size <= body && edgeCount.get(edgeKey(l.text)) >= runningMin && !isLabel(l.text)));
  }

  // 표지처럼 한두 번만 나오는 큰 글자에 휘둘리지 않도록, 3번 이상 쓰인 제목 크기로 단계를 정합니다.
  const frequent = [...count].filter(([s, n]) => s >= body * 1.15 && n >= 3).map(([s]) => s);
  const levelOf = (l) => {
    if (l.size < body * 1.15 || l.text.length > 80 || /[.?!。"”]$/.test(l.text)) return 0;
    return Math.min(3, 1 + frequent.filter((s) => s > l.size).length);
  };

  const gaps = [];
  for (const lines of pages)
    for (let i = 1; i < lines.length; i++)
      if (lines[i].size === body && lines[i - 1].size === body) gaps.push(lines[i - 1].y - lines[i].y);
  gaps.sort((a, b) => a - b);
  const lineGap = gaps[Math.floor(gaps.length / 2)] || body * 1.5;

  const out = [];
  let para = [];
  let heading = null;
  const flushPara = () => { if (para.length) out.push(para.join(" ").replace(/(\w)- (\w)/g, "$1$2"), ""); para = []; };
  const flushHeading = () => { if (heading) out.push("#".repeat(heading.level) + " " + heading.text, ""); heading = null; };
  const LIST = /^([-*•·▪◦‣●○■□‒–]|\d{1,3}[.)])\s+/;

  for (const lines of pages) {
    const bodyLines = lines.filter((l) => l.size === body);
    const left = Math.min(...bodyLines.map((l) => l.x), Infinity);
    const right = Math.max(...bodyLines.map((l) => l.right), -Infinity);
    lines.forEach((l, i) => {
      const level = levelOf(l);
      if (level) {
        flushPara();
        if (heading && heading.level === level && i > 0 && lines[i - 1].y - l.y < l.h * 1.8) heading.text += " " + l.text;
        else { flushHeading(); heading = { level, text: l.text }; }
        return;
      }
      flushHeading();
      const prev = i > 0 ? lines[i - 1] : null;
      if (isLabel(l.text)) { flushPara(); out.push(l.text, ""); return; }
      const startsNew =
        !para.length ||
        LIST.test(l.text) ||
        (prev ? prev.size !== l.size : l.size !== body) ||
        (prev && prev.y - l.y > lineGap * 1.45) ||
        (isFinite(left) && l.x - left > body * 0.8 && (!prev || prev.x - left < body * 0.5)) ||
        (prev && isFinite(right) && right - prev.right > body * 3 && ENDS_SENTENCE.test(prev.text)) ||
        (!prev && ENDS_SENTENCE.test(para[para.length - 1] || ""));
      if (startsNew) flushPara();
      para.push(l.text);
    });
  }
  flushPara();
  flushHeading();
  return out.join("\n");
}

// ───────── 텍스트 → 블록 ─────────
const SEP = "[\\s.:·\\-–—]";
const PART = new RegExp(`^(?:제\\s*(\\d+)\\s*부|PART\\s*(\\d+)|파트\\s*(\\d+))(?=$|${SEP})${SEP}*(.*)$`, "i");
const CHAPTER = new RegExp(`^(?:제\\s*(\\d+)\\s*장|(\\d+)\\s*장|CHAPTER\\s*(\\d+))(?=$|${SEP})${SEP}*(.*)$`, "i");
const APPENDIX = new RegExp(`^(?:부록|APPENDIX)\\s*([A-Z]|\\d+)?(?=$|${SEP})${SEP}*(.*)$`, "i");
const PRO = /^(프롤로그|들어가며|들어가는\s*글|머리말|서문|시작하며|여는\s*글|prologue|preface)(?:\s*[.:·\-–—]\s*(.+))?$/i;
const EPI = /^(에필로그|나오며|나가며|마치며|맺음말|맺으며|닫는\s*글|후기|epilogue)(?:\s*[.:·\-–—]\s*(.+))?$/i;
const BULLET = /^[-*+•·▪◦‣●○■□‒–]\s+(.+)$/;
const isLabel = (t) => t.length <= 60 && [PART, CHAPTER, APPENDIX, PRO, EPI].some((re) => re.test(t));

function headingOf(line) {
  const md = line.match(/^(#{1,6})\s+(.+?)\s*#*$/);
  let level = md ? md[1].length : 0;
  const text = md ? md[2].trim() : line;
  const t = plain(text);
  if (t.length <= 60 && (md || !/[.?!。]$/.test(t))) {
    const src = level || 1;
    const num = (m) => m.slice(1, 4).find((x) => x !== undefined);
    let m;
    if ((m = t.match(PART))) return { t: "h", level: 1, src, kind: "part", text: m[4] || t, bare: !m[4] };
    if ((m = t.match(CHAPTER))) return { t: "h", level: 1, src, kind: "chapter", num: +num(m), text: m[4] || t, raw: t, bare: !m[4] };
    if ((m = t.match(APPENDIX))) return { t: "h", level: 1, src, kind: "ap", text: m[2] || t, bare: !m[2] };
    // 영문 "PROLOGUE" 라벨만 있는 줄은 디자인된 PDF에서 바로 다음 제목과 한 묶음입니다.
    if ((m = t.match(PRO))) return { t: "h", level: 1, src, kind: "pro", text: m[2] || m[1], bare: !m[2] && /^[a-z]+$/i.test(m[1]), soft: true };
    if ((m = t.match(EPI))) return { t: "h", level: 1, src, kind: "epi", text: m[2] || m[1], bare: !m[2] && /^[a-z]+$/i.test(m[1]), soft: true };
    if (!md && /^\d+\.\d+\.\d+\.?\s+\S/.test(t)) level = 3;
    else if (!md && /^\d+\.\d+\.?\s+\S/.test(t)) level = 2;
    else if (!md && t.length <= 50 && /^[■◆◼▶]\s*\S/.test(t)) return { t: "h", level: 2, text: t.replace(/^[■◆◼▶]\s*/, "") };
  }
  return level ? { t: "h", level, text } : null;
}

function parseText(text) {
  const lines = text.replace(/\r\n?/g, "\n").replace(/\u00a0/g, " ").split("\n");
  const filled = lines.filter((l) => l.trim()).length;
  const linePerPara = lines.length - filled < filled * 0.1;
  const blocks = [];
  let para = [];
  let list = null;
  let fence = false;
  const flushPara = () => { if (para.length) blocks.push({ t: "p", text: para.join(" ") }); para = []; };
  const flushList = () => { if (list) blocks.push(list); list = null; };

  for (const raw of lines) {
    const line = raw.trim();
    if (/^```/.test(line)) { flushPara(); flushList(); fence = !fence; continue; }
    if (!line) { flushPara(); continue; }
    if (/^([-*_=])\1{2,}$/.test(line)) { flushPara(); flushList(); continue; }
    if (fence) { blocks.push({ t: "p", text: line }); continue; }
    const h = headingOf(line);
    if (h) {
      flushPara(); flushList();
      // "CHAPTER 01" 다음 줄에 장 제목이 따로 오는 경우 한 제목으로 합칩니다.
      const prev = blocks[blocks.length - 1];
      if (prev && prev.bare && (!h.kind || h.kind === prev.kind)) Object.assign(prev, { text: h.text, raw: h.text, bare: false });
      else blocks.push(h);
      continue;
    }
    const ul = line.match(BULLET);
    const ol = line.match(/^\d{1,3}[.)]\s+(.+)$/);
    if (ul || ol) {
      flushPara();
      const t = ul ? "ul" : "ol";
      if (!list || list.t !== t) { flushList(); list = { t, items: [] }; }
      list.items.push((ul || ol)[1]);
      continue;
    }
    flushList();
    const prev = blocks[blocks.length - 1];
    if (prev && prev.bare && !prev.soft && !para.length && line.length <= 60 && !ENDS_SENTENCE.test(line)) {
      Object.assign(prev, { text: line, raw: line, bare: false });
      continue;
    }
    if (line.startsWith(">")) { flushPara(); blocks.push({ t: "p", text: line.replace(/^>\s*/, "") }); continue; }
    if (linePerPara) { blocks.push({ t: "p", text: line }); continue; }
    para.push(line);
  }
  flushPara();
  flushList();
  return blocks;
}

// ───────── 블록 → 책 구조 ─────────
const SECTION_KINDS = new Set(["chapter", "ap", "pro", "epi"]);

function structure(blocks, title, { dropLead }) {
  const norm = (s) => plain(s).replace(/\s+/g, "").toLowerCase();
  const first = blocks.findIndex((b) => b.t === "h");
  if (first >= 0 && !blocks[first].kind && norm(blocks[first].text) === norm(title)) blocks.splice(first, 1);

  // 원고 안의 차례는 새 책에서 자동으로 다시 만들어지므로 뺍니다.
  const toc = blocks.findIndex((b) => b.t === "h" && !b.kind && /^(차례|목차|contents|table of contents)$/i.test(plain(b.text).trim()));
  if (toc >= 0) {
    let end = toc + 1;
    while (end < blocks.length && blocks[end].t !== "h") end++;
    blocks.splice(toc, end - toc);
  }

  if (dropLead) {
    const start = blocks.findIndex((b) => b.kind);
    if (start > 0) blocks.splice(0, start);
  }

  // "0장 완료 체크"처럼 지금 장 번호를 다시 쓰는 제목은 새 장이 아니라 그 장의 소제목입니다.
  let lastNum = null;
  for (const b of blocks) {
    if (b.kind !== "chapter") continue;
    if (b.num === lastNum) Object.assign(b, { kind: undefined, level: Math.max(2, b.src), text: b.raw });
    else lastNum = b.num;
  }

  const free = blocks.filter((b) => b.t === "h" && !b.kind);
  const marked = blocks.filter((b) => SECTION_KINDS.has(b.kind));
  if (marked.length) {
    const chapterLevel = Math.min(...marked.map((b) => b.src));
    for (const b of free) b.level = b.level === 1 || b.level < chapterLevel ? 1 : Math.max(2, b.level);
  } else if (free.length) {
    const shift = Math.min(...free.map((b) => b.level)) - 1;
    for (const b of free) b.level -= shift;
  }

  const units = [];
  const lead = [];
  let cur = null;
  for (const b of blocks) {
    if (b.t === "h" && b.level === 1) {
      // 첫 장 앞의 짧은 한두 줄은 대개 원고 맨 위에 적은 책 제목·저자라서 "들어가며"로 만들지 않습니다.
      const meaningful = (x) => x.t !== "h" && (x.t !== "p" || (norm(x.text) !== norm(title) && (x.text.length > 40 || ENDS_SENTENCE.test(x.text))));
      if (!cur && !dropLead && lead.some(meaningful))
        units.push({ kind: "pro", title: "들어가며", body: lead });
      cur = { kind: b.kind || "chapter", num: b.num, title: plain(b.text), body: [] };
      units.push(cur);
    } else if (!cur) lead.push(b);
    else if (cur.kind === "part") (cur.pending ||= []).push(b);
    else cur.body.push(b);
  }
  if (!cur) units.push({ kind: "chapter", title: "본문", body: lead });

  // 파트 페이지에는 본문 자리가 없으므로, 파트 소개 글은 바로 다음 장 앞에 둡니다.
  for (let i = 0; i < units.length; i++) {
    const u = units[i];
    if (u.kind !== "part" || !u.pending) continue;
    u.pending = u.pending.filter((b) => !(b.t === "p" && b.text.length <= 80 && /^\d{1,3}\s+\S/.test(b.text)));
    if (!u.pending.length) continue;
    const next = units[i + 1];
    if (next && next.kind !== "part") next.body.unshift(...u.pending);
    else units.splice(i + 1, 0, { kind: "chapter", title: u.title, body: u.pending });
  }

  for (const u of units) {
    const hs = u.body.filter((b) => b.t === "h");
    const shift = Math.min(...hs.map((b) => b.level), 2) - 2;
    for (const b of hs) b.level = Math.min(3, b.level - shift);
  }
  return units;
}

function bodyHtml(body) {
  return body.map((b) => {
    if (b.t === "p") return `<p>${inline(b.text)}</p>`;
    if (b.t === "h") return `<h${b.level}>${inline(b.text)}</h${b.level}>`;
    return `<${b.t}>${b.items.map((i) => `<li>${inline(i)}</li>`).join("")}</${b.t}>`;
  }).join("\n");
}

function renderBook(units) {
  let last = 0, ap = 0;
  for (const u of units) {
    if (u.kind === "chapter") u.no = last = Number.isFinite(u.num) && u.num >= last ? u.num : last + 1;
    if (u.kind === "ap") u.no = ++ap;
  }

  let sec = 0, part = 0;
  const toc = [];
  const html = [];
  for (const [i, u] of units.entries()) {
    const t = esc(u.title);
    if (u.kind === "part") {
      part++;
      const chapters = [];
      for (const v of units.slice(i + 1)) {
        if (v.kind === "part" || v.kind === "ap" || v.kind === "epi") break;
        if (v.kind === "chapter") chapters.push(`<li><span class="pl-no">${pad(v.no)}</span>${esc(v.title)}</li>`);
      }
      toc.push(`<li class="toc-part"><a href="#part${part}"><span class="tp-no">PART ${part}</span><span class="tp-t">${t}</span></a></li>`);
      html.push(`<section class="part" id="part${part}"><div class="part-inner">\n  <div class="part-label">PART</div>\n  <div class="part-num">${pad(part)}</div>\n  <h1 class="part-title">${t}</h1>\n  <ol class="part-list">\n    ${chapters.join("\n    ")}\n  </ol>\n</div></section>`);
      continue;
    }
    const id = `c${pad(++sec)}`;
    let tocNo, opener;
    if (u.kind === "pro" || u.kind === "epi") {
      tocNo = u.kind === "pro" ? "P" : "E";
      opener = `<div class="op-label">${u.kind === "pro" ? "PROLOGUE" : "EPILOGUE"}</div><h1>${t}</h1>`;
    } else if (u.kind === "ap") {
      tocNo = "A" + u.no;
      opener = `<div class="op-label">APPENDIX ${pad(u.no)}</div><div class="op-num">${pad(u.no)}</div><h1>${t}</h1>`;
    } else {
      tocNo = pad(u.no);
      opener = `<div class="op-label">CHAPTER ${tocNo}</div><div class="op-num">${tocNo}</div><h1>${t}</h1>`;
    }
    const cls = u.kind === "chapter" ? "ch" : u.kind;
    toc.push(`<li class="toc-ch toc-${cls}"><a href="#${id}"><span class="tc-no">${tocNo}</span><span class="tc-t">${t}</span></a></li>`);
    html.push(`<section class="chapter chapter-${cls}" id="${id}"><header class="opener">${opener}</header>\n${bodyHtml(u.body)}\n</section>`);
  }
  return {
    html: `<section class="toc" id="toc"><div class="toc-label">CONTENTS</div><h1 class="toc-title">차례</h1><ol>\n${toc.join("\n")}\n</ol></section>\n\n${html.join("\n\n")}\n`,
    stats: { parts: part, chapters: units.filter((u) => u.kind === "chapter").length, appendices: ap, sections: sec },
  };
}

const UNIT_KINDS = new Set(["part", "chapter", "ap", "pro", "epi"]);

function sanitizeBlock(block) {
  if (!block || typeof block !== "object") return null;
  if (block.t === "p") return { t: "p", text: String(block.text || "") };
  if (block.t === "h") {
    const level = Number(block.level);
    return { t: "h", level: level >= 2 && level <= 6 ? level : 2, text: String(block.text || "") };
  }
  if (block.t === "ul" || block.t === "ol") {
    const items = Array.isArray(block.items) ? block.items.map((item) => String(item ?? "")) : [];
    return { t: block.t, items };
  }
  return null;
}

function sanitizeUnit(raw) {
  if (!raw || typeof raw !== "object") return null;
  const kind = UNIT_KINDS.has(raw.kind) ? raw.kind : "chapter";
  const unit = {
    kind,
    title: String(raw.title || "").trim(),
    body: Array.isArray(raw.body) ? raw.body.map(sanitizeBlock).filter(Boolean) : [],
  };
  if (kind === "chapter" && Number.isFinite(Number(raw.num))) unit.num = Number(raw.num);
  return unit;
}

// S07에서 고친 구조를 다시 파싱하지 않고 같은 renderer로 book.html fragment를 만듭니다.
export function renderUnits(rawUnits) {
  if (!Array.isArray(rawUnits) || !rawUnits.length) {
    throw Object.assign(new Error("책으로 만들 구조를 찾지 못했습니다."), { status: 400 });
  }
  const units = rawUnits.map(sanitizeUnit).filter(Boolean);
  if (!units.length) {
    throw Object.assign(new Error("책으로 만들 구조를 찾지 못했습니다."), { status: 400 });
  }
  if (!units.some((unit) => unit.kind !== "part")) {
    throw Object.assign(new Error("책에는 최소 한 개의 본문 단위가 필요해요."), { status: 400 });
  }
  if (units.some((unit) => !unit.title)) {
    throw Object.assign(new Error("제목은 비워 둘 수 없어요."), { status: 400 });
  }
  return renderBook(units);
}

export async function manuscriptText({ name, data }) {
  const ext = path.extname(name || "").toLowerCase();
  if (ext === ".pdf") return pdfToText(data);
  if (ext === ".docx") return docxToText(data);
  if (ext === ".txt" || ext === ".md" || ext === ".markdown") return decodeText(data);
  throw new Error("TXT, MD, PDF, DOCX 파일만 넣을 수 있어요.");
}

export async function parseManuscript(file, title = "") {
  const blocks = parseText(await manuscriptText(file));
  if (!blocks.some((b) => b.t !== "h")) throw new Error("파일에서 본문 글을 찾지 못했습니다.");
  // PDF의 첫 장 앞부분은 대개 표지·판권 페이지라 본문으로 옮기지 않습니다.
  const isPdf = path.extname(file.name || "").toLowerCase() === ".pdf";
  const dropLead = isPdf && blocks.some((b) => SECTION_KINDS.has(b.kind));
  const units = structure(blocks, title, { dropLead });
  const out = renderBook(units);
  out.stats.paragraphs = blocks.filter((b) => b.t === "p").length;
  return { units, html: out.html, stats: out.stats };
}

export async function importManuscript(file, title) {
  const { html, stats } = await parseManuscript(file, title);
  return { html, stats };
}
