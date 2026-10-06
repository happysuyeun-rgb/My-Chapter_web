(() => {
  const KEY = 'my-chapter:wizard:method';
  const cards = [...document.querySelectorAll('[data-method]')];
  const continueBtn = document.querySelector('#continue');
  const cancelBtn = document.querySelector('#cancel');

  function select(method) {
    sessionStorage.setItem(KEY, method);
    cards.forEach((card) => {
      const on = card.dataset.method === method;
      card.classList.toggle('selected', on);
      card.setAttribute('aria-checked', String(on));
    });

    // Phase 1 boundary: selection only. Phase 2 will connect the next step.
    continueBtn.disabled = true;
  }

  cards.forEach((card) => {
    card.addEventListener('click', () => select(card.dataset.method));
  });

  cancelBtn.addEventListener('click', () => {
    sessionStorage.removeItem(KEY);
    location.href = '/';
  });

  const saved = sessionStorage.getItem(KEY);
  if (saved && cards.some((card) => card.dataset.method === saved)) {
    select(saved);
  }
})();
