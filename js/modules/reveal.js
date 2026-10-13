(function () {
  var App = (window.App = window.App || {});
  var io = null;
  var STEP = 110; // мс между элементами в каскаде
  var pxEls = [];
  var ticking = false;
  var reduce = false;

  function applyStagger(root) {
    var groups = [];
    root.querySelectorAll("[data-reveal-group]").forEach(function (g) { groups.push(g); });
    if (root !== document && root.matches && root.matches("[data-reveal-group]")) groups.push(root);
    groups.forEach(function (group) {
      var items = group.querySelectorAll("[data-reveal]");
      items.forEach(function (el, i) {
        if (!el.style.getPropertyValue("--reveal-delay")) {
          el.style.setProperty("--reveal-delay", (i * STEP) + "ms");
        }
      });
    });
  }

  function collectParallax(root) {
    pxEls = [];
    root.querySelectorAll("[data-parallax]").forEach(function (el) { pxEls.push(el); });
  }

  function runParallax() {
    ticking = false;
    var vh = window.innerHeight;
    pxEls.forEach(function (el) {
      var r = el.getBoundingClientRect();
      var c = r.top + r.height / 2;
      var p = (c - vh / 2) / vh; // -1..1
      var speed = parseFloat(el.dataset.parallax) || 40;
      el.style.setProperty("--px", (-p * speed).toFixed(2) + "px");
    });
  }

  function onScroll() {
    if (!pxEls.length || ticking) return;
    ticking = true;
    requestAnimationFrame(runParallax);
  }

  App.reveal = {
    init: function () {
      reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!("IntersectionObserver" in window)) { document.documentElement.classList.remove("js"); return; }
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var el = en.target;
          if (en.isIntersecting) {
            el.classList.remove("is-hiding");
            el.classList.add("is-visible");
          } else {
            el.classList.add("is-hiding");
            el.classList.remove("is-visible");
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
      App.reveal.observe(document);
      collectParallax(document);
      if (!reduce && pxEls.length) {
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll, { passive: true });
        runParallax();
      }
    },
    observe: function (root) {
      if (!io) return;
      applyStagger(root);
      root.querySelectorAll("[data-reveal]:not(.is-visible)").forEach(function (el) { io.observe(el); });
    },
    refresh: function () {
      if (!io) return;
      applyStagger(document);
    },
    parallax: function () {
      collectParallax(document);
      runParallax();
    }
  };
})();
