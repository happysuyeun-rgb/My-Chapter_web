// 편집기의 블록 도구: 블록 추가·삭제·위아래 이동·종류 바꾸기.
// 블록은 data-eid 번호(원본 순서)로 가리키고, 실제 연산은 그 블록이 속한 "단위"에 합니다.
// 단위 = 장(section.chapter) 바로 아래 요소(문단·제목·목록·상자·그림·표…). 목록 항목(li)은
// 같은 목록 안의 항목끼리 따로 다룹니다.

import { parse, attr, classes, closest, outer } from "./htmltree.mjs";
import { scanEditable } from "./editable.mjs";
import { pad2 } from "./util.mjs";

const fail = (msg, status = 400) => Object.assign(new Error(msg), { status });

export const BLOCK_TYPES = {
  p: { label: "문단", html: () => "<p>여기에 내용을 쓰세요.</p>" },
  h2: { label: "소제목", html: () => "<h2>새 소제목</h2>" },
  h3: { label: "작은 제목", html: () => "<h3>새 작은 제목</h3>" },
  list: { label: "목록", html: () => "<ul><li>목록 항목</li></ul>" },
  olist: { label: "번호 목록", html: () => "<ol><li>첫 번째 항목</li></ol>" },
  checklist: { label: "체크리스트", html: () => '<ul class="checklist"><li>확인할 항목</li></ul>' },
  prompt: {
    label: "프롬프트 상자",
    html: () => '<div class="prompt short"><div class="prompt-tag"><span>PROMPT</span></div><div class="prompt-body"><p>여기에 프롬프트 문장을 씁니다.</p></div></div>',
  },
  image: {
    label: "그림 자리",
    html: ({ slotId, figNo }) =>
      `<figure class="shot"><image-slot id="${slotId}" shape="rect" fit="contain" placeholder="[화면 캡처 자리 — 화면 설명]"></image-slot><figcaption><span class="fig-no">그림 ${figNo}</span>화면 설명</figcaption></figure>`,
  },
  table: {
    label: "표",
    html: () => '<table class="grid"><thead><tr><th>항목</th><th>내용</th></tr></thead><tbody><tr><td>항목</td><td>내용</td></tr><tr><td>항목</td><td>내용</td></tr></tbody></table>',
  },
  item: { label: "목록 항목 추가", html: () => "<li>새 항목</li>" },
};
const RETYPE = new Set(["p", "h2", "h3"]);

function locate(src, eid) {
  const blocks = scanEditable(src);
  const b = blocks[eid];
  if (!b) throw fail("블록을 원본에서 찾지 못했습니다. 새로고침한 뒤 다시 해 주세요.", 409);
  const tree = parse(src);
  let node = null;
  (function find(n) {
    for (const c of n.children) {
      if (c.start === b.openStart) { node = c; return; }
      if (c.start < b.openStart && c.end > b.openStart) return find(c);
    }
  })(tree);
  if (!node) throw fail("블록 구조를 읽지 못했습니다.", 409);
  const section = closest(node, (n) => n.tag === "section");
  if (!section || !classes(section).includes("chapter")) throw fail("표지·차례·파트 면은 블록 도구로 바꿀 수 없어요. 글자만 고칠 수 있습니다.");
  if (closest(node, (n) => n.tag === "header" || classes(n).includes("opener"))) {
    throw fail("장 제목 부분은 블록 도구로 바꿀 수 없어요. 글자만 고칠 수 있습니다.");
  }
  let unit = node;
  while (unit.parent !== section) unit = unit.parent;
  const li = node.tag === "li" ? node : closest(node, (n) => n.tag === "li");
  const units = section.children.filter((c) => !(c.tag === "header" || classes(c).includes("opener")));
  return { node, unit, section, units, li: li && li.parent && /^(ul|ol)$/.test(li.parent.tag) ? li : null };
}

const eidAt = (src, pos) => {
  const i = scanEditable(src).findIndex((b) => b.openStart >= pos);
  return i < 0 ? null : i;
};

function figureContext(src) {
  const tree = parse(src);
  const nums = [];
  (function walk(n) {
    for (const c of n.children) {
      if (c.tag === "span" && classes(c).includes("fig-no")) nums.push(c);
      walk(c);
    }
  })(tree);
  const ids = [...src.matchAll(/<image-slot\b[^>]*\bid="slot-(\d+)"/g)].map((m) => Number(m[1]));
  const seq = nums.every((n, i) => src.slice(n.innerStart, n.innerEnd).trim() === `그림 ${pad2(i + 1)}`);
  return { nums, seq, nextSlot: `slot-${pad2((ids.length ? Math.max(...ids) : 0) + 1)}` };
}

