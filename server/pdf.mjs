// 헤드리스 Chrome으로 Paged.js 미리보기를 열어 PDF로 인쇄하고, pdf-lib로 메타데이터와 책갈피를 붙입니다.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { PDFDocument, PDFName, PDFNumber, PDFHexString, PDFNull } from "pdf-lib";

// 책갈피는 책의 차례에서 만들므로 PDF 책갈피와 인쇄된 차례가 항상 같습니다.
// PART 아래 자식은 그 뒤에 나오는 장들입니다.
const OUTLINE_SCRIPT = `(() => {
  const sc = document.querySelector('.pbv-scroller') || document;
  const pages = Array.from(sc.querySelectorAll('.pagedjs_page'));
  const items = [];
  sc.querySelectorAll('.toc li').forEach((li) => {
    const a = li.querySelector('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const target = sc.querySelector('[id="' + id + '"]');
    const page = target ? pages.indexOf(target.closest('.pagedjs_page')) : -1;
    if (page < 0) return;
    const text = (sel) => (li.querySelector(sel)?.textContent || '').trim();
    let label;
    let level = 0;
    if (li.classList.contains('toc-part')) {
      label = text('.tp-no') + ' · ' + text('.tp-t');
    } else {
      const no = text('.tc-no');
      const title = text('.tc-t');
      if (li.classList.contains('toc-pro')) label = 'Prologue · ' + title;
      else if (li.classList.contains('toc-epi')) label = 'Epilogue · ' + title;
      else if (li.classList.contains('toc-ap')) label = 'APPENDIX ' + no.replace(/^A/, '') + ' · ' + title;
      else label = parseInt(no, 10) + '장 · ' + title;
      const n = parseInt(no, 10);
      level = li.classList.contains('toc-ch') && !li.classList.contains('toc-pro') &&
        !li.classList.contains('toc-ap') && !li.classList.contains('toc-epi') && n >= 1 ? 1 : 0;
    }
    items.push({ label, page, level });
  });
  if (!items.length) {
    sc.querySelectorAll('section.chapter h1, section.part h1').forEach((h) => {
      const page = pages.indexOf(h.closest('.pagedjs_page'));
      const label = h.textContent.trim();
      if (page >= 0 && label && !items.some((x) => x.label === label)) items.push({ label, page, level: 0 });
    });
  }
  return items;
})()`;

function addOutline(pdf, items) {
  const ctx = pdf.context;
  const pages = pdf.getPages();
  const rootRef = ctx.nextRef();
  const nodes = [];
  let currentPart = null;
  for (const it of items) {
    const node = { ...it, ref: ctx.nextRef(), children: [] };
    if (it.level === 1 && currentPart) currentPart.children.push(node);
    else {
      nodes.push(node);
      currentPart = /^PART /.test(it.label) ? node : null;
    }
  }
  const writeLevel = (list, parentRef) => {
    list.forEach((node, i) => {
      const page = pages[Math.min(node.page, pages.length - 1)];
      const dict = ctx.obj({});
      dict.set(PDFName.of("Title"), PDFHexString.fromText(node.label));
      dict.set(PDFName.of("Parent"), parentRef);
      dict.set(PDFName.of("Dest"), ctx.obj([page.ref, PDFName.of("XYZ"), PDFNull, PDFNull, PDFNull]));
      if (i > 0) dict.set(PDFName.of("Prev"), list[i - 1].ref);
      if (i < list.length - 1) dict.set(PDFName.of("Next"), list[i + 1].ref);
      if (node.children.length) {
        dict.set(PDFName.of("First"), node.children[0].ref);
        dict.set(PDFName.of("Last"), node.children[node.children.length - 1].ref);
        dict.set(PDFName.of("Count"), PDFNumber.of(node.children.length));
        writeLevel(node.children, node.ref);
      }
      ctx.assign(node.ref, dict);
    });
  };
  writeLevel(nodes, rootRef);
  const total = nodes.reduce((n, x) => n + 1 + x.children.length, 0);
  const root = ctx.obj({});
  root.set(PDFName.of("Type"), PDFName.of("Outlines"));
  if (nodes.length) {
    root.set(PDFName.of("First"), nodes[0].ref);
    root.set(PDFName.of("Last"), nodes[nodes.length - 1].ref);
  }
  root.set(PDFName.of("Count"), PDFNumber.of(total));
  ctx.assign(rootRef, root);
  pdf.catalog.set(PDFName.of("Outlines"), rootRef);
  pdf.catalog.set(PDFName.of("PageMode"), PDFName.of("UseOutlines"));
}

async function finalizePdf(buf, outline, meta) {
  const pdf = await PDFDocument.load(buf, { updateMetadata: false });
  if (meta.title) pdf.setTitle(meta.title, { showInWindowTitleBar: true });
  if (meta.author) pdf.setAuthor(meta.author);
  if (meta.subject) pdf.setSubject(meta.subject);
  if (meta.keywords?.length) pdf.setKeywords([meta.keywords.join(", ")]);
  pdf.setLanguage("ko-KR");
  pdf.setCreator("preview-server.mjs (Paged.js + Chrome)");
  pdf.setProducer("pdf-lib");
  const now = new Date();
  pdf.setCreationDate(now);
  pdf.setModificationDate(now);
  if (outline && outline.length) addOutline(pdf, outline);
  return Buffer.from(await pdf.save());
}

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

