// 책 HTML을 위치 정보가 붙은 가벼운 트리로 읽습니다. 원본 문자열을 그대로 두고
// 위치(start/end)로 잘라 붙이기 때문에, 고치지 않은 부분은 한 글자도 바뀌지 않습니다.

import { stripTags } from "./util.mjs";

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const RAW = new Set(["script", "style", "template", "textarea", "title"]);
const TAG_RE = /<!--[\s\S]*?-->|<![^>]*>|<(\/?)([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;

export function parse(src) {
  const lower = src.toLowerCase();
  const root = { tag: "#root", start: 0, innerStart: 0, innerEnd: src.length, end: src.length, children: [], parent: null, attrsRaw: "" };
  let cur = root;
  TAG_RE.lastIndex = 0;
  for (let m; (m = TAG_RE.exec(src)); ) {
    if (!m[2]) continue;
    const tag = m[2].toLowerCase();
    if (m[1]) {
      let n = cur;
      while (n !== root && n.tag !== tag) n = n.parent;
      if (n === root) continue;
      for (let c = cur; c !== n; c = c.parent) c.innerEnd = c.end = m.index;
      n.innerEnd = m.index;
      n.end = m.index + m[0].length;
      cur = n.parent;
      continue;
    }
    const node = { tag, start: m.index, innerStart: m.index + m[0].length, attrsRaw: m[3] || "", parent: cur, children: [] };
    cur.children.push(node);
    if (VOID.has(tag) || /\/\s*$/.test(node.attrsRaw)) {
      node.innerEnd = node.end = node.innerStart;
    } else if (RAW.has(tag)) {
      const close = lower.indexOf(`</${tag}`, node.innerStart);
      node.innerEnd = close < 0 ? src.length : close;
      node.end = close < 0 ? src.length : src.indexOf(">", close) + 1;
      TAG_RE.lastIndex = node.end;
    } else {
      cur = node;
    }
  }
  for (let c = cur; c !== root; c = c.parent) c.innerEnd = c.end = src.length;
  return root;
}

export function attr(node, name) {
  const m = node.attrsRaw.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return m ? m[1] ?? m[2] ?? m[3] : null;
}
export const classes = (node) => (attr(node, "class") || "").split(/\s+/).filter(Boolean);
export const hasClass = (node, c) => classes(node).includes(c);

export function walk(node, fn) {
  for (const c of node.children) {
    if (fn(c) === false) continue;
    walk(c, fn);
  }
}
export function findAll(node, pred) {
  const out = [];
  walk(node, (n) => { if (pred(n)) out.push(n); });
  return out;
}
export const find = (node, pred) => findAll(node, pred)[0] || null;
export function closest(node, pred) {
  for (let n = node; n && n.tag !== "#root"; n = n.parent) if (pred(n)) return n;
  return null;
}
export const inner = (src, node) => src.slice(node.innerStart, node.innerEnd);
export const outer = (src, node) => src.slice(node.start, node.end);
export const text = (src, node) => stripTags(inner(src, node));

// 위치 기반 수정 목록을 뒤에서부터 적용합니다. 겹치는 수정은 넣지 않아야 합니다.
export function applyEdits(src, edits) {
  let out = src;
  for (const e of [...edits].sort((a, b) => b.start - a.start || b.end - a.end)) {
    out = out.slice(0, e.start) + e.text + out.slice(e.end);
  }
  return out;
}

export function sections(src, tree = parse(src)) {
  return findAll(tree, (n) => n.tag === "section").filter((n) => !closest(n.parent, (p) => p.tag === "section"));
}

// 장·파트 섹션의 종류와 제목을 읽습니다.
export function sectionInfo(src, node) {
  const cls = classes(node);
  const id = attr(node, "id") || "";
  let kind = cls.includes("part") ? "part"
    : cls.includes("chapter-pro") ? "pro"
    : cls.includes("chapter-epi") ? "epi"
    : cls.includes("chapter-ap") ? "ap"
    : cls.includes("chapter") ? "ch"
    : cls.includes("toc") ? "toc"
    : cls[0] || "other";
  const h1 = find(node, (n) => n.tag === "h1");
  return { node, id, kind, title: h1 ? text(src, h1) : "", h1 };
}
