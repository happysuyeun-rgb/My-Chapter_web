// 차례(section.toc)·파트 목록(ol.part-list)·장 번호를 본문 구조와 맞춥니다.
//  - syncTocTitles: 장/파트 제목을 고치면 차례와 파트 목록의 같은 제목도 고칩니다.
//  - structureOp: 새 장·부록·파트 추가, 장·파트 지우기 (번호는 다시 매깁니다).
// 내용이 이미 같은 곳은 손대지 않으므로, 구조가 바뀌지 않은 책은 한 글자도 바뀌지 않습니다.

import { parse, attr, classes, closest, find, findAll, text, inner, applyEdits } from "./htmltree.mjs";
import { scanEditable } from "./editable.mjs";
import { escapeHtml, pad2, stripTags } from "./util.mjs";

const fail = (msg, status = 400) => Object.assign(new Error(msg), { status });
const hasClass = (n, c) => classes(n).includes(c);

function kindOf(node) {
  const c = classes(node);
  if (c.includes("part")) return "part";
  if (!c.includes("chapter")) return null;
  if (c.includes("chapter-pro")) return "pro";
  if (c.includes("chapter-epi")) return "epi";
  if (c.includes("chapter-ap")) return "ap";
  return "ch";
}

export function readStructure(src) {
  const tree = parse(src);
  const tops = findAll(tree, (n) => n.tag === "section").filter((n) => !closest(n.parent, (p) => p.tag === "section"));
  const sections = tops.filter((n) => kindOf(n)).map((node) => {
    const kind = kindOf(node);
    const h1 = kind === "part" ? find(node, (n) => n.tag === "h1") : find(node, (n) => n.tag === "h1" && closest(n, (p) => p.tag === "header" || hasClass(p, "opener")));
    return {
      node, kind, id: attr(node, "id") || "",
      h1, title: h1 ? text(src, h1) : "",
      label: find(node, (n) => hasClass(n, "op-label")),
      num: find(node, (n) => hasClass(n, "op-num") || hasClass(n, "part-num")),
      list: kind === "part" ? find(node, (n) => n.tag === "ol" && hasClass(n, "part-list")) : null,
    };
  });
  const toc = tops.find((n) => hasClass(n, "toc")) || null;
  const ol = toc ? find(toc, (n) => n.tag === "ol") : null;
  const entries = ol ? ol.children.filter((n) => n.tag === "li").map((li) => {
    const a = find(li, (n) => n.tag === "a");
    const href = a ? attr(a, "href") || "" : "";
    return {
      li, id: href.startsWith("#") ? href.slice(1) : "",
      no: find(li, (n) => hasClass(n, "tc-no") || hasClass(n, "tp-no")),
      t: find(li, (n) => hasClass(n, "tc-t") || hasClass(n, "tp-t")),
    };
  }) : [];
  return { tree, sections, toc, ol, entries };
}

const plItems = (src, list) => list.children.filter((n) => n.tag === "li").map((li) => {
  const no = find(li, (n) => hasClass(n, "pl-no"));
  return { li, no, n: no ? parseInt(text(src, no), 10) : NaN, rest: no ? src.slice(no.end, li.innerEnd) : inner(src, li) };
});

// ───────── 제목 동기화 ─────────
export function syncTocTitles(before, after) {
  const old = new Map(readStructure(before).sections.map((s) => [s.id, s.title]));
  const st = readStructure(after);
  const edits = [];
  const replaceTitle = (node, oldTitle, newTitle, startAt = node.innerStart) => {
    const cur = stripTags(after.slice(startAt, node.innerEnd));
    const next = cur.startsWith(oldTitle) ? newTitle + cur.slice(oldTitle.length) : newTitle;
    if (next !== cur) edits.push({ start: startAt, end: node.innerEnd, text: escapeHtml(next) });
  };
  for (const s of st.sections) {
    const was = old.get(s.id);
    if (!s.id || was === undefined || was === s.title || !s.title) continue;
    const e = st.entries.find((x) => x.id === s.id);
    if (e && e.t) replaceTitle(e.t, was, s.title);
    if (s.kind === "ch") {
      for (const p of st.sections.filter((x) => x.list)) {
        for (const it of plItems(after, p.list)) {
          if (stripTags(it.rest).startsWith(was)) replaceTitle(it.li, was, s.title, it.no ? it.no.end : it.li.innerStart);
        }
      }
    }
  }
  return edits.length ? applyEdits(after, edits) : after;
}