// 그림 번호가 문서 순서대로 01, 02…로 붙어 있던 책이면, 그림을 넣거나 지운 뒤 다시 매깁니다.
function renumberFigures(src, wasSequential) {
  if (!wasSequential) return src;
  const { nums } = figureContext(src);
  let out = src;
  for (let i = nums.length - 1; i >= 0; i--) {
    out = out.slice(0, nums[i].innerStart) + `그림 ${pad2(i + 1)}` + out.slice(nums[i].innerEnd);
  }
  return out;
}

export function applyBlockOp(src, { op, eid, type }) {
  const loc = locate(src, Number(eid));
  const fig = figureContext(src);

  if (op === "insert") {
    const t = BLOCK_TYPES[type];
    if (!t) throw fail("알 수 없는 블록 종류입니다.");
    if (type === "item") {
      if (!loc.li) throw fail("목록 항목 안에서만 항목을 추가할 수 있어요.");
      const at = loc.li.end;
      const html = src.slice(0, at) + t.html() + src.slice(at);
      return { html, anchor: eidAt(html, at), select: true };
    }
    const at = loc.unit.end;
    const figNo = pad2(fig.seq ? fig.nums.filter((n) => n.start < at).length + 1 : fig.nums.length + 1);
    let html = src.slice(0, at) + "\n" + t.html({ slotId: fig.nextSlot, figNo }) + src.slice(at);
    if (type === "image") html = renumberFigures(html, fig.seq);
    return { html, anchor: eidAt(html, at + 1), select: true };
  }

  if (op === "delete") {
    const items = loc.li ? loc.li.parent.children.filter((c) => c.tag === "li") : [];
    if (items.length > 1) {
      const prevLi = items[items.indexOf(loc.li) - 1];
      const html = src.slice(0, loc.li.start) + src.slice(loc.li.end);
      return { html, anchor: eidAt(html, prevLi ? prevLi.start : loc.li.start) };
    }
    if (loc.units.length <= 1) throw fail("장에 남은 마지막 블록은 지울 수 없어요. 내용을 고쳐 써 주세요.");
    const i = loc.units.indexOf(loc.unit);
    const prev = loc.units[i - 1];
    let start = loc.unit.start;
    while (start > 0 && /[ \t]/.test(src[start - 1])) start--;
    if (src[start - 1] === "\n") start--;
    let html = src.slice(0, start) + src.slice(loc.unit.end);
    const hadFigure = /<figure\b/.test(outer(src, loc.unit));
    if (hadFigure) html = renumberFigures(html, fig.seq);
    const anchorPos = prev ? prev.start : start;
    return { html, anchor: eidAt(html, anchorPos) };
  }

  if (op === "up" || op === "down") {
    let list, item;
    if (loc.li && loc.li.parent.children.filter((c) => c.tag === "li").length > 1 && type !== "unit") {
      list = loc.li.parent.children.filter((c) => c.tag === "li");
      item = loc.li;
    } else {
      list = loc.units;
      item = loc.unit;
    }
    const i = list.indexOf(item);
    const j = op === "up" ? i - 1 : i + 1;
    if (j < 0 || j >= list.length) throw fail(op === "up" ? "이미 맨 위입니다." : "이미 맨 아래입니다.");
    const [x, y] = i < j ? [item, list[j]] : [list[j], item];
    const html = src.slice(0, x.start) + outer(src, y) + src.slice(x.end, y.start) + outer(src, x) + src.slice(y.end);
    const movedStart = op === "up" ? x.start : x.start + (y.end - y.start) + (y.start - x.end);
    const out = /<figure\b/.test(outer(src, item)) || /<figure\b/.test(outer(src, list[j])) ? renumberFigures(html, fig.seq) : html;
    return { html: out, anchor: eidAt(out, movedStart) };
  }

  if (op === "retype") {
    if (!RETYPE.has(type)) throw fail("문단·소제목·작은 제목으로만 바꿀 수 있어요.");
    const n = loc.node;
    if (n !== loc.unit || !RETYPE.has(n.tag)) throw fail("문단과 제목만 종류를 바꿀 수 있어요.");
    if (n.tag === type) return { html: src, anchor: Number(eid) };
    const id = attr(n, "id");
    const html = src.slice(0, n.start) + `<${type}${id ? ` id="${id}"` : ""}>` + src.slice(n.innerStart, n.innerEnd) + `</${type}>` + src.slice(n.end);
    return { html, anchor: eidAt(html, n.start) };
  }

  throw fail("알 수 없는 블록 작업입니다.");
}
