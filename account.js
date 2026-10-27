/* TOOLGOOL account/data helpers. Demo-only local storage, not server authentication. */
(function () {
  "use strict";
  const USER_DATA_KEY = "toolgool-access-demo-data-v1";
  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function normalizeLogin(value) {
    const clean = String(value || "").replace(/[^a-zA-Z0-9_]/g, "").slice(0, 20).toLowerCase();
    return clean ? clean[0].toUpperCase() + clean.slice(1) : "";
  }
  function loadUserData(defaultData) {
    try {
      const saved = JSON.parse(localStorage.getItem(USER_DATA_KEY) || "null");
      return saved && saved.users ? saved : clone(defaultData);
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
  window.TOOLGOOL_ACCOUNT = { normalizeLogin, loadUserData, saveUserData, ensureUser };
})();
