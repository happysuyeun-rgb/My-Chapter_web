(() => {
  const SUPPORTED_EXT = new Set(['txt', 'md', 'markdown', 'pdf', 'docx']);

  const state = {
    method: null,
    source: null,
    parseResult: null,
    parseState: 'idle',
    structureDraft: null,
    structureDirty: false,
    structureConfirmed: false,
    themeId: 'practical',
    meta: { title: '', subtitle: '', author: '' }
  };

  let parseTimer = null;
  let parseSequence = 0;
  let structureSelection = null;
  let allowLeave = false;
  let generating = false;

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

  const structureSummary = document.querySelector('#structure-summary');
  const structureTree = document.querySelector('#structure-tree');
  const structureEmptyDetail = document.querySelector('#structure-empty-detail');
  const structureEditor = document.querySelector('#structure-editor');
  const structureType = document.querySelector('#structure-type');
  const structureTitle = document.querySelector('#structure-title');
  const structureUp = document.querySelector('#structure-up');
  const structureDown = document.querySelector('#structure-down');
  const structureAddSection = document.querySelector('#structure-add-section');
  const structureDelete = document.querySelector('#structure-delete');
  const structureBack = document.querySelector('#structure-back');
  const structureReselect = document.querySelector('#structure-reselect');
  const structureConfirm = document.querySelector('#structure-confirm');
  const structureError = document.querySelector('#structure-error');
  const structureMessage = document.querySelector('#structure-message');

  const themeCards = [...document.querySelectorAll('[data-theme]')];
  const themePreview = document.querySelector('#theme-preview');
  const themeBack = document.querySelector('#theme-back');
  const themeNext = document.querySelector('#theme-next');
  const themeMessage = document.querySelector('#theme-message');
  const generatePanel = document.querySelector('#step-generate');
  const generateStatus = document.querySelector('#generate-status');
  const generateDetail = document.querySelector('#generate-detail');
  const generateSteps = document.querySelector('#generate-steps');
  const generateError = document.querySelector('#generate-error');
  const generateActions = document.querySelector('#generate-actions');
  const generateBack = document.querySelector('#generate-back');
  const generateRetry = document.querySelector('#generate-retry');

  const inputIntro = document.querySelector('#step-input .intro > p:last-child');
  if (inputIntro) inputIntro.textContent = '파일을 선택하거나 글을 붙여 넣으세요. 원고 구조만 분석하며, 이 단계에서는 책 파일을 만들지 않습니다.';

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));

  function showStep(name) {
    panels.forEach((panel) => { panel.hidden = panel.dataset.step !== name; });
    const labels = {
      method: '제작 방식',
      input: '원고 입력',
      meta: '책 기본정보',
      structure: '원고 구조 확인',
      theme: '디자인 선택',
      generate: '책 만들기'
    };
    stepLabel.textContent = labels[name] || '새 책 만들기';
    if (name === 'meta') titleInput.focus();
    if (name === 'structure') renderStructure();
  }

  function clearError() {
    inputError.hidden = true;
    inputError.textContent = '';
  }

  function showError(message) {
    inputError.textContent = message;
    inputError.hidden = false;
  }

  function structureNotice(message, isError = false) {
    structureError.hidden = !isError;
    structureMessage.hidden = isError || !message;
    if (isError) {
      structureError.textContent = message;
      structureMessage.textContent = '';
    } else {
      structureMessage.textContent = message || '';
      structureError.textContent = '';
    }
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

  function clearStructureSession() {
    state.structureDraft = null;
    state.structureDirty = false;
    state.structureConfirmed = false;
    structureSelection = null;
  }

  function invalidateParse() {
    parseSequence++;
    clearTimeout(parseTimer);
    state.parseResult = null;
    state.parseState = 'idle';
    clearStructureSession();
    syncInputState();
  }

  function discardImportSource() {
    state.source = null;
    state.parseResult = null;
    state.parseState = 'idle';
    clearStructureSession();
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
    clearStructureSession();
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
      clearStructureSession();
      syncInputState();
    } catch (err) {
      if (seq !== parseSequence || source !== state.source) return;
      state.parseResult = null;
      state.parseState = 'error';
      clearStructureSession();
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

  function cloneUnits() {
    return JSON.parse(JSON.stringify(state.parseResult?.units || []));
  }

  function contentUnit(unit) {
    return !!unit && unit.kind !== 'part';
  }

  function sectionBlocks(unit) {
    return (unit?.body || []).filter((block) => block.t === 'h' && block.level === 2);
  }

  function structureStats() {
    const units = state.structureDraft || [];
    let sections = 0;
    let paragraphs = 0;
    for (const unit of units) {
      sections += sectionBlocks(unit).length;
      paragraphs += (unit.body || []).filter((block) => block.t === 'p').length;
    }
    return {
      parts: units.filter((unit) => unit.kind === 'part').length,
      chapters: units.filter((unit) => unit.kind === 'chapter').length,
      appendices: units.filter((unit) => unit.kind === 'ap').length,
      frontBack: units.filter((unit) => unit.kind === 'pro' || unit.kind === 'epi').length,
      contentUnits: units.filter(contentUnit).length,
      sections,
      paragraphs
    };
  }

  function normalizeNumbers() {
    let chapterNo = 0;
    let appendixNo = 0;
    for (const unit of state.structureDraft || []) {
      if (unit.kind === 'chapter') {
        chapterNo++;
        unit.num = chapterNo;
        unit.no = chapterNo;
      } else if (unit.kind === 'ap') {
        appendixNo++;
        unit.no = appendixNo;
      }
    }
  }

  function ensureStructureDraft() {
    if (!state.structureDraft) {
      state.structureDraft = cloneUnits();
      normalizeNumbers();
      state.structureDirty = false;
      state.structureConfirmed = false;
      structureSelection = null;
    }
    if (!structureSelection && state.structureDraft.length) {
      const first = state.structureDraft.find(contentUnit) || state.structureDraft[0];
      structureSelection = { type: 'unit', unit: first };
    }
  }

  function kindLabel(unit) {
    if (!unit) return '';
    if (unit.kind === 'part') return 'PART';
    if (unit.kind === 'pro') return 'PROLOGUE';
    if (unit.kind === 'epi') return 'EPILOGUE';
    if (unit.kind === 'ap') return 'APPENDIX';
    return 'CHAPTER';
  }

  function selectedTitle() {
    if (!structureSelection) return '';
    return structureSelection.type === 'section'
      ? structureSelection.block.text || ''
      : structureSelection.unit.title || '';
  }

  function setSelectedTitle(value) {
    if (!structureSelection) return;
    if (structureSelection.type === 'section') structureSelection.block.text = value;
    else structureSelection.unit.title = value;
  }

  function parentPart(unit) {
    const units = state.structureDraft || [];
    const index = units.indexOf(unit);
    if (index < 0 || unit.kind !== 'chapter') return null;
    for (let i = index - 1; i >= 0; i--) {
      if (units[i].kind === 'part') return units[i];
      if (units[i].kind !== 'chapter') return null;
    }
    return null;
  }

  function unitSiblings(unit) {
    const units = state.structureDraft || [];
    if (!unit) return [];
    if (unit.kind === 'part') return units.filter((item) => item.kind === 'part');
    if (unit.kind === 'chapter') {
      const parent = parentPart(unit);
      return units.filter((item) => item.kind === 'chapter' && parentPart(item) === parent);
    }
    return units.filter((item) => item.kind === unit.kind);
  }

  function splitSections(unit) {
    const body = unit.body || [];
    const starts = [];
    for (let i = 0; i < body.length; i++) {
      if (body[i].t === 'h' && body[i].level === 2) starts.push(i);
    }
    if (!starts.length) return { prefix: body.slice(), chunks: [] };
    const prefix = body.slice(0, starts[0]);
    const chunks = starts.map((start, index) => {
      const end = starts[index + 1] ?? body.length;
      return body.slice(start, end);
    });
    return { prefix, chunks };
  }

  function selectionCanMove(direction) {
    if (!structureSelection) return false;
    if (structureSelection.type === 'section') {
      const parts = splitSections(structureSelection.unit).chunks;
      const index = parts.findIndex((chunk) => chunk[0] === structureSelection.block);
      return direction < 0 ? index > 0 : index >= 0 && index < parts.length - 1;
    }
    const unit = structureSelection.unit;
    const siblings = unitSiblings(unit);
    const index = siblings.indexOf(unit);
    return direction < 0 ? index > 0 : index >= 0 && index < siblings.length - 1;
  }

  function structureValid() {
    const units = state.structureDraft || [];
    if (!units.filter(contentUnit).length) return false;
    for (const unit of units) {
      if (!String(unit.title || '').trim()) return false;
      for (const block of sectionBlocks(unit)) {
        if (!String(block.text || '').trim()) return false;
      }
    }
    return true;
  }

  function markStructureDirty() {
    state.structureDirty = true;
    state.structureConfirmed = false;
    structureNotice('');
  }

  function renderStructure() {
    ensureStructureDraft();
    const units = state.structureDraft || [];
    const stats = structureStats();

    structureSummary.innerHTML =
      '<span>파트 ' + stats.parts + '</span>' +
      '<span>장 ' + stats.chapters + '</span>' +
      '<span>부록 ' + stats.appendices + '</span>' +
      (stats.frontBack ? '<span>앞뒤글 ' + stats.frontBack + '</span>' : '') +
      '<span>소제목 ' + stats.sections + '</span>' +
      '<span>문단 ' + stats.paragraphs + '</span>';

    if (!units.length) {
      structureTree.innerHTML = '<div class="structure-empty">구조를 찾지 못했습니다. 원고를 다시 선택해 주세요.</div>';
    } else {
      let underPart = false;
      const rows = [];
      units.forEach((unit, unitIndex) => {
        if (unit.kind === 'part') underPart = true;
        else if (unit.kind !== 'chapter') underPart = false;

        const selected = structureSelection?.type === 'unit' && structureSelection.unit === unit;
        rows.push(
          '<button class="tree-item' +
          (selected ? ' selected' : '') +
          (underPart && unit.kind === 'chapter' ? ' under-part' : '') +
          '" type="button" role="treeitem" data-unit-index="' + unitIndex + '">' +
          '<span class="tree-kind">' + esc(kindLabel(unit)) + '</span>' +
          '<span class="tree-title">' + esc(unit.title || '(제목 없음)') + '</span>' +
          '</button>'
        );

        (unit.body || []).forEach((block, blockIndex) => {
          if (block.t !== 'h' || block.level !== 2) return;
          const sectionSelected = structureSelection?.type === 'section' &&
            structureSelection.unit === unit && structureSelection.block === block;
          rows.push(
            '<button class="tree-item section' + (sectionSelected ? ' selected' : '') +
            '" type="button" role="treeitem" data-unit-index="' + unitIndex +
            '" data-block-index="' + blockIndex + '">' +
            '<span class="tree-kind">SECTION</span>' +
            '<span class="tree-title">' + esc(block.text || '(제목 없음)') + '</span>' +
            '</button>'
          );
        });
      });
      structureTree.innerHTML = rows.join('');
    }

    const hasSelection = !!structureSelection;
    structureEmptyDetail.hidden = hasSelection;
    structureEditor.hidden = !hasSelection;

    if (hasSelection) {
      const unit = structureSelection.unit;
      const isSection = structureSelection.type === 'section';
      structureType.textContent = isSection ? 'SECTION' : kindLabel(unit);
      structureTitle.value = selectedTitle();
      structureUp.disabled = !selectionCanMove(-1);
      structureDown.disabled = !selectionCanMove(1);
      structureAddSection.hidden = isSection ? false : unit.kind === 'part';
      const contentUnitCount = units.filter(contentUnit).length;
      structureDelete.disabled = !isSection && contentUnit(unit) && contentUnitCount <= 1;
    }

    structureConfirm.disabled = !structureValid() || state.structureConfirmed;
    structureConfirm.textContent = state.structureConfirmed ? '구조 확정됨' : '이 구조로 책 만들기';
  }

  function selectTreeItem(unitIndex, blockIndex) {
    const unit = state.structureDraft?.[unitIndex];
    if (!unit) return;
    if (Number.isInteger(blockIndex)) {
      const block = unit.body?.[blockIndex];
      if (!block || block.t !== 'h' || block.level !== 2) return;
      structureSelection = { type: 'section', unit, block };
    } else {
      structureSelection = { type: 'unit', unit };
    }
    renderStructure();
  }

  function movePart(unit, direction) {
    const units = state.structureDraft;
    const parts = units.filter((item) => item.kind === 'part');
    const pos = parts.indexOf(unit);
    const target = parts[pos + direction];
    if (!target) return false;

    const range = (part) => {
      const start = units.indexOf(part);
      let end = start + 1;
      while (end < units.length && units[end].kind === 'chapter') end++;
      return { start, end };
    };

    const current = range(unit);
    const other = range(target);
    const chunk = units.splice(current.start, current.end - current.start);
    const insertAt = direction < 0 ? other.start : other.end - chunk.length;
    units.splice(insertAt, 0, ...chunk);
    return true;
  }

  function moveUnit(unit, direction) {
    if (unit.kind === 'part') return movePart(unit, direction);
    const units = state.structureDraft;
    const siblings = unitSiblings(unit);
    const pos = siblings.indexOf(unit);
    const target = siblings[pos + direction];
    if (!target) return false;
    const a = units.indexOf(unit);
    const b = units.indexOf(target);
    units[a] = target;
    units[b] = unit;
    return true;
  }

  function moveSection(unit, block, direction) {
    const split = splitSections(unit);
    const index = split.chunks.findIndex((chunk) => chunk[0] === block);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= split.chunks.length) return false;
    const tmp = split.chunks[index];
    split.chunks[index] = split.chunks[target];
    split.chunks[target] = tmp;
    unit.body = [...split.prefix, ...split.chunks.flat()];
    return true;
  }

  function moveSelection(direction) {
    if (!structureSelection) return;
    const moved = structureSelection.type === 'section'
      ? moveSection(structureSelection.unit, structureSelection.block, direction)
      : moveUnit(structureSelection.unit, direction);
    if (!moved) {
      structureNotice(direction < 0 ? '더 위로 옮길 수 없어요.' : '더 아래로 옮길 수 없어요.', true);
      return;
    }
    normalizeNumbers();
    markStructureDirty();
    renderStructure();
  }

  function insertIndexForChapter() {
    const units = state.structureDraft;
    if (!structureSelection) {
      const special = units.findIndex((unit) => unit.kind === 'ap' || unit.kind === 'epi');
      return special >= 0 ? special : units.length;
    }
    const unit = structureSelection.unit;
    const index = units.indexOf(unit);
    if (unit.kind === 'part') return index + 1;
    if (unit.kind === 'ap' || unit.kind === 'epi') return index;
    return index + 1;
  }

  function insertIndexForPart() {
    const units = state.structureDraft;
    const firstTail = units.findIndex((unit) => unit.kind === 'ap' || unit.kind === 'epi');
    if (structureSelection?.unit?.kind === 'part') {
      const part = structureSelection.unit;
      let index = units.indexOf(part) + 1;
      while (index < units.length && units[index].kind === 'chapter') index++;
      return index;
    }
    return firstTail >= 0 ? firstTail : units.length;
  }

  function addUnit(kind) {
    ensureStructureDraft();
    const units = state.structureDraft;
    let unit;
    let index;

    if (kind === 'part') {
      unit = { kind: 'part', title: '새 파트', body: [] };
      index = insertIndexForPart();
    } else if (kind === 'appendix') {
      unit = { kind: 'ap', title: '새 부록', body: [{ t: 'p', text: '' }] };
      const epi = units.findIndex((item) => item.kind === 'epi');
      index = epi >= 0 ? epi : units.length;
    } else {
      unit = { kind: 'chapter', title: '새 장', body: [{ t: 'p', text: '' }] };
      index = insertIndexForChapter();
    }

    units.splice(index, 0, unit);
    normalizeNumbers();
    structureSelection = { type: 'unit', unit };
    markStructureDirty();
    renderStructure();
    structureTitle.focus();
    structureTitle.select();
  }

  function addSection() {
    if (!structureSelection) return;
    const unit = structureSelection.unit;
    if (!unit || unit.kind === 'part') return;
    unit.body ||= [];
    const heading = { t: 'h', level: 2, text: '새 소제목' };
    const paragraph = { t: 'p', text: '' };

    if (structureSelection.type === 'section') {
      const split = splitSections(unit);
      const index = split.chunks.findIndex((chunk) => chunk[0] === structureSelection.block);
      split.chunks.splice(index + 1, 0, [heading, paragraph]);
      unit.body = [...split.prefix, ...split.chunks.flat()];
    } else {
      unit.body.push(heading, paragraph);
    }

    structureSelection = { type: 'section', unit, block: heading };
    markStructureDirty();
    renderStructure();
    structureTitle.focus();
    structureTitle.select();
  }

  function deleteSelection() {
    if (!structureSelection) return;
    const units = state.structureDraft;

    if (structureSelection.type === 'section') {
      if (!confirm('이 소제목을 제거할까요? 본문 문장은 남겨 둡니다.')) return;
      const unit = structureSelection.unit;
      const index = unit.body.indexOf(structureSelection.block);
      if (index >= 0) unit.body.splice(index, 1);
      structureSelection = { type: 'unit', unit };
    } else {
      const unit = structureSelection.unit;
      if (contentUnit(unit) && units.filter(contentUnit).length <= 1) {
        structureNotice('책에는 최소 한 개의 본문 단위가 필요해요.', true);
        return;
      }
      const label = unit.kind === 'part'
        ? '이 파트 구분만 제거할까요? 아래 장은 그대로 남습니다.'
        : '이 항목과 그 안의 본문을 구조에서 제거할까요?';
      if (!confirm(label)) return;
      const index = units.indexOf(unit);
      if (index >= 0) units.splice(index, 1);
      const next = units[Math.min(index, units.length - 1)] || units[0] || null;
      structureSelection = next ? { type: 'unit', unit: next } : null;
    }

    normalizeNumbers();
    markStructureDirty();
    renderStructure();
  }

  function reselectManuscript() {
    if ((state.structureDirty || state.structureConfirmed) &&
        !confirm('지금까지 수정한 구조를 버리고 원고를 다시 선택할까요? 책 기본정보는 유지됩니다.')) return;
    discardImportSource();
    structureSelection = null;
    showStep('input');
  }

  function utf8ToBase64(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  }

  function setGenerateView({ status, detail, error, busy }) {
    generateStatus.textContent = status;
    generateDetail.textContent = detail;
    generateError.hidden = !error;
    generateError.textContent = error || '';
    generateActions.hidden = busy;
    generatePanel.dataset.busy = busy ? 'true' : 'false';
    themeNext.disabled = busy;
    [...generateSteps.querySelectorAll('li')].forEach((item, index) => {
      item.classList.toggle('active', busy && index === (state.method === 'import' ? 2 : 1));
    });
  }

  async function sourcePayload() {
    if (state.source?.kind === 'file') {
      return { name: state.source.file.name, data: await readBase64(state.source.file) };
    }
    if (state.source?.kind === 'text') {
      return { name: '원고.txt', data: utf8ToBase64(state.source.text) };
    }
    return null;
  }

  async function generateBook() {
    if (generating) return;
    generating = true;
    themeMessage.hidden = true;
    showStep('generate');
    setGenerateView({
      status: '책을 만들고 있어요',
      detail: (state.method === 'import' ? '원고 구조를 적용하고 ' : '책 틀을 복사하고 ') +
        (state.themeId === 'minimal' ? 'Minimal 디자인을 넣고 있습니다' : 'Practical 디자인을 넣고 있습니다'),
      error: '',
      busy: true
    });

    try {
      syncMeta();
      const title = state.meta.title.trim();
      if (!title) throw new Error('책 제목을 입력해 주세요.');

      const body = {
        title,
        subtitle: state.meta.subtitle.trim(),
        author: state.meta.author.trim(),
        themeId: state.themeId
      };

      if (state.method === 'import') {
        if (!state.structureConfirmed || !state.structureDraft) {
          throw new Error('확정된 원고 구조가 없어요.');
        }
        body.units = JSON.parse(JSON.stringify(state.structureDraft));
        const source = await sourcePayload();
        if (source) body.source = source;
      }

      const res = await fetch('/__new-book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error || '책을 만들지 못했습니다.');
      if (!out.url && !out.file) throw new Error('만든 책 경로를 받지 못했습니다.');

      allowLeave = true;
      location.href = out.file ? ('/__workspace?file=' + encodeURIComponent(out.file)) : (out.url || '/');
    } catch (err) {
      generating = false;
      setGenerateView({
        status: '책을 만들지 못했어요',
        detail: '입력한 내용과 구조는 그대로 있습니다. 다시 시도할 수 있어요.',
        error: err.message || String(err),
        busy: false
      });
    }
  }

  function cancelWizard() {
    if (generating) return;
    allowLeave = true;
    parseSequence++;
    clearTimeout(parseTimer);
    state.method = null;
    state.source = null;
    state.parseResult = null;
    state.parseState = 'idle';
    clearStructureSession();
    state.themeId = 'practical';
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

    if (state.method === 'import') {
      if (!state.parseResult || state.parseState !== 'success') {
        metaBlocked.textContent = '원고 분석이 완료되지 않았어요. 원고 입력 단계로 돌아가 주세요.';
        metaBlocked.hidden = false;
        return;
      }
      metaBlocked.hidden = true;
      ensureStructureDraft();
      showStep('structure');
      return;
    }

    metaBlocked.hidden = true;
    showStep('theme');
  });

  structureTree.addEventListener('click', (event) => {
    const item = event.target.closest('[data-unit-index]');
    if (!item) return;
    const unitIndex = Number(item.dataset.unitIndex);
    const blockIndex = item.dataset.blockIndex === undefined ? null : Number(item.dataset.blockIndex);
    selectTreeItem(unitIndex, blockIndex);
  });

  structureTitle.addEventListener('change', () => {
    if (!structureSelection) return;
    const value = structureTitle.value.trim();
    if (!value) {
      structureTitle.value = selectedTitle();
      structureNotice('제목은 비워 둘 수 없어요.', true);
      return;
    }
    if (value === selectedTitle()) return;
    setSelectedTitle(value);
    markStructureDirty();
    renderStructure();
  });

  structureUp.addEventListener('click', () => moveSelection(-1));
  structureDown.addEventListener('click', () => moveSelection(1));
  structureAddSection.addEventListener('click', addSection);
  structureDelete.addEventListener('click', deleteSelection);

  document.querySelectorAll('[data-add-kind]').forEach((button) => {
    button.addEventListener('click', () => addUnit(button.dataset.addKind));
  });

  structureBack.addEventListener('click', () => {
    if (state.structureConfirmed &&
        !confirm('구조 확정을 풀고 책 기본정보로 돌아갈까요?')) return;
    state.structureConfirmed = false;
    structureNotice('');
    showStep('meta');
  });

  structureReselect.addEventListener('click', reselectManuscript);

  structureConfirm.addEventListener('click', () => {
    if (!structureValid()) {
      structureNotice('본문 단위와 제목을 확인해 주세요. 최소 한 개의 본문 단위가 필요합니다.', true);
      return;
    }
    state.structureConfirmed = true;
    state.structureDirty = false;
    structureNotice('');
    renderStructure();
    showStep('theme');
  });

  function selectTheme(themeId) {
    if (!['practical', 'minimal'].includes(themeId)) return;
    state.themeId = themeId;
    themeCards.forEach((card) => {
      const selected = card.dataset.theme === themeId;
      card.classList.toggle('selected', selected);
      card.setAttribute('aria-checked', String(selected));
    });
    themePreview.dataset.theme = themeId;
    themeMessage.hidden = true;
    themeMessage.textContent = '';
  }

  themeCards.forEach((card) => {
    card.addEventListener('click', () => selectTheme(card.dataset.theme));
  });

  themeBack.addEventListener('click', () => {
    themeMessage.hidden = true;
    if (state.method === 'import') {
      if (state.structureConfirmed &&
          !confirm('구조 확정을 풀고 원고 구조로 돌아갈까요?')) return;
      state.structureConfirmed = false;
      renderStructure();
      showStep('structure');
      return;
    }
    showStep('meta');
  });

  themeNext.addEventListener('click', generateBook);
  generateRetry.addEventListener('click', generateBook);
  generateBack.addEventListener('click', () => {
    if (generating) return;
    showStep('theme');
  });

  function hasUnsavedWizardWork() {
    return !!(
      state.source ||
      state.structureDraft ||
      state.meta.title.trim() ||
      state.meta.subtitle.trim() ||
      state.meta.author.trim() ||
      state.themeId !== 'practical'
    );
  }

  window.addEventListener('beforeunload', (event) => {
    if (allowLeave || !hasUnsavedWizardWork()) return;
    event.preventDefault();
    event.returnValue = '';
  });

  document.querySelectorAll('[data-cancel]').forEach((button) => {
    button.addEventListener('click', cancelWizard);
  });

  selectTheme(state.themeId);
  syncInputState();
  syncMeta();
  showStep('method');
})();
