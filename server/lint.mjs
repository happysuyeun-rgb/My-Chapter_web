// 출간 전 점검: 빈 그림 자리·할 일 표시, 빈 블록, 장 사이 중복 문장, 너무 긴 문장,
// 차례와 본문 제목 불일치, 깨진 책 안 링크, 자주 틀리는 맞춤법. 그리고 분량 통계.

import { parse, attr, classes, closest, find, findAll, text } from "./htmltree.mjs";
import { scanEditable, EDITABLE_TAGS } from "./editable.mjs";
import { readStructure } from "./toc.mjs";
import { stripTags } from "./util.mjs";

const SHEET = 200; // 원고지 1매 = 200자
const LONG = 120;
const MIN_DUP = 25;

// [틀린 표현, 바른 표현, 설명]
const SPELLING = [
  [/몇일/g, "며칠"],
  [/됬/g, "됐"],
  [/되요(?=[\s.,!?…)"'’”]|$)/g, "돼요"],
  [/되서(?=\s|[.,])/g, "돼서"],
  [/되야(?=\s|[.,])/g, "돼야"],
  [/금새/g, "금세"],
  [/왠만/g, "웬만"],
  [/오랫만/g, "오랜만"],
  [/희안/g, "희한"],
  [/(할|갈|줄|볼|올|알|될|드릴)께/g, "$1게"],
  [/어의(없|가 없)/g, "어이$1"],
  [/역활/g, "역할"],
  [/설겆이/g, "설거지"],
  [/내노라/g, "내로라"],
  [/(자격|입장|신분|사람|저자|개발자|디자이너|기획자|사용자|초보자|리더|대표)으?로써/g, "$1로서", "자격·신분은 '로서'"],
  [/([가-힣])\s?수(있|없)(?!이)/g, "$1 수 $2", "'수 있다/없다'는 띄어 씁니다"],
];
const TODO_RE = /\b(TODO|TBD|FIXME|XXX)\b|\[(작성 ?예정|추가 ?예정|확인 ?필요|여기에 내용을 쓰세요)[^\]]*\]|여기에 내용을 쓰세요/;

const sentences = (t) => t.split(/(?<=[.!?。])\s+|(?<=다\.)/).map((s) => s.trim()).filter(Boolean);
const excerpt = (t, n = 70) => (t.length > n ? t.slice(0, n) + "…" : t);

function sectionLabels(src, st) {
  const labels = new Map();
  for (const s of st.sections) {
    const num = s.num ? text(src, s.num) : "";
    const label =
      s.kind === "part" ? `PART ${parseInt(num, 10) || ""}`.trim()
      : s.kind === "ch" ? `${parseInt(num, 10)}장`
      : s.kind === "ap" ? `부록 ${parseInt(num, 10)}`
      : s.kind === "pro" ? "프롤로그"
      : s.kind === "epi" ? "에필로그" : "";
    labels.set(s.node, { label, title: s.title, kind: s.kind, id: s.id });
  }
  return labels;
}

export function lintBook(src, state = {}) {
  const tree = parse(src);
  const st = readStructure(src);
  const labels = sectionLabels(src, st);
  const blocks = scanEditable(src);
  const nested = new RegExp(`<(${EDITABLE_TAGS.join("|")})(?=[\\s>])`, "i");
  const issues = [];
  const add = (it) => issues.push(it);

  const sectionOf = (pos) => {
    const s = st.sections.find((x) => x.node.start <= pos && pos < x.node.end);
    if (s) return labels.get(s.node);
    if (st.toc && st.toc.start <= pos && pos < st.toc.end) return { label: "차례", title: "", kind: "toc" };
    return { label: "앞부분", title: "", kind: "front" };
  };
  const eidAt = (pos) => {
    const i = blocks.findIndex((b) => b.openStart >= pos);
    return i < 0 ? null : i;
  };

  // 글 블록(안에 다른 글 블록이 없는 것)
  const items = blocks.map((b, eid) => ({ eid, tag: b.tag, pos: b.openStart, html: src.slice(b.openEnd, b.closeStart) }))
    .filter((b) => !nested.test(b.html))
    .map((b) => ({ ...b, text: stripTags(b.html), sec: sectionOf(b.pos), prompt: false }));
  const promptRanges = findAll(tree, (n) => classes(n).includes("prompt")).map((n) => [n.start, n.end]);
  for (const it of items) it.prompt = promptRanges.some(([a, b]) => it.pos >= a && it.pos < b);

  // 1) 빈 그림 자리
  const slots = findAll(tree, (n) => n.tag === "image-slot");
  let filled = 0;
  for (const s of slots) {
    const id = attr(s, "id") || "";
    const v = state[id];
    const has = typeof v === "string" ? !!v : !!(v && v.u);
    if (has) { filled++; continue; }
    const fig = closest(s, (n) => n.tag === "figure");
    const cap = fig ? find(fig, (n) => n.tag === "figcaption") : null;
    add({
      type: "placeholder", level: "warn", eid: cap ? eidAt(cap.start) : eidAt(s.end), slot: id,
      section: sectionOf(s.start), text: (attr(s, "placeholder") || id).replace(/^\[|\]$/g, ""),
      message: id === "cover-image" ? "표지 이미지가 비어 있습니다" : "그림이 아직 들어가지 않았습니다",
    });
  }

  for (const it of items) {
    // 2) 할 일 표시
    const m = it.text.match(TODO_RE);
    if (m) add({ type: "todo", level: "warn", eid: it.eid, section: it.sec, text: excerpt(it.text), message: `작성 중 표시가 남아 있습니다 (${m[0]})` });
    // 3) 빈 블록
    if (!it.text && !/^(td|th|dd)$/.test(it.tag) && !/<(img|image-slot|br)\b/i.test(it.html)) {
      add({ type: "empty", level: "warn", eid: it.eid, section: it.sec, text: `<${it.tag}>`, message: "내용이 빈 블록입니다" });
    }
    // 4) 긴 문장
    if (!it.prompt && it.sec.kind !== "toc") {
      for (const s of sentences(it.text)) {
        if (s.length > LONG) add({ type: "long", level: "info", eid: it.eid, section: it.sec, text: excerpt(s, 90), message: `한 문장이 ${s.length}자입니다. 나눠 쓰면 읽기 쉬워요` });
      }
    }
    // 5) 맞춤법
    for (const [re, fix, why] of SPELLING) {
      re.lastIndex = 0;
      for (let mm; (mm = re.exec(it.text)); ) {
        const wrong = mm[0];
        const right = wrong.replace(new RegExp(re.source), fix);
        const at = Math.max(0, mm.index - 18);
        add({
          type: "spelling", level: "warn", eid: it.eid, section: it.sec,
          text: (at > 0 ? "…" : "") + it.text.slice(at, mm.index + wrong.length + 18), wrong, right,
          message: `'${wrong}' → '${right}'${why ? ` (${why})` : ""}`,
        });
      }
    }
  }

  // 6) 장 사이 중복 문장 (프롬프트 상자는 부록에 모아 두는 경우가 많아 뺍니다)
  const seen = new Map();
  for (const it of items) {
    if (it.prompt || !["ch", "ap", "pro", "epi"].includes(it.sec.kind)) continue;
    for (const s of sentences(it.text)) {
      if (s.length < MIN_DUP) continue;
      const key = s.replace(/\s+/g, "");
      const prev = seen.get(key);
      if (prev && prev.sec !== it.sec) {
        add({ type: "dup", level: "info", eid: it.eid, section: it.sec, text: excerpt(s, 90), message: `${prev.sec.label || "앞"}에도 같은 문장이 있습니다`, other: prev.eid });
      } else if (!prev) seen.set(key, it);
    }
  }

  // 7) 차례와 본문 제목 불일치, 차례에 없는 장, 깨진 링크
  for (const e of st.entries) {
    const s = st.sections.find((x) => x.id === e.id);
    const tocTitle = e.t ? text(src, e.t) : "";
    if (!s) {
      add({ type: "toc", level: "warn", eid: eidAt(e.li.start), section: { label: "차례" }, text: tocTitle, message: "차례 항목이 가리키는 장이 없습니다" });
      continue;
    }
    const norm = (x) => x.replace(/\s+/g, "");
    if (s.title && !norm(tocTitle).startsWith(norm(s.title))) {
      add({ type: "toc", level: "warn", eid: eidAt(e.li.start), section: labels.get(s.node), text: `차례: ${tocTitle} / 본문: ${s.title}`, message: "차례 제목과 본문 제목이 다릅니다" });
    }
  }
  if (st.ol) {
    for (const s of st.sections) {
      if (s.id && !st.entries.some((e) => e.id === s.id)) {
        add({ type: "toc", level: "warn", eid: s.h1 ? eidAt(s.h1.start) : null, section: labels.get(s.node), text: s.title, message: "차례에 빠진 장입니다" });
      }
    }
  }
  const ids = new Set([...src.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const a of findAll(tree, (n) => n.tag === "a")) {
    const href = attr(a, "href") || "";
    if (href.startsWith("#") && href.length > 1 && !ids.has(href.slice(1))) {
      add({ type: "link", level: "warn", eid: eidAt(a.start) ?? null, section: sectionOf(a.start), text: `${text(src, a)} → ${href}`, message: "책 안 링크가 가리키는 곳이 없습니다" });
    }
  }

  // 분량 통계
  const body = items.filter((it) => !["toc", "front"].includes(it.sec.kind));
  const chars = body.reduce((n, it) => n + it.text.length, 0);
  const perSection = st.sections.filter((s) => s.kind !== "part").map((s) => {
    const lab = labels.get(s.node);
    const c = body.filter((it) => it.sec === lab).reduce((n, it) => n + it.text.length, 0);
    return { label: lab.label, title: s.title, chars: c, eid: s.h1 ? eidAt(s.h1.start) : null };
  });

  const counts = {};
  for (const it of issues) counts[it.type] = (counts[it.type] || 0) + 1;
  return {
    issues,
    counts,
    stats: {
      chars,
      charsNoSpace: body.reduce((n, it) => n + it.text.replace(/\s/g, "").length, 0),
      sheets: Math.ceil(chars / SHEET),
      sections: perSection,
      images: { total: slots.length, filled },
    },
  };
}

export function summaryOf(result) {
  const warn = result.issues.filter((i) => i.level === "warn" && i.type !== "placeholder").length;
  return {
    chars: result.stats.chars,
    sheets: result.stats.sheets,
    placeholders: result.counts.placeholder || 0,
    issues: warn,
  };
}
