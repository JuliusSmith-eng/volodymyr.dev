(function () {
  var App = (window.App = window.App || {});
  var KEY = "theme", current = "dark";
  var root = document.documentElement;

  function apply(t) {
    current = t;
    root.setAttribute("data-theme", t);
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.content = t === "light" ? "#F5F5DC" : "#0A1824";
    var b = document.getElementById("themeToggle");
    if (b) b.setAttribute("aria-checked", String(t === "dark"));
  }

  App.theme = {
    init: function () {
      var saved = null;
      try { saved = localStorage.getItem(KEY); } catch (e) {}
      apply(saved || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));
    },
    get: function () { return current; },
    // Переключение темы. origin {x, y} в координатах окна: от этой точки идёт круговая волна
    toggle: function (origin) {
      var next = current === "dark" ? "light" : "dark";
      try { localStorage.setItem(KEY, next); } catch (e) {}
      var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) { apply(next); return; }
      if (!document.startViewTransition || !origin) {
        // запасной вариант без View Transitions: короткое плавное перекрашивание
        root.classList.add("theme-fade");
        apply(next);
        setTimeout(function () { root.classList.remove("theme-fade"); }, 500);
        return;
      }
      var vt = document.startViewTransition(function () { apply(next); });
      vt.ready.then(function () {
        var r = Math.hypot(Math.max(origin.x, innerWidth - origin.x), Math.max(origin.y, innerHeight - origin.y));
        root.animate(
          { clipPath: ["circle(0px at " + origin.x + "px " + origin.y + "px)", "circle(" + r + "px at " + origin.x + "px " + origin.y + "px)"] },
          { duration: 800, easing: "cubic-bezier(.22,.8,.3,1)", pseudoElement: "::view-transition-new(root)" }
        );
      }, function () {});
    }
  };
})();
