(() => {
  const SUPPORTED_EXT = new Set(['txt', 'md', 'markdown', 'pdf', 'docx']);

  const state = {
    method: null,
    source: null,
    parseResult: null,
    parseState: 'idle',
    meta: { title: '', subtitle: '', author: '' }
  };

  let parseTimer = null;
  let parseSequence = 0;

  const panels = [...document.querySelectorAll('[data-step]')];
  const methodCards = [...document.querySelectorAll('[data-method]')];
  const stepLabel = document.querySelector('#step-label');

  const methodContinue = document.querySelector('#method-continue');
  const inputBack = document.querySelector('#input-back');
  const inputNext = document.querySelector('#input-next');
  const fileInput = document.querySelector('#manuscript-file');
  const dropzone = document.querySelector('#dropzone');
  const pickedFile = document.querySelector('#picked-file');
  const pickedFileName = document.querySelector('#picked-file-name');
  const pickedFileSize = document.querySelector('#picked-file-size');
  const removeFile = document.querySelector('#remove-file');
  const textInput = document.querySelector('#manuscript-text');
  const inputChoice = document.querySelector('#input-choice');
  const inputError = document.querySelector('#input-error');

  const metaForm = document.querySelector('#meta-form');
  const titleInput = document.querySelector('#book-title');
  const subtitleInput = document.querySelector('#book-subtitle');
  const authorInput = document.querySelector('#book-author');
  const metaBack = document.querySelector('#meta-back');
  const metaNext = document.querySelector('#meta-next');
  const metaBlocked = document.querySelector('#meta-blocked');

  // Phase 3: S05 now parses in memory only. No book/source files are created here.
  const inputIntro = document.querySelector('#step-input .intro > p:last-child');
  if (inputIntro) inputIntro.textContent = '파일을 선택하거나 글을 붙여 넣으세요. 원고 구조만 분석하며, 이 단계에서는 책 파일을 만들지 않습니다.';

  function showStep(name) {
    panels.forEach((panel) => { panel.hidden = panel.dataset.step !== name; });
    stepLabel.textContent = name === 'method' ? '제작 방식' : name === 'input' ? '원고 입력' : '책 기본정보';
    if (name === 'meta') titleInput.focus();
  }

  function clearError() {
    inputError.hidden = true;
    inputError.textContent = '';
  }

  function showError(message) {
    inputError.textContent = message;
    inputError.hidden = false;
  }

  function sizeText(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  }

  function statsText(stats = {}) {
    const bits = [];
    if (stats.parts) bits.push('파트 ' + stats.parts);
    if (stats.chapters) bits.push('장 ' + stats.chapters);
    if (stats.appendices) bits.push('부록 ' + stats.appendices);
    if (Number.isFinite(stats.paragraphs)) bits.push('문단 ' + stats.paragraphs);
    return bits.join(' · ');
  }

  function sourceLabel() {
    if (state.parseState === 'loading') return '원고 읽는 중…';
    if (state.parseState === 'success') {
      const detail = statsText(state.parseResult?.stats);
      return '원고 분석 완료' + (detail ? ' · ' + detail : '');
    }
    if (!state.source) return '아직 사용할 원고를 선택하지 않았습니다.';
    if (state.source.kind === 'file') return '현재 사용할 원고: ' + state.source.file.name;
    return '현재 사용할 원고: 붙여넣은 텍스트';
  }

  function syncInputState() {
    inputChoice.textContent = sourceLabel();
    inputNext.disabled = !state.parseResult || state.parseState !== 'success';
    const file = state.source?.kind === 'file' ? state.source.file : null;
    pickedFile.hidden = !file;
    if (file) {
      pickedFileName.textContent = file.name;
      pickedFileSize.textContent = sizeText(file.size);
    } else {
      pickedFileName.textContent = '';
      pickedFileSize.textContent = '';
    }
  }

  function resetFileControl() {
    fileInput.value = '';
  }

  function invalidateParse() {
    parseSequence++;
    clearTimeout(parseTimer);
    state.parseResult = null;
    state.parseState = state.source ? 'idle' : 'idle';
    syncInputState();
  }

  function discardImportSource() {
    state.source = null;
    state.parseResult = null;
    state.parseState = 'idle';
    parseSequence++;
    clearTimeout(parseTimer);
    resetFileControl();
    textInput.value = '';
    syncInputState();
    clearError();
  }

  function selectMethod(method) {
    if (!['empty', 'import'].includes(method)) return;
    if (state.method === 'import' && method === 'empty') discardImportSource();
    state.method = method;
    methodCards.forEach((card) => {
      const on = card.dataset.method === method;
      card.classList.toggle('selected', on);
      card.setAttribute('aria-checked', String(on));
    });
    methodContinue.disabled = false;
  }

  function validateFile(file) {
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!SUPPORTED_EXT.has(ext)) return 'TXT, MD, PDF, DOCX 파일만 넣을 수 있어요.';
    if (!file.size) return '비어 있는 파일은 사용할 수 없어요.';
    return '';
  }

  function readBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
      reader.onerror = () => reject(new Error('파일을 읽지 못했습니다.'));
      reader.readAsDataURL(file);
    });
  }

  async function parseCurrentSource() {
    const source = state.source;
    if (!source) return;

    const seq = ++parseSequence;
    state.parseResult = null;
    state.parseState = 'loading';
    clearError();
    syncInputState();

    try {
      let body;
      if (source.kind === 'file') {
        body = { name: source.file.name, data: await readBase64(source.file), title: state.meta.title };
      } else {
        body = { text: source.text, title: state.meta.title };
      }

      if (seq !== parseSequence || source !== state.source) return;

      const res = await fetch('/__parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || '원고를 읽지 못했습니다.');

      if (seq !== parseSequence || source !== state.source) return;
      state.parseResult = out;
      state.parseState = 'success';
      syncInputState();
    } catch (err) {
      if (seq !== parseSequence || source !== state.source) return;
      state.parseResult = null;
      state.parseState = 'error';
      syncInputState();
      showError(err.message || String(err));
    }
  }

  function scheduleParse(delay = 0) {
    clearTimeout(parseTimer);
    invalidateParse();
    if (!state.source) return;
    parseTimer = setTimeout(parseCurrentSource, delay);
  }

  function useFile(file) {
    clearError();
    const error = validateFile(file);
    if (error) {
      state.source = null;
      invalidateParse();
      resetFileControl();
      showError(error);
      return;
    }

    state.source = { kind: 'file', file };
    textInput.value = '';
    syncInputState();
    scheduleParse(0);
  }

  function useText(value) {
    clearError();
    if (!value.trim()) {
      if (state.source?.kind === 'text') state.source = null;
      invalidateParse();
      return;
    }

    state.source = { kind: 'text', text: value };
    resetFileControl();
    syncInputState();
    scheduleParse(500);
  }

  function syncMeta() {
    state.meta = {
      title: titleInput.value,
      subtitle: subtitleInput.value,
      author: authorInput.value
    };
    metaNext.disabled = !titleInput.value.trim();
    if (titleInput.value.trim()) metaBlocked.hidden = true;
  }

  function cancelWizard() {
    parseSequence++;
    clearTimeout(parseTimer);
    state.method = null;
    state.source = null;
    state.parseResult = null;
    state.parseState = 'idle';
    state.meta = { title: '', subtitle: '', author: '' };
    location.href = '/';
  }

  methodCards.forEach((card) => {
    card.addEventListener('click', () => selectMethod(card.dataset.method));
  });

  methodContinue.addEventListener('click', () => {
    if (!state.method) return;
    showStep(state.method === 'import' ? 'input' : 'meta');
  });

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (file) useFile(file);
  });

  ['dragenter', 'dragover'].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.add('dragging');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.remove('dragging');
    });
  });

  dropzone.addEventListener('drop', (event) => {
    const file = event.dataTransfer?.files?.[0];
    if (file) useFile(file);
  });

  removeFile.addEventListener('click', () => {
    if (state.source?.kind === 'file') state.source = null;
    resetFileControl();
    invalidateParse();
    clearError();
  });

  textInput.addEventListener('input', () => useText(textInput.value));

  inputBack.addEventListener('click', () => showStep('method'));

  inputNext.addEventListener('click', () => {
    if (!state.parseResult || state.parseState !== 'success') return;
    showStep('meta');
  });

  metaForm.addEventListener('input', syncMeta);

  metaBack.addEventListener('click', () => {
    syncMeta();
    showStep(state.method === 'import' ? 'input' : 'method');
  });

  metaNext.addEventListener('click', () => {
    syncMeta();
    if (!state.meta.title.trim()) return;
    metaBlocked.hidden = false;
  });

  document.querySelectorAll('[data-cancel]').forEach((button) => {
    button.addEventListener('click', cancelWizard);
  });

  syncInputState();
  syncMeta();
  showStep('method');
})();
