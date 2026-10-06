// Theme는 book.css의 시각 레이어다. book.html과 book.json은 바꾸지 않는다.
// 식별자는 CSS 주석에만 둔다. DATA_SPEC의 themeId 스키마는 아직 확정되지 않았다.

export const THEMES = ["practical", "minimal"];

const BLOCK = /\/\* my-chapter-theme-start \*\/[\s\S]*?\/\* my-chapter-theme-end \*\//;

const MINIMAL_LAYER = `
:root {
  --paper: #F7F6F3;
  --paper-2: #F7F6F3;
  --ink: #1A1A1A;
  --ink-2: #5E5E5E;
  --ink-3: #8A8A8A;
  --rule: #E3E0D8;
  --accent: #1A1A1A;
  --accent-soft: transparent;
}
body { font-size: 11pt; line-height: 1.95; }
.cover { background: var(--paper); color: var(--ink); }
.cover-grid { display: none; }
.cover-top, .cover-bottom { color: var(--ink-3); }
.cover-title .kicker { color: var(--ink-3); font-weight: 500; letter-spacing: .14em; }
.cover-title h1 { font-weight: 520; font-size: 28pt; letter-spacing: -.02em; }
.cover-title h1 em { color: inherit; }
.cover-rule { height: 1px; width: 28mm; background: var(--ink); }
@page part { background: var(--paper); }
.part-inner { color: var(--ink); }
.part-label, .pl-no, .part-list li { color: var(--ink-2); }
.part-num { font-weight: 500; font-size: 64pt; color: var(--ink-3); }
.part-list { border-top-color: var(--rule); }
.part-list li { border-bottom-color: var(--rule); }
.opener { margin-bottom: 16mm; padding-bottom: 10mm; border-bottom-color: var(--rule); }
.op-label, .toc-label, .titlepage .tp-label, .tp-no { color: var(--ink-3); letter-spacing: .28em; font-weight: 500; }
.op-num { font-weight: 500; font-size: 40pt; color: var(--ink-3); }
.opener h1 { font-weight: 560; font-size: 22pt; }
h2 { font-weight: 600; margin-top: 14mm; }
h3::before { width: 0; margin: 0; background: transparent; }
strong { background: none; }
p { margin-bottom: 4.2mm; }
p.key::before { height: 1px; width: 12mm; background: var(--ink); }
.prompt, .checklist, .box { border-radius: 0; }
.prompt { border-color: var(--rule); }
.prompt-tag { background: transparent; color: var(--ink-3); border-bottom: 1px solid var(--rule); }
.prompt-tag::after { color: var(--ink-3); }
.checklist { background: transparent; }
.checklist::before { color: var(--ink-3); }
.result-box { background: transparent; color: var(--ink); border: 1px solid var(--ink); }
.result-box .box-label, .result-box ul > li::marker { color: var(--ink-3); }
.checkpoint { border-width: 1px; border-color: var(--rule); }
mark { background: transparent; color: inherit; text-decoration: underline; text-underline-offset: .15em; }
`.trim();

export function readTheme(css) {
  const found = String(css || "").match(/\/\* my-chapter-theme:\s*(practical|minimal)\s*\*\//);
  return found ? found[1] : "practical";
}

export function applyThemeCss(css, theme) {
  if (!THEMES.includes(theme)) {
    throw Object.assign(new Error("고를 수 없는 디자인입니다."), { status: 400 });
  }
  const base = String(css || "").replace(BLOCK, "").trimEnd();
  if (!base) {
    throw Object.assign(new Error("책 디자인을 적용할 CSS가 없습니다."), { status: 400 });
  }
  const layer = theme === "minimal" ? MINIMAL_LAYER + "\n" : "";
  return `${base}\n\n/* my-chapter-theme-start */\n/* my-chapter-theme: ${theme} */\n${layer}/* my-chapter-theme-end */\n`;
}
