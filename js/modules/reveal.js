(function () {
  var App = (window.App = window.App || {});
  var io = null;
  App.reveal = {
    init: function () {
      if (!("IntersectionObserver" in window)) { document.documentElement.classList.remove("js"); return; }
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
        });
      }, { threshold: 0.12 });
      App.reveal.observe(document);
    },
    observe: function (root) {
      if (!io) return;
      root.querySelectorAll("[data-reveal]:not(.is-visible)").forEach(function (el) { io.observe(el); });
    }
  };
})();
