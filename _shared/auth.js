(() => {
  'use strict';

  const CONFIG = Object.freeze({
    url: "",
    publishableKey: ""
  });
  const STORAGE_KEY = 'chagok-auth-v1';
  let client = null;

  function isConfigured() {
    return !!(CONFIG.url && CONFIG.publishableKey);
  }

  function safeReturnTo(value) {
    const raw = String(value || '').trim();
    if (!raw) return '/library';
    if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) return '/library';
    try {
      const url = new URL(raw, window.location.origin);
      if (url.origin !== window.location.origin) return '/library';
      if (!['/library', '/__wizard', '/__workspace'].includes(url.pathname)) return '/library';
      return url.pathname + url.search + url.hash;
    } catch {
      return '/library';
    }
  }

  function getReturnTo() {
    return safeReturnTo(new URLSearchParams(window.location.search).get('returnTo'));
  }

  function getClient() {
    if (client) return client;
    if (!isConfigured()) {
      throw new Error('차곡 웹 Supabase 연결이 아직 설정되지 않았습니다.');
    }
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      throw new Error('인증 모듈을 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.');
    }
    client = window.supabase.createClient(CONFIG.url, CONFIG.publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: STORAGE_KEY
      }
    });
    return client;
  }

  async function getSession() {
    if (!isConfigured()) return null;
    const { data, error } = await getClient().auth.getSession();
    if (error) throw error;
    return data.session || null;
  }

  async function signIn(email, password) {
    const { data, error } = await getClient().auth.signInWithPassword({
      email: String(email || '').trim(),
      password: String(password || '')
    });
    if (error) throw error;
    return data;
  }

  async function signUp(email, password) {
    const { data, error } = await getClient().auth.signUp({
      email: String(email || '').trim(),
      password: String(password || '')
    });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    const { error } = await getClient().auth.signOut();
    if (error) throw error;
  }

  function onAuthStateChange(callback) {
    if (!isConfigured()) {
      try { callback({ event: 'INITIAL_SESSION', session: null }); } catch (_) {}
      return { data: { subscription: { unsubscribe() {} } } };
    }
    return getClient().auth.onAuthStateChange((event, session) => {
      callback({ event, session: session || null });
    });
  }

  window.ChagokAuth = Object.freeze({
    isConfigured,
    safeReturnTo,
    getReturnTo,
    getClient,
    getSession,
    signIn,
    signUp,
    signOut,
    onAuthStateChange
  });
})();
