/* Визуальные эффекты: полёт элемента по дуге, кольцо при «приземлении», конфетти, тосты.
   Всё на Web Animations API и только transform/opacity: идёт на GPU и не трогает раскладку.
   Эффекты живут в отдельном слое поверх страницы (position: fixed, pointer-events: none)
   и сами убирают за собой. При prefers-reduced-motion полёты и конфетти отключены.

   App.fx.fly(fromEl, toEl, { icon })  → { done: Promise<boolean>, cancel() }
        done = true, если элемент долетел; false, если полёт пропущен (цель вне экрана, reduced motion) или отменён
   App.fx.ring(el)                     круг-вспышка на элементе (момент «встраивания»)
   App.fx.confetti(x, y, count)        салют из точки экрана
   App.fx.toast(text)                  всплывающее сообщение снизу по центру  */
(function () {
  const App = (window.App = window.App || {});
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let layer = null, toasts = null;

  const ensureLayer = () => {
    if (!layer) {
      layer = document.createElement("div");
      layer.className = "fx";
      layer.setAttribute("aria-hidden", "true");
      document.body.appendChild(layer);
    }
    return layer;
  };
  const center = el => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
  const visible = (p, margin) => p.x > margin && p.x < innerWidth - margin && p.y > margin && p.y < innerHeight - margin;
  const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const bezier = (a, c, b, u) => { const v = 1 - u; return { x: v * v * a.x + 2 * v * u * c.x + u * u * b.x, y: v * v * a.y + 2 * v * u * c.y + u * u * b.y }; };
  const run = (el, frames, opts) => { const a = el.animate(frames, opts); a.finished.catch(() => {}); return a; };

  function fly(from, to, options) {
    const o = Object.assign({ icon: "", size: 44, duration: 950, trail: 5 }, options);
    const live = [];
    let cancelled = false;
    const handle = { cancel() { cancelled = true; live.forEach(a => { try { a.cancel(); } catch (_) {} }); }, done: Promise.resolve(false) };
    if (reduced.matches || !from || !to || !from.animate) return handle;

    const a = center(from), b = center(to);
    // цель или старт за пределами экрана: красивый полёт не получится, упрощаем (вызывающий код просто покажет результат)
    if (!visible(b, 8) || !visible(a, -240)) return handle;

    const dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy) || 1;
    // контрольная точка: серединка, сдвинутая перпендикулярно и приподнятая, чтобы путь был дугой
    let nx = -dy / dist, ny = dx / dist;
    if (ny > 0) { nx = -nx; ny = -ny; }
    const bulge = Math.min(190, dist * 0.34);
    const c = { x: (a.x + b.x) / 2 + nx * bulge, y: (a.y + b.y) / 2 + ny * bulge - Math.min(80, dist * 0.12) };

    const N = 28;
    const samples = [];
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      samples.push({ t, p: bezier(a, c, b, easeInOut(t)) });
    }
    const frames = (scaleFn, rotFn) => samples.map(s =>
      ({ transform: `translate3d(${s.p.x.toFixed(1)}px,${s.p.y.toFixed(1)}px,0) rotate(${rotFn(s.t).toFixed(1)}deg) scale(${scaleFn(s.t).toFixed(3)})`, offset: s.t }));

    const root = ensureLayer();
    const token = document.createElement("div");
    token.className = "fx__token";
    token.style.width = token.style.height = o.size + "px";
    token.style.margin = `${-o.size / 2}px 0 0 ${-o.size / 2}px`;
    token.innerHTML = o.icon;
    root.appendChild(token);
    const main = run(token, frames(t => 1 + 0.38 * Math.sin(Math.PI * t) - 0.3 * t, t => Math.sin(t * Math.PI * 2) * 16),
      { duration: o.duration, easing: "linear", fill: "forwards" });
    live.push(main);

    // комета: несколько уменьшающихся точек идут по тому же пути с задержкой
    const dots = [];
    for (let k = 1; k <= o.trail; k++) {
      const d = document.createElement("div");
      d.className = "fx__dot";
      root.appendChild(d);
      const fade = 1 - k / (o.trail + 1);
      const fr = samples.map(s => ({
        transform: `translate3d(${s.p.x.toFixed(1)}px,${s.p.y.toFixed(1)}px,0) scale(${(fade * 0.9).toFixed(2)})`,
        opacity: s.t < 0.04 ? 0 : s.t > 0.9 ? 0 : 0.55 * fade, offset: s.t
      }));
      live.push(run(d, fr, { duration: o.duration, delay: k * 45, easing: "linear", fill: "both" }));
      dots.push(d);
    }

    handle.done = main.finished.then(() => {
      const ok = !cancelled;
      token.remove();
      setTimeout(() => dots.forEach(d => d.remove()), o.trail * 45 + 60);
      return ok;
    }).catch(() => { token.remove(); dots.forEach(d => d.remove()); return false; });
    return handle;
  }

  function ring(el) {
    if (reduced.matches || !el || !el.animate) return;
    const p = center(el), root = ensureLayer();
    for (let i = 0; i < 2; i++) {
      const r = document.createElement("div");
      r.className = "fx__ring";
      r.style.left = p.x + "px"; r.style.top = p.y + "px";
      root.appendChild(r);
      run(r, [{ transform: "translate(-50%,-50%) scale(.2)", opacity: 0.9 }, { transform: "translate(-50%,-50%) scale(2.6)", opacity: 0 }],
        { duration: 650, delay: i * 120, easing: "cubic-bezier(.2,.7,.3,1)", fill: "both" }).finished.then(() => r.remove(), () => r.remove());
    }
  }

  function confetti(x, y, count) {
    if (reduced.matches) return;
    const root = ensureLayer();
    const colors = ["#FE5516", "#F5F5DC", "#E8D9BB", "#FF8A57", "#FFFFFF"];
    const n = count || 26;
    for (let i = 0; i < n; i++) {
      const el = document.createElement("div");
      el.className = "fx__piece";
      el.style.background = colors[i % colors.length];
      if (i % 3 === 0) { el.style.borderRadius = "50%"; el.style.width = el.style.height = "8px"; }
      root.appendChild(el);
      const ang = (-100 + (Math.random() - 0.5) * 120) * Math.PI / 180; // веером вверх
      const v = 260 + Math.random() * 320, g = 760 + Math.random() * 200, life = 1100 + Math.random() * 700;
      const spin = (Math.random() - 0.5) * 900;
      const fr = [];
      for (let k = 0; k <= 10; k++) {
        const t = (k / 10) * (life / 1000);
        fr.push({ transform: `translate3d(${(x + Math.cos(ang) * v * t).toFixed(1)}px,${(y + Math.sin(ang) * v * t + 0.5 * g * t * t).toFixed(1)}px,0) rotate(${(spin * t).toFixed(0)}deg)`,
          opacity: k > 7 ? 1 - (k - 7) / 3 : 1, offset: k / 10 });
      }
      run(el, fr, { duration: life, easing: "linear", fill: "both" }).finished.then(() => el.remove(), () => el.remove());
    }
  }

  function toast(text) {
    if (!toasts) {
      toasts = document.createElement("div");
      toasts.className = "toasts";
      toasts.setAttribute("role", "status");
      toasts.setAttribute("aria-live", "polite");
      document.body.appendChild(toasts);
    }
    while (toasts.children.length >= 3) toasts.firstElementChild.remove();
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = text;
    toasts.appendChild(el);
    if (el.animate && !reduced.matches) run(el, [{ opacity: 0, transform: "translateY(16px) scale(.96)" }, { opacity: 1, transform: "none" }], { duration: 320, easing: "cubic-bezier(.22,.8,.3,1)", fill: "both" });
    setTimeout(() => {
      const out = el.animate && !reduced.matches ? run(el, [{ opacity: 1 }, { opacity: 0, transform: "translateY(-8px)" }], { duration: 280, fill: "forwards" }).finished : Promise.resolve();
      out.then(() => el.remove(), () => el.remove());
    }, 2800);
  }

  App.fx = { fly, ring, confetti, toast };
})();
