(function () {
  var App = (window.App = window.App || {});
  var KEY = "theme";
  var WALK_MS = 520;
  function apply(t) {
    document.documentElement.setAttribute("data-theme", t);
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.content = t === "light" ? "#F5F5DC" : "#0A1824";
  }
  App.theme = {
    init: function () {
      var saved = null;
      try { saved = localStorage.getItem(KEY); } catch (e) {}
      var t = saved || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
      apply(t);

      var btn = document.getElementById("themeToggle");
      var busy = false;
      var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      function save() { try { localStorage.setItem(KEY, t); } catch (e) {} }

      btn.addEventListener("click", function () {
        if (busy) return;
        var next = t === "dark" ? "light" : "dark";
        if (reduce) { t = next; apply(t); save(); return; }

        busy = true;
        btn.classList.add("is-switching");
        setTimeout(function () {
          t = next;
          apply(t);
          save();
          btn.classList.add("is-flip");
        }, WALK_MS);
        setTimeout(function () {
          btn.classList.remove("is-switching", "is-flip");
          busy = false;
        }, 1000);
      });
    }
  };
})();
