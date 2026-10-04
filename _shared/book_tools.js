// 미리보기 오른쪽에 열리는 도구 패널(기록·점검)과 내보내기 창.
// preview-server.mjs가 window.__bookEdit를 넣은 페이지에서만 동작합니다.
(function () {
  'use strict';

  const info = window.__bookEdit;
  if (!info) return;

  const style = document.createElement('style');
  style.textContent = `
    .bt-panel { position: fixed; top: var(--pbv-toolbar-h, 44px); right: 0; bottom: 0; width: min(420px, 100vw); z-index: 60;
      background: #fff; border-left: 1px solid var(--pbv-border, rgba(0,0,0,.08)); box-shadow: -12px 0 32px rgba(0,0,0,.08);
      display: flex; flex-direction: column; font: 13px/1.5 Pretendard, system-ui, sans-serif; color: #1c1b19;
      transform: translateX(105%); transition: transform .18s ease; }
    .bt-panel.open { transform: none; }
    .bt-head { display: flex; align-items: center; gap: 8px; padding: 12px 14px; border-bottom: 1px solid rgba(0,0,0,.08); }
    .bt-head h2 { margin: 0; font-size: 14px; font-weight: 700; flex: 1; }
    .bt-head button, .bt-body button { font: inherit; cursor: pointer; border: 1px solid rgba(0,0,0,.12); background: #fff; border-radius: 6px; padding: 4px 10px; }
    .bt-head button:hover, .bt-body button:hover { background: #f4f3ef; }
    .bt-body { flex: 1; overflow: auto; padding: 10px 14px 24px; }
    .bt-body .bt-primary { background: #1c1b19; color: #fff; border-color: #1c1b19; }
    .bt-body .bt-primary:hover { background: #33312d; }
    .bt-muted { color: #6b6b6b; font-size: 12px; }
    .bt-empty { color: #6b6b6b; padding: 24px 0; text-align: center; }
    .bt-list { list-style: none; margin: 0; padding: 0; }
    .bt-item { padding: 9px 10px; border-radius: 8px; cursor: pointer; display: grid; grid-template-columns: 1fr auto; gap: 2px 8px; }
    .bt-item:hover { background: #f4f3ef; }
    .bt-item.active { background: #eef1fb; }
    .bt-item b { font-weight: 600; }
    .bt-item .bt-muted { grid-column: 1 / -1; }
    .bt-badge { display: inline-block; font-size: 11px; padding: 1px 7px; border-radius: 999px; background: #f1eee7; color: #5b574f; white-space: nowrap; }
    .bt-diff { margin: 8px 0 12px; border: 1px solid rgba(0,0,0,.08); border-radius: 8px; overflow: hidden; }
    .bt-diff div { padding: 6px 10px; border-top: 1px solid rgba(0,0,0,.06); white-space: pre-wrap; word-break: break-all; font-size: 12px; }
    .bt-diff div:first-child { border-top: 0; }
    .bt-del { background: #fdeeee; color: #8a1f1f; text-decoration: line-through; text-decoration-color: rgba(138,31,31,.35); }
    .bt-add { background: #eaf6ec; color: #1d5c2a; }
    .bt-actions { display: flex; gap: 8px; align-items: center; margin: 4px 0 8px; }
    .bt-tool-btn { padding: 6px 10px; white-space: nowrap; }
    body.pbv-tiny .bt-tool-btn { padding: 5px 6px; }
    .bt-stat { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 0 0 12px; }
    .bt-stat div { background: #f4f3ef; border-radius: 8px; padding: 8px 10px; }
    .bt-stat b { display: block; font-size: 16px; }
    .bt-bar { height: 6px; background: #ece8df; border-radius: 99px; overflow: hidden; margin: 4px 0 10px; }
    .bt-bar i { display: block; height: 100%; background: #2f55d4; }
    .bt-sec { cursor: pointer; }
    .bt-filt { display: flex; flex-wrap: wrap; gap: 4px; margin: 0 0 10px; }
    .bt-filt button { font-size: 11.5px; padding: 3px 8px; border-radius: 99px; }
    .bt-filt button.on { background: #1c1b19; color: #fff; border-color: #1c1b19; }
    .bt-item.warn b::before { content: ""; }
    .bt-dlg { position: fixed; inset: 0; z-index: 70; display: flex; align-items: center; justify-content: center;
      background: rgba(28,27,25,.45); }
    .bt-dlg[hidden] { display: none; }
    .bt-dlg .box { width: min(480px, calc(100vw - 32px)); max-height: calc(100vh - 32px); overflow: auto;
      background: #fff; border-radius: 14px; padding: 20px 22px 18px; box-shadow: 0 30px 80px -20px rgba(0,0,0,.4); }
    .bt-dlg h3 { margin: 0 0 6px; font-size: 17px; }
    .bt-dlg .chs { max-height: 220px; overflow: auto; border: 1px solid rgba(0,0,0,.08); border-radius: 8px; padding: 6px 8px; margin: 8px 0 12px; }
    .bt-dlg label { display: flex; align-items: center; gap: 8px; padding: 4px 2px; font-size: 13px; }
    .bt-dlg .row { display: flex; flex-wrap: wrap; gap: 12px; margin: 0 0 12px; }
    .bt-dlg .foot { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
  `;
  document.head.appendChild(style);

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmtTime = (t) => new Date(t).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  const ago = (t) => {
    const s = (Date.now() - t) / 1000;
    if (s < 60) return '방금';
    if (s < 3600) return Math.floor(s / 60) + '분 전';
    if (s < 86400) return Math.floor(s / 3600) + '시간 전';
    return Math.floor(s / 86400) + '일 전';
  };
  async function api(path, body) {
    const res = await fetch(path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : { headers: { Accept: 'application/json' } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || ('요청 실패 (' + res.status + ')'));
    return data;
  }
  const q = (name) => '?file=' + encodeURIComponent(info.file) + (name || '');
  const hasUnsaved = () => !!document.querySelector('.pbv-scroller .pbv-edited');

  // ───────── 패널 틀 ─────────
  const panels = {};
  let panel = null;
  let current = null;

  function ensurePanel() {
    if (panel) return panel;
    panel = document.createElement('aside');
    panel.className = 'bt-panel';
    panel.style.position = 'fixed';
    panel.innerHTML = '<div class="bt-head"><h2></h2><button type="button" data-act="refresh" title="다시 불러오기">↻</button><button type="button" data-act="close" title="닫기">✕</button></div><div class="bt-body"></div>';
    panel.querySelector('[data-act=close]').onclick = closePanel;
    panel.querySelector('[data-act=refresh]').onclick = () => current && openPanel(current, true);
    document.body.appendChild(panel);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && panel.classList.contains('open')) closePanel(); });
    return panel;
  }
  function closePanel() {
    if (panel) panel.classList.remove('open');
    current = null;
  }
  async function openPanel(name, force) {
    const p = ensurePanel();
    if (current === name && !force) return closePanel();
    current = name;
    const def = panels[name];
    p.querySelector('h2').textContent = def.title;
    const body = p.querySelector('.bt-body');
    body.innerHTML = '<div class="bt-empty">불러오는 중…</div>';
    p.classList.add('open');
    try {
      await def.render(body);
    } catch (err) {
      body.innerHTML = '<div class="bt-empty">' + esc(err.message || err) + '</div>';
    }
  }

  // ───────── 기록 ─────────
  panels.history = {
    title: '수정 기록',
    async render(body) {
      const { items } = await api('/__history' + q());
      if (!items.length) {
        body.innerHTML = '<div class="bt-empty">아직 기록이 없습니다.<br><span class="bt-muted">저장할 때마다 바로 앞 상태가 여기에 남습니다.</span></div>';
        return;
      }
      body.innerHTML = '<p class="bt-muted">저장 직전 상태가 시간순으로 남아 있습니다. 항목을 누르면 그때와 지금의 차이를 보고, 그 상태로 되돌릴 수 있습니다.</p><ul class="bt-list"></ul><div class="bt-detail"></div>';
      const list = body.querySelector('.bt-list');
      const detail = body.querySelector('.bt-detail');
      items.forEach((it) => {
        const li = document.createElement('li');
        li.className = 'bt-item';
        li.innerHTML = '<b>' + esc(it.label) + ' 전</b><span class="bt-badge">' + it.changed + '곳 바뀜</span><span class="bt-muted">' + fmtTime(it.time) + ' · ' + ago(it.time) + '</span>';
        li.onclick = () => {
          list.querySelectorAll('.active').forEach((x) => x.classList.remove('active'));
          li.classList.add('active');
          li.after(detail);
          showVersion(detail, it);
        };
        list.appendChild(li);
      });
    },
  };

  async function showVersion(box, it) {
    box.innerHTML = '<div class="bt-empty">비교하는 중…</div>';
    const { diff, total } = await api('/__history/view' + q('&id=' + encodeURIComponent(it.id)));
    const rows = diff.map((d) => {
      if (d.type === 'mod') return '<div class="bt-del">' + esc(d.before) + '</div><div class="bt-add">' + esc(d.after) + '</div>';
      if (d.type === 'del') return '<div class="bt-del">' + esc(d.before) + '</div>';
      return '<div class="bt-add">' + esc(d.after) + '</div>';
    }).join('');
    box.innerHTML =
      '<div class="bt-actions"><button type="button" class="bt-primary">이 상태로 되돌리기</button><span class="bt-muted">' +
      (total ? '지금과 ' + total + '곳 다름' : '지금과 같습니다') + '</span></div>' +
      (total ? '<p class="bt-muted">빨간 줄은 그때 글, 초록 줄은 지금 글입니다.</p><div class="bt-diff">' + rows + '</div>' : '') +
      (total > diff.length ? '<p class="bt-muted">… 외 ' + (total - diff.length) + '곳</p>' : '');
    box.querySelector('.bt-primary').onclick = async () => {
      if (hasUnsaved() && !confirm('저장하지 않은 수정은 사라집니다. 계속할까요?')) return;
      if (!confirm(fmtTime(it.time) + ' 상태로 되돌릴까요?\n지금 상태도 기록에 남으므로 다시 돌아올 수 있습니다.')) return;
      await api('/__restore', { file: info.file, id: it.id });
      reloadPage();
    };
  }

  function reloadPage() {
    if (window.__bookEditor) window.__bookEditor.discard();
    location.reload();
  }

  // ───────── 점검 ─────────
  const LINT_LABEL = {
    placeholder: '빈 그림', todo: '작성 중', empty: '빈 블록', long: '긴 문장',
    spelling: '맞춤법', dup: '중복', toc: '차례', link: '링크',
  };

  function jumpTo(eid) {
    if (eid == null) return;
    const el = document.querySelector(`.pbv-scroller [data-eid="${eid}"]`);
    if (!el) return;
    el.scrollIntoView({ block: 'center', inline: 'nearest' });
    el.style.outline = '2px solid #2f55d4';
    setTimeout(() => { el.style.outline = ''; }, 1600);
  }

  panels.lint = {
    title: '원고 점검',
    async render(body) {
      const data = await api('/__lint' + q());
      const { stats, issues, counts } = data;
      const max = Math.max(1, ...stats.sections.map((s) => s.chars));
      body.innerHTML =
        '<div class="bt-stat">' +
        `<div><b>${stats.chars.toLocaleString()}</b><span class="bt-muted">글자 · 원고지 ${stats.sheets.toLocaleString()}매</span></div>` +
        `<div><b>${stats.images.filled}/${stats.images.total}</b><span class="bt-muted">그림이 들어간 자리</span></div>` +
        '</div>' +
        '<p class="bt-muted" style="margin:0 0 6px">장별 분량</p>' +
        stats.sections.map((s) =>
          `<div class="bt-sec" data-eid="${s.eid ?? ''}"><span>${esc(s.label || '')} ${esc(s.title || '')}</span>` +
          `<span class="bt-muted">${s.chars.toLocaleString()}자</span>` +
          `<div class="bt-bar"><i style="width:${Math.round(s.chars / max * 100)}%"></i></div></div>`
        ).join('') +
        '<div class="bt-filt"></div><ul class="bt-list"></ul>';
      body.querySelectorAll('.bt-sec').forEach((el) => el.onclick = () => jumpTo(el.dataset.eid === '' ? null : +el.dataset.eid));
      const types = Object.keys(LINT_LABEL).filter((t) => counts[t]);
      let filter = '';
      const filt = body.querySelector('.bt-filt');
      const list = body.querySelector('.bt-list');
      const draw = () => {
        filt.innerHTML = '<button type="button" data-t="" class="' + (filter ? '' : 'on') + '">전체 ' + issues.length + '</button>' +
          types.map((t) => `<button type="button" data-t="${t}" class="${filter === t ? 'on' : ''}">${LINT_LABEL[t]} ${counts[t]}</button>`).join('');
        const shown = issues.filter((it) => !filter || it.type === filter);
        list.innerHTML = shown.length ? '' : '<li class="bt-empty">이 종류의 항목이 없습니다.</li>';
        shown.forEach((it) => {
          const li = document.createElement('li');
          li.className = 'bt-item';
          li.innerHTML = `<b>${esc(it.message)}</b><span class="bt-badge">${esc(it.section && it.section.label || '')}</span>` +
            (it.text ? `<span class="bt-muted">${esc(it.text)}</span>` : '');
          li.onclick = () => jumpTo(it.eid);
          list.appendChild(li);
        });
      };
      filt.onclick = (e) => {
        const b = e.target.closest('[data-t]');
        if (!b) return;
        filter = b.dataset.t;
        draw();
      };
      draw();
    },
  };

  // ───────── 내보내기 창 ─────────
  function openExport() {
    const dlg = document.createElement('div');
    dlg.className = 'bt-dlg';
    dlg.innerHTML = '<div class="box"><h3>내보내기</h3><p class="bt-muted">장만 고르면 맛보기 PDF가 됩니다. 인쇄용은 재단선(사방 3mm)을 넣습니다.</p>' +
      '<div class="chs">불러오는 중…</div>' +
      '<div class="row">' +
      '<label><input type="radio" name="bt-use" value="screen" checked> 화면용 PDF</label>' +
      '<label><input type="radio" name="bt-use" value="print"> 인쇄용 PDF</label>' +
      '<label><input type="checkbox" id="bt-wm"> 초안 표시</label>' +
      '</div>' +
      '<div class="foot">' +
      '<button type="button" data-act="cancel">닫기</button>' +
      '<button type="button" data-act="web">웹 폴더 (zip)</button>' +
      '<button type="button" data-act="epub">EPUB</button>' +
      '<button type="button" class="bt-primary" data-act="pdf">PDF 받기</button>' +
      '</div></div>';
    document.body.appendChild(dlg);
    const close = () => dlg.remove();
    dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
    api('/__outline' + q()).then(({ items }) => {
      const box = dlg.querySelector('.chs');
      box.innerHTML = '<label><input type="checkbox" data-all checked> 전체</label>' +
        items.map((it) => `<label><input type="checkbox" data-id="${esc(it.id)}" checked> ${esc(it.kind === 'part' ? 'PART · ' : it.kind === 'ap' ? '부록 · ' : it.kind === 'pro' ? 'P · ' : it.kind === 'epi' ? 'E · ' : '')}${esc(it.title || it.id)}</label>`).join('');
      const all = box.querySelector('[data-all]');
      const boxes = () => [...box.querySelectorAll('[data-id]')];
      all.onchange = () => boxes().forEach((c) => { c.checked = all.checked; });
      box.addEventListener('change', (e) => {
        if (e.target.dataset.id) all.checked = boxes().every((c) => c.checked);
      });
    }).catch((err) => { dlg.querySelector('.chs').textContent = err.message; });

    const download = async (path, fallback) => {
      const res = await fetch(path);
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || await res.text());
      const a = document.createElement('a');
      a.href = URL.createObjectURL(await res.blob());
      const dispo = res.headers.get('content-disposition') || '';
      const m = dispo.match(/filename\*=UTF-8''([^;]+)/);
      a.download = m ? decodeURIComponent(m[1]) : fallback;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    };

    dlg.querySelector('.foot').onclick = async (e) => {
      const act = e.target.dataset.act;
      if (!act) return;
      if (act === 'cancel') return close();
      const btn = e.target;
      const label = btn.textContent;
      btn.disabled = true;
      btn.textContent = '만드는 중…';
      try {
        if (act === 'web') await download('/__web' + q(), 'book-웹.zip');
        else if (act === 'epub') await download('/__epub' + q(), 'book.epub');
        else if (act === 'pdf') {
          const chosen = [...dlg.querySelectorAll('[data-id]:checked')].map((c) => c.dataset.id);
          const allOn = dlg.querySelector('[data-all]')?.checked;
          const ids = (!allOn && chosen.length) ? '&ids=' + encodeURIComponent(chosen.join(',')) : '';
          const print = dlg.querySelector('[name=bt-use]:checked')?.value === 'print' ? '&print=1' : '';
          const wm = dlg.querySelector('#bt-wm')?.checked ? '&wm=1' : '';
          await download('/__pdf' + q(ids + print + wm), (document.title || 'book') + '.pdf');
        }
        close();
      } catch (err) {
        alert(err.message || err);
        btn.disabled = false;
        btn.textContent = label;
      }
    };
  }

  const waitPdf = setInterval(() => {
    const btn = document.querySelector('.pbv-pdf-btn');
    if (!btn) return;
    clearInterval(waitPdf);
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      openExport();
    }, true);
    btn.textContent = '내보내기';
    btn.setAttribute('aria-label', '내보내기');
  }, 300);

  // ───────── 도구 막대 단추 ─────────
  const order = ['history', 'lint'];
  const labels = { history: '기록', lint: '점검' };

  const waitToolbar = setInterval(() => {
    const bar = document.querySelector('.pbv-toolbar');
    const anchor = bar && (bar.querySelector('.pbv-edit-status') || bar.querySelector('.pbv-pdf-btn'));
    if (!anchor) return;
    clearInterval(waitToolbar);
    order.forEach((name) => {
      if (!panels[name]) return;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pbv-btn bt-tool-btn';
      b.textContent = labels[name];
      b.onclick = () => openPanel(name);
      bar.insertBefore(b, anchor);
    });
  }, 300);

  window.__bookTools = { openPanel, closePanel, panels, order, labels, api, esc, info, reloadPage, q, openExport };
})();
