(() => {
  "use strict";

  const boot = document.getElementById("bootScreen");
  const terminal = document.getElementById("terminalLines");
  const progress = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");
  const skip = document.getElementById("skipBoot");

  // Строки терминала приходят из Django (portfolio/views.py -> BOOT_LINES)
  let lines = [];
  try { lines = JSON.parse(boot.dataset.lines || "[]"); } catch (_) {}
  if (!lines.length) lines = [">>> website.launch()  # SUCCESS"];

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let seen = false;
  try { seen = sessionStorage.getItem("bootSeen") === "1"; } catch (_) {}

  let finished = false;
  let index = 0;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      entry.target.querySelectorAll(".skill-track i").forEach((bar) => {
        bar.style.width = bar.dataset.level + "%";
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  function revealSite() {
    if (finished) return;
    finished = true;
    try { sessionStorage.setItem("bootSeen", "1"); } catch (_) {}
    document.body.classList.remove("booting");
    boot.classList.add("done");
    document.querySelectorAll(".reveal").forEach((el, i) => {
      setTimeout(() => observer.observe(el), Math.min(i * 90, 700));
    });
    setTimeout(() => boot.remove(), 900);
    setTimeout(startHero, 500);
  }

  function addLine() {
    if (finished) return;
    if (index >= lines.length) {
      progress.style.width = "100%";
      progressText.textContent = "100%";
      setTimeout(revealSite, 550);
      return;
    }
    const line = document.createElement("div");
    line.className = "terminal-line";
    line.textContent = lines[index];
    terminal.appendChild(line);
    index += 1;
    const percent = Math.round((index / lines.length) * 100);
    progress.style.width = percent + "%";
    progressText.textContent = percent + "%";
    setTimeout(addLine, 430);
  }

  if (reduceMotion || seen) {
    // Повторным посетителям и при «уменьшении анимации» интро не показываем
    boot.classList.add("done");
    boot.remove();
    finished = true;
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    setTimeout(startHero, 100);
  } else {
    document.body.classList.add("booting");
    setTimeout(addLine, 350);
    skip.addEventListener("click", revealSite);
    skip.focus({ preventScroll: true });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" || e.key === "Enter") revealSite();
    });
  }

  // Мобильное меню
  const toggle = document.getElementById("menuToggle");
  const links = document.querySelector(".nav-links");
  toggle.addEventListener("click", () => {
    const opened = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(opened));
  });
  links.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }));

  // ---------- Hero: печать Python-кода и смена ролей ----------
  const codeEl = document.getElementById("codeBody");
  const roleEl = document.getElementById("roleText");
  let heroStarted = false;

  const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  function highlight(text) {
    return esc(text).replace(
      /("[^"\n]*"?)|\b(class|def|return)\b|(?<=def\s)(\w+)|\b(print|mission)\b|\b(\d+)\b|\b([A-Z][A-Za-z]+)\b/g,
      (m, str, kw, def, fn, num, cls) =>
        str ? `<span class="tk-str">${m}</span>`
        : kw ? `<span class="tk-kw">${m}</span>`
        : def || fn ? `<span class="tk-fn">${m}</span>`
        : num ? `<span class="tk-num">${m}</span>`
        : cls ? `<span class="tk-cls">${m}</span>` : m
    );
  }

  function startHero() {
    if (heroStarted) return;
    heroStarted = true;

    if (codeEl) {
      let code = [];
      try { code = JSON.parse(codeEl.dataset.code || "[]"); } catch (_) {}
      const full = code.join("\n");
      if (reduceMotion) {
        codeEl.innerHTML = highlight(full);
      } else {
        let n = 0;
        const tick = () => {
          n += 1;
          codeEl.innerHTML = highlight(full.slice(0, n)) + '<span class="role-caret"></span>';
          if (n < full.length) setTimeout(tick, full[n - 1] === "\n" ? 140 : 28);
          else codeEl.innerHTML = highlight(full);
        };
        tick();
      }
    }

    if (roleEl && !reduceMotion) {
      let roles = [];
      try { roles = JSON.parse(roleEl.dataset.roles || "[]"); } catch (_) {}
      if (roles.length > 1) {
        let r = 0, pos = roles[0].length, deleting = true;
        const loop = () => {
          const word = roles[r];
          if (deleting) { pos -= 1; } else { pos += 1; }
          roleEl.textContent = word.slice(0, pos);
          let delay = deleting ? 45 : 85;
          if (!deleting && pos === word.length) { deleting = true; delay = 1800; }
          else if (deleting && pos === 0) { deleting = false; r = (r + 1) % roles.length; delay = 350; }
          setTimeout(loop, delay);
        };
        setTimeout(loop, 1800);
      }
    }
  }

  // ---------- Счётчики в статистике ----------
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll("[data-count]").forEach((el) => {
        const target = Number(el.dataset.count) || 0;
        if (reduceMotion) { el.textContent = target; return; }
        const start = performance.now(), dur = 1100;
        const step = (now) => {
          const t = Math.min((now - start) / dur, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll(".stats").forEach((el) => counterObserver.observe(el));

  // ---------- Свечение карточек за курсором ----------
  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  // ---------- Прогресс прокрутки и свечение за курсором ----------
  const bar = document.getElementById("scrollProgress");
  const glow = document.getElementById("cursorGlow");
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const h = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
      document.body.style.setProperty("--dim", Math.min(scrollY / (innerHeight * 0.7), 1).toFixed(3));
      ticking = false;
    });
  }, { passive: true });
  if (glow && !reduceMotion) {
    window.addEventListener("pointermove", (e) => {
      glow.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`;
    }, { passive: true });
  }

})();

document.addEventListener("DOMContentLoaded", () => {
    const trigger = document.getElementById("secretTrigger");
    const modal = document.getElementById("secretModal");
    const close = document.getElementById("secretClose");
    const code = document.getElementById("secretCode");
    const submit = document.getElementById("secretSubmit");
    const error = document.getElementById("secretError");
    const message = document.getElementById("secretMessage");

    if (!trigger || !modal || !close || !code || !submit || !error || !message) {
        console.error("Secret Easter Egg: не найдены HTML-элементы");
        return;
    }

    trigger.addEventListener("click", () => {
        modal.style.display = "flex";
        modal.classList.add("active");
        code.focus();
    });

    close.addEventListener("click", () => {
        modal.classList.remove("active");
            modal.style.display = "none";
    });

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.classList.remove("active");
            modal.style.display = "none";
        }
    });

    function unlockSecret() {
        if (code.value === "1123") {
            error.textContent = "";
            code.style.display = "none";
            submit.style.display = "none";
            message.style.display = "block";
        } else {
            error.textContent = "Неверный код! Попробуй ещё раз.";
            code.value = "";
        }
    }

    submit.addEventListener("click", unlockSecret);

    code.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            unlockSecret();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            modal.classList.remove("active");
            modal.style.display = "none";
        }
    });
});

// Интерактивные модули IXLOSBEK Portfolio.
document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const root = document.documentElement;
  const toast = $("#siteToast");
  let toastTimer = null;

  const notify = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2400);
  };

  const copyText = async (value) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        const field = document.createElement("textarea");
        field.value = value;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        const copied = document.execCommand("copy");
        field.remove();
        if (!copied) throw new Error("Clipboard is unavailable");
      }
      notify("Скопировано в буфер обмена");
    } catch (_) {
      notify("Не удалось скопировать. Выдели текст вручную.");
    }
  };

  // Часы по времени Узбекистана.
  const clock = $("#localClock");
  if (clock) {
    const updateClock = () => {
      clock.textContent = new Intl.DateTimeFormat("ru-RU", {
        timeZone: "Asia/Tashkent", hour: "2-digit", minute: "2-digit", second: "2-digit"
      }).format(new Date());
    };
    updateClock();
    window.setInterval(updateClock, 1000);
  }

  // Цветовой акцент: выбор сохраняется отдельно от светлой/тёмной темы.
  const accentButton = $("#accentToggle");
  const accents = ["lime", "cyan", "violet"];
  let activeAccent = "lime";
  try {
    const saved = localStorage.getItem("portfolio-accent");
    if (accents.includes(saved)) activeAccent = saved;
  } catch (_) {}
  const applyAccent = () => {
    root.dataset.accent = activeAccent;
    if (accentButton) accentButton.setAttribute("aria-label", `Цветовой акцент: ${activeAccent}. Нажми, чтобы сменить`);
  };
  applyAccent();
  accentButton?.addEventListener("click", () => {
    activeAccent = accents[(accents.indexOf(activeAccent) + 1) % accents.length];
    applyAccent();
    try { localStorage.setItem("portfolio-accent", activeAccent); } catch (_) {}
    notify(`Акцент изменён: ${activeAccent === "lime" ? "лаймовый" : activeAccent === "cyan" ? "бирюзовый" : "фиолетовый"}`);
  });

  // Проекты: поиск, фильтры, избранное и сортировка.
  const grid = $("#projectGrid");
  const cards = grid ? $$(".project-card", grid) : [];
  const search = $("#projectSearch");
  const filters = $("#projectFilters");
  const result = $("#projectResult");
  const empty = $("#emptyProjects");
  const favoriteOnlyButton = $("#favoriteOnly");
  const favoriteCount = $("#favoriteCount");
  const sortSelect = $("#projectSort");
  const resetProjects = $("#resetProjects");
  let activeFilter = "all";
  let favoritesOnly = false;
  let favorites = new Set();
  try {
    const saved = JSON.parse(localStorage.getItem("ix-project-favorites") || "[]");
    if (Array.isArray(saved)) favorites = new Set(saved.filter((item) => typeof item === "string"));
  } catch (_) {}

  const saveFavorites = () => {
    try { localStorage.setItem("ix-project-favorites", JSON.stringify([...favorites])); } catch (_) {}
  };
  const paintFavorites = () => {
    cards.forEach((card) => {
      const button = $(".project-save", card);
      const saved = favorites.has(card.dataset.slug);
      if (button) {
        button.classList.toggle("saved", saved);
        button.textContent = saved ? "★" : "☆";
        button.setAttribute("aria-pressed", String(saved));
        button.setAttribute("aria-label", `${saved ? "Убрать из" : "Добавить в"} избранное: ${$("h3", card)?.textContent || "проект"}`);
      }
    });
    if (favoriteCount) favoriteCount.textContent = String(favorites.size);
    favoriteOnlyButton?.classList.toggle("active", favoritesOnly);
    favoriteOnlyButton?.setAttribute("aria-pressed", String(favoritesOnly));
  };

  const sortCards = () => {
    if (!grid) return;
    const mode = sortSelect?.value || "featured";
    const sorted = [...cards].sort((a, b) => {
      if (mode === "az") return $("h3", a).textContent.localeCompare($("h3", b).textContent, "ru");
      if (mode === "za") return $("h3", b).textContent.localeCompare($("h3", a).textContent, "ru");
      return Number($(".project-number", a).textContent) - Number($(".project-number", b).textContent);
    });
    sorted.forEach((card) => grid.appendChild(card));
  };

  const updateProjects = () => {
    const query = (search?.value || "").trim().toLocaleLowerCase("ru");
    let visible = 0;
    cards.forEach((card) => {
      const tags = (card.dataset.tags || "").split("|");
      const text = card.dataset.search || "";
      const show = (!query || text.includes(query)) &&
        (activeFilter === "all" || tags.includes(activeFilter)) &&
        (!favoritesOnly || favorites.has(card.dataset.slug));
      card.hidden = !show;
      if (show) visible += 1;
    });
    if (empty) empty.hidden = visible !== 0;
    if (result) result.textContent = `Показано: ${visible} из ${cards.length} · В избранном: ${favorites.size}`;
  };

  if (cards.length) {
    paintFavorites();
    sortCards();
    updateProjects();
    search?.addEventListener("input", updateProjects);
    sortSelect?.addEventListener("change", () => { sortCards(); updateProjects(); });
    filters?.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-filter]");
      if (!button) return;
      activeFilter = button.dataset.filter || "all";
      $$("button[data-filter]", filters).forEach((item) => {
        const selected = item === button;
        item.classList.toggle("active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      updateProjects();
    });
    favoriteOnlyButton?.addEventListener("click", () => {
      favoritesOnly = !favoritesOnly;
      paintFavorites();
      updateProjects();
    });
    resetProjects?.addEventListener("click", () => {
      if (search) search.value = "";
      if (sortSelect) sortSelect.value = "featured";
      activeFilter = "all";
      favoritesOnly = false;
      filters?.querySelectorAll("[data-filter]").forEach((button) => {
        const selected = button.dataset.filter === "all";
        button.classList.toggle("active", selected);
        button.setAttribute("aria-pressed", String(selected));
      });
      paintFavorites();
      sortCards();
      updateProjects();
    });
    grid.addEventListener("click", (event) => {
      const saveButton = event.target.closest(".project-save");
      if (!saveButton) return;
      const card = saveButton.closest(".project-card");
      const slug = card?.dataset.slug;
      if (!slug) return;
      if (favorites.has(slug)) favorites.delete(slug); else favorites.add(slug);
      saveFavorites();
      paintFavorites();
      updateProjects();
      notify(favorites.has(slug) ? "Добавлено в избранное" : "Удалено из избранного");
    });
  }

  // Быстрый просмотр проекта в модальном окне.
  const previewModal = $("#previewModal");
  const previewClose = $("#previewClose");
  const closePreview = () => {
    previewModal?.classList.remove("active");
    previewModal?.setAttribute("aria-hidden", "true");
  };
  grid?.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-preview]");
    if (!trigger || !previewModal) return;
    const card = trigger.closest(".project-card");
    if (!card) return;
    $("#previewNumber").textContent = `PROJECT / ${$(".project-number", card).textContent}`;
    $("#previewTitle").textContent = $("h3", card)?.textContent || "Проект";
    $("#previewDescription").textContent = $("p", card)?.textContent || "";
    $("#previewTags").replaceChildren(...$$(".chips span", card).map((tag) => {
      const chip = document.createElement("span"); chip.textContent = tag.textContent; return chip;
    }));
    $("#previewDetail").href = $(".project-link", card)?.href || "#projects";
    $("#previewLive").href = $(".project-live", card)?.href || "#projects";
    previewModal.classList.add("active");
    previewModal.setAttribute("aria-hidden", "false");
    previewClose?.focus();
  });
  previewClose?.addEventListener("click", closePreview);
  previewModal?.addEventListener("click", (event) => { if (event.target === previewModal) closePreview(); });

  // Случайный проект выбирается из всех карточек и мягко подсвечивается.
  $("#surpriseProject")?.addEventListener("click", () => {
    if (!cards.length) return;
    const card = cards[Math.floor(Math.random() * cards.length)];
    search.value = "";
    favoritesOnly = false;
    activeFilter = "all";
    filters?.querySelectorAll("[data-filter]").forEach((button) => {
      const selected = button.dataset.filter === "all";
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    paintFavorites();
    updateProjects();
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.classList.remove("spotlight");
    requestAnimationFrame(() => card.classList.add("spotlight"));
    window.setTimeout(() => card.classList.remove("spotlight"), 1500);
  });

  // Модальное меню команд: Ctrl/⌘ + K или кнопка в шапке.
  const palette = $("#commandPalette");
  const paletteInput = $("#paletteSearch");
  const paletteItems = $("#paletteItems");
  const openPalette = () => {
    if (!palette) return;
    palette.classList.add("active");
    palette.setAttribute("aria-hidden", "false");
    if (paletteInput) { paletteInput.value = ""; paletteInput.focus(); }
    $$("button", paletteItems).forEach((item) => { item.hidden = false; });
  };
  const closePalette = () => {
    palette?.classList.remove("active");
    palette?.setAttribute("aria-hidden", "true");
  };
  $("#paletteToggle")?.addEventListener("click", openPalette);
  $("#paletteClose")?.addEventListener("click", closePalette);
  palette?.addEventListener("click", (event) => { if (event.target === palette) closePalette(); });
  paletteInput?.addEventListener("input", () => {
    const query = paletteInput.value.trim().toLocaleLowerCase("ru");
    $$("button", paletteItems).forEach((item) => { item.hidden = !item.textContent.toLocaleLowerCase("ru").includes(query); });
  });
  paletteItems?.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.jump) {
      closePalette();
      $(button.dataset.jump)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (button.dataset.action === "theme") {
      closePalette();
      $("#themeToggle")?.click();
    } else if (button.dataset.action === "share") {
      closePalette();
      $("#sharePortfolio")?.click();
    } else if (button.dataset.action === "fx") {
      closePalette();
      $("#atmosphereToggle")?.click();
    }
  });

  const shareSite = async () => {
    const shareData = { title: document.title, text: "Посмотри моё портфолио IXLOSBEK", url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else await copyText(window.location.href);
    } catch (error) {
      if (error?.name !== "AbortError") notify("Не удалось поделиться ссылкой");
    }
  };
  $("#sharePortfolio")?.addEventListener("click", shareSite);

  // Копирование email и генератор письма через установленную почтовую программу.
  $$('[data-copy]').forEach((button) => button.addEventListener("click", () => copyText(button.dataset.copy || "")));
  const contactForm = $("#contactForm");
  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    const data = new FormData(contactForm);
    const payload = {
      sender: String(data.get("sender") || "").trim(),
      subject: String(data.get("subject") || "").trim(),
      email: String(data.get("email") || "").trim(),
      message: String(data.get("message") || "").trim(),
    };
    const csrf = contactForm.querySelector('[name="csrfmiddlewaretoken"]')?.value || "";
    const submit = contactForm.querySelector('[type="submit"]');
    if (submit) { submit.disabled = true; submit.dataset.originalText = submit.textContent; submit.textContent = "Отправка..."; }
    fetch("/api/contact/", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRFToken": csrf },
      body: JSON.stringify(payload),
      credentials: "same-origin",
    }).then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Не удалось отправить сообщение");
      contactForm.reset();
      notify(result.message || "Сообщение отправлено");
    }).catch((error) => notify(error.message || "Ошибка отправки")).finally(() => {
      if (submit) { submit.disabled = false; submit.textContent = submit.dataset.originalText || "Отправить сообщение"; }
    });
  });

  // Кнопка возврата наверх.
  const topButton = $("#backToTop");
  const updateTopButton = () => topButton?.classList.toggle("visible", window.scrollY > 650);
  window.addEventListener("scroll", updateTopButton, { passive: true });
  updateTopButton();
  topButton?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Демонстрационная консоль — только команды сайта, никаких shell-команд.
  const terminalForm = $("#terminalForm");
  const terminalInput = $("#terminalInput");
  const terminalOutput = $("#terminalOutput");
  if (terminalForm && terminalInput && terminalOutput) {
    const widget = $(".terminal-widget");
    const telegram = widget?.dataset.telegram || "DarkNightZone";
    const email = widget?.dataset.email || "";
    const addLine = (text, className = "terminal-response") => {
      const line = document.createElement("p");
      line.className = className;
      line.textContent = text;
      terminalOutput.appendChild(line);
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    };
    const commands = {
      help: () => ["Доступные команды:", "help · about · skills · projects · contact", "date · whoami · theme · fx · open projects · clear"],
      about: () => ["Ихлосбек — начинающий разработчик.", "Изучаю Python и веб-разработку через собственные проекты."],
      whoami: () => ["guest@ixlosbek-portfolio", "Роль: посетитель портфолио · Доступ: read-only"],
      skills: () => ["Python · Django · HTML · CSS · JavaScript", "Уровни и описания смотри в разделе «Навыки»."],
      projects: () => ["Проекты в портфолио:", ...cards.map((card) => `• ${$("h3", card)?.textContent || "Проект"}`)],
      contact: () => [`Telegram: @${telegram}`, `Email: ${email}`],
      date: () => [`Время Ташкента: ${new Intl.DateTimeFormat("ru-RU", { timeZone: "Asia/Tashkent", dateStyle: "medium", timeStyle: "medium" }).format(new Date())}`],
      theme: () => [`Текущая тема: ${root.dataset.theme || "dark"}`, "Сменить тему можно кнопкой в шапке."],
      fx: () => { $("#atmosphereToggle")?.click(); return ["Режим фоновой анимации переключён."]; },
      "open projects": () => { $("#projects")?.scrollIntoView({ behavior: "smooth" }); return ["Открываю раздел проектов..."]; },
    };
    terminalForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const command = terminalInput.value.trim().toLocaleLowerCase("ru");
      if (!command) return;
      addLine(`guest@ixlosbek:~$ ${command}`, "terminal-command");
      terminalInput.value = "";
      if (command === "clear") { terminalOutput.replaceChildren(); return; }
      (commands[command] ? commands[command]() : [`Команда «${command}» не найдена. Введи help.`]).forEach((line) => addLine(line));
    });
  }

  // Клавиатурные сочетания и закрытие модальных окон.
  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const typing = target instanceof HTMLElement && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (palette?.classList.contains("active")) closePalette(); else openPalette();
      return;
    }
    if (!typing && event.key === "/") { event.preventDefault(); openPalette(); }
    if (!typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const quickJumps = { h: "#home", p: "#projects", s: "#skills", t: "#timeline", "1": "#console", c: "#contact" };
      const destination = quickJumps[event.key.toLowerCase()];
      if (destination) $(destination)?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (event.key.toLowerCase() === "d") $("#themeToggle")?.click();
      if (event.key.toLowerCase() === "m") $("#atmosphereToggle")?.click();
    }
    if (event.key === "Escape") { closePalette(); closePreview(); }
  });
});
