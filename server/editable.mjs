// 미리보기 편집기가 고칠 수 있는 글 블록. 원본 순서대로 data-eid 번호를 붙이고,
// 저장할 때 같은 번호로 원본의 같은 요소를 다시 찾습니다.

import crypto from "node:crypto";
import { stripTags } from "./util.mjs";

export const EDITABLE_TAGS = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "figcaption", "td", "th", "dt", "dd"];
const OPEN_RE = new RegExp(`<(${EDITABLE_TAGS.join("|")})(?=[\\s>])[^>]*>`, "gi");
const UNSAFE_RE = /<[^>]+\son\w+\s*=|<[^>]+(?:href|src)\s*=\s*["']?\s*(?:javascript|data|vbscript):/i;
export const BLOCK_IN_CONTENT_RE = new RegExp(`<(${EDITABLE_TAGS.join("|")}|div|section|ul|ol|table|script|style|iframe|object)(?=[\\s>/])`, "i");

function skipRanges(src) {
  const ranges = [];
  for (const m of src.matchAll(/<(script|style|template)\b[\s\S]*?<\/\1>/gi)) ranges.push([m.index, m.index + m[0].length]);
  return ranges;
}

export function scanEditable(src) {
  const skips = skipRanges(src);
  const inSkip = (i) => skips.some(([a, b]) => i >= a && i < b);
  const blocks = [];
  for (const m of src.matchAll(OPEN_RE)) {
    if (inSkip(m.index)) continue;
    const tag = m[1].toLowerCase();
    const openEnd = m.index + m[0].length;
    const tagRe = new RegExp(`<(/?)${tag}(?=[\\s>])[^>]*>`, "gi");
    tagRe.lastIndex = openEnd;
    let depth = 1;
    let closeStart = -1;
    for (let t; (t = tagRe.exec(src)); ) {
      depth += t[1] ? -1 : 1;
      if (depth === 0) { closeStart = t.index; break; }
    }
    if (closeStart < 0) continue;
    blocks.push({ tag, openStart: m.index, openEnd, closeStart });
  }
  return blocks;
}

export const versionOf = (src) => crypto.createHash("sha1").update(src).digest("hex");

export function withEditIds(src) {
  const blocks = scanEditable(src);
  let out = "";
  let pos = 0;
  blocks.forEach((b, i) => {
    const insertAt = b.openEnd - 1;
    out += src.slice(pos, insertAt) + ` data-eid="${i}" data-etag="${b.tag}"`;
    pos = insertAt;
  });
  return out + src.slice(pos);
}

// 바깥쪽 블록만(안에 다른 편집 블록이 없는 것) 글자로 뽑습니다. 비교·점검에 씁니다.
export function blockTexts(src, blocks = scanEditable(src)) {
  return blocks
    .map((b, eid) => ({ eid, tag: b.tag, start: b.openStart, html: src.slice(b.openEnd, b.closeStart) }))
    .filter((b) => !new RegExp(`<(${EDITABLE_TAGS.join("|")})(?=[\\s>])`, "i").test(b.html))
    .map((b) => ({ eid: b.eid, tag: b.tag, start: b.start, text: stripTags(b.html) }));
}

export function eidAt(src, pos) {
  const blocks = scanEditable(src);
  const i = blocks.findIndex((b) => b.openStart >= pos);
  return i < 0 ? null : i;
}

export function applyTextEdits(src, changes) {
  const blocks = scanEditable(src);
  const edits = [];
  for (const ch of changes) {
    const b = blocks[ch.eid];
    if (!b || b.tag !== ch.tag || typeof ch.html !== "string") {
      throw Object.assign(new Error("편집 위치를 원본에서 찾지 못했습니다. 새로고침한 뒤 다시 편집해 주세요."), { status: 409 });
    }
    if (BLOCK_IN_CONTENT_RE.test(ch.html)) {
      throw Object.assign(new Error("문단 안에 다른 문단이나 블록을 넣을 수는 없습니다. 붙여 넣은 서식을 지워 주세요."), { status: 400 });
    }
    if (UNSAFE_RE.test(ch.html)) {
      throw Object.assign(new Error("링크 주소나 서식에 쓸 수 없는 내용이 들어 있습니다."), { status: 400 });
    }
    if (src.slice(b.openEnd, b.closeStart) !== ch.html) edits.push({ b, html: ch.html, eid: ch.eid });
  }
  edits.sort((x, y) => y.b.openEnd - x.b.openEnd);
  let next = src;
  for (const { b, html } of edits) next = next.slice(0, b.openEnd) + html + next.slice(b.closeStart);
  return { html: next, changed: edits.map((e) => e.eid) };
}
