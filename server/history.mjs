// 원본을 바꾸기 직전 상태를 책 폴더의 .history/에 보관하고, 비교·되돌리기를 제공합니다.
// 최근 KEEP개는 모두 남기고, 그보다 오래된 것은 하루에 하나(그날 마지막 것)만 남깁니다.

import path from "node:path";
import { blockTexts } from "./editable.mjs";

const DIR = ".history";
const KEEP = 50;
const ID_RE = /^(\d{4}-\d\d-\d\dT\d\d-\d\d-\d\d-\d{3})__([a-z-]+)\.html$/;

export const REASONS = {
  edit: "글 수정",
  blocks: "블록 편집",
  structure: "장·파트 편집",
  restore: "되돌리기",
  rename: "책 정보 변경",
  cover: "표지 변경",
  import: "원고 가져오기",
};

const stamp = (d = new Date()) => {
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}-${p(d.getMilliseconds(), 3)}`;
};
const timeOf = (s) => {
  const [date, t] = s.split("T");
  const [h, mi, se, ms] = t.split("-").map(Number);
  const [y, mo, d] = date.split("-").map(Number);
  return new Date(y, mo - 1, d, h, mi, se, ms).getTime();
};

export function createHistory(ws) {
  const dirOf = (htmlPath) => path.join(path.dirname(htmlPath), DIR);
  const diffCache = new Map();

  function entries(htmlPath) {
    return ws.list(dirOf(htmlPath))
      .map((d) => d.name.match(ID_RE))
      .filter(Boolean)
      .map((m) => ({ id: m[0], time: timeOf(m[1]), reason: m[2], day: m[1].slice(0, 10) }))
      .sort((a, b) => b.time - a.time);
  }

  function prune(htmlPath) {
    const seenDays = new Set();
    entries(htmlPath).forEach((e, i) => {
      if (i < KEEP) { seenDays.add(e.day); return; }
      if (seenDays.has(e.day)) ws.remove(path.join(dirOf(htmlPath), e.id));
      else seenDays.add(e.day);
    });
  }

  function snapshot(htmlPath, reason) {
    if (!ws.exists(htmlPath)) return null;
    let d = new Date();
    let id;
    do { id = `${stamp(d)}__${reason}.html`; d = new Date(d.getTime() + 1); } while (ws.exists(path.join(dirOf(htmlPath), id)));
    ws.write(path.join(dirOf(htmlPath), id), ws.read(htmlPath, null));
    prune(htmlPath);
    return id;
  }

  function read(htmlPath, id) {
    if (!ID_RE.test(String(id))) throw Object.assign(new Error("기록을 찾지 못했습니다."), { status: 404 });
    const abs = path.join(dirOf(htmlPath), id);
    if (!ws.exists(abs)) throw Object.assign(new Error("기록을 찾지 못했습니다."), { status: 404 });
    return ws.read(abs);
  }

  // 블록(문단·제목·목록 항목 등) 단위로 앞뒤를 비교합니다. 같은 앞뒤를 먼저 잘라 내고
  // 가운데만 LCS로 맞추므로, 몇 곳만 고친 큰 책도 빠르게 비교됩니다.
  function diff(beforeSrc, afterSrc) {
    const a = blockTexts(beforeSrc).map((b) => b.text);
    const b = blockTexts(afterSrc).map((x) => x.text);
    let pre = 0;
    while (pre < a.length && pre < b.length && a[pre] === b[pre]) pre++;
    let suf = 0;
    while (suf < a.length - pre && suf < b.length - pre && a[a.length - 1 - suf] === b[b.length - 1 - suf]) suf++;
    const A = a.slice(pre, a.length - suf);
    const B = b.slice(pre, b.length - suf);
    const items = [];
    if (A.length * B.length > 4e6) {
      A.forEach((t) => items.push({ type: "del", before: t }));
      B.forEach((t) => items.push({ type: "add", after: t }));
    } else {
      const n = A.length, m = B.length;
      const L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
      for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
      let i = 0, j = 0;
      while (i < n || j < m) {
        if (i < n && j < m && A[i] === B[j]) { i++; j++; continue; }
        const del = i < n && (j >= m || L[i + 1][j] >= L[i][j + 1]);
        if (del) items.push({ type: "del", before: A[i++] });
        else items.push({ type: "add", after: B[j++] });
      }
    }
    // 바로 붙은 삭제+추가는 "수정"으로 묶어서 보여 줍니다.
    const merged = [];
    for (let k = 0; k < items.length; k++) {
      const x = items[k], y = items[k + 1];
      if (x.type === "del" && y && y.type === "add") { merged.push({ type: "mod", before: x.before, after: y.after }); k++; }
      else merged.push(x);
    }
    return merged;
  }

  function list(htmlPath) {
    const all = entries(htmlPath);
    return all.map((e, i) => {
      const newerId = i === 0 ? null : all[i - 1].id;
      const key = `${htmlPath}|${e.id}|${newerId || ws.stat(htmlPath).mtimeMs}`;
      if (!diffCache.has(key)) {
        const after = newerId ? read(htmlPath, newerId) : ws.read(htmlPath);
        diffCache.set(key, diff(read(htmlPath, e.id), after).length);
      }
      return { id: e.id, time: e.time, reason: e.reason, label: REASONS[e.reason] || e.reason, changed: diffCache.get(key) };
    });
  }

  return { snapshot, list, read, diff, dirName: DIR };
}