// ───────── 번호 다시 매기기 ─────────
// ctx는 바꾸기 전 책에서 읽습니다: 첫 장 번호(00으로 시작하는 책도 있음)와 파트 목록 문구.
export function numberingContext(src) {
  const st = readStructure(src);
  const firstCh = st.sections.find((s) => s.kind === "ch" && s.num);
  const chStart = firstCh ? parseInt(text(src, firstCh.num), 10) || 0 : 1;
  const idByNum = new Map(st.sections.filter((s) => s.kind === "ch" && s.num).map((s) => [parseInt(text(src, s.num), 10), s.id]));
  const listText = new Map();
  for (const p of st.sections.filter((s) => s.list)) {
    for (const it of plItems(src, p.list)) if (idByNum.has(it.n)) listText.set(idByNum.get(it.n), it.rest);
  }
  return { chStart: Number.isFinite(chStart) ? chStart : 1, listText };
}

export function renumber(src, ctx) {
  const st = readStructure(src);
  const edits = [];
  const set = (node, value) => {
    if (node && inner(src, node) !== value) edits.push({ start: node.innerStart, end: node.innerEnd, text: value });
  };
  const counters = { ch: ctx.chStart, ap: 1, part: 1 };
  const numbers = new Map();
  for (const s of st.sections) {
    if (!["ch", "ap", "part"].includes(s.kind)) continue;
    const n = counters[s.kind]++;
    numbers.set(s.id, n);
    set(s.num, pad2(n));
    if (s.kind === "ch") set(s.label, `CHAPTER ${pad2(n)}`);
    if (s.kind === "ap") set(s.label, `APPENDIX ${pad2(n)}`);
  }
  for (const e of st.entries) {
    const s = st.sections.find((x) => x.id === e.id);
    if (!s || !numbers.has(s.id)) continue;
    const n = numbers.get(s.id);
    set(e.no, s.kind === "part" ? `PART ${n}` : s.kind === "ap" ? `A${n}` : pad2(n));
  }
  st.sections.forEach((p, i) => {
    if (!p.list) return;
    const items = [];
    for (const s of st.sections.slice(i + 1)) {
      if (s.kind === "part") break;
      if (s.kind !== "ch") continue;
      const rest = ctx.listText.get(s.id) ?? escapeHtml(s.title);
      items.push(`<li><span class="pl-no">${pad2(numbers.get(s.id))}</span>${rest}</li>`);
    }
    const old = plItems(src, p.list);
    const same = old.length === items.length && old.every((it, k) => src.slice(it.li.start, it.li.end) === items[k]);
    if (!same) edits.push({ start: p.list.innerStart, end: p.list.innerEnd, text: items.join("") });
  });
  return edits.length ? applyEdits(src, edits) : src;
}

// ───────── 장·파트 추가/삭제 ─────────
const NEW = {
  ch: (id) => `<section class="chapter chapter-ch" id="${id}"><header class="opener"><div class="op-label">CHAPTER 00</div><div class="op-num">00</div><h1>새 장 제목</h1></header>\n<p>여기에 내용을 쓰세요.</p>\n</section>`,
  ap: (id) => `<section class="chapter chapter-ap" id="${id}"><header class="opener"><div class="op-label">APPENDIX 00</div><div class="op-num">00</div><h1>새 부록 제목</h1></header>\n<p>여기에 내용을 쓰세요.</p>\n</section>`,
  part: (id) => `<section class="part" id="${id}"><div class="part-inner"><div class="part-label">PART</div><div class="part-num">00</div><h1 class="part-title">새 파트 제목</h1><ol class="part-list"></ol></div></section>`,
};
const NEW_TOC = {
  ch: (id) => `<li class="toc-ch toc-ch"><a href="#${id}"><span class="tc-no">00</span><span class="tc-t">새 장 제목</span></a></li>`,
  ap: (id) => `<li class="toc-ch toc-ap"><a href="#${id}"><span class="tc-no">A0</span><span class="tc-t">새 부록 제목</span></a></li>`,
  part: (id) => `<li class="toc-part"><a href="#${id}"><span class="tp-no">PART 0</span><span class="tp-t">새 파트 제목</span></a></li>`,
};

