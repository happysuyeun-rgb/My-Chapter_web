(() => {
  const SUPPORTED_EXT = new Set(['txt', 'md', 'markdown', 'pdf', 'docx']);

  const state = {
    method: null,
    source: null,
    meta: { title: '', subtitle: '', author: '' }
  };

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

  function showStep(name) {
    panels.forEach((panel) => { panel.hidden = panel.dataset.step !== name; });
    stepLabel.textContent = name === 'method' ? '제작 방식' : name === 'input' ? '원고 입력' : '책 기본정보';
    if (name === 'meta') {
      titleInput.focus();
    }
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

  function sourceLabel() {
    if (!state.source) return '아직 사용할 원고를 선택하지 않았습니다.';
    if (state.source.kind === 'file') return '현재 사용할 원고: ' + state.source.file.name;
    return '현재 사용할 원고: 붙여넣은 텍스트';
  }

  function syncInputState() {
    inputChoice.textContent = sourceLabel();
    inputNext.disabled = !state.source;
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

  function discardImportSource() {
    state.source = null;
    resetFileControl();
    textInput.value = '';
    syncInputState();
    clearError();
  }

  function selectMethod(method) {
    if (!['empty', 'import'].includes(method)) return;
    if (state.method === 'import' && method === 'empty') {
      discardImportSource();
    }
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
    if (!SUPPORTED_EXT.has(ext)) {
      return 'TXT, MD, PDF, DOCX 파일만 넣을 수 있어요.';
    }
    if (!file.size) {
      return '비어 있는 파일은 사용할 수 없어요.';
    }
    return '';
  }

  function useFile(file) {
    clearError();
    const error = validateFile(file);
    if (error) {
      state.source = null;
      resetFileControl();
      syncInputState();
      showError(error);
      return;
    }

    state.source = { kind: 'file', file };
    textInput.value = '';
    syncInputState();
  }

  function useText(value) {
    clearError();
    if (!value.trim()) {
      if (state.source?.kind === 'text') state.source = null;
      syncInputState();
      return;
    }

    state.source = { kind: 'text', text: value };
    resetFileControl();
    syncInputState();
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
    state.method = null;
    state.source = null;
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
    syncInputState();
    clearError();
  });

  textInput.addEventListener('input', () => useText(textInput.value));

  inputBack.addEventListener('click', () => showStep('method'));

  inputNext.addEventListener('click', () => {
    if (!state.source) return;
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
