(function () {
  var App = (window.App = window.App || {});
  App.nav = {
    init: function () {
      var header = document.getElementById("header");
      var nav = document.getElementById("nav");
      var burger = document.getElementById("burger");
      var bar = document.getElementById("progress");
      function close() { nav.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); }
      burger.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        burger.setAttribute("aria-expanded", String(open));
      });
      nav.addEventListener("click", function (e) { if (e.target.tagName === "A") close(); });
      window.addEventListener("resize", function () { if (innerWidth > 880) close(); });

      // Подсветка за курсором: координаты внутри панели уходят в CSS-переменные
      var barEl = header.querySelector(".header__bar");
      barEl.addEventListener("pointermove", function (e) {
        var r = barEl.getBoundingClientRect();
        barEl.style.setProperty("--mx", e.clientX - r.left + "px");
        barEl.style.setProperty("--my", e.clientY - r.top + "px");
      }, { passive: true });

      // Скользящее подчёркивание: едет под наведённый пункт, в покое стоит под активным
      var ind = document.createElement("span");
      ind.className = "nav__ind";
      ind.setAttribute("aria-hidden", "true");
      nav.appendChild(ind);
      var placed = false;
      function moveTo(a) {
        if (!a) { ind.style.opacity = "0"; return; }
        if (!placed) { ind.style.transition = "none"; }
        ind.style.setProperty("--x", a.offsetLeft + 4 + "px");
        ind.style.setProperty("--w", a.offsetWidth - 8 + "px");
        ind.style.opacity = "1";
        if (!placed) { void ind.offsetWidth; ind.style.transition = ""; placed = true; }
      }
      function rest() { moveTo(nav.querySelector("a.is-active")); }
      var linkEls = nav.querySelectorAll("a");
      linkEls.forEach(function (a) {
        a.addEventListener("pointerenter", function () { moveTo(a); });
        a.addEventListener("focus", function () { moveTo(a); });
      });
      nav.addEventListener("pointerleave", rest);
      nav.addEventListener("focusout", rest);
      window.addEventListener("resize", rest);
      window.addEventListener("load", rest);

      var ticking = false;
      function onScroll() {
        header.classList.toggle("is-scrolled", scrollY > 20);
        var max = document.documentElement.scrollHeight - innerHeight;
        bar.style.transform = "scaleX(" + (max > 0 ? scrollY / max : 0) + ")";
        ticking = false;
      }
      window.addEventListener("scroll", function () {
        if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
      }, { passive: true });
      onScroll();

      if ("IntersectionObserver" in window) {
        var links = nav.querySelectorAll("a");
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) links.forEach(function (a) {
              a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id);
            });
            if (!nav.matches(":hover")) rest();
          });
        }, { rootMargin: "-45% 0px -50% 0px" });
        document.querySelectorAll("main section[id]").forEach(function (s) { io.observe(s); });
      }
    }
  };
})();