export const findChrome = () => CHROME_CANDIDATES.find((p) => fs.existsSync(p));

let queue = Promise.resolve();

// 한 번에 하나씩만 인쇄합니다(Chrome을 여러 개 띄우면 메모리가 크게 듭니다).
export function renderPdf(pageUrl, meta) {
  const job = queue.then(() => printPage(pageUrl, meta));
  queue = job.catch(() => {});
  return job;
}

async function printPage(pageUrl, meta) {
  const chrome = findChrome();
  if (!chrome) throw new Error("Chrome 또는 Edge를 찾지 못했습니다. CHROME_PATH 환경변수로 경로를 지정하세요.");

  const userData = fs.mkdtempSync(path.join(os.tmpdir(), "ebook-pdf-"));
  const proc = spawn(
    chrome,
    ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--remote-debugging-port=0", `--user-data-dir=${userData}`, "about:blank"],
    { stdio: ["ignore", "ignore", "pipe"] }
  );

  try {
    const wsUrl = await new Promise((resolve, reject) => {
      let buf = "";
      const timer = setTimeout(() => reject(new Error("Chrome이 시작되지 않았습니다.")), 20000);
      proc.stderr.on("data", (d) => {
        buf += d.toString();
        const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
        if (m) { clearTimeout(timer); resolve(m[1]); }
      });
      proc.on("exit", () => { clearTimeout(timer); reject(new Error("Chrome이 종료되었습니다.")); });
    });

    const sock = new WebSocket(wsUrl);
    await new Promise((resolve, reject) => {
      sock.addEventListener("open", resolve, { once: true });
      sock.addEventListener("error", () => reject(new Error("Chrome 연결 실패")), { once: true });
    });

    let nextId = 1;
    const pending = new Map();
    sock.addEventListener("message", (ev) => {
      const msg = JSON.parse(ev.data);
      const p = msg.id && pending.get(msg.id);
      if (!p) return;
      pending.delete(msg.id);
      if (msg.error) p.reject(new Error(msg.error.message));
      else p.resolve(msg.result);
    });
    let sessionId;
    const send = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const id = nextId++;
        pending.set(id, { resolve, reject });
        sock.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
      });

    const { targetId } = await send("Target.createTarget", { url: "about:blank" });
    ({ sessionId } = await send("Target.attachToTarget", { targetId, flatten: true }));
    await send("Page.enable");
    await send("Page.navigate", { url: pageUrl });

    // Paged.js가 페이지 나누기를 마치고 쪽수가 더 이상 늘지 않을 때까지 기다립니다.
    const started = Date.now();
    let last = -1;
    let stable = 0;
    while (true) {
      if (Date.now() - started > 240000) throw new Error("페이지 나누기가 시간 안에 끝나지 않았습니다.");
      await new Promise((r) => setTimeout(r, 700));
      const { result } = await send("Runtime.evaluate", {
        expression: `({ shell: !!document.body && document.body.classList.contains('pbv-shell'),
          pages: document.querySelectorAll('.pagedjs_page').length,
          fonts: document.fonts ? document.fonts.status : 'loaded' })`,
        returnByValue: true,
      });
      const v = result && result.value;
      if (!v) continue;
      if (v.shell && v.pages > 0 && v.pages === last && v.fonts === "loaded") {
        if (++stable >= 3) break;
      } else stable = 0;
      last = v.pages;
    }

    const outlineRes = await send("Runtime.evaluate", { expression: OUTLINE_SCRIPT, returnByValue: true });
    const outline = (outlineRes.result && outlineRes.result.value) || [];

    await send("Runtime.evaluate", {
      expression: `document.documentElement.classList.remove('pbv-clamp');
        document.body.classList.remove('pbv-clamp');
        document.body.classList.add('pbv-printing');`,
    });
    await new Promise((r) => setTimeout(r, 500));

    const { stream } = await send("Page.printToPDF", {
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      marginTop: 0,
      marginBottom: 0,
      marginLeft: 0,
      marginRight: 0,
      transferMode: "ReturnAsStream",
    });
    const chunks = [];
    for (let eof = false; !eof; ) {
      const c = await send("IO.read", { handle: stream, size: 1 << 20 });
      if (c.data) chunks.push(Buffer.from(c.data, c.base64Encoded ? "base64" : "utf8"));
      eof = c.eof;
    }
    await send("IO.close", { handle: stream });
    sock.close();
    return finalizePdf(Buffer.concat(chunks), outline, meta);
  } finally {
    proc.kill();
    setTimeout(() => fs.rm(userData, { recursive: true, force: true }, () => {}), 2000);
  }
}
