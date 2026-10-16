(() => {
  'use strict';

  const login = document.querySelector('#landing-login');
  const library = document.querySelector('#landing-library');
  const newTop = document.querySelector('#landing-new-top');
  const newMain = document.querySelector('#landing-new-main');
  const secondaryLogin = document.querySelector('#landing-secondary-login');
  const secondaryLibrary = document.querySelector('#landing-secondary-library');
  const loginReady = document.querySelector('#landing-login-ready');
  const secondaryLoginReady = document.querySelector('#landing-secondary-login-ready');

  function paintLocal() {
    login.hidden = true;
    secondaryLogin.hidden = true;
    if (loginReady) loginReady.hidden = false;
    // Hero keeps product CTAs only; Local status stays in the header once.
    if (secondaryLoginReady) secondaryLoginReady.hidden = true;
    library.hidden = false;
    secondaryLibrary.hidden = false;
    newTop.href = '/__wizard';
    newMain.href = '/__wizard';
  }

  function paintConfigured(session) {
    const signedIn = !!(session && session.user);
    if (loginReady) loginReady.hidden = true;
    if (secondaryLoginReady) secondaryLoginReady.hidden = true;
    login.hidden = signedIn;
    library.hidden = !signedIn;
    secondaryLogin.hidden = signedIn;
    secondaryLibrary.hidden = !signedIn;
    const newHref = signedIn ? '/__wizard' : '/__auth?returnTo=/__wizard';
    newTop.href = newHref;
    newMain.href = newHref;
    login.href = '/__auth?returnTo=/library';
    secondaryLogin.href = '/__auth?returnTo=/library';
  }

  if (!window.ChagokAuth || !ChagokAuth.isConfigured()) {
    paintLocal();
    return;
  }

  paintConfigured(null);

  ChagokAuth.getSession()
    .then(paintConfigured)
    .catch((err) => {
      console.warn('landing auth session load failed', err);
      paintConfigured(null);
    });

  try {
    ChagokAuth.onAuthStateChange(({ session }) => paintConfigured(session));
  } catch (err) {
    console.warn('landing auth subscription failed', err);
  }
})();