function sectionForEid(src, st, eid) {
  const b = scanEditable(src)[eid];
  if (!b) throw fail("블록을 원본에서 찾지 못했습니다. 새로고침한 뒤 다시 해 주세요.", 409);
  const inSec = st.sections.find((s) => s.node.start <= b.openStart && b.openStart < s.node.end);
  if (inSec) return inSec;
  const e = st.entries.find((x) => x.li.start <= b.openStart && b.openStart < x.li.end);
  const viaToc = e && st.sections.find((s) => s.id === e.id);
  if (viaToc) return viaToc;
  throw fail("장이나 파트, 차례 항목 안에서만 쓸 수 있어요.");
}

const eidAt = (src, pos) => {
  const i = scanEditable(src).findIndex((b) => b.openStart >= pos);
  return i < 0 ? null : i;
};

function newId(st, prefix) {
  const re = new RegExp(`^${prefix}(\\d+)$`);
  const max = Math.max(0, ...st.sections.map((s) => (s.id.match(re) || [])[1]).filter(Boolean).map(Number));
  return prefix + pad2(max + 1);
}

export function structureOp(src, { op, eid }) {
  const ctx = numberingContext(src);
  const st = readStructure(src);
  const ref = sectionForEid(src, st, Number(eid));
  const idx = st.sections.indexOf(ref);

  if (op === "add-chapter" || op === "add-appendix" || op === "add-part") {
    const kind = op === "add-part" ? "part" : op === "add-appendix" ? "ap" : "ch";
    // 에필로그 뒤에 새 장을 붙이면 어색하므로 에필로그 앞에 넣습니다.
    let after = ref;
    if (ref.kind === "epi" && idx > 0) after = st.sections[idx - 1];
    const id = newId(st, kind === "part" ? "part" : "c");
    const at = after.node.end;
    const edits = [{ start: at, end: at, text: "\n\n" + NEW[kind](id) }];
    if (st.ol) {
      const prevEntries = st.sections.slice(0, st.sections.indexOf(after) + 1).reverse().map((s) => st.entries.find((e) => e.id === s.id)).filter(Boolean);
      const pos = prevEntries.length ? prevEntries[0].li.end : st.ol.innerStart;
      edits.push({ start: pos, end: pos, text: NEW_TOC[kind](id) });
    }
    let html = applyEdits(src, edits);
    html = renumber(html, ctx);
    const sec = readStructure(html).sections.find((s) => s.id === id);
    return { html, anchor: eidAt(html, sec.h1.start), select: true };
  }

  if (op === "delete-section") {
    const chapters = st.sections.filter((s) => s.kind !== "part");
    if (ref.kind !== "part" && chapters.length <= 1) throw fail("마지막 남은 장은 지울 수 없어요.");
    let start = ref.node.start;
    while (start > 0 && /\s/.test(src[start - 1])) start--;
    const edits = [{ start, end: ref.node.end, text: "" }];
    const e = st.entries.find((x) => x.id === ref.id);
    if (e) edits.push({ start: e.li.start, end: e.li.end, text: "" });
    let html = applyEdits(src, edits);
    html = renumber(html, ctx);
    const prev = st.sections[idx - 1];
    const prevNow = prev && readStructure(html).sections.find((s) => s.id === prev.id);
    return { html, anchor: prevNow && prevNow.h1 ? eidAt(html, prevNow.h1.start) : null };
  }

  throw fail("알 수 없는 작업입니다.");
}

export function outlineOf(src) {
  const st = readStructure(src);
  return st.sections.map((s) => ({ id: s.id, kind: s.kind, title: s.title }));
}
