(() => {
  'use strict';

  const CONFIG = Object.freeze({
    url: "https://rdrafwfdwfzgcfiqkgug.supabase.co",
    publishableKey: "sb_publishable_m8gFSdgINxhNqH6NlMW6Ew_-UIoL6l1"
  });
  const STORAGE_KEY = 'mychapter-auth-v1';
  let client = null;

  function getClient() {
    if (client) return client;
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
    return getClient().auth.onAuthStateChange((event, session) => {
      callback({ event, session: session || null });
    });
  }

  window.MyChapterAuth = Object.freeze({
    getClient,
    getSession,
    signIn,
    signUp,
    signOut,
    onAuthStateChange
  });
})();
