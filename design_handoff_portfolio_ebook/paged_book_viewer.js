// Reader UI for the `make_a_paged_book` skill: toolbar + thumbnail
// sidebar + page stack on top of Paged.js. Pins iframe height to the
// viewport so a 50-page book doesn't balloon to 55000px in the parent's
// scrollHeight reporter.
(function () {
  'use strict';

  if (window.__pbv_loaded) return;
  window.__pbv_loaded = true;

  const SIDEBAR_WIDTH = 200;
  const MIN_SPREAD_WIDTH = 600;   // below this, spread mode degrades to single
  const STORAGE_KEY_MODE = 'pbv:mode';
  const STORAGE_KEY_SIDEBAR = 'pbv:sidebar';

  function whenPaged(cb) {
    if (window.Paged && window.Paged.registerHandlers) return cb();
    let tries = 0;
    const t = setInterval(() => {
      if (window.Paged && window.Paged.registerHandlers) {
        clearInterval(t);
        cb();
      } else if (++tries > 200) {
        clearInterval(t);
        console.warn('[paged_book_viewer] Paged.js never loaded; viewer disabled');
      }
    }, 50);
  }

  whenPaged(() => {
    class PagedBookHandler extends window.Paged.Handler {
      afterRendered() { attach(); }
    }
    window.Paged.registerHandlers(PagedBookHandler);

    // Fallback when afterRendered is missed (viewer registered too late).
    // Watch `.pagedjs_page` (children — the container appears empty
    // first), attach once the count stops growing for ~200ms. Pages the
    // chunker adds AFTER attach are caught by setupChunkerLateWatcher.
    let tries = 0;
    let lastCount = -1;
    let stable = 0;
    const poll = setInterval(() => {
      if (attached) { clearInterval(poll); return; }
      const count = document.querySelectorAll('.pagedjs_page').length;
      if (count > 0 && count === lastCount) {
        stable++;
        if (stable >= 4) {  // ~200ms with no new pages → chunker done
          clearInterval(poll);
          attach();
          return;
        }
      } else {
        lastCount = count;
        stable = 0;
      }
      if (++tries > 400) {  // 20s ceiling
        clearInterval(poll);
        if (count > 0) attach();
      }
    }, 50);
  });

  // Explicit attach for authors using PagedConfig.after (recommended for
  // books with formulas/footnotes/page-break-before:right where the poll
  // fallback could fire mid-chunker). Idempotent + folds in late pages.
  window.__pbv_attach = function () {
    if (!attached) attach();
    else appendLatePages();
  };

  let attached = false;
  // Module-level so appendLatePages can extend them after attach.
  let pagesTracked = [];
  let thumbsListEl = null;
  let activePageObserver = null;
  let thumbsLazyObserver = null;
  function attach() {
    if (attached) return;
    const pages = Array.from(document.querySelectorAll('.pagedjs_page'));
    if (!pages.length) return;
    attached = true;
    pagesTracked = pages.slice();

    clampDocumentHeight();
    buildShell(pages);
    setMode(loadMode(pages.length));
    setSidebarCollapsed(loadSidebar());
    setupActivePageTracker(pages);
    setupKeyboard();
    setupResize();
    setupTocClicks();
    setupPrintHooks();
    setupChunkerLateWatcher();
    setupUserScrollDetect();
    applyViewportFit();
  }

  function setupUserScrollDetect() {
    const scroller = document.querySelector('.pbv-scroller');
    if (!scroller) return;
    const release = () => { if (pendingNavTarget >= 0) releaseNavLock(); };
    scroller.addEventListener('wheel', release, { passive: true });
    scroller.addEventListener('touchstart', release, { passive: true });
    // pointerdown covers mouse scrollbar drag (no wheel/touch event).
    scroller.addEventListener('pointerdown', release, { passive: true });
  }

  // Catch pages the chunker adds after attach: the 200ms-stability
  // attach window can fire mid-chunk if Paged.js pauses between batches.
  // The trailing call closes the gap between attach() snapshotting and
  // the observer registering.
  function setupChunkerLateWatcher() {
    const pagesEl = document.querySelector('.pbv-scroller .pagedjs_pages');
    if (!pagesEl || typeof MutationObserver === 'undefined') return;
    const mo = new MutationObserver(() => appendLatePages());
    mo.observe(pagesEl, { childList: true });
    appendLatePages();
  }

  function appendLatePages() {
    const fresh = Array.from(document.querySelectorAll('.pbv-scroller .pagedjs_page'));
    if (fresh.length <= pagesTracked.length) return;
    const newPages = fresh.slice(pagesTracked.length);
    const startIdx = pagesTracked.length;
    pagesTracked = fresh;
    const total = document.querySelector('[data-pbv-total]');
    if (total) total.textContent = String(fresh.length);
    newPages.forEach((page, k) => {
      const idx = startIdx + k;
      if (thumbsListEl) {
        const cell = makeThumbCell(page, idx);
        thumbsListEl.appendChild(cell);
        if (thumbsLazyObserver) thumbsLazyObserver.observe(cell);
      }
      if (activePageObserver) activePageObserver.observe(page);
    });
    if (fresh.length >= 2) {
      const sp = document.querySelector('[data-pbv-spread-btn]');
      if (sp) sp.style.display = '';
    }
  }

  // Clamp via class so CSS @media print can release it cleanly — see
  // `html.pbv-clamp` rule + setupPrintHooks.
  function clampDocumentHeight() {
    document.documentElement.classList.add('pbv-clamp');
    document.body.classList.add('pbv-clamp');
    document.body.style.margin = '0';
  }

  function buildShell(pages) {
    const pagesEl = document.querySelector('.pagedjs_pages');
    if (!pagesEl) return;

    const main = document.createElement('div');
    main.className = 'pbv-main';

    const scroller = document.createElement('div');
    scroller.className = 'pbv-scroller';

    pagesEl.parentNode.insertBefore(main, pagesEl);
    scroller.appendChild(pagesEl);
    main.appendChild(scroller);

    document.body.insertBefore(buildSidebar(pages), main);
    document.body.insertBefore(buildToolbar(pages.length), document.body.firstChild);
    document.body.classList.add('pbv-shell');
  }

  function buildToolbar(pageCount) {
    const bar = document.createElement('header');
    bar.className = 'pbv-toolbar';

    // SVG innerHTML is a static literal — no interpolation, no XSS sink.
    const toggle = document.createElement('button');
    toggle.className = 'pbv-btn pbv-sidebar-toggle';
    toggle.setAttribute('aria-label', 'Toggle pages panel');
    toggle.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16"' +
      ' aria-hidden="true"><path d="M2 3h12M2 8h12M2 13h12"' +
      ' stroke="currentColor" stroke-width="1.5" fill="none"/></svg>';
    toggle.addEventListener('click', () => {
      setSidebarCollapsed(!document.body.classList.contains('pbv-sidebar-collapsed'));
    });

    const title = document.createElement('div');
    title.className = 'pbv-title';
    title.textContent = document.title || '';

    const modes = document.createElement('div');
    modes.className = 'pbv-modes';
    modes.setAttribute('role', 'tablist');
    const modeBtns = [
      { mode: 'single', label: 'Single page', text: 'Single' },
      { mode: 'spread', label: 'Two-page spread', text: 'Spread' },
      { mode: 'thumb',  label: 'Thumbnail grid', text: 'Grid' },
    ];
    for (const m of modeBtns) {
      const b = document.createElement('button');
      b.className = 'pbv-btn';
      b.dataset.mode = m.mode;
      b.setAttribute('aria-label', m.label);
      b.textContent = m.text;
      if (m.mode === 'spread') b.dataset.pbvSpreadBtn = '';
      b.addEventListener('click', () => setMode(m.mode));
      modes.appendChild(b);
    }

    const counter = document.createElement('div');
    counter.className = 'pbv-counter';
    const cur = document.createElement('span');
    cur.dataset.pbvCurrent = '';
    cur.textContent = '1';
    const total = document.createElement('span');
    total.dataset.pbvTotal = '';
    total.textContent = String(pageCount);
    counter.appendChild(cur);
    counter.appendChild(document.createTextNode(' / '));
    counter.appendChild(total);

    bar.appendChild(toggle);
    bar.appendChild(title);
    bar.appendChild(modes);
    bar.appendChild(counter);

    if (pageCount < 2) {
      const sp = bar.querySelector('[data-pbv-spread-btn]');
      if (sp) sp.style.display = 'none';
    }
    return bar;
  }

  function makeThumbCell(page, i) {
    // data-page-number flows through textContent only (CodeQL js/xss-through-dom).
    const num = page.getAttribute('data-page-number') || String(i + 1);
    const cell = document.createElement('button');
    cell.className = 'pbv-thumb';
    cell.dataset.pbvThumb = String(i);
    cell.setAttribute('aria-label', 'Go to page ' + String(num));
    const preview = document.createElement('span');
    preview.className = 'pbv-thumb-preview';
    preview.dataset.pbvThumbPreview = String(i);
    const numEl = document.createElement('span');
    numEl.className = 'pbv-thumb-num';
    numEl.textContent = String(num);
    cell.appendChild(preview);
    cell.appendChild(numEl);
    cell.addEventListener('click', () => goToPage(i));
    return cell;
  }

  function buildSidebar(pages) {
    const aside = document.createElement('aside');
    aside.className = 'pbv-sidebar';
    aside.style.width = SIDEBAR_WIDTH + 'px';
    const list = document.createElement('div');
    list.className = 'pbv-thumbs';
    pages.forEach((page, i) => list.appendChild(makeThumbCell(page, i)));
    aside.appendChild(list);
    thumbsListEl = list;
    scheduleThumbBuilds(list);
    return aside;
  }

  // Lazy thumb clones via IntersectionObserver (upfront cloning is janky
  // on long books). Reads pagesTracked so late pages find their source.
  function scheduleThumbBuilds(list) {
    const built = new Set();
    const build = (idx) => {
      if (built.has(idx)) return;
      const page = pagesTracked[idx];
      if (!page) return;
      built.add(idx);
      const slot = list.querySelector(`[data-pbv-thumb-preview="${idx}"]`);
      if (!slot) return;
      const clone = page.cloneNode(true);
      clone.style.transformOrigin = 'top left';
      clone.style.pointerEvents = 'none';
      slot.appendChild(clone);
      requestAnimationFrame(() => {
        const w = slot.clientWidth || 160;
        const ph = page.getBoundingClientRect().height || 1100;
        const pw = page.getBoundingClientRect().width || 793;
        const scale = w / pw;
        clone.style.transform = `scale(${scale})`;
        slot.style.height = Math.round(ph * scale) + 'px';
      });
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const idx = +e.target.dataset.pbvThumb;
          build(idx);
        }
      });
    }, { root: list.parentElement, rootMargin: '200px' });
    list.querySelectorAll('[data-pbv-thumb]').forEach(el => io.observe(el));
    thumbsLazyObserver = io;
  }

  function setMode(mode) {
    if (mode === 'spread' && window.innerWidth < MIN_SPREAD_WIDTH) {
      mode = 'single';
    }
    document.body.classList.remove('pbv-mode-single', 'pbv-mode-spread', 'pbv-mode-thumb');
    document.body.classList.add('pbv-mode-' + mode);
    document.querySelectorAll('[data-mode]').forEach(b => {
      b.classList.toggle('pbv-active', b.dataset.mode === mode);
    });
    try { localStorage.setItem(STORAGE_KEY_MODE, mode); } catch (_) { /* private mode */ }
    applyViewportFit();
  }

  function loadMode(pageCount) {
    let mode = 'single';
    try { mode = localStorage.getItem(STORAGE_KEY_MODE) || 'single'; } catch (_) { /* ignore */ }
    if (pageCount < 2 && mode === 'spread') mode = 'single';
    return mode;
  }

  function setSidebarCollapsed(collapsed) {
    document.body.classList.toggle('pbv-sidebar-collapsed', collapsed);
    try { localStorage.setItem(STORAGE_KEY_SIDEBAR, collapsed ? '1' : '0'); } catch (_) { /* ignore */ }
  }

  function loadSidebar() {
    try { return localStorage.getItem(STORAGE_KEY_SIDEBAR) === '1'; } catch (_) { return false; }
  }

  // lockNavTo pins the active-thumb to the nav destination during smooth
  // scroll (otherwise 1→7 flashes 2→3→4→5→6). 1500ms watchdog OR any
  // user-initiated scroll input (wheel/touch/keyboard) releases it so
  // manual scroll during the window updates the counter normally.
  let pendingNavTarget = -1;
  let pendingNavTimer = null;
  function setActivePage(idx) {
    const pages = document.querySelectorAll('.pbv-scroller .pagedjs_page');
    if (!pages[idx]) return;
    const counterCur = document.querySelector('[data-pbv-current]');
    if (counterCur) counterCur.textContent = pages[idx].getAttribute('data-page-number') || (idx + 1);
    document.querySelectorAll('.pbv-thumb').forEach((el, i) => {
      el.classList.toggle('pbv-active', i === idx);
    });
  }
  function releaseNavLock() {
    pendingNavTarget = -1;
    if (pendingNavTimer) { clearTimeout(pendingNavTimer); pendingNavTimer = null; }
  }
  function lockNavTo(idx) {
    pendingNavTarget = idx;
    setActivePage(idx);
    if (pendingNavTimer) clearTimeout(pendingNavTimer);
    pendingNavTimer = setTimeout(releaseNavLock, 1500);
  }

  function goToPage(idx) {
    // Scope to `.pbv-scroller`: the sidebar deep-clones pages for thumbs
    // and lives earlier in the DOM; an unscoped query hits clones first
    // and scrollIntoView would scroll the sidebar, not the main viewport.
    const pages = document.querySelectorAll('.pbv-scroller .pagedjs_page');
    if (!pages[idx]) return;
    if (document.body.classList.contains('pbv-mode-thumb')) {
      setMode('single');
      requestAnimationFrame(() => goToPage(idx));
      return;
    }
    lockNavTo(idx);
    pages[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function setupActivePageTracker(pages) {
    const io = new IntersectionObserver((entries) => {
      if (document.body.classList.contains('pbv-mode-thumb')) return;
      let best = null;
      entries.forEach(e => {
        if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
      });
      if (!best || !best.isIntersecting) return;
      // Use pagesTracked (module-level) so appendLatePages additions index right.
      const idx = pagesTracked.indexOf(best.target);
      if (idx < 0) return;
      // Lock active-thumb to the nav target until the watchdog releases.
      if (pendingNavTarget >= 0 && idx !== pendingNavTarget) return;
      setActivePage(idx);
    }, { root: document.querySelector('.pbv-scroller'), threshold: [0.25, 0.5, 0.75] });
    pages.forEach(p => io.observe(p));
    activePageObserver = io;
  }

  function setupKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (e.target && /^(input|textarea|select)$/i.test(e.target.tagName)) return;
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { nudge(-1); e.preventDefault(); }
      else if (e.key === 'ArrowRight' || e.key === 'PageDown') { nudge(1); e.preventDefault(); }
      else if (e.key === '1') setMode('single');
      else if (e.key === '2') setMode('spread');
      else if (e.key === '3') setMode('thumb');
      else if (e.key === 'Home') goToPage(0);
      else if (e.key === 'End') {
        const pages = document.querySelectorAll('.pbv-scroller .pagedjs_page');
        goToPage(pages.length - 1);
      }
    });
  }

  function nudge(dir) {
    // Mid-viewport heuristic for single/spread modes (counter would mirror
    // the nav-lock target). Thumb mode: many tiles are simultaneously
    // visible at zoom=0.22 so the heuristic picks randomly; fall back to
    // the counter, which preserves the last page from before thumb mode.
    if (!pagesTracked.length) return;
    let cur = 0;
    if (document.body.classList.contains('pbv-mode-thumb')) {
      const counter = +(document.querySelector('[data-pbv-current]')?.textContent || 1);
      cur = Math.max(0, counter - 1);
    } else {
      const scroller = document.querySelector('.pbv-scroller');
      if (!scroller) return;
      const sRect = scroller.getBoundingClientRect();
      const mid = sRect.top + sRect.height / 2;
      let bestDist = Infinity;
      pagesTracked.forEach((p, i) => {
        const r = p.getBoundingClientRect();
        const c = r.top + r.height / 2;
        const d = Math.abs(c - mid);
        if (d < bestDist) { bestDist = d; cur = i; }
      });
    }
    goToPage(Math.max(0, cur + dir));
  }

  let resizeRaf = 0;
  function setupResize() {
    window.addEventListener('resize', () => {
      cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        if (document.body.classList.contains('pbv-mode-spread') &&
            window.innerWidth < MIN_SPREAD_WIDTH) {
          setMode('single');
        } else {
          applyViewportFit();
        }
      });
    });
  }

  // Browser's default anchor scroll targets documentElement, which we
  // pin to overflow:hidden — so #-links no-op without this handler.
  function setupTocClicks() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      if (!a.closest('.pagedjs_page')) return;
      // Sidebar thumb clones have the same anchors; thumb button handles them.
      if (a.closest('.pbv-sidebar')) return;
      const id = a.getAttribute('href').slice(1);
      if (!id) return;
      const scroller = document.querySelector('.pbv-scroller');
      if (!scroller) return;
      // Scope query to scroller — getElementById would hit the sidebar clone first.
      const target = scroller.querySelector('#' + CSS.escape(id)) ||
        scroller.querySelector('[id="' + CSS.escape(id) + '"]');
      if (!target) return;
      e.preventDefault();
      const hostPage = target.closest('.pagedjs_page');
      const wasThumb = document.body.classList.contains('pbv-mode-thumb');
      if (wasThumb) setMode('single');
      if (hostPage) {
        const pages = [...document.querySelectorAll('.pbv-scroller .pagedjs_page')];
        const targetIdx = pages.indexOf(hostPage);
        if (targetIdx >= 0) lockNavTo(targetIdx);
      }
      const doScroll = () => {
        // Anchor coords (not host page) so intra-page links land right.
        const targetRect = target.getBoundingClientRect();
        const scrollerRect = scroller.getBoundingClientRect();
        const top = scroller.scrollTop + (targetRect.top - scrollerRect.top);
        scroller.scrollTo({ top, behavior: 'smooth' });
      };
      // Two frames after a mode switch: grid → single needs a layout
      // pass before rects stabilise. Otherwise one frame is enough.
      if (wasThumb) requestAnimationFrame(() => requestAnimationFrame(doScroll));
      else requestAnimationFrame(doScroll);
    });
  }

  // Release clamp + hide chrome so Chrome's print pipeline sees the full
  // doc height. matchMedia('print').change OSCILLATES true/false between
  // per-page snapshots — only RELEASE on matches=true; afterprint is the
  // sole restore signal, else later pages snapshot with the clamp back.
  function setupPrintHooks() {
    const releaseClamp = () => {
      document.documentElement.classList.remove('pbv-clamp');
      document.body.classList.remove('pbv-clamp');
      document.body.classList.add('pbv-printing');
    };
    const restoreClamp = () => {
      document.documentElement.classList.add('pbv-clamp');
      document.body.classList.add('pbv-clamp');
      document.body.classList.remove('pbv-printing');
    };
    window.addEventListener('beforeprint', releaseClamp);
    window.addEventListener('afterprint', restoreClamp);
    // Cmd/Ctrl+P pre-release as defense-in-depth in case beforeprint races
    // the print snapshot. No watchdog: if print dialog never opens we leak
    // pbv-printing state (toolbar hidden) — rare edge case, reload fixes.
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'p' || e.key === 'P') &&
          !e.shiftKey && !e.altKey) {
        releaseClamp();
      }
    });
    if (window.matchMedia) {
      const mql = window.matchMedia('print');
      const handler = (e) => { if (e.matches) releaseClamp(); };
      if (mql.addEventListener) mql.addEventListener('change', handler);
      else if (mql.addListener) mql.addListener(handler);
    }
  }

  function applyViewportFit() {
    const pagesEl = document.querySelector('.pagedjs_pages');
    const scroller = document.querySelector('.pbv-scroller');
    if (!pagesEl || !scroller) return;
    // Re-measure the natural page width by reading the first .pagedjs_page;
    // Paged.js sets it from @page size in CSS so it's already mm→px.
    const firstPage = pagesEl.querySelector('.pagedjs_page');
    if (!firstPage) return;
    const pageW = firstPage.getBoundingClientRect().width || 793;
    const slotW = scroller.clientWidth - 40;  // padding budget
    const isThumb = document.body.classList.contains('pbv-mode-thumb');
    const isSpread = document.body.classList.contains('pbv-mode-spread');
    const need = isSpread ? pageW * 2 + 20 : pageW;
    if (isThumb) {
      pagesEl.style.transform = '';
      return;
    }
    if (slotW < need) {
      const scale = slotW / need;
      pagesEl.style.transform = `scale(${scale})`;
      pagesEl.style.transformOrigin = 'top center';
    } else {
      pagesEl.style.transform = '';
    }
  }
})();
