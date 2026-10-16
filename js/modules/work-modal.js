/* Окно работы: галерея картинок проекта + описание + характеристики.
   Построено на нативном <dialog>: фокус-ловушку, Esc и инертность фона даёт браузер.
   Данные приходят готовыми (уже на нужном языке), модуль ничего не знает о списке работ.

   const data = { id, title, desc, cat, stack: [], specs: [[label, value]], images: [url], link }
   App.workModal.open(data, { onNav(dir) })   // onNav: перейти к соседней работе (или не передавать)
   App.workModal.update(data)                 // подставить новый текст (смена языка)  */
(function () {
  const App = (window.App = window.App || {});
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const $ = id => document.getElementById(id);
  const t = (k, v) => (App.i18n ? App.i18n.fmt(k, v) : k);

  let dlg, el, data = null, idx = 0, opened = false, onNav = null, closeTimer = 0;
  const warmed = new Set();

  const esc = s => { const d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; };
  const safeUrl = u => (/^(https?:\/\/|\/|\.\/|#)/i.test(u || "") ? u : "");

  function warm(src) { // подгружаем соседние картинки заранее, чтобы листалось без пауз
    if (!src || warmed.has(src)) return;
    warmed.add(src);
    const img = new Image();
    img.decoding = "async";
    img.src = src;
  }

  function showImage(i, animate) {
    const n = data.images.length;
    idx = (i + n) % n;
    const src = data.images[idx];
    el.img.alt = t("work.imgAlt", { title: data.title, n: idx + 1, total: n });
    el.img.onload = () => {
      el.viewer.classList.remove("is-loading");
      if (animate && !reduced.matches) el.img.animate([{ opacity: 0, transform: "scale(1.03)" }, { opacity: 1, transform: "scale(1)" }], { duration: 320, easing: "ease-out" });
    };
    if (el.img.getAttribute("src") !== src) { el.viewer.classList.add("is-loading"); el.img.src = src; }
    el.count.textContent = `${idx + 1} / ${n}`;
    el.thumbs.querySelectorAll("button").forEach((b, k) => {
      const on = k === idx;
      b.classList.toggle("is-active", on);
      on ? b.setAttribute("aria-current", "true") : b.removeAttribute("aria-current");
    });
    const th = el.thumbs.children[idx];
    if (th && th.scrollIntoView) th.scrollIntoView({ block: "nearest", inline: "nearest" });
    warm(data.images[(idx + 1) % n]);
    warm(data.images[(idx - 1 + n) % n]);
  }

  function fill(d, startIndex) {
    data = d;
    const multi = d.images.length > 1;
    el.cat.textContent = d.catLabel || d.cat || "";
    el.title.textContent = d.title;
    el.desc.textContent = d.desc || "";
    el.desc.hidden = !d.desc;
    el.specs.innerHTML = (d.specs || []).map(([k, v]) => `<div class="specs__row"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");
    el.specs.hidden = !(d.specs && d.specs.length);
    el.tags.innerHTML = (d.stack || []).map(s => `<li>${esc(s)}</li>`).join("");
    el.tags.hidden = !(d.stack && d.stack.length);
    const link = safeUrl(d.link);
    el.link.hidden = !link;
    if (link) el.link.href = link;
    el.thumbs.innerHTML = multi ? d.images.map((src, i) => `<button type="button" data-i="${i}" aria-label="${esc(t("work.thumb", { n: i + 1 }))}"><img src="${esc(src)}" alt="" loading="lazy" decoding="async" draggable="false"></button>`).join("") : "";
    el.thumbs.hidden = !multi;
    el.prev.hidden = el.next.hidden = el.count.hidden = !multi;
    el.pager.hidden = !onNav;
    showImage(startIndex || 0, false);
  }

  function lock(on) {
    document.documentElement.classList.toggle("is-locked", on);
  }

  function open(d, opts) {
    if (!d || !d.images || !d.images.length) return;
    onNav = opts && opts.onNav || null;
    clearTimeout(closeTimer);
    fill(d, 0);
    lock(true);
    if (!dlg.open) { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", ""); }
    opened = true;
    requestAnimationFrame(() => dlg.classList.add("is-open"));
    el.panel.scrollTop = 0;
  }

  function close() {
    if (!opened) return;
    opened = false;
    dlg.classList.remove("is-open");
    closeTimer = setTimeout(() => {
      if (dlg.close) dlg.close(); else dlg.removeAttribute("open");
      lock(false);
    }, reduced.matches ? 0 : 220);
  }

  function init() {
    dlg = $("work");
    if (!dlg) return;
    el = {
      panel: dlg.querySelector(".work__panel"), viewer: $("viewer"), img: $("viewerImg"), count: $("viewerCount"),
      prev: $("viewerPrev"), next: $("viewerNext"), thumbs: $("thumbs"),
      cat: $("workCat"), title: $("workTitle"), desc: $("workDesc"), specs: $("workSpecs"), tags: $("workTags"),
      link: $("workLink"), order: $("workOrder"), pager: $("workPager"), prevWork: $("workPrev"), nextWork: $("workNext")
    };

    $("workClose").addEventListener("click", close);
    dlg.addEventListener("cancel", e => { e.preventDefault(); close(); }); // Esc: закрываем с анимацией
    dlg.addEventListener("click", e => { if (e.target === dlg) close(); }); // клик по затемнению
    dlg.addEventListener("close", () => { opened = false; lock(false); dlg.classList.remove("is-open"); });

    el.prev.addEventListener("click", () => showImage(idx - 1, true));
    el.next.addEventListener("click", () => showImage(idx + 1, true));
    el.thumbs.addEventListener("click", e => { const b = e.target.closest("button"); if (b) showImage(+b.dataset.i, true); });
    el.prevWork.addEventListener("click", () => onNav && onNav(-1));
    el.nextWork.addEventListener("click", () => onNav && onNav(1));
    el.order.addEventListener("click", e => { // «Замовити схоже»: закрыть окно и плавно уехать к контактам
      e.preventDefault();
      close();
      setTimeout(() => { const c = $("contacts"); if (c) c.scrollIntoView({ behavior: reduced.matches ? "auto" : "smooth" }); }, 260);
    });

    dlg.addEventListener("keydown", e => {
      if (!data || data.images.length < 2) return;
      if (e.key === "ArrowLeft") showImage(idx - 1, true);
      else if (e.key === "ArrowRight") showImage(idx + 1, true);
    });

    // свайп по картинке (вертикальный жест остаётся прокруткой окна)
    let sw = null;
    el.viewer.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse") sw = { x: e.clientX, y: e.clientY }; });
    el.viewer.addEventListener("pointerup", e => {
      if (!sw) return;
      const dx = e.clientX - sw.x, dy = e.clientY - sw.y;
      sw = null;
      if (data && data.images.length > 1 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) showImage(idx + (dx < 0 ? 1 : -1), true);
    });
    el.viewer.addEventListener("pointercancel", () => { sw = null; });
  }

  App.workModal = {
    init,
    open,
    close,
    update(d) { if (opened && d) { const keep = idx; fill(d, Math.min(keep, d.images.length - 1)); } },
    get isOpen() { return opened; }
  };
})();
