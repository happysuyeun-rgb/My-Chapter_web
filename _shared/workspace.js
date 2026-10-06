(() => {
  const file = WORKSPACE && WORKSPACE.file;
  const frame = document.querySelector('#panel-manuscript');
  const titleEl = document.querySelector('#ws-title');
  const statusEl = document.querySelector('#ws-status');
  const saveBtn = document.querySelector('#ws-save');
  const pdfBtn = document.querySelector('#ws-pdf');
  const libraryLink = document.querySelector('#ws-library');
  const tabs = [...document.querySelectorAll('[data-tab]')];
  const panels = {
    manuscript: frame,
    design: document.querySelector('#panel-design'),
    cover: document.querySelector('#panel-cover'),
    preview: document.querySelector('#panel-preview')
  };

  let tab = 'manuscript';
  let pdfBusy = false;

  const urlFor = (rel) => '/' + String(rel).split('/').map(encodeURIComponent).join('/');

  function editorDoc() {
    try { return frame.contentDocument; } catch { return null; }
  }

  function editorSaveButton() {
    return editorDoc()?.querySelector('.pbv-save-btn') || null;
  }

  function unsaved() {
    const button = editorSaveButton();
    return !!(button && !button.disabled);
  }

  function syncSave() {
    const doc = editorDoc();
    const button = doc?.querySelector('.pbv-save-btn') || null;
    const status = doc?.querySelector('.pbv-edit-status')?.textContent?.trim() || '';
    const dirty = !!(button && !button.disabled);
    saveBtn.disabled = !dirty;
    saveBtn.textContent = dirty && button.textContent ? button.textContent : '저장';
    if (!doc || doc.readyState === 'loading') {
      statusEl.dataset.state = 'loading';
      statusEl.textContent = '원고 여는 중';
      return;
    }
    statusEl.dataset.state = dirty ? 'unsaved' : 'saved';
    statusEl.textContent = status || (dirty ? '저장 안 한 수정' : '저장됨');
  }

  function showTab(next) {
    if (!panels[next] || next === tab) return;
    if (tab === 'manuscript' && next !== 'manuscript' && unsaved()) {
      const leave = confirm('저장하지 않은 수정이 있습니다. 다른 탭으로 이동할까요?');
      if (!leave) return;
    }
    tab = next;
    tabs.forEach((button) => {
      const on = button.dataset.tab === next;
      button.setAttribute('aria-selected', String(on));
    });
    Object.entries(panels).forEach(([name, panel]) => {
      panel.hidden = name !== next;
    });
  }

  if (!file) {
    titleEl.textContent = '책을 찾지 못했습니다';
    statusEl.dataset.state = 'unsaved';
    statusEl.textContent = '서재로 돌아가 주세요';
    return;
  }

  frame.addEventListener('load', () => {
    let path = '';
    try { path = frame.contentWindow.location.pathname; } catch { return; }
    if (path === '/' || path === '/index.html') {
      location.href = '/';
      return;
    }
    const title = editorDoc()?.title?.trim();
    if (title) {
      titleEl.textContent = title;
      document.title = title + ' · My Chapter';
    }
    syncSave();
  });

  frame.src = urlFor(file);
  setInterval(syncSave, 400);

  tabs.forEach((button) => {
    button.addEventListener('click', () => showTab(button.dataset.tab));
  });

  saveBtn.addEventListener('click', () => {
    editorSaveButton()?.click();
    syncSave();
  });

  libraryLink.addEventListener('click', (event) => {
    if (!unsaved()) return;
    if (!confirm('저장하지 않은 수정이 있습니다. 서재로 나갈까요?')) event.preventDefault();
  });

  const designNote = document.querySelector('#design-note');
  const designError = document.querySelector('#design-error');
  const designApply = document.querySelector('#design-apply');
  const themeSample = document.querySelector('#theme-sample');
  const themeChoices = [...document.querySelectorAll('[data-theme-choice]')];
  let appliedTheme = 'practical';
  let chosenTheme = 'practical';
  let themeBusy = false;

  function themeLabel(id) {
    return id === 'minimal' ? 'Minimal' : 'Practical';
  }

  function showThemeChoice(id) {
    chosenTheme = id === 'minimal' ? 'minimal' : 'practical';
    themeChoices.forEach((button) => {
      const on = button.dataset.themeChoice === chosenTheme;
      button.setAttribute('aria-checked', String(on));
    });
    if (themeSample) themeSample.dataset.theme = chosenTheme;
    if (designApply) designApply.disabled = themeBusy || chosenTheme === appliedTheme;
    if (designNote) {
      designNote.textContent = '현재 디자인: ' + themeLabel(appliedTheme) +
        (chosenTheme === appliedTheme ? '' : ' · 선택: ' + themeLabel(chosenTheme));
    }
  }

  async function loadTheme() {
    try {
      const res = await fetch('/__theme?file=' + encodeURIComponent(file));
      const out = await res.json().catch(() => ({}));
      appliedTheme = out.theme === 'minimal' ? 'minimal' : 'practical';
    } catch {
      appliedTheme = 'practical';
    }
    showThemeChoice(appliedTheme);
  }

  async function applyChosenTheme() {
    if (themeBusy || chosenTheme === appliedTheme) return;
    themeBusy = true;
    designError.hidden = true;
    designApply.disabled = true;
    try {
      const res = await fetch('/__theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file, theme: chosenTheme })
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || '디자인을 적용하지 못했습니다.');
      appliedTheme = out.theme === 'minimal' ? 'minimal' : 'practical';
      frame.src = urlFor(file);
    } catch (err) {
      designError.hidden = false;
      designError.textContent = err.message || String(err);
    } finally {
      themeBusy = false;
      showThemeChoice(chosenTheme);
    }
  }

  themeChoices.forEach((button) => {
    button.addEventListener('click', () => showThemeChoice(button.dataset.themeChoice));
  });
  designApply?.addEventListener('click', applyChosenTheme);
  loadTheme();

  pdfBtn.addEventListener('click', async () => {
    if (pdfBusy) return;
    pdfBusy = true;
    pdfBtn.disabled = true;
    const label = pdfBtn.textContent;
    pdfBtn.textContent = 'PDF 만드는 중';
    try {
      const res = await fetch('/__pdf?file=' + encodeURIComponent(file));
      if (!res.ok) throw new Error(await res.text());
      const a = document.createElement('a');
      a.href = URL.createObjectURL(await res.blob());
      a.download = (titleEl.textContent || 'book') + '.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 10000);
    } catch (err) {
      statusEl.dataset.state = 'unsaved';
      statusEl.textContent = err.message || 'PDF를 만들지 못했습니다.';
    } finally {
      pdfBusy = false;
      pdfBtn.disabled = false;
      pdfBtn.textContent = label;
    }
  });
})();
