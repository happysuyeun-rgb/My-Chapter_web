// In-preview text editor. Loaded only by preview-server.mjs, which tags each
// text block with data-eid/data-etag and exposes window.__bookEdit.
(function () {
  'use strict';

  const info = window.__bookEdit;
  if (!info) return;

  const PAGED_ATTR_RE = /^data-(ref|split-|break-|align-|previous-|next-|page-|target-|string-|counter-|eid$|etag$)/;
  const dirty = new Set();
  let editing = false;
  let saving = false;
  let tocSynced = false;
  let ui = null;

  // Paged.js가 스타일시트의 position: fixed를 "모든 쪽에 반복"으로 바꿔 버리므로,
  // 떠 있는 도구 막대·메뉴의 position은 요소에 직접 넣습니다.
  const style = document.createElement('style');
  style.textContent = `
    body.pbv-editing .pbv-scroller [contenteditable="true"] { outline: 1px dashed transparent; outline-offset: 2px; border-radius: 2px; cursor: text; }
    body.pbv-editing .pbv-scroller [contenteditable="true"]:hover { outline-color: rgba(47, 85, 212, .45); }
    body.pbv-editing .pbv-scroller [contenteditable="true"]:focus { outline: 2px solid rgba(47, 85, 212, .8); background: rgba(47, 85, 212, .04); }
    body.pbv-editing .pbv-scroller .pbv-edited { background: rgba(255, 214, 0, .18); }
    .pbv-edit-btn { padding: 6px 12px; border: 1px solid var(--pbv-border, rgba(0,0,0,.08)); background: #fff; font-weight: 600; white-space: nowrap; }
    body.pbv-editing .pbv-edit-btn { background: #1c1b19; color: #fff; }
    .pbv-save-btn { padding: 6px 12px; background: #2f55d4; color: #fff; font-weight: 600; white-space: nowrap; }
    .pbv-save-btn:hover { background: #2445b3; }
    .pbv-save-btn[disabled] { opacity: .45; cursor: default; }
    .pbv-library-btn { text-decoration: none; white-space: nowrap; color: var(--pbv-muted, #6b6b6b); }
    .pbv-edit-status { font-size: 12px; color: var(--pbv-muted, #6b6b6b); white-space: nowrap; }
    body:not(.pbv-editing) .pbv-save-btn, body:not(.pbv-editing) .pbv-edit-status { display: none; }
    .pbv-blockbar { position: fixed; z-index: 50; display: flex; gap: 2px; padding: 3px; background: #1c1b19; border-radius: 8px;
      box-shadow: 0 8px 22px -6px rgba(0,0,0,.45); font: 12px/1 Pretendard, system-ui, sans-serif; letter-spacing: normal; }
    .pbv-blockbar[hidden] { display: none; }
    .pbv-blockbar button { border: 0; background: transparent; color: #f4f2ec; padding: 6px 8px; border-radius: 5px; cursor: pointer; font: inherit; white-space: nowrap; }
    .pbv-blockbar button:hover { background: rgba(255,255,255,.14); }
    .pbv-blockbar button[disabled] { opacity: .35; cursor: default; background: transparent; }
    .pbv-blockbar .sep { width: 1px; background: rgba(255,255,255,.15); margin: 3px 2px; }
    .pbv-blockmenu { position: fixed; z-index: 51; min-width: 150px; padding: 4px; background: #fff; border-radius: 8px;
      box-shadow: 0 14px 34px -8px rgba(0,0,0,.35), 0 0 0 1px rgba(0,0,0,.06); font: 13px/1.3 Pretendard, system-ui, sans-serif; }
    .pbv-blockmenu button { display: flex; justify-content: space-between; gap: 16px; width: 100%; border: 0; background: none; text-align: left; padding: 7px 10px; border-radius: 5px; cursor: pointer; font: inherit; color: #1c1b19; }
    .pbv-blockmenu button:hover { background: #f1eee7; }
    .pbv-blockmenu kbd { font: 11px/1.3 inherit; color: #8c887f; }
    .pbv-blockmenu .on { font-weight: 700; }
  `;
  document.head.appendChild(style);

  window.__pbvBlockReload = () => {
    if (!editing) return false;
    setStatus('원본 파일이 바뀌었습니다. 편집을 끝내면 새로 불러옵니다.');
    return true;
  };

  window.addEventListener('beforeunload', (e) => {
    if (dirty.size) { e.preventDefault(); e.returnValue = ''; }
  });

  const waitToolbar = setInterval(() => {
    const bar = document.querySelector('.pbv-toolbar');
    if (!bar) return;
    clearInterval(waitToolbar);
    buildUi(bar);
  }, 300);

  function buildUi(bar) {
    const status = document.createElement('span');
    status.className = 'pbv-edit-status';

    const save = document.createElement('button');
    save.className = 'pbv-btn pbv-save-btn';
    save.textContent = '저장';
    save.disabled = true;
    save.addEventListener('click', () => saveChanges());

    const toggle = document.createElement('button');
    toggle.className = 'pbv-btn pbv-edit-btn';
    toggle.textContent = '편집하기';
    toggle.addEventListener('click', () => (editing ? exitEditing() : enterEditing()));

    const library = document.createElement('a');
    library.className = 'pbv-btn pbv-library-btn';
    library.href = '/';
    library.textContent = '← 서재';
    library.addEventListener('click', (e) => {
      if (dirty.size && !confirm('저장하지 않은 수정이 있습니다. 서재로 나갈까요?')) e.preventDefault();
    });
    const toggleBtn = bar.querySelector('.pbv-sidebar-toggle');
    bar.insertBefore(library, toggleBtn ? toggleBtn.nextSibling : bar.firstChild);

    const anchor = bar.querySelector('.pbv-pdf-btn');
    bar.insertBefore(status, anchor);
    bar.insertBefore(save, anchor);
    bar.insertBefore(toggle, anchor);
    ui = { status, save, toggle };
    resumeFromAnchor();
  }

  // 블록 작업 뒤에는 페이지를 새로 나눠야 하므로 새로고침합니다. 새로고침 전에 바뀐 블록 번호를
  // 남겨 두었다가, 다시 열리면 그 블록으로 가서 편집 상태를 이어 갑니다.
  const ANCHOR_KEY = 'pbv-anchor';
  function resumeFromAnchor() {
    let a = null;
    try { a = JSON.parse(sessionStorage.getItem(ANCHOR_KEY) || 'null'); } catch (_) {}
    sessionStorage.removeItem(ANCHOR_KEY);
    if (!a || a.file !== info.file) return;
    enterEditing();
    const go = () => {
      const el = a.eid == null ? null : scroller().querySelector(`[data-eid="${a.eid}"]`);
      if (!el) return;
      el.scrollIntoView({ block: 'center', inline: 'nearest' });
      el.focus({ preventScroll: true });
      const sel = getSelection();
      const r = document.createRange();
      r.selectNodeContents(el);
      if (!a.select) r.collapse(false);
      sel.removeAllRanges();
      sel.addRange(r);
      showBlockbar(el);
    };
    go();
    setTimeout(go, 350);
  }

  function scroller() {
    return document.querySelector('.pbv-scroller');
  }

  function editableBlocks() {
    const root = scroller();
    if (!root) return [];
    return Array.from(root.querySelectorAll('[data-eid]'))
      .filter((el) => !el.querySelector('[data-eid]'));
  }

  function enterEditing() {
    editing = true;
    document.body.classList.add('pbv-editing');
    editableBlocks().forEach((el) => {
      el.contentEditable = 'true';
      el.spellcheck = false;
    });
    const root = scroller();
    root.addEventListener('input', onInput);
    root.addEventListener('keydown', onKeydown);
    root.addEventListener('paste', onPaste);
    root.addEventListener('drop', onDrop);
    root.addEventListener('click', onLinkClick);
    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('click', onFocusIn);
    root.addEventListener('scroll', placeBlockbar, { passive: true });
    window.addEventListener('resize', placeBlockbar);
    document.addEventListener('keydown', onSaveShortcut);
    ui.toggle.textContent = '편집 끝내기';
    setStatus('고칠 글자를 클릭하세요');
    refreshSave();
  }

  async function exitEditing() {
    if (dirty.size && !(await saveChanges())) return;
    editing = false;
    location.reload();
  }

  function onInput(e) {
    const el = e.target.closest && e.target.closest('[data-eid]');
    if (!el) return;
    const eid = el.dataset.eid;
    dirty.add(eid);
    scroller().querySelectorAll(`[data-eid="${eid}"]`).forEach((f) => f.classList.add('pbv-edited'));
    setStatus(`저장 안 한 수정 ${dirty.size}곳`);
    refreshSave();
  }

  // Enter can't create a new paragraph here (the source position of every
  // block must stay fixed), so it inserts a line break instead.
  function onKeydown(e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && e.target.isContentEditable) {
      e.preventDefault();
      const el = e.target.closest('[data-eid]');
      if (el && blockToolsAllowed(el)) blockOp(el, 'insert', el.dataset.etag === 'li' ? 'item' : 'p');
      return;
    }
    if (e.key === 'Enter' && e.target.isContentEditable) {
      e.preventDefault();
      document.execCommand('insertLineBreak');
    }
  }

  function onPaste(e) {
    if (!e.target.isContentEditable && !e.target.closest('[contenteditable="true"]')) return;
    e.preventDefault();
    const text = (e.clipboardData && e.clipboardData.getData('text/plain')) || '';
    document.execCommand('insertText', false, text.replace(/\r?\n+/g, ' '));
  }

  function onDrop(e) {
    if (e.target.closest && e.target.closest('[contenteditable="true"]')) e.preventDefault();
  }

  function onLinkClick(e) {
    const a = e.target.closest && e.target.closest('a[href]');
    if (a && a.isContentEditable) e.preventDefault();
  }

  function onSaveShortcut(e) {
    if (!(e.ctrlKey || e.metaKey)) return;
    const k = e.key.toLowerCase();
    if (k === 's') {
      e.preventDefault();
      saveChanges();
    } else if ((k === 'b' || k === 'k') && e.target.isContentEditable) {
      e.preventDefault();
      const el = e.target.closest('[data-eid]');
      if (el) bbTarget = el;
      if (k === 'b') toggleWrap('strong');
      else editLink();
    }
  }

  function cleanHtml(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll('*').forEach((n) => {
      Array.from(n.attributes).forEach((a) => {
        if (PAGED_ATTR_RE.test(a.name) || a.name === 'contenteditable' || a.name === 'spellcheck') {
          n.removeAttribute(a.name);
        }
      });
      if (n.getAttribute('style') === '') n.removeAttribute('style');
      if (n.classList.length) {
        Array.from(n.classList).forEach((c) => { if (/^pagedjs_|^pbv-/.test(c)) n.classList.remove(c); });
        if (!n.classList.length) n.removeAttribute('class');
      }
    });
    return clone.innerHTML;
  }

  // A block Paged.js split across pages exists as several fragments that
  // share one data-eid; their contents joined in order are the source text.
  function collectChanges(eids) {
    const root = scroller();
    return eids.map((eid) => {
      const frags = Array.from(root.querySelectorAll(`[data-eid="${eid}"]`));
      return { eid: Number(eid), tag: frags[0].dataset.etag, html: frags.map(cleanHtml).join('') };
    });
  }

  // ───────── 블록 도구 막대 ─────────
  const INSERT_TYPES = [
    ['p', '문단', 'Ctrl+Enter'], ['h2', '소제목'], ['h3', '작은 제목'], ['list', '목록'], ['olist', '번호 목록'],
    ['checklist', '체크리스트'], ['prompt', '프롬프트 상자'], ['image', '그림 자리'], ['table', '표'],
  ];
  const RETYPES = [['p', '문단'], ['h2', '소제목'], ['h3', '작은 제목']];
  let bb = null;
  let bbTarget = null;
  let bbMenu = null;

  function blockToolsAllowed(el) {
    return !!el.closest('section.chapter') && !el.closest('.opener, header');
  }

  function unitOf(el) {
    let u = el;
    while (u.parentElement && !(u.parentElement.matches('section') || u.parentElement.matches('.pagedjs_page_content > div'))) u = u.parentElement;
    return u;
  }

  function ensureBlockbar() {
    if (bb) return bb;
    bb = document.createElement('div');
    bb.className = 'pbv-blockbar';
    bb.style.position = 'fixed';
    bb.hidden = true;
    bb.innerHTML =
      '<span data-mode="block" style="display:contents">' +
      '<button type="button" data-a="add" title="아래에 블록 추가">＋ 추가</button>' +
      '<button type="button" data-a="item" title="목록 항목 추가">＋ 항목</button>' +
      '<span class="sep"></span>' +
      '<button type="button" data-a="up" title="위로">↑</button>' +
      '<button type="button" data-a="down" title="아래로">↓</button>' +
      '<button type="button" data-a="type" title="종류 바꾸기">종류</button>' +
      '<span class="sep"></span>' +
      '<button type="button" data-a="bold" title="굵게 (Ctrl+B)"><b>B</b></button>' +
      '<button type="button" data-a="mark" title="형광펜"><span style="background:#ffe066;color:#1c1b19;padding:0 3px;border-radius:2px">형광펜</span></button>' +
      '<button type="button" data-a="link" title="링크 (Ctrl+K)">링크</button>' +
      '<span class="sep"></span>' +
      '<button type="button" data-a="delete" title="이 블록 지우기">지우기</button>' +
      '</span>' +
      '<span data-mode="struct" style="display:contents">' +
      '<button type="button" data-a="add-chapter" title="이 뒤에 새 장 추가">＋ 새 장</button>' +
      '<button type="button" data-a="add-appendix" title="이 뒤에 새 부록 추가">＋ 부록</button>' +
      '<button type="button" data-a="add-part" title="이 뒤에 새 파트 추가">＋ 새 파트</button>' +
      '<span class="sep"></span>' +
      '<button type="button" data-a="delete-section">이 장 지우기</button>' +
      '</span>';
    bb.addEventListener('mousedown', (e) => e.preventDefault());
    bb.addEventListener('click', (e) => {
      const a = e.target.closest('[data-a]');
      if (!a || !bbTarget) return;
      const act = a.dataset.a;
      if (act === 'bold') return toggleWrap('strong');
      if (act === 'mark') return toggleWrap('mark');
      if (act === 'link') return editLink();
      if (act === 'add-chapter' || act === 'add-appendix' || act === 'add-part') return structureOp(bbTarget, act);
      if (act === 'delete-section') {
        const what = sectionKindLabel(bbTarget);
        if (!confirm(`이 ${what}을(를) 통째로 지울까요?\n차례와 번호도 함께 고칩니다. (수정 기록에서 되돌릴 수 있습니다)`)) return;
        return structureOp(bbTarget, act);
      }
      if (act === 'add') return openMenu(a, INSERT_TYPES.map(([t, l, k]) => ({ label: l, kbd: k, run: () => blockOp(bbTarget, 'insert', t) })));
      if (act === 'type') return openMenu(a, RETYPES.map(([t, l]) => ({ label: l, on: bbTarget.dataset.etag === t, run: () => blockOp(bbTarget, 'retype', t) })));
      if (act === 'item') return blockOp(bbTarget, 'insert', 'item');
      if (act === 'delete') {
        const isItem = bbTarget.dataset.etag === 'li';
        if (!confirm(isItem ? '이 목록 항목을 지울까요?' : '이 블록을 통째로 지울까요?\n(수정 기록에서 되돌릴 수 있습니다)')) return;
        return blockOp(bbTarget, 'delete');
      }
      blockOp(bbTarget, act);
    });
    document.body.appendChild(bb);
    return bb;
  }

  function openMenu(btn, items) {
    closeMenu();
    bbMenu = document.createElement('div');
    bbMenu.className = 'pbv-blockmenu';
    bbMenu.style.position = 'fixed';
    items.forEach((it) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = '<span' + (it.on ? ' class="on"' : '') + '>' + it.label + '</span>' + (it.kbd ? '<kbd>' + it.kbd + '</kbd>' : '');
      b.addEventListener('mousedown', (e) => e.preventDefault());
      b.addEventListener('click', () => { closeMenu(); it.run(); });
      bbMenu.appendChild(b);
    });
    document.body.appendChild(bbMenu);
    const r = btn.getBoundingClientRect();
    const h = bbMenu.offsetHeight;
    bbMenu.style.left = Math.min(r.left, innerWidth - bbMenu.offsetWidth - 8) + 'px';
    bbMenu.style.top = (r.bottom + 4 + h > innerHeight ? r.top - h - 4 : r.bottom + 4) + 'px';
    setTimeout(() => document.addEventListener('mousedown', closeMenuOutside, true), 0);
  }
  function closeMenuOutside(e) {
    if (bbMenu && !bbMenu.contains(e.target)) closeMenu();
  }
  function closeMenu() {
    if (bbMenu) bbMenu.remove();
    bbMenu = null;
    document.removeEventListener('mousedown', closeMenuOutside, true);
  }

  function onFocusIn(e) {
    const el = e.target.closest && e.target.closest('[data-eid]');
    if (el && el.isContentEditable) showBlockbar(el);
  }

  function structureTarget(el) {
    if (el.closest('section.toc')) return !!el.closest('li') && !!el.closest('li').querySelector('a[href^="#"]');
    return !!(el.closest('section.part') || (el.closest('section.chapter') && el.closest('.opener, header')));
  }

  function sectionKindLabel(el) {
    let sec = el.closest('section.chapter, section.part');
    const li = el.closest('section.toc li');
    if (li) return li.classList.contains('toc-part') ? '파트' : li.classList.contains('toc-ap') ? '부록' : '장';
    if (!sec) return '장';
    return sec.classList.contains('part') ? '파트' : sec.classList.contains('chapter-ap') ? '부록' : '장';
  }

  function showBlockbar(el) {
    const bar = ensureBlockbar();
    const block = blockToolsAllowed(el);
    const struct = !block && structureTarget(el);
    if (!block && !struct) { bar.hidden = true; bbTarget = null; return; }
    bbTarget = el;
    bar.querySelector('[data-mode=block]').style.display = block ? 'contents' : 'none';
    bar.querySelector('[data-mode=struct]').style.display = struct ? 'contents' : 'none';
    if (block) {
      const isLi = el.dataset.etag === 'li';
      const unit = unitOf(el);
      bar.querySelector('[data-a=item]').hidden = !isLi;
      bar.querySelector('[data-a=type]').hidden = !(unit === el && /^(p|h2|h3)$/.test(el.dataset.etag));
    } else {
      bar.querySelector('[data-a=delete-section]').textContent = '이 ' + sectionKindLabel(el) + ' 지우기';
    }
    bar.hidden = false;
    placeBlockbar();
  }

  // ───────── 글자 꾸미기 ─────────
  function selectionIn(el) {
    const sel = getSelection();
    if (!sel.rangeCount) return null;
    const r = sel.getRangeAt(0);
    return el && el.contains(r.commonAncestorContainer) ? r : null;
  }

  function markDirty(el) {
    el.dispatchEvent(new InputEvent('input', { bubbles: true }));
  }

  function ancestorTag(node, tag, stop) {
    for (let n = node.nodeType === 1 ? node : node.parentElement; n && n !== stop; n = n.parentElement) {
      if (n.tagName && n.tagName.toLowerCase() === tag) return n;
    }
    return null;
  }

  function unwrap(node) {
    const parent = node.parentNode;
    while (node.firstChild) parent.insertBefore(node.firstChild, node);
    parent.removeChild(node);
    parent.normalize();
  }

  // 선택한 글자를 <strong>/<mark>/<a>로 감싸거나, 이미 감싸져 있으면 풉니다.
  function toggleWrap(tag, attrs) {
    const el = bbTarget || (document.activeElement && document.activeElement.closest && document.activeElement.closest('[data-eid]'));
    const r = selectionIn(el);
    if (!r) return;
    const existing = ancestorTag(r.commonAncestorContainer, tag, el) || (tag === 'strong' && ancestorTag(r.commonAncestorContainer, 'b', el));
    if (existing && !attrs) { unwrap(existing); markDirty(el); return; }
    if (r.collapsed) { setStatus('먼저 꾸밀 글자를 드래그해서 고르세요'); return; }
    const w = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => w.setAttribute(k, v));
    w.appendChild(r.extractContents());
    w.querySelectorAll(tag).forEach(unwrap);
    r.insertNode(w);
    const sel = getSelection();
    sel.removeAllRanges();
    const nr = document.createRange();
    nr.selectNodeContents(w);
    sel.addRange(nr);
    markDirty(el);
  }

  function editLink() {
    const el = bbTarget;
    const r = selectionIn(el);
    if (!r) return;
    const a = ancestorTag(r.commonAncestorContainer, 'a', el);
    const cur = a ? a.getAttribute('href') : '';
    const url = prompt('링크 주소를 넣으세요 (비우면 링크를 뺍니다)\n예: https://example.com 또는 책 안의 #c02', cur || 'https://');
    if (url === null) return;
    const v = url.trim();
    if (a) {
      if (!v || v === 'https://') unwrap(a);
      else a.setAttribute('href', v);
      markDirty(el);
      return;
    }
    if (!v || v === 'https://') return;
    if (!/^(https?:\/\/|mailto:|#)/i.test(v)) { alert('https://, mailto:, # 으로 시작하는 주소만 넣을 수 있어요.'); return; }
    toggleWrap('a', { href: v });
  }

  async function structureOp(el, op) {
    if (saving) return;
    if (dirty.size && !(await saveChanges())) return;
    setStatus('바꾸는 중…');
    try {
      const data = await post({ op, eid: Number(el.dataset.eid) }, '/__structure');
      sessionStorage.setItem(ANCHOR_KEY, JSON.stringify({ file: info.file, eid: data.anchor, select: data.select }));
      dirty.clear();
      location.reload();
    } catch (err) {
      setStatus('');
      alert(err.message || err);
    }
  }

  function placeBlockbar() {
    if (!bb || bb.hidden || !bbTarget) return;
    if (!document.contains(bbTarget)) { bb.hidden = true; return; }
    const r = bbTarget.getBoundingClientRect();
    const top = r.top - bb.offsetHeight - 6;
    const minTop = (scroller()?.getBoundingClientRect().top || 0) + 4;
    bb.style.top = Math.max(minTop, top < minTop ? r.bottom + 6 : top) + 'px';
    bb.style.left = Math.max(8, Math.min(r.left, innerWidth - bb.offsetWidth - 8)) + 'px';
    bb.style.visibility = r.bottom < minTop || r.top > innerHeight ? 'hidden' : '';
  }

  async function blockOp(el, op, type) {
    if (saving) return;
    closeMenu();
    if (dirty.size && !(await saveChanges())) return;
    setStatus('바꾸는 중…');
    try {
      const data = await post({ op, eid: Number(el.dataset.eid), type }, '/__blocks');
      info.version = data.version;
      sessionStorage.setItem(ANCHOR_KEY, JSON.stringify({ file: info.file, eid: data.anchor, select: data.select }));
      dirty.clear();
      location.reload();
    } catch (err) {
      setStatus('');
      alert(err.message || err);
    }
  }

  async function post(body, url) {
    const res = await fetch(url || '/__edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ file: info.file, version: info.version }, body)),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || ('저장 실패 (' + res.status + ')'));
    return data;
  }

  async function saveChanges() {
    if (saving) return false;
    if (!dirty.size) return true;
    saving = true;
    refreshSave();
    setStatus('저장 중…');
    const eids = Array.from(dirty);
    try {
      const data = await post({ changes: collectChanges(eids) });
      info.version = data.version;
      if (data.tocSynced) tocSynced = true;
      eids.forEach((eid) => {
        dirty.delete(eid);
        scroller().querySelectorAll(`[data-eid="${eid}"]`).forEach((f) => f.classList.remove('pbv-edited'));
      });
      setStatus(`저장했습니다 (${new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })})${tocSynced ? ' · 차례도 함께 고침, 편집을 끝내면 반영' : ''}`);
      return true;
    } catch (err) {
      setStatus('저장 실패');
      alert(err.message || err);
      return false;
    } finally {
      saving = false;
      refreshSave();
    }
  }

  function refreshSave() {
    if (!ui) return;
    ui.save.disabled = saving || !dirty.size;
    ui.save.textContent = dirty.size ? `저장 (${dirty.size})` : '저장';
  }

  function setStatus(text) {
    if (ui) ui.status.textContent = text;
  }

  window.__bookEditor = {
    collectChanges, post, editableBlocks, saveChanges,
    discard: () => dirty.clear(),
    isEditing: () => editing,
  };
})();
