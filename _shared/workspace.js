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
  let lastPdf = null;

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

  const stage = document.querySelector('.ws-stage');

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
      const bookVisible = next === 'manuscript' || next === 'cover' || next === 'preview';
      panel.hidden = name === 'manuscript' ? !bookVisible : name !== next;
    });
    stage.classList.toggle('show-cover', next === 'cover');
    stage.classList.toggle('show-preview', next === 'preview');
    setPreviewChrome(next === 'preview');
    if (next === 'cover') showCoverPage();
    if (next === 'preview') syncPreviewStatus();
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
    setPreviewChrome(tab === 'preview');
    setTimeout(() => { fillCoverForm(); refreshCoverImage(); syncPreviewStatus(); }, 0);
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

  function leaveToLibrary(event) {
    if (!unsaved()) return;
    if (!confirm('저장하지 않은 수정이 있습니다. 서재로 나갈까요?')) event.preventDefault();
  }

  libraryLink.addEventListener('click', leaveToLibrary);
  document.querySelector('#done-library').addEventListener('click', leaveToLibrary);

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

  const COVER_COLORS = ['#1C1B19', '#1F2A44', '#2D3B2F', '#5A2E2A', '#3B2F4A', '#F1EEE7'];
  const coverTitle = document.querySelector('#cover-title');
  const coverSubtitle = document.querySelector('#cover-subtitle');
  const coverAuthor = document.querySelector('#cover-author');
  const coverStatus = document.querySelector('#cover-status');
  const coverError = document.querySelector('#cover-error');
  const coverSave = document.querySelector('#cover-save');
  const coverImage = document.querySelector('#cover-image');
  const coverEmpty = document.querySelector('#cover-empty');
  const coverClear = document.querySelector('#cover-clear');
  const coverColors = document.querySelector('#cover-colors');
  let savedCopy = { title: '', subtitle: '', author: '' };
  let coverBusy = false;

  coverColors.innerHTML = ['', ...COVER_COLORS].map((color) =>
    `<button class="cover-swatch${color ? '' : ' none'}" type="button" role="radio" aria-checked="false" data-cover-color="${color}" title="${color || '기본'}"${color ? ` style="background:${color}"` : ''}></button>`
  ).join('');

  function setCoverStatus(state, text) {
    coverStatus.dataset.state = state;
    coverStatus.textContent = text;
  }

  function currentCopy() {
    return {
      title: coverTitle.value.trim(),
      subtitle: coverSubtitle.value.trim(),
      author: coverAuthor.value.trim()
    };
  }

  function copyDirty() {
    const now = currentCopy();
    return now.title !== savedCopy.title || now.subtitle !== savedCopy.subtitle || now.author !== savedCopy.author;
  }

  function syncCoverSave() {
    coverSave.disabled = coverBusy || !copyDirty() || !currentCopy().title;
  }

  function fillCoverForm() {
    const doc = editorDoc();
    if (!doc || copyDirty()) return;
    const textOf = (selector) => [...doc.querySelectorAll(selector)].map((el) => el.textContent.trim()).find(Boolean) || '';
    const title = textOf('.cover h1') || doc.title?.trim() || '';
    const subtitle = textOf('.cover .kicker') || textOf('.tp-sub');
    const author = doc.querySelector('meta[name="author"]')?.content?.trim() || '';
    coverTitle.value = title;
    coverSubtitle.value = subtitle;
    coverAuthor.value = author;
    savedCopy = { title, subtitle, author };
    const style = doc.querySelector('#book-cover-color')?.textContent || '';
    const found = style.match(/background:\s*(#[0-9A-Fa-f]{6})/);
    const color = found ? found[1].toUpperCase() : '';
    coverColors.querySelectorAll('[data-cover-color]').forEach((button) => {
      button.setAttribute('aria-checked', String(button.dataset.coverColor.toUpperCase() === color));
    });
    syncCoverSave();
  }

  function refreshCoverImage() {
    coverImage.onload = () => {
      coverImage.hidden = false;
      coverEmpty.hidden = true;
      coverClear.disabled = false;
    };
    coverImage.onerror = () => {
      coverImage.hidden = true;
      coverEmpty.hidden = false;
      coverClear.disabled = true;
    };
    coverImage.src = '/__cover?file=' + encodeURIComponent(file) + '&v=' + Date.now();
  }

  function showCoverPage() {
    const scroller = editorDoc()?.querySelector('.pbv-scroller');
    if (scroller) scroller.scrollTop = 0;
    fillCoverForm();
    refreshCoverImage();
  }

  function reloadBook() {
    try { frame.contentWindow.location.reload(); }
    catch { frame.src = urlFor(file); }
  }

  function showCoverError(err) {
    setCoverStatus('error', '오류');
    coverError.hidden = false;
    coverError.textContent = err.message || String(err);
  }

  async function postCover(url, body) {
    coverBusy = true;
    coverError.hidden = true;
    setCoverStatus('unsaved', '저장 중');
    syncCoverSave();
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || '표지를 저장하지 못했습니다.');
      setCoverStatus('saved', '저장됨');
      return out;
    } catch (err) {
      showCoverError(err);
      throw err;
    } finally {
      coverBusy = false;
      syncCoverSave();
    }
  }

  function downscaleCover(picked) {
    const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/avif'];
    return new Promise((resolve, reject) => {
      if (!allowed.includes(picked.type)) {
        reject(new Error('PNG, JPEG, WebP 이미지만 쓸 수 있어요.'));
        return;
      }
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 1600 / img.naturalHeight);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(img.src);
        resolve(canvas.toDataURL('image/webp', 0.86));
      };
      img.onerror = () => reject(new Error('이미지를 읽지 못했습니다.'));
      img.src = URL.createObjectURL(picked);
    });
  }

  document.querySelector('#cover-file').addEventListener('change', async (event) => {
    const picked = event.target.files && event.target.files[0];
    event.target.value = '';
    if (!picked) return;
    try {
      const data = await downscaleCover(picked);
      await postCover('/__book/cover', { file, data });
      refreshCoverImage();
      reloadBook();
    } catch (err) {
      if (coverError.hidden) showCoverError(err);
    }
  });

  coverClear.addEventListener('click', async () => {
    try {
      await postCover('/__book/cover', { file, data: null });
      refreshCoverImage();
      reloadBook();
    } catch { /* 오류는 표지 상태에 표시됩니다. */ }
  });

  coverColors.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-cover-color]');
    if (!button || coverBusy) return;
    const color = button.dataset.coverColor;
    try {
      await postCover('/__book/meta', { file, coverColor: color });
      coverColors.querySelectorAll('[data-cover-color]').forEach((item) => {
        item.setAttribute('aria-checked', String(item === button));
      });
      reloadBook();
    } catch { /* 오류는 표지 상태에 표시됩니다. */ }
  });

  [coverTitle, coverSubtitle, coverAuthor].forEach((input) => {
    input.addEventListener('input', () => {
      coverError.hidden = true;
      if (copyDirty()) setCoverStatus('unsaved', '저장 안 한 수정');
      else setCoverStatus('saved', '저장됨');
      syncCoverSave();
    });
  });

  document.querySelector('#cover-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const copy = currentCopy();
    if (!copy.title) {
      showCoverError(new Error('책 제목을 입력해 주세요.'));
      return;
    }
    const author = copy.author || '저자';
    try {
      await postCover('/__book/info', {
        file,
        title: copy.title,
        subtitle: copy.subtitle,
        author
      });
      savedCopy = { title: copy.title, subtitle: copy.subtitle, author };
      coverAuthor.value = author;
      syncCoverSave();
      reloadBook();
    } catch { /* 오류는 표지 상태에 표시됩니다. */ }
  });

  syncCoverSave();

  const previewStatus = document.querySelector('#preview-status');
  const previewModes = [...document.querySelectorAll('[data-preview-mode]')];
  const pdfStatus = document.querySelector('#pdf-status');
  const modeLabel = { single: 'Single', spread: 'Spread', thumb: 'Grid' };

  function ensurePreviewStyle(doc) {
    if (doc.getElementById('mc-preview-style')) return;
    const style = doc.createElement('style');
    style.id = 'mc-preview-style';
    style.textContent = [
      'body.mc-preview .pbv-edit-btn,',
      'body.mc-preview .pbv-save-btn,',
      'body.mc-preview .pbv-edit-status,',
      'body.mc-preview .pbv-library-btn,',
      'body.mc-preview .pbv-blockbar,',
      'body.mc-preview .pbv-blockmenu,',
      'body.mc-preview .bt-tool-btn,',
      'body.mc-preview .pbv-pdf-btn,',
      'body.mc-preview .bt-panel,',
      'body.mc-preview .bt-dlg { display: none !important; }',
      'body.mc-preview image-slot { pointer-events: none; }'
    ].join('\n');
    doc.head.appendChild(style);
  }

  function setPreviewChrome(on) {
    const doc = editorDoc();
    if (!doc || !doc.body) return;
    ensurePreviewStyle(doc);
    doc.body.classList.toggle('mc-preview', on);
    if (on) {
      doc.querySelectorAll('[contenteditable="true"]').forEach((el) => {
        el.dataset.mcEditable = '1';
        el.contentEditable = 'false';
      });
    } else {
      doc.querySelectorAll('[data-mc-editable]').forEach((el) => {
        el.contentEditable = 'true';
        delete el.dataset.mcEditable;
      });
    }
  }

  function viewerMode() {
    const body = editorDoc()?.body;
    if (!body) return '';
    if (body.classList.contains('pbv-mode-thumb')) return 'thumb';
    if (body.classList.contains('pbv-mode-spread')) return 'spread';
    if (body.classList.contains('pbv-mode-single')) return 'single';
    return '';
  }

  function syncPreviewStatus() {
    const doc = editorDoc();
    const mode = viewerMode();
    const current = doc?.querySelector('[data-pbv-current]')?.textContent?.trim() || '';
    const total = doc?.querySelector('[data-pbv-total]')?.textContent?.trim() || '';
    const pages = doc?.querySelectorAll('.pagedjs_page').length || 0;
    previewModes.forEach((button) => {
      button.setAttribute('aria-selected', String(button.dataset.previewMode === mode));
    });
    if (!pages || !current || !total) {
      previewStatus.textContent = '쪽을 준비하고 있어요';
      return;
    }
    previewStatus.textContent = (modeLabel[mode] || 'Single') + ' · ' + current + ' / ' + total;
  }

  previewModes.forEach((button) => {
    button.addEventListener('click', () => {
      editorDoc()?.querySelector('[data-mode="' + button.dataset.previewMode + '"]')?.click();
      setTimeout(syncPreviewStatus, 50);
    });
  });
  setInterval(() => { if (tab === 'preview') syncPreviewStatus(); }, 400);

  function setPdfStatus(state, text) {
    pdfStatus.dataset.state = state;
    pdfStatus.textContent = text;
  }

  const donePanel = document.querySelector('#panel-export-complete');
  const doneTitle = document.querySelector('#done-title');
  const doneFile = document.querySelector('#done-file');
  const doneStatus = document.querySelector('#done-status');
  const doneError = document.querySelector('#done-error');
  const doneDownload = document.querySelector('#done-download');
  const doneBack = document.querySelector('#done-back');
  const doneAgain = document.querySelector('#done-again');

  function pdfFilename() {
    return (titleEl.textContent || 'book') + '.pdf';
  }

  function setDoneError(message) {
    doneError.hidden = !message;
    doneError.textContent = message || '';
  }

  function hideExportComplete() {
    document.body.classList.remove('ws-export-complete');
    donePanel.hidden = true;
  }

  function showExportComplete() {
    const title = titleEl.textContent || '';
    const name = lastPdf?.filename || pdfFilename();
    doneTitle.textContent = title;
    doneFile.textContent = name;
    doneStatus.textContent = '전자책 PDF 준비 완료';
    setDoneError('');
    donePanel.hidden = false;
    document.body.classList.add('ws-export-complete');
  }

  function downloadLastPdf() {
    if (!lastPdf?.url) {
      setDoneError('내려받을 PDF가 없습니다.');
      return;
    }
    const a = document.createElement('a');
    a.href = lastPdf.url;
    a.download = lastPdf.filename || pdfFilename();
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function makeEbookPdf() {
    if (pdfBusy) return;
    if (unsaved()) {
      hideExportComplete();
      setPdfStatus('error', '저장하지 않은 수정이 있습니다. 저장한 뒤 PDF를 만들어 주세요.');
      return;
    }
    hideExportComplete();
    pdfBusy = true;
    pdfBtn.disabled = true;
    doneAgain.disabled = true;
    setPdfStatus('loading', 'PDF를 만들고 있어요');
    try {
      const res = await fetch('/__pdf?file=' + encodeURIComponent(file));
      if (!res.ok) throw new Error((await res.text()) || 'PDF를 만들지 못했습니다.');
      const blob = await res.blob();
      if (lastPdf?.url) URL.revokeObjectURL(lastPdf.url);
      lastPdf = {
        blob,
        url: URL.createObjectURL(blob),
        filename: pdfFilename(),
        title: titleEl.textContent || ''
      };
      setPdfStatus('done', '완료');
      showExportComplete();
    } catch (err) {
      if (lastPdf?.url) {
        URL.revokeObjectURL(lastPdf.url);
        lastPdf = null;
      }
      hideExportComplete();
      setPdfStatus('error', err.message || 'PDF를 만들지 못했습니다.');
    } finally {
      pdfBusy = false;
      pdfBtn.disabled = false;
      doneAgain.disabled = false;
    }
  }

  pdfBtn.addEventListener('click', () => { makeEbookPdf(); });
  doneDownload.addEventListener('click', () => { downloadLastPdf(); });
  doneBack.addEventListener('click', () => { hideExportComplete(); });
  doneAgain.addEventListener('click', () => { makeEbookPdf(); });
})();
