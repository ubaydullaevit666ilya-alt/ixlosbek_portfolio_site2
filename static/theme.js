(() => {
  "use strict";

  const root = document.documentElement;
  const button = document.getElementById("themeToggle");
  const metaTheme = document.querySelector('meta[name="theme-color"]');

  let savedTheme = "dark";
  try {
    savedTheme = localStorage.getItem("portfolio-theme") || "dark";
  } catch (_) {
    // Тема останется доступна на время текущего открытия сайта.
  }

  function applyTheme(theme) {
    const nextTheme = theme === "light" ? "light" : "dark";
    root.dataset.theme = nextTheme;
    root.style.colorScheme = nextTheme;
    if (metaTheme) {
      metaTheme.setAttribute("content", nextTheme === "light" ? "#f3f6fa" : "#080b12");
    }
    if (button) {
      button.textContent = nextTheme === "dark" ? "☼ Светлая" : "☾ Тёмная";
      button.setAttribute(
        "aria-label",
        nextTheme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"
      );
      button.setAttribute("aria-pressed", String(nextTheme === "light"));
    }
    try {
      localStorage.setItem("portfolio-theme", nextTheme);
    } catch (_) {
      // Переключение работает и без localStorage.
    }
  }

  applyTheme(savedTheme);
  button?.addEventListener("click", () => {
    applyTheme(root.dataset.theme === "light" ? "dark" : "light");
  });
})();
