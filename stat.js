/* ===== stat.js ===== */
/* TOOLGOOL statistics and leaderboard rendering. */
(function () {
  "use strict";
  function renderStats(profile, currentProfile) {
    const grid = document.getElementById("dynamicStats");
    if (!grid) return;
    grid.replaceChildren();
    (Array.isArray(profile.stats) ? profile.stats : []).forEach((stat, index) => {
      const card = document.createElement("div"); card.className = "dynamic-stat";
      card.style.animationDelay = Math.min(index * 55, 400) + "ms";
      const label = document.createElement("span"); label.className = "stat-label";
      label.textContent = (stat.icon ? stat.icon + "  " : "") + String(stat.label ?? "Показатель");
      const value = document.createElement("b"); value.className = "stat-value"; value.textContent = String(stat.value ?? "—");
      const note = document.createElement("small"); note.className = "stat-note"; note.textContent = String(stat.note ?? "");
      card.append(label, value, note); grid.append(card);
    });
    const display = document.getElementById("profileNamePreview"); if (display) display.textContent = currentProfile;
    const avatar = document.getElementById("profileAvatar"); if (avatar) avatar.textContent = Array.from(currentProfile)[0]?.toUpperCase() || "?";
    const welcome = document.getElementById("welcomeName"); if (welcome) welcome.textContent = currentProfile;
  }
  function renderLeaderboard(userData, currentProfile) {
    const body = document.getElementById("leaderboardBody"); if (!body) return;
    const rows = Object.entries((userData && userData.users) || {}).map(([name, user]) => {
      const stats = Array.isArray(user.stats) ? user.stats : [];
      const levelStat = stats.find(item => /уровень/i.test(String(item.label || "")));
      const activityStat = stats.find(item => /активность/i.test(String(item.label || "")));
      const levelText = levelStat ? String(levelStat.value) : "—";
      const level = Number.parseFloat(levelText.replace(/[^0-9.,-]/g, "").replace(",", ".")) || 0;
      const activityText = activityStat ? String(activityStat.value) : "—";
      const activity = Number.parseFloat(activityText.replace(/[^0-9.,-]/g, "").replace(",", ".")) || 0;
      return { name, levelText, level, activityText, activity, score: level * 100 + activity };
    }).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    body.replaceChildren();
    rows.forEach((row, index) => {
      const tr = document.createElement("tr"); if (row.name === currentProfile) tr.className = "current-player";
      const rank = document.createElement("td"); rank.textContent = String(index + 1);
      const playerCell = document.createElement("td"); const player = document.createElement("div"); player.className = "leaderboard-player";
      const avatar = document.createElement("span"); avatar.className = "leaderboard-avatar"; avatar.textContent = Array.from(row.name)[0]?.toUpperCase() || "?";
      const name = document.createElement("span"); name.textContent = row.name + (row.name === currentProfile ? " · вы" : "");
      player.append(avatar, name); playerCell.append(player);
      const level = document.createElement("td"); level.textContent = row.levelText;
      const activity = document.createElement("td"); activity.textContent = row.activityText;
      tr.append(rank, playerCell, level, activity); body.append(tr);
    });
  }
  window.TOOLGOOL_STATS = { renderStats, renderLeaderboard };
})();
