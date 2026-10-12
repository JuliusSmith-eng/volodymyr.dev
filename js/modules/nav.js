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
      window.addEventListener("resize", function () { if (innerWidth > 760) close(); });

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
          });
        }, { rootMargin: "-45% 0px -50% 0px" });
        document.querySelectorAll("main section[id]").forEach(function (s) { io.observe(s); });
      }
    }
  };
})();
