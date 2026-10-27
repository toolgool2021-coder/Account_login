/* ===== account.js ===== */
/* TOOLGOOL account helpers. Demo-only local storage, not server authentication. */
(function () {
  "use strict";
  const USER_DATA_KEY = "toolgool-access-demo-data-v1";
  const DEFAULT_SETTINGS = {effects:true,particles:true,compact:false,largeText:false,contrast:false,notices:true,motion:false};
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function normalizeLogin(value) {
    const clean = String(value || "").replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20).toLowerCase();
    return clean ? clean[0].toUpperCase() + clean.slice(1) : "";
  }
  function loadUserData(defaultData) {
    try {
      const saved = JSON.parse(localStorage.getItem(USER_DATA_KEY) || "null");
      if (saved && saved.users) {
        // Keep edited defaults available when new users are added in data.js.
        Object.entries(defaultData.users || {}).forEach(([name, user]) => {
          if (!saved.users[name]) saved.users[name] = clone(user);
        });
        return saved;
      }
      return clone(defaultData);
    } catch (_) { return clone(defaultData); }
  }
  function saveUserData(userData) {
    try { localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData)); } catch (_) {}
  }
  function ensureUser(userData, name) {
    if (!userData.users[name]) {
      userData.users[name] = { color: "blue", label: "Пользователь", stats: [
        { label: "Статус", value: "Активен", note: "Локальный профиль", icon: "◉" },
        { label: "Достижения", value: "0", note: "Пока нет данных", icon: "◇" }
      ]};
      saveUserData(userData);
    }
    if (!Array.isArray(userData.users[name].stats)) userData.users[name].stats = [];
    return userData.users[name];
  }
  function scopedKey(kind, name) { return "toolgool:" + kind + ":" + encodeURIComponent(String(name || "Guest").toLowerCase()); }
  function loadHistory(name) {
    try {
      const history = JSON.parse(localStorage.getItem(scopedKey("history", name)) || "[]");
      return Array.isArray(history) ? history : [];
    } catch (_) { return []; }
  }
  function saveHistory(name, history) {
    try { localStorage.setItem(scopedKey("history", name), JSON.stringify(history.slice(0, 5))); } catch (_) {}
  }
  function loadSettings(name) {
    try { return Object.assign({}, DEFAULT_SETTINGS, JSON.parse(localStorage.getItem(scopedKey("settings", name)) || "{}")); }
    catch (_) { return Object.assign({}, DEFAULT_SETTINGS); }
  }
  function saveSettings(name, settings) {
    try { localStorage.setItem(scopedKey("settings", name), JSON.stringify(settings)); } catch (_) {}
  }
  window.TOOLGOOL_ACCOUNT = { normalizeLogin, loadUserData, saveUserData, ensureUser, loadHistory, saveHistory, loadSettings, saveSettings, defaultSettings: clone(DEFAULT_SETTINGS) };
})();
