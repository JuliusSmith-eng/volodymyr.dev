/* Калькулятор стоимости с геймификацией.
   Данные (цены, тексты, список опций): js/data/calculator.js. Эффекты: js/modules/fx.js.

   Как это связано:
     опция (карточка слева) ── клик ──▶ состояние ──▶ итог (одометр) + уровень/достижения
                                         └──▶ полёт иконки по дуге ──▶ «слот» в макете справа
   Слот в макете это элемент с data-slot="..." в index.html. Опция указывает свой слот полем slot. */
(function () {
  const App = (window.App = window.App || {});
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const DEV = location.protocol === "file:" || /^(localhost|127\.|\[::1\]|0\.0\.0\.0)/.test(location.hostname);
  const ORDER = { uk: ["uk", "en", "de"], en: ["en", "uk", "de"], de: ["de", "en", "uk"] };
  const MOCK_LANGS = ["UA", "EN", "DE", "PL", "FR", "ES"];
  const BLOCK_KINDS = ["rev", "faq", "gal", "logo", "team"];
  const $ = id => document.getElementById(id);
  const t = (k, v) => App.i18n.fmt(k, v);
  const esc = s => { const d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; };
  const warn = (...a) => { if (DEV) console.warn("[calculator]", ...a); };

  const svg = inner => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  const ICONS = {
    page: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M7 13h6"/>'),
    telegram: svg('<path d="M21.5 4.5L2.8 11.7l5.6 2 2 5.6 3.2-4.4 4.4 3.3z"/><path d="M8.4 13.7l13.1-9.2"/>'),
    globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9S14.5 18.4 12 21c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3z"/>'),
    widget: svg('<path d="M4 7h8M18 7h2M4 12h2M12 12h8M4 17h10M20 17h0"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/>'),
    blocks: svg('<rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/>'),
    forms: svg('<circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><path d="M7 12h3M14 12h3"/>'),
    theme: svg('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>'),
    sheet: svg('<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M4 9h16M4 14h16M10 9v12"/>'),
    bolt: svg('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'),
    seo: svg('<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.3-4.3"/>'),
    chart: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    card: svg('<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h4"/>'),
    shield: svg('<path d="M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>'),
    tool: svg('<path d="M14.5 6a4 4 0 0 0 5 5L9 21.5 2.5 15 13 4.5a4 4 0 0 0 1.5 1.5z"/>'),
    crown: svg('<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>')
  };
  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  // Достижения: id → условие. Названия берутся из i18n (calc.ach.<id>)
  const ACH = [
    { id: "speed", icon: "bolt", test: S => S.on("urgent") },
    { id: "polyglot", icon: "globe", test: S => S.on("i18n") && S.qty("i18n") >= 4 },
    { id: "auto", icon: "telegram", test: S => S.on("telegram") && S.on("crm") },
    { id: "play", icon: "widget", test: S => S.on("widget") },
    { id: "style", icon: "theme", test: S => S.on("theme") && S.on("blocks") && S.qty("blocks") >= 2 },
    { id: "full", icon: "crown", test: S => S.all() }
  ];

  let D = null, opts = [], byId = {}, state = {};
  let el = {}, mock = null;
  const flights = {};
  let shown = 0, tweenRaf = 0, liveTimer = 0, themeTimer = 0;
  let levelIdx = 0, unlocked = new Set();

  /* ---------- тексты и цены ---------- */
  const pick = (o, f) => { for (const l of ORDER[App.i18n.lang] || ORDER.uk) if (o[l] && o[l][f]) return o[l][f]; return ""; };
  const st = o => state[o.id];
  const cost = o => {
    if (!st(o).on) return 0;
    return o.price + (o.qty ? o.qty.perUnit * Math.max(0, st(o).qty - o.qty.included) : 0);
  };
  const startCost = o => o.price + (o.qty ? o.qty.perUnit * Math.max(0, o.qty.start - o.qty.included) : 0);
  const total = () => D.base.price + opts.reduce((s, o) => s + cost(o), 0);
  const money = n => "$" + n;
  const selected = () => opts.filter(o => st(o).on);

  /* ---------- список опций ---------- */
  function baseHtml() {
    return `<label class="opt opt--base is-on">
      <input class="opt__input" type="checkbox" checked disabled aria-labelledby="ot-base" aria-describedby="od-base">
      <span class="opt__icon">${ICONS.page}</span>
      <span class="opt__body"><span class="opt__title" id="ot-base">${esc(pick(D.base, "title"))}</span><span class="opt__desc" id="od-base">${esc(pick(D.base, "desc"))}</span></span>
      <span class="opt__side"><span class="opt__price">${money(D.base.price)}</span><span class="opt__tag">${esc(t("calc.included"))}</span></span>
    </label>`;
  }
  function optHtml(o) {
    const on = st(o).on, q = o.qty;
    const note = pick(o, "note");
    const qty = q ? `<span class="opt__qty"${on ? "" : " hidden"}>
        <button type="button" class="opt__step" data-step="-1" aria-label="${esc(t("calc.less"))}">−</button>
        <span class="opt__qty-n">${esc(pick(o, "qty").replace("{n}", st(o).qty))}</span>
        <button type="button" class="opt__step" data-step="1" aria-label="${esc(t("calc.more"))}">+</button></span>` : "";
    return `<label class="opt${on ? " is-on" : ""}" data-id="${esc(o.id)}">
      <input class="opt__input" type="checkbox"${on ? " checked" : ""} aria-labelledby="ot-${esc(o.id)}" aria-describedby="od-${esc(o.id)}">
      <span class="opt__icon">${ICONS[o.icon] || ICONS.page}</span>
      <span class="opt__body"><span class="opt__title" id="ot-${esc(o.id)}">${esc(pick(o, "title"))}</span><span class="opt__desc" id="od-${esc(o.id)}">${esc(pick(o, "desc"))}</span>${note ? `<span class="opt__note">${esc(note)}</span>` : ""}${qty}</span>
      <span class="opt__side"><span class="opt__price">${money(on ? cost(o) : startCost(o))}</span><span class="opt__check" aria-hidden="true">${CHECK}</span></span>
    </label>`;
  }
  function renderOptions() {
    el.opts.innerHTML = baseHtml() + opts.map(optHtml).join("");
  }
  function refreshCard(o) { // точечное обновление карточки: без перерисовки списка (анимации не сбрасываются)
    const card = el.opts.querySelector(`.opt[data-id="${o.id}"]`);
    if (!card) return;
    card.classList.toggle("is-on", st(o).on);
    card.querySelector(".opt__input").checked = st(o).on;
    card.querySelector(".opt__price").textContent = money(st(o).on ? cost(o) : startCost(o));
    if (o.qty) {
      card.querySelector(".opt__qty").hidden = !st(o).on;
      card.querySelector(".opt__qty-n").textContent = pick(o, "qty").replace("{n}", st(o).qty);
    }
  }

  /* ---------- итог ---------- */
  function paintTotal(v) { el.value.textContent = money(v); }
  function setTotal(to, instant) {
    cancelAnimationFrame(tweenRaf);
    const from = shown;
    clearTimeout(liveTimer);
    liveTimer = setTimeout(() => { el.live.textContent = `${t("calc.total")}: ${money(to)}`; }, 400);
    if (instant || reduced.matches || from === to) { shown = to; paintTotal(to); return; }
    const t0 = performance.now(), dur = 560;
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      shown = Math.round(from + (to - from) * e);
      paintTotal(shown);
      if (k < 1) tweenRaf = requestAnimationFrame(step);
    };
    tweenRaf = requestAnimationFrame(step);
    el.value.animate && el.value.animate([{ transform: "scale(1.12)" }, { transform: "scale(1)" }], { duration: 380, easing: "cubic-bezier(.2,.8,.3,1)" });
  }
  function showDelta(d) {
    if (!d || reduced.matches || !el.delta.animate) return;
    el.delta.textContent = (d > 0 ? "+" : "−") + money(Math.abs(d));
    el.delta.classList.toggle("is-minus", d < 0);
    el.delta.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "translateY(-4px)", offset: 0.25 }, { opacity: 0, transform: "translateY(-22px)" }], { duration: 1000, easing: "ease-out" });
  }

  /* ---------- макет справа ---------- */
  const slot = s => mock.querySelector(`[data-slot="${s}"]`);
  function targetFor(o) { return o.slot === "chip" ? mock.querySelector(".mock__foot") : slot(o.slot); }
  const pop = n => n.animate && !reduced.matches && n.animate([{ transform: "scale(.2)", opacity: 0 }, { transform: "scale(1.25)", opacity: 1, offset: 0.6 }, { transform: "scale(1)" }], { duration: 520, easing: "cubic-bezier(.2,.8,.3,1)" });
  function pulseMock() {
    if (reduced.matches) return;
    mock.classList.remove("is-pulse"); void mock.offsetWidth; mock.classList.add("is-pulse");
  }

  function setLangs(n) {
    const box = slot("lang");
    while (box.children.length < n) {
      const b = document.createElement("b");
      b.textContent = MOCK_LANGS[box.children.length] || "??";
      if (!box.children.length) b.className = "is-act";
      box.appendChild(b);
      if (box.children.length > 2) pop(b);
    }
    while (box.children.length > n) box.lastElementChild.remove();
    box.classList.toggle("is-on", n > 0);
  }
  function blockHtml(kind) {
    const inner = {
      rev: "<i></i><i></i><i></i><em>★★★★★</em>", faq: "<i></i><i></i><i></i>",
      gal: "<i></i><i></i><i></i><i></i>", logo: "<i></i><i></i><i></i><i></i><i></i>", team: "<i></i><i></i><i></i>"
    }[kind];
    return `<div class="mock__blk mock__blk--${kind}">${inner}</div>`;
  }
  function setBlocks(n) {
    const box = slot("blocks");
    box.style.flexGrow = n;
    box.classList.toggle("is-on", n > 0);
    while (box.children.length < n) {
      box.insertAdjacentHTML("beforeend", blockHtml(BLOCK_KINDS[box.children.length % BLOCK_KINDS.length]));
      const b = box.lastElementChild;
      b.animate && !reduced.matches && b.animate([{ opacity: 0, transform: "scaleY(.3)" }, { opacity: 1, transform: "none" }], { duration: 480, easing: "cubic-bezier(.2,.8,.3,1)" });
    }
    while (box.children.length > n) box.lastElementChild.remove();
  }
  function setChip(o, on) {
    const box = $("mockChips"), cur = box.querySelector(`[data-chip="${o.id}"]`);
    if (on && !cur) {
      box.insertAdjacentHTML("beforeend", `<span class="mock__chip" data-chip="${esc(o.id)}">${ICONS[o.icon] || ""}<b>${esc(o.chip || o.id)}</b></span>`);
      pop(box.lastElementChild);
    } else if (!on && cur) cur.remove();
    box.classList.toggle("is-on", box.children.length > 0);
  }
  function demoTheme() { // показываем переключение темы: светлая, затем обратно в тёмную
    clearTimeout(themeTimer);
    themeTimer = setTimeout(() => { mock.dataset.theme = "light"; themeTimer = setTimeout(() => { mock.dataset.theme = "dark"; }, 1500); }, 350);
  }
  function applySlot(o, on) {
    switch (o.slot) {
      case "lang": setLangs(on ? st(o).qty : 0); break;
      case "blocks": setBlocks(on ? st(o).qty : 0); break;
      case "chip": setChip(o, on); break;
      default: {
        const s = slot(o.slot);
        if (!s) { warn(`у опции «${o.id}» нет слота «${o.slot}» в макете`); break; }
        s.classList.toggle("is-on", on);
        if (on && o.slot !== "urgent") pop(s);
        if (o.slot === "urgent") mock.classList.toggle("is-turbo", on);
        if (o.slot === "theme") { if (on) demoTheme(); else { clearTimeout(themeTimer); mock.dataset.theme = "dark"; } }
      }
    }
  }

  // Полёт иконки в макет, затем встраивание. Если полёт невозможен (цель вне экрана, reduced motion), просто показываем результат.
  async function flyThenApply(o, origin) {
    const target = targetFor(o);
    flights[o.id] && flights[o.id].cancel();
    if (!target || !origin || !App.fx) { applySlot(o, true); return; }
    const f = App.fx.fly(origin, target, { icon: ICONS[o.icon] || ICONS.page, duration: innerWidth < 700 ? 760 : 950 });
    flights[o.id] = f;
    const landed = await f.done;
    if (flights[o.id] !== f) return;           // вылетел новый токен этой опции
    delete flights[o.id];
    if (!st(o).on) return;                      // опцию успели выключить в полёте
    applySlot(o, true);
    if (landed) App.fx.ring(target); else pulseMock();
  }

  /* ---------- игровая часть ---------- */
  const S = {
    on: id => !!byId[id] && st(byId[id]).on,
    qty: id => (byId[id] ? st(byId[id]).qty : 0),
    all: () => opts.length > 0 && opts.every(o => st(o).on)
  };
  function levelInfo() {
    const lv = D.game.levels, n = selected().length;
    let idx = 0;
    lv.forEach((from, i) => { if (n >= from) idx = i; });
    return { n, idx, next: lv[idx + 1], top: lv[lv.length - 1] };
  }
  function renderGame(silent) {
    const L = levelInfo(), names = App.i18n.t("calc.levels");
    el.level.textContent = names[L.idx] || "";
    el.next.textContent = L.next != null ? t("calc.next", { n: L.next - L.n, name: names[L.idx + 1] }) : t("calc.max");
    const fill = L.top ? Math.min(1, L.n / L.top) : 0;
    el.fill.style.transform = `scaleX(${fill})`;
    el.sumFill.style.transform = `scaleX(${fill})`;
    el.sumLevel.textContent = `${t("calc.level")}: ${names[L.idx] || ""}`;
    if (!silent && L.idx > levelIdx) {
      const r = el.level.getBoundingClientRect();
      App.fx && App.fx.confetti(r.left + r.width / 2, r.top + r.height / 2, 34);
      App.fx && App.fx.toast(t("calc.toast.level", { name: names[L.idx] }));
      el.level.animate && !reduced.matches && el.level.animate([{ transform: "scale(1)" }, { transform: "scale(1.35)" }, { transform: "scale(1)" }], { duration: 700, easing: "cubic-bezier(.2,.8,.3,1)" });
    }
    levelIdx = L.idx;

    const now = new Set(ACH.filter(a => a.test(S)).map(a => a.id));
    el.ach.innerHTML = ACH.map(a => {
      const name = t(`calc.ach.${a.id}`), on = now.has(a.id);
      return `<li class="ach${on ? " is-on" : ""}" data-ach="${a.id}" title="${esc(on ? name : name + " — " + t("calc.achLocked"))}" aria-label="${esc(name)}">${ICONS[a.icon]}</li>`;
    }).join("");
    now.forEach(id => {
      if (!unlocked.has(id) && !silent) {
        const li = el.ach.querySelector(`[data-ach="${id}"]`);
        li && li.animate && !reduced.matches && li.animate([{ transform: "scale(.5) rotate(-20deg)" }, { transform: "scale(1.3) rotate(8deg)", offset: 0.55 }, { transform: "none" }], { duration: 650, easing: "cubic-bezier(.2,.8,.3,1)" });
        App.fx && App.fx.toast(t("calc.toast.ach", { name: t(`calc.ach.${id}`) }));
      }
    });
    unlocked = now;
  }
  function renderTicks() {
    const lv = D.game.levels, top = lv[lv.length - 1];
    el.ticks.innerHTML = lv.slice(1).map(v => `<i style="left:${(v / top) * 100}%"></i>`).join("");
  }

  /* ---------- действия пользователя ---------- */
  function toggle(o, on, origin) {
    const before = total();
    st(o).on = on;
    refreshCard(o);
    const after = total();
    setTotal(after);
    showDelta(after - before);
    if (on) flyThenApply(o, origin);
    else { flights[o.id] && flights[o.id].cancel(); delete flights[o.id]; applySlot(o, false); }
    renderGame(false);
  }
  function changeQty(o, dir, origin) {
    const q = o.qty, s = st(o), next = Math.min(q.max, Math.max(q.min, s.qty + dir));
    if (next === s.qty) return;
    const before = total();
    s.qty = next;
    refreshCard(o);
    const after = total();
    setTotal(after);
    showDelta(after - before);
    if (dir > 0) flyThenApply(o, origin); else applySlot(o, true);
    renderGame(false);
  }

  function orderText() {
    const lines = [t("calc.orderHead"), `• ${pick(D.base, "title")}: ${money(D.base.price)}`];
    selected().forEach(o => {
      const q = o.qty ? ` (${pick(o, "qty").replace("{n}", st(o).qty)})` : "";
      lines.push(`• ${pick(o, "title")}${q}: ${money(cost(o))}`);
    });
    lines.push("", t("calc.orderTotal", { total: money(total()) }));
    return lines.join("\n");
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (_) {}
    try {
      const ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;left:-999px;top:0";
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch (_) { return false; }
  }
  async function order() {
    const r = el.order.getBoundingClientRect();
    App.fx && App.fx.confetti(r.left + r.width / 2, r.top + r.height / 2, 44);
    const ok = await copy(orderText());
    App.fx && App.fx.toast(t(ok ? "calc.toast.copied" : "calc.toast.copyFail"));
    // переходим к контактам и подсвечиваем их: сообщение остаётся только вставить в чат
    setTimeout(() => {
      const c = $("contacts");
      if (c) c.scrollIntoView({ behavior: reduced.matches ? "auto" : "smooth" });
      document.querySelectorAll(".contact").forEach(x => { x.classList.remove("is-hint"); void x.offsetWidth; x.classList.add("is-hint"); });
    }, 700);
  }

  /* ---------- инициализация ---------- */
  function init() {
    D = window.CALC;
    el = {
      opts: $("opts"), value: $("sumValue"), delta: $("sumDelta"), live: $("sumLive"), order: $("calcOrder"),
      level: $("gameLevel"), next: $("gameNext"), fill: $("gameFill"), ticks: $("gameTicks"), ach: $("gameAch"),
      sumFill: $("sumFill"), sumLevel: $("sumLevel")
    };
    mock = $("mock");
    if (!D || !el.opts || !mock) return;

    const ids = new Set();
    opts = (D.options || []).filter(o => {
      if (!o.id || ids.has(o.id)) { warn(`повторяется или пустой id «${o.id}»: опция пропущена`); return false; }
      ids.add(o.id);
      if (!pick(o, "title")) warn(`«${o.id}»: нет title`);
      if (!ICONS[o.icon]) warn(`«${o.id}»: нет иконки «${o.icon}», будет использована стандартная`);
      return true;
    });
    opts.forEach(o => { byId[o.id] = o; state[o.id] = { on: false, qty: o.qty ? o.qty.start : 1 }; });

    renderOptions();
    renderTicks();
    shown = total();
    paintTotal(shown);
    el.live.textContent = `${t("calc.total")}: ${money(shown)}`;
    renderGame(true);

    // клики: чекбокс карточки и кнопки «+/−» (делегирование на контейнере)
    el.opts.addEventListener("change", e => {
      const card = e.target.closest(".opt[data-id]");
      if (!card || !e.target.classList.contains("opt__input")) return;
      toggle(byId[card.dataset.id], e.target.checked, card.querySelector(".opt__icon"));
    });
    el.opts.addEventListener("click", e => {
      const b = e.target.closest(".opt__step");
      if (!b) return;
      e.preventDefault();
      const card = b.closest(".opt[data-id]");
      changeQty(byId[card.dataset.id], +b.dataset.step, b);
    });
    el.order.addEventListener("click", order);
    // переключатель темы в макете можно нажимать самому
    const tt = slot("theme");
    tt && tt.addEventListener("click", () => { clearTimeout(themeTimer); mock.dataset.theme = mock.dataset.theme === "dark" ? "light" : "dark"; });

    App.i18n.onChange(() => { renderOptions(); renderGame(true); el.live.textContent = `${t("calc.total")}: ${money(total())}`; });
  }

  App.calculator = { init, orderText }; // orderText открыт для проверки из консоли
})();
