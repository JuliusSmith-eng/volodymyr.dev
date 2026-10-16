/* Горизонтальная лента с перетаскиванием.
   Умеет: drag мышью/пальцем с инерцией, горизонтальное колесо/трекпад, стрелки на клавиатуре,
   кнопки prev/next, плавный «догон» цели. Ничего не знает о работах, годится для любой ленты.

   Почему лёгкая:
   - вся анимация это один requestAnimationFrame, который работает, только пока лента едет;
   - лента двигается через transform, параллакс картинок тоже через transform (onMove(p) → картинкам),
     то есть без перерисовки (в отличие от object-position и тысяч WAAPI-анимаций);
   - вертикальное колесо и вертикальные свайпы всегда достаются странице: прокрутка не блокируется.

   Использование:
     const s = App.slider.create(viewportEl, trackEl, { item: "li", onMove(p, x, max) {...} });
     s.goBy(1);  s.reveal(el);  s.reset();  s.refresh();  s.destroy();
*/
(function () {
  const App = (window.App = window.App || {});
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

  function create(viewport, track, options) {
    const o = Object.assign({
      item: "li",          // селектор элемента-слайда (для шага и клавиатуры)
      gain: 1.4,           // во сколько раз лента едет быстрее руки (как в оригинальном эффекте)
      fling: 240,          // «длина» инерции, мс
      tau: 95,             // постоянная времени догона, мс (меньше = резче)
      wheelGain: 1.15,     // чувствительность горизонтального колеса
      dragThreshold: 6,    // px до того, как касание считается перетаскиванием
      onMove: null,        // (p, x, max) на каждом кадре
      onMeasure: null,     // (max, visibleRatio) после пересчёта размеров
      onInteract: null     // первое пользовательское действие (спрятать подсказку)
    }, options);

    let x = 0, target = 0, max = 0, step = 0;
    let raf = 0, last = 0, drag = null, justDragged = false, interacted = false;

    const interact = () => { if (!interacted) { interacted = true; o.onInteract && o.onInteract(); } };

    function paint() {
      track.style.transform = `translate3d(${(-x).toFixed(2)}px,0,0)`;
      // Прогресс 0..1 отдаём наружу, а не кладём в CSS-переменную на треке: кастомные свойства
      // наследуются, и каждое изменение пересчитывало бы стили всех потомков.
      o.onMove && o.onMove(max ? x / max : 0, x, max);
    }

    function frame(t) {
      raf = 0;
      const dt = last ? Math.min(100, t - last) : 16; // потолок защищает от скачка после долгой паузы
      last = t;
      const diff = target - x;
      if (reduced.matches || Math.abs(diff) < 0.4) x = target;
      else x += diff * (1 - Math.exp(-dt / (drag ? o.tau * 0.35 : o.tau))); // во время drag почти без запаздывания
      paint();
      if (x !== target) raf = requestAnimationFrame(frame);
      else last = 0;
    }
    const kick = () => { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } };
    const goTo = v => { target = clamp(v, 0, max); kick(); };

    function measure() {
      max = Math.max(0, track.scrollWidth - viewport.clientWidth);
      const items = track.querySelectorAll(o.item);
      step = items.length > 1 ? items[1].offsetLeft - items[0].offsetLeft : items.length ? items[0].offsetWidth : 0;
      x = clamp(x, 0, max);
      target = clamp(target, 0, max);
      o.onMeasure && o.onMeasure(max, track.scrollWidth ? clamp(viewport.clientWidth / track.scrollWidth, 0.05, 1) : 1);
      paint();
    }

    /* --- перетаскивание ---
       Захват указателя берём только когда движение началось: иначе обычный клик по карточке
       ушёл бы не в карточку. Вертикальный жест не трогаем: touch-action: pan-y отдаёт его странице. */
    function onDown(e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, s0: target, on: false, v: 0, lx: e.clientX, lt: e.timeStamp };
    }
    function onMove(e) {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
      if (!drag.on) {
        if (Math.abs(dx) < o.dragThreshold || Math.abs(dx) < Math.abs(dy)) return; // ещё не горизонтальный drag
        drag.on = true;
        try { viewport.setPointerCapture(e.pointerId); } catch (_) {}
        viewport.classList.add("is-dragging");
        interact();
      }
      const dt = e.timeStamp - drag.lt;
      if (dt > 0) { drag.v = drag.v * 0.55 + ((drag.lx - e.clientX) / dt) * 0.45; drag.lx = e.clientX; drag.lt = e.timeStamp; }
      target = clamp(drag.s0 - dx * o.gain, 0, max);
      kick();
    }
    function onUp(e) {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag;
      drag = null;
      if (!d.on) return;
      viewport.classList.remove("is-dragging");
      justDragged = true; setTimeout(() => { justDragged = false; }, 0);
      const still = e.type === "pointercancel" || e.timeStamp - d.lt > 90; // остановились перед отпусканием: без инерции
      if (!still) target = clamp(target + d.v * o.gain * o.fling, 0, max);
      kick();
    }
    viewport.addEventListener("pointerdown", onDown);
    viewport.addEventListener("pointermove", onMove);
    viewport.addEventListener("pointerup", onUp);
    viewport.addEventListener("pointercancel", onUp);
    // после перетаскивания браузер всё равно может выстрелить click: гасим его
    viewport.addEventListener("click", e => { if (justDragged) { e.stopPropagation(); e.preventDefault(); } }, true);

    /* --- горизонтальное колесо / трекпад / Shift+колесо; вертикальное колесо едет странице --- */
    viewport.addEventListener("wheel", e => {
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (!horizontal && !e.shiftKey) return;
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? viewport.clientWidth : 1;
      const d = (horizontal ? e.deltaX : e.deltaY) * unit;
      if (!d || (d < 0 && target <= 0) || (d > 0 && target >= max)) return;
      interact();
      goTo(target + d * o.wheelGain);
    }, { passive: true });

    /* --- клавиатура и фокус --- */
    function reveal(el, margin) {
      if (!el) return;
      const pad = margin != null ? margin : parseFloat(getComputedStyle(track).paddingLeft) || 0;
      const left = el.offsetLeft, right = left + el.offsetWidth, vw = viewport.clientWidth;
      if (left - target < pad) goTo(left - pad);
      else if (right - target > vw - pad) goTo(right - vw + pad);
    }
    track.addEventListener("focusin", e => {
      const it = e.target.closest(o.item);
      if (it) reveal(it);
    });
    track.addEventListener("keydown", e => {
      const keys = { ArrowLeft: -1, ArrowRight: 1, Home: -Infinity, End: Infinity };
      if (!(e.key in keys)) return;
      const items = Array.from(track.querySelectorAll(o.item));
      const cur = items.findIndex(it => it.contains(document.activeElement));
      if (cur < 0) return;
      const k = keys[e.key];
      const next = items[clamp(k === -Infinity ? 0 : k === Infinity ? items.length - 1 : cur + k, 0, items.length - 1)];
      const focusable = next && next.querySelector("button, a[href]");
      if (!focusable) return;
      e.preventDefault();
      interact();
      focusable.focus({ preventScroll: true });
      reveal(next);
    });

    // Браузер может сам «подкрутить» overflow:hidden к сфокусированному элементу: возвращаем на место
    viewport.addEventListener("scroll", () => { viewport.scrollLeft = 0; });

    const ro = "ResizeObserver" in window ? new ResizeObserver(measure) : null;
    if (ro) { ro.observe(viewport); ro.observe(track); } else window.addEventListener("resize", measure);
    reduced.addEventListener && reduced.addEventListener("change", () => { x = target; paint(); });
    measure();

    return {
      goTo,
      goBy(dir) { interact(); if (step) goTo((Math.round(target / step) + dir) * step); },
      // поставить слайд по центру вьюпорта
      center(el) { if (el) goTo(el.offsetLeft - (viewport.clientWidth - el.offsetWidth) / 2); },
      reveal,
      reset() { x = target = 0; paint(); },
      refresh: measure,
      get x() { return x; },
      get max() { return max; },
      destroy() { if (ro) ro.disconnect(); cancelAnimationFrame(raf); }
    };
  }

  App.slider = { create };
})();
