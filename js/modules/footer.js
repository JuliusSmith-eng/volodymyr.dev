(function () {
  var App = (window.App = window.App || {});
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  // Огромный логотип: подгоняем кегль под ширину и ведём оранжевый «прожектор» за курсором
  function initWord() {
    var footer = document.querySelector(".footer");
    var wrap = document.getElementById("footerWord");
    if (!footer || !wrap) return;
    var text = wrap.firstElementChild;
    text.textContent = text.dataset.text; // без лишних пробелов в разметке

    function fit() {
      var cw = wrap.clientWidth;
      if (!cw) return;
      wrap.style.fontSize = "100px";
      var w = text.getBoundingClientRect().width;
      if (!w) return;
      wrap.style.fontSize = (100 * cw * 0.995 / w).toFixed(2) + "px";
      wrap.style.setProperty("--r", Math.max(120, cw * 0.17).toFixed(0) + "px");
    }
    fit();
    window.addEventListener("resize", fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

    var rect = null, hovering = false, visible = false, raf = 0;
    function setSpot(x, y) {
      text.style.setProperty("--mx", x.toFixed(0) + "px");
      text.style.setProperty("--my", y.toFixed(0) + "px");
    }
    function idle(t) {
      raf = 0;
      if (!visible || hovering) return;
      var r = text.getBoundingClientRect();
      setSpot(r.width * (0.5 + 0.46 * Math.sin(t / 2600)), r.height * 0.55);
      raf = requestAnimationFrame(idle);
    }
    function kick() { if (!raf && visible && !hovering && !reduce) raf = requestAnimationFrame(idle); }

    footer.addEventListener("pointermove", function (e) {
      hovering = true;
      var r = text.getBoundingClientRect();
      setSpot(e.clientX - r.left, Math.min(Math.max(e.clientY - r.top, 0), r.height));
    });
    footer.addEventListener("pointerleave", function () { hovering = false; kick(); });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        visible = en[0].isIntersecting;
        if (visible) kick();
      }).observe(footer);
    }
  }

  App.footer = {
    init: function () {
      initToTop();
      syncContacts();
      initWord();
    }
  };
})();
