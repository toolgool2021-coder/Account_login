/* ===== data.js (editable demo data) ===== */
window.TOOLGOOL_DATA = {
  correctCode: "123456",
  defaultLogin: "Toolgool",
  /*
   * ===== КАК ДОБАВИТЬ СТАТИСТИКУ =====
   * Добавьте объект в stats нужного пользователя. Порядок полей не важен.
   * label = название карточки, value = крупное значение, note = пояснение.
   * icon необязателен. Можно добавлять сколько угодно показателей.
   * Пример: { "label": "Уровни", "value": 128, "note": "Опубликовано", "icon": "✦" }
   * Основные данные редактируются в файле data.js. После изменения файла обновите страницу.
   */
  users: {
    "Toolgool": {
      color: "blue", label: "Основной", stats: [
        { label: "Уровень профиля", value: "12", note: "Текущий уровень", icon: "✦" },
        { label: "Активность", value: "94%", note: "За последние 30 дней", icon: "◉" },
        { label: "Входы", value: "38", note: "Всего сеансов", icon: "⌁" },
        { label: "Достижения", value: "7", note: "Открыто", icon: "◇" }
      ]
    },
    "Olitiq": {
      color: "cyan", label: "Профиль 02", stats: [
        { label: "Уровень профиля", value: "8", note: "Текущий уровень", icon: "✦" },
        { label: "Активность", value: "87%", note: "За последние 30 дней", icon: "◉" },
        { label: "Входы", value: "21", note: "Всего сеансов", icon: "⌁" }
      ]
    },
    "Guest": {
      color: "violet", label: "Гостевой", stats: [
        { label: "Уровень профиля", value: "1", note: "Начальный", icon: "✦" },
        { label: "Активность", value: "—", note: "Нет данных", icon: "◉" }
      ]
    }
  }
};
