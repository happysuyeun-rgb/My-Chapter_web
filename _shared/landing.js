(() => {
  'use strict';

  const login = document.querySelector('#landing-login');
  const library = document.querySelector('#landing-library');
  const newTop = document.querySelector('#landing-new-top');
  const newMain = document.querySelector('#landing-new-main');
  const secondaryLogin = document.querySelector('#landing-secondary-login');
  const secondaryLibrary = document.querySelector('#landing-secondary-library');

  function paint(session) {
    const signedIn = !!(session && session.user);
    login.hidden = signedIn;
    library.hidden = !signedIn;
    secondaryLogin.hidden = signedIn;
    secondaryLibrary.hidden = !signedIn;
    const newHref = signedIn ? '/__wizard' : '/__auth?returnTo=/__wizard';
    newTop.href = newHref;
    newMain.href = newHref;
  }

  paint(null);

  if (!window.ChagokAuth || !ChagokAuth.isConfigured()) return;

  ChagokAuth.getSession()
    .then(paint)
    .catch((err) => {
      console.warn('landing auth session load failed', err);
      paint(null);
    });

  try {
    ChagokAuth.onAuthStateChange(({ session }) => paint(session));
  } catch (err) {
    console.warn('landing auth subscription failed', err);
  }
})();