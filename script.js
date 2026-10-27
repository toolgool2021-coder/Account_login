/* ===== script.js ===== */
(() => {
  "use strict";
  /* ===== script.js: НАЧАЛО ЛОГИКИ ===== */
  const DEMO_DATA = window.TOOLGOOL_DATA;
  const correctCode = DEMO_DATA.correctCode;
  const card = document.getElementById("card");
  const login = document.getElementById("login");
  const success = document.getElementById("success");
  const dashboard = document.getElementById("dashboard");
  const status = document.getElementById("status");
  const redirectBar = document.getElementById("redirectBar");
  const redirectLabel = document.getElementById("redirectLabel");
  let redirectTimer = null;
  let successfulLogins = 1;
  let focusMode = false;
  let currentProfile = DEMO_DATA.defaultLogin;
  let userSettings = loadSettings();
  let userData = loadUserData();
  const submit = document.getElementById("submit");
  const loginName = document.getElementById("loginName");
  let pendingLogin = "";
  const cells = [...document.querySelectorAll(".cell")];
  const canvas = document.getElementById("space");
  const ctx = canvas.getContext("2d");
  let code = "";
  let busy = false;
  let particles = [];
  let bursts = [];
  let reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) userSettings.motion = true;

  function render() {
    cells.forEach((cell, i) => {
      cell.textContent = code[i] || "";
      cell.classList.toggle("filled", i < code.length);
      cell.classList.toggle("active", i === code.length && !busy);
    });
  }
  function setStatus(message, type = "") {
    status.textContent = message;
    status.className = "status" + (type ? " " + type : "");
  }
  function addDigit(digit) {
    if (busy || code.length >= 6 || !/^\d$/.test(digit)) return;
    code += digit;
    render();
    setStatus(code.length === 6 ? "Код готов к проверке" : "Введите оставшиеся цифры");
  }
  function clearCode() {
    if (busy) return;
    code = "";
    render();
    setStatus("Поле очищено");
  }
  function deleteDigit() {
    if (busy || !code.length) return;
    code = code.slice(0, -1);
    render();
    setStatus("Последняя цифра удалена");
  }
  function runVerificationSequence() {
    const steps = [...document.querySelectorAll("#verificationSteps [data-step]")];
    const successIcon = document.getElementById("successIcon");
    steps.forEach(step => {
      step.classList.remove("step-running", "step-done");
      step.querySelector(".step-check").textContent = "·";
      step.querySelector("b").textContent = "Ожидание";
    });
    successIcon.classList.remove("verified-draw");
    if (reduceMotion) {
      steps.forEach(step => {
        step.classList.add("step-done");
        step.querySelector(".step-check").textContent = "✓";
        step.querySelector("b").textContent = "Завершено";
      });
      successIcon.classList.add("verified-draw");
      return;
    }
    steps.forEach((step, index) => {
      window.setTimeout(() => {
        if (index > 0) {
          steps[index - 1].classList.remove("step-running");
          steps[index - 1].classList.add("step-done");
          steps[index - 1].querySelector(".step-check").textContent = "✓";
          steps[index - 1].querySelector("b").textContent = "Завершено";
        }
        step.classList.add("step-running");
        step.querySelector(".step-check").textContent = "";
        step.querySelector("b").textContent = "Проверка…";
      }, index * 680);
    });
    window.setTimeout(() => {
      const last = steps[steps.length - 1];
      if (last) {
        last.classList.remove("step-running");
        last.classList.add("step-done");
        last.querySelector(".step-check").textContent = "✓";
        last.querySelector("b").textContent = "Завершено";
      }
      successIcon.classList.add("verified-draw");
      document.querySelector(".success-screen h2").textContent = "ДОСТУП ОТКРЫТ";
      document.querySelector(".success-screen > p").textContent = "Все этапы завершены. Личный профиль готов к открытию.";
      document.getElementById("redirectLabel").textContent = "Проверка завершена. Открываем профиль…";
    }, steps.length * 680);
  }

  function checkCode() {
    if (busy) return;
    const enteredLogin = normalizeLogin(loginName.value);
    if (!enteredLogin) {
      setStatus("Введите логин", "error");
      loginName.focus();
      return;
    }
    loginName.value = enteredLogin;
    // Do not reveal whether a login exists. Check login and numeric code together below.
    pendingLogin = enteredLogin;
    if (code.length !== 6) {
      setStatus("Введите все 6 цифр", "error");
      card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake");
      return;
    }
    busy = true;
    submit.disabled = true;
    card.classList.add("checking");
    setStatus("Проверка кода…");
    cells.forEach(c => c.classList.remove("active"));
    window.setTimeout(() => {
      card.classList.remove("checking");
      busy = false;
      submit.disabled = false;
      const enteredLogin = pendingLogin || normalizeLogin(loginName.value);
      if (code === correctCode && Object.prototype.hasOwnProperty.call(DEMO_DATA.users, enteredLogin)) {
        ensureUser(enteredLogin);
        loadAccountState(enteredLogin);
        renderStats(enteredLogin);
        document.getElementById("profileNamePreview").textContent = enteredLogin;
        document.getElementById("profileAvatar").textContent = Array.from(enteredLogin)[0].toUpperCase();
        document.getElementById("welcomeName").textContent = enteredLogin;
        document.getElementById("profileStatusPreview").textContent = "Профиль: " + (DEMO_DATA.users[enteredLogin]?.label || "Пользователь");
        login.classList.add("hidden");
        success.classList.remove("hidden");
        document.querySelector(".success-screen h2").textContent = "ПРОВЕРКА ДОСТУПА";
        document.querySelector(".success-screen > p").textContent = "Код принят. Выполняем проверку сеанса по шагам.";
        card.classList.add("confirmed");
        burst(window.innerWidth / 2, window.innerHeight / 2, 90);
        runVerificationSequence();
        // Wait for the checkmark and confirmation animation before opening the demo dashboard.
        if (redirectTimer) window.clearTimeout(redirectTimer);
        redirectBar.style.transition = "none";
        redirectBar.style.width = "0%";
        requestAnimationFrame(() => requestAnimationFrame(() => {
          redirectBar.style.transition = reduceMotion ? "none" : "width 2.1s cubic-bezier(.2,.7,.2,1)";
          redirectBar.style.width = "100%";
        }));
        redirectLabel.textContent = "Проверяем данные и создаём сеанс…";
        redirectTimer = window.setTimeout(() => {
          success.classList.add("hidden");
          dashboard.classList.remove("hidden");
          card.classList.remove("confirmed");
          burst(window.innerWidth * .25, window.innerHeight * .28, 70);
          burst(window.innerWidth * .75, window.innerHeight * .35, 70);
        }, reduceMotion ? 100 : 2850);
      } else {
        card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake");
        code = "";
        render();
        setStatus("Неверный логин или код. Проверьте данные и попробуйте ещё раз", "error");
      }
    }, reduceMotion ? 80 : 1050);
  }
  const keypad=document.getElementById("keypad");
  function handleKeypad(e){
    const button = e.target.closest("button[data-digit]");
    if (!button || !keypad.contains(button)) return;
    addDigit(button.dataset.digit);
  }
  // Use click delegation for touch, mouse, and keyboard activation. Do not cancel pointerdown:
  // on some mobile browsers that can prevent the synthesized click and leave the keypad inert.
  keypad.addEventListener("click", handleKeypad);
  document.getElementById("clear").addEventListener("click", clearCode);
  document.getElementById("delete").addEventListener("click", deleteDigit);
  submit.addEventListener("click", checkCode);
  const settingsMessage = document.getElementById("settingsMessage");
  const noticeToggle = document.getElementById("noticeToggle");

  function loadUserData() { return window.TOOLGOOL_ACCOUNT.loadUserData(DEMO_DATA); }
  function saveUserData() { window.TOOLGOOL_ACCOUNT.saveUserData(userData); }
  function ensureUser(name) { return window.TOOLGOOL_ACCOUNT.ensureUser(userData, name); }
  function renderStats(name) {
    currentProfile = name || currentProfile || DEMO_DATA.defaultLogin;
    const profile = ensureUser(currentProfile);
    window.TOOLGOOL_STATS.renderStats(profile, currentProfile);
    renderLeaderboard();
  }
  function downloadJson(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json;charset=utf-8"});
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
  }
  function normalizeLogin(value) { return window.TOOLGOOL_ACCOUNT.normalizeLogin(value); }
  loginName.addEventListener("input", () => {
    const start = loginName.selectionStart;
    const normalized = normalizeLogin(loginName.value);
    if (loginName.value !== normalized) {
      loginName.value = normalized;
      try { loginName.setSelectionRange(start, start); } catch (_) {}
    }
  });
  loginName.addEventListener("blur", () => { loginName.value = normalizeLogin(loginName.value); });
  function addActivity(title, detail, icon = "✦") {
    activityHistory.unshift({title, detail, icon, at: new Date().toISOString()});
    activityHistory = activityHistory.slice(0, 5);
    window.TOOLGOOL_ACCOUNT.saveHistory(currentProfile, activityHistory);
    renderActivityHistory();
  }
  function renderLeaderboard() {
    window.TOOLGOOL_STATS.renderLeaderboard(userData, currentProfile);
  }
  document.getElementById("activityAction").addEventListener("click", () => {
    document.getElementById("activityPanel").scrollIntoView({behavior:reduceMotion?"auto":"smooth",block:"center"});
    addActivity("История открыта", "Просмотр локальных событий", "◷");
  });
  let themeIndex = 0;
  document.getElementById("themeAction").addEventListener("click", () => {
    const themes = ["", "accent-cyan", "accent-violet", "accent-pink"];
    dashboard.classList.remove("accent-cyan", "accent-violet", "accent-pink");
    themeIndex = (themeIndex + 1) % themes.length;
    if (themes[themeIndex]) dashboard.classList.add(themes[themeIndex]);
    addActivity("Оформление изменено", ["Синий акцент", "Бирюзовый акцент", "Фиолетовый акцент", "Розовый акцент"][themeIndex], "◐");
  });
  document.getElementById("copyProfileAction").addEventListener("click", async () => {
    const name = document.getElementById("profileNamePreview").textContent;
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(name);
      else {
        const temp = document.createElement("textarea"); temp.value = name; temp.style.position = "fixed"; temp.style.opacity = "0"; document.body.append(temp); temp.select();
        const ok = document.execCommand("copy"); temp.remove(); if (!ok) throw new Error("copy failed");
      }
      settingsMessage.textContent = "Имя профиля скопировано";
      addActivity("Имя скопировано", name, "⧉");
    } catch (_) {
      settingsMessage.textContent = "Не удалось скопировать. Имя: " + name;
    }
  });
  document.getElementById("exportProfile").addEventListener("click", () => {
    const data = {
      profile: document.getElementById("profileNamePreview").textContent,
      login: normalizeLogin(loginName.value),
      status: "confirmed-demo",
      exportedAt: new Date().toISOString(),
      note: "Локальные демонстрационные данные; не являются серверной авторизацией."
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "toolgool-profile.json"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    addActivity("Экспорт профиля", "Создан файл JSON", "⇩");
  });

  const settingControls = {
    effects: document.getElementById("effectsToggle"),
    particles: document.getElementById("particlesToggle"),
    compact: document.getElementById("compactToggle"),
    largeText: document.getElementById("largeTextToggle"),
    contrast: document.getElementById("contrastToggle"),
    notices: document.getElementById("noticeToggle"),
    motion: document.getElementById("motionToggle")
  };
  function loadSettings() {
    return window.TOOLGOOL_ACCOUNT.loadSettings(currentProfile);
  }
  function saveSettings() {
    window.TOOLGOOL_ACCOUNT.saveSettings(currentProfile, userSettings);
  }
  let activityHistory = window.TOOLGOOL_ACCOUNT.loadHistory(currentProfile);
  function renderActivityHistory() {
    const panel = document.getElementById("activityPanel");
    panel.replaceChildren();
    activityHistory.slice(0, 5).forEach(entry => {
      const item = document.createElement("div"); item.className = "activity-item";
      const icon = document.createElement("span"); icon.className = "activity-icon"; icon.textContent = entry.icon || "✦";
      const body = document.createElement("div");
      const title = document.createElement("b"); title.textContent = entry.title || "Событие";
      const detail = document.createElement("small"); detail.textContent = entry.detail || "";
      body.append(title, detail);
      const state = document.createElement("span"); state.className = "activity-state"; state.textContent = "LOG";
      item.append(icon, body, state); panel.append(item);
    });
    if (!activityHistory.length) {
      const empty = document.createElement("p"); empty.className = "settings-message"; empty.textContent = "История пока пуста"; panel.append(empty);
    }
  }
  function loadAccountState(name) {
    currentProfile = name;
    activityHistory = window.TOOLGOOL_ACCOUNT.loadHistory(name);
    userSettings = window.TOOLGOOL_ACCOUNT.loadSettings(name);
    renderActivityHistory();
    applySettings();
    addActivity("Вход в профиль", "Сеанс открыт", "✓");
  }
  function announce(message) {
    if (!settingControls.notices.checked) return;
    settingsMessage.textContent = message;
    if (!reduceMotion && settingsMessage.animate) settingsMessage.animate([{opacity:0,transform:"translateY(4px)"},{opacity:1,transform:"translateY(0)"}],{duration:260,easing:"ease-out"});
  }
  function applySettings() {
    Object.entries(settingControls).forEach(([key, control]) => { control.checked = !!userSettings[key]; });
    dashboard.classList.toggle("effects-off", !userSettings.effects);
    dashboard.classList.toggle("compact", !!userSettings.compact);
    dashboard.classList.toggle("large-text", !!userSettings.largeText);
    dashboard.classList.toggle("high-contrast", !!userSettings.contrast);
    dashboard.classList.toggle("motion-reduced", !!userSettings.motion);
    document.body.classList.toggle("particles-off", !userSettings.particles);
    reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches || !!userSettings.motion;
  }
  Object.entries(settingControls).forEach(([key, control]) => {
    control.addEventListener("change", () => {
      userSettings[key] = control.checked;
      applySettings(); saveSettings();
      const labels = {effects:"Эффекты",particles:"Частицы",compact:"Компактный вид",largeText:"Крупный текст",contrast:"Контраст",notices:"Уведомления",motion:"Уменьшение движения"};
      announce(labels[key] + (control.checked ? " включено" : " выключено"));
      addActivity("Настройка изменена", labels[key] + (control.checked ? " включено" : " выключено"), "⚙");
    });
  });
  renderStats(currentProfile);
  renderLeaderboard();
  renderActivityHistory();
  applySettings();
  document.getElementById("resetSettings").addEventListener("click", () => {
    userSettings = {effects:true,particles:true,compact:false,largeText:false,contrast:false,notices:true,motion:false};
    applySettings(); saveSettings(); announce("Настройки сброшены к исходным");
    addActivity("Настройки сброшены", "Возвращены стандартные параметры", "↺");
  });
  document.getElementById("focusAction").addEventListener("click", () => {
    focusMode = !focusMode;
    dashboard.classList.toggle("focus-mode", focusMode);
    announce(focusMode ? "Режим фокуса включён" : "Режим фокуса выключен");
    addActivity("Режим фокуса", focusMode ? "Включён" : "Выключен", "◎");
  });
  document.getElementById("clearActivityAction").addEventListener("click", () => {
    activityHistory = [];
    window.TOOLGOOL_ACCOUNT.saveHistory(currentProfile, activityHistory);
    renderActivityHistory();
    announce("История событий очищена");
  });
  document.getElementById("copyLoginAction").addEventListener("click", async () => {
    const value = normalizeLogin(loginName.value) || DEMO_DATA.defaultLogin;
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(value);
      else { const temp=document.createElement("textarea"); temp.value=value; temp.style.position="fixed"; temp.style.opacity="0"; document.body.append(temp); temp.select(); const ok=document.execCommand("copy"); temp.remove(); if(!ok) throw new Error("copy failed"); }
      announce("Логин скопирован: " + value); addActivity("Логин скопирован", value, "@");
    } catch (_) { announce("Ваш логин: " + value); }
  });
  document.getElementById("logout").addEventListener("click", () => {
    dashboard.classList.add("hidden");
    login.classList.remove("hidden");
    card.classList.remove("confirmed");
    successfulLogins++;
    code = "";
    render();
    setStatus("Сеанс завершён. Введите логин и код для повторного входа");
    loginName.value = "";
    bursts = [];
    window.scrollTo({top: 0, behavior: reduceMotion ? "auto" : "smooth"});
  });
  document.addEventListener("keydown", e => {
    if (success && !success.classList.contains("hidden")) return;
    // Let the login field and any other editable field handle typing and deletion normally.
    const target = e.target;
    if (target && (target.matches("input, textarea, select") || target.isContentEditable)) return;
    if (/^\d$/.test(e.key)) { e.preventDefault(); addDigit(e.key); }
    else if (e.key === "Backspace") { e.preventDefault(); deleteDigit(); }
    else if (e.key === "Enter") { e.preventDefault(); checkCode(); }
    else if (e.key === "Escape") { e.preventDefault(); clearCode(); }
  });

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(76, Math.max(25, Math.floor(window.innerWidth * window.innerHeight / 17000)));
    particles = Array.from({length: count}, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      vx: (Math.random() - .5) * .36, vy: (Math.random() - .5) * .36,
      r: Math.random() * 1.6 + .5
    }));
  }
  function burst(x, y, count) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, speed = 1 + Math.random() * 4.5;
      bursts.push({x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, life: 1, r: 1 + Math.random() * 2.5});
    }
  }
  function draw() {
    const w = window.innerWidth, h = window.innerHeight;
    ctx.clearRect(0, 0, w, h);
    if (!userSettings.particles) {
      if (!reduceMotion) requestAnimationFrame(draw);
      return;
    }
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (!reduceMotion) { p.x += p.vx; p.y += p.vy; }
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(135,190,255,.55)"; ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j], dx = p.x - q.x, dy = p.y - q.y, d = Math.hypot(dx, dy);
        if (d < 112) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(102,151,255,${(1 - d / 112) * .15})`; ctx.lineWidth = .7; ctx.stroke();
        }
      }
    }
    bursts = bursts.filter(p => p.life > .025);
    bursts.forEach(p => {
      if (!reduceMotion) { p.x += p.vx; p.y += p.vy; p.vx *= .985; p.vy *= .985; p.life -= .018; }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(111,255,226,${p.life})`; ctx.fill();
    });
    if (!reduceMotion) requestAnimationFrame(draw);
  }
  window.addEventListener("resize", resizeCanvas, {passive:true});
  resizeCanvas();
  draw();
  render();
})();
