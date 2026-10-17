/* Галерея работ: лента-слайдер + окно работы.
   Данные лежат в js/data/works.js (там же инструкция, как добавить работу).
   Этот модуль только связывает их с интерфейсом:
     data → нормализация → карточки в ленте → клик → App.workModal
   Движок ленты: js/modules/slider.js, окно: js/modules/work-modal.js. */
(function () {
  const App = (window.App = window.App || {});
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const DEV = location.protocol === "file:" || /^(localhost|127\.|\[::1\]|0\.0\.0\.0)/.test(location.hostname);
  const LANG_ORDER = { uk: ["uk", "en", "de"], en: ["en", "uk", "de"], de: ["de", "en", "uk"] };

  const t = (k, v) => App.i18n.fmt(k, v);
  const esc = s => { const d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; };
  const warn = (...a) => { if (DEV) console.warn("[works]", ...a); };

  let P = { works: [], categories: {} };
  let items = [];            // все работы, нормализованные (без текстов)
  let list = [];             // то, что показано сейчас (с учётом фильтра)
  let curCat = "all";
  let slider = null, ui = {}, imgs = [], lastP = 0;
  // Картинка в карточке шире её на 65% (width: 165% в works.css) и сдвигается вдоль этого запаса.
  // Сдвиг в % собственной ширины = 65 / 165. Меняете ширину в CSS: поправьте здесь.
  const PARALLAX = 100 * (1.65 - 1) / 1.65;

  /* ---------- данные ---------- */

  // Берём текст на текущем языке, недостающие поля добираем с запасных языков (uk → en → de и т.п.)
  function pick(obj, field) {
    for (const l of LANG_ORDER[App.i18n.lang] || LANG_ORDER.uk) if (obj[l] && obj[l][field]) return obj[l][field];
    return "";
  }
  function catLabel(key) {
    const c = P.categories[key];
    if (!c) return key;
    if (typeof c === "string") return c;
    for (const l of LANG_ORDER[App.i18n.lang] || LANG_ORDER.uk) if (c[l]) return c[l];
    return key;
  }

  function normalize(raw, n) {
    const id = String(raw.id || `work-${n + 1}`).trim();
    const ext = String(raw.ext || P.imageExt || "webp").replace(/^\./, "");
    const dir = `${P.imageDir || "assets/works"}/${id}/`;
    let imgs = raw.images;
    if (typeof imgs === "number") imgs = Array.from({ length: imgs }, (_, i) => `${i + 1}.${ext}`);
    imgs = (Array.isArray(imgs) ? imgs : []).map(s => (/[\/:]/.test(s) ? s : dir + s)); // «home.webp» → в папке работы
    let cover = imgs[0];
    if (typeof raw.cover === "number") cover = imgs[raw.cover - 1] || cover;
    else if (typeof raw.cover === "string") cover = /[\/:]/.test(raw.cover) ? raw.cover : dir + raw.cover;

    // проверки: ловим типичные ошибки при добавлении работы (пишутся в консоль только локально)
    if (!imgs.length) warn(`«${id}»: нет картинок (поле images)`);
    if (!P.categories[raw.cat]) warn(`«${id}»: категории «${raw.cat}» нет в categories`);
    if (!(raw.uk && raw.uk.title)) warn(`«${id}»: не заполнен uk.title`);
    if (raw.link && /^\s*(javascript|data|vbscript):/i.test(raw.link)) warn(`«${id}»: ссылка link не будет работать (запрещённая схема)`);
    return { id, cat: raw.cat, images: imgs, cover, stack: raw.stack || [], link: raw.link, raw };
  }

  function localize(w) {
    const r = w.raw;
    const specs = [];
    ["type", "term", "result"].forEach(k => { const v = pick(r, k); if (v) specs.push([t(`work.spec.${k}`), v]); });
    const extra = (r[App.i18n.lang] && r[App.i18n.lang].specs) || (r.en && r.en.specs) || (r.uk && r.uk.specs) || [];
    return {
      id: w.id, cat: w.cat, catLabel: catLabel(w.cat),
      title: pick(r, "title") || w.id, desc: pick(r, "desc"), linkText: pick(r, "linkText"),
      stack: w.stack, specs: specs.concat(extra), images: w.images, cover: w.cover, link: w.link
    };
  }

  let L = []; // локализованные копии items, в том же порядке (обновляются при смене языка)
  function syncSearchApi() { L = items.map(localize); App.gallery.works = L; } // App.gallery.works читает поиск

  /* ---------- разметка ---------- */

  const pad = n => String(n).padStart(2, "0");

  function cardHtml(w, i) {
    const lw = L[items.indexOf(w)];
    return `<li><button type="button" class="card" data-i="${i}" aria-haspopup="dialog" aria-label="${esc(t("works.open", { title: lw.title }))}">` +
      `<img class="card__img" src="${esc(lw.cover)}" alt="" width="1600" height="1000" loading="lazy" decoding="async" draggable="false">` +
      `<span class="card__shade"></span><span class="card__num">${pad(i + 1)}</span><span class="card__go" aria-hidden="true">↗</span>` +
      `<span class="card__meta"><span class="card__cat">${esc(lw.catLabel)}</span><span class="card__title">${esc(lw.title)}</span></span></button></li>`;
  }

  function parallax(p) {
    lastP = p;
    if (reduced.matches) return;
    const v = `translate3d(${(-p * PARALLAX).toFixed(3)}%,0,0)`;
    for (let i = 0; i < imgs.length; i++) imgs[i].style.transform = v;
  }

  function buildCards() {
    ui.track.innerHTML = list.map(cardHtml).join("");
    imgs = Array.from(ui.track.querySelectorAll(".card__img"));
    parallax(lastP);
    slider.refresh();
  }

  // Смена языка: меняем только тексты, картинки и раскладка остаются
  function relabelCards() {
    ui.track.querySelectorAll(".card").forEach(btn => {
      const w = list[+btn.dataset.i], lw = L[items.indexOf(w)];
      btn.setAttribute("aria-label", t("works.open", { title: lw.title }));
      btn.querySelector(".card__cat").textContent = lw.catLabel;
      btn.querySelector(".card__title").textContent = lw.title;
    });
  }

  function usedCategories() {
    const used = new Set(items.map(w => w.cat));
    return Object.keys(P.categories).filter(k => used.has(k));
  }

  function buildFilters() {
    const cats = usedCategories();
    ui.filters.hidden = cats.length < 2; // одна категория: фильтр не нужен
    ui.filters.innerHTML = ["all"].concat(cats).map(k =>
      `<button type="button" data-cat="${esc(k)}" aria-pressed="${k === curCat}">${esc(k === "all" ? t("works.all") : catLabel(k))}</button>`).join("");
  }

  function relabelFilters() {
    ui.filters.querySelectorAll("button").forEach(b => { b.textContent = b.dataset.cat === "all" ? t("works.all") : catLabel(b.dataset.cat); });
  }

  /* ---------- фильтр ---------- */

  function setFilter(cat, instant) {
    curCat = cat;
    ui.filters.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b.dataset.cat === cat));
    const apply = () => {
      list = cat === "all" ? items.slice() : items.filter(w => w.cat === cat);
      buildCards();
      slider.reset();
    };
    if (instant || reduced.matches || !ui.track.animate) { apply(); return; }
    const out = ui.track.animate({ opacity: [1, 0] }, { duration: 140, fill: "forwards" });
    out.onfinish = () => {
      apply();
      out.cancel();
      ui.track.animate({ opacity: [0, 1] }, { duration: 260, easing: "ease-out" });
    };
  }

  /* ---------- окно работы ---------- */

  let openAt = -1;
  function openWork(i) {
    const w = list[i];
    if (!w) return;
    openAt = i;
    App.workModal.open(L[items.indexOf(w)], list.length > 1 ? { onNav: step } : null);
  }
  function step(dir) { // соседняя работа внутри текущего фильтра; лента едет следом
    const i = (openAt + dir + list.length) % list.length;
    openAt = i;
    App.workModal.update(L[items.indexOf(list[i])]);
    const card = ui.track.children[i];
    if (card) slider.center(card);
  }

  /* ---------- интерфейс ленты ---------- */

  function updateUi(p, x, max) {
    parallax(p);
    ui.bar.style.setProperty("--p", p.toFixed(4));
    const atStart = x <= 1, atEnd = x >= max - 1;
    if (ui.prev.getAttribute("aria-disabled") !== String(atStart)) {
      ui.prev.setAttribute("aria-disabled", atStart);
      ui.viewport.classList.toggle("at-start", atStart);
    }
    if (ui.next.getAttribute("aria-disabled") !== String(atEnd)) {
      ui.next.setAttribute("aria-disabled", atEnd);
      ui.viewport.classList.toggle("at-end", atEnd);
    }
  }

  function localizeStatic() {
    // подписи ленты, которым нужен перевод, но нет data-i18n (составные)
    relabelFilters();
    relabelCards();
  }

  function init() {
    P = window.PORTFOLIO || P;
    ui = {
      section: document.getElementById("works"),
      filters: document.getElementById("filters"),
      slider: document.getElementById("slider"),
      viewport: document.getElementById("sliderViewport"),
      track: document.getElementById("track"),
      prev: document.getElementById("sliderPrev"),
      next: document.getElementById("sliderNext"),
      bar: document.getElementById("sliderBar"),
      uiRow: document.getElementById("sliderUi")
    };
    if (!ui.track || !App.slider) return;

    // нормализация + проверка дубликатов id
    const seen = new Set();
    items = (P.works || []).map(normalize).filter(w => {
      if (seen.has(w.id)) { warn(`повторяется id «${w.id}»: вторая работа пропущена`); return false; }
      seen.add(w.id);
      return w.images.length > 0;
    });
    syncSearchApi();
    list = items.slice();

    slider = App.slider.create(ui.viewport, ui.track, {
      item: "li",
      onMove: updateUi,
      onMeasure: (max, vis) => {
        ui.bar.style.setProperty("--vis", vis.toFixed(4));
        ui.uiRow.classList.toggle("is-static", max <= 1); // всё влезает: стрелки и полоса не нужны
      },
      onInteract: () => ui.slider.classList.add("is-used") // прячем подсказку после первого жеста
    });

    buildFilters();
    buildCards();

    ui.filters.addEventListener("click", e => {
      const b = e.target.closest("button");
      if (b && b.dataset.cat !== curCat) setFilter(b.dataset.cat);
    });
    ui.track.addEventListener("click", e => {
      const b = e.target.closest(".card");
      if (b) openWork(+b.dataset.i);
    });
    // картинка не нашлась: показываем заглушку и подсказываем в консоли, какой путь не сработал
    ui.track.addEventListener("error", e => {
      if (e.target.tagName !== "IMG") return;
      const card = e.target.closest(".card");
      if (card) card.classList.add("is-broken");
      warn("не загрузилась картинка:", e.target.getAttribute("src"));
    }, true);
    ui.prev.addEventListener("click", () => slider.goBy(-1));
    ui.next.addEventListener("click", () => slider.goBy(1));

    // плавное появление ленты при первом показе (без постоянного filter/will-change на большой области)
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(en => {
        if (en[0].isIntersecting) { ui.slider.classList.add("is-in"); io.disconnect(); }
      }, { threshold: 0.1 });
      io.observe(ui.slider);
    } else ui.slider.classList.add("is-in");

    App.workModal.init();

    App.i18n.onChange(() => {
      syncSearchApi();
      localizeStatic();
      if (App.workModal.isOpen && openAt >= 0) App.workModal.update(L[items.indexOf(list[openAt])]);
    });

    // открыть работу из поиска (индекс в полном списке): сбросить фильтр, подвести ленту, открыть окно
    App.gallery.open = n => {
      const w = items[n];
      if (!w) return;
      if (curCat !== "all") setFilter("all", true);
      const i = list.indexOf(w);
      requestAnimationFrame(() => {
        slider.center(ui.track.children[i]);
        openWork(i);
      });
    };
  }

  App.gallery = { works: [], init };
})();
