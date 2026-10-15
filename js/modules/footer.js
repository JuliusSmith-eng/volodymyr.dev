(function () {
  var App = (window.App = window.App || {});
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = matchMedia("(hover: none)").matches; // телефон/планшет: курсора нет

  // Кнопка-пузырёк: появляется после первого экрана, по клику плавно возвращает к началу
  function initToTop() {
    var btn = document.getElementById("toTop");
    if (!btn) return;
    var ticking = false;
    function update() {
      ticking = false;
      btn.classList.toggle("is-shown", window.scrollY > window.innerHeight * 0.6);
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    btn.addEventListener("click", function () {
      btn.classList.remove("is-going");
      void btn.offsetWidth; // перезапуск анимации стрелки
      btn.classList.add("is-going");
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
    btn.addEventListener("animationend", function (e) {
      if (e.animationName === "totop-go") btn.classList.remove("is-going");
    }, true);
    update();
  }

  // Ссылки соцсетей в футере берём из блока «Контакты», чтобы менять их в одном месте
  function syncContacts() {
    var src = document.querySelectorAll(".contacts .contact");
    document.querySelectorAll(".footer [data-contact]").forEach(function (a) {
      var s = src[+a.dataset.contact];
      if (s && s.getAttribute("href")) a.setAttribute("href", s.getAttribute("href"));
    });
  }

  // Огромная надпись, оранжевое «переливание» в буквах и волк, который за ним следит.
  //
  // Почему это лёгкое:
  //  - «переливание» не перерисовывается: маска и оранжевый текст лежат на своих слоях, а двигаются
  //    только transform'ом (контейнер едет вправо, текст внутри влево на столько же, буквы стоят на месте).
  //    На телефоне оно крутится по кругу само (Web Animations API), на десктопе идёт за курсором.
  //  - волк это один спрайт ~150 КБ с 48 направлениями взгляда (шаг 7,5°): смена кадра = сдвиг
  //    background-position, поворот головы шагает по соседним кадрам с замедлением к концу.
  //    Всё (анимации, таймеры, слушатель мыши) живёт, только пока футер на экране.
  function initStage() {
    var footer = document.querySelector(".footer");
    var stage = document.getElementById("footerStage");
    var word = document.getElementById("footerWord");
    var spot = document.getElementById("footerSpot");
    if (!footer || !stage || !word || !spot) return;
    var text = word.querySelector(".footer__word-text");
    var spotText = spot.firstElementChild;
    var wolf = document.getElementById("footerWolf");
    var sprite = wolf ? wolf.firstElementChild : null;
    var SPRITE = "assets/wolf/peek.webp";

    text.textContent = text.dataset.text; // без лишних пробелов в разметке
    spotText.textContent = text.dataset.text;

    var G = { cw: 0, wh: 0, d: 300 }; // ширина слова, высота строки, диаметр пятна
    var mode = "sweep";               // sweep: пятно плывёт само | pointer: идёт за курсором
    var inView = false, active = false, wolfReady = false, peeked = false;
    var anims = [], px = 0, py = 0, praf = 0, lastMove = -1e9, tickTimer = 0;

    // Расстояние от верха строки до верха заглавных букв по метрикам реального шрифта,
    // чтобы волк стоял точно «на» буквах
    var mctx = document.createElement("canvas").getContext("2d");
    function capOffset(fs) {
      var cs = getComputedStyle(word);
      mctx.font = cs.fontWeight + " 100px " + cs.fontFamily;
      var m = mctx.measureText("H");
      if (!m.fontBoundingBoxAscent) return fs * 0.16;
      var base = (82 - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent)) / 2 + m.fontBoundingBoxAscent;
      return Math.max(0, (base - m.actualBoundingBoxAscent) * fs / 100);
    }

    // --- пятно: позиция только через transform ---
    function tr(cx, cy) {
      var tx = cx - G.d / 2, ty = cy - G.wh / 2;
      return [
        "translate3d(" + tx + "px," + ty + "px,0)",
        "translate3d(" + (-tx) + "px,calc(-50% + " + (-ty) + "px),0)"
      ];
    }
    function place(cx, cy) {
      var t = tr(cx, cy);
      spot.style.transform = t[0];
      spotText.style.transform = t[1];
    }
    function center() { // центр пятна в координатах слова и экрана (с учётом бегущей анимации)
      var wr = word.getBoundingClientRect(), r = spot.getBoundingClientRect();
      return { x: r.left + r.width / 2 - wr.left, y: r.top + r.height / 2 - wr.top, vx: r.left + r.width / 2, vy: r.top + r.height / 2 };
    }
    function stopSweep(keep) {
      if (!anims.length) return;
      var c = keep || center();
      spot.style.transition = spotText.style.transition = "none"; // без «прыжка» при смене режима
      place(c.x, c.y);
      anims.forEach(function (a) { a.cancel(); });
      anims = [];
      void spot.offsetWidth;
      spot.style.transition = spotText.style.transition = "";
    }
    function startSweep(from) {
      stopSweep(from);
      mode = "sweep";
      var y0 = G.wh * 0.55, lo = G.cw * 0.1, hi = G.cw * 0.9;
      if (reduce || !spot.animate) { place(G.cw * 0.5, y0); return; }
      var fx = from ? from.x : lo, fy = from ? from.y : y0;
      var pts = [[fx, fy], [hi, y0], [lo, y0], [fx, fy]];
      function kf(i) {
        return pts.map(function (p, n) { return { transform: tr(p[0], p[1])[i], offset: n / 3, easing: "ease-in-out" }; });
      }
      var opt = { duration: 14000, iterations: Infinity, fill: "both" };
      var a = spot.animate(kf(0), opt), b = spotText.animate(kf(1), opt);
      var t0 = document.timeline.currentTime; a.startTime = t0; b.startTime = t0; // обе стартуют синхронно
      anims = [a, b];
      if (!active) { a.pause(); b.pause(); }
    }

    // --- размеры ---
    function fit(force) {
      var cw = word.clientWidth;
      // resize прилетает и при сворачивании адресной строки на телефоне: пересчитываем только если ширина реально сменилась
      if (!cw || (!force && cw === G.cw)) return;
      word.style.fontSize = "100px";
      var w = text.getBoundingClientRect().width;
      if (!w) return;
      var fs = 100 * cw * 0.995 / w;
      word.style.fontSize = fs.toFixed(2) + "px";
      G.cw = cw; G.wh = word.clientHeight; G.d = Math.max(140, cw * 0.34);
      word.style.setProperty("--spot-d", G.d.toFixed(0) + "px");
      word.style.setProperty("--tl", text.offsetLeft + "px"); // оранжевая копия ровно поверх контурной
      stage.style.setProperty("--cap", capOffset(fs).toFixed(1) + "px");
      if (mode === "sweep") startSweep(null);
      else if (px || py) applyPointer();
      else place(G.cw * 0.5, G.wh * 0.55);
      word.classList.add("is-lit");
      measureWolf();
    }

    // --- волк ---
    // LOOK[i] = номер кадра в спрайте для взгляда под углом i * 7,5° (0° вверх, 90° вправо, 180° вниз).
    // Кадры взяты из того же ролика, что и волк в hero, по той же таблице «угол → время».
    var LOOK = [0, 1, 2, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 18, 19, 20, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44];
    var M = LOOK.length, COLS = 8, ROWS = 6, STEP = 360 / M;
    var curA = 4, tgtA = 4, turnRaf = 0, lastStep = 0;
    var wc = { x: 0, y: 0 }, wcAt = 0; // центр головы в координатах документа (кешируем, чтобы не читать раскладку на каждое движение)
    if (sprite) sprite.style.backgroundSize = (COLS * 100) + "% " + (ROWS * 100) + "%";
    function setFrame(k) {
      sprite.style.backgroundPosition = ((k % COLS) * 100 / (COLS - 1)) + "% " + (Math.floor(k / COLS) * 100 / (ROWS - 1)) + "%";
    }
    function measureWolf() {
      if (!wolf) return;
      var r = wolf.getBoundingClientRect();
      wc.x = r.left + window.scrollX + r.width / 2;
      wc.y = r.top + window.scrollY + r.height * 0.42;
      wcAt = performance.now();
    }
    // голова поворачивается через соседние положения: быстро в начале, мягко тормозит у цели
    function turn(ts) {
      turnRaf = 0;
      var d = ((tgtA - curA) % M + M) % M;
      if (d > M / 2) d -= M;
      if (!d) return;
      var left = Math.abs(d), every = left > 6 ? 16 : left > 3 ? 28 : 44;
      if (!lastStep) lastStep = ts - every;
      if (ts - lastStep >= every) {
        lastStep = ts;
        curA = (curA + (d > 0 ? 1 : -1) + M) % M;
        setFrame(LOOK[curA]);
      }
      turnRaf = requestAnimationFrame(turn);
    }
    function aimAt(vx, vy) { // vx/vy: куда смотреть, в координатах окна
      if (!wolfReady) return;
      var dx = vx - (wc.x - window.scrollX), dy = vy - (wc.y - window.scrollY);
      if (Math.hypot(dx, dy) < 30) return;
      var a = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
      tgtA = Math.round(a / STEP) % M;
      if (!turnRaf) { lastStep = 0; turnRaf = requestAnimationFrame(turn); }
    }
    function peek() {
      if (peeked || !wolfReady || !wolf) return;
      peeked = true;
      requestAnimationFrame(function () { requestAnimationFrame(function () { wolf.classList.add("is-peek"); }); });
    }
    function loadSprite() {
      if (!wolf) return;
      var img = new Image();
      img.src = SPRITE;
      (img.decode ? img.decode() : Promise.resolve()).catch(function () {}).then(function () {
        sprite.style.backgroundImage = "url(" + SPRITE + ")";
        setFrame(LOOK[curA]);
        measureWolf();
        wolfReady = true;
        if (reduce) wolf.classList.add("is-peek"); else if (active) peek();
      });
    }

    // --- курсор ---
    function onMove(e) {
      if (e.pointerType === "touch") return; // пальцем курсор не поведёшь: на телефоне пятно плывёт само
      px = e.clientX; py = e.clientY; lastMove = performance.now();
      if (mode !== "pointer") { stopSweep(null); mode = "pointer"; }
      if (!praf) praf = requestAnimationFrame(applyPointer); // не чаще раза за кадр
    }
    function applyPointer() {
      praf = 0;
      var wr = word.getBoundingClientRect();
      place(Math.min(Math.max(px - wr.left, 0), G.cw), Math.min(Math.max(py - wr.top, 0), G.wh));
      aimAt(px, py);
    }

    // раз в ~100 мс: смотрим, куда должен смотреть волк, и возвращаем пятно в «плавание», если мышь замерла
    function tick() {
      tickTimer = 0;
      if (!active) return;
      var now = performance.now();
      if (now - wcAt > 500) measureWolf(); // футер мог сместиться (смена языка, подгрузка картинок выше)
      if (mode === "pointer" && now - lastMove > 3000) startSweep(center());
      if (mode === "sweep") { var r = spot.getBoundingClientRect(); aimAt(r.left + r.width / 2, r.top + r.height / 2); }
      tickTimer = setTimeout(tick, 70);
    }

    function setActive(on) {
      if (on === active) return;
      active = on;
      footer.classList.toggle("is-inview", on);
      if (on) {
        anims.forEach(function (a) { a.play(); });
        if (!coarse) window.addEventListener("pointermove", onMove, { passive: true });
        if (!tickTimer && !reduce) tickTimer = setTimeout(tick, 0);
        peek();
      } else {
        anims.forEach(function (a) { a.pause(); });
        window.removeEventListener("pointermove", onMove);
        clearTimeout(tickTimer); tickTimer = 0;
        if (turnRaf) { cancelAnimationFrame(turnRaf); turnRaf = 0; }
        if (praf) { cancelAnimationFrame(praf); praf = 0; }
      }
    }

    fit();
    window.addEventListener("resize", function () { fit(); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fit(true); });

    if (!("IntersectionObserver" in window)) { loadSprite(); return; }
    // спрайт подгружаем заранее, когда до футера ~600px
    var pre = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { pre.disconnect(); loadSprite(); }
    }, { rootMargin: "600px 0px" });
    pre.observe(stage);
    // всё живое включается только когда футер в кадре и вкладка открыта
    new IntersectionObserver(function (en) {
      inView = en[0].isIntersecting;
      setActive(inView && !document.hidden);
    }).observe(stage);
    document.addEventListener("visibilitychange", function () { setActive(inView && !document.hidden); });
  }

  App.footer = {
    init: function () {
      initToTop();
      syncContacts();
      initStage();
    }
  };
})();
