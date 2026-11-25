(() => {
  "use strict";

  const root = document.documentElement;
  const video = document.querySelector(".bg-video");
  const toggle = document.getElementById("atmosphereToggle");
  const status = document.getElementById("atmosphereStatus");
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);
  const desktop = window.matchMedia("(min-width: 721px)");
  let paused = motionPreference.matches;

  // Системная настройка уменьшения движения имеет приоритет над сохранённым выбором.
  if (!motionPreference.matches) {
    try {
      const saved = localStorage.getItem("portfolio-fx-paused");
      if (saved === "true") paused = true;
      if (saved === "false") paused = false;
    } catch (_) {}
  }

  const paint = () => {
    root.dataset.effects = paused ? "paused" : "live";
    if (status) status.textContent = paused ? "PAUSED / STILL" : "LIVE / ACTIVE";
    if (toggle) {
      toggle.disabled = motionPreference.matches;
      toggle.textContent = motionPreference.matches ? "MOTION OFF" : paused ? "Запустить" : "Пауза";
      toggle.setAttribute("aria-pressed", String(paused));
      toggle.setAttribute("aria-label", motionPreference.matches ? "Анимация отключена системной настройкой" : paused ? "Запустить анимацию фона" : "Приостановить анимацию фона");
    }
    if (status && motionPreference.matches) status.textContent = "REDUCED MOTION";
    if (video) {
      if (paused || !desktop.matches || saveData) {
        video.pause();
        if (paused) requested = false;
      } else if (requested && video.paused) {
        video.play().catch(() => { requested = false; });
      }
    }
    try { localStorage.setItem("portfolio-fx-paused", String(paused)); } catch (_) {}
  };

  let requested = false;
  const startVideo = () => {
    if (!video || paused || !desktop.matches || saveData || document.hidden || requested) return;
    requested = true;
    if (video.readyState === 0) video.load();
    video.play().catch(() => { requested = false; });
  };

  if (video) {
    // Mobile keeps the poster and animated CSS ambience to save bandwidth and battery.
    if (desktop.matches && !saveData && !motionPreference.matches) {
      const deferStart = () => {
        if ("requestIdleCallback" in window) window.requestIdleCallback(startVideo, { timeout: 3000 });
        else window.setTimeout(startVideo, 1600);
      };
      deferStart();
    }
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) video.pause();
      else if (!paused && desktop.matches && !saveData) {
        if (video.readyState > 0) video.play().catch(() => {});
        else startVideo();
      }
    });
    desktop.addEventListener?.("change", () => {
      if (desktop.matches && !paused && !saveData) startVideo();
      else video.pause();
    });
  }

  toggle?.addEventListener("click", () => {
    paused = !paused;
    if (!paused) {
      requested = false;
      startVideo();
    }
    paint();
  });

  motionPreference.addEventListener?.("change", (event) => {
    if (event.matches) paused = true;
    paint();
  });
  paint();
})();
